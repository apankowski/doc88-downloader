function getPageCanvas(pageNo) {
  return document.getElementById(`page_${pageNo}`)
}

function getPageCount() {
  const pageNumInput = document.getElementById('pageNumInput')
  if (!pageNumInput) throw new Error('Couldn\'t find element containing total page count')
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
    if (!getPageCanvas(pageNo)) throw new Error(`Couldn't find page canvas for page #${pageNo}`)
  }

  console.log('Revealed all page placeholders')
}

function waitUntilPageIsLoaded(pageNo, pageCanvas, resolve) {
  const isLoaded = pageCanvas.getAttribute('lz') === '1'
  if (!isLoaded) setTimeout(() => waitUntilPageIsLoaded(pageNo, pageCanvas, resolve), 100)
  else {
    console.log(`Loaded page #${pageNo}`)
    resolve()
  }
}

async function preloadPage(pageNo, pageCanvas) {
  console.log(`Preloading page #${pageNo}`)
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

  console.log('Finished preloading pages')
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
      throw new Error(`Unknown image format ${format}`)
  }
}

function imageFilenameFor(pageNo, { imageNamePrefix = 'page' }, { extension }) {
  return imageNamePrefix + pageNo.toString().padStart(3, '0') + extension
}

async function captureAsImageBlob(canvas, imageFormat) {
  const { mimeType, quality } = imageFormat
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob !== null) resolve(blob)
        else reject(new Error('Failed to capture canvas as image blob'))
      },
      mimeType,
      quality,
    )
  })
}

function downloadBlob(blob, filename) {
  const anchor = document.createElement('a')
  anchor.download = filename
  anchor.href = URL.createObjectURL(blob)
  anchor.click()
  URL.revokeObjectURL(anchor.href)
}

function getDocumentTitle() {
  return document.querySelector('h1')?.title
    || document.querySelector('meta[property="og:title"]')?.content
}

async function loadSupportScript(url) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    script.onload = () => resolve()
    script.onerror = (event) => reject(new Error(`Failed to load support script ${url}: ${event.type}`))
    document.head.appendChild(script)
  })
}

function pageImageHandlerFor({ archive = 'zip' }) {
  switch (archive) {
    case 'none':
      return {
        initialize: async () => {},
        handlePageImage: async (pageNo, imageBlob, imageFilename) => {
          downloadBlob(imageBlob, imageFilename)
          console.log(`Downloaded page #${pageNo}`)
        },
        finalize: async () => {},
      }
    case 'zip': {
      let zip
      return {
        initialize: async () => {
          await loadSupportScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
          zip = new JSZip()
          console.log('Initialized ZIP archive')
        },
        handlePageImage: async (pageNo, imageBlob, imageFilename) => {
          zip.file(imageFilename, imageBlob, { compression: 'DEFLATE' })
          console.log(`Added page #${pageNo} to ZIP archive`)
        },
        finalize: async () => {
          const zipFilename = (getDocumentTitle() || 'pages') + '.zip'
          const zipBlob = await zip.generateAsync({ type: 'blob' })
          downloadBlob(zipBlob, zipFilename)
          console.log('Downloaded ZIP archive')
          zip = null
        },
      }
    }
    default:
      throw new Error(`Unknown archive type ${archive}`)
  }
}

async function downloadPages(options = {}) {
  const imageFormat = imageFormatFor(options)
  const pageImageHandler = pageImageHandlerFor(options)

  revealAllPagePlaceholders()
  const { fromPage = 1, toPage = getPageCount() } = options

  await pageImageHandler.initialize()

  for (let pageNo = fromPage; pageNo <= toPage; pageNo++) {
    const pageCanvas = getPageCanvas(pageNo)
    if (!pageCanvas) break // Exit early if page number is out of range

    const imageFilename = imageFilenameFor(pageNo, options, imageFormat)

    await preloadPage(pageNo, pageCanvas)
    const imageBlob = await captureAsImageBlob(pageCanvas, imageFormat)

    await pageImageHandler.handlePageImage(pageNo, imageBlob, imageFilename)
  }

  await pageImageHandler.finalize()
  console.log(`Finished downloading pages ${fromPage}-${toPage}`)
}
