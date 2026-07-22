# 📄 LEIAME — EcoWatch AI (Resumo do Projeto)

## 📌 Visão Geral
O **EcoWatch AI** é uma plataforma de monitoramento ambiental inteligente desenvolvida com **Angular 18** e **Inteligência Artificial (Gemma AI)**, focada na centralização e simplificação de dados climáticos e ambientais para municípios brasileiros.

---

## 🚀 O que foi Implementado

### 1. Frontend (Angular 18 - Standalone Architecture)
- **Design System & UI**:
  - Estilo moderno com **Glassmorphism**, bordas arredondadas e sombras suaves.
  - **Tailwind CSS (CDN)** para utilitários de estilização.
  - **Lucide Icons** e fonte **Poppins (Google Fonts)**.

- **Navegação & Layout Base**:
  - `SidebarComponent`: Barra lateral reativa com atalhos para todas as áreas e status da IA.
  - `HeaderComponent`: Busca por município, seletor de localização e notificações.

- **Módulos e Telas (Features)**:
  1. **Dashboard**: Exibe os 9 indicadores ambientais fundamentais (Temperatura, Umidade, Chuva, Vento, AQI, UV, Rios, Queimadas e Vegetação), além do painel da IA Gemma e recomendações.
  2. **Mapa Interativo (Drill-Down)**: Mapa com **Leaflet.js** que permite navegar de **Brasil ➔ Estado ➔ Município** baixando malhas em GeoJSON diretamente da **API do IBGE (v3)**, com breadcrumb de navegação, botão voltar, cache em memória e painel lateral reativo.
  3. **Assistente Gemma AI**: Chatbot interativo em linguagem natural com sugestões de perguntas ambientais.
  4. **Relatórios Automáticos**: Estrutura em 5 seções (Resumo, Alterações, Riscos, Recomendações e Tendências) com opção de exportação.
  5. **Sistema de Alertas**: Monitoramento de limites críticos (temperatura, umidade, qualidade do ar) e ajuste de parâmetros.
  6. **Configurações**: Visualização das fontes de dados integradas.

- **Arquitetura de Dados & Estado**:
  - Uso de **Angular Signals** (`signal()`) para gerenciamento de estado reativo.
  - `EnvironmentService`: Gerencia indicadores e alertas.
  - `GemmaAiService`: Gerencia histórico de chat e relatórios.
  - `MapService`: Gerencia requisições da API de malhas geográficas do IBGE e cache em memória.
  - `environment.model.ts`: Interfaces TypeScript padronizadas para backend.

---

## 🛠️ Tecnologias Utilizadas

| Componente | Tecnologia |
|---|---|
| **Framework Frontend** | Angular 18 (Standalone Components) |
| **Estilização** | CSS3 + Tailwind CSS (via CDN) |
| **Mapas & Geodados** | Leaflet.js + API de Malhas do IBGE (v3 - GeoJSON) |
| **Ícones & Tipografia** | Lucide Icons + Google Fonts (Poppins) |
| **Gráficos** | Chart.js |
| **Gerenciamento de Estado** | Angular Signals |

---

## 🔌 Guia para o Backend (`/backend`)

A pasta `/backend` está pronta para receber a API (ex: Spring Boot ou Node.js). O frontend espera os seguintes endpoints REST para alimentar os Signals:

- `GET /api/indicadores?municipio={nome}` ➔ Retorna os 9 indicadores ambientais.
- `GET /api/alertas?municipio={nome}` ➔ Retorna a lista de alertas ativos.
- `POST /api/gemma/chat` ➔ Processa perguntas em linguagem natural e retorna respostas da IA Gemma.
- `POST /api/gemma/relatorio` ➔ Gera o relatório estruturado em 5 seções.
