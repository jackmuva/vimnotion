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
- [ ] tooltips/support for non-vim users - tabs and modals
- [ ] ai with context to certain files (maybe with the @ shortcut)
- [ ] cron job to delete all unused images
- [ ] update docs on :e, ascii art

## High-level Todos
- [ ] normie view (not vimnotion)
  - [ ] focus on making this a great writing experience
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
    - search
    - image storage
    - key commands useRef
