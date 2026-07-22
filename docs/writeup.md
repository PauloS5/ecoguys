# Declaração do Problema

O Brasil possui uma das maiores redes de monitoramento ambiental do mundo. Instituições como INMET, CPTEC/INPE, IBGE, MapBiomas e diversas APIs públicas produzem diariamente uma enorme quantidade de dados sobre clima, qualidade do ar, queimadas, recursos hídricos e cobertura vegetal.

Apesar dessa abundância de informações, a maior parte dos dados chega à população de forma fragmentada, altamente técnica e distribuída entre diferentes plataformas. Isso dificulta sua interpretação e reduz seu impacto na tomada de decisões.

Um professor de escola pública no Acre, por exemplo, pode ter dificuldade para explicar aos alunos por que um índice UV elevado representa um risco à saúde. Um gestor municipal recebe relatórios sobre focos de queimadas, mas nem sempre possui uma análise consolidada que facilite ações preventivas. Da mesma forma, comunidades ribeirinhas acompanham a elevação do nível dos rios sem compreender se aquela variação representa um comportamento sazonal ou um risco iminente.

O principal desafio não é coletar mais dados, mas transformá-los em informações claras, acessíveis e úteis para qualquer cidadão.

---

# Solução Geral

O **EcoWatch AI** foi desenvolvido para preencher essa lacuna por meio de uma plataforma web que centraliza indicadores ambientais de municípios brasileiros, com foco inicial na Amazônia Legal.

O sistema reúne dados provenientes de diferentes fontes públicas, normaliza essas informações em um único modelo e utiliza o **Gemma 3 4B** para interpretar os indicadores em linguagem natural, permitindo que qualquer pessoa compreenda rapidamente a situação ambiental da região monitorada.

Em vez de apresentar apenas gráficos e tabelas, a plataforma explica tendências, identifica riscos e fornece recomendações contextualizadas. Entre suas funcionalidades estão:

- assistente conversacional em linguagem natural;
- resumo inteligente do cenário ambiental;
- recomendações preventivas baseadas nos indicadores;
- geração automática de relatórios estruturados em PDF.

Exemplo de interpretação realizada pela IA:

| Dados coletados | Interpretação do Gemma |
|---|---|
| Temperatura: **38°C** • Umidade: **22%** • Qualidade do ar: **Moderada** • UV: **Muito Alto** | *"A combinação entre temperatura elevada e baixa umidade aumenta significativamente o risco de queimadas. Recomenda-se evitar atividades que possam iniciar focos de incêndio, reforçar o monitoramento de áreas de vegetação e reduzir a exposição prolongada ao sol."* |

O EcoWatch AI foi pensado para atender diferentes públicos, incluindo escolas, universidades, comunidades locais, Defesa Civil, prefeituras, ONGs e cidadãos interessados em compreender melhor as condições ambientais de seu município.

---

# Arquitetura do Projeto

A arquitetura do EcoWatch AI foi organizada em camadas independentes, separando coleta de dados, processamento, inteligência artificial e interface do usuário. Essa divisão facilita a evolução de cada componente sem impactar os demais módulos.

```text
┌────────────────────────────────────────────────────────────────────┐
│            FRONT-END (Angular 18 + TypeScript)                     │
│ Dashboard • Mapa • Assistente • Relatórios • Alertas               │
│ Angular Signals • Leaflet.js • Chart.js • Tailwind CSS             │
└───────────────────────────────┬────────────────────────────────────┘
                                │ REST API
┌───────────────────────────────▼────────────────────────────────────┐
│                     BACK-END (Python)                              │
│ Agregação de APIs • Cache • Regras de Alerta • Normalização        │
│ Integração com IA • Geração de Contexto                            │
└───────────────┬──────────────────────────────┬─────────────────────┘
                │                              │
                │                              │
      ┌─────────▼─────────┐          ┌─────────▼────────────────────┐
      │ APIs Ambientais   │          │ Servidor Local de IA         │
      │                   │          │ LM Studio                    │
      │ INMET             │          │ Gemma 3 4B                   │
      │ CPTEC / INPE      │          │ API OpenAI Compatible        │
      │ OpenWeather       │          └─────────────┬────────────────┘
      │ IBGE              │                        │
      │ MapBiomas         │                      Ngrok
      └───────────────────┘                    
```

Os dados ambientais são coletados pelo backend Python, que consulta diferentes APIs públicas, aplica regras de validação, normaliza os indicadores e disponibiliza essas informações para o frontend.

Quando uma análise textual é necessária, o backend envia os indicadores ao servidor local do **Gemma 3 4B**, hospedado no **LM Studio**. A comunicação ocorre por meio de uma API compatível com o padrão OpenAI, exposta externamente através do **Ngrok**, permitindo o acesso seguro da aplicação sem necessidade de infraestrutura com GPU em nuvem.

Essa arquitetura reduz custos operacionais, preserva a flexibilidade da solução e permite substituir ou atualizar o modelo de IA sem alterações significativas na aplicação.

---

# Front-end em Angular 18

O frontend foi desenvolvido utilizando **Angular 18**, **Standalone Components** e **Angular Signals**, garantindo uma arquitetura moderna, modular e reativa.

Toda a lógica da interface é centralizada em três serviços principais:

- **EnvironmentService**, responsável pelos indicadores ambientais e alertas;
- **GemmaAiService**, responsável pelo assistente conversacional e geração de relatórios;
- **MapService**, responsável pelo carregamento das malhas geográficas do IBGE e gerenciamento de cache.

A aplicação é composta por seis módulos carregados por *lazy loading*:

- Dashboard
- Mapa
- Assistente
- Relatórios
- Alertas
- Configurações

A interface utiliza Tailwind CSS, Lucide Icons e a fonte Poppins, seguindo um design responsivo baseado em glassmorphism.

O dashboard apresenta nove indicadores ambientais padronizados:

- temperatura;
- umidade relativa;
- precipitação;
- velocidade do vento;
- qualidade do ar (AQI);
- índice UV;
- nível dos rios;
- focos de queimadas;
- cobertura vegetal.

Todos utilizam o modelo unificado **EnvironmentalIndicator**, compartilhado entre frontend e backend, garantindo consistência entre os dados exibidos e processados pela IA.

Outro destaque da aplicação é o mapa interativo desenvolvido com **Leaflet.js** e a API GeoJSON do **IBGE v3**, permitindo navegação hierárquica em três níveis:

**Brasil → Estado → Município**

A seleção de um município atualiza automaticamente os indicadores, alertas e análises exibidas no restante da plataforma.

---

# Back-end em Python

O backend foi desenvolvido em **Python** e atua como camada de integração entre as APIs ambientais, o frontend e o servidor de inteligência artificial.

Suas principais responsabilidades incluem:

- agregação de dados provenientes de múltiplas fontes;
- normalização dos indicadores ambientais;
- gerenciamento de cache;
- aplicação de regras de alerta;
- preparação do contexto enviado ao Gemma.

O sistema consulta fontes como **INMET**, **CPTEC/INPE**, **IBGE**, **OpenWeather** e **MapBiomas**, convertendo todas as informações para um formato único antes de disponibilizá-las para a aplicação.

Sempre que uma interpretação em linguagem natural é solicitada, o backend envia os indicadores ao servidor local do **Gemma 3 4B**, executado pelo **LM Studio** e acessado através de uma API compatível com o padrão OpenAI.

Os principais endpoints disponibilizados são:

- `GET /api/indicadores?municipio={nome}`
- `GET /api/alertas?municipio={nome}`
- `POST /api/gemma/chat`
- `POST /api/gemma/relatorio`

Essa separação entre processamento dos dados ambientais e inferência da IA torna a arquitetura mais escalável, facilita futuras integrações e mantém toda a lógica de negócio desacoplada da interface.

---

# Uso do Gemma 3 4B

O **Gemma 3 4B** atua exclusivamente como camada de interpretação dos indicadores ambientais. Toda a coleta, validação e normalização dos dados é realizada pelo backend Python antes de qualquer interação com o modelo.

A inferência é executada localmente por meio do **LM Studio**, que disponibiliza uma API compatível com o padrão OpenAI. Para permitir que a aplicação acesse o modelo de forma segura, utilizamos um túnel criado pelo **Ngrok**, eliminando a necessidade de infraestrutura em nuvem com GPU dedicada.

Essa arquitetura garante baixo custo operacional, maior controle sobre os dados processados e flexibilidade para futuras atualizações do modelo.

O Gemma participa de quatro fluxos principais da plataforma.

---

## 1. Assistente Conversacional

O assistente permite que usuários façam perguntas em linguagem natural sobre condições ambientais, riscos e conceitos relacionados ao município selecionado.

Antes de cada requisição, o backend monta automaticamente um contexto contendo:

- município selecionado;
- indicadores ambientais atuais;
- alertas ativos;
- período de referência;
- histórico recente da conversa.

Com esse contexto, o Gemma responde apenas utilizando informações disponíveis, oferecendo explicações acessíveis mesmo para usuários sem conhecimento técnico.

Entre as perguntas sugeridas pela interface estão:

- *Como está a qualidade do ar hoje?*
- *Existe risco de queimadas nesta região?*
- *O que significa um índice UV muito alto?*
- *Faça um resumo ambiental desta semana.*

---

## 2. Resumo Inteligente

O dashboard apresenta um resumo automático da situação ambiental do município.

Em vez de interpretar individualmente todos os indicadores disponíveis, o usuário recebe uma análise textual consolidada destacando as condições atuais, possíveis riscos e recomendações preventivas.

Esse resumo funciona como uma visão geral da região monitorada, facilitando a compreensão rápida do cenário ambiental.

---

## 3. Relatórios Automáticos

O sistema gera relatórios estruturados em PDF utilizando informações consolidadas pelo backend e interpretadas pelo Gemma.

Os relatórios seguem sempre a mesma estrutura:

1. **Resumo das Condições**
2. **Alterações Observadas**
3. **Possíveis Riscos**
4. **Recomendações**
5. **Tendências**

As respostas produzidas pelo modelo são convertidas para o schema **AutomaticReport**, permitindo sua exibição na interface e posterior exportação para PDF de forma padronizada.

---

## 4. Recomendações Contextuais

Além do chat e dos relatórios, o Gemma gera recomendações preventivas exibidas diretamente no dashboard.

Essas orientações são produzidas a partir da combinação entre os indicadores ambientais e as regras configuradas no sistema de alertas.

Alguns exemplos incluem:

- reduzir exposição ao sol durante períodos de índice UV elevado;
- reforçar o monitoramento de áreas de vegetação em condições favoráveis a queimadas;
- manter hidratação adequada durante períodos de baixa umidade;
- acompanhar o nível dos rios quando houver tendência de elevação.

O objetivo é transformar dados técnicos em ações práticas para a população.

---

# Estratégia de Prompting e Grounding

Como o sistema lida com informações que podem influenciar decisões relacionadas à segurança ambiental, adotamos uma estratégia de **Grounded AI**, garantindo que todas as respostas sejam fundamentadas exclusivamente nos dados fornecidos pelo backend.

Nossa estratégia é baseada em três princípios.

### System Prompt

O modelo recebe um papel fixo de especialista em monitoramento ambiental do Brasil, utilizando linguagem simples, objetiva e voltada ao contexto amazônico.

### Context Injection

Cada requisição inclui automaticamente:

- município;
- período analisado;
- indicadores ambientais;
- alertas ativos;
- contexto da conversa.

Dessa forma, o modelo nunca precisa inferir valores inexistentes.

### Transparência

Quando determinado indicador não está disponível, o sistema informa explicitamente sua ausência em vez de gerar estimativas ou preencher lacunas com informações inventadas.

Essa abordagem reduz significativamente o risco de alucinações e aumenta a confiabilidade das respostas apresentadas ao usuário.

---

# Desafios Superados

Durante o desenvolvimento do EcoWatch AI enfrentamos desafios relacionados à integração de dados ambientais, confiabilidade das respostas da IA e usabilidade da plataforma.

## Integração de múltiplas fontes de dados

Os indicadores utilizados são provenientes de diferentes serviços públicos, como INMET, CPTEC/INPE, IBGE, OpenWeather e MapBiomas. Cada fonte possui formatos, frequências de atualização e estruturas distintas.

Para garantir consistência, todos os dados são convertidos para um modelo unificado (**EnvironmentalIndicator**), padronizando valor, unidade, categoria e nível de criticidade antes de serem disponibilizados ao frontend ou enviados ao Gemma.

---

## Respostas confiáveis da IA

Em monitoramento ambiental, respostas incorretas podem levar a interpretações equivocadas sobre riscos à população.

Para minimizar esse problema, o Gemma nunca consulta diretamente APIs externas nem gera informações por conta própria. Toda inferência é baseada exclusivamente nos indicadores preparados pelo backend, utilizando uma estratégia de *grounding* que impede a criação de valores inexistentes.

Quando algum indicador está indisponível, o sistema informa explicitamente essa limitação ao usuário.

---

## Navegação geográfica

Outro desafio foi integrar as malhas GeoJSON da API IBGE v3 para construir um mapa interativo em três níveis:

**Brasil → Estado → Município**

Foi implementado um sistema de cache local para reduzir requisições repetidas e garantir que a seleção de um município atualize automaticamente indicadores, alertas, gráficos e análises exibidas na plataforma.

---

## Acessibilidade da informação

Grande parte das plataformas ambientais apresenta apenas gráficos e tabelas técnicas.

No EcoWatch AI buscamos transformar esses dados em informações compreensíveis por qualquer pessoa. Para isso combinamos:

- indicadores organizados em cards;
- resumos automáticos gerados pelo Gemma;
- recomendações contextuais;
- assistente conversacional;
- interface limpa e responsiva.

Essa abordagem reduz a barreira de acesso às informações ambientais sem comprometer a qualidade técnica dos dados apresentados.

---

# Processo de Engenharia

O desenvolvimento foi realizado de forma incremental, permitindo validar cada módulo antes da integração completa da plataforma.

### 1. Definição do problema

Inicialmente foi realizado o levantamento do problema, definição do público-alvo e especificação do papel da inteligência artificial, estabelecendo que o Gemma atuaria apenas como camada de interpretação dos dados ambientais.

---

### 2. Desenvolvimento da interface

A aplicação foi construída utilizando Angular 18, Standalone Components e Angular Signals, organizando a plataforma em seis módulos independentes:

- Dashboard
- Mapa
- Assistente
- Relatórios
- Alertas
- Configurações

Essa divisão tornou a aplicação mais modular e facilitou a manutenção do projeto.

---

### 3. Integração geográfica

Em seguida foi implementado o mapa interativo utilizando Leaflet.js e as malhas GeoJSON do IBGE v3, permitindo navegação hierárquica entre Brasil, estados e municípios.

Esse módulo passou a servir como ponto central para atualização dos indicadores ambientais em toda a aplicação.

---

### 4. Backend e integração de dados

O backend em Python foi desenvolvido para centralizar a comunicação com as APIs ambientais, normalizar os indicadores, aplicar regras de alerta e disponibilizar os dados para o frontend.

Além disso, ele também prepara o contexto utilizado pelo Gemma durante as análises em linguagem natural.

---

### 5. Integração da Inteligência Artificial

Na etapa final foi integrado o servidor local do **Gemma 3 4B**, executado por meio do **LM Studio** e acessado através de uma API compatível com OpenAI.

Foram implementados os quatro fluxos principais de IA da plataforma:

- assistente conversacional;
- resumo inteligente;
- relatórios automáticos;
- recomendações contextuais.

Todos utilizam estratégias de *prompt engineering* e *grounding* para garantir respostas consistentes e alinhadas aos indicadores ambientais.

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Front-end | Angular 18, TypeScript, Tailwind CSS |
| Back-end | Python |
| Inteligência Artificial | Gemma 3 4B |
| Servidor de IA | LM Studio |
| Exposição da API | Ngrok |
| Estado Reativo | Angular Signals |
| Mapas | Leaflet.js + API IBGE v3 |
| Gráficos | Chart.js |
| APIs Ambientais | INMET, CPTEC/INPE, IBGE, OpenWeather e MapBiomas |

---

# Impacto e Próximos Passos

O EcoWatch AI busca democratizar o acesso às informações ambientais, transformando indicadores técnicos em conhecimento acessível para cidadãos, escolas, gestores públicos e organizações da sociedade civil.

Ao centralizar diferentes fontes de dados e utilizar inteligência artificial para interpretá-las, a plataforma contribui para:

- conscientização ambiental;
- prevenção de queimadas;
- apoio à Defesa Civil;
- educação sobre sustentabilidade;
- tomada de decisão baseada em dados.

Como evolução do projeto, pretendemos incorporar:

- modelos preditivos para antecipação de riscos ambientais;
- integração com imagens de satélite;
- comparação histórica entre municípios;
- notificações em tempo real;
- aplicativo móvel para acesso aos alertas.

Essas funcionalidades ampliarão a capacidade da plataforma de apoiar ações preventivas e fortalecer o monitoramento ambiental em municípios brasileiros.

---

# Trilha Selecionada

**Main Track – Best Amazon Eco-hack**