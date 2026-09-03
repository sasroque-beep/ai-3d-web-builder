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
