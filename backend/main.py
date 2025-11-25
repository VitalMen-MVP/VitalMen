import os
from flask import Flask, send_from_directory, render_template_string
from flask_cors import CORS

from .controllers import post_controller, tarefa_controller, user_controller, listas_controller
from .database.db_config import DATABASE_URL
from .models import db


app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_size": 1,
    "max_overflow": 0,
    "pool_pre_ping": True
}

db.init_app(app)
app.register_blueprint(post_controller.post_bp)  # "carrega" as rotas ligadas aos posts
app.register_blueprint(tarefa_controller.tarefa_bp)  # "carrega" as rotas ligadas as tasks
app.register_blueprint(user_controller.user_bp)  # "carrega" as rotas ligadas aos usuários
app.register_blueprint(listas_controller.lista_bp)  # "carrega" as rotas ligadas as listas

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


# Página 404
@app.errorhandler(404)
def page_not_found(e):
    error_page = os.path.join(FRONT_DIR, 'errors', '404.html')
    if os.path.exists(error_page):
        return send_from_directory(os.path.join(FRONT_DIR, 'errors'), '404.html'), 404
    else:
        return render_template_string("<h1>404</h1><p>Página não encontrada.</p>"), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
