# POC [doc88.com](https://doc88.com) Downloader

This is a POC downloader of documents from [doc88.com](https://doc88.com). It saves pages of a given document as PNGs or JPEGs. It doesn't have any dependencies — it's a bit of JavaScript that you can paste into Developer Tools' Console or create a Bookmark. It was tested in Chrome and Firefox.

Then, having pages saved as images, a searchable PDF can be reconstructed from them.

## Step 1: Save pages of a document as images

Create a browser bookmark, pasting content of [this file](bookmark.min.js) (exactly as it is) in its URL field.

From now on, clicking the bookmark on a document page will capture all pages as JPEGs, bundle them in a ZIP archive and download it.

> [!IMPORTANT]  
> Don't interact with the browser during the process.  
> Be patient, especially with large documents containing hundreds of pages.  
> You can assess the progress of the process in doc88's page selector (e.g. "17 / 42").  
> Check that all desired pages were captured correctly.


## Step 2: Converting images back to a PDF

Under Linux you can easily convert downloaded images back to a PDF.

1. Install img2pdf package :
    ```shell
    sudo apt-get install img2pdf
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
