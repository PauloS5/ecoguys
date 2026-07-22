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
├── backend/                      # Pasta reservada para a API backend (Spring Boot / Node.js)
│   └── LEIAME.md                 # Guia de integração para o backend
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
