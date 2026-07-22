from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
import requests
import time

API_KEY = "ca8e74511637ad32870a4d271daa693c"
BASE_URL = "https://api.openweathermap.org/data/2.5"

CACHE_EXPIRATION = 300  # 5 minutos de cache
clima_cache = {}
previsao_cache = {}


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

    key = f"{cidade.lower()}-{uf.lower()}"
    now = time.time()
    if key in clima_cache and now - clima_cache[key]['time'] < CACHE_EXPIRATION:
        return clima_cache[key]['data']

    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    
    clima_cache[key] = {'time': now, 'data': data}
    return data


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

    key = f"{cidade.lower()}-{uf.lower()}"
    now = time.time()
    if key in previsao_cache and now - previsao_cache[key]['time'] < CACHE_EXPIRATION:
        return previsao_cache[key]['data']

    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    
    previsao_cache[key] = {'time': now, 'data': data}
    return data

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

@app.get("/api/v1/indicators")
async def get_indicators(city: str):
    parts = city.split('-')
    cidade = parts[0].strip()
    uf = parts[1].strip() if len(parts) > 1 else ""
    try:
        dados = obter_clima_atual(cidade, uf)
        temp = dados["main"]["temp"]
        humidity = dados["main"]["humidity"]
        rain = dados.get("rain", {}).get("1h", 0.0)
        wind = dados["wind"]["speed"] * 3.6
        visibilidade = dados.get("visibility", 10000)
        aqi_value = 45 if visibilidade > 8000 else (120 if visibilidade < 4000 else 80)
        feels_like = dados["main"]["feels_like"]
        pressure = dados["main"]["pressure"]
        clouds = dados.get("clouds", {}).get("all", 0)
        vis_km = visibilidade / 1000.0

        return [
            { "id": '1', "name": 'Temperatura', "value": f"{temp:.1f}", "unit": '°C', "status": 'info', "icon": 'thermometer', "category": 'temperature' },
            { "id": '2', "name": 'Umidade Relativa', "value": f"{humidity}", "unit": '%', "status": 'info', "icon": 'droplets', "category": 'humidity' },
            { "id": '3', "name": 'Precipitação (1h)', "value": f"{rain:.1f}", "unit": 'mm', "status": 'info', "icon": 'cloud-rain', "category": 'rain' },
            { "id": '4', "name": 'Vento', "value": f"{wind:.1f}", "unit": 'km/h', "status": 'info', "icon": 'wind', "category": 'wind' },
            { "id": '5', "name": 'Qualidade do Ar (Est.)', "value": f"{aqi_value}", "unit": 'AQI', "status": 'warning' if aqi_value > 100 else 'info', "icon": 'activity', "category": 'aqi' },
            { "id": '6', "name": 'Sensação Térmica', "value": f"{feels_like:.1f}", "unit": '°C', "status": 'info', "icon": 'sun-dim', "category": 'uv' },
            { "id": '7', "name": 'Pressão Atmosférica', "value": f"{pressure}", "unit": 'hPa', "status": 'info', "icon": 'gauge', "category": 'river' },
            { "id": '8', "name": 'Nebulosidade', "value": f"{clouds}", "unit": '%', "status": 'info', "icon": 'cloud', "category": 'fire' },
            { "id": '9', "name": 'Visibilidade', "value": f"{vis_km:.1f}", "unit": 'km', "status": 'info', "icon": 'eye', "category": 'vegetation' }
        ]
    except Exception:
        return []

@app.get("/api/v1/alerts")
async def get_alerts(city: str):
    parts = city.split('-')
    cidade = parts[0].strip()
    uf = parts[1].strip() if len(parts) > 1 else ""
    try:
        dados = obter_clima_atual(cidade, uf)
        temp = dados["main"]["temp"]
        humidity = dados["main"]["humidity"]
        wind = dados["wind"]["speed"]
        alertas = []
        if humidity < 30 and temp > 30:
            alertas.append({
                "id": "1", "title": "Alerta de Queimadas", 
                "description": f"Clima seco ({humidity}%) e quente ({temp}°C).", 
                "severity": "critical" if wind > 5 else "warning", "timestamp": ""
            })
        if humidity < 20:
            alertas.append({
                "id": "2", "title": "Emergência de Saúde", 
                "description": f"Umidade criticamente baixa ({humidity}%).", "severity": "critical", "timestamp": ""
            })
        elif humidity < 30:
            alertas.append({
                "id": "2", "title": "Atenção Saúde", 
                "description": f"Umidade abaixo do recomendado ({humidity}%).", "severity": "warning", "timestamp": ""
            })
        return alertas
    except Exception:
        return []

@app.get("/api/v1/charts/historical")
async def get_charts(city: str):
    parts = city.split('-')
    cidade = parts[0].strip()
    uf = parts[1].strip() if len(parts) > 1 else ""
    try:
        previsao = obter_previsao(cidade, uf)
        lista = previsao.get("list", [])[:12]
        labels = []
        lineData = []
        barData = []
        for item in lista:
            hora = item["dt_txt"].split(" ")[1][:5]
            labels.append(hora)
            lineData.append(round(item["main"]["temp"], 1))
            barData.append(item["main"]["humidity"])
        return { "labels": labels, "lineData": lineData, "barData": barData }
    except Exception:
        return { "labels": ['Erro'], "lineData": [0], "barData": [0] }