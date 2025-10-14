import sqlite3


nome = "usuario_teste"
email = "teste@exemplo.com"
senha = "senha123"


banco = sqlite3.connect('data_base.db')
cursor = banco.cursor()


cursor.execute("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL, senha TEXT NOT NULL)")

sql_insert = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)"
dados = (nome, email, senha)


try:
    cursor.execute(sql_insert, dados)
    print("Registro inserido com sucesso!")
    banco.commit() 
    
except sqlite3.IntegrityError as e:
    
    print(f"Erro de integridade: {e}. O registro pode já existir.")
    banco.rollback()

finally:
    banco.close()
    print("Conexão com o banco fechada.")
 
        
#Posts   
import sqlite3
import datetime

titulo_post = "?"
conteudo_post = "?."
autor_id = 0

DB_NAME = 'data_base.db'

def criar_tabela_posts(cursor):
    """Executa o comando SQL para criar a tabela 'posts'."""
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            conteudo TEXT NOT NULL,
            autor_id INTEGER NOT NULL,
            data_publicacao TEXT DEFAULT CURRENT_TIMESTAMP,
            
            -- DEFINIÇÃO DE CHAVE ESTRANGEIRA (Opcional, mas altamente recomendado para integridade)
            FOREIGN KEY (autor_id) REFERENCES usuarios(id)
        )
    """)
    print("Tabela 'posts' verificada/criada com sucesso.")


def inserir_post_exemplo(cursor, titulo, conteudo, autor_id):
    """Insere um novo post na tabela 'posts'."""
    
    sql_insert_post = "INSERT INTO posts (titulo, conteudo, autor_id) VALUES (?, ?, ?)"
    dados_post = (titulo, conteudo, autor_id)
    
    cursor.execute(sql_insert_post, dados_post)
    print(f"Post '{titulo}' inserido com sucesso!")


banco = None
try:
    banco = sqlite3.connect(DB_NAME)
    cursor = banco.cursor()

    criar_tabela_posts(cursor)

    inserir_post_exemplo(cursor, titulo_post, conteudo_post, autor_id)
    
    banco.commit() 
    
except sqlite3.Error as e:
    print(f"Ocorreu um erro no banco de dados: {e}")
    if banco:
        banco.rollback() 

finally:
    if banco:
        banco.close()
        print("Conexão com o banco fechada.")


        #to-do

        import sqlite3
import datetime

descricao_tarefa = "?"
status_conclusao = 0 


DB_NAME = 'data_base.db'

banco = None
try:
    banco = sqlite3.connect(DB_NAME)
    cursor = banco.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL,
            data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
            concluida INTEGER DEFAULT 0
        )
    """)
    print("Tabela 'tarefas' verificada/criada com sucesso.")


    sql_insert_tarefa = "INSERT INTO tarefas (descricao, concluida) VALUES (?, ?)"
    dados_tarefa = (descricao_tarefa, status_conclusao)
    
    cursor.execute(sql_insert_tarefa, dados_tarefa)
    
    banco.commit() 
    print(f"Tarefa '{descricao_tarefa}' inserida com sucesso!")
    
except sqlite3.Error as e:
    print(f"Ocorreu um erro no banco de dados: {e}")
    if banco:
        banco.rollback() 

finally:
    if banco:
        banco.close()
        print("Conexão com o banco fechada.")
