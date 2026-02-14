# vimnotion - notion with vim motion

## Getting Started
### nextjs
```bash
npm run dev
```

### go webserver
```bash
go run cmd/server/main.go
```

### building webserver
```bash
docker build -t go-vimnotion:latest .
docker run -v $(pwd)/.env/.env -p 3333:3333 go-vimnotion:latest
docker login registry.digitalocean.com
docker tag go-vimnotion registry.digitalocean.com/vimnotion/go-vimnotion:latest
docker push registry.digitalocean.com/vimnotion/go-vimnotion:latest
```

## Immediate Todos
- [x] ai with context to certain files (maybe with the @ shortcut)
    - [ ] Slash commands for new, session, prompt file
    - [x] @ files
    - [ ] compaction hook

## High-level Todos
- [ ] normie view (not vimnotion)
  - [ ] vim-like commands like <ESC> for command and ":" for executions and actions
- [ ] create teams
- [ ] extensability with hotkeys for apis
- [ ] version history
  - [ ] trash
- [ ] local md downloads
- [ ] account modal

# Marketing Todos
- [ ] Video on "why markdown"
- [ ] Video on "why vim"
- [ ] blog posts that help other developers building "x"
    - [ ] search
    - [ ] image storage
    - [ ] key commands useRef
    - [ ] agents from scratch
    - [ ] AI and purpose
    - [ ] AI engineering is just software engineering
