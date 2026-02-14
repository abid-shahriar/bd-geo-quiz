// ** React Imports
import { StrictMode } from 'react';

// ** Third Party Imports
import { createRoot } from 'react-dom/client';

// ** Local Imports
import 'src/index.css';
import App from 'src/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
