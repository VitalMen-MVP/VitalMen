from flask import Blueprint, request, jsonify
from models import db, Lista

lista_bp = Blueprint("listas", __name__)

@lista_bp.route("/api/listas", methods=["GET"])
def listar_listas():
    listas = Lista.query.order_by(Lista.posicao).all()
    return jsonify([
        {
            "id": l.id,
            "titulo": l.titulo,
            "cor": l.cor,
            "posicao": l.posicao
        }
        for l in listas
    ])

@lista_bp.route("/api/listas", methods=["POST"])
def criar_lista():
    data = request.get_json()
    titulo = data.get("titulo")

    if not titulo:
        return jsonify({"erro": "Título obrigatório"}), 400

    nova_lista = Lista(
        titulo=titulo,
        posicao=Lista.query.count()  # nova posição
    )

    db.session.add(nova_lista)
    db.session.commit()

    return jsonify({"id": nova_lista.id}), 201

@lista_bp.route("/api/listas/<int:id>", methods=["PUT"])
def atualizar_lista(id):
    data = request.get_json()
    lista = Lista.query.get_or_404(id)

    lista.titulo = data.get("titulo", lista.titulo)
    lista.cor = data.get("cor", lista.cor)
    lista.posicao = data.get("posicao", lista.posicao)

    db.session.commit()
    return jsonify({"msg": "Lista atualizada"})

@lista_bp.route("/api/listas/<int:id>", methods=["DELETE"])
def deletar_lista(id):
    lista = Lista.query.get_or_404(id)
    db.session.delete(lista)
    db.session.commit()
    return jsonify({"msg": "Lista removida"})
