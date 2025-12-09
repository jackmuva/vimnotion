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
1. sitemap
2. grep search
9. syntax highlighting on sidebar-editor
10. non-vim usability tooltip hints
11. stripe payment
12. account modal
13. signin modal with google auth
14. emoji support
15. docs on marketing page


## High-level Todos
- normie view (not vimnotion)
- create teams
- extensabiity with hotkeys for apis
- version history
  - trash
- local md downloads
- cron job to delete all unused images
- sidebar refactor
