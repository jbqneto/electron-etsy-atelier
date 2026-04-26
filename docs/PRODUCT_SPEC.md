# Product Specification

## Product name

Working name: **The Atelier Desktop**

Alternative future commercial names:

- ListingForge
- ArtListing Studio
- PrintForge Studio
- MockupForge

## One-line description

A local-first desktop production studio for Etsy digital wall art sellers, focused on research notes, prompt planning, image processing, mockup creation, buyer PDF generation and final package export.

## Problem

The current workflow is fragmented:

- idea research happens manually;
- prompts are written separately;
- generated images are downloaded and organized manually;
- upscaling takes time and is hard to coordinate;
- printable ratios need repeated manual processing;
- mockup templates and generated mockups are handled in a web tool;
- project folders require manual organization;
- buyer PDFs require manual preparation;
- Google Drive folders are created manually;
- Etsy listing publishing is not automated.

The desktop app should reduce manual folder handling and turn the workflow into a repeatable pipeline.

## Target user

Primary user:

- an Etsy digital wall art seller who creates image collections with AI tools;
- works with printable image packs;
- creates mockups and buyer instruction PDFs;
- wants local control over files and repeatable exports.

Initial user:

- the project owner himself.

Future users:

- Etsy sellers;
- digital product creators;
- print-on-demand sellers;
- creators who need fast mockup generation and listing package automation.

## Standard listing workflow

The app must support the following end-to-end workflow.

### 1. Market research

The user studies the Etsy market manually:

- product idea;
- demand signals;
- trending styles;
- competitor references;
- price range;
- bundle size;
- common image orientations;
- listing title patterns;
- mockup style patterns;
- keyword/tag ideas.

MVP behavior:

- provide a structured screen to save research notes;
- no automatic Etsy API or scraping yet.

### 2. Concept planning

The user defines:

- collection idea;
- visual style;
- color palette;
- target customer;
- number of artworks;
- vertical/horizontal split;
- target ratios;
- listing title draft;
- listing description draft;
- Etsy tags.

### 3. Prompt planning

The user creates prompts for image generation tools.

Each prompt should store:

- prompt text;
- negative prompt or constraints, if any;
- target orientation;
- target artwork number;
- generation tool;
- model notes;
- seed/reference image notes;
- status.

### 4. Image generation and import

The user creates images outside the app using tools such as ChatGPT Image or Leonardo AI.

Then the app imports generated files into the project.

MVP behavior:

- import images from file dialog or drag-and-drop;
- copy files into the project `source-artworks/` folder;
- create `ProjectAsset` metadata records;
- show thumbnails in project view.

### 5. Upscaling

Generated images are often not large enough for high-quality printable 300 DPI outputs.

The app should queue upscaling jobs.

MVP behavior:

- store upscaling jobs;
- allow manual configuration of external upscaler path;
- execute external upscaler through a safe adapter;
- keep job logs and status;
- do not block the UI.

### 6. Printable ratio generation

After upscaling, the app generates printable variants based on artwork orientation.

Examples:

- vertical artwork -> 2:3, 3:4, 4:5, 5:7, 11:14, ISO if configured;
- horizontal artwork -> 3:2, 4:3, 5:4, 7:5, 14:11, ISO landscape if configured.

The actual ratios and target sizes must be configurable.

### 7. Mockup generation

The app generates listing images using reusable mockup templates.

Important workflow detail:

- mockup generation can happen while upscaling is running;
- mockups may use original source artwork for speed;
- final high-resolution mockups may later be regenerated from upscaled artwork if needed.

Mockup generation uses two sub-tools:

1. **Mockup Template Builder**
   - import base background image;
   - draw one or more frame slots;
   - store slot coordinates in SQLite;
   - generate template thumbnail.

2. **Mockup Composer**
   - select a saved template;
   - assign project artwork to each frame slot;
   - adjust visual crop per slot;
   - export final mockup image.

### 8. Buyer PDF generation

The app generates a buyer instruction PDF.

The attached reference PDF contains:

- brand/shop name;
- thank-you message;
- Google Drive download link;
- instructions to copy/paste the download link;
- explanation that files are hosted on Google Drive;
- support instructions via Etsy messaging;
- review request;
- copyright/personal-use notice;
- contact email;
- optional gift message.

MVP behavior:

- user manually enters the Google Drive link;
- app generates a PDF from a configurable template;
- app stores the PDF in the project export folder.

### 9. Google Drive integration

Planned for v2.

Goal:

- upload final customer files to Drive;
- create or reuse a Drive folder;
- store folder URL in project;
- use that URL in the buyer PDF.

### 10. Etsy API integration

Planned for v3.

Goal:

- create draft listing;
- upload listing images;
- upload/attach digital files or buyer PDF;
- sync listing metadata;
- maybe monitor listing comments/reviews later.

## Feature list

### Project dashboard

Must show:

- project name;
- status;
- progress checklist;
- number of source artworks;
- number of upscaled artworks;
- number of printable variants;
- number of generated mockups;
- buyer PDF status;
- export package status.

### Research board

Fields:

- market idea;
- target niche;
- Etsy search terms;
- competitor links;
- observations;
- price notes;
- bundle size notes;
- visual style notes;
- opportunity score, manual for now.

### Prompt board

Fields:

- prompt set title;
- prompt text;
- artwork index;
- orientation;
- target ratio family;
- generation tool;
- status;
- linked output file after import.

### Artwork manager

Actions:

- import image;
- rename;
- assign number/order;
- mark as vertical/horizontal/square;
- open containing folder;
- send to upscale queue;
- send to ratio generation queue;
- send to mockup composer.

### Mockup Template Builder

Actions:

- import background;
- draw frame slot;
- select frame slot;
- move/resize/rotate slot;
- rename slot;
- delete slot;
- save template;
- generate thumbnail;
- store metadata in SQLite.

### Mockup Composer

Actions:

- choose template;
- assign artwork to each slot;
- clear assignment;
- adjust visual crop;
- generate preview;
- export final listing image;
- batch generate multiple mockups.

### Image processing jobs

Actions:

- enqueue upscale;
- enqueue ratio generation;
- enqueue mockup generation;
- retry failed job;
- cancel pending job;
- view logs.

### Export package

Actions:

- build final export folder;
- include printable variants;
- include mockups;
- include buyer PDF;
- include listing metadata;
- optional ZIP.

## MVP acceptance criteria

The MVP is successful when the user can:

1. select a local workspace;
2. create a project;
3. import generated artwork images;
4. create a mockup template from a background image;
5. draw and save frame coordinates;
6. select a mockup template;
7. assign artwork to frame slots;
8. export at least one mockup image;
9. generate printable ratios using Sharp;
10. generate a buyer instruction PDF with a manual Drive link;
11. build a final export folder.

## Non-goals for MVP

- No Etsy API publishing.
- No Google Drive upload automation.
- No automatic market scraping.
- No direct AI image generation.
- No collaborative cloud accounts.
- No payment or licensing system.
- No generic free-form design editor.
