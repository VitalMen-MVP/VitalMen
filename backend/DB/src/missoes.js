import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from './prisma.js';

const app = express();
const port = process.env.PORT_MISSOES || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mudar_para_uma_chave_secreta';

app.use(express.json());

// ================================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ================================================================
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

// ================================================================
// HELPERS DE GAMIFICAÇÃO
// ================================================================
const XP_POR_PRIORIDADE = { ALTA: 30, MEDIA: 15, BAIXA: 8 };

function calcularXpProximoNivel(nivel) {
  return Math.floor(100 * Math.pow(1.5, nivel - 1));
}

async function processarXpEAtributo(userId, xpGanho, atributo, missaoId, tituloMissao) {
  const perfil = await prisma.heroPerfil.findUnique({ where: { userId } });
  if (!perfil) throw new Error('Perfil do herói não encontrado. Acesse GET /perfil primeiro.');

  let novoXp = perfil.xpAtual + xpGanho;
  let novoNivel = perfil.nivelAtual;
  let xpProximoNivel = perfil.xpProximoNivel;
  let subiu = false;

  while (novoXp >= xpProximoNivel) {
    novoXp -= xpProximoNivel;
    novoNivel += 1;
    xpProximoNivel = calcularXpProximoNivel(novoNivel);
    subiu = true;
  }

  const campoAtributo = atributo.toLowerCase();
  const novoValorAtributo = Math.min(100, (perfil[campoAtributo] ?? 0) + 2);

  await prisma.heroPerfil.update({
    where: { userId },
    data: {
      xpAtual: novoXp,
      nivelAtual: novoNivel,
      xpProximoNivel,
      [campoAtributo]: novoValorAtributo,
    },
  });

  await prisma.conquista.create({
    data: {
      userId,
      missaoId,
      titulo: tituloMissao,
      xpGanho,
      atributoGanho: atributo,
      nivelAposConquista: novoNivel,
    },
  });

  return { xpGanho, atributoGanho: atributo, novoNivel, subiu, xpAtual: novoXp, xpProximoNivel };
}

// ================================================================
// PERFIL DO HERÓI
// ================================================================

// GET /perfil — busca (ou cria) perfil completo do herói
app.get('/perfil', autenticar, async (req, res) => {
  try {
    let perfil = await prisma.heroPerfil.findUnique({ where: { userId: req.userId } });

    if (!perfil) {
      perfil = await prisma.heroPerfil.create({
        data: { userId: req.userId, xpProximoNivel: calcularXpProximoNivel(1) },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true, email: true },
    });

    return res.json({
      nome: user.name,
      nivelAtual: perfil.nivelAtual,
      xpAtual: perfil.xpAtual,
      xpProximoNivel: perfil.xpProximoNivel,
      atributos: {
        foco: perfil.foco,
        disciplina: perfil.disciplina,
        intelecto: perfil.intelecto,
        forca: perfil.forca,
        consistencia: perfil.consistencia,
      },
      itemAvatarId: perfil.itemAvatarId,
      tituloId: perfil.tituloId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar perfil.' });
  }
});

// GET /perfil/conquistas — histórico de conquistas com paginação
app.get('/perfil/conquistas', autenticar, async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    const pagina = parseInt(req.query.pagina) || 1;
    const skip = (pagina - 1) * limite;

    const [conquistas, total] = await Promise.all([
      prisma.conquista.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limite,
        select: {
          id: true,
          titulo: true,
          xpGanho: true,
          atributoGanho: true,
          nivelAposConquista: true,
          createdAt: true,
        },
      }),
      prisma.conquista.count({ where: { userId: req.userId } }),
    ]);

    return res.json({
      conquistas,
      paginacao: { total, pagina, limite, totalPaginas: Math.ceil(total / limite) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar conquistas.' });
  }
});

// ================================================================
// MISSÕES
// ================================================================

// POST /missoes — cria missão com micro-passos opcionais
app.post('/missoes', autenticar, async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      prioridade = 'MEDIA',
      atributoRecompensa = 'FOCO',
      microPassos = [],
    } = req.body;

    if (!titulo) return res.status(400).json({ error: '"titulo" é obrigatório.' });

    const prioridadesValidas = ['ALTA', 'MEDIA', 'BAIXA'];
    const atributosValidos = ['FOCO', 'DISCIPLINA', 'INTELECTO', 'FORCA', 'CONSISTENCIA'];

    if (!prioridadesValidas.includes(prioridade.toUpperCase()))
      return res.status(400).json({ error: `Prioridade inválida. Use: ${prioridadesValidas.join(', ')}` });

    if (!atributosValidos.includes(atributoRecompensa.toUpperCase()))
      return res.status(400).json({ error: `Atributo inválido. Use: ${atributosValidos.join(', ')}` });

    const missao = await prisma.missao.create({
      data: {
        userId: req.userId,
        titulo,
        descricao,
        prioridade: prioridade.toUpperCase(),
        atributoRecompensa: atributoRecompensa.toUpperCase(),
        microPassos: {
          create: microPassos.map((mp) => ({ titulo: mp.titulo })),
        },
      },
      include: { microPassos: true },
    });

    return res.status(201).json({ missao });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar missão.' });
  }
});

// GET /missoes — lista missões do usuário
// Query: status=pendente|concluida  &  data=YYYY-MM-DD
app.get('/missoes', autenticar, async (req, res) => {
  try {
    const { status, data } = req.query;
    const filtros = { userId: req.userId };

    if (status === 'pendente') filtros.concluida = false;
    if (status === 'concluida') filtros.concluida = true;

    if (data) {
      const inicio = new Date(data);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(data);
      fim.setHours(23, 59, 59, 999);
      filtros.createdAt = { gte: inicio, lte: fim };
    }

    const missoes = await prisma.missao.findMany({
      where: filtros,
      include: { microPassos: true },
      orderBy: { createdAt: 'desc' },
    });

    const missoesComProgresso = missoes.map((m) => {
      const total = m.microPassos.length;
      const concluidos = m.microPassos.filter((mp) => mp.concluido).length;
      return { ...m, progresso: total > 0 ? Math.round((concluidos / total) * 100) : null };
    });

    return res.json({ missoes: missoesComProgresso });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar missões.' });
  }
});

// PATCH /missoes/:missaoId/micropassos/:microPassoId — marca micro-passo concluído/pendente
app.patch('/missoes/:missaoId/micropassos/:microPassoId', autenticar, async (req, res) => {
  try {
    const { missaoId, microPassoId } = req.params;
    const { concluido } = req.body;

    if (typeof concluido !== 'boolean')
      return res.status(400).json({ error: '"concluido" deve ser true ou false.' });

    const missao = await prisma.missao.findFirst({ where: { id: missaoId, userId: req.userId } });
    if (!missao) return res.status(404).json({ error: 'Missão não encontrada.' });

    const microPasso = await prisma.microPasso.update({
      where: { id: microPassoId },
      data: { concluido, concluidoEm: concluido ? new Date() : null },
    });

    return res.json({ microPasso, statusAtualizado: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar micro-passo.' });
  }
});

// POST /missoes/:id/concluir — conclui missão e processa gamificação
app.post('/missoes/:id/concluir', autenticar, async (req, res) => {
  try {
    const { id } = req.params;

    const missao = await prisma.missao.findFirst({
      where: { id, userId: req.userId },
      include: { microPassos: true },
    });

    if (!missao) return res.status(404).json({ error: 'Missão não encontrada.' });
    if (missao.concluida) return res.status(409).json({ error: 'Missão já concluída.' });

    await prisma.missao.update({
      where: { id },
      data: { concluida: true, concluidaEm: new Date() },
    });

    const xpGanho = XP_POR_PRIORIDADE[missao.prioridade] ?? 15;
    const recompensa = await processarXpEAtributo(
      req.userId,
      xpGanho,
      missao.atributoRecompensa,
      missao.id,
      missao.titulo
    );

    return res.json({ recompensa });
  } catch (error) {
    console.error(error);
    if (error.message.includes('Perfil do herói'))
      return res.status(404).json({ error: error.message });
    return res.status(500).json({ error: 'Erro ao concluir missão.' });
  }
});

// DELETE /missoes/:id — remove missão
app.delete('/missoes/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const missao = await prisma.missao.findFirst({ where: { id, userId: req.userId } });
    if (!missao) return res.status(404).json({ error: 'Missão não encontrada.' });

    await prisma.missao.delete({ where: { id } });
    return res.json({ mensagem: 'Missão removida com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao deletar missão.' });
  }
});

app.listen(port, () => {
  console.log(`API Missões rodando em http://localhost:${port}`);
});
