[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

# Email Cloudflare Worker

A Cloudflare worker running on the [Hono](https://hono.dev/) framework. The goal is to send emails via a `POST` request from a custom domain.

I’m building this application it with a purpose- NO LLM tools used, lots of trial and error, testing and [ducking](https://duckduckgo.com/). Things will break as I’m building but it will be intentionally human.


## Techstack

- GitHub Actions for Deployment
- Hono
- Typescript
- NPM
- Zod
- Biome
- Vitest

## Scripts

```
"dev": "wrangler dev",
"deploy": "wrangler deploy --minify",
"cf-typegen": "wrangler types --env-interface CloudflareBindings",
"test": "vitest",
"lint": "npx @biomejs/biome lint --write ./src",
"prepare": "husky"`
```

## Endpoints


| Endpoint  | Method | Description |
|-------|-----|------------|
| `/healthcheck` | `GET`  | Returns a healthcheck status   |


## Setup

```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
