import { useState, useEffect, createContext, useContext } from 'react'
import { account, type Models } from '@/lib/appwrite'

interface AppwriteAuthContextType {
  user: Models.User<Models.Preferences> | null
  session: Models.Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
}

const AppwriteAuthContext = createContext<AppwriteAuthContextType | undefined>(undefined)

export function useAppwriteAuth() {
  const context = useContext(AppwriteAuthContext)
  if (context === undefined) {
    throw new Error('useAppwriteAuth must be used within an AppwriteAuthProvider')
  }
  return context
}

export function useAppwriteAuthProvider(): AppwriteAuthContextType {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [session, setSession] = useState<Models.Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Controlla se l'utente è già autenticato
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const currentUser = await account.get()
      const currentSession = await account.getSession('current')
      setUser(currentUser)
      setSession(currentSession)
    } catch (error) {
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const session = await account.createEmailPasswordSession(email, password)
      const user = await account.get()
      setSession(session)
      setUser(user)
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      await account.create('unique()', email, password, name)
      await login(email, password)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await account.deleteSession('current')
      setUser(null)
      setSession(null)
    } catch (error) {
      throw error
    }
  }

  return {
    user,
    session,
    loading,
    login,
    logout,
    register
  }
}

export { AppwriteAuthContext } 