# Atende Core — Design System v2

## Atende OS

> **Princípio central:** o Atende Core não deve parecer um painel
> administrativo. Deve parecer uma ferramenta operacional de alto
> desempenho para uma equipa que precisa saber, decidir e agir
> rapidamente.

**Direção:** Linear + Attio + Intercom + Raycast, reinterpretados para o
fluxo do Atende Core.

------------------------------------------------------------------------

## 1. Visão do produto

O Atende Core é uma central de atendimento e vendas orientada por
conversas, fila, clientes e ações.

A interface deve responder rapidamente:

1.  **Quem precisa de atenção?**
2.  **O que aconteceu?**
3.  **O que devo fazer agora?**
4.  **Quem é responsável?**
5.  **Qual é o próximo passo?**

### Personalidade visual

- Minimalista
- Precisa
- Profissional
- Humana
- Rápida
- Silenciosamente sofisticada
- Densa quando necessário
- Sem decoração sem função

### Anti-princípios

Não queremos dashboards cheios de cards gigantes, gradientes
decorativos, excesso de sombras, bordas grossas, muitas cores, botões
gigantes, ícones sem função, tabelas pesadas, telas com espaço vazio ou
aparência de template administrativo genérico.

------------------------------------------------------------------------

## 2. Inspirações

### Linear — precisão e densidade

Absorver: - densidade controlada; - hierarquia tipográfica forte; -
interface orientada a teclado; - navegação compacta; - estados sutis; -
sensação de ferramenta profissional.

Não copiar a identidade visual ou o layout literal.

### Attio — CRM como instrumento de dados

Absorver: - visual limpo; - dados como protagonista; - tipografia
precisa; - bordas discretas; - tabelas e registros compactos; - sensação
premium sem decoração.

Attio é uma referência útil porque combina espaço visual limpo com alta
densidade de informação. citeturn0search3turn0search11

### Intercom — contexto da conversa

Absorver: - inbox como workspace; - navegação + conversas + contexto; -
painéis independentes; - possibilidade de esconder/reduzir painéis; -
atalhos; - ações próximas da conversa.

O Inbox do Intercom trabalha com navegação, lista de conversas e
detalhes do cliente, incluindo layouts recolhíveis e atalhos de teclado.
citeturn0search0turn0search4

### Raycast — comando e velocidade

Absorver: - busca global; - command palette; - ações por teclado; -
interface limpa; - redução de navegação desnecessária.

------------------------------------------------------------------------

# 3. Conceito visual: Atende OS

O Atende OS deve parecer uma **mesa de operações moderna**.

Não é apenas “um dashboard onde existem várias páginas”. É um ambiente
onde a equipa trabalha.

A interface deve privilegiar:

**estado + contexto + ação**

------------------------------------------------------------------------

# 4. Princípios de UX

## Uma tela, uma pergunta principal

**Fila:** Quem precisa de atenção agora?

**Inbox:** Qual conversa devo tratar?

**Pipeline:** Onde estão os negócios e qual é o próximo movimento?

**Follow-ups:** O que ficou pendente?

**Dashboard:** Como a operação está funcionando?

Evitar várias perguntas concorrentes no topo da mesma tela.

## Progressive disclosure

Mostrar primeiro o essencial.

Exemplo:

``` text
ALTA
João Manuel
"Boa tarde, ainda não recebi o orçamento..."
aguardando há 14 min
```

Ao abrir:

``` text
Por que está alta?
• cliente aguardando resposta
• última interação há 14 min
• prioridade manual
• oportunidade aberta
```

A informação técnica aparece quando for necessária, não ocupa a tela
inteira.

## Ação perto do contexto

Ações frequentes devem estar próximas do objeto:

- responder;
- atribuir;
- marcar prioridade;
- criar follow-up;
- mover no pipeline;
- adicionar nota;
- fechar.

## Menos navegação, mais continuidade

A pessoa deve conseguir trabalhar por longos períodos sem sair da tela
principal.

------------------------------------------------------------------------

# 5. Estrutura global

``` text
┌──────────────────────────────────────────────────────────────┐
│ Atende Core                         Busca       ⌘K    Avatar  │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  Fila        │                                               │
│  Inbox       │                 CONTEÚDO                      │
│  Pipeline    │                                               │
│  Follow-ups  │                                               │
│              │                                               │
│  ─────────   │                                               │
│  Dashboard   │                                               │
│  Automações  │                                               │
│              │                                               │
│  ─────────   │                                               │
│  Configurações│                                              │
└──────────────┴───────────────────────────────────────────────┘
```

### Sidebar

Desktop: - largura padrão: **224px** - compacta: **64px** - fundo
ligeiramente diferente do conteúdo; - ícones de 16–18px; - labels de
13–14px; - item ativo com fundo sutil.

A sidebar não deve competir com o conteúdo.

------------------------------------------------------------------------

# 6. Layout do Inbox

O Inbox será o principal modelo estrutural do produto.

``` text
┌──────────┬──────────────────────┬────────────────────────────┐
│ Navegação│ Conversas            │ Conversa                   │
│          │                      │                            │
│ Fila     │ João Manuel          │ João Manuel                │
│ Inbox    │ Maria                │                            │
│ Pipeline │ +244...              │ mensagens                  │
│          │                      │                            │
│          │                      │                            │
└──────────┴──────────────────────┴────────────────────────────┘

                           ┌──────────────────────┐
                           │ Contexto do cliente  │
                           │ CRM / tags / ações   │
                           └──────────────────────┘
```

No modo desktop completo: - painel de navegação; - painel de
conversas; - conversa ativa; - contexto do cliente.

Os painéis podem ser recolhidos conforme a tarefa. Essa lógica é
consistente com o Inbox do Intercom. citeturn0search0turn0search18

------------------------------------------------------------------------

# 7. A Fila — coração do Atende Core

A tela atual da Fila deve ser redesenhada.

### Antes

``` text
#1 Joao Teste
+4 aguardando há 14min
+5 prioridade manual NORMAL
9 pts
```

O sistema está mostrando a lógica interna antes do significado
operacional.

### Depois

``` text
┌──────────────────────────────────────────────────────────────┐
│ Fila                                      12 aguardando      │
│ Quem precisa de atenção agora?                               │
│                                                              │
│ [Todas] [Minhas] [Alta] [Sem responsável]     Buscar        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  JM  João Manuel                              ALTA           │
│      "Boa tarde, ainda não recebi..."                        │
│      aguardando há 14 min                 Carlos             │
│                                                              │
│  MA  Maria                                    NORMAL         │
│      "Pode enviar o catálogo?"                               │
│      aguardando há 7 min                  Sem responsável    │
└──────────────────────────────────────────────────────────────┘
```

### Regra

**Pontuação não é a informação principal.**

Se existir score:

``` text
ALTA · por quê?
```

Ao clicar:

``` text
Prioridade calculada

+4  aguardando resposta
+3  tempo de espera
+2  oportunidade ativa

Total: 9
```

A complexidade fica disponível sem poluir a fila.

------------------------------------------------------------------------

# 8. Design tokens

## Cores — Light

``` css
--background: #F7F7F5;
--surface: #FFFFFF;
--surface-subtle: #F2F2EF;

--border: #E5E5E1;
--border-strong: #D4D4CF;

--text-primary: #171717;
--text-secondary: #666666;
--text-tertiary: #8A8A8A;
--text-disabled: #A8A8A8;

--accent: #2563EB;
--accent-hover: #1D4ED8;
--accent-soft: #EFF6FF;
```

## Cores — Dark

``` css
--background: #101010;
--surface: #161616;
--surface-subtle: #1C1C1C;

--border: #292929;
--border-strong: #383838;

--text-primary: #F5F5F5;
--text-secondary: #A3A3A3;
--text-tertiary: #737373;
--text-disabled: #525252;

--accent: #5B8CFF;
--accent-hover: #78A1FF;
--accent-soft: #17213A;
```

### Regra de cor

A interface deve funcionar quase toda em:

**neutros + uma cor de ação.**

Cores semânticas são exceções:

``` text
success → verde
warning → âmbar
danger  → vermelho
info    → azul
```

Não usar cores semânticas como decoração.

------------------------------------------------------------------------

# 9. Tipografia

## Fonte principal

**Inter**

Uso: - navegação; - corpo; - botões; - tabelas; - inputs; - labels.

## Fonte de dados

Opcional: **Geist Mono** ou **IBM Plex Mono**

Usar apenas para: - IDs; - códigos; - números técnicos; - timestamps
específicos; - dados de sistema.

### Escala

| Token      | Tamanho | Peso | Uso                      |
|------------|--------:|-----:|--------------------------|
| display    |    32px |  600 | títulos principais raros |
| heading-lg |    24px |  600 | páginas                  |
| heading-md |    18px |  600 | seções                   |
| title      |    15px |  600 | entidades                |
| body       |    14px |  400 | conteúdo                 |
| body-sm    |    13px |  400 | metadados                |
| label      |    12px |  500 | labels                   |
| micro      |    11px |  500 | informação auxiliar      |

Evitar títulos enormes. O produto é uma ferramenta operacional, não uma
landing page.

------------------------------------------------------------------------

# 10. Espaçamento

Base:

``` text
4
8
12
16
20
24
32
40
48
64
```

Uso: - 4px — micro ajuste; - 8px — icon + texto; - 12px — elementos
compactos; - 16px — padding padrão; - 20px — grupos; - 24px — seções; -
32px — blocos; - 40px+ — separação de áreas.

O objetivo é criar **ritmo**, não espaço vazio.

------------------------------------------------------------------------

# 11. Bordas e profundidade

## Bordas

Preferir:

``` css
1px solid var(--border)
```

Nunca usar bordas grossas como decoração.

## Radius

``` text
sm = 6px
md = 8px
lg = 10px
xl = 12px
```

Elementos operacionais: **6–8px**

Superfícies maiores: **10–12px**

## Sombras

Sombras devem ser raras.

Usar principalmente em: - dropdown; - command palette; - modal; -
popover; - menu flutuante.

O conteúdo principal deve parecer quase plano.

------------------------------------------------------------------------

# 12. Botões

## Primary

``` text
[ Criar follow-up ]
```

Uso: ação principal, confirmação e criação.

## Secondary

``` text
[ Atribuir ]
```

Uso: ações importantes secundárias.

## Ghost

``` text
[ ⋯ ]
```

Uso: ações contextuais e toolbar.

## Destructive

Somente para ações que realmente removem ou encerram algo.

------------------------------------------------------------------------

# 13. Inputs

``` text
┌────────────────────────────────────┐
│ Buscar cliente...             ⌘ K  │
└────────────────────────────────────┘
```

Características: - altura 36–40px; - borda discreta; - foco com
accent; - placeholder secundário; - sem sombras internas.

------------------------------------------------------------------------

# 14. Command Palette

Atalho:

``` text
⌘ K
Ctrl K
```

Ações:

``` text
Buscar João
Abrir conversa
Criar follow-up
Atribuir conversa
Alterar prioridade
Mover negócio
Adicionar nota
Abrir cliente
Ir para Pipeline
Ir para Fila
```

A ideia de command-first e atalhos é consistente com ferramentas
modernas de inbox. citeturn0search4turn0search8

------------------------------------------------------------------------

# 15. Avatar

Tamanhos:

``` text
20px — tabela
28px — lista
32px — conversa
40px — perfil
48px — detalhes
```

Se não houver foto: - iniciais; - fundo neutro; - texto contrastante.

------------------------------------------------------------------------

# 16. Status e prioridade

Evitar badges enormes.

``` text
ALTA
NORMAL
BAIXA
```

Visual: - texto pequeno; - fundo muito sutil; - borda opcional; - cor
semântica apenas quando necessário.

Exemplo:

``` text
ALTA · aguardando 14 min
```

------------------------------------------------------------------------

# 17. Conversation row

``` text
┌──────────────────────────────────────────────┐
│ JM  João Manuel                         14m │
│     Boa tarde, ainda não recebi...           │
│     ALTA                         Carlos      │
└──────────────────────────────────────────────┘
```

Hierarquia: 1. nome; 2. última mensagem; 3. tempo; 4. prioridade; 5.
responsável.

------------------------------------------------------------------------

# 18. Conversation view

Header:

``` text
←  João Manuel                 ALTA
   +244 900 000 000
                         Atribuir   ⋯
```

Mensagens: - bolhas discretas; - timestamps pequenos; - separadores de
data; - sem excesso de cor; - foco no conteúdo.

Composer:

``` text
┌──────────────────────────────────────────────┐
│ Escrever mensagem...                         │
│                                              │
│ +  /  Anexar       Resposta rápida     Enviar│
└──────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 19. Context panel

``` text
João Manuel

Cliente
────────────────────
Telefone
+244 900 000 000

Responsável
Carlos

Prioridade
Alta

Tags
[Orçamento] [VIP]

Pipeline
Proposta

────────────────────
Próximo follow-up
Hoje · 15:30
```

Seções devem poder ser recolhidas.

------------------------------------------------------------------------

# 20. CRM

O CRM deve seguir uma lógica de **registro**, não de card decorativo.

``` text
João Manuel
Cliente

Contato
+244 ...

Empresa
Empresa X

Última interação
Hoje, 10:42

Pipeline
Proposta

Atividade
────────────────────
10:42 João respondeu
09:51 Carlos enviou orçamento
Ontem Follow-up criado
```

------------------------------------------------------------------------

# 21. Pipeline

``` text
┌────────────┬────────────┬────────────┬────────────┐
│ NOVO       │ CONTATO    │ PROPOSTA   │ FECHAMENTO │
│ 8          │ 5          │ 3          │ 2          │
├────────────┼────────────┼────────────┼────────────┤
│ João       │ Maria      │ Empresa X  │ Loja Y     │
│ +244...    │ +244...    │ 1.2M       │ 800k       │
│ Pedro      │ José       │ Cliente Z  │             │
└────────────┴────────────┴────────────┴────────────┘
```

Cards compactos. Evitar imagens grandes, gradientes, excesso de
informação e sombras fortes.

------------------------------------------------------------------------

# 22. Dashboard

Dashboard não deve ser uma coleção de 12 cards.

Estrutura:

``` text
Hoje

Conversas
142

Tempo médio
8m

Pendentes
23

Conversão
18%
```

Depois:

``` text
Atividade da equipa
────────────────────────────

volume
│
│       ╭──╮
│   ╭───╯  ╰──╮
│───╯         ╰───
└────────────────────
```

Depois:

``` text
Precisa de atenção

23 conversas sem resposta
8 follow-ups atrasados
4 negócios parados
```

A pergunta operacional vem antes da análise detalhada.

------------------------------------------------------------------------

# 23. Tabelas

``` text
Cliente             Status       Responsável     Última interação
────────────────────────────────────────────────────────────────
João Manuel         Ativo        Carlos          14 min
Maria Silva         Proposta     Ana             32 min
Empresa X           Novo         João            1 h
```

Regras: - linhas 44–52px; - header 32–36px; - números alinhados; - ações
aparecem no hover; - seleção clara; - zebra striping não é obrigatório.

------------------------------------------------------------------------

# 24. Navegação

### Principal

``` text
Fila
Inbox
Pipeline
Follow-ups
```

### Gestão

``` text
Dashboard
Automações
```

### Sistema

``` text
Configurações
```

A navegação deve refletir frequência e importância, não a estrutura
interna do backend.

------------------------------------------------------------------------

# 25. Responsividade

### Desktop

Prioridade máxima.

### Tablet

- sidebar reduzida;
- contexto pode virar drawer;
- lista e conversa continuam utilizáveis.

### Mobile

Não tentar reproduzir 4 colunas.

Fluxo:

``` text
Fila
↓
Conversa
↓
Contexto
```

------------------------------------------------------------------------

# 26. Motion

Motion deve comunicar estado.

``` text
fast    100ms
normal  160ms
slow    220ms
```

Usar para abrir painéis, dropdowns, seleção, hover, toast e mudança de
estado.

Não usar animações decorativas contínuas, bounce ou grandes transições.

------------------------------------------------------------------------

# 27. Feedback

### Success

``` text
✓ Follow-up criado
```

### Error

``` text
Não foi possível atribuir a conversa.
Tente novamente.
```

### Loading

Preferir skeleton discreto ou atualização progressiva.

Evitar spinner ocupando a tela inteira.

------------------------------------------------------------------------

# 28. Empty states

Nunca:

``` text
Nenhum dado encontrado.
```

Preferir:

``` text
Tudo limpo.

Não existem conversas aguardando atenção.
```

Com ação quando fizer sentido:

``` text
Tudo limpo.

Não existem follow-ups para hoje.

[ Ver todos os follow-ups ]
```

------------------------------------------------------------------------

# 29. Atalhos

### Global

``` text
⌘ / Ctrl + K   Command palette
⌘ / Ctrl + /   Busca
Esc             Fechar overlay
```

### Inbox

``` text
J   próxima conversa
K   conversa anterior
R   responder
A   atribuir
F   follow-up
E   encerrar
```

Os atalhos devem ser descobríveis e nunca obrigatórios.

------------------------------------------------------------------------

# 30. Arquitetura de componentes

``` text
ui/
├── primitives/
│   ├── Button
│   ├── Input
│   ├── Badge
│   ├── Avatar
│   ├── Tooltip
│   ├── Popover
│   └── Dialog
│
├── navigation/
│   ├── Sidebar
│   ├── CommandPalette
│   └── Breadcrumbs
│
├── inbox/
│   ├── ConversationList
│   ├── ConversationRow
│   ├── ConversationView
│   ├── MessageBubble
│   ├── Composer
│   └── CustomerPanel
│
├── queue/
│   ├── QueueHeader
│   ├── QueueFilters
│   ├── QueueRow
│   ├── PriorityIndicator
│   └── QueueReason
│
├── crm/
│   ├── CustomerHeader
│   ├── CustomerDetails
│   ├── ActivityTimeline
│   └── CustomerTags
│
├── pipeline/
│   ├── PipelineBoard
│   ├── PipelineColumn
│   └── DealCard
│
└── feedback/
    ├── Toast
    ├── EmptyState
    ├── Skeleton
    └── ErrorState
```

------------------------------------------------------------------------

# 31. Regras de implementação

### Regra 1 — componentes reutilizáveis

Não criar:

``` text
ButtonFilaEspecial
```

Criar:

``` text
Button
```

com variantes:

``` text
variant="primary"
variant="secondary"
variant="ghost"
```

### Regra 2 — tokens antes de valores

Evitar:

``` css
margin: 17px;
```

Preferir:

``` css
margin: var(--space-4);
```

### Regra 3 — estados são parte do design

Todo componente interativo deve definir:

``` text
default
hover
focus
active
disabled
loading
error
selected
```

------------------------------------------------------------------------

# 32. Acessibilidade

- contraste adequado;
- foco sempre visível;
- navegação por teclado;
- áreas clicáveis confortáveis;
- labels claros;
- ícones com tooltip quando não houver texto;
- nunca depender somente de cor para comunicar estado.

------------------------------------------------------------------------

# 33. Conteúdo e microcopy

Tom:

**direto, humano e operacional.**

Preferir:

> “Atribuir a Carlos”

Em vez de:

> “Gerenciar responsável”

Preferir:

> “Criar follow-up”

Em vez de:

> “Adicionar atividade de acompanhamento”

Preferir:

> “Sem resposta há 14 min”

Em vez de:

> “Tempo decorrido desde a última interação”

------------------------------------------------------------------------

# 34. Regra de densidade

O Atende Core deve ser **compacto, mas não apertado**.

A interface deve aproveitar a área disponível sem criar sensação de
aperto.

------------------------------------------------------------------------

# 35. Regra de ouro

Antes de adicionar qualquer elemento:

> **Isso ajuda o operador a entender, decidir ou agir?**

Se não:

**não entra na interface.**

------------------------------------------------------------------------

# 36. Direção final

``` text
             ATENDE OS
                 │
       ┌─────────┼─────────┐
       │         │         │
    LINEAR     ATTIO   INTERCOM
       │         │         │
    precisão    CRM     conversa
       │         │         │
       └─────────┼─────────┘
                 │
              RAYCAST
                 │
              comando
```

Resultado desejado:

**uma interface minimalista, densa, humana e extremamente operacional.**

Não queremos que o utilizador pense:

> “Que dashboard bonito.”

Queremos que pense:

> **“Eu sei exatamente o que preciso fazer agora.”**

------------------------------------------------------------------------

## Referências utilizadas

- Intercom — Inbox e personalização
- Intercom — Inbox explicado
- Intercom — princípios de produto
- Attio — referência visual e CRM
- Linear — referência de precisão e densidade
- Raycast — referência de command-first UX
