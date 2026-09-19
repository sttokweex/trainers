import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'
import { App } from '@/app/App'

/**
 * Hash-роутер, а не browser: сборка в один файл открывается с file://,
 * где обычные пути не работают.
 */
const router = createHashRouter([
  { path: '/', element: <Navigate to="/interview" replace /> },
  { path: '/:packId', element: <App /> },
])

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
