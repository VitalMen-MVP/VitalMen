# arquivo responsável por ter todas as rotas referentes aos posts
import os

from flask import Blueprint, request, jsonify, send_from_directory, abort
from models import db, Post
from werkzeug.exceptions import NotFound

post_bp = Blueprint("posts", __name__)
FRONT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'frontend'))


@post_bp.route("/api/posts", methods=["GET"])
def listar_posts():
    posts = Post.query.order_by(Post.data_publicacao.desc()).all()
    return jsonify([{"id": p.id, "titulo": p.titulo, "conteudo": p.conteudo, "autor_id": p.autor_id,
                     "data_publicacao": p.data_publicacao} for p in posts]), 200


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


@post_bp.route("/posts/<titulo_url>/", methods=["GET"])
def get_post_by_title(titulo_url):
    directory = os.path.join(FRONT_DIR, 'postagens')
    if titulo_url.endswith(".css"):
        filename = f'{titulo_url}'
    else:
        filename = f'{titulo_url}.html'
    print(f"Tentando servir arquivo: {os.path.join(directory, filename)}")
    try:
        return send_from_directory(directory, filename)
    except NotFound:
        abort(404)
    except Exception as e:
        print(f"Erro inesperado: {e}")
        return jsonify({"erro": "Erro interno do servidor."}), 500
