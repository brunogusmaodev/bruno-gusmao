# Bruno Gusmão — Portfólio Fullstack

Portfólio pessoal com painel administrativo completo. Monorepo **pnpm workspaces + Turborepo** para o frontend, com backend em **Spring Boot (Java)**, frontend Next.js 16 App Router, autenticação Google OAuth2 + JWT em cookie httpOnly, Kanban e Todos em tempo real com WebSocket e drag-and-drop.

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Técnica](#stack-técnica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Rodando o Projeto](#rodando-o-projeto)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Rotas da API](#rotas-da-api)
- [Documentação Swagger](#documentação-swagger)
- [WebSocket](#websocket)
- [Deploy](#deploy)

---

## Sobre o Projeto

Este repositório é um monorepo que reúne a API REST e o site do portfólio. O objetivo é ter um lugar centralizado para apresentar projetos e artigos, com um painel administrativo para gerenciar todo o conteúdo sem depender de serviços externos de CMS.

O backend ativo é **`apps/api-java`** (Spring Boot). O repositório também contém **`apps/api`** (NestJS) — a implementação original do backend — **desativada**: não faz parte do fluxo de deploy nem é consumida pelo frontend, mantida só como referência histórica. Ver [`docs/java-migration/`](./docs/java-migration/) para as specs completas de cada módulo e as notas de paridade entre as duas implementações.

O design segue uma estética terminal/hacker: tipografia monospace, animações de digitação e uma paleta dark com acentos em verde-lima (`#bef264`).

---

## Funcionalidades

### Área Pública
- Página inicial com animação de grid e apresentação pessoal
- Página Sobre com seções de perfil, experiências e contato
- Página de Contato
- Página de Projetos com card em destaque e grid paginado
- Blog com card em destaque, grid paginado e página de leitura por slug
- Leitura estimada e formatação de data em português no blog
- Badges coloridos com cor de fundo e texto configuráveis
- Popup de divulgação de evento, configurável pelo painel

### Painel Administrativo (`/ControlPanel`)
- **Dashboard** — contagem de projetos, posts, badges e tarefas kanban
- **Projetos** — CRUD completo, toggle de visibilidade pública, status kanban
- **Posts** — CRUD completo com campo de conteúdo Markdown, toggle de visibilidade
- **Badges** — CRUD com seletor de cor, preview ao vivo do badge
- **Kanban** — board em tempo real com drag-and-drop; tarefas independentes dos projetos/posts
  - 4 colunas: Backlog · To Do · In Progress · Done
  - 3 tipos de tarefa: Blog, Projeto, Custom (cor livre)
  - Sincronização via WebSocket entre múltiplas abas
- **Todos** — lista de tarefas em duas abas: **Meus** (privadas, só o dono vê/edita) e **Compartilhados** (qualquer usuário autenticado do painel vê/edita)
  - Sincronização via WebSocket entre múltiplas abas
- **Evento** — configuração do popup de divulgação (ativar/desativar, textos, imagem, cores)

---

## Stack Técnica

### Backend — `apps/api-java`
| Tecnologia | Descrição |
|---|---|
| Spring Boot 4.1 (Java 21) | Framework principal |
| Spring Data JPA + Hibernate | ORM |
| Flyway | Migrations — rodam automaticamente no boot da aplicação |
| Spring Security (OAuth2 Client + Resource Server) | Login via Google OAuth2, sessão como JWT (HS256) em cookie httpOnly |
| Spring WebSocket | Handlers nativos (`/ws/kanban`, `/ws/todos`), sem STOMP |
| springdoc-openapi | Documentação OpenAPI 3 / Swagger UI |
| Driver PostgreSQL (JDBC) | Banco próprio, separado do que `apps/api` usava |
| Maven (`./mvnw`) | Build — projeto autocontido, fora do workspace pnpm |

### Frontend — `apps/web`
| Tecnologia | Descrição |
|---|---|
| Next.js 16 | App Router, Server Components |
| React 19 | UI |
| Tailwind CSS v4 | Utility-first CSS |
| @base-ui/react | Primitivos UI acessíveis (Dialog, Switch, Tabs, etc.) |
| shadcn/ui | Componentes prontos (Sidebar, Table, Pagination, Card) |
| next-themes | Provider de tema (atualmente fixo em dark) |
| @hello-pangea/dnd | Drag-and-drop para o Kanban |
| magicui | Componentes animados (AnimatedGridPattern, ShineBorder) |

---

## Pré-requisitos

- Node.js >= 20
- pnpm >= 10
- JDK 21 (Maven não precisa ser instalado à parte — o projeto usa o wrapper `./mvnw`)
- PostgreSQL (local ou remoto)
- Credenciais Google OAuth2 (para login)

---

## Instalação

```bash
# Clonar o repositório
git clone <url-do-repo>
cd bruno-gusmao

# Instalar dependências do workspace pnpm (frontend)
pnpm install
```

`apps/api-java` não faz parte do workspace pnpm — não precisa de passo de instalação; o `./mvnw` resolve as dependências Maven automaticamente na primeira execução.

---

## Configuração

### API — `apps/api-java/.env`

O Spring Boot **não carrega `.env` sozinho** (diferente do Nest, que usava `dotenv`) — exporte as variáveis pro shell antes de rodar (ver [Rodando o Projeto](#rodando-o-projeto)), ou use `./scripts/vps-setup.sh`/Docker em produção, que já cuidam disso.

```env
PORT=3001

# Banco separado do que apps/api (Nest, desativado) usava.
DATABASE_URL=jdbc:postgresql://localhost:5432/bruno_gusmao_java
DATABASE_USERNAME=seu_usuario
DATABASE_PASSWORD=sua_senha

# JWT — gere com: openssl rand -base64 32
JWT_SECRET=seu-segredo-aqui
JWT_EXPIRATION_DAYS=7
JWT_COOKIE_NAME=access_token

# Google OAuth2 — console.cloud.google.com
# Redirect URI a cadastrar: http://localhost:3001/login/oauth2/code/google
GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Um ou mais e-mails separados por vírgula — só eles podem logar
ALLOWED_EMAILS=seu@email.com

# URL do frontend (CORS + redirect pós-login)
WEB_URL=http://localhost:3000
```

### Web — `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
API_URL=http://localhost:3001
```

### Banco de Dados

O Flyway aplica as migrations automaticamente no boot da aplicação — não há comando manual de `generate`/`migrate`. O único passo manual é criar o database (o Postgres não cria sozinho):

```bash
psql -h localhost -U seu_usuario -c "CREATE DATABASE bruno_gusmao_java;"
```

---

## Rodando o Projeto

```bash
# Terminal 1 — API (Spring Boot)
cd apps/api-java
set -a; source .env; set +a
./mvnw spring-boot:run

# Terminal 2 — Frontend
pnpm --filter web start:dev

# Build de produção (frontend)
pnpm --filter web build

# Verificar tipos TypeScript
pnpm typecheck
```

> **Não use `pnpm dev`/`pnpm build` na raiz sem filtro.** Esses scripts rodam via Turborepo em todos os workspaces pnpm, incluindo `apps/api` (Nest) — que está desativado e, se subir, entra em conflito de porta com `apps/api-java` (ambos usam 3001). Prefira sempre `pnpm --filter web <script>` para o frontend.

| App | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/docs |
| WebSocket Kanban | ws://localhost:3001/ws/kanban |
| WebSocket Todos | ws://localhost:3001/ws/todos |

---

## Estrutura de Pastas

```
.
├── apps/
│   ├── api-java/                   # Backend Spring Boot (ativo)
│   │   └── src/main/java/dev/brunogusmao/api/
│   │       ├── auth/                # Google OAuth2, JWT, resolver de cookie
│   │       ├── badges/               # CRUD de badges
│   │       ├── projects/             # CRUD de projetos
│   │       ├── posts/                # CRUD de posts
│   │       ├── kanban/                # Handlers WebSocket (kanban + todos)
│   │       ├── kanbantasks/          # CRUD de tarefas independentes do Kanban
│   │       ├── todos/                # CRUD de todos (modelo de dois usuários)
│   │       ├── sitesettings/         # Configurações singleton do site
│   │       ├── common/                # Entidades base, enums compartilhados, exceptions
│   │       ├── config/                 # Security, CORS, WebSocket, OpenAPI
│   │       └── ApiApplication.java
│   │
│   ├── api/                        # Backend NestJS — DESATIVADO, mantido como referência
│   │
│   └── web/                        # Frontend Next.js
│       └── src/
│           ├── app/
│           │   ├── (auth)/          # /login
│           │   ├── (public)/        # /, /about, /contact, /projects, /blog, /blog/[slug]
│           │   └── (private)/       # /ControlPanel/** (autenticado)
│           ├── components/
│           │   ├── Common/          # Componentes reutilizáveis públicos
│           │   ├── ControlPanel/    # Componentes exclusivos do painel (tabelas, boards)
│           │   ├── EventPopup/      # Popup de divulgação de evento
│           │   ├── Header/          # Header público
│           │   ├── Contact/         # Formulário de contato
│           │   ├── admin/           # Utilitários compartilhados do painel (confirm-dialog, toast)
│           │   └── ui/              # shadcn/ui + magicui
│           └── proxy.ts             # Proteção de rota (`/ControlPanel/**`, `/login`)
│
└── packages/
    └── typescript-config/          # tsconfig base compartilhado (apps/web)
```

### Banco de Dados — Tabelas

| Tabela | Descrição |
|---|---|
| `users` | Usuários autenticados via Google OAuth2 (allowlist por e-mail) |
| `badges` | Tags coloridas reutilizáveis |
| `projects` | Projetos com visibilidade e status kanban |
| `posts` | Artigos do blog com conteúdo Markdown |
| `kanban_tasks` | Tarefas do board Kanban (independentes) |
| `todos` | Tarefas privadas/compartilhadas do painel (`owner_id` + `shared`) |
| `site_settings` | Linha singleton com as configurações públicas do site |

Sessão é **stateless** (JWT assinado, sem tabela de sessão persistida) — diferente do BetterAuth do `apps/api` (Nest) desativado.

---

## Rotas da API

### Públicas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/badges` | Lista todos os badges |
| GET | `/api/projects` | Lista projetos visíveis |
| GET | `/api/posts` | Lista posts visíveis |
| GET | `/api/posts/:slug` | Busca post pelo slug |
| GET | `/api/kanban-tasks` | Lista todas as tarefas do kanban |
| GET | `/api/site-settings` | Consulta as configurações públicas do site |
| GET | `/oauth2/authorization/google` | Inicia o login com Google |

### Protegidas (requer cookie de sessão)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/auth/me` | Dados do usuário autenticado |
| POST | `/api/auth/logout` | Encerra a sessão (limpa o cookie) |
| GET | `/api/projects/all` | Lista todos os projetos (incluindo invisíveis) |
| POST/PATCH/DELETE | `/api/projects[/:id]` | CRUD de projetos |
| GET | `/api/posts/all` | Lista todos os posts |
| POST/PATCH/DELETE | `/api/posts[/:id]` | CRUD de posts |
| POST/PATCH/DELETE | `/api/badges[/:id]` | CRUD de badges |
| POST/PATCH/DELETE | `/api/kanban-tasks[/:id]` | CRUD de tarefas do kanban |
| GET/POST/PATCH/DELETE | `/api/todos[/:id]` | CRUD de todos — inclusive o `GET`, já que o resultado depende de quem pergunta |
| PATCH | `/api/site-settings` | Atualiza as configurações do site |

---

## Documentação Swagger

Acesse `http://localhost:3001/docs` com a API rodando.

**Para testar rotas protegidas:**
1. Faça login em `http://localhost:3000/login` (mesmo navegador)
2. Abra `http://localhost:3001/docs` nesse mesmo navegador

O cookie httpOnly `access_token` é enviado automaticamente pelo navegador nas chamadas que o Swagger UI faz — não é preciso colar token manualmente. O botão **Authorize** (Bearer) não é usado nesta API: o resolver de token do Spring Security lê exclusivamente do cookie (ver `CookieBearerTokenResolver`), não do header `Authorization`.

---

## WebSocket

### Kanban — `ws://localhost:3001/ws/kanban`

Handshake público (sem autenticação).

**Mover card:**
```json
{
  "event": "move-card",
  "data": {
    "id": "uuid-da-tarefa",
    "type": "task",
    "to": "in-progress"
  }
}
```

**Status possíveis:** `backlog` · `todo` · `in-progress` · `done`

O servidor emite `card-moved` com os mesmos dados para todos os clientes conectados.

### Todos — `ws://localhost:3001/ws/todos`

Handshake **autenticado** — exige um JWT válido no cookie `access_token`; sem isso a conexão é recusada antes do upgrade.

O servidor emite, para os clientes autorizados (dono do todo ou qualquer usuário se `shared: true`):

```json
{ "event": "todo-created", "data": { "...": "objeto Todo completo" } }
{ "event": "todo-updated", "data": { "...": "objeto Todo completo" } }
{ "event": "todo-deleted", "data": { "...": "objeto Todo completo" } }
```

---

## Deploy

O frontend usa **Turborepo** para orquestrar build/lint/typecheck com cache. `apps/api-java` fica fora dessa orquestração — é buildado separadamente via Maven (`./mvnw` local, ou multi-stage Docker em produção).

A aplicação roda em produção numa VPS própria (Docker + Nginx nativo + certbot),
em `brunogusmao.dev`/`api.brunogusmao.dev`, coexistindo na mesma VPS com o
subdomínio do evento-gamificacao. Não há deploy na Vercel/Railway.

Ver runbook completo, incluindo bootstrap da VPS do zero e coordenação com o
evento-gamificacao: [`deploy/DEPLOY-VPS.md`](./deploy/DEPLOY-VPS.md).

**Resumo rápido (VPS já provisionada):**
```bash
./scripts/vps-setup.sh   # uma única vez, numa VPS nova
./deploy.sh               # primeiro deploy
./update.sh                # deploys seguintes
```

---

---

# Bruno Gusmão — Fullstack Portfolio

Personal portfolio with a complete admin panel. **pnpm workspaces + Turborepo** monorepo for the frontend, with a **Spring Boot (Java)** backend, Next.js 16 App Router frontend, Google OAuth2 + JWT authentication in an httpOnly cookie, real-time Kanban and Todos via WebSocket and drag-and-drop.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Folder Structure](#folder-structure)
- [API Routes](#api-routes)
- [Swagger Documentation](#swagger-documentation)
- [WebSocket](#websocket-1)
- [Deploy](#deploy-1)

---

## About

This monorepo brings together the REST API and the portfolio website. The goal is to have a centralized place to showcase projects and articles, with an admin panel to manage all content without relying on external CMS services.

The active backend is **`apps/api-java`** (Spring Boot). The repo also contains **`apps/api`** (NestJS) — the original backend implementation — **deactivated**: not part of the deploy flow and no longer consumed by the frontend, kept only as historical reference. See [`docs/java-migration/`](./docs/java-migration/) for full module specs and parity notes between the two implementations.

The design follows a terminal/hacker aesthetic: monospace typography, typing animations, and a dark palette with lime-green accents (`#bef264`).

---

## Features

### Public Area
- Home page with animated grid and personal introduction
- About page with profile, experience, and contact sections
- Contact page
- Projects page with a featured card and paginated grid
- Blog with a featured card, paginated grid, and reading page by slug
- Estimated reading time and Portuguese date formatting on the blog
- Colored badges with configurable background and text color
- Event announcement popup, configurable from the admin panel

### Admin Panel (`/ControlPanel`)
- **Dashboard** — project, post, badge, and kanban task counts
- **Projects** — full CRUD, public visibility toggle, kanban status
- **Posts** — full CRUD with Markdown content field, visibility toggle
- **Badges** — CRUD with color picker and live badge preview
- **Kanban** — real-time board with drag-and-drop; tasks independent from projects/posts
  - 4 columns: Backlog · To Do · In Progress · Done
  - 3 task types: Blog, Project, Custom (free color)
  - WebSocket sync across multiple browser tabs
- **Todos** — two-tab task list: **Mine** (private, owner-only) and **Shared** (visible/editable by any authenticated panel user)
  - WebSocket sync across multiple browser tabs
- **Event** — announcement popup configuration (enable/disable, copy, image, colors)

---

## Tech Stack

### Backend — `apps/api-java`
| Technology | Description |
|---|---|
| Spring Boot 4.1 (Java 21) | Main framework |
| Spring Data JPA + Hibernate | ORM |
| Flyway | Migrations — run automatically on application boot |
| Spring Security (OAuth2 Client + Resource Server) | Google OAuth2 login, session as an HS256 JWT in an httpOnly cookie |
| Spring WebSocket | Native handlers (`/ws/kanban`, `/ws/todos`), no STOMP |
| springdoc-openapi | OpenAPI 3 / Swagger UI documentation |
| PostgreSQL driver (JDBC) | Own database, separate from what `apps/api` used |
| Maven (`./mvnw`) | Build — self-contained project, outside the pnpm workspace |

### Frontend — `apps/web`
| Technology | Description |
|---|---|
| Next.js 16 | App Router, Server Components |
| React 19 | UI |
| Tailwind CSS v4 | Utility-first CSS |
| @base-ui/react | Accessible UI primitives (Dialog, Switch, Tabs, etc.) |
| shadcn/ui | Ready-made components (Sidebar, Table, Pagination, Card) |
| next-themes | Theme provider (currently locked to dark) |
| @hello-pangea/dnd | Drag-and-drop for Kanban |
| magicui | Animated components (AnimatedGridPattern, ShineBorder) |

---

## Prerequisites

- Node.js >= 20
- pnpm >= 10
- JDK 21 (Maven itself doesn't need to be installed — the project ships the `./mvnw` wrapper)
- PostgreSQL (local or remote)
- Google OAuth2 credentials (for login)

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd bruno-gusmao

# Install pnpm workspace dependencies (frontend)
pnpm install
```

`apps/api-java` is not part of the pnpm workspace — no install step needed; `./mvnw` resolves Maven dependencies automatically on first run.

---

## Configuration

### API — `apps/api-java/.env`

Spring Boot **does not load `.env` on its own** (unlike the Nest backend, which used `dotenv`) — export the variables into the shell before running (see [Running the Project](#running-the-project)), or use `./scripts/vps-setup.sh`/Docker in production, which already handle this.

```env
PORT=3001

# Separate database from what apps/api (Nest, deactivated) used.
DATABASE_URL=jdbc:postgresql://localhost:5432/bruno_gusmao_java
DATABASE_USERNAME=your_user
DATABASE_PASSWORD=your_password

# JWT — generate with: openssl rand -base64 32
JWT_SECRET=your-secret-here
JWT_EXPIRATION_DAYS=7
JWT_COOKIE_NAME=access_token

# Google OAuth2 — console.cloud.google.com
# Redirect URI to register: http://localhost:3001/login/oauth2/code/google
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# One or more comma-separated emails — only these can log in
ALLOWED_EMAILS=your@email.com

# Frontend URL (CORS + post-login redirect)
WEB_URL=http://localhost:3000
```

### Web — `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
API_URL=http://localhost:3001
```

### Database

Flyway applies migrations automatically on application boot — there's no manual `generate`/`migrate` command. The only manual step is creating the database itself (Postgres won't create it on its own):

```bash
psql -h localhost -U your_user -c "CREATE DATABASE bruno_gusmao_java;"
```

---

## Running the Project

```bash
# Terminal 1 — API (Spring Boot)
cd apps/api-java
set -a; source .env; set +a
./mvnw spring-boot:run

# Terminal 2 — Frontend
pnpm --filter web start:dev

# Production build (frontend)
pnpm --filter web build

# TypeScript type checking
pnpm typecheck
```

> **Don't use unfiltered `pnpm dev`/`pnpm build` at the repo root.** Those scripts run through Turborepo across every pnpm workspace, including `apps/api` (Nest) — which is deactivated and, if started, collides on port 3001 with `apps/api-java`. Always prefer `pnpm --filter web <script>` for the frontend.

| App | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/docs |
| Kanban WebSocket | ws://localhost:3001/ws/kanban |
| Todos WebSocket | ws://localhost:3001/ws/todos |

---

## Folder Structure

```
.
├── apps/
│   ├── api-java/                   # Spring Boot backend (active)
│   │   └── src/main/java/dev/brunogusmao/api/
│   │       ├── auth/                # Google OAuth2, JWT, cookie resolver
│   │       ├── badges/               # Badges CRUD
│   │       ├── projects/             # Projects CRUD
│   │       ├── posts/                # Posts CRUD
│   │       ├── kanban/                # WebSocket handlers (kanban + todos)
│   │       ├── kanbantasks/          # Independent Kanban tasks CRUD
│   │       ├── todos/                # Todos CRUD (two-user model)
│   │       ├── sitesettings/         # Singleton site settings
│   │       ├── common/                # Base entities, shared enums, exceptions
│   │       ├── config/                 # Security, CORS, WebSocket, OpenAPI
│   │       └── ApiApplication.java
│   │
│   ├── api/                        # NestJS backend — DEACTIVATED, kept as reference
│   │
│   └── web/                        # Next.js frontend
│       └── src/
│           ├── app/
│           │   ├── (auth)/          # /login
│           │   ├── (public)/        # /, /about, /contact, /projects, /blog, /blog/[slug]
│           │   └── (private)/       # /ControlPanel/** (authenticated)
│           ├── components/
│           │   ├── Common/          # Reusable public components
│           │   ├── ControlPanel/    # Panel-exclusive components (tables, boards)
│           │   ├── EventPopup/      # Event announcement popup
│           │   ├── Header/          # Public header
│           │   ├── Contact/         # Contact form
│           │   ├── admin/           # Shared panel utilities (confirm-dialog, toast)
│           │   └── ui/              # shadcn/ui + magicui
│           └── proxy.ts             # Route protection (`/ControlPanel/**`, `/login`)
│
└── packages/
    └── typescript-config/          # Shared tsconfig base (apps/web)
```

### Database Tables

| Table | Description |
|---|---|
| `users` | Users authenticated via Google OAuth2 (email allowlist) |
| `badges` | Reusable colored tags |
| `projects` | Projects with visibility and kanban status |
| `posts` | Blog articles with Markdown content |
| `kanban_tasks` | Kanban board tasks (independent) |
| `todos` | Private/shared panel tasks (`owner_id` + `shared`) |
| `site_settings` | Singleton row holding the site's public settings |

Sessions are **stateless** (signed JWT, no persisted session table) — unlike the deactivated `apps/api` (Nest)'s BetterAuth.

---

## API Routes

### Public
| Method | Route | Description |
|---|---|---|
| GET | `/api/badges` | List all badges |
| GET | `/api/projects` | List visible projects |
| GET | `/api/posts` | List visible posts |
| GET | `/api/posts/:slug` | Get post by slug |
| GET | `/api/kanban-tasks` | List all kanban tasks |
| GET | `/api/site-settings` | Get the site's public settings |
| GET | `/oauth2/authorization/google` | Starts the Google login flow |

### Protected (requires session cookie)
| Method | Route | Description |
|---|---|---|
| GET | `/api/auth/me` | Current authenticated user |
| POST | `/api/auth/logout` | Ends the session (clears the cookie) |
| GET | `/api/projects/all` | List all projects (including hidden) |
| POST/PATCH/DELETE | `/api/projects[/:id]` | Projects CRUD |
| GET | `/api/posts/all` | List all posts |
| POST/PATCH/DELETE | `/api/posts[/:id]` | Posts CRUD |
| POST/PATCH/DELETE | `/api/badges[/:id]` | Badges CRUD |
| POST/PATCH/DELETE | `/api/kanban-tasks[/:id]` | Kanban tasks CRUD |
| GET/POST/PATCH/DELETE | `/api/todos[/:id]` | Todos CRUD — including `GET`, since the result depends on who's asking |
| PATCH | `/api/site-settings` | Update the site's settings |

---

## Swagger Documentation

Visit `http://localhost:3001/docs` with the API running.

**To test protected routes:**
1. Log in at `http://localhost:3000/login` (same browser)
2. Open `http://localhost:3001/docs` in that same browser

The httpOnly `access_token` cookie is sent automatically by the browser on the requests Swagger UI makes — no need to paste a token manually. The **Authorize** (Bearer) button isn't used on this API: Spring Security's token resolver reads exclusively from the cookie (see `CookieBearerTokenResolver`), not from the `Authorization` header.

---

## WebSocket

### Kanban — `ws://localhost:3001/ws/kanban`

Public handshake (no authentication).

**Move a card:**
```json
{
  "event": "move-card",
  "data": {
    "id": "task-uuid",
    "type": "task",
    "to": "in-progress"
  }
}
```

**Available statuses:** `backlog` · `todo` · `in-progress` · `done`

The server emits `card-moved` with the same data to all connected clients.

### Todos — `ws://localhost:3001/ws/todos`

**Authenticated** handshake — requires a valid JWT in the `access_token` cookie; without it the connection is refused before the upgrade.

The server emits, to authorized clients (the todo's owner, or any client if `shared: true`):

```json
{ "event": "todo-created", "data": { "...": "full Todo object" } }
{ "event": "todo-updated", "data": { "...": "full Todo object" } }
{ "event": "todo-deleted", "data": { "...": "full Todo object" } }
```

---

## Deploy

The frontend uses **Turborepo** to orchestrate build/lint/typecheck with caching. `apps/api-java` is outside that orchestration — it's built separately via Maven (`./mvnw` locally, or a multi-stage Docker build in production).

The app runs in production on a dedicated VPS (Docker + native Nginx + certbot)
at `brunogusmao.dev`/`api.brunogusmao.dev`, coexisting on the same VPS with the
evento-gamificacao subdomain. There is no Vercel/Railway deploy.

Full runbook, including bootstrapping the VPS from scratch and coordination
with evento-gamificacao: [`deploy/DEPLOY-VPS.md`](./deploy/DEPLOY-VPS.md).

**Quick reference (VPS already provisioned):**
```bash
./scripts/vps-setup.sh   # once, on a fresh VPS
./deploy.sh                # first deploy
./update.sh                 # subsequent deploys
```
