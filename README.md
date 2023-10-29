# POC [doc88.com](https://doc88.com) Downloader

This is a POC downloader of documents from [doc88.com](https://doc88.com). It saves pages of a given document as PNGs or JPEGs. It doesn't have any dependencies — it's a bit of JavaScript that you paste into Developer Tools' Console. It was tested in Chrome and Firefox.

## Instructions

The download procedure is a bit of a PITA, but hey… it's a POC.

1. Navigate to the desired document in your browser.
2. Make sure browser's zoom level is set to 100% — based on some tests it seems that zoom levels lower than 100% can result in lower quality of captured pages.
3. Open Developer Tools (e.g. press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd>).
4. Switch to JavaScript Console.
5. Paste [this JavaScript](downloadPages.js) in Console and confirm with <kbd>Enter</kbd>.
6. Load all PDF pages. Type:
    ```javascript
    preloadAllPages()
    ```
   in Console and hit <kbd>Enter</kbd>. Wait until the process ends, printing `Finished preloading pages` in the Console.
7. Download pages in batches. Type:
   ```javascript
   downloadPages(1, 10)
   ```
   in Console and hit <kbd>Enter</kbd> to download pages 1 through 10.
    * ℹ It is advised to download 10 pages at a time. After saving a batch of pages simply enter `downloadPages(11, 20)` to download pages 11 through 20, and so on.
    * ℹ In case of Chrome, the first time you download a batch of pages you may see a popup stating that "This site is attempting to download multiple files". You have to allow it as each PDF page is downloaded as a separate file.
    * See [options](#options) section below for options.
8. Make sure all desired pages were downloaded correctly.

### Options

`downloadPages` function takes options object as the 3rd optional argument, e.g.:

```javascript
downloadPages(1, 10, {quality: 0.8, imageNamePrefix: 'temp_'})
```

Possible options:

1. `format` – downloaded image format; string; either `'jpg'` or `'png'`; default is `'jpg'`
2. `quality` – quality of images; applicable when `format` is `'jpg'`; number between `0` and `1`; default is `0.9`
3. `imageNamePrefix` – prefix for names of downloaded images; string; default is `'page'` (resulting in downloaded file names e.g.: `page001.jpg`, `page002.jpg`, etc. assuming `format` is `'jpg'`)

## Bulk download

You can bulk download all the pages without the browser block to this behavior by running [this JavaScript](batchDownloadAll.js) in Console and confirming with <kbd>Enter</kbd>. It downloads all the images in 10 page blocks waiting for a timeout so the Browser does not block this operation.

Download pages in batches. Type:

```javascript
const numPages = 100; // Your number of pages
batchDownload(numPages);
```

You can also specify the images format and the desired wait interval between downloads:

```javascript
const numPages = 100; // Your number of pages
const format = 'jpeg'; // JPEG image format
const interval = 1000; // 1000 milliseconds
batchDownload(numPages, format, interval);
```

## Converting downloaded images back to a PDF

Under Linux you can easily convert downloaded images back to a PDF.

To do that:

1. Install ImageMagick package:
    ```shell
    sudo apt-get install imagemagick
    ```
2. If you want the PDF to be OCRed (recognize the text in it and make it searchable), install the OCRmyPDF package:
    ```shell
    sudo apt-get install ocrmypdf
    ```
3. Use the [convert-images-to-pdf.sh](convert-images-to-pdf.sh) script to convert downloaded images back to a PDF. Run it with `-h` argument for help.

### Troubleshooting

If you see errors from ImageMagick with the message "attempt to perform an operation not allowed by the security policy 'PDF'", see [this StackOverflow question](https://stackoverflow.com/q/52998331/1820695) and answers for a likely quick fix.
