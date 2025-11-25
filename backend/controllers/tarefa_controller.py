from flask import Blueprint, request, jsonify
from models import db, Tarefa

tarefa_bp = Blueprint("tarefas", __name__)

@tarefa_bp.route("/api/listas/<int:lista_id>/tarefas", methods=["GET"])
def listar_tarefas(lista_id):
    tarefas = Tarefa.query.filter_by(lista_id=lista_id).order_by(Tarefa.posicao).all()

    return jsonify([
        {
            "id": t.id,
            "descricao": t.descricao,
            "prioridade": t.prioridade,
            "concluida": t.concluida,
            "posicao": t.posicao
        }
        for t in tarefas
    ])

@tarefa_bp.route("/api/listas/<int:lista_id>/tarefas", methods=["POST"])
def criar_tarefa(lista_id):
    data = request.get_json()
    descricao = data.get("descricao")

    if not descricao:
        return jsonify({"erro": "Descrição obrigatória"}), 400

    nova_posicao = Tarefa.query.filter_by(lista_id=lista_id).count()

    tarefa = Tarefa(
        lista_id=lista_id,
        descricao=descricao,
        prioridade=data.get("prioridade", 999),
        posicao=nova_posicao
    )

    db.session.add(tarefa)
    db.session.commit()

    return jsonify({"id": tarefa.id}), 201

@tarefa_bp.route("/api/tarefas/<int:id>", methods=["PUT"])
def atualizar_tarefa(id):
    data = request.get_json()
    tarefa = Tarefa.query.get_or_404(id)

    # Atualiza campos existentes
    tarefa.descricao = data.get("descricao", tarefa.descricao)
    tarefa.prioridade = data.get("prioridade", tarefa.prioridade)
    tarefa.concluida = data.get("concluida", tarefa.concluida)
    tarefa.posicao = data.get("posicao", tarefa.posicao)

    # 🔥 IMPORTANTE! Permite mover tarefa para outra lista
    if "lista_id" in data:
        tarefa.lista_id = data["lista_id"]

    db.session.commit()

    return jsonify({"msg": "Tarefa atualizada"})


@tarefa_bp.route("/api/tarefas/<int:id>", methods=["DELETE"])
def deletar_tarefa(id):
    tarefa = Tarefa.query.get_or_404(id)
    db.session.delete(tarefa)
    db.session.commit()
    return jsonify({"msg": "Tarefa removida"})
