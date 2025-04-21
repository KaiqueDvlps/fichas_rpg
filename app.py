from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from datetime import datetime, timedelta
from flask_login import current_user, login_required, LoginManager, UserMixin, login_user
from supabase import create_client, Client
import os

app = Flask(__name__)
app.secret_key = 'Teste'

# Initialize Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Classe fake User para integrar com Flask-Login
class SupabaseUser(UserMixin):
    def __init__(self, data):
        self.id = data['id']
        self.nome = data['nome']
        self.tipo = data['tipo']
        self.senha = data['senha']
        self.data = data

@login_manager.user_loader
def load_user(user_id):
    usuario = supabase.table('usuario').select('*').eq('id', user_id).execute()
    if usuario.data:
        return SupabaseUser(usuario.data[0])
    return None

@app.route('/login')
def login():
    tipo_usuario = request.args.get('tipo', 'player')
    return render_template('login.html', tipo_usuario=tipo_usuario)

@app.route('/login', methods=['POST'])
def login_post():
    username = request.form.get('username')
    senha = request.form.get('senha')
    tipo_usuario = request.form.get('tipo_usuario', 'player')

    usuario = supabase.table('usuario').select('*').eq('nome', username).execute()
    usuario = usuario.data[0] if usuario.data else None

    if usuario and usuario['senha'] == senha:
        user = SupabaseUser(usuario)
        login_user(user)
        session['user_id'] = user.id
        session['user_type'] = user.tipo

        if tipo_usuario == 'admin' and user.tipo in ['adm', 'adm_master']:
            return redirect(url_for('admin_dashboard'))
        elif tipo_usuario == 'player':
            return redirect(url_for('ver_ficha', usuario_id=user.id))
        else:
            flash('Você não tem permissão para acessar esta área', 'danger')
            return redirect(url_for('login', tipo=tipo_usuario))

    flash('Usuário ou senha incorretos', 'danger')
    return redirect(url_for('login', tipo=tipo_usuario))

@app.route('/admin/dashboard')
def admin_dashboard():
    if 'user_id' not in session or session['user_type'] not in ['adm', 'adm_master']:
        return redirect(url_for('login', tipo='admin'))

    fichas = supabase.table('ficha').select('*').eq('status', 'pendente').execute()
    ficha_pendentes = fichas.data
    return render_template('admin/dashboard.html', ficha=ficha_pendentes)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        nome = request.form['nome']
        senha = request.form['senha']
        tipo = request.form['tipo']
        digitos_telefone = request.form['digitos_telefone']
        nome_personagem = request.form['nome_personagem']

        usuario = supabase.table('usuario').select('*').eq('nome', nome).execute()
        if usuario.data:
            return "Usuário já existe!", 400

        novo_usuario = {
            'nome': nome,
            'senha': senha,
            'tipo': tipo,
            'digitos_telefone': digitos_telefone,
            'nome_personagem': nome_personagem
        }
        usuario = supabase.table('usuario').insert(novo_usuario).execute()
        usuario_id = usuario.data[0]['id']
        ficha = supabase.table("ficha").insert({"usuario_id":usuario_id, "nome_personagem":nome_personagem }).execute()

        return redirect(url_for('editar_ficha', usuario_id=usuario_id))

    return render_template('register.html')

@app.route('/ficha/<int:usuario_id>')
def ver_ficha(usuario_id):
    ficha_resp = supabase.table('ficha').select('*').eq('usuario_id', usuario_id).execute()
    ficha = ficha_resp.data[0] if ficha_resp.data else None

    usuario_resp = supabase.table('usuario').select('*').eq('id', usuario_id).execute()
    usuario = usuario_resp.data[0] if usuario_resp.data else None

    logs = []
    if ficha:
        logs_resp = supabase.table('log_edicao').select('*').eq('ficha_id', ficha['id']).order('data', desc=True).limit(30).execute()
        logs = logs_resp.data

    return render_template('ver_ficha.html', ficha=ficha, logs=logs, usuario=usuario)

@app.route('/ficha/<int:usuario_id>/editar', methods=['GET', 'POST'])  #MUDAR DPS
def editar_ficha(usuario_id):
    ficha_resp = supabase.table('ficha').select('*').eq('usuario_id', usuario_id).execute()
    ficha = ficha_resp.data[0] if ficha_resp.data else None

    usuario_resp = supabase.table('usuario').select('*').eq('id', usuario_id).execute()
    usuario = usuario_resp.data[0] if usuario_resp.data else None

    pode_mudar_lado = True
    if ficha and ficha.get('lado_ultima_mudanca'):
        # Converte a string ISO para datetime
        lado_ultima_mudanca = datetime.fromisoformat(ficha['lado_ultima_mudanca'])
        ficha['lado_ultima_mudanca'] = lado_ultima_mudanca  # sobrescreve no dicionário para o Jinja
        tempo_passado = datetime.utcnow() - lado_ultima_mudanca
        if tempo_passado < timedelta(hours=72):
            pode_mudar_lado = False

    if request.method == 'POST':
        if not usuario or usuario['senha'] != request.form['senha']:
            return "Senha incorreta!", 403

        if not ficha:
            nova_ficha = {
                'usuario_id': usuario_id,
                'nome_personagem': request.form['nome_personagem'],
                'raca': request.form['raca'],
                'classe': request.form['classe'],
                'nivel': int(request.form['nivel']),
                'descricao': request.form.get('descricao', ''),
                'lado': request.form['lado'],
                'lado_ultima_mudanca': datetime.utcnow().isoformat(),
                'status': 'pendente'
            }
            resposta = supabase.table('ficha').insert(nova_ficha).execute()
            ficha = resposta.data[0]
        else:
            update_data = {
                'classe': request.form['classe'],
                'nivel': int(request.form['nivel']),
                'descricao': request.form.get('descricao', ''),
                'ultima_edicao': datetime.utcnow().isoformat()
            }

            novo_lado = request.form.get('lado')
            if pode_mudar_lado and novo_lado != ficha['lado']:
                update_data['lado'] = novo_lado
                update_data['lado_ultima_mudanca'] = datetime.utcnow().isoformat()

            resposta = supabase.table('ficha').update(update_data).eq('id', ficha['id']).execute()
            ficha = resposta.data[0]

        log_data = {
            'ficha_id': ficha['id'],
            'usuario_id': usuario_id,
            'motivo': request.form['motivo'],
            'data': datetime.utcnow().isoformat()
        }
        supabase.table('log_edicao').insert(log_data).execute()

        return redirect(url_for('ver_ficha', usuario_id=usuario_id))

    logs_resp = supabase.table('log_edicao').select('*').eq('ficha_id', ficha['id']).execute() if ficha else []
    logs = logs_resp.data if ficha else []
    return render_template('fichas.html',
                           ficha=ficha,
                           logs=logs,
                           usuario=usuario,
                           pode_mudar_lado=pode_mudar_lado)

# ✅ ROTA CORRIGIDA
@app.route('/salvar_ficha', methods=['POST'])
@login_required
def salvar_ficha():
    dados = request.get_json()

    if 'senha' not in dados or dados['senha'] != current_user.senha:
        flash('Senha incorreta!', 'danger')
        return redirect(url_for('ver_ficha', usuario_id=current_user.id))

    resposta = supabase.table('ficha').select('*').eq('id', current_user.id).execute()
    ficha = resposta.data[0] if resposta.data else None
    if not ficha:
        flash('Ficha não encontrada!', 'danger')
        return jsonify({'success': False, 'message': 'erro ao atualizar ficha!'})

    campos_permitidos = ['classe', 'classe_avancada', 'nivel', 'experiencia', 'rank', 'lado', 'wons']
    update_data = {
    campo: dados[campo]
    for campo in campos_permitidos
    if campo in dados and dados[campo] != ""}
    update_data['ultima_edicao'] = datetime.utcnow().isoformat()
    print(resposta,ficha)
    supabase.table('ficha').update(update_data).eq('id', ficha['id']).execute()

    log_data = {
        'ficha_id': ficha['id'],
        'usuario_id': current_user.id,
        'motivo': dados.get('motivo', 'Atualização via formulário'),
        'data': datetime.utcnow().isoformat()
    }
    supabase.table('log_edicao').insert(log_data).execute()

    flash('Ficha atualizada com sucesso!', 'success')
    return jsonify({'success': True, 'message': 'Ficha atualizada com sucesso!'})

if __name__ == '__main__':
    app.run(debug=True)
