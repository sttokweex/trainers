import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'
import { App } from '@/app/App'
import { DEFAULT_PACK } from '@/content'

/**
 * Hash-роутер, а не browser: сборка в один файл открывается с file://,
 * где обычные пути не работают.
 */
const router = createHashRouter([
  { path: '/', element: <Navigate to={`/${DEFAULT_PACK}`} replace /> },
  { path: '/:packId', element: <App /> },
])

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </StrictMode>,
)
