from flask import Blueprint, request, jsonify
from models import db, Tarefa, Lista
from utils.auth_utils import token_required

tarefa_bp = Blueprint("tarefas", __name__)


# -------------------------------
# Função auxiliar
# -------------------------------
def validar_lista_do_usuario(lista_id, user_id):
    return Lista.query.filter_by(id=lista_id, usuario_id=user_id).first()


# -------------------------------
# GET /api/listas/<lista_id>/tarefas
# -------------------------------
@tarefa_bp.route("/api/listas/<int:lista_id>/tarefas", methods=["GET"])
@token_required
def listar_tarefas(user, lista_id):
    # Validar se lista pertence ao usuário
    if not validar_lista_do_usuario(lista_id, user.id):
        return jsonify({"erro": "A lista não pertence ao usuário"}), 403

    tarefas = (
        Tarefa.query
        .filter_by(lista_id=lista_id)
        .order_by(Tarefa.posicao)
        .all()
    )

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


# -------------------------------
# POST /api/listas/<lista_id>/tarefas
# -------------------------------
@tarefa_bp.route("/api/listas/<int:lista_id>/tarefas", methods=["POST"])
@token_required
def criar_tarefa(user, lista_id):
    # Validar se lista pertence ao usuário
    if not validar_lista_do_usuario(lista_id, user.id):
        return jsonify({"erro": "A lista não pertence ao usuário"}), 403

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


# -------------------------------
# PUT /api/tarefas/<id>
# -------------------------------
@tarefa_bp.route("/api/tarefas/<int:id>", methods=["PUT"])
@token_required
def atualizar_tarefa(user, id):
    tarefa = Tarefa.query.get_or_404(id)

    # Validar se a tarefa pertence ao usuário
    if not validar_lista_do_usuario(tarefa.lista_id, user.id):
        return jsonify({"erro": "A tarefa não pertence ao usuário"}), 403

    data = request.get_json()

    # Atualizações
    tarefa.descricao = data.get("descricao", tarefa.descricao)
    tarefa.prioridade = data.get("prioridade", tarefa.prioridade)
    tarefa.concluida = data.get("concluida", tarefa.concluida)
    tarefa.posicao = data.get("posicao", tarefa.posicao)

    # Tentativa de mover para outra lista
    if "lista_id" in data:
        destino = data["lista_id"]

        # Impede mover tarefa para lista que não é do usuário
        if not validar_lista_do_usuario(destino, user.id):
            return jsonify({"erro": "Você não pode mover a tarefa para uma lista que não é sua"}), 403

        tarefa.lista_id = destino

    db.session.commit()

    return jsonify({"msg": "Tarefa atualizada"})


# -------------------------------
# DELETE /api/tarefas/<id>
# -------------------------------
@tarefa_bp.route("/api/tarefas/<int:id>", methods=["DELETE"])
@token_required
def deletar_tarefa(user, id):
    tarefa = Tarefa.query.get_or_404(id)

    # Validar se a tarefa pertence ao usuário
    if not validar_lista_do_usuario(tarefa.lista_id, user.id):
        return jsonify({"erro": "A tarefa não pertence ao usuário"}), 403

    db.session.delete(tarefa)
    db.session.commit()

    return jsonify({"msg": "Tarefa removida"})
