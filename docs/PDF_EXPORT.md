# Buyer PDF Export

## Purpose

The buyer PDF is the file uploaded to Etsy or included in the final package to tell customers how to access and use their digital downloads.

For large bundles, the PDF should usually contain a Google Drive folder link instead of all digital images directly attached to Etsy.

## Reference PDF behavior

The reference PDF contains two pages and includes:

- shop/brand name;
- product category line;
- thank-you message;
- large instruction telling the buyer to copy/paste the download link;
- Google Drive folder link;
- explanation that the Drive folder contains many files/formats;
- support instruction via Etsy messaging;
- review request;
- copyright and personal-use notice;
- contact email;
- shop/location footer;
- optional gift message.

The app should generate this kind of PDF from project metadata.

## MVP fields

```ts
type BuyerPdfData = {
  shopName: string
  tagline?: string
  thankYouMessage: string
  downloadInstructionTitle: string
  googleDriveUrl: string
  downloadExplanation: string
  supportMessage: string
  reviewRequest?: string
  copyrightNotice: string
  contactEmail?: string
  footerText?: string
  giftMessage?: string
}
```

## Default copy draft

```txt
Thank you very much for your purchase from {{shopName}}.
We appreciate your support and hope you enjoy your new printable artwork.

TO ACCESS YOUR DIGITAL DOWNLOADS, COPY AND PASTE THIS LINK INTO YOUR BROWSER:
{{googleDriveUrl}}

The link will take you to a Google Drive folder containing your printable files in multiple formats.
You may preview the files and download only the formats you need.

If you run into any issues, please contact us through Etsy messaging. This is the quickest way for us to help you.

We would love for you to share a review of your artwork along with a photo of it in your space.

Please note that all files are intended for personal use only. Redistribution, resale or commercial use is not allowed unless explicitly stated.
```

## Generation strategy

Recommended MVP approach:

1. Build an HTML template.
2. Inject sanitized project/PDF data.
3. Render preview in the app.
4. Use Electron `webContents.printToPDF` from the main process.
5. Save output to:

```txt
buyer-pdf/buyer-instructions.pdf
```

## Template themes

Start with one theme:

- elegant parchment/vintage paper style;
- black/neutral typography;
- optional logo;
- clear link block;
- 2 pages max.

Future themes:

- minimal black and white;
- botanical;
- modern gallery;
- feminine wellness;
- vintage paper.

## Validation

Before generating PDF:

- require shop name;
- require Google Drive URL or placeholder;
- require support text;
- require copyright/personal-use text;
- warn if link is too long or missing protocol.

## PDF output requirements

- readable at A4 or US Letter;
- no clipped text;
- link visible as plain text;
- optional clickable link if possible;
- file size reasonable;
- deterministic output path;
- overwrite only after user confirmation or version suffix.
