# 🧪 Quality Assurance — AI 3D Web Builder

## Visão Geral

Este documento define os padrões de qualidade do projeto AI 3D Web Builder.

Nenhuma funcionalidade deve ser considerada concluída apenas porque o código foi escrito.

Uma tarefa somente pode ser considerada pronta quando os critérios de qualidade aplicáveis forem atendidos.

---

# 1. Princípio Principal

O fluxo obrigatório de desenvolvimento é:

Issue
↓
Branch
↓
Desenvolvimento
↓
Qualidade
↓
Testes
↓
Pull Request
↓
Review
↓
Merge
↓
Deploy
↓
Validação

---

# 2. Lint e Formatação

## Biome

O Biome será utilizado para ajudar a manter o código consistente.

Responsabilidades:

- Lint
- Formatação
- Detecção de problemas básicos

Todo código deve passar pelas verificações configuradas antes do Pull Request.

---

# 3. Type Safety

O projeto utiliza TypeScript.

Todo código novo deve passar por validação de tipos.

Problemas de tipagem não devem ser ignorados sem justificativa.

Evitar:

- any desnecessário
- Tipos duplicados
- Tipagem fraca
- Supressões desnecessárias

---

# 4. Commits

## Commitlint

As mensagens de commit devem seguir um padrão consistente.

Formato inicial:

type: description

Exemplos:

feat: add project creation

fix: resolve website loading error

docs: add database architecture

test: add project service tests

refactor: simplify editor state

---

# 5. Código Não Utilizado

## Knip

O projeto deve verificar periodicamente:

- Dependências não utilizadas
- Arquivos não utilizados
- Exports não utilizados
- Código potencialmente morto

Código e dependências desnecessárias devem ser removidos quando seguro.

---

# 6. Qualidade Arquitetural

A arquitetura do projeto deve ser protegida contra dependências incorretas.

O sistema deve evitar:

- Dependências circulares
- Importações entre camadas incompatíveis
- Acoplamento excessivo
- Acesso direto indevido entre módulos

Ferramentas de validação arquitetural poderão incluir:

- dependency-cruiser
- ArchUnitJS ou alternativa compatível

As regras arquiteturais devem evoluir junto com o projeto.

---

# 7. Testes Unitários

## Vitest

Testes unitários devem validar pequenas unidades do sistema.

Exemplos:

- Funções
- Regras de negócio
- Serviços
- Transformações de dados
- Validações

Os testes devem ser:

- Rápidos
- Independentes
- Repetíveis
- Claros

---

# 8. Testes de Integração

Testes de integração devem verificar se diferentes partes funcionam juntas.

Exemplos:

- API + Banco de Dados
- Formulário + Validação
- Serviço + Repositório
- Autenticação + Permissões

---

# 9. Testes End-to-End

## Playwright

O Playwright deve validar os fluxos importantes do usuário.

Exemplos:

```text
Login
   ↓
Criar Organização
   ↓
Criar Cliente
   ↓
Criar Projeto
   ↓
Criar Site
   ↓
Editar Site
   ↓
Salvar
   ↓
Publicar
```

> _Seção truncada no commit original. O conteúdo será finalizado em issue dedicada._

---

### Playwright na camada 3D (Issue #41)

O fluxo acima continua sendo a visão de produto. O que já está implementado é
o escopo da **Experiência 3D**: testes em navegador real de `experience-3d`,
que o Vitest + jsdom não consegue cobrir (sem WebGL, sem layout, sem rede real).

#### Justificativa da ferramenta (`AGENTS.md` §14)

1. **Stack.** Next 15 (SSR + hidratação), `dynamic(..., { ssr: false })`,
   `matchMedia` e WebGL. O comportamento a validar — modo `FULL_3D` /
   `REDUCED_3D` / `FALLBACK_2D`, `prefers-reduced-motion`, perda de contexto,
   code-splitting, HTML sem JavaScript — só existe num navegador real.
2. **O que já existe.** Vitest + jsdom, com R3F/Drei mockados; nenhuma
   ferramenta E2E; a validação da Issue #37 foi manual. `AGENTS.md`, `README.md`
   e `docs/DEVELOPMENT_WORKFLOW.md` já previam Playwright.
3. **Compatibilidade.** `@playwright/test` `^1.63.0`: Node ≥ 20 (o projeto usa 22),
   Apache-2.0, sem download de binários no `postinstall` (o `pnpm install
   --frozen-lockfile` não muda), TypeScript nativo, sobe o servidor de produção
   do Next (`webServer`) e roda no ubuntu-latest e no Windows. O `pnpm-lock.yaml`
   controla a versão do pacote e, com ela, a do navegador.
4. **Custo.** Uma devDependency (`playwright-core` ≈ 13 MB, fora do bundle e da
   produção); navegadores fora do repositório (`%LOCALAPPDATA%\ms-playwright`,
   `~/.cache/ms-playwright`; da ordem de centenas de MB na primeira instalação
   local, em cache na CI); um job de CI em paralelo (~1 min 50 s no total
   com cache frio, medido na CI: 19 s instalando o Chromium, 37 s de build e 34 s
   de testes).
5. **Necessidade e alternativas.** *Vitest Browser Mode* roda componentes em
   browser real, mas não cobre servidor de produção, SSR, HTML sem JS nem rede —
   e usaria Playwright como provider mesmo assim. *Cypress*: runner próprio, mais
   pesado, sem ganho aqui. *Puppeteer*: biblioteca, não framework de teste
   (auto-espera, asserções, gestão de servidor e trace teriam de ser
   reconstruídos). *Selenium/WebDriver*: infraestrutura mais pesada. *Manter
   manual*: não é repetível.

#### Decisões

- **Chromium é o único navegador obrigatório e o único executado na CI.**
  `playwright.config.ts` já declara Firefox e WebKit; habilitá-los é instalar o
  navegador e listá-lo em `E2E_BROWSERS` (`E2E_BROWSERS=chromium,firefox`). Eles
  **não foram validados**. Tudo que é específico de um motor fica em
  `e2e/support/`, nunca nos specs.
- **Sem regressão visual por screenshot.** WebGL por software, GPU e drivers
  tornam comparação de pixels frágil. Os testes são comportamentais: o estado
  (`data-experience-mode`), o DOM, a rede e a contagem de `requestAnimationFrame`
  (render contínuo × quadro estático). Screenshot e trace existem só como
  artefato de diagnóstico em falha.
- **`retries: 0`.** Um retry esconderia exatamente a instabilidade que a suíte
  precisa expor.
- **Um único worker, em qualquer ambiente.** Renderização WebGL por software é
  intensiva em CPU: com 2 workers numa máquina de 4 núcleos, 24 de 250 execuções
  (~10%) falharam, quase todas por timeout; com 1 worker, 10 repetições
  completas da suíte (250 execuções, `--repeat-each=10`, 5,8 min) passaram sem
  nenhuma falha. A suíte é pequena, então determinismo vale mais que velocidade.
- **WebGL por software (SwiftShader) em todo lugar**, também localmente, para o
  resultado ser o mesmo da CI. Um *probe* (`e2e/environment.spec.ts`) falha com
  mensagem clara se o navegador não oferece WebGL2, em vez de deixar 20 testes
  falharem de forma confusa.
- **Job `e2e` separado no `ci.yml`**, em paralelo ao `verify`, com build próprio.
  **Não é *required check* por enquanto**: primeiro uma janela de estabilidade
  (~10 execuções verdes no GitHub Actions); depois uma Issue própria avalia
  torná-lo obrigatório na proteção da `main`.

#### Como rodar

```bash
pnpm build                              # a suíte roda contra o build de produção
pnpm exec playwright install chromium   # uma vez por máquina/versão do Playwright
pnpm test:e2e
```

`pnpm test` (Vitest) continua rodando **só** os testes de unidade e integração
em `src/`. Se não houver build, a configuração falha com uma mensagem clara.

#### O que é coberto (`e2e/experience-3d/`)

| Requisito | Como é validado |
| --- | --- |
| Carregamento da 3D, `FULL_3D` | o fallback do servidor vira cena 3D; `<canvas>` com tamanho; contexto vivo; `<img>` com alt continua no DOM |
| `REDUCED_3D` | `prefers-reduced-motion` no primeiro load e alterado em runtime; dispositivo de baixa capacidade; render loop parado (0 frames) contra 60+ em `FULL_3D` |
| `FALLBACK_2D` / sem WebGL | `getContext` de WebGL devolve `null` (padrão da web, igual em qualquer navegador); a detecção rodou de fato antes de afirmar o resultado |
| Conteúdo e CTA | mesmos texto e CTA clicáveis em `FULL`, `REDUCED`, `FALLBACK` e sem WebGL; sem JavaScript o HTML do servidor já traz fallback, conteúdo e CTA |
| Falha em runtime | perda de contexto WebGL e falha do download do chunk voltam ao fallback; modo forçado sem WebGL não derruba a página |
| Lazy loading | nenhum chunk 3D no HTML inicial, nem em `/` e `/leads/new`, nem sem WebGL; baixado só depois da hidratação. Um chunk é "3D" se o código contém Three.js — sem depender de nomes com hash |
| Erros de console | todo teste falha em `pageerror`, `console.error` ou resposta HTTP ≥ 400 da própria origem. A exceção é declarada por teste, com motivo (`consoleGuard.allow`); a lista global (`KNOWN_BENIGN`) só recebe ruído reproduzível e justificado |

#### Limitações conhecidas

- Os testes usam a rota de validação `/dev/experience-3d-hero-showcase`, que hoje
  vai no build de produção (precedente da Issue #24). Se ela for protegida, a
  suíte precisará de outra fixture.
- Um bug real do runtime, encontrado por esta suíte, está registrado na
  Issue #42 e coberto por um `test.fixme` em `runtime-modes.spec.ts`; deve ser
  reativado quando a #42 for corrigida.
