import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log("Main.tsx: application starting...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Main.tsx: 'root' element not found!");
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log("Main.tsx: App rendered into root");
  } catch (err) {
    console.error("Main.tsx: Error rendering app", err);
  }
}
