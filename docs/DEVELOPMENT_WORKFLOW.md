# 🔄 Development Workflow — AI 3D Web Builder

## Objetivo

Este documento define o processo oficial de desenvolvimento do projeto **AI 3D Web Builder**.

Todo desenvolvedor e todo agente de IA deve seguir este fluxo obrigatoriamente.

---

## Fluxo Oficial

Issue
↓
Branch
↓
Planejamento
↓
Desenvolvimento
↓
Testes
↓
Pull Request
↓
Code Review
↓
Merge
↓
Deploy
↓
Validação

---

## 1. Criar uma Issue

Toda tarefa deve começar por uma Issue.

Exemplos:

- Nova funcionalidade
- Bug
- Melhoria
- Refatoração
- SEO
- Performance
- Integração
- IA
- 3D

A Issue deve possuir:

- Objetivo
- Critérios de aceite
- Impacto esperado
- Prioridade

---

## 2. Criar uma Branch

Nunca desenvolver diretamente na branch `main`.

Padrões:

- `feature/numero-descricao`
- `fix/numero-descricao`
- `improvement/numero-descricao`
- `refactor/numero-descricao`
- `chore/numero-descricao`

---

## 3. Planejamento

Antes de escrever código:

- Ler `AGENTS.md`
- Ler a documentação da área
- Identificar impacto da mudança
- Identificar componentes reutilizáveis
- Identificar testes existentes

---

## 4. Desenvolvimento

Toda alteração deve permanecer dentro da branch da Issue.

As alterações devem ser pequenas, organizadas e reversíveis.

---

## 5. Testes

Executar, quando aplicável:

- Lint
- Typecheck
- Testes unitários
- Testes de integração
- Playwright
- Build
- Coverage

---

## 6. Pull Request

Todo Pull Request deve referenciar a Issue.

Exemplo:

Closes #12

O PR deve explicar:

- Problema
- Solução
- Arquivos alterados
- Testes executados
- Riscos
- Impacto no deploy

---

## 7. Merge

O Merge só acontece quando:

- Testes passaram
- Review aprovado
- Critérios de aceite atendidos

---

## 8. Deploy

O deploy deve acontecer pelo pipeline oficial.

Nunca alterar produção diretamente.

---

## 9. Validação

Após o deploy, verificar:

- Funcionalidade
- Performance
- Conversão
- Logs
- Erros
- Analytics

---

## Regra Principal

Código escrito não significa tarefa concluída.

Uma tarefa somente está pronta quando todo o fluxo acima foi concluído.
