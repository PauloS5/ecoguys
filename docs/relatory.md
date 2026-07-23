# Declaração do Problema

O Brasil possui uma das maiores infraestruturas de monitoramento ambiental do mundo. Instituições como INMET, CPTEC/INPE, IBGE, MapBiomas e outras organizações disponibilizam diariamente dados sobre clima, qualidade do ar, queimadas, recursos hídricos e cobertura vegetal. Entretanto, essas informações permanecem dispersas em diferentes plataformas, na maioria das vezes, são apresentadas em formato técnico, dificultando sua compreensão pela população.

Essa dificuldade afeta diferentes públicos. Professores encontram barreiras para transformar indicadores ambientais em conteúdo didático. Gestores municipais precisam interpretar grandes volumes de dados antes de tomar decisões. Comunidades locais acompanham mudanças ambientais sem conseguir avaliar seus impactos ou riscos reais.

O problema não é a falta de dados, mas a ausência de ferramentas capazes de transformá-los em informações acessíveis, contextualizadas e úteis para a tomada de decisão.

---

# Solução Geral

O **EcoWatch AI** é uma plataforma web desenvolvida para democratizar o acesso às informações ambientais de municípios brasileiros, com foco na região amazônica.

A plataforma integra indicadores de diferentes fontes, normaliza essas informações em um modelo único e utiliza o **Gemma 3 4B** para gerar interpretações em linguagem natural. Dados técnicos são convertidos em explicações claras, recomendações preventivas e análises compreensíveis para usuários com diferentes níveis de conhecimento.

Além da visualização dos indicadores ambientais, o sistema oferece quatro funcionalidades principais:

- assistente para consultas em linguagem natural;
- resumo inteligente das condições ambientais;
- recomendações preventivas baseadas nos indicadores coletados;
- geração automática de relatórios estruturados.

Quando o sistema identifica temperatura elevada, baixa umidade e índice UV intenso, o usuário não recebe apenas números. O Gemma interpreta essas condições e apresenta uma explicação contextualizada, indicando possíveis riscos de queimadas, orientações e prevenções.

EcoWatch AI aproxima informações ambientais da realidade de escolas, universidades, prefeituras, Defesa Civil, organizações não governamentais e da população em geral.

---

# Arquitetura do Projeto

O EcoWatch AI foi desenvolvido utilizando uma arquitetura em camadas, separando aquisição de dados, processamento, inteligência artificial e interface do usuário. Essa organização facilita a manutenção do sistema, permitindo evoluir cada componente de forma independente.

```text
┌─────────────────────────────────────────────────────────────┐
│              Front-end (Angular 18)                         │
│ Dashboard • Mapa • Assistente • Relatórios • Alertas        │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────┐
│                 Back-end (Python)                           │
│ Agregação de APIs • Normalização • Cache • Alertas          │
└───────────────┬───────────────────────┬─────────────────────┘
                │                       │
        APIs Ambientais          LM Studio + Gemma
        IBGE • OpenWeather       API compatível OpenAI
                                        │
                                      Ngrok
```

O backend atua como camada central da aplicação. Ele consulta diferentes APIs ambientais, normaliza todos os indicadores e disponibiliza essas informações para o frontend. Quando uma interpretação é necessária, o backend prepara um contexto contendo município, indicadores e alertas ativos, enviando-o ao Gemma.

A inteligência artificial é executada localmente por meio do **LM Studio**, enquanto o **Ngrok** disponibiliza uma API segura para comunicação entre a aplicação e o servidor de IA. Essa arquitetura reduz custos de infraestrutura, preserva a flexibilidade do sistema e permite substituir ou atualizar o modelo de linguagem sem alterações significativas na aplicação.

---

# Front-end e Back-end

O frontend foi desenvolvido em **Angular**, utilizando **Standalone Components** e **Angular Signals** para gerenciamento reativo de estado. A interface é composta pelos módulos de Dashboard, Mapa, Assistente, Relatórios, Alertas e Configurações, todos organizados com carregamento sob demanda

O mapa interativo utiliza **Leaflet.js** e as informações da API **IBGE v3**, permitindo navegação entre Brasil, estados e municípios. A seleção de um município atualiza automaticamente os indicadores, gráficos, alertas e análises apresentadas ao usuário.

O backend, desenvolvido em **Python**, concentra a lógica de integração do sistema. Além de consultar as APIs ambientais, ele normaliza os dados em um modelo único, gerencia cache, aplica regras de alerta e prepara o contexto enviado ao Gemma. Essa separação mantém a interface desacoplada da lógica de processamento e facilita futuras integrações com novas fontes de dados ou modelos de IA.

---

# Uso do Gemma

O **Gemma** é responsável por interpretar os indicadores ambientais processados pelo backend. Diferentemente das APIs utilizadas para coleta de dados, o modelo não realiza consultas externas nem produz estimativas próprias; sua função é transformar informações técnicas em análises claras, contextualizadas e acessíveis.

Antes de cada inferência, o backend reúne o contexto do município selecionado — incluindo indicadores ambientais, alertas ativos e período de referência — e envia essas informações ao modelo por meio de uma API compatível com o padrão OpenAI disponibilizada pelo **LM Studio**. Como o servidor de IA é executado localmente, utilizamos o **Ngrok** para permitir a comunicação segura entre a aplicação e o modelo.

---

## Assistente Conversacional

O assistente permite que o usuário faça perguntas em linguagem natural sobre as condições ambientais do município monitorado.

Em cada interação, o backend envia ao modelo apenas os indicadores disponíveis e o histórico necessário para manter o contexto da conversa. Com isso, o usuário pode compreender informações que normalmente exigiriam conhecimento técnico para interpretação.

Exemplos de consultas:

- Como está a qualidade do ar hoje?
- Existe risco de queimadas nesta região?
- O que significa um índice UV elevado?
- Faça um resumo ambiental desta semana.

---

## Resumo Inteligente

Em vez de analisar individualmente cada indicador, o usuário recebe uma síntese produzida pelo Gemma destacando tendências, possíveis riscos e recomendações preventivas. Esse resumo funciona como uma visão geral da situação ambiental do município e facilita a interpretação dos dados apresentados na interface.

---

## Relatórios Ambientais

O sistema também gera relatórios estruturados em PDF para apoiar organizações interessadas no acompanhamento ambiental. Seguindo uma estrutura padronizada em cinco sessões:

1. Resumo das Condições
2. Alterações Observadas
3. Possíveis Riscos
4. Recomendações
5. Tendências

As respostas produzidas pelo Gemma são convertidas para o modelo **AutomaticReport**, garantindo consistência na apresentação das informações e facilitando sua exportação.

---

## Recomendações Contextuais

Além das respostas do chat e dos relatórios, o Gemma gera recomendações personalizadas a partir dos indicadores ambientais coletados.

Quando determinados limites são atingidos, a plataforma pode orientar ações como intensificar o monitoramento de áreas suscetíveis a queimadas ou acompanhar a elevação do nível dos rios.

Dessa forma, o sistema transforma indicadores técnicos em orientações práticas que auxiliam tanto gestores públicos quanto a população.

---

# Estratégia de Prompting e Grounding

O EcoWatch AI trabalha com informações que podem apoiar decisões relacionadas ao meio ambiente, adotamos uma estratégia para garantir que todas as respostas sejam fundamentadas nos dados fornecidos pelo backend.

Cada requisição enviada ao Gemma inclui um *system prompt* definindo seu papel como especialista em monitoramento ambiental, além do município, indicadores, alertas e período. O modelo é instruído a responder com base nesse contexto.

Caso algum indicador esteja indisponível, o sistema informa explicitamente essa limitação em vez de gerar estimativas ou completar informações ausentes. Essa abordagem aumenta a confiabilidade das respostas e reduz significativamente a ocorrência de alucinações, tornando a IA uma camada de interpretação dos dados ambientais.

---

# Desafios Superados


O primeiro desafio foi padronizar informações provenientes de diferentes fontes públicas, como INMET, CPTEC/INPE, IBGE, OpenWeather e MapBiomas. Cada serviço utiliza formatos e frequências de atualização distintos. Para resolver esse problema, todos os dados são convertidos para um modelo unificado, garantindo consistência entre o backend, o frontend e o Gemma.

Outro ponto crítico foi garantir a confiabilidade das respostas da IA. Como o sistema pode apoiar decisões relacionadas à prevenção de queimadas e monitoramento ambiental, o Gemma nunca recebe liberdade para inferir valores inexistentes. Todas as respostas são fundamentadas exclusivamente nos indicadores fornecidos pelo backend. Quando alguma informação não está disponível, essa limitação é informada ao usuário.

Enfrentamos o desafio de integrar um mapa interativo utilizando GeoJSON da API IBGE v3. Para garantir boa performance, implementamos cache das geometrias e sincronização automática entre o mapa, os indicadores ambientais e os demais componentes da interface.

---

# Processo de Engenharia

O desenvolvimento do sistema foi dividido em cinco etapas:

1. **Planejamento:** definição do problema, público-alvo e arquitetura da solução.
2. **Desenvolvimento do Frontend:** construção da interface em Angular, implementação dos módulos da aplicação e integração do mapa interativo.
3. **Desenvolvimento do Backend:** criação da API em Python, integração das fontes de dados ambientais, normalização dos indicadores e sistema de alertas.
4. **Integração da IA:** configuração do Gemma no LM Studio, comunicação via API com OpenAI e implementação de chat, resumos, recomendações e relatórios.
5. **Validação:** testes de integração entre frontend, backend, servidor de IA e verificação da consistência dos indicadores apresentados ao usuário.

---

## Tecnologias Utilizadas

| Camada | Tecnologias |
|---|---|
| Front-end | Angular, TypeScript, TailwindCSS |
| Back-end | Python |
| Inteligência Artificial | Gemma |
| Servidor de IA | LM Studio |
| Comunicação com IA | API com OpenAI + Ngrok |
| Estado Reativo | Angular Signals |
| Mapas | Leaflet.js + API IBGE v3 |
| Gráficos | Chart.js |
| APIs Ambientais | IBGE e OpenWeather |

---

# Impacto

Ao centralizar diferentes fontes de dados e utilizar inteligência artificial para interpretá-las, a plataforma facilita a compreensão do cenário ambiental, incentiva a conscientização sobre sustentabilidade e contribui para ações preventivas relacionadas a queimadas, eventos climáticos e qualidade ambiental.