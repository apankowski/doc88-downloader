function downloadPages(from, to) {
    for (i = from; i <= to; i++) {
        const pageCanvas = document.getElementById('page_' + i);
        if (pageCanvas === null) break;
        const pageNo = i;
        pageCanvas.toBlob(
            blob => {
                const anchor = document.createElement('a');
                anchor.download = 'page_' + pageNo + '.png';
                anchor.href = URL.createObjectURL(blob);
                anchor.click();
                URL.revokeObjectURL(anchor.href);
            }
            //, 'image/jpeg' // (*)
            //, 0.9          // (*)
        );
    }
}
