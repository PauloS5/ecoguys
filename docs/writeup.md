## Declaração do Problema

O Brasil possui uma das maiores redes de monitoramento ambiental do mundo. INMET, CPTEC/INPE, MapBiomas, IBGE e dezenas de APIs municipais produzem dados valiosos todos os dias — mas, na prática, essas informações chegam à população de forma fragmentada, técnica e difícil de interpretar.

Um professor de escola pública no Acre não consegue explicar aos alunos por que o índice UV da semana importa. Um gestor municipal recebe planilhas de focos de queimadas sem contexto sobre o que fazer com elas. Uma comunidade ribeirinha vê o nível do rio subir, mas não entende se aquilo representa risco imediato ou apenas variação sazonal.

O problema não é falta de dados. É falta de **tradução**: ninguém transforma números em orientações que qualquer pessoa consiga entender e usar.

---

## Solução Geral

O **EcoWatch AI** nasceu para preencher exatamente esse vazio. É uma plataforma web que centraliza indicadores ambientais de municípios brasileiros — com foco inicial na região amazônica — e usa o modelo **Gemma** para interpretar esses dados em linguagem natural.

Em vez de mostrar apenas gráficos e tabelas, o sistema explica o que está acontecendo, aponta tendências e sugere ações concretas. Um gestor gera um relatório semanal em PDF com cinco seções estruturadas. Um cidadão pergunta ao assistente: *"Existe risco de queimadas na minha região?"* e recebe uma resposta fundamentada nos indicadores reais daquele município.

Veja um exemplo concreto do que o Gemma produz a partir de dados brutos:

| Dados recebidos | Análise do Gemma |
|---|---|
| Temperatura: 38°C · Umidade: 22% · Qualidade do ar: Moderada · UV: Muito Alto | *"A combinação de alta temperatura e baixa umidade aumenta significativamente o risco de queimadas. Recomenda-se evitar atividades que possam gerar focos de incêndio e intensificar o monitoramento das áreas de vegetação."* |

Nosso público inclui comunidades locais, escolas, universidades, ONGs, prefeituras, Defesa Civil e qualquer cidadão interessado em sustentabilidade — pessoas que precisam de informação ambiental clara, não de relatórios técnicos inacessíveis.

---

## Arquitetura do Projeto

O EcoWatch AI foi construído em camadas, separando coleta de dados, inferência de IA e apresentação visual. Essa divisão nos permitiu evoluir cada parte de forma independente sem comprometer a experiência do usuário.

```
┌──────────────────────────────────────────────────────────┐
│              FRONT-END (Angular 18 + TypeScript)         │
│  Dashboard · Mapa · Assistente · Relatórios · Alertas   │
│  Signals · Leaflet.js · Chart.js · Tailwind CSS         │
└─────────────────────────┬────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼────────────────────────────────┐
│         BACK-END (Python + biblioteca OpenAI)            │
│  Agregação de APIs · Cache · Regras de alerta · Gemma     │
└──────────┬──────────────────────────┬────────────────────┘
           │                          │
┌──────────▼──────────┐    ┌──────────▼───────────────────┐
│  APIs Públicas      │    │  Gemma (via OpenAI SDK)      │
│  INMET · INPE       │    │  Chat · Relatórios · Resumos │
│  OpenWeather · IBGE │    │  Recomendações contextuais   │
└─────────────────────┘    └──────────────────────────────┘

```

### Front-end em Angular 18

O front-end foi construído em **Angular 18** com Standalone Components e **Angular Signals** para gerenciamento de estado reativo. Três serviços centralizam a lógica da interface: `EnvironmentService` (indicadores e alertas), `GemmaAiService` (histórico de chat e relatórios) e `MapService` (malhas geográficas do IBGE com cache em memória).

A aplicação possui seis telas com rotas lazy-loaded: **dashboard**, **mapa**, **assistente**, **relatórios**, **alertas** e **configurações**. O design segue um sistema visual com glassmorphism, ícones Lucide e tipografia Poppins. Cada tela consome endpoints REST expostos pelo backend Python e renderiza os dados de forma clara e responsiva.

O front-end exibe **nove indicadores ambientais** por município: temperatura, umidade relativa, precipitação, velocidade do vento, qualidade do ar (AQI), índice UV, nível de rios, focos de queimadas e cobertura vegetal. Todos seguem o schema unificado `EnvironmentalIndicator` — valor, unidade, status (`normal`, `warning`, `critical`) e categoria — definido em TypeScript e espelhado no backend.

A integração geográfica com o IBGE já funciona de ponta a ponta no front-end: o mapa interativo com **Leaflet.js** permite navegar em três níveis — **Brasil → Estado → Município** — com malhas GeoJSON reais da API IBGE v3, breadcrumb de navegação, cache local e painel lateral reativo ao município selecionado.

### Back-end em Python

O backend foi desenvolvido em **Python puro**, responsável por agregar dados de múltiplas fontes públicas — INMET, CPTEC/INPE, OpenWeather, MapBiomas — e normalizá-los antes de servir ao front-end ou enviar ao modelo. A **biblioteca OpenAI** é usada no backend para se comunicar com o Gemma de forma padronizada, mantendo toda a lógica de inferência fora da interface.

O backend expõe endpoints REST consumidos pelo Angular:

- `GET /api/indicadores?municipio={nome}` — retorna os 9 indicadores ambientais
- `GET /api/alertas?municipio={nome}` — retorna alertas ativos
- `POST /api/gemma/chat` — processa perguntas em linguagem natural
- `POST /api/gemma/relatorio` — gera relatório estruturado em 5 seções

---

## Uso dos Modelos Gemma

O Gemma **não coleta dados ambientais**. Sua função é exclusivamente interpretar os indicadores que o backend Python já agregou. Utilizamos o modelo em quatro fluxos complementares, todos orquestrados no backend via **biblioteca OpenAI**:

### 1. Assistente conversacional

O usuário faz perguntas em português sobre condições ambientais, riscos e conceitos técnicos. Antes de cada requisição, o backend monta um prompt com o contexto completo do município selecionado — indicadores atuais, alertas ativos e histórico recente — e envia ao Gemma. A interface oferece sugestões de perguntas para reduzir a barreira de entrada:

- *"Como está a qualidade do ar hoje?"*
- *"Existe risco de queimadas nesta região?"*
- *"O que significa um índice UV alto?"*
- *"Faça um resumo ambiental desta semana."*

### 2. Resumo inteligente no dashboard

Um card de destaque no painel principal exibe a análise automática da situação ambiental do município. Em vez de ler nove cards numéricos separados, o usuário vê um parágrafo acionável gerado pelo Gemma — por exemplo, alertando sobre risco de queimada ou recomendando hidratação em dias de baixa umidade.

### 3. Relatórios automáticos em cinco seções

O Gemma gera relatórios estruturados exportáveis em PDF, organizados em:

1. **Resumo das Condições** — síntese dos dados coletados no período
2. **Alterações Observadas** — mudanças e anomalias detectadas
3. **Possíveis Riscos** — ameaças ambientais identificadas na região
4. **Recomendações** — orientações preventivas para a população
5. **Tendências** — evolução esperada dos indicadores

Cada seção é parseada a partir de um schema JSON (`AutomaticReport`) antes de ser exibida ou exportada.

### 4. Recomendações contextuais

Um painel lateral do dashboard recebe sugestões personalizadas com base nos limiares configurados no módulo de alertas — como evitar exposição solar prolongada quando o UV está alto ou intensificar monitoramento de vegetação quando umidade e temperatura indicam risco de incêndio.

### Estratégia de prompting e grounding

Para evitar alucinações em um domínio onde respostas imprecisas podem colocar vidas em risco, adotamos três regras rígidas:

- **System prompt fixo:** o Gemma atua como especialista ambiental focado no Brasil e na Amazônia, com tom acessível e baseado exclusivamente nos dados fornecidos.
- **Context injection obrigatório:** indicadores em JSON, alertas ativos, município e período são injetados a cada requisição — o modelo nunca inventa valores ausentes.
- **Transparência sobre lacunas:** quando um indicador está indisponível, o sistema informa explicitamente em vez de inferir.

---

## Desafios Superados

### Dados heterogêneos de múltiplas fontes

APIs ambientais brasileiras usam formatos, granularidades e frequências de atualização completamente diferentes. Padronizamos todos os indicadores no modelo `EnvironmentalIndicator` — com campos unificados de valor, unidade, status e categoria — para que o Gemma receba sempre o mesmo schema, independentemente da fonte original.

### Grounding em alertas críticos

Em monitoramento ambiental, uma resposta inventada pode ser perigosa. Por isso implementamos a regra de que o Gemma só responde com base nos indicadores presentes no prompt. Se um dado não está disponível, a resposta deixa isso claro — nunca preenche lacunas com suposições.

### Mapa com drill-down geográfico real

Integrar a navegação Brasil → Estado → Município exigiu consumo da API IBGE v3, cache de GeoJSON em memória e sincronização entre o município selecionado no mapa e os indicadores exibidos no dashboard. Foi o módulo mais complexo de engenharia do projeto e hoje funciona com todos os 27 estados e mais de 5.500 municípios.

### Equilibrar densidade informacional e acessibilidade

Nove indicadores, um mapa interativo, um chat e relatórios numa única interface poderia intimidar usuários sem familiaridade com tecnologia. Resolvemos isso com prompts sugeridos no chat, cards de resumo gerados pelo Gemma e um design visual limpo com hierarquia clara de informações.

---

## Processo de Engenharia

O desenvolvimento seguiu cinco fases incrementais:

**Definição e escopo.** Documentamos o problema, o público-alvo e o papel do Gemma como camada de interpretação — não de coleta — antes de escrever qualquer linha de código.

**Front-end Angular.** Construímos a interface com Angular 18, Standalone Components e Signals. As seis telas — dashboard, mapa, assistente, relatórios, alertas e configurações — consomem a mesma API REST, garantindo consistência entre módulos.

**Integração geográfica.** Implementamos o mapa interativo com Leaflet.js e malhas reais do IBGE v3, breadcrumb de navegação e painel lateral reativo ao município selecionado.

**Backend Python e APIs ambientais.** Desenvolvemos os endpoints REST em Python para agregar INMET, OpenWeather e demais fontes, aplicar regras de alerta configuráveis e servir dados normalizados ao front-end.

**Integração Gemma via OpenAI SDK.** No backend Python, conectamos os quatro fluxos de IA (chat, resumo, relatórios e recomendações) com system prompts, context injection e parsing de respostas estruturadas no schema `AutomaticReport`.

| Camada | Tecnologia |
|---|---|
| Front-end | Angular 18, TypeScript, Tailwind CSS |
| Back-end | Python, biblioteca OpenAI |
| IA | Gemma |
| Mapas | Leaflet.js, API IBGE v3 |
| Gráficos | Chart.js |
| Estado reativo | Angular Signals |
| APIs ambientais | INMET, CPTEC/INPE, OpenWeather, MapBiomas |

---

## Impacto e Próximos Passos

O EcoWatch AI contribui para conscientização ambiental, prevenção de queimadas e desastres naturais, educação sobre sustentabilidade e apoio à gestão pública — democratizando informações que antes exigiam expertise técnica ou acesso a múltiplas plataformas dispersas.

Como evolução, planejamos previsão de riscos com modelos de aprendizado de máquina complementares ao Gemma, integração com imagens de satélite, comparação ambiental entre municípios e um aplicativo móvel para alertas em tempo real.

---

## Trilha Selecionada

**Main Track - Best Amazon Eco-hack**