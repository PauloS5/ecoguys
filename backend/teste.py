from openai import OpenAI

# Aponta o cliente para o IP do PC no Hotspot
client = OpenAI(
    # Aqui entra o link do Ngrok com o /v1 no final
    base_url="https://clamshell-rescuer-creasing.ngrok-free.dev/v1", 
    api_key="lm-studio"
)

def perguntar_ao_gemma(prompt):
    try:
        completion = client.chat.completions.create(
            model="google/gemma-3-4b", 
            messages=[
                {"role": "system", "content": "Você é um assistente direto, focado e responde de forma objetiva."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        return completion.choices[0].message.content
        
    except Exception as e:
        return f"Erro ao conectar com o servidor: {e}"

# Testando a requisição
resposta = perguntar_ao_gemma("Me dê 3 ideias rápidas de features para nosso projeto ambiental.")
print(resposta)