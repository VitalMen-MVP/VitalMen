# arquivo com dados de conexão do banco de dados

DATABASE_URL = f"postgres://postgres.amgqmjakblyakhjpqxua:HzSDphczguAVSK20@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

print(DATABASE_URL)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
print(DATABASE_URL)