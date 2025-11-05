from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    avatar = db.Column(db.Text, nullable=True)

class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    conteudo = db.Column(db.Text, nullable=False)
    autor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    data_publicacao = db.Column(db.DateTime, server_default=db.func.now())

class Tarefa(db.Model):
    __tablename__ = "tarefas"

    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.Text, nullable=False)
    data_criacao = db.Column(db.DateTime, server_default=db.func.now())
    concluida = db.Column(db.Boolean, default=False)
