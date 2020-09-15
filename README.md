# POC [doc88.com](https://doc88.com) Downloader

This is a POC downloader of documents from [doc88.com](https://doc88.com). It saves pages of a given document as PNGs or JPEGs. It doesn't have any dependencies — it's a bit of JavaScript that you paste into Developer Tools' Console. It was tested in Chrome and Firefox.

## Instructions

The download procedure is a bit of a PITA, but hey… it's a POC.

 1. Navigate to the desired document in your browser.
 1. Make sure browser's zoom level is set to 100% — based on some tests it seems that zoom levels lower than 100% can result in lower quality of captured pages.
 1. Scroll through all the pages in the document, one by one, and make sure all of them have loaded. Depending on the document this might be the most arduous part of the process.
 1. Open Developer Tools (e.g. press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd>).
 1. Switch to JavaScript Console.
 1. For PNGs paste [this JavaScript](/downloadPagesAsPngs.js) in Console and confirm with <kbd>Enter</kbd>.
 1. For JPEGs paste [this JavaScript](/downloadPagesAsJpegs.js) in Console and confirm with <kbd>Enter</kbd>.
 1. Download pages in batches. Type:
    ```javascript
    downloadPages(1, 10)
    ```
    in Console and hit <kbd>Enter</kbd> to download pages 1 through 10.

      *  ℹ It is advised to download 10 pages at a time. After saving a batch of pages simply enter `downloadPages(11, 20)` to download pages 11 through 20, and so on.
      *  ℹ In case of Chrome, the first time you download a batch of pages you may see a popup stating that "This site is attempting to download multiple files". You have to allow it as each page is downloaded as a separate file.

 1. Make sure all desired pages were downloaded correctly.

That's it!

## Converting downloaded images back to a PDF

Under Linux you can easily convert downloaded images back to a PDF.
You will need ImageMagick package first:

```shell script
sudo apt-get install imagemagick
```

Then — in directory in which the images are — issue the following command which will produce `output.pdf` PDF file from the images:

```shell script
convert $(ls -1v *.jpg *.png 2>/dev/null | tr '\n' ' ') output.pdf
```

If you further want to OCR the PDF (recognize the text in it and make it searchable), install the OCRmyPDF package:

```shell script
sudo apt-get install ocrmypdf
```

Then — in directory in which the PDF is — issue the following command which will perform text recognition in the `output.pdf` PDF and make it searchable:

```shell script
ocrmypdf output.pdf output.pdf
```
