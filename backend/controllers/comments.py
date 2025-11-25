# Em comments_controller.py
from flask import Blueprint, jsonify, request
from utils.auth_utils import token_required
from models import db, Comment, User
from zoneinfo import ZoneInfo


# from datetime import datetime (Não precisa se você não usar utcnow() explicitamente)

comment_bp = Blueprint("comment_bp", __name__)


# ================================
# Criar Comentário
# ================================
@comment_bp.route("/comments/<int:posts_id>/", methods=["POST"])
@token_required
def create_comment(user,posts_id):
    data = request.json
   

    if not data or not data.get("content"):
        return jsonify({"error": "Conteúdo do comentário é obrigatório."}), 400

    comment = Comment(
        posts_id=posts_id,
        user_id=user.id,
        content=data.get("content")
    )

    db.session.add(comment)
    db.session.commit()
    return jsonify({
        "msg": "Comentário criado com sucesso!",
        "comment": {
            "id": comment.id,
            "content": comment.content,
            "created_at": comment.created_at
                .replace(tzinfo=ZoneInfo("UTC"))
                .astimezone(ZoneInfo("America/Sao_Paulo"))
                .strftime("%d/%m/%Y %H:%M"),
            "user": {
                "username": comment.user.username,
                "avatar": comment.user.avatar
            }
        }
    }), 201

# ================================
# Listar Comentários
# ================================
@comment_bp.route("/comments/<int:post_id>/", methods=["GET"])
def get_comments(post_id):
    comments = Comment.query.filter_by(posts_id=post_id).order_by(Comment.id.desc()).all()

    result = []
    for c in comments:
        result.append({
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at.replace(tzinfo=ZoneInfo("UTC"))
                .astimezone(ZoneInfo("America/Sao_Paulo"))
                .strftime("%d/%m/%Y %H:%M"),
            "user": {
                "username": c.user.username,
                "avatar": c.user.avatar
            }
        })

    return jsonify(result), 200