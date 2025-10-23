# arquivo responsável por ter todas as rotas referentes as tasks do usuário

from flask import Blueprint, request, jsonify
from ..models import db, Tarefa

tarefa_bp = Blueprint("tarefas", __name__)

@tarefa_bp.route("/api/tarefas", methods=["GET"])
def listar_tarefas():
    tarefas = Tarefa.query.order_by(Tarefa.id.desc()).all()
    return jsonify([
        {
            "id": t.id,
            "descricao": t.descricao,
            "data_criacao": t.data_criacao,
            "concluida": t.concluida
        } for t in tarefas
    ]), 200

@tarefa_bp.route("/api/tarefas", methods=["POST"])
def criar_tarefa():
    data = request.get_json()
    descricao = data.get("descricao")

    if not descricao:
        return jsonify({"erro": "Descrição obrigatória."}), 400

    tarefa = Tarefa(descricao=descricao)
    db.session.add(tarefa)
    db.session.commit()

    return jsonify({"mensagem": "Tarefa criada!"}), 201
