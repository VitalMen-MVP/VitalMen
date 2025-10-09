import os

from flask import Flask, send_from_directory, render_template_string

app = Flask(__name__)

FRONT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))


# Rotas HTML
@app.route('/')
def index():
    return send_from_directory(os.path.join(FRONT_DIR, 'index'), 'index.html')


@app.route('/login')
def login():
    return send_from_directory(os.path.join(FRONT_DIR, 'login'), 'login.html')

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
    app.run(debug=True)
