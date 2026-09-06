import sys
import os

# Root directory of repository on Vercel
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app

# Export FastAPI app for Vercel Serverless Function
app = app
