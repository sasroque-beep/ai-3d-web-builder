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
