# vimnotion - notion with vim motion

## Getting Started
### nextjs
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### go webserver
```bash
go run main.go
```

## Todos
- github auth
  - how do i want to make sure client/server state is consistent with auth
  - check with every request to server?
  - cache auth state with localstorage and throw error if jwt expired?
- search experience
  - sqlite with full-text search, indexed db with incremental sync
  - in sqlite, keep a json string with directory structure;
  this will work as we can search by name client-side and search grep server-side/indexed-db
- markdown renderer
  - ability to link pages, insert images, embed videos
  - how do we keep images private (to research)
- normie view (not vimnotion)
- neovim-like actions like tabs, split, search, oil, search
- create teams
- extensabiity with hotkeys for apis
- websockets for collaboration
  - but also multi-tab/window behavior
- router for vimnotion versions
