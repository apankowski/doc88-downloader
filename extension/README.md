# doc88 Downloader — Chrome extension

A browser extension that saves the pages of a [doc88.com](https://doc88.com) document as images, a ZIP archive
or a single PDF. It works in Chrome, Edge, Brave and other Chromium browsers (Manifest V3).

It does the same job as the [bookmark / console script](../README.md), with a popup for choosing options
instead of editing code.

## Install (unpacked)

1. Open `chrome://extensions` (Edge: `edge://extensions`).
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this `extension` folder.
4. Optional: pin the extension from the puzzle-piece menu so its icon is always visible.

To update after changing the files, click the reload icon on the extension's card, then reload any open doc88 tab.

## Use

1. Open a document on doc88.com (a page like `https://www.doc88.com/p-1234567890.html`).
   - If the tab was already open before you installed or reloaded the extension, **reload the tab**.
   - Turn off the browser's page translation for the site (see [Troubleshooting](#troubleshooting)).
2. Click the extension icon, choose your options, and press **Download pages**.
3. Wait while a banner at the top right of the page shows progress. **Keep the doc88 tab in front and don't
   scroll or click on the page**: doc88 only renders pages while they are visible.
4. If doc88 asks for a slider captcha, the banner tells you. Slide the `>>` button to the correct position; the
   download then continues by itself.
5. When the banner says "Finished", the file is in your downloads folder.

## Options

| Option | What it does | Default |
|---|---|---|
| **Image format** | **PNG** is lossless but gives large files. **JPEG** is smaller; its quality (0.1–1) can be set. | PNG |
| **Resolution boost** | Clicks doc88's zoom-in button 0–5 times before capturing, so doc88 renders pages larger (about 690 px wide at 0, about 1390 px at 3). More steps mean sharper but larger images and a slower capture. | 3 |
| **From page / To page** | Capture only a range of pages. Leave blank for the whole document. | all |
| **Output** | **ZIP archive of images**: one ZIP, named after the document. **Separate image files**: one download per page (Chrome may ask you to allow multiple downloads). **PDF**: one PDF with every page. | ZIP |

Your choices are remembered between uses.

### About the PDF output

The PDF contains the captured page images only. It has **no text layer**, so you can't search or copy text out
of it directly. To make it searchable, open it in a PDF viewer with OCR, for example Chrome's built-in viewer
or Adobe Acrobat (**Scan & OCR → Recognize Text**).

PDF pages are sized assuming 150 DPI, so a 1390 px wide capture becomes a page of about 667 × 942 pt (a little
larger than A4).

## How it works

doc88 draws every page of a document onto a `<canvas>` element. The extension:

1. Clicks through doc88's "continue reading" button and waits for any captcha to be solved.
2. Optionally zooms in so doc88 re-renders the pages at a higher resolution.
3. Scrolls to each page, waits until it has been rendered, and copies the canvas as a PNG or JPEG.
4. Bundles the images into a ZIP or a PDF (or downloads them one by one).

The capture logic is the same as in [`downloadPages.js`](../downloadPages.js).

## Privacy and permissions

- The extension only has access to `doc88.com` (declared in `manifest.json`). It does not read any other site.
- Everything happens locally in your browser. Nothing is uploaded, and the extension makes no network requests
  of its own.
- The saved options are stored locally in the popup (browser `localStorage`).

## Troubleshooting

- **"The extension isn't active on this tab yet. Reload the doc88 page…"**: reload the doc88 tab and try again.
- **The popup says to open a doc88 document**: the active tab isn't on doc88.com, or it isn't a document page.
- **Page translation is on** (Chrome shows a translate bar for the Chinese page): turn it off for doc88.
  Translation changes the page's text, for example it rewrites the page count as words, which can break
  capturing. In Chrome, use the translate icon in the address bar and choose "Never translate this site".
- **Nothing happens or it stops on a page**: check that the page isn't waiting on a captcha, and keep the tab in
  front. Open DevTools (`F12`) and look at the Console for errors.
- **Zoom has no effect**: some documents ignore zooming. The capture still works, at the default size.
- **Errors listed on `chrome://extensions` after an update**: Chrome keeps old entries. Click **Clear all** on the
  extension's Errors page, reload the doc88 tab and try again.
- **Very large downloads**: PNG at a high zoom level can produce hundreds of MB for long documents. Use JPEG or a
  lower resolution boost, or capture a page range at a time.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension definition (Manifest V3), permissions and the scripts to load on doc88 pages. |
| `popup.html`, `popup.js` | The options popup. It sends the chosen options to the page. |
| `content.js` | Runs on doc88 pages: captures the pages and builds the ZIP / PDF, and shows the progress banner. |
| `jszip.min.js` | [JSZip](https://stuk.github.io/jszip/) 3.10.1, used for the ZIP output. |
| `lib/pdf-lib.min.js` | [pdf-lib](https://pdf-lib.js.org/) 1.17.1, used for the PDF output. License in `lib/licenses/`. |

The libraries are bundled because extensions can't load remote code.
