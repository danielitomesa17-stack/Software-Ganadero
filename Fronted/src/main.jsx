import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from "./routes/AppRouter.jsx";
import './assets/index.css' // Verifica que esta ruta también sea correcta

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)
