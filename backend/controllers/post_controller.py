# arquivo responsável por ter todas as rotas referentes aos posts

from flask import Blueprint, request, jsonify
from models import db, Post

post_bp = Blueprint("posts", __name__)

@post_bp.route("/api/posts", methods=["GET"])
def listar_posts():
    posts = Post.query.order_by(Post.data_publicacao.desc()).all()
    return jsonify([
        {
            "id": p.id,
            "titulo": p.titulo,
            "conteudo": p.conteudo,
            "autor_id": p.autor_id,
            "data_publicacao": p.data_publicacao
        } for p in posts
    ]), 200

@post_bp.route("/api/posts", methods=["POST"])
def criar_post():
    data = request.get_json()
    titulo = data.get("titulo")
    conteudo = data.get("conteudo")
    autor_id = data.get("autor_id")

    if not all([titulo, conteudo, autor_id]):
        return jsonify({"erro": "Todos os campos são obrigatórios."}), 400

    post = Post(titulo=titulo, conteudo=conteudo, autor_id=autor_id)
    db.session.add(post)
    db.session.commit()

    return jsonify({"mensagem": "Post criado com sucesso!"}), 201
