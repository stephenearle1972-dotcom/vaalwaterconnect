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

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error("Could not find root element to mount to")
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
