import { Navigate, Outlet } from 'react-router-dom'
import { authStorage } from '@/lib/auth'

const ProtectedRoute = () => {
  const user = authStorage.getUser()
  const isAdmin = authStorage.isAdmin()

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute


