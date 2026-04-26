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
projects/<project-slug>/source-artworks/.atelier-artworks.json
```

Each item stores:

- id
- originalName
- filename
- relativePath
- extension
- sizeBytes
- importedAt

The image file itself is copied into:

```txt
projects/<project-slug>/source-artworks/<filename>
```

If a filename already exists, the importer appends `-2`, `-3`, and so on before the extension. Original extensions are preserved.

## IPC API

Renderer access goes through the preload bridge:

```ts
window.atelier.artworks.selectArtworkFiles(projectId)
window.atelier.artworks.importArtworkFiles(projectId, filePaths)
window.atelier.artworks.listSourceArtworks(projectId)
window.atelier.artworks.getArtworkPreviewUrl(projectId, artworkId)
window.atelier.artworks.revealArtworkInFolder(projectId, artworkId)
```

## Preview model

The renderer receives a safe data URL from the main process instead of a filesystem path.

## Reveal action

An artwork can be revealed in the system file manager through IPC. The renderer never opens filesystem paths directly.

## Current limitations

- No thumbnails are generated yet.
- Previews read the original image and return a data URL, which is acceptable for Sprint 1 but not ideal for large batches.
- There is no drag-and-drop import, deletion, or image processing yet.
