from flask import Blueprint, request, jsonify
from models import db, Lista
from utils.auth_utils import token_required

lista_bp = Blueprint("listas", __name__)

# -------------------------------
# GET /api/listas
# -------------------------------
@lista_bp.route("/api/listas", methods=["GET"])
@token_required
def listar_listas(user):
    listas = (
        Lista.query
        .filter_by(usuario_id=user.id)
        .order_by(Lista.posicao)
        .all()
    )

    return jsonify([
        {
            "id": l.id,
            "titulo": l.titulo,
            "cor": l.cor,
            "posicao": l.posicao
        }
        for l in listas
    ])


# -------------------------------
# POST /api/listas
# -------------------------------
@lista_bp.route("/api/listas", methods=["POST"])
@token_required
def criar_lista(user):
    data = request.get_json()
    titulo = data.get("titulo")

    if not titulo:
        return jsonify({"erro": "Título obrigatório"}), 400

    nova_lista = Lista(
        titulo=titulo,
        usuario_id=user.id,
        posicao=Lista.query.filter_by(usuario_id=user.id).count()
    )

    db.session.add(nova_lista)
    db.session.commit()

    return jsonify({"id": nova_lista.id}), 201


# -------------------------------
# PUT /api/listas/<id>
# -------------------------------
@lista_bp.route("/api/listas/<int:id>", methods=["PUT"])
@token_required
def atualizar_lista(user, id):
    lista = Lista.query.get_or_404(id)

    if lista.usuario_id != user.id:
        return jsonify({"erro": "Acesso negado"}), 403

    data = request.get_json()

    lista.titulo = data.get("titulo", lista.titulo)
    lista.cor = data.get("cor", lista.cor)
    lista.posicao = data.get("posicao", lista.posicao)

    db.session.commit()

    return jsonify({"msg": "Lista atualizada"})


# -------------------------------
# DELETE /api/listas/<id>
# -------------------------------
@lista_bp.route("/api/listas/<int:id>", methods=["DELETE"])
@token_required
def deletar_lista(user, id):
    lista = Lista.query.get_or_404(id)

    if lista.usuario_id != user.id:
        return jsonify({"erro": "Acesso negado"}), 403

    db.session.delete(lista)
    db.session.commit()

    return jsonify({"msg": "Lista removida"})
