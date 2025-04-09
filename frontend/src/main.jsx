import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PageLayout from './components/PageLayout.jsx'
import Home from './components/Home.jsx'
import WalletGuide from './components/WalletGuide.jsx'
import ProjectPage from './components/ProjectPage.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {
        path: '',
        element: <Home/>
      },
      {
        path: 'guide',
        element: <WalletGuide/>
      },
      {
        path: 'projects',
        element: <PageLayout/>,
        children: [
          {
            path: ':id',
            element: <ProjectPage/>
          }
        ]
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode>,
)
