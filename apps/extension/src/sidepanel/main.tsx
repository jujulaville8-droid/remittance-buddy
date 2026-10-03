import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { I18nProvider } from '../components/I18nProvider'
import '../styles/globals.css'

const root = document.getElementById('root')
if (root) {
  document.body.style.minWidth = '0'
  createRoot(root).render(
    <StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </StrictMode>
  )
}
