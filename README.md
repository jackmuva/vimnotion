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
3. sidebar location should be last active page
3. code highlighting
4. use delete history for bulk pastes

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
