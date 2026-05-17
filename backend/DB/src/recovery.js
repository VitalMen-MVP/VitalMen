import bcrypt from 'bcrypt';
import prisma from './prisma.js';
import nodemailer from 'nodemailer';

// Configurar o email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Gera um código de 6 dígitos
 * @returns {string} Código de 6 dígitos
 */
export function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calcula o horário de expiração do código (15 minutos por padrão)
 * @param {number} minutesFromNow - Minutos até expiração (padrão: 15)
 * @returns {Date} Data/hora de expiração
 */
export function getCodeExpiration(minutesFromNow = 15) {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
}

/**
 * Envia um email com o código de recuperação
 * @param {string} email - Email do usuário
 * @param {string} code - Código de 6 dígitos
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(email, code) {
  // Se não tem credenciais, apenas log no console (modo desenvolvimento)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ EMAIL_USER e EMAIL_PASSWORD não configurados.');
    console.warn(`📧 Código de recuperação para ${email}: ${code}`);
    console.warn('⏱️  Válido por 15 minutos');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔐 Seu Código de Recuperação - App Rotina',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Recuperação de Senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para recuperar sua senha. Use o código abaixo no aplicativo:</p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f0f0f0; border-radius: 8px; text-align: center;">
          <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">Código de Recuperação</p>
          <p style="font-size: 36px; font-weight: bold; letter-spacing: 5px; margin: 0; color: #007bff;">
            ${code}
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Digite este código no campo correspondente no aplicativo para recuperar sua senha.
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          ⏱️ Este código expirará em 15 minutos.<br>
          🔒 Se você não solicitou uma recuperação de senha, ignore este email.<br>
          ⚠️ Nunca compartilhe este código com ninguém.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email com código enviado para ${email}`);
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
  }
}

/**
 * Processa a solicitação de recuperação de senha
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} Resultado da operação
 */
export async function requestPasswordReset(email) {
  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        success: false,
        message: 'Se este email estiver registrado, você receberá um código.',
      };
    }

    // Gerar código e expiração
    const resetCode = generateResetCode();
    const resetCodeExp = getCodeExpiration();

    // Salvar código no banco de dados
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode,
        resetCodeExp,
        resetAttempts: 0,
      },
    });

    // Enviar email
    await sendPasswordResetEmail(email, resetCode);

    // Em desenvolvimento, retornar o código também
    const isDevelopment = !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD;

    return {
      success: true,
      message: 'Código de recuperação enviado para seu email.',
      ...(isDevelopment && { code: resetCode, devMode: true }),
    };
  } catch (error) {
    console.error('❌ Erro na recuperação de senha:', error);
    return {
      success: false,
      message: 'Erro ao processar recuperação de senha.',
    };
  }
}

/**
 * Valida o código e redefine a senha em uma única operação
 * @param {string} email - Email do usuário
 * @param {string} code - Código de 6 dígitos
 * @param {string} newPassword - Nova senha
 * @returns {Promise<Object>} Resultado da operação
 */
export async function resetPassword(email, code, newPassword) {
  try {
    // Validações básicas
    if (!email || !code || !newPassword) {
      return {
        success: false,
        error: 'Email, código e nova senha são obrigatórios.',
      };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'A senha deve ter no mínimo 6 caracteres.',
      };
    }

    // Encontrar o usuário
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        success: false,
        error: 'Usuário não encontrado.',
      };
    }

    // Verificar limite de tentativas (máximo 5)
    if (user.resetAttempts >= 5) {
      return {
        success: false,
        error: 'Muitas tentativas. Solicite um novo código.',
      };
    }

    // Verificar se tem código ativo
    if (!user.resetCode) {
      return {
        success: false,
        error: 'Nenhuma recuperação de senha em andamento. Solicite um novo código.',
      };
    }

    // Verificar expiração do código
    if (new Date() > user.resetCodeExp) {
      // Limpar código expirado
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetCode: null,
          resetCodeExp: null,
          resetAttempts: 0,
        },
      });
      return {
        success: false,
        error: 'Código expirado. Solicite um novo código.',
      };
    }

    // Verificar código
    if (user.resetCode !== code) {
      // Incrementar tentativas
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetAttempts: user.resetAttempts + 1,
        },
      });
      return {
        success: false,
        error: 'Código inválido.',
        attemptsRemaining: 5 - (user.resetAttempts + 1),
      };
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar código
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExp: null,
        resetAttempts: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: 'Senha redefinida com sucesso.',
      user: updatedUser,
    };
  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
    return {
      success: false,
      error: 'Erro ao redefinir senha.',
    };
  }
}
