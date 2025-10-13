import os

from flask import Flask, send_from_directory, render_template_string, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


FRONT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))


# Rotas HTML
@app.route('/')
@app.route('/home')
def index():
    return send_from_directory(os.path.join(FRONT_DIR, 'index'), 'index.html')


@app.route('/login')
def login():
    return send_from_directory(os.path.join(FRONT_DIR, 'login'), 'login.html')


@app.route('/cadastro')
def cadastro():
    return send_from_directory(os.path.join(FRONT_DIR, 'cadastro'), 'cadastro.html')

@app.route('/nutricao')
def nutricao():
    return send_from_directory(os.path.join(FRONT_DIR, 'nutricao'), 'nutricao.html')

@app.route('/exercicios')
def exercicios():
    return send_from_directory(os.path.join(FRONT_DIR, 'exercicios'), 'exercicios.html')

@app.route('/saude')
def saude():
    return send_from_directory(os.path.join(FRONT_DIR, 'saude'), 'saude.html')

# Rotas de arquivos estáticos (CSS, JS)
@app.route('/<page>/<path:filename>')
def page_files(page, filename):
    return send_from_directory(os.path.join(FRONT_DIR, page), filename)


@app.route('/api/login', methods=["POST"])
def api_login():
    data = request.get_json()
    email = data.get("email")
    senha = data.get("senha")
    # verificar no banco de dados
    if email == "admin@com" and senha == "1234":
        return jsonify({"mensagem": "Você entrou com sucesso!"}), 200
    else:
        return jsonify({"erro": "Usuário ou senha inválidos"}), 401


@app.route('/api/register', methods=["POST"])
def api_register():
    data = request.get_json()
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    # criar user no banco de dados
    return jsonify({"mensagem": "Você se cadastrou com sucesso!"}), 200


# Página 404
@app.errorhandler(404)
def page_not_found(e):
    error_page = os.path.join(FRONT_DIR, 'errors', '404.html')
    if os.path.exists(error_page):
        return send_from_directory(os.path.join(FRONT_DIR, 'errors'), '404.html'), 404
    else:
        return render_template_string("<h1>404</h1><p>Página não encontrada.</p>"), 404


if __name__ == "__main__":
    app.run(debug=True)
