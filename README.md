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
- [x] tiptap editor
- [ ] agent
    - [ ] compaction hook
    - [x] test automated delete session
    - [ ] Read file in sections
- [ ] RSS feed
- [x] more intuitive regex on searches

## High-level Todos
- [ ] create teams
- [ ] extensability with hotkeys for apis
- [ ] version history
  - [ ] trash
- [ ] local md downloads
- [ ] account modal

## Nice to haves
- agent
    - [ ] endpoint timeout?
    - [ ] evaluation hook?
    - [ ] model selector?


# Marketing Todos
- [ ] blog on "why markdown"
- [ ] blog posts that help other developers building "x"
    - [ ] search
    - [ ] image storage
    - [ ] key commands useRef
    - [ ] agents from scratch
    - [ ] AI and purpose
    - [ ] AI engineering is just software engineering
