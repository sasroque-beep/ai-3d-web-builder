# AGENTS.md

# 🤖 Instruções para Agentes de IA

Este arquivo contém as regras obrigatórias para qualquer agente de IA que trabalhe neste projeto.

Antes de realizar qualquer alteração, o agente deve ler este arquivo e compreender o contexto do projeto.

---

# 🎯 1. Objetivo do projeto

O projeto tem como objetivo criar uma plataforma de Inteligência Artificial capaz de desenvolver sites 3D de alta conversão para empresas.

O sistema deve transformar o site em uma ferramenta estratégica de marketing, e não apenas em uma página institucional.

A plataforma deve considerar:

- Presença digital.
- Estratégia.
- Jornada de compra.
- Copywriting.
- Experiência do usuário.
- Conversão.
- Geração de leads.
- Marketing.
- Analytics.
- Otimização.

---

# 💡 2. Princípio central

Não criar apenas sites visualmente bonitos.

Criar experiências digitais orientadas a:

- Clareza.
- Confiança.
- Desejo.
- Ação.
- Conversão.

O 3D é uma ferramenta.

A conversão é o objetivo.

Não utilizar 3D apenas porque é tecnicamente possível.

---

# 🛒 3. Jornada de compra

Quando aplicável, a experiência deve considerar:

Descoberta
↓
Consideração
↓
Decisão
↓
Conversão
↓
Pós-conversão

Cada página deve possuir um objetivo claro.

---

# 📋 4. GitHub Issues

Toda tarefa relevante deve possuir uma Issue.

Tipos:

- Bug.
- Feature.
- Improvement.
- Technical Task.
- Refactor.
- Security.
- Performance.
- Documentation.

Antes de criar uma Issue:

1. Procurar Issues existentes.
2. Evitar duplicidade.
3. Definir objetivo.
4. Definir critérios de aceite.

---

# 🌿 5. Branches

Nunca desenvolver diretamente na `main`.

Branches devem estar relacionadas às Issues.

Exemplos:

feature/27-login-google

fix/31-whatsapp-form

improvement/42-hero-section

refactor/50-component-system

---

# 💻 6. Desenvolvimento

Antes de modificar código:

1. Ler este arquivo.
2. Ler documentação relevante.
3. Analisar a arquitetura.
4. Analisar o código existente.
5. Identificar componentes reutilizáveis.
6. Identificar testes existentes.
7. Avaliar impactos.

Não reescrever código sem necessidade.

Não duplicar funcionalidades existentes.

---

# 🔀 7. Pull Requests

Toda alteração relevante deve passar por Pull Request.

O PR deve obrigatoriamente referenciar a Issue.

Exemplo:

Closes #27

O fluxo é:

Issue
↓
Branch
↓
Código
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

---

# 🧪 8. Testes

Quando aplicável utilizar:

- Unit tests.
- Integration tests.
- End-to-end tests.
- Playwright.
- Codecov.
- Mutation testing.

Correções de bugs devem procurar incluir testes de regressão.

---

# 🎨 9. UI/UX

Utilizar como referência:

https://github.com/Kylezantos/design-principles

Interfaces devem considerar:

- Skeleton.
- Loading.
- Empty states.
- Error states.
- Success states.
- Progress.
- Lazy loading.
- Smooth animations.
- Microinterações.
- Acessibilidade.

---

# ✨ 10. Motion

Animações devem melhorar a experiência.

Considerar:

- Entrada.
- Saída.
- Loading.
- Progresso.
- Feedback.
- Transições.

Respeitar:

prefers-reduced-motion

---

# 🧊 11. 3D

O 3D deve aumentar:

- Percepção de valor.
- Diferenciação.
- Engajamento.
- Compreensão.
- Experiência.

Nunca sacrificar:

- Performance.
- Acessibilidade.
- Conversão.
- Mobile.

---

# ⚡ 12. Performance

Priorizar:

- Lazy loading.
- Code splitting.
- Otimização de imagens.
- Otimização de assets 3D.
- Redução de JavaScript.
- Core Web Vitals.

---

# 📊 13. Observabilidade

Avaliar:

- OpenTelemetry.
- Sentry.
- Datadog.
- New Relic.

A escolha deve considerar a stack e a necessidade real.

Nunca registrar:

- Senhas.
- Tokens.
- API keys.
- Secrets.
- Credenciais.

---

# 🧹 14. Qualidade

Avaliar quando compatível:

- Biome.
- Commitlint.
- Knip.
- Stryker.
- Codecov.
- Playwright.

Não instalar ferramentas redundantes.

Antes de instalar qualquer ferramenta:

1. Analisar a stack.
2. Verificar o que já existe.
3. Avaliar compatibilidade.
4. Avaliar custo.
5. Justificar a necessidade.

---

# 📝 15. Commits

Utilizar Conventional Commits.

Exemplos:

feat: adicionar integração WhatsApp

fix: corrigir formulário

refactor: reorganizar componentes

test: adicionar testes

docs: atualizar documentação

chore: atualizar dependências

---

# 🚀 16. Deploy

Deploy deve possuir rastreabilidade.

Fluxo:

Issue
↓
Branch
↓
Desenvolvimento
↓
Testes
↓
Pull Request
↓
Review
↓
Merge
↓
CI/CD
↓
Deploy
↓
Validação

---

# 🚫 17. Nunca fazer

O agente não deve:

- Alterar diretamente a main.
- Ignorar testes.
- Expor secrets.
- Criar funcionalidades fora da Issue.
- Instalar ferramentas sem análise.
- Reescrever arquitetura sem necessidade.
- Criar código duplicado.
- Fazer alterações não relacionadas à tarefa.

---

# 🧠 18. Regra de decisão

Não assumir.

Não inventar.

Não modificar arquitetura sem compreender o impacto.

Quando houver dúvida relevante:

1. Analisar o código.
2. Consultar documentação.
3. Verificar dependências.
4. Explicar a decisão.
5. Solicitar aprovação quando necessário.

---

# ✅ 19. Definição de pronto

Uma tarefa somente está concluída quando:

- Issue atendida.
- Critérios de aceite atendidos.
- Código implementado.
- Testes executados.
- Quality gates aprovados.
- Pull Request criado.
- Issue referenciada.
- Review realizado.
- Merge realizado.
- Deploy realizado quando aplicável.
- Sistema validado.
