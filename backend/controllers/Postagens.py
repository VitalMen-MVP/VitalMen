import os
from flask import Flask, send_from_directory, render_template_string
from flask_cors import CORS

from controllers import post_controller, tarefa_controller, user_controller
from database.db_config import DATABASE_URL
from models import db


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

FRONT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))

@app.route('/posts/5exercicios')
def abrir_5exercicios():
    return send_from_directory(
        os.path.join(FRONT_DIR, "postagens"),  # Certifique-se que o arquivo está na pasta "postagens"
        "pstg.5exercicios.html"
    )
@app.route('/posts/pstg.jejum')
def abrir_jejum():
    return send_from_directory(
        os.path.join(FRONT_DIR, "postagens"),  # Certifique-se que o arquivo está na pasta "postagens"
        "pstg.jejum.html"
    )
@app.route('/posts/pstg.estresse')
def abrir_estresse():
    return send_from_directory(
        os.path.join(FRONT_DIR, "postagens"),  # Certifique-se que o arquivo está na pasta "postagens"
        "pstg.estresse.html"
    )
@app.route('/posts/testo')
def abrir_testo():
    return send_from_directory(
        os.path.join(FRONT_DIR, "postagens"),  # Certifique-se que o arquivo está na pasta "postagens"
        "pstg.testo.html"
    )
@app.route('/posts/treinodeforça')
def abrir_treinodeforça():
    return send_from_directory(
        os.path.join(FRONT_DIR, "postagens"),  # Certifique-se que o arquivo está na pasta "postagens"
        "pstg.treinodeforça.html"
    )
@app.route('/posts/rotina')
def abrir_rotina():
    return send_from_directory(
        os.path.join(FRONT_DIR, "postagens"),  # Certifique-se que o arquivo está na pasta "postagens"
        "pstg.rotina.html"
    )