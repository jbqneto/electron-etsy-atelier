# Artwork Import

## Scope

Artwork import copies supported image files into a project source-artwork folder and stores metadata locally.

## Supported extensions

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

## Storage

Imported artwork metadata is stored in:

```txt
projects/<project-slug>/01-source-artworks/.atelier-artworks.json
```

Each item stores:

- id
- originalName
- filename
- relativePath
- extension
- sizeBytes
- importedAt

## Preview model

The renderer receives a safe data URL from the main process instead of a filesystem path.

## Reveal action

An artwork can be revealed in the system file manager through IPC. The renderer never opens filesystem paths directly.
