import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './pages/LandingPage'
import DashboardHome from './pages/DashboardHome'
import CategoryPage from './pages/CategoryPage'
import ToolPage from './pages/ToolPage'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/tools/:toolId" element={<ToolPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
