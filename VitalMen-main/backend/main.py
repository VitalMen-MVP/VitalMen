import os

from flask import Flask, send_from_directory, render_template_string, request, jsonify
from flask_cors import CORS

import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
#werkzeug.security: Ferramentas de segurança que vêm com o Flask.
#generate_password_hash: Transforma uma senha (ex: "1234") em um hash seguro.
#check_password_hash: Compara uma senha com seu hash para verificar se correspondem.

app = Flask(__name__)
CORS(app)


FRONT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))


# Rotas HTML
@app.route('/')
@app.route('/home')
def index():
    return send_from_directory(os.path.join(FRONT_DIR, 'index'), 'index.html')

# Rota genérica
@app.route('/<page>/')
def page(page):
    print(page)
    return send_from_directory(os.path.join(FRONT_DIR, page), f'{page}.html')

# Rotas de arquivos estáticos (CSS, JS)
@app.route('/<page>/<path:filename>')
def page_files(page, filename):
    return send_from_directory(os.path.join(FRONT_DIR, page), filename)


@app.route('/api/login', methods=["POST"])
def api_login():
    data = request.get_json()
    email = data.get("email")
    senha = data.get("senha")
    
    if not email or not senha:
        return jsonify({"erro": "Email e senha são obrigatórios."}), 400
    conn = None
    try:
        conn = sqlite3.connect('data_base.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

    except sqlite3.Error as e:
        return jsonify({"erro": f"Erro no banco de dados: {e}"}), 500
    finally:
        if conn:
            conn.close()
    
    if user and check_password_hash(user["password"], senha):
        return jsonify({"mensagem": "Login bem-sucedido!"}), 200
    else:
        return jsonify({"erro": "Email ou senha inválidos."}), 401


@app.route('/api/register', methods=["POST"])
def api_register():
    data = request.get_json()
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")

    if not email or not username or not password:
        return jsonify({"erro": "Todos os campos são obrigatórios."}), 400
    hashed_password = generate_password_hash(password)

    conn = None
    try:
        conn = sqlite3.connect('data_base.db')
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                       (username, email, hashed_password))
        conn.commit() # Salva as alterações
        return jsonify({"mensagem": "Você se cadastrou com sucesso!"}), 200
    
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Email já cadastrado."}), 409
    
    except sqlite3.Error as e:
        return jsonify({"erro": f"Erro no banco de dados: {e}"}), 500
    finally :
        if conn:
            conn.close()


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
