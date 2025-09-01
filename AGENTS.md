# Agent Guidelines for vimnotion

## Build/Lint/Test Commands
- **Frontend (Next.js)**: `cd nextjs-vimnotion && npm run dev` (dev), `npm run build` (build), `npm run lint` (lint)
- **Backend (Go)**: `cd go-vimnotion && go run main.go` (run), `go build` (build), `go test ./...` (test all)
- **Single test**: `go test -run TestName` or `go test ./path/to/package -run TestName`

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, target ES2017, use functional React components with hooks
- **Imports**: Standard library → third-party → local imports; use `@/` path alias for src/
- **Naming**: camelCase for variables/functions, PascalCase for components/types/interfaces
- **React**: Use functional components, prefer hooks over class components
- **Go**: Follow standard Go formatting (`go fmt`), use meaningful variable names
- **Error handling**: Go uses standard error patterns; React uses try/catch where appropriate
- **Types**: Use explicit types, avoid `any`, leverage TypeScript's strict mode
- **Linting**: ESLint with Next.js rules - run `npm run lint` before commits

## Project Structure
- Frontend: `nextjs-vimnotion/` (Next.js 15, React 19, TypeScript)
- Backend: `go-vimnotion/` (Go 1.24.4, Gin-like HTTP server)
- State management: Zustand for React frontend</content>
</xai:function_call name="bash">
<parameter name="command">cd /Users/jackmu/Documents/vimnotion && git add AGENTS.md