# Agent Guidelines for vimnotion

## Build/Lint/Test Commands
- **Frontend (Next.js 15.5.2)**: `cd nextjs-vimnotion && npm run dev --turbopack` (dev), `npm run build` (build), `npm run lint` (lint)
- **Backend (Go 1.24.4)**: `cd go-vimnotion && go run main.go` (run), `go build` (build), `go test ./...` (test all)
- **Single test**: `go test -run TestName` or `go test ./path/to/package -run TestName`
- **Linting**: ESLint with Next.js core web vitals and TypeScript rules

## Code Style Guidelines
- **TypeScript**: Strict mode, ES2017 target, functional React components with hooks
- **Imports**: Standard library → third-party → local imports; use `@/*` path alias for src/
- **Naming**: camelCase for variables/functions, PascalCase for components/types/interfaces
- **React**: Functional components only, prefer hooks over class components
- **Go**: Standard Go formatting (`go fmt`), meaningful variable names, idiomatic error handling
- **Types**: Explicit types, avoid `any`, leverage TypeScript strict mode
- **State Management**: Zustand for React frontend state management

## Project Structure
- Frontend: `nextjs-vimnotion/` (Next.js 15.5.2, React 19.1.0, TypeScript 5)
- Backend: `go-vimnotion/` (Go 1.24.4, HTTP server with Turso DB)
- Key Dependencies: CodeMirror for editor, Tailwind CSS, Zustand for state</content>
</xai:function_call name="bash">
<parameter name="command">cd /Users/jackmu/Documents/vimnotion && git add AGENTS.md