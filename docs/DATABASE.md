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
