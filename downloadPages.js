function getPageCanvas(pageNo) {
  return document.getElementById('page_' + pageNo)
}

function getPageCount() {
  const pageNumInput = document.getElementById('pageNumInput')
  if (!pageNumInput) throw new Error("Couldn't find element containing total page count")
  return parseInt(pageNumInput.parentNode.innerText.replaceAll(' ', '').replaceAll('/', ''))
}

function revealAllPagePlaceholders() {
  let continueButton
  while ((continueButton = document.getElementById('continueButton')) != null) {
    continueButton.click()
  }

  // Sanity check: make sure page canvases exist for all expected pages
  const pageCount = getPageCount()
  for (let pageNo = 1; pageNo <= pageCount; pageNo++) {
    if (!getPageCanvas(pageNo)) throw new Error("Couldn't find page canvas for page #" + pageNo)
  }
  console.log("Revealed all page placeholders")
}

function waitUntilPageIsLoaded(pageNo, pageCanvas, resolve) {
  const isLoaded = pageCanvas.getAttribute("lz") === "1"
  if (!isLoaded) setTimeout(() => waitUntilPageIsLoaded(pageNo, pageCanvas, resolve), 100)
  else {
    console.log("Loaded page #" + pageNo)
    resolve()
  }
}

async function preloadPage(pageNo, pageCanvas) {
  console.log("Preloading page #" + pageNo)
  pageCanvas.scrollIntoView()
  return new Promise(resolve => waitUntilPageIsLoaded(pageNo, pageCanvas, resolve))
}

// Keep for debugging purposes
async function preloadAllPages() {
  revealAllPagePlaceholders()
  const pageCount = getPageCount()
  for (let pageNo = 1; pageNo <= pageCount; pageNo++) {
    const pageCanvas = getPageCanvas(pageNo)
    await preloadPage(pageNo, pageCanvas)
  }
  console.log("Finished preloading pages")
}

function imageNameFor(pageNo, { imageNamePrefix = 'page' }) {
  return imageNamePrefix + pageNo.toString().padStart(3, "0")
}

function imageFormatFor({ format = 'jpg', quality = 0.9 }) {
  switch (format.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return {
        mimeType: 'image/jpeg',
        extension: '.jpg',
        quality: quality,
      }
    case 'png':
      return {
        mimeType: 'image/png',
        extension: '.png',
      }
    default:
      throw new Error("Unknown image format " + format)
  }
}

function downloadCanvasAsImage(canvas, imageName, imageFormat) {
  const { mimeType, extension, quality } = imageFormat
  canvas.toBlob(
    blob => {
      const anchor = document.createElement('a')
      anchor.download = imageName + extension
      anchor.href = URL.createObjectURL(blob)
      anchor.click()
      URL.revokeObjectURL(anchor.href)
    },
    mimeType,
    quality,
  )
}

async function downloadPages(options = {}) {
  revealAllPagePlaceholders()

  const imageFormat = imageFormatFor(options)
  const { fromPage = 1, toPage = getPageCount() } = options

  for (let pageNo = fromPage; pageNo <= toPage; pageNo++) {
    const pageCanvas = getPageCanvas(pageNo)
    if (!pageCanvas) break // Exit early if page number is out of range

    const imageName = imageNameFor(pageNo, options)
    await preloadPage(pageNo, pageCanvas).then(() => {
      downloadCanvasAsImage(pageCanvas, imageName, imageFormat)
      console.log("Downloaded page #" + pageNo)
    })
  }
  console.log("Finished downloading pages " + fromPage + "-" + toPage)
}
