from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
import requests

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
        "appid": API_KEY,
        "units": "metric"
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
        "appid": API_KEY,
        "units": "metric"
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

import json

class ChatRequest(BaseModel):
    prompt: str
    system_prompt: str = "Você é um assistente direto, focado e responde de forma objetiva."
    temperature: float = 0.7
    max_tokens: int = 800
    cidade: str | None = "São Paulo" # Padrão
    uf: str | None = "SP" # Padrão

class ChatResponse(BaseModel):
    response: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:
        context_prompt = request.system_prompt
        
        # Se tiver cidade e uf, busca os dados da API do amigo e anexa ao contexto
        if request.cidade and request.uf:
            try:
                clima_atual = obter_clima_atual(request.cidade, request.uf)
                # Pegando apenas os próximos 3 períodos de previsão para não estourar o limite de tokens da IA
                previsao = obter_previsao(request.cidade, request.uf)
                if "list" in previsao:
                    previsao["list"] = previsao["list"][:3]
                
                regras_analise = (
                    "\n\nDIRETRIZES RIGOROSAS DE ANÁLISE AMBIENTAL:\n"
                    "Regra de Ouro: NUNCA invente riscos que não existem. Se as condições forem normais, afirme claramente que o risco é BAIXO ou a situação é SEGURA.\n\n"
                    "1. Risco de Queimadas:\n"
                    "   - BAIXO/NENHUM: Se a umidade for > 30% ou a temperatura for < 30°C.\n"
                    "   - ALTO RISCO: APENAS SE (Umidade < 30% E Temperatura > 30°C).\n"
                    "   - RISCO CRÍTICO: APENAS SE (Cenário de Alto Risco E Vento > 5 m/s).\n"
                    "2. Saúde e Qualidade do Ar:\n"
                    "   - NORMAL: Umidade > 30%.\n"
                    "   - ATENÇÃO: Umidade entre 20% e 30%.\n"
                    "   - EMERGÊNCIA: Umidade < 20% (risco respiratório grave).\n"
                    "3. Conforto Térmico:\n"
                    "   - NORMAL: Sem calor extremo ou umidade extrema combinados.\n"
                    "   - EXAUSTÃO TÉRMICA: Temperatura > 30°C combinada com Umidade > 70%.\n"
                    "4. Tempestades: Observe a probabilidade de chuva ('pop') e ventos na previsão. Ventos fortes podem indicar tempestades iminentes.\n\n"
                    "Baseie sua resposta EXCLUSIVAMENTE nos dados exatos fornecidos abaixo. A temperatura já está convertida para Celsius (°C).\n"
                )

                context_prompt += regras_analise + (
                    f"\nINFORMAÇÃO DE CONTEXTO AMBIENTAL ({request.cidade}-{request.uf}):\n"
                    f"Clima Atual (JSON): {json.dumps(clima_atual)}\n"
                    f"Previsão Curta (JSON): {json.dumps(previsao)}\n\n"
                    "Use os dados JSON acima para responder às perguntas do usuário cruzando com as Diretrizes de Análise acima."
                )
            except Exception as e:
                print(f"Erro ao buscar dados de clima: {e}")

        completion = client.chat.completions.create(
            model="google/gemma-3-4b", 
            messages=[
                {"role": "system", "content": context_prompt},
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