from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os

API_KEY = "ca8e74511637ad32870a4d271daa693c"
BASE_URL = "https://api.openweathermap.org/data/2.5"


def obter_clima_atual(cidade: str, uf: str) -> dict:
    """
    Retorna os dados do clima atual para uma cidade brasileira.

    Parâmetros:
        cidade (str): Nome da cidade.
        uf (str): Sigla do estado (ex.: AC, SP, RJ).

    Retorna:
        dict: Resposta da API em formato JSON.
    """
    url = f"{BASE_URL}/weather"
    params = {
        "q": f"{cidade},{uf},BR",
        "appid": API_KEY
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    return response.json()


def obter_previsao(cidade: str, uf: str) -> dict:
    """
    Retorna a previsão do tempo (5 dias, intervalos de 3 horas).

    Parâmetros:
        cidade (str): Nome da cidade.
        uf (str): Sigla do estado (ex.: AC, SP, RJ).

    Retorna:
        dict: Resposta da API em formato JSON.
    """
    url = f"{BASE_URL}/forecast"
    params = {
        "q": f"{cidade},{uf},BR",
        "appid": API_KEY
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    return response.json()

app = FastAPI(title="EcoGuys AI API", description="API para conectar com o modelo Gemma via Ngrok")

# Configuração do CORS para permitir que o frontend acesse o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite de qualquer origem (útil para o Live Server)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

# Inicializa o cliente da OpenAI apontando para o servidor local exposto no Ngrok
client = OpenAI(
    base_url="https://clamshell-rescuer-creasing.ngrok-free.dev/v1", 
    api_key="lm-studio"
)

class ChatRequest(BaseModel):
    prompt: str
    system_prompt: str = "Você é um assistente direto, focado e responde de forma objetiva."
    temperature: float = 0.7
    max_tokens: int = 800

class ChatResponse(BaseModel):
    response: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:
        completion = client.chat.completions.create(
            model="google/gemma-3-4b", 
            messages=[
                {"role": "system", "content": request.system_prompt},
                {"role": "user", "content": request.prompt}
            ],
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        return ChatResponse(response=completion.choices[0].message.content)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao conectar com o servidor da IA: {e}")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Backend FastAPI está rodando"}