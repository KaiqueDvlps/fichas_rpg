from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()  # Carrega o .env automaticamente

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)
