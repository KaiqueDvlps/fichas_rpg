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
            return redirect(url_for('fichas', usuario_id=user.id))
        else:
            flash('Você não tem permissão para acessar esta área', 'danger')
            return redirect(url_for('login', tipo=tipo_usuario))

    flash('Usuário ou senha incorretos', 'danger')
    return redirect(url_for('login', tipo=tipo_usuario))

@app.route('/admin/dashboard')
def admin_dashboard():
    if 'user_id' not in session or session['user_type'] not in ['adm', 'adm_master']:
        return redirect(url_for('login', tipo='admin'))

    fichas = supabase.table('fichas').select('*').eq('status', 'pendente').execute()
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

@app.route('/ficha/<int:usuario_id>/editar', methods=['GET', 'POST'])
def fichas(usuario_id):
    # Busca dados básicos (ficha e usuário)
    ficha_resp = supabase.table('ficha').select('*').eq('usuario_id', usuario_id).execute()
    ficha = ficha_resp.data[0] if ficha_resp.data else None

    usuario_resp = supabase.table('usuario').select('*').eq('id', usuario_id).execute()
    usuario = usuario_resp.data[0] if usuario_resp.data else None
    print(ficha, usuario);
    # Verificação de mudança de lado
    pode_mudar_lado = True
    if ficha and ficha.get('lado_ultima_mudanca'):
        lado_ultima_mudanca = datetime.fromisoformat(ficha['lado_ultima_mudanca'])
        ficha['lado_ultima_mudanca'] = lado_ultima_mudanca
        if datetime.utcnow() - lado_ultima_mudanca < timedelta(hours=72):
            pode_mudar_lado = False

    # Busca dados de TODAS as tabelas relacionadas
    def fetch_table_data(table_name, user_id=usuario_id):
        response = supabase.table(table_name).select('*').eq('usuario_id', user_id).execute()
        return response.data if response.data else []

    # Dados das novas tabelas
    maestrias = fetch_table_data('maestrias')
    tipos_lutador = fetch_table_data('tipos_lutador')
    titulos = fetch_table_data('titulos')
    passivas = fetch_table_data('passivas')
    habilidades = fetch_table_data('habilidades')
    atributos = fetch_table_data('atributos')
    equipamentos = fetch_table_data('equipamentos')
    acessorios = fetch_table_data('acessorios')
    itens_apoio = fetch_table_data('itens_apoio')
    inventario = fetch_table_data('inventario')

    # Processamento do POST (formulário enviado)
    if request.method == 'POST':
        # Verificação de senha
        if not usuario or usuario['senha'] != request.form['senha']:
            return "Senha incorreta!", 403

        # Atualização/Criação da Ficha Principal
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
                'nome_personagem': request.form['nome_personagem'],
                'raca': request.form['raca'],
                'classe': request.form['classe'],
                'nivel': int(request.form['nivel']),
                'descricao': request.form.get('descricao', ''),
                'ultima_edicao': datetime.utcnow().isoformat()
            }

            if pode_mudar_lado and 'lado' in request.form and request.form['lado'] != ficha['lado']:
                update_data['lado'] = request.form['lado']
                update_data['lado_ultima_mudanca'] = datetime.utcnow().isoformat()

            supabase.table('ficha').update(update_data).eq('id', ficha['id']).execute()

        # ATUALIZAÇÃO DAS NOVAS TABELAS (TODAS)
        # Atributos
        if atributos:
            supabase.table('atributos').update({
                'forca': int(request.form.get('forca', 0)),
                'agilidade': int(request.form.get('agilidade', 0)),
                'resistencia': int(request.form.get('resistencia', 0)),
                'sentidos': int(request.form.get('sentidos', 0)),
                'inteligencia': int(request.form.get('inteligencia', 0)),
                'poder_magico': int(request.form.get('poder_magico', 0))
            }).eq('id', atributos[0]['id']).execute()
        else:
            supabase.table('atributos').insert({
                'usuario_id': usuario_id,
                'forca': int(request.form.get('forca', 0)),
                'agilidade': int(request.form.get('agilidade', 0)),
                'resistencia': int(request.form.get('resistencia', 0)),
                'sentidos': int(request.form.get('sentidos', 0)),
                'inteligencia': int(request.form.get('inteligencia', 0)),
                'poder_magico': int(request.form.get('poder_magico', 0))
            }).execute()

        # Maestrias (exemplo de atualização em lote)
        supabase.table('maestrias').delete().eq('usuario_id', usuario_id).execute()
        maestrias_data = request.form.getlist('maestrias[]')
        for maestria in maestrias_data:
            if maestria.strip():
                supabase.table('maestrias').insert({
                    'usuario_id': usuario_id,
                    'nome': maestria,
                    'treino': int(request.form.get(f'maestria_{maestria}_treino', 0)),
                    'duelo': int(request.form.get(f'maestria_{maestria}_duelo', 0)),
                    'boss': int(request.form.get(f'maestria_{maestria}_boss', 0)),
                    'nivel': int(request.form.get(f'maestria_{maestria}_nivel', 1))
                }).execute()

        # Tipos de Lutador
        supabase.table('tipos_lutador').delete().eq('usuario_id', usuario_id).execute()
        tipos = request.form.getlist('tipos_lutador[]')
        for tipo in tipos:
            if tipo.strip():
                supabase.table('tipos_lutador').insert({
                    'usuario_id': usuario_id,
                    'tipo': tipo
                }).execute()

        # Títulos
        supabase.table('titulos').delete().eq('usuario_id', usuario_id).execute()
        titulos_data = request.form.getlist('titulos[]')
        for titulo in titulos_data:
            if titulo.strip():
                supabase.table('titulos').insert({
                    'usuario_id': usuario_id,
                    'titulo': titulo
                }).execute()

        # Passivas
        supabase.table('passivas').delete().eq('usuario_id', usuario_id).execute()
        passivas_data = request.form.getlist('passivas[]')
        for passiva in passivas_data:
            if passiva.strip():
                supabase.table('passivas').insert({
                    'usuario_id': usuario_id,
                    'descricao': passiva
                }).execute()

        # Habilidades
        supabase.table('habilidades').delete().eq('usuario_id', usuario_id).execute()
        habilidades_data = request.form.getlist('habilidades[]')
        for habilidade in habilidades_data:
            if habilidade.strip():
                supabase.table('habilidades').insert({
                    'usuario_id': usuario_id,
                    'nome': habilidade
                }).execute()

        # Equipamentos (atualiza ou insere)
        equip_data = {
            'usuario_id': usuario_id,
            'cabeca_nome': request.form.get('cabeca_nome'),
            'cabeca_bonus': request.form.get('cabeca_bonus'),
            'corpo_1_nome': request.form.get('corpo_1_nome'),
            'corpo_1_bonus': request.form.get('corpo_1_bonus'),
            'corpo_2_nome': request.form.get('corpo_2_nome'),
            'corpo_2_bonus': request.form.get('corpo_2_bonus'),
            'pernas_1_nome': request.form.get('pernas_1_nome'),
            'pernas_1_bonus': request.form.get('pernas_1_bonus'),
            'pernas_2_nome': request.form.get('pernas_2_nome'),
            'pernas_2_bonus': request.form.get('pernas_2_bonus'),
            'pes_nome': request.form.get('pes_nome'),
            'pes_bonus': request.form.get('pes_bonus'),
            'maos_nome': request.form.get('maos_nome'),
            'maos_bonus': request.form.get('maos_bonus'),
            'arma_1_nome': request.form.get('arma_1_nome'),
            'arma_1_bonus': request.form.get('arma_1_bonus'),
            'arma_2_nome': request.form.get('arma_2_nome'),
            'arma_2_bonus': request.form.get('arma_2_bonus')
        }
        if equipamentos:
            supabase.table('equipamentos').update(equip_data).eq('id', equipamentos[0]['id']).execute()
        else:
            supabase.table('equipamentos').insert(equip_data).execute()

        # Acessórios (atualização em lote)
        supabase.table('acessorios').delete().eq('usuario_id', usuario_id).execute()
        acessorios_data = zip(
            request.form.getlist('acessorios_nome[]'),
            request.form.getlist('acessorios_bonus[]'),
            request.form.getlist('acessorios_tipo[]')
        )
        for nome, bonus, tipo in acessorios_data:
            if nome.strip():
                supabase.table('acessorios').insert({
                    'usuario_id': usuario_id,
                    'nome': nome,
                    'bonus': bonus,
                    'tipo': tipo
                }).execute()

        # Itens de Apoio
        supabase.table('itens_apoio').delete().eq('usuario_id', usuario_id).execute()
        itens_apoio_data = zip(
            request.form.getlist('itens_apoio_nome[]'),
            request.form.getlist('itens_apoio_descricao[]')
        )
        for nome, descricao in itens_apoio_data:
            if nome.strip():
                supabase.table('itens_apoio').insert({
                    'usuario_id': usuario_id,
                    'nome': nome,
                    'descricao': descricao
                }).execute()

        # Inventário
        supabase.table('inventario').delete().eq('usuario_id', usuario_id).execute()
        inventario_data = zip(
            request.form.getlist('inventario_nome[]'),
            request.form.getlist('inventario_quantidade_total[]'),
            request.form.getlist('inventario_quantidade_usada[]')
        )
        for nome, qtd_total, qtd_usada in inventario_data:
            if nome.strip():
                supabase.table('inventario').insert({
                    'usuario_id': usuario_id,
                    'nome': nome,
                    'quantidade_total': int(qtd_total) if qtd_total else 1,
                    'quantidade_usada': int(qtd_usada) if qtd_usada else 0
                }).execute()

        # Log de Edição
        log_data = {
            'ficha_id': ficha['id'],
            'usuario_id': usuario_id,
            'motivo': request.form['motivo'],
            'data': datetime.utcnow().isoformat()
        }
        supabase.table('log_edicao').insert(log_data).execute()

        return redirect(url_for('fichas', usuario_id=usuario_id))

    # Busca logs se for GET
    logs_resp = supabase.table('log_edicao').select('*').eq('ficha_id', ficha['id']).execute() if ficha else []
    logs = logs_resp.data if ficha else []

    return render_template('fichas.html',
        ficha=ficha,
        logs=logs,
        usuario=usuario,
        pode_mudar_lado=pode_mudar_lado,
        maestrias=maestrias,
        tipos_lutador=tipos_lutador,
        titulos=titulos,
        passivas=passivas,
        habilidades=habilidades,
        atributos=atributos[0] if atributos else None,
        equipamentos=equipamentos[0] if equipamentos else None,
        acessorios=acessorios,
        itens_apoio=itens_apoio,
        inventario=inventario
    )
def atualizar(table_name, campos_permitidos, dados, ficha_id, campos_permitidos_maestria, campos_permitidos_equipamentos, campos_permitidos_atributos, campos_permitidos_inventario):
    update_data = {
        campo: dados[campo]
        for campo in campos_permitidos
        if campo in dados and dados[campo] != ""
    }
    update_data['ultima_edicao'] = datetime.utcnow().isoformat()
    supabase.table(table_name).update(update_data).eq('id', ficha_id).execute()

# ✅ ROTA CORRIGIDA
@app.route('/salvar_ficha', methods=['POST'])
@login_required
def salvar_ficha():
    dados = request.get_json()
    if 'senha' not in dados or dados['senha'] != current_user.senha:
        flash('Senha incorreta!', 'danger')
        return redirect(url_for('fichas', usuario_id=current_user.id))
    
    resposta = supabase.table('ficha').select('*').eq('usuario_id', current_user.id).execute()
    ficha = resposta.data[0] if resposta.data else None
    if not ficha:
        print(resposta, ficha, current_user.id)
        flash('Ficha não encontrada!', 'danger')
        return jsonify({'success': False, 'message': 'erro ao atualizar ficha!'})
    
    campos_permitidos_ficha = ['classe', 'classe_avancada', 'nivel', 'experiencia', 'rank', 'lado', 'wons', 'habilidades', 'passivas', 'tipos_lutador', 'titulos']
    campos_permitidos_maestria = ['nome', 'treino', 'duelo', 'boss', 'nivel']
    campos_permitidos_equipamentos = {"cabeca":["nome","bonus"],"corpo":["nome","bonus"],"acessorios":["nome","bonus"],"apoio":["nome","descricao"],"pernas":["nome","bonus"],"pes":["nome","bonus"],"maos":["nome","bonus"],"armas":["nome","bonus"]}
    campos_permitidos_atributos = {"forca":["valor_base","bonus"],"agilidade":["valor_base","bonus"],"resistencia":["valor_base","bonus"],"sentidos":["valor_base","bonus"],"inteligencia":["valor_base","bonus"]}
    campos_permitidos_inventario = {"wons":["valor"],"itens":[{"nome":["nome"],"consumivel":["bool"],"total":["valor"],"usados":["valor"]}]}
    
    # CORRIGIDO: Passando ficha['id'] em vez de ficha e removendo ["id"]
    atualizar("ficha", campos_permitidos_ficha, dados, ficha['id'], campos_permitidos_maestria, campos_permitidos_equipamentos, campos_permitidos_atributos, campos_permitidos_inventario)
    
    log_data = {'ficha_id': ficha['id'], 'usuario_id': current_user.id, 'motivo': dados.get('motivo', 'Atualização via formulário'), 'data': datetime.utcnow().isoformat()}
    supabase.table('log_edicao').insert(log_data).execute()
    
    flash('Ficha atualizada com sucesso!', 'success')
    return jsonify({'success': True, 'message': 'Ficha atualizada com sucesso!'})


if __name__ == '__main__':
    app.run(debug=True)
