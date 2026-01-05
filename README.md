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
1. fix code highlight on doc page; flickers rn
4. use delete history for bulk pastes
6. <ctrl>d and u
8. tooltips/support for non-vim users - tabs and modals

## High-level Todos
- normie view (not vimnotion)
- create teams
- extensability with hotkeys for apis
- version history
  - trash
- local md downloads
- cron job to delete all unused images
- sidebar refactor
- account modal
- emoji support

## Marketing Todos
9. video on vim note taker
8. video on building a tool only I wanted
10. blog
