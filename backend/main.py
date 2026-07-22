from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI(title="EcoGuys AI API", description="API para conectar com o modelo Gemma via Ngrok")

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
