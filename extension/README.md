# doc88 Downloader — Chrome extension

Same capture logic as [`downloadPages.js`](../downloadPages.js), packaged as a Manifest V3 extension
(works in Chrome, Edge, Brave and other Chromium browsers).

## Install (unpacked)

1. Open `chrome://extensions` (Edge: `edge://extensions`).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select this `extension` folder.

## Use

1. Open a document on doc88.com. If you already had the tab open before installing, reload it.
   Turn off the browser's page translation for the site.
2. Click the extension icon, choose options, and press **Download pages**.
3. Solve the slider captcha if one appears (a banner on the page tells you). Progress is shown in a banner
   at the top right of the page. Don't interact with the page until it says "Finished".

Options: image format (PNG/JPEG), resolution boost (zoom steps), page range, ZIP or separate files.

`jszip.min.js` is [JSZip](https://stuk.github.io/jszip/) 3.10.1, bundled because extensions can't load remote code.
