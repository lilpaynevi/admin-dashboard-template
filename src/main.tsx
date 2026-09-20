import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './styles/global.css';

const container = document.getElementById('root');

// Message explicite plutôt qu'un `!` : si le `<div id="root">` disparaît de
// `index.html`, l'erreur dit quoi faire au lieu d'un « null is not an object ».
if (!container) {
  throw new Error("Élément #root introuvable dans index.html.");
}

createRoot(container).render(
  /**
   * `StrictMode` double volontairement les rendus et les effets en
   * développement, pour révéler les effets non idempotents. C'est bruyant
   * dans la console, et c'est le but : ces bugs-là se paient en production.
   */
  <StrictMode>
    <App />
  </StrictMode>,
);
