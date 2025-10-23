from flask import Blueprint, request, jsonify
from ..models import db, User  # importa ORM
from werkzeug.security import generate_password_hash, check_password_hash

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
        return jsonify({
            "mensagem": "Login bem-sucedido!",
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
