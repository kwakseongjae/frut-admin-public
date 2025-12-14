import { Navigate } from 'react-router-dom'

const RedirectToUserManagement = () => {
  return <Navigate to="/user-management" replace />
}

export default RedirectToUserManagement


