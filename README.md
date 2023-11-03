# POC [doc88.com](https://doc88.com) Downloader

This is a POC downloader of documents from [doc88.com](https://doc88.com). It saves pages of a given document as PNGs or JPEGs. It doesn't have any dependencies — it's a bit of JavaScript that you paste into Developer Tools' Console. It was tested in Chrome and Firefox.

Then, having pages saved as images, a searchable PDF can be reconstructed from them.

## Step 1: Save pages as images

### Option A: Bookmark

Create a browser bookmark pasting content of [this file](bookmark.min.js) (exactly as it is) in the URL field.

From now on, clicking it on a document page will download all pages as JPEGs.

Don't interact with the page during the process until it finishes.

### Option B: Manual (finer control over the process)

1. Navigate to the desired document in your browser.
2. Make sure browser's zoom level is set to 100% — based on some tests it seems that zoom levels lower than 100% can result in lower quality of captured pages.
3. Open Developer Tools (e.g. press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd>).
4. Switch to JavaScript Console.
5. Paste [this JavaScript](downloadPages.js) in Console and confirm with <kbd>Enter</kbd>.
6. Type the following in Console and hit <kbd>Enter</kbd>:
    ```javascript
    downloadPages()
    ```
   This will download all the pages.  
   Pages will be automatically preloaded and saved one by one.  
   See [options](#options) section below for options.
7. Don't interact with the page during the process.   
   Wait until it ends, printing `Finished downloading pages` in the Console.  
   Make sure all desired pages were downloaded correctly.

#### Options

`downloadPages` function takes an optional options object:

```javascript
downloadPages({fromPage: 2, toPage: 10, quality: 0.8, imageNamePrefix: 'temp_'})
```

Possible options are:

1. `fromPage` – first page in range to be downloaded; number; default is `1`
2. `toPage` – last page in range to be downloaded; number; default is total number of pages in the document
3. `format` – downloaded image format; string; either `'jpg'` or `'png'`; default is `'jpg'`
4. `quality` – quality of images; applicable when `format` is `'jpg'`; number between `0` and `1`; default is `0.9`
5. `imageNamePrefix` – prefix for names of downloaded images; string; default is `'page'` (resulting in downloaded file names e.g.: `page001.jpg`, `page002.jpg`, etc. assuming `format` is `'jpg'`)

## Step 2: Converting images back to a PDF

Under Linux you can easily convert downloaded images back to a PDF.

1. Install ImageMagick package:
    ```shell
    sudo apt-get install imagemagick
    ```
2. If you want the PDF to be OCRed (recognize the text in it and make it searchable), install the OCRmyPDF package:
    ```shell
    sudo apt-get install ocrmypdf
    ```
3. Use the [convert-images-to-pdf.sh](convert-images-to-pdf.sh) script to convert downloaded images back to a PDF, e.g.:
    ```shell
    ./convert-images-to-pdf.sh image-directory output.pdf
    ```
   Run it with `-h` argument for help.

### Troubleshooting

If you see errors from ImageMagick with the message "attempt to perform an operation not allowed by the security policy 'PDF'", see [this StackOverflow question](https://stackoverflow.com/q/52998331/1820695) and answers for a likely quick fix.

## Developing

1. Run `build-bookmark.sh` to update minified bookmark code in `bookmark.min.js`.
