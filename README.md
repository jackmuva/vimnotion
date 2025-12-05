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
docker tag go-vimnotion registry.digitalocean.com/vimnotion/go-vimnotion
docker push registry.digitalocean.com/vimnotion/go-vimnotion
```

## Immediate Todos
1. grep search
5. deploy backend
7. startup + tutor pages
8. marketing page with gifs
9. syntax highlighting on sidebar-editor
10. non-vim usability tooltip hints


## High-level Todos
- normie view (not vimnotion)
- create teams
- extensabiity with hotkeys for apis
- router for vimnotion versions
- version history
  - trash
- local md downloads
- cron job to delete all unused images
- sidebar refactor
