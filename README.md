# 🌿 EcoWatch AI

Plataforma web de monitoramento ambiental com inteligência artificial, desenvolvida para a região amazônica e municípios brasileiros.

## 📋 Visão Geral

O **EcoWatch AI** é um sistema de acompanhamento de indicadores ambientais (temperatura, umidade, qualidade do ar, focos de queimadas, entre outros) que utiliza **inteligência artificial (Gemma AI)** para interpretar dados e gerar relatórios automáticos em linguagem acessível.

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **Angular 18** | Framework frontend (Standalone Components) |
| **Tailwind CSS (CDN)** | Estilização utilitária |
| **Leaflet.js** | Mapa interativo |
| **Chart.js** | Gráficos de indicadores |
| **Lucide Icons** | Ícones da interface |
| **Poppins (Google Fonts)** | Tipografia |

## 🚀 Como Iniciar

### Pré-requisitos

- **Node.js** versão 18 ou superior
- **npm** versão 9 ou superior

### Instalação

```bash
# 1. Acesse a pasta do frontend
cd frontend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm start
```

O projeto será iniciado em **http://localhost:4200**.

### Build de Produção

```bash
cd frontend
npm run build
```

Os arquivos de produção serão gerados na pasta `frontend/dist/`.

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── components/     # Sidebar e Header
│   │   │   ├── models/         # Interfaces TypeScript
│   │   │   └── services/       # Serviços (API, IA)
│   │   ├── features/
│   │   │   ├── dashboard/      # Painel principal
│   │   │   ├── mapa/           # Mapa interativo
│   │   │   ├── assistente/     # Chat com Gemma AI
│   │   │   ├── relatorios/     # Relatórios automáticos
│   │   │   ├── alertas/        # Sistema de alertas
│   │   │   └── configuracoes/  # Configurações
│   │   ├── app.routes.ts       # Rotas da aplicação
│   │   └── app.component.ts    # Componente raiz
│   ├── styles.css              # Design system global
│   └── index.html              # Ponto de entrada
└── package.json
```

## 🔌 Integração com Backend

O frontend está preparado para receber dados de APIs reais. Os services já possuem a estrutura de **Signals** do Angular para gerenciamento de estado reativo.

### Interfaces principais (`environment.model.ts`):

- `EnvironmentalIndicator` — 9 indicadores ambientais
- `EnvironmentalAlert` — Alertas com severidade
- `ChatMessage` — Mensagens do chat com a IA
- `AutomaticReport` — Relatórios gerados automaticamente

### Services para conectar ao backend:

- `EnvironmentService` — Indicadores e alertas
- `GemmaAiService` — Chat e relatórios da IA

## 📄 Licença

Projeto acadêmico — IFAC.
