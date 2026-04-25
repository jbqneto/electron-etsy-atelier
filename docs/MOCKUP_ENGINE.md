# Mockup Engine

## Purpose

The mockup engine has two parts:

1. **Mockup Template Builder** - creates reusable base templates.
2. **Mockup Composer** - assigns artwork to template slots and exports final listing images.

The current online tool already has both concepts. The desktop version must preserve this workflow while moving metadata to local SQLite and files to the workspace.

## Mockup Template Builder

User flow:

1. User imports a background image.
2. App displays the image in a canvas.
3. User draws one rectangle per visible frame area.
4. User can inspect, move, resize, rotate or remove each rectangle.
5. App saves the template.
6. App stores template metadata and slot coordinates.
7. App generates a thumbnail.

## Coordinate system

All slot coordinates must be stored in natural background image coordinates, not scaled UI coordinates.

Example:

```json
{
  "backgroundWidth": 1248,
  "backgroundHeight": 832,
  "slot": {
    "x": 497,
    "y": 106,
    "width": 248,
    "height": 341,
    "rotation": 0
  }
}
```

The renderer may display the canvas at a different zoom level. The app must convert UI coordinates back to natural image coordinates before saving.

## Mockup template JSON snapshot

Even though SQLite is the source of truth, each template folder should include a `template.json` snapshot.

```json
{
  "id": "mockup-background-cozy-reading-nook",
  "title": "Mockup Background Cozy Reading Nook",
  "slug": "mockup-background-cozy-reading-nook",
  "width": 1248,
  "height": 832,
  "backgroundImage": "background.jpg",
  "thumbnailImage": "thumbnail.jpg",
  "slots": [
    {
      "id": "slot-1",
      "label": "Frame 1",
      "x": 497,
      "y": 106,
      "width": 248,
      "height": 341,
      "rotation": 0,
      "ratioKey": "vertical"
    }
  ]
}
```

## Slot MVP fields

Required:

- id;
- label;
- x;
- y;
- width;
- height;
- rotation;
- orderIndex.

Optional:

- ratioKey;
- notes;
- locked;
- defaultFitMode.

## Mockup Composer

User flow:

1. User selects a project.
2. User selects a mockup template.
3. App displays available frame slots.
4. User assigns artwork to each slot.
5. User adjusts crop controls:
   - scale;
   - horizontal crop;
   - vertical crop.
6. App previews the composition.
7. User exports final mockup image.

## Slot assignment JSON

```json
{
  "compositionId": "composition-001",
  "templateId": "living-room-8-vertical-frames",
  "projectId": "english-botanical-garden-collection",
  "assignments": [
    {
      "slotId": "slot-1",
      "assetId": "asset-001",
      "crop": {
        "scale": 1.2,
        "offsetXPercent": 0,
        "offsetYPercent": -5
      }
    }
  ]
}
```

## Rendering rules

MVP rendering:

1. Load background image.
2. For each slot assignment:
   - load artwork;
   - resize/crop artwork to cover slot area;
   - apply visual crop values;
   - rotate if slot has rotation;
   - composite artwork onto background at slot x/y.
3. Export JPEG/PNG.

## Fit modes

Support at least:

- `cover` - artwork fills entire slot and may be cropped;
- `contain` - artwork fits inside slot and may show background if aspect differs.

Default for wall art mockups should be `cover`.

## Future perspective support

Many real mockups need perspective correction.

Out of MVP scope:

- four-corner transform;
- perspective warping;
- masking behind frame edges;
- shadow blending;
- smart object PSD support.

Future slot shape:

```json
{
  "shape": "quad",
  "points": [
    { "x": 100, "y": 100 },
    { "x": 400, "y": 120 },
    { "x": 380, "y": 500 },
    { "x": 90, "y": 480 }
  ]
}
```

## Recommended libraries

- Fabric.js for interactive template editing.
- Sharp for final image compositing.

Fabric.js should not be the only source of production truth. Production render must use stored slot data.
