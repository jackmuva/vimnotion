# Agent Guidelines for vimnotion

## Build/Lint/Test Commands
- **Frontend dev**: `cd nextjs-vimnotion && npm run dev --turbopack`
- **Frontend build**: `cd nextjs-vimnotion && npm run build`
- **Frontend lint**: `cd nextjs-vimnotion && npm run lint`
- **Backend run**: `cd go-vimnotion && go run ./cmd/server`
- **Backend build**: `cd go-vimnotion && go build -o server ./cmd/server`
- **Backend test all**: `cd go-vimnotion && go test ./...`
- **Backend single test**: `cd go-vimnotion && go test -run TestName ./path/to/package`

## Code Style Guidelines
- **TypeScript**: Strict mode, ES2017 target, functional components with hooks, never use `any`
- **Imports**: Standard library → third-party → local imports; use `@/*` path alias for src/
- **Naming**: camelCase for variables/functions/files, PascalCase for components/types/interfaces
- **React**: Functional components only, hooks over class components, prefer composition
- **Go**: Standard formatting (`go fmt`), meaningful variable names, idiomatic error handling (`if err != nil` checks)
- **State Management**: Zustand for React frontend, REST endpoints for backend
- **CSS**: Tailwind CSS utilities only, no custom CSS unless necessary
- **Error Handling**: TypeScript - throw descriptive errors; Go - return errors as last argument

## Project Structure
- Frontend: `nextjs-vimnotion/` (Next.js 15.5.2, React 19.1.0, TypeScript 5, Tailwind CSS)
- Backend: `go-vimnotion/` (Go 1.24.4, entry at `cmd/server/main.go`, Turso DB via libsql)
- Key Dependencies: CodeMirror 6 + Vim plugin, SWR for data fetching, Zustand for state</content>
</xai:function_call name="bash">
<parameter name="command">cd /Users/jackmu/Documents/vimnotion && git add AGENTS.md