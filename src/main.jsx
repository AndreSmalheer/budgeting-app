import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Header from './components/Header/Header'
import StarterInhoud from './pages/Starter-inhoud/Starter-inhoud'

function  App() {
    return(
        <>
        <Header className="Mobile"/>

        </>
    )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
