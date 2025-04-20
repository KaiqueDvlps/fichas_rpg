from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from datetime import datetime, timedelta
from models import db, Usuario, Ficha, LogEdicao
from werkzeug.security import check_password_hash
from flask_login import current_user, login_required

app = Flask(__name__)
app.secret_key = 'Teste'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///usuarios.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# ROTA DE LOGIN (GET)
@app.route('/login')
def login():
    tipo_usuario = request.args.get('tipo', 'player')
    return render_template('login.html', tipo_usuario=tipo_usuario)

# ROTA DE LOGIN (POST)
@app.route('/login', methods=['POST'])
def login_post():
    username = request.form.get('username')
    senha = request.form.get('senha')
    tipo_usuario = request.form.get('tipo_usuario', 'player')

    usuario = Usuario.query.filter_by(nome=username).first()

    if usuario and usuario.senha == senha:
        session['user_id'] = usuario.id
        session['user_type'] = usuario.tipo

        if tipo_usuario == 'admin' and usuario.tipo in ['adm', 'adm_master']:
            return redirect(url_for('admin_dashboard'))
        elif tipo_usuario == 'player':
            return redirect(url_for('ver_ficha', usuario_id=usuario.id))
        else:
            flash('Você não tem permissão para acessar esta área', 'danger')
            return redirect(url_for('login', tipo=tipo_usuario))

    flash('Usuário ou senha incorretos', 'danger')
    return redirect(url_for('login', tipo=tipo_usuario))

# DASHBOARD ADMINISTRATIVO
@app.route('/admin/dashboard')
def admin_dashboard():
    if 'user_id' not in session or session['user_type'] not in ['adm', 'adm_master']:
        return redirect(url_for('login', tipo='admin'))

    fichas_pendentes = Ficha.query.filter_by(status='pendente').all()
    return render_template('admin/dashboard.html', fichas=fichas_pendentes)

# PÁGINA INICIAL
@app.route('/')
def index():
    return render_template('index.html')

# REGISTRO DE USUÁRIO
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        nome = request.form['nome']
        senha = request.form['senha']
        tipo = request.form['tipo']
        digitos_telefone = request.form['digitos_telefone']
        nome_personagem = request.form['nome_personagem']
        
        if Usuario.query.filter_by(nome=nome).first():
            return "Usuário já existe!", 400

        novo_usuario = Usuario(
            nome=nome,
            senha=senha,
            tipo=tipo,
            digitos_telefone=digitos_telefone,
            nome_personagem=nome_personagem
        )
        db.session.add(novo_usuario)
        db.session.commit()
        return redirect(url_for('editar_ficha', usuario_id=novo_usuario.id))

    return render_template('register.html')

# VISUALIZAR FICHA
@app.route('/ficha/<int:usuario_id>')
def ver_ficha(usuario_id):
    ficha = Ficha.query.filter_by(usuario_id=usuario_id).first()
    usuario = Usuario.query.get(usuario_id)
    logs = (
        LogEdicao.query
        .filter_by(ficha_id=ficha.id)
        .order_by(LogEdicao.data.desc())
        .limit(30)
        .all()
        if ficha else []
    )
    return render_template('ver_ficha.html', ficha=ficha, logs=logs, usuario=usuario)

# EDITAR FICHA
@app.route('/ficha/<int:usuario_id>/editar', methods=['GET', 'POST'])
def editar_ficha(usuario_id):
    ficha = Ficha.query.filter_by(usuario_id=usuario_id).first()
    usuario = Usuario.query.get(usuario_id)

    pode_mudar_lado = True
    if ficha and ficha.lado_ultima_mudanca:
        tempo_passado = datetime.utcnow() - ficha.lado_ultima_mudanca
        if tempo_passado < timedelta(hours=72):
            pode_mudar_lado = False

    if request.method == 'POST':
        if not usuario or usuario.senha != request.form['senha']:
            return "Senha incorreta!", 403

        if not ficha:
            ficha = Ficha(
                usuario_id=usuario_id,
                nome_personagem=request.form['nome_personagem'],
                raca=request.form['raca'],
                classe=request.form['classe'],
                nivel=int(request.form['nivel']),
                descricao=request.form.get('descricao', ''),
                lado=request.form['lado'],
                lado_ultima_mudanca=datetime.utcnow()
            )
            db.session.add(ficha)
        else:
            ficha.classe = request.form['classe']
            ficha.nivel = int(request.form['nivel'])
            ficha.descricao = request.form.get('descricao', '')
            ficha.ultima_edicao = datetime.utcnow()

            novo_lado = request.form.get('lado')
            if pode_mudar_lado and novo_lado != ficha.lado:
                ficha.lado = novo_lado
                ficha.lado_ultima_mudanca = datetime.utcnow()

        log = LogEdicao(
            ficha_id=ficha.id if ficha.id else None,
            usuario_id=usuario_id,
            motivo=request.form['motivo']
        )
        db.session.add(log)
        db.session.commit()

        return redirect(url_for('ver_ficha', usuario_id=usuario_id))

    logs = LogEdicao.query.filter_by(ficha_id=ficha.id).all() if ficha else []
    return render_template('fichas.html',
                         ficha=ficha,
                         logs=logs,
                         usuario=usuario,
                         pode_mudar_lado=pode_mudar_lado)

# EDITAR FICHA (VARIANTE TESTE)
@app.route('/ficha/<int:usuario_id>/editar_2', methods=['GET', 'POST'])
def editar_ficha_2(usuario_id):
    ficha = Ficha.query.filter_by(usuario_id=usuario_id).first()
    usuario = Usuario.query.get(usuario_id)

    if request.method == 'POST':
        if not usuario or usuario.senha != request.form['senha']:
            return "Senha incorreta!", 403

        if not ficha:
            ficha = Ficha(
                usuario_id=usuario_id,
                nome_personagem=request.form['nome_personagem'],
                raca=request.form['raca'],
                classe=request.form['classe'],
                nivel=int(request.form['nivel']),
                descricao=request.form.get('descricao', '')
            )
            db.session.add(ficha)
            db.session.flush()
        else:
            ficha.nome_personagem = request.form['nome_personagem']
            ficha.raca = request.form['raca']
            ficha.classe = request.form['classe']
            ficha.nivel = int(request.form['nivel'])
            ficha.descricao = request.form.get('descricao', '')
            ficha.ultima_edicao = datetime.utcnow()

        log = LogEdicao(
            ficha_id=ficha.id,
            usuario_id=usuario_id,
            motivo=request.form['motivo']
        )
        db.session.add(log)
        db.session.commit()

        return redirect(url_for('ver_ficha', usuario_id=usuario_id))

    logs = (
        LogEdicao.query
        .filter_by(ficha_id=ficha.id)
        .order_by(LogEdicao.data.desc())
        .limit(30)
        .all()
        if ficha else []
    )
    return render_template('fichas.html', ficha=ficha, logs=logs, usuario=usuario)

# ROTA TEMPORÁRIA DE DEBUG
@app.route('/find_user/<nome>')
def find_user(nome):
    usuario = Usuario.query.filter_by(nome=nome).first()
    if usuario:
        return f"Usuário '{nome}' encontrado! ID: {usuario.id}"
    return "Usuário não encontrado", 404

# =============================================
# NOVA ROTA ADICIONADA (EXCLUSIVAMENTE O QUE VOCÊ PEDIU)
# =============================================
@app.route('/salvar_ficha', methods=['POST'])
@login_required
def salvar_ficha():
    dados = request.get_json()
    
    if not dados:
        return jsonify({'error': 'Dados inválidos'}), 400

    if not check_password_hash(current_user.senha, dados.get('senha')):
        return jsonify({'error': 'Senha incorreta'}), 401

    ficha = Ficha.query.filter_by(usuario_id=current_user.id).first()
    if not ficha:
        return jsonify({'error': 'Ficha não encontrada'}), 404

    campos_permitidos = ['classe', 'classe_avancada', 'nivel', 'experiencia', 'rank', 'lado', 'wons']
    for campo in campos_permitidos:
        if campo in dados:
            setattr(ficha, campo, dados[campo])

    ficha.ultima_edicao = datetime.utcnow()

    log = LogEdicao(
        ficha_id=ficha.id,
        usuario_id=current_user.id,
        motivo=dados.get('motivo', 'Atualização via API'),
        data=datetime.utcnow()
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({'success': 'Ficha atualizada com sucesso!'}), 200

# RODAR A APLICAÇÃO
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)