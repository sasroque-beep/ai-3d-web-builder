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
