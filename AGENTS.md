# Agent Guidelines for vimnotion

A Notion-like editor with Vim keybindings. Two main parts: Next.js frontend and Go backend.

## Project Structure

```
vimnotion/
├── nextjs-vimnotion/          # Frontend (Next.js 16, React 19, TypeScript 5)
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # React components
│   │   ├── store/             # Zustand state management
│   │   ├── types/             # TypeScript type definitions
│   │   └── lib/               # Utility functions
├── go-vimnotion/              # Backend (Go 1.24)
│   ├── cmd/server/            # Entry point (main.go)
│   └── internal/              # handlers/, middleware/, models/, repository/, services/
```

## Build/Lint/Test Commands

### Frontend (nextjs-vimnotion/)
```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run start        # Start production server
```

### Backend (go-vimnotion/)
```bash
go run ./cmd/server                          # Run dev server (port 3333)
go build -o server ./cmd/server              # Build binary
go test ./...                                # Run all tests
go test -run TestName ./path/to/package      # Run single test by name
go test -v ./internal/handlers/...           # Tests in package with verbose
go fmt ./...                                 # Format code
```

## Code Style Guidelines

### TypeScript/React

**General:**
- TypeScript strict mode - never use `any`
- Functional components only, hooks for state/effects
- Use `@/*` path alias for `src/` imports

**Imports (order):** React/Next → third-party → local imports
```typescript
import { useEffect } from "react";
import useSWR from "swr";
import { Header } from "@/components/header";
import { useEditorStore } from "@/store/editor-store";
```

**Naming:**
- `camelCase`: variables, functions, file names
- `PascalCase`: components, types, interfaces, enums
- File names: kebab-case (`vim-editor.tsx`, `editor-store.ts`)

**Types:** Define in `src/types/`, use `enum` for fixed values, `type` for shapes
```typescript
export enum PanelType { LEADER = "LEADER", SIDEBAR = "SIDEBAR", MAIN = "MAIN" }
export type PaneNode = { [id: string]: { children: string[]; parent: string | null; } }
```

**State (Zustand):** Subscribe to specific state, not entire store
```typescript
const value = useEditorStore((state) => state.value);  // Good
const store = useEditorStore();  // Bad - causes re-renders
```

**CSS:** Tailwind utilities only, avoid custom CSS

### Go

**General:**
- Run `go fmt` before committing
- Follow standard layout (cmd/, internal/)
- Handle all errors explicitly

**Imports:** Standard library → third-party → local
```go
import (
    "database/sql"
    "net/http"

    "github.com/golang-jwt/jwt/v5"
    "vimnotion.com/server/internal/models"
)
```

**Error Handling:**
```go
result, err := doSomething()
if err != nil {
    fmt.Printf("error doing something: %s\n", err)
    http.Error(w, "Error message", http.StatusInternalServerError)
    return
}
```

**HTTP Handlers:** Return `http.HandlerFunc`, check method, set Content-Type
```go
func GetSomething(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        w.Header().Set("Content-Type", "application/json")
        w.Write(jsonResponse)
    }
}
```

## Key Technologies

**Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind 4, Zustand, SWR, CodeMirror 6 + @replit/codemirror-vim

**Backend:** Go 1.24, standard library HTTP, Turso (LibSQL), JWT (golang-jwt/jwt/v5), OAuth (GitHub, Google)

## Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:3333
```

**Backend (.env):**
```
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
JWT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Common Patterns

**Data Fetching (Frontend):**
```typescript
const { data, isLoading } = useSWR<ResponseType>('/api/endpoint', async () => {
    const req = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/endpoint`, {
        credentials: 'include'
    });
    return await req.json();
});
```

**Protected Routes (Backend):**
```go
mux.Handle("/api/protected", middleware.AuthMiddleware(handlers.ProtectedHandler(db)))
```

**JSON Responses (Backend):**
```go
response := models.DataResponse{StatusCode: 200, Data: data}
jsonMessage, _ := json.Marshal(response)
w.Header().Set("Content-Type", "application/json")
w.Write(jsonMessage)
```
