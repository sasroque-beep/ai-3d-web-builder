# 🗄️ Database Architecture — AI 3D Web Builder

## Visão Geral

Este documento define a arquitetura inicial de dados do AI 3D Web Builder.

O banco de dados deve permitir armazenar e organizar informações relacionadas a:

- Usuários
- Organizações
- Clientes
- Empresas
- Projetos
- Sites
- Páginas
- Seções
- Componentes
- Assets
- Experiências 3D
- Leads
- CRM
- Analytics
- IA
- Domínios
- Deployments

A modelagem deve permitir evolução incremental.

---

# 1. Visão Geral das Relações

A estrutura principal será:

```text
User
  ↓
Organization
  ↓
Client
  ↓
Project
  ↓
Website
  ↓
Page
  ↓
Section
  ↓
Component
```

> _Seção truncada no commit original. O conteúdo será finalizado em issue dedicada._

---

# 2. Persistência inicial (Issue #4)

O motor de banco de dados de produção ainda não foi decidido. Para viabilizar
o primeiro módulo de dados (cadastro de empresas/leads) sem antecipar essa
decisão, foi adotado um banco **SQLite local** (via `@libsql/client` +
Drizzle ORM), com schema e migrations versionados em
`src/server/db/`.

O acesso ao banco é isolado atrás de contratos de repositório (ex.:
`CompanyRepository` em `src/server/persistence/`), consumidos pelos módulos
de domínio. Isso mantém a troca futura de motor (ex.: PostgreSQL) restrita à
camada `server/db`, sem exigir mudanças em `modules/`, `ui/` ou `app/`.

---

# 3. Enriquecimento de dados (Issue #6)

A tabela `company_enrichment_fields` guarda, por empresa, um registro por
chave de informação conhecida (`field_key`: `tradeName`, `businessHours`,
`apparentAudience`, `differentiators`, `additionalInfo`), com `value`,
`source`, `status` (`confirmed` | `unverified` | `missing`) e `collected_at`.
Um índice único em `(company_id, field_key)` garante upsert (a última
atualização substitui a anterior; não há histórico versionado ainda).

Acesso isolado via `EnrichmentRepository` em
`src/server/persistence/enrichment-repository.ts`, consumido pelo módulo
`src/modules/research`. `source` é texto livre para já comportar, sem nova
migration, uma futura coleta automatizada (scraping/API pública).

---

# 4. Diagnóstico do negócio (Issue #8)

A tabela `company_diagnostics` guarda **um diagnóstico vigente por empresa**
(índice único em `company_id`, atualizado via upsert — sem histórico
versionado nesta primeira versão). Os campos cobrem resumo, nicho, proposta
de valor, diferenciais, pontos fortes/fracos, oportunidades, riscos/lacunas,
oportunidades de marketing/conversão, maturidade digital
(`digital_maturity`: `none` | `basic` | `intermediate` | `advanced`) e
recomendações iniciais. Os campos de lista (pontos fortes/fracos,
oportunidades, riscos, recomendações) são armazenados como texto livre
multilinha — um item por linha — e convertidos em lista apenas na
apresentação; estruturação mais avançada fica para uma issue futura.

Segmento, produtos/serviços, público-alvo e presença digital **não são
duplicados**: o diagnóstico reaproveita esses dados diretamente do cadastro
(`CompanyRecord`, Issue #4) em tempo de leitura. Pelo mesmo motivo, "dados
faltantes" não é uma coluna própria — é calculado a partir dos campos de
enriquecimento (Issue #6) que ainda não estão `confirmed`.

Um diagnóstico só pode ser criado/atualizado quando a empresa tem ao menos um
campo de enriquecimento com status `confirmed`; caso contrário, a operação é
recusada (dados básicos do cadastro — nome/segmento — já são obrigatórios
desde a Issue #4). Nenhuma informação ausente é inventada.

`generated_by` (`manual` | `ai`, default `manual`) reserva, sem exigir nova
migration, a futura geração automática por um agente/modelo de IA — nesta
issue todo diagnóstico é preenchido manualmente pelo operador.

Acesso isolado via `DiagnosisRepository` em
`src/server/persistence/diagnosis-repository.ts`, consumido pelo módulo
`src/modules/research/diagnosis`.

---

# 5. Estratégia de marketing e conversão (Issue #10)

A tabela `company_strategies` guarda **uma estratégia vigente por empresa**
(índice único em `company_id`, atualizada via upsert — sem histórico
versionado nesta primeira versão, mesmo padrão de `company_diagnostics`).

Os campos cobrem objetivo de marketing, objetivo de conversão, público-alvo,
dores, desejos, proposta de valor, diferenciais, objeções, argumentos de
venda, tom de comunicação, oferta principal, ações de conversão desejadas e
CTAs. Os campos de lista (dores, desejos, objeções, argumentos de venda,
ações de conversão, CTAs) seguem a mesma convenção da Issue #8: texto livre
multilinha, um item por linha, convertido em lista apenas na apresentação.

`público-alvo`, `proposta de valor` e `diferenciais` já existem em níveis
anteriores (`companies.target_audience` e `company_diagnostics.value_proposition`
/ `differentiators`), mas a estratégia mantém seus próprios campos: o
conteúdo aqui é a versão voltada à comunicação de marketing e conversão
(o que embasa copy, CTAs e argumentos de venda), não uma cópia do dado de
diagnóstico ou de cadastro. Os dados de cadastro e de diagnóstico continuam
sendo exibidos como contexto de leitura na tela de estratégia, sem
duplicação de fonte de verdade para os campos que **não** têm um
equivalente próprio aqui (segmento, produtos/serviços, presença digital,
resumo do negócio, pontos fortes/fracos, oportunidades, riscos, maturidade
digital e recomendações continuam vindo exclusivamente do cadastro e do
diagnóstico).

A jornada básica do cliente é representada por **cinco colunas fixas**
(`journey_discovery`, `journey_consideration`, `journey_decision`,
`journey_conversion`, `journey_post_conversion`), uma por etapa da jornada já
documentada em `AGENTS.md`/`README.md` (Descoberta → Consideração → Decisão
→ Conversão → Pós-conversão). Essa estrutura fixa — em vez de texto livre
multilinha — mantém os dados prontos para consumo por etapa pelos próximos
módulos (`site-builder`, `copy`), como pede a Issue #10.

Uma estratégia só pode ser criada/atualizada quando a empresa já possui um
diagnóstico estratégico vigente (Issue #8); caso contrário, a operação é
recusada. Isso mantém a cadeia de dependência da Issue #10: Empresa →
Enriquecimento → Diagnóstico → Estratégia → Planejamento do site.

`generated_by` (`manual` | `ai`, default `manual`) reserva, sem exigir nova
migration, a futura geração automática por um agente/modelo de IA — nesta
issue toda estratégia é preenchida manualmente pelo operador.

Acesso isolado via `StrategyRepository` em
`src/server/persistence/strategy-repository.ts`, consumido pelo módulo
`src/modules/strategy`.

---

# 6. Planejamento estratégico do site (Issue #12)

A tabela `company_site_plans` guarda **um planejamento vigente por
empresa** (índice único em `company_id`, atualizado via upsert — sem
histórico versionado nesta primeira versão, mesmo padrão de
`company_diagnostics`/`company_strategies`).

Os campos cobrem objetivo principal do site, objetivo principal de
conversão, público prioritário, proposta de valor aplicada ao site,
oferta/produto/serviço principal, CTA principal, CTAs secundários,
prioridades de comunicação, objeções que o site deverá responder, provas
sociais necessárias, elementos de confiança, funcionalidades necessárias,
integrações desejadas, requisitos de captação de leads, de contato, de
conversão, de conteúdo e visuais, oportunidades de experiência 3D, quais
etapas da jornada do cliente o site deverá apoiar e observações
estratégicas. Os campos de lista (CTAs secundários, prioridades de
comunicação, objeções, provas sociais, elementos de confiança,
funcionalidades, integrações, etapas da jornada) seguem a mesma convenção
das Issues #8/#10: texto livre multilinha, um item por linha, convertido
em lista apenas na apresentação.

O planejamento não duplica dados de cadastro, diagnóstico ou estratégia:
a tela reaproveita segmento, proposta de valor, oferta principal e
público-alvo diretamente de `CompanyRecord`/`StrategyRecord` em tempo de
leitura, como contexto de apoio ao preenchimento.

Um planejamento só pode ser criado/atualizado quando a empresa já possui
uma estratégia de marketing e conversão vigente (Issue #10); caso
contrário, a operação é recusada. Isso estende a cadeia de dependência
para: Empresa → Enriquecimento → Diagnóstico → Estratégia → Planejamento
do site → Arquitetura de páginas.

`generated_by` (`manual` | `ai`, default `manual`) reserva, sem exigir
nova migration, a futura geração automática por um agente/modelo de IA —
nesta issue todo planejamento é preenchido manualmente pelo operador.

Acesso isolado via `SitePlanRepository` em
`src/server/persistence/site-plan-repository.ts`, consumido pelo módulo
`src/modules/site-planning`. Os módulos futuros de arquitetura de
páginas, conteúdo, design e experiência 3D deverão consumir este
planejamento como entrada estruturada, em vez de reimplementar suas
próprias regras de elegibilidade ou reler diretamente `strategy`.

---

# 7. Arquitetura de páginas (Issue #14)

Diferente das tabelas anteriores (um registro vigente por empresa), a
arquitetura de páginas é a primeira estrutura genuinamente um-para-muitos:
uma empresa pode ter várias páginas, e cada página pode ter várias
seções, em quantidade livre.

A tabela `company_site_pages` guarda uma linha por página
(`id`, `company_id`, `slug`, `name`, `objective`, `journey_stage`
opcional — `discovery` | `consideration` | `decision` | `conversion` |
`post_conversion` —, `position`, `generated_by`, timestamps). Um índice
único composto em `(company_id, slug)` garante upsert: reenviar o mesmo
`slug` atualiza a página em vez de duplicá-la — mesmo padrão de
"múltiplos registros por empresa, chave definida pelo usuário" já
comprovado por `company_enrichment_fields` (Issue #6), com a diferença de
que ali a chave (`field_key`) vem de um enum fixo e aqui é escolhida
livremente pelo usuário (validada por um padrão de slug).

A tabela `company_site_page_sections` segue a mesma lógica um nível
abaixo: uma linha por seção (`id`, `page_id`, `section_key`, `name`,
`objective`, `cta_reference`, `position`, `generated_by`, timestamps),
com índice único composto em `(page_id, section_key)`. `cta_reference` é
texto livre (não uma FK) apontando para um dos CTAs já registrados no
planejamento estratégico do site (Issue #12) — evita duplicar dado
estruturado por uma referência que, neste estágio, é apenas descritiva.

`position` é obrigatório em ambas as tabelas; quando o formulário não
informa um valor, o serviço atribui automaticamente a próxima posição
disponível (total de registros existentes + 1). Não há reordenação via
arrastar-e-soltar nesta versão — para reordenar, o usuário reenvia o
mesmo `slug`/`section_key` com uma posição diferente.

Uma página só pode ser criada/atualizada quando a empresa já possui um
planejamento estratégico do site vigente (Issue #12); uma seção só pode
ser criada/atualizada quando a página informada existe. Nenhuma das duas
operações verifica novamente o planejamento na criação de uma seção — a
página já não existiria sem ter sido elegível quando criada. Isso
estende a cadeia de dependência para: Empresa → Enriquecimento →
Diagnóstico → Estratégia → Planejamento do site → Arquitetura de páginas
→ Conteúdo.

Assim como em todos os módulos anteriores, não há exclusão nesta versão
(apenas upsert) — mesmo nível de escopo de `crm`, `research`,
`diagnosis`, `strategy` e `site-planning`.

`generated_by` (`manual` | `ai`, default `manual`) reserva, sem exigir
nova migration, a futura geração automática por um agente/modelo de IA —
nesta issue toda página e seção é preenchida manualmente pelo operador.

Acesso isolado via `SitePageRepository` em
`src/server/persistence/site-page-repository.ts` e
`SitePageSectionRepository` em
`src/server/persistence/site-page-section-repository.ts`, consumidos
pelo módulo `src/modules/design`.

---

# 8. Conteúdo das seções (Issue #16)

Diferente das duas tabelas da Issue #14 (muitas por empresa/página,
chave composta escolhida pelo usuário), o conteúdo de uma seção volta ao
padrão mais simples já usado por `company_diagnostics`,
`company_strategies` e `company_site_plans`: **um bloco por seção**.

A tabela `company_site_page_section_copies` guarda uma linha por seção
(`id`, `section_id`, `headline`, `subheadline`, `body`, `cta_label`,
`social_proof_text`, `notes`, `generated_by`, timestamps), com índice
único em `section_id` — upsert: reenviar o mesmo `section_id` atualiza o
bloco de conteúdo em vez de duplicá-lo.

O conteúdo de uma seção só pode ser criado/atualizado quando a seção
correspondente já existe na arquitetura de páginas (Issue #14); não há
uma segunda checagem subindo até o planejamento estratégico ou a
empresa — a seção já não existiria sem a cadeia completa ter sido
elegível quando criada. Isso estende a cadeia de dependência para:
Empresa → Enriquecimento → Diagnóstico → Estratégia → Planejamento do
site → Arquitetura de páginas → Conteúdo.

Assim como em todos os módulos anteriores, não há exclusão nesta versão
(apenas upsert).

`generated_by` (`manual` | `ai`, default `manual`) reserva, sem exigir
nova migration, a futura geração automática por um agente/modelo de IA —
nesta issue todo conteúdo é preenchido manualmente pelo operador.

Acesso isolado via `SectionCopyRepository` em
`src/server/persistence/section-copy-repository.ts`, consumido pelo
módulo `src/modules/copy`.
