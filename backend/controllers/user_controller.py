import base64
from datetime import datetime, timedelta

import jwt
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from models import db, User
from utils.auth_utils import token_required

user_bp = Blueprint("auth", __name__)


# Login
@user_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    senha = data.get("senha")

    if not email or not senha:
        return jsonify({"erro": "Email e senha são obrigatórios."}), 400

    # ORM:
    user = User.query.filter_by(email=email).first()

    # SQL equivalente:
    # SELECT id, username, email, password
    # FROM users
    # WHERE email = :email
    # LIMIT 1;

    if user and check_password_hash(user.password, senha):
        payload = {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow()
        }

        token = jwt.encode(
            payload,
            'chave_secreta',
            algorithm='HS256'
        )
        return jsonify({
            "mensagem": "Login bem-sucedido!",
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }), 200

    return jsonify({"erro": "Email ou senha inválidos."}), 401


# Registro
@user_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")  # email@gmail.com
    username = data.get("username")  # bruno
    password = data.get("password")  # senha123

    if not email or not username or not password:
        return jsonify({"erro": "Todos os campos são obrigatórios."}), 400

    # ORM:
    existing = User.query.filter_by(email=email).first()

    # SQL equivalente:
    # SELECT id
    # FROM users
    # WHERE email = :email
    # LIMIT 1;

    if existing:
        return jsonify({"erro": "Email já cadastrado."}), 409

    hashed = generate_password_hash(password)



    # ORM INSERT:
    user = User(
        username=username,
        email=email,
        password=hashed,
        created_at=datetime.utcnow()
    )
    db.session.add(user)
    db.session.commit()

    # SQL equivalente:
    # INSERT INTO users (username, email, password)
    # VALUES (:username, :email, :password);

    return jsonify({"mensagem": "Cadastro realizado com sucesso!"}), 201


@user_bp.route("/api/perfil", methods=["GET"])
@token_required
def get_user_profile(current_user):
    return jsonify({
        "mensagem": f"Bem-vindo(a), {current_user.username}!",
        "perfil": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "avatar": current_user.avatar,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        }
    }), 200


@user_bp.route("/api/user", methods=["PUT"])
@token_required
def update_user(current_user):
    """
    Atualiza username, email, senha e avatar do usuário autenticado.
    Aceita multipart/form-data (FormData no frontend)
    """
    try:
        # Nome, email e senha (form fields normais)
        username = request.form.get("username", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()

        # Atualizar username
        if username:
            current_user.username = username

        # Atualizar email (e verificar duplicado)
        if email and email != current_user.email:
            existing = User.query.filter_by(email=email).first()
            if existing:
                return jsonify({"erro": "Este email já está em uso."}), 409
            current_user.email = email

        # Atualizar senha se foi enviada
        if password:
            current_user.password = generate_password_hash(password)

        # Avatar (arquivo)
        avatar_file = request.files.get("avatar")

        if avatar_file:
            # Lê bytes do arquivo
            avatar_bytes = avatar_file.read()
            # Codifica em base64 para salvar no banco
            avatar_b64 = base64.b64encode(avatar_bytes).decode("utf-8")
            current_user.avatar = avatar_b64

        # Atualiza timestamp
        current_user.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "mensagem": "Perfil atualizado com sucesso!",
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "email": current_user.email,
                "avatar": current_user.avatar,
                "created_at": current_user.created_at
            }
        }), 200

    except Exception as e:
        print("Erro ao atualizar perfil:", e)
        return jsonify({"erro": "Erro interno ao atualizar perfil."}), 500