import sys
import os
sys.path.append(os.getcwd())
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
print(client.get('/api/dashboard/summary').json())
