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
    const pageCanvas = document.getElementById('page_' + pageNo)
    if (pageCanvas === null) break
    const imageName = imageNameFor(pageNo, options)
    downloadCanvasAsImage(pageCanvas, imageName, imageFormat)
  }
}
