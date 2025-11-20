# vimnotion - notion with vim motion

## Getting Started
### nextjs
```bash
npm run dev
```

### go webserver
```bash
go run main.go
```

## Granular Todos
1. Save and Load buffers from sidebar
    * on directory confirmation, update backend with new directory structure and objects
    * on CR, for a file, inject contents in buffer
    * :w in vim mode send a PUT
    * splitting should inject the fileid and contents in the buffer
        * need to decide how updates are handled client side when two buffers are open
2. start search

## High-level Todos
- search experience
  - sqlite with full-text search, indexed db with incremental sync
  - in sqlite, keep a json string with directory structure;
  this will work as we can search by name client-side and search grep server-side/indexed-db
- markdown renderer
  - ability to link pages, insert images, embed videos
  - how do we keep images private (to research)
- normie view (not vimnotion)
- create teams
- extensabiity with hotkeys for apis
- router for vimnotion versions
- version history
  - trash
- local md downloads

