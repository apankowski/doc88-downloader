function getPageCanvas(pageNo) {
  return document.getElementById('page_' + pageNo)
}

function getPageCount() {
  const pageNumInput = document.getElementById('pageNumInput')
  if (!pageNumInput) {
    throw new Error("Couldn't find element containing total page count")
  }
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

function waitUntilPageIsLoaded(pageNo, pageCanvas, resolve){
  const isLoaded = pageCanvas.getAttribute("lz") === "1"
  if (isLoaded) {
    console.log("Loaded page #" + pageNo)
    resolve()
  }
  else {
    setTimeout(() => waitUntilPageIsLoaded(pageNo, pageCanvas, resolve), 100)
  }
}

async function preloadPage(pageNo) {
  console.log("Preloading page #" + pageNo)
  const pageCanvas = getPageCanvas(pageNo)
  pageCanvas.scrollIntoView()
  return new Promise((resolve) => waitUntilPageIsLoaded(pageNo, pageCanvas, resolve))
}

async function preloadAllPages() {
  revealAllPagePlaceholders()
  const pageCount = getPageCount()
  for (let pageNo = 1; pageNo <= pageCount; pageNo++) {
    await preloadPage(pageNo)
  }
  console.log("Finished preloading pages")
}

function imageNameFor(pageNo, {imageNamePrefix = 'page'}) {
  return imageNamePrefix + pageNo.toString().padStart(3, "0")
}

function imageFormatFor({format = 'jpg', quality = 0.9}) {
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
  const {mimeType, extension, quality} = imageFormat
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

function downloadPages(from, to, options = {}) {
  const imageFormat = imageFormatFor(options)

  for (let pageNo = from; pageNo <= to; pageNo++) {
    const pageCanvas = getPageCanvas(pageNo)
    if (pageCanvas === null) break
    const imageName = imageNameFor(pageNo, options)
    downloadCanvasAsImage(pageCanvas, imageName, imageFormat)
  }
}
