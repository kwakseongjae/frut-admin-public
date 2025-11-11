import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#DBEBE8]/80">
          <div className="py-6 px-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
