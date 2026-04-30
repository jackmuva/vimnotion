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

## Final Todos
- [ ] toast-like notifications for file saved
- [ ] RSS feed
- bug fixes
    - [ ] bug with window focus when moving tabs
- normie config
    - [ ] directory
    - [ ] agent
- markdown export

## Next Todos
- [ ] create teams
  - account management
- [ ] extensability with hotkeys for apis
- [ ] version history
  - [ ] trash
- [ ] backlinking
- [ ] nested checkboxes

## Nice to haves
- optimizations
    - [ ] batch writing instead of concurrent writes
    - [ ] non-blocking retries on database updates

## In Question
- migrating go to next?
- agent
    - [ ] endpoint timeout?
    - [ ] evaluation hook?
    - [ ] model selector?
- spreadsheets
- inbox/messaging

# Marketing Todos
- [ ] blog post on friction, DX, and WX
- [ ] blog on "why markdown"
- [ ] blog on why notion is a beautiful product 
- [ ] blog on you being the product and that you should be working building a better you
- [ ] blog posts that help other developers building "x"
    - [ ] search
    - [ ] image storage
    - [ ] key commands useRef
    - [ ] agents from scratch
    - [ ] AI engineering is just software engineering
