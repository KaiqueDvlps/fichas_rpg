from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

from werkzeug.security import generate_password_hash, check_password_hash
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), unique=True, nullable=False)
    senha = db.Column(db.String(80), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    digitos_telefone = db.Column(db.String(3), nullable=False)
    nome_personagem = db.Column(db.String(100), nullable=False)

    ficha = db.relationship('Ficha', backref='usuario', uselist=False)


class Ficha(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    nome_personagem = db.Column(db.String(100))
    raca = db.Column(db.String(50))
    classe = db.Column(db.String(50))
    nivel = db.Column(db.Integer)
    descricao = db.Column(db.Text)
    ultima_edicao = db.Column(db.DateTime)
    lado = db.Column(db.String(20), default='nenhum')
    lado_ultima_mudanca = db.Column(db.DateTime, default=datetime.utcnow)
    

class LogEdicao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ficha_id = db.Column(db.Integer, db.ForeignKey('ficha.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    motivo = db.Column(db.String(255), nullable=False)
    data = db.Column(db.DateTime, default=datetime.utcnow)
    usuario = db.relationship('Usuario', backref='logs_edicao')

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)
    
    def check_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)