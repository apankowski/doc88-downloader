// Content script: runs on doc88.com pages. Based on ../downloadPages.js, adapted for an extension:
// JSZip is bundled (jszip.min.js is loaded before this file) and progress is shown in an on-page banner.

;(() => {
  if (window.__doc88DownloaderLoaded) return
  window.__doc88DownloaderLoaded = true

  let running = false
  let baseCanvasWidth = null // CSS width of pages at default zoom; set before zooming in

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  // ---- Status banner ----

  let banner
  function setStatus(text, { done = false } = {}) {
    if (!banner) {
      banner = document.createElement('div')
      banner.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483647;max-width:320px;' +
        'padding:10px 14px;border-radius:8px;background:#1f2937;color:#fff;font:14px/1.4 sans-serif;' +
        'box-shadow:0 2px 12px rgba(0,0,0,.4);'
      document.documentElement.appendChild(banner)
    }
    banner.textContent = text
    if (done) setTimeout(() => { banner.remove(); banner = null }, 8000)
  }

  // ---- Page helpers ----

  function getPageCanvas(pageNo) {
    return document.getElementById(`page_${pageNo}`)
  }

  function getPageCount() {
    const pageNumInput = document.getElementById('pageNumInput')
    if (!pageNumInput) throw new Error('Couldn\'t find element containing total page count')
    const parsed = parseInt(pageNumInput.parentNode.innerText.replaceAll(' ', '').replaceAll('/', ''))
    if (!isNaN(parsed)) return parsed
    // Fallback: the count may be rendered as words (e.g. when the browser auto-translates the page)
    const pageNumbers = [...document.querySelectorAll('canvas')]
      .map(c => /^page_(\d+)$/.exec(c.id))
      .filter(Boolean)
      .map(m => parseInt(m[1]))
    if (pageNumbers.length === 0) throw new Error('Couldn\'t determine total page count')
    return Math.max(...pageNumbers)
  }

  function waitUntilElementDisappears(element) {
    return new Promise(resolve => {
      const observer = new MutationObserver(() => {
        if (!element.isConnected) {
          observer.disconnect()
          resolve()
        }
      })
      observer.observe(document, { childList: true, subtree: true })
    })
  }

  async function revealAllPagePlaceholders() {
    let recheck
    let continueClicks = 0
    do {
      recheck = false

      const continueButton = document.getElementById('continueButton')
      if (continueButton != null) {
        if (++continueClicks > 20) throw new Error('The "continue" button keeps reappearing; click it manually and try again')
        recheck = true
        continueButton.click()
        await sleep(1000)
      }

      const captcha = document.getElementById('captcha_reading')
      if (captcha != null) {
        recheck = true
        captcha.scrollIntoView()
        setStatus('Solve the captcha: slide the ">>" button to the correct position. The download resumes automatically.')
        await waitUntilElementDisappears(captcha)
      }

      const continuePlaceholder = document.getElementById('continue_page')
      if (continuePlaceholder != null) {
        recheck = true
        continuePlaceholder.scrollIntoView()
        setStatus('Pages are protected by an unknown mechanism. Try resolving it manually; the download resumes once it disappears.')
        await waitUntilElementDisappears(continuePlaceholder)
      }
    } while (recheck)

    const pageCount = getPageCount()
    for (let pageNo = 1; pageNo <= pageCount; pageNo++) {
      if (!getPageCanvas(pageNo)) throw new Error(`Couldn't find page canvas for page #${pageNo}`)
    }
  }

  // A page is rendered once doc88 sets its "lz" attribute to the current zoom factor
  // ("1" at default zoom; after zooming in, the page's CSS width relative to its original width).
  // Independent of devicePixelRatio, so it works with OS display scaling too.
  function isPageLoaded(pageCanvas) {
    const lz = parseFloat(pageCanvas.getAttribute('lz'))
    const expectedZoom = baseCanvasWidth ? parseInt(pageCanvas.style.width) / baseCanvasWidth : 1
    return !isNaN(lz) && Math.abs(lz - expectedZoom) < 0.05
  }

  async function preloadPage(pageCanvas) {
    pageCanvas.scrollIntoView()
    while (!isPageLoaded(pageCanvas)) await sleep(100)
  }

  // Each doc88 zoom-in step makes pages render at a higher pixel resolution.
  async function zoomIn(steps) {
    const zoomInButton = document.getElementById('zoomInButton')
    if (!zoomInButton) return
    // The button is <a href="javascript:;">. Clicking it from an extension would also try to follow that
    // javascript: URL, which the extension's CSP blocks (and logs as an error). The page's own click
    // handler still runs, so just cancel the default navigation.
    zoomInButton.addEventListener('click', event => event.preventDefault())
    for (let i = 0; i < steps; i++) {
      zoomInButton.click()
      await sleep(1000)
    }
  }

  // ---- Output ----

  function imageFormatFor({ format = 'png', quality = 0.9 }) {
    switch (format.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        return { mimeType: 'image/jpeg', extension: '.jpg', quality }
      case 'png':
        return { mimeType: 'image/png', extension: '.png' }
      default:
        throw new Error(`Unknown image format ${format}`)
    }
  }

  function imageFilenameFor(pageNo, { imageNamePrefix = 'page' }, { extension }) {
    return imageNamePrefix + pageNo.toString().padStart(3, '0') + extension
  }

  function captureAsImageBlob(canvas, { mimeType, quality }) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => blob !== null ? resolve(blob) : reject(new Error('Failed to capture canvas as image blob')),
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
    setTimeout(() => URL.revokeObjectURL(anchor.href), 10000)
  }

  function getDocumentTitle() {
    const title = document.querySelector('h1')?.title || document.querySelector('meta[property="og:title"]')?.content
    return title?.replace(/[\\/:*?"<>|]/g, '_')
  }

  // ---- Main ----

  // Pages are captured at screen resolution; this is the DPI assumed when sizing PDF pages.
  const ASSUMED_DPI = 150
  const POINTS_PER_PIXEL = 72 / ASSUMED_DPI

  async function addPageToPdf(pdf, imageBlob, mimeType) {
    const bytes = new Uint8Array(await imageBlob.arrayBuffer())
    const image = mimeType === 'image/png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes)
    const width = image.width * POINTS_PER_PIXEL
    const height = image.height * POINTS_PER_PIXEL
    pdf.addPage([width, height]).drawImage(image, { x: 0, y: 0, width, height })
  }

  async function downloadPages(options) {
    const imageFormat = imageFormatFor(options)
    const archive = options.archive ?? 'zip'
    const usePdf = archive === 'pdf'
    const useZip = archive === 'zip'
    if (useZip && typeof JSZip === 'undefined') throw new Error('JSZip failed to load')
    if (usePdf && typeof PDFLib === 'undefined') throw new Error('The PDF library failed to load')

    await revealAllPagePlaceholders()

    const firstCanvas = getPageCanvas(1)
    baseCanvasWidth = parseInt(firstCanvas.style.width) / (parseFloat(firstCanvas.getAttribute('lz')) || 1)
    const zoomSteps = options.zoomSteps ?? 3
    if (zoomSteps > 0) setStatus('Zooming in for higher resolution…')
    await zoomIn(zoomSteps)

    const pageCount = getPageCount()
    const fromPage = options.fromPage || 1
    const toPage = Math.min(options.toPage || pageCount, pageCount)
    const zip = useZip ? new JSZip() : null
    const pdf = usePdf ? await PDFLib.PDFDocument.create() : null

    for (let pageNo = fromPage; pageNo <= toPage; pageNo++) {
      const pageCanvas = getPageCanvas(pageNo)
      if (!pageCanvas) break
      setStatus(`Capturing page ${pageNo} of ${toPage}…`)

      await preloadPage(pageCanvas)
      const imageBlob = await captureAsImageBlob(pageCanvas, imageFormat)
      const imageFilename = imageFilenameFor(pageNo, options, imageFormat)

      if (pdf) await addPageToPdf(pdf, imageBlob, imageFormat.mimeType)
      else if (zip) zip.file(imageFilename, imageBlob, { compression: 'DEFLATE' })
      else downloadBlob(imageBlob, imageFilename)
    }

    if (pdf) {
      setStatus('Saving PDF…')
      const title = getDocumentTitle() || 'document'
      pdf.setTitle(title)
      pdf.setCreator('doc88 Downloader')
      downloadBlob(new Blob([await pdf.save()], { type: 'application/pdf' }), title + '.pdf')
    }

    if (zip) {
      setStatus('Building ZIP archive…')
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(zipBlob, (getDocumentTitle() || 'pages') + '.zip')
    }
    setStatus(`Finished: pages ${fromPage}-${toPage} saved.`, { done: true })
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'ping') {
      sendResponse({ ok: true, running })
      return
    }
    if (message?.type !== 'start') return
    if (running) {
      sendResponse({ ok: false, error: 'A download is already running on this page.' })
      return
    }
    running = true
    sendResponse({ ok: true })
    downloadPages(message.options || {})
      .catch(error => {
        console.error(error)
        setStatus(`Download failed: ${error.message}`, { done: true })
      })
      .finally(() => { running = false })
  })
})()
