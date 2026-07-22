# 🌿 EcoWatch AI

Plataforma web de monitoramento ambiental com inteligência artificial, desenvolvida para a região amazônica e municípios brasileiros.

## 📋 Visão Geral

O **EcoWatch AI** é um sistema de acompanhamento de indicadores ambientais (temperatura, umidade, qualidade do ar, focos de queimadas, entre outros) que utiliza **inteligência artificial (Gemma AI)** para interpretar dados, responder dúvidas e gerar relatórios automáticos em linguagem acessível.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso / Aplicação |
|---|---|
| **Angular 18** | Framework frontend (Standalone Components & Signals) |
| **Tailwind CSS (CDN)** | Estilização utilitária |
| **Leaflet.js + API IBGE v3** | Mapa interativo com drill-down (Brasil ➔ Estado ➔ Município) |
| **Chart.js** | Gráficos de evolução dos indicadores |
| **Lucide Icons** | Biblioteca de ícones da interface |
| **Poppins (Google Fonts)** | Tipografia oficial |
| **Python** | Integração backend e consumo da API de Inteligência Artificial |
| **Gemma 3 4B** | Modelo de Inteligência Artificial (LLM) do Google |
| **LM Studio** | Servidor local para inferência da IA no formato OpenAI |
| **Ngrok** | Túnel seguro para exposição da API de IA local para a internet |

---

## 🧠 Arquitetura de Inteligência Artificial (Servidor Local)

Para evitar os altos custos de servidores com GPU na nuvem, nossa IA roda localmente na máquina hospedeira. O projeto consome o modelo **Gemma 3 4B** servido via **LM Studio**.

### Como configurar o Servidor de IA
1. Instale o [LM Studio](https://lmstudio.ai/).
2. Baixe o modelo `google/gemma-3-4b` (versão Q4_K_M).
3. Na aba **Load**, defina o **Context Length** para `8192` tokens para garantir respostas instantâneas.
4. Na aba **Local Server**, vá em **Server Settings** e ative:
   - `Serve on Local Network` (host `0.0.0.0`)
   - `Enable CORS`
5. Inicie o servidor. Ele rodará localmente na porta `1234`.

### 🌐 Expondo a API (Túnel Ngrok)
Como a IA roda localmente, utilizamos o **Ngrok** para criar uma ponte entre a aplicação na nuvem e o computador hospedeiro.
No terminal da máquina rodando o LM Studio, execute:
`ngrok http 1234`

O link público gerado (ex: `https://<hash>.ngrok-free.dev/v1`) deve ser inserido nas variáveis de ambiente do backend Python para que ele consiga se comunicar com o Gemma.

---

## 🚀 Como Iniciar

### Pré-requisitos

- **Node.js** versão 18 ou superior
- **npm** versão 9 ou superior

### Passos para Execução

```bash
# 1. Acesse a pasta do frontend
cd frontend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm start
```

O aplicativo estará acessível em **http://localhost:4200**.

### Build de Produção

```bash
cd frontend
npm run build
```

Os arquivos estáticos otimizados serão gerados em `frontend/dist/frontend`.

---

## 📁 Estrutura Atualizada do Repositório

```
ecoguys/
├── backend/                      # API em Python para comunicação com o Ngrok e Frontend
│   └── requirements.txt          # Dependências do Python (openai, requests, etc.)
├── docs/
│   └── concept.md                # Especificação conceitual do sistema
├── frontend/                     # Aplicação Frontend em Angular 18
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── components/   # Sidebar (menu) e Header (busca/perfil)
│   │   │   │   ├── models/       # environment.model.ts (interfaces TypeScript)
│   │   │   │   └── services/     # Services: Environment, Gemma AI e Map Service
│   │   │   ├── features/
│   │   │   │   ├── alertas/      # Sistema de alertas e parâmetros
│   │   │   │   ├── assistente/   # Chat em linguagem natural com a IA Gemma
│   │   │   │   ├── configuracoes/# Gestão de fontes e preferências
│   │   │   │   ├── dashboard/    # Painel dos 9 indicadores + destaques
│   │   │   │   ├── mapa/         # Mapa interativo com drill-down e painel lateral
│   │   │   │   └── relatorios/   # Relatórios ambientais em 5 seções
│   │   │   ├── app.component.ts  # Componente raiz
│   │   │   ├── app.config.ts     # Configuração da aplicação
│   │   │   └── app.routes.ts     # Rotas lazy-loaded
│   │   ├── styles.css            # Design System (Glassmorphism + variáveis CSS)
│   │   └── index.html            # Ponto de entrada HTML (CDNs)
│   └── package.json
├── LEIAME.md                     # Resumo geral do projeto em português
└── README.md                     # Documentação principal do repositório
```

---

## 🔌 Preparação para Integração com Backend

O frontend utiliza **Angular Signals** (`signal()`) para gerenciar o estado reativo. Todos os componentes consomem dados por meio dos seguintes serviços:

### Services Principais:
1. `EnvironmentService` — Gerencia os 9 indicadores ambientais e a lista de alertas.
2. `GemmaAiService` — Gerencia o histórico de chat e geração de relatórios da IA Gemma.
3. `MapService` — Gerencia as malhas geográficas em GeoJSON (API do IBGE v3) e cache local.

### Interfaces Principais (`environment.model.ts`):
- `EnvironmentalIndicator` — Modelo para os 9 indicadores ambientais.
- `EnvironmentalAlert` — Modelo de alertas e níveis de severidade.
- `ChatMessage` — Modelo das mensagens trocadas com o assistente.
- `AutomaticReport` — Modelo de relatórios divididos em 5 seções.
- `MapNavigationState` — Modelo para controle do nível do mapa (`country` | `state` | `municipality`).

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos — IFAC.
