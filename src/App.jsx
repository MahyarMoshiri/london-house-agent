import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import './App.css'

// Components
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'
import Admin from './pages/Admin'
import { 
  fetchProperties,
  createProperty,
  updatePropertyRecord,
  removeProperty,
  isSupabaseDataConfigured
} from './lib/supabaseProperties'

function App() {
  const [properties, setProperties] = useState([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  const [propertiesError, setPropertiesError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const loadProperties = useCallback(async () => {
    setIsLoadingProperties(true)
    setPropertiesError('')

    if (!isSupabaseDataConfigured) {
      setProperties([])
      setPropertiesError('Supabase is not configured. Please update your environment variables to enable property management.')
      setIsLoadingProperties(false)
      return
    }

    try {
      const data = await fetchProperties()
      setProperties(data)
    } catch (error) {
      console.error('Failed to fetch properties:', error)
      setPropertiesError(error.message || 'Failed to fetch properties.')
    } finally {
      setIsLoadingProperties(false)
    }
  }, [])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  const addProperty = useCallback(async (property) => {
    try {
      const newProperty = await createProperty(property)
      setProperties(prev => [newProperty, ...prev])
      return newProperty
    } catch (error) {
      console.error('Failed to create property:', error)
      throw error
    }
  }, [])

  const updateProperty = useCallback(async (id, updatedProperty) => {
    try {
      const savedProperty = await updatePropertyRecord(id, updatedProperty)
      setProperties(prev => prev.map(prop => (prop.id === id ? savedProperty : prop)))
      return savedProperty
    } catch (error) {
      console.error('Failed to update property:', error)
      throw error
    }
  }, [])

  const deleteProperty = useCallback(async (id) => {
    try {
      await removeProperty(id)
      setProperties(prev => prev.filter(prop => prop.id !== id))
    } catch (error) {
      console.error('Failed to delete property:', error)
      throw error
    }
  }, [])

  const routerBase = import.meta.env.BASE_URL || '/'

  return (
    <Router basename={routerBase}>
      <div className="min-h-screen bg-background flex flex-col">
        <Header isAdmin={isAdmin} />
        
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/properties" replace />}
            />
            <Route 
              path="/properties" 
              element={
                <Home 
                  properties={properties}
                  isLoading={isLoadingProperties}
                  error={propertiesError}
                  onRetry={loadProperties}
                />
              } 
            />
            <Route 
              path="/property/:id" 
              element={<PropertyDetail properties={properties} isLoading={isLoadingProperties} />} 
            />
            <Route 
              path="/admin" 
              element={
                <Admin 
                  properties={properties}
                  addProperty={addProperty}
                  updateProperty={updateProperty}
                  deleteProperty={deleteProperty}
                  isAdmin={isAdmin}
                  setIsAdmin={setIsAdmin}
                  isLoading={isLoadingProperties}
                  error={propertiesError}
                  onReload={loadProperties}
                />
              } 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  )
}

export default App
