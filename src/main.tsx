// ** React Imports
import { StrictMode } from 'react';

// ** Third Party Imports
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';

// ** Local Imports
import { router } from 'src/router';

import 'src/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
