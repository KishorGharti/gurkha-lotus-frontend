import { createContext, useContext, useState } from 'react'

const AdminAuthCtx = createContext(null)

export function AdminAuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(() => sessionStorage.getItem('gl_admin_session') === '1')

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        sessionStorage.setItem('gl_admin_session', '1')
        setIsAuth(true)
        return { success: true }
      }
      return { success: false, message: data.message || 'Invalid credentials' }
    } catch {
      return { success: false, message: 'Cannot connect to server. Is the backend running?' }
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    sessionStorage.removeItem('gl_admin_session')
    setIsAuth(false)
  }

  return (
    <AdminAuthCtx.Provider value={{ isAuth, login, logout }}>
      {children}
    </AdminAuthCtx.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthCtx)
