from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)

class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    conteudo = db.Column(db.Text, nullable=False)
    autor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    data_publicacao = db.Column(db.DateTime, server_default=db.func.now())

class Lista(db.Model):
    __tablename__ = "listas"

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    cor = db.Column(db.String(20), default="#ffffff")
    posicao = db.Column(db.Integer, default=0)
    usuario_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    tarefas = db.relationship("Tarefa", backref="lista", cascade="all, delete")

class Tarefa(db.Model):
    __tablename__ = "tarefas"

    id = db.Column(db.Integer, primary_key=True)
    lista_id = db.Column(db.Integer, db.ForeignKey("listas.id"), nullable=False)

    descricao = db.Column(db.Text, nullable=False)
    prioridade = db.Column(db.Integer, default=999)
    concluida = db.Column(db.Boolean, default=False)
    posicao = db.Column(db.Integer, default=0)

    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)