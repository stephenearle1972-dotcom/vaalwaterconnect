import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import config from './configs'

// Set document title dynamically based on town config
document.title = `${config.town.name} Connect | Local Business Directory`

// Update meta description if it exists
const metaDescription = document.querySelector('meta[name="description"]')
if (metaDescription) {
  metaDescription.setAttribute('content',
    `${config.town.name} Connect - Your local business directory for ${config.town.name}, ${config.town.region}, South Africa`
  )
}

// Generate and set dynamic favicon based on town config
function setDynamicFavicon() {
  const letter = config.branding.faviconEmoji
  const bgColor = config.branding.faviconColor || config.branding.colors.primary

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="${bgColor}"/>
  <text x="50" y="70" font-family="Georgia, serif" font-size="60" font-weight="bold" font-style="italic" fill="white" text-anchor="middle">${letter}</text>
</svg>`

  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  // Update or create favicon link
  let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
  if (!favicon) {
    favicon = document.createElement('link')
    favicon.rel = 'icon'
    document.head.appendChild(favicon)
  }
  favicon.type = 'image/svg+xml'
  favicon.href = url
}

setDynamicFavicon()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error("Could not find root element to mount to")
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
