from flask import request, jsonify, current_app
from functools import wraps
import jwt
from ..models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Espera o formato: "Bearer [TOKEN]"
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'erro': 'Token inválido ou ausente no formato Bearer.'}), 401

        if not token:
            return jsonify({'erro': 'Token de autenticação não encontrado.'}), 401

        try:
            # Decodificar o Token
            data = jwt.decode(
                token,
                'chave_secreta',
                algorithms=["HS256"]
            )

            # Buscar o usuário pelo ID armazenado no payload do token
            current_user = User.query.filter_by(id=data['user_id']).first()

            if not current_user:
                return jsonify({'erro': 'Token válido, mas usuário não encontrado.'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'erro': 'Token expirado. Faça login novamente.'}), 401

        except jwt.InvalidTokenError:
            return jsonify({'erro': 'Token inválido.'}), 401

        # Passa o objeto do usuário logado para a função da rota
        return f(current_user, *args, **kwargs)

    return decorated