import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
// import App from './screens/App.jsx'
// import LandingPage from './screens/landingPage.jsx'
import ShowtimesPage from './screens/ShowtimesPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ShowtimesPage />
  </StrictMode>,
)

