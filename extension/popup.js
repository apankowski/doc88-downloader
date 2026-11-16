const $ = id => document.getElementById(id)
const fields = ['format', 'quality', 'zoomSteps', 'fromPage', 'toPage', 'archive']

function showMessage(text, isError = false) {
  const message = $('message')
  message.textContent = text
  message.className = isError ? 'error' : ''
}

function updateQualityVisibility() {
  $('qualityRow').hidden = $('format').value !== 'jpg'
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('settings') || '{}')
    for (const id of fields) if (saved[id] !== undefined) $(id).value = saved[id]
  } catch (_) { /* ignore */ }
  updateQualityVisibility()
}

function saveSettings() {
  try {
    localStorage.setItem('settings', JSON.stringify(Object.fromEntries(fields.map(id => [id, $(id).value]))))
  } catch (_) { /* ignore */ }
}

function readOptions() {
  const options = {
    format: $('format').value,
    zoomSteps: parseInt($('zoomSteps').value),
    archive: $('archive').value,
  }
  if (options.format === 'jpg') options.quality = Math.min(1, Math.max(0.1, parseFloat($('quality').value) || 0.9))
  const fromPage = parseInt($('fromPage').value)
  const toPage = parseInt($('toPage').value)
  if (fromPage > 0) options.fromPage = fromPage
  if (toPage > 0) options.toPage = toPage
  return options
}

async function start() {
  saveSettings()
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab) {
    showMessage('No active tab found.', true)
    return
  }
  // tab.url is only readable with host permission; if it's known and isn't doc88, say so
  if (tab.url && !/^https:\/\/(www\.)?doc88\.com\//.test(tab.url)) {
    showMessage('Open a document on doc88.com first.', true)
    return
  }
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'start', options: readOptions() })
    if (!response?.ok) {
      showMessage(response?.error || 'Could not start.', true)
      return
    }
    $('start').disabled = true
    showMessage('Started. Progress is shown on the page. Don\'t touch the page until it finishes.')
  } catch (_) {
    showMessage('The extension isn\'t active on this tab yet. Reload the doc88 page and try again.', true)
  }
}

for (const id of fields) $(id).addEventListener('change', saveSettings)
$('format').addEventListener('change', updateQualityVisibility)
$('start').addEventListener('click', start)
loadSettings()
