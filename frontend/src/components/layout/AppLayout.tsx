import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ marginLeft: 256, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopNavbar />
        <main style={{ marginTop: 64, flex: 1, background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
