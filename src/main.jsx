import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import './styles/global.css'
import './styles/header.css'
import './styles/header-overrides.css'
import './styles/mobile-menu.css'
import './styles/landing.css'
import './styles/hero.css'
import './styles/dashboard.css'
import './styles/dashboard-responsive.css'
import './styles/community-page.css'
import './styles/devotional-page.css'
import './styles/media-page.css'
import './styles/extras.css'
import './styles/footer.css'
import './styles/responsive.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
