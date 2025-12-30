import React, { createContext, useContext, useState, ReactNode } from 'react'
import { apiService } from '../services/api'

interface RefreshContextType {
  refreshTrigger: number
  isRefreshing: boolean
  refreshData: () => Promise<void>
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

interface RefreshProviderProps {
  children: ReactNode
}

export const RefreshProvider: React.FC<RefreshProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    try {
      setIsRefreshing(true)
      
      // Clear sessionStorage to force fresh data load
      apiService.clearAllData()
      
      // Trigger refresh in all data hooks by incrementing the trigger
      setRefreshTrigger(prev => prev + 1)
      
      // Small delay to show the refresh state
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error during refresh:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <RefreshContext.Provider value={{ refreshTrigger, isRefreshing, refreshData }}>
      {children}
    </RefreshContext.Provider>
  )
}

export const useRefresh = () => {
  const context = useContext(RefreshContext)
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider')
  }
  return context
}
