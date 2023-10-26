function downloadPages(from, to, format) {
  for (i = from; i <= to; i++) {
    const pageCanvas = document.getElementById("page_" + i);
    if (pageCanvas === null) break;
    const pageNo = i;
    pageCanvas.toBlob(
      (blob) => {
        const anchor = document.createElement("a");
        anchor.download = "page_" + pageNo + ".png";
        anchor.href = URL.createObjectURL(blob);
        anchor.click();
        URL.revokeObjectURL(anchor.href);
      },
      format === "jpeg" ? "image/jpeg" : undefined,
      format === "jpeg" ? 0.9 : undefined
    );
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const batchDownload = async (
  numPages,
  pageFormat = "png",
  waitInterval = 2000
) => {
  if (numPages < 0) {
    throw new Error("Page number must be a positive number");
  }

  if (pageFormat !== "png" && pageFormat !== "jpeg") {
    throw new Error("Page number must be a positive number");
  }

  for (let i = 0; i < numPages; i += 10) {
    downloadPages(i + 1, i + 10, pageFormat);
    await sleep(waitInterval);
  }
};
