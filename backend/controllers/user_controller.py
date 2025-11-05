import datetime

import jwt
from flask import Blueprint, request, jsonify
from models import db, User  # importa ORM
from werkzeug.security import generate_password_hash, check_password_hash

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

    # SELECT * FROM users WHERE email = ""
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, senha):
        payload = {
            'user_id': user.id,
            # Expiração em 24 horas (o usuário vai ficar logado por 24h)
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            'iat': datetime.datetime.utcnow()
        }

        # Criando o jwt codificado
        token = jwt.encode(
            payload,
            'chave_secreta',
            algorithm='HS256'
        )
        print(token)
        return jsonify({
            "mensagem": "Login bem-sucedido!",
            "token": token,
            "user": {
                "id": user.id, # 1
                "username": user.username, # nemrela
                "email": user.email # conceicaolucas68@gmail.com
            }
        }), 200
    return jsonify({"erro": "Email ou senha inválidos."}), 401


# Registro
@user_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email") # email@gmail.com
    username = data.get("username") # bruno
    password = data.get("password") # senha123

    if not email or not username or not password:
        return jsonify({"erro": "Todos os campos são obrigatórios."}), 400

    # SELECT * FROM users WHERE email = ""
    if User.query.filter_by(email=email).first():
        return jsonify({"erro": "Email já cadastrado."}), 409

    hashed = generate_password_hash(password)
    user = User(username=username, email=email, password=hashed)
    db.session.add(user)
    db.session.commit()

    return jsonify({"mensagem": "Cadastro realizado com sucesso!"}), 201

@user_bp.route("/api/perfil", methods=["GET"])
@token_required # A ROTA ESTÁ PROTEGIDA AQUI
def get_user_profile(current_user):
    # Se chegamos aqui, o usuário está autenticado e current_user é o usuário
    return jsonify({
        "mensagem": f"Bem-vindo(a), {current_user.username}!",
        "perfil": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "avatar": current_user.avatar,
            "created_at": current_user.created_at,
        }
    }), 200
@user_bp.route("/api/user", methods=["PUT", "PATCH"])
@token_required
def update_user(current_user):
    if request.content_type.startswith("multipart/form-data"):
        data = request.form
        file = request.files.get("avatar")
    else:
        data = request.get_json() or {}
        file = None

    campos_permitidos = ["username", "email", "password", "avatar"]
    alterado = False

    for campo in campos_permitidos:
        if campo in data:
            valor = data[campo]

            if campo == "password":
                valor = generate_password_hash(valor)

            setattr(current_user, campo, valor)
            alterado = True

    if file:
        avatar_bytes = file.read()
        import base64
        current_user.avatar = base64.b64encode(avatar_bytes).decode("utf-8")
        alterado = True

    if not alterado:
        return jsonify({"erro": "Nenhum campo válido foi enviado."}), 400

    db.session.commit()

    return jsonify({
        "mensagem": "Perfil atualizado com sucesso!",
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "avatar": current_user.avatar
        }
    }), 200
