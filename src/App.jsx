import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'

// Components
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'
import Admin from './pages/Admin'

// Custom hook for managing properties in localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  return [storedValue, setValue]
}

function App() {
  const [properties, setProperties] = useLocalStorage('lha-properties', [])
  const [isAdmin, setIsAdmin] = useState(false)

  // Sample properties for demonstration
  useEffect(() => {
    if (properties.length === 0) {
      const sampleProperties = [
        {
          id: '1',
          title: 'Luxury 2-Bedroom Apartment in Canary Wharf',
          description: 'Stunning modern apartment with panoramic views of the Thames. Features include floor-to-ceiling windows, premium finishes, and access to building amenities including gym and concierge.',
          price: 3500,
          address: 'Canary Wharf, London E14',
          bedrooms: 2,
          bathrooms: 2,
          availability: 'Available Now',
          images: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
          ],
          features: ['Gym', 'Concierge', 'River Views', 'Balcony', 'Parking'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Victorian House in Notting Hill',
          description: 'Charming Victorian terraced house in the heart of Notting Hill. Recently renovated while maintaining original period features. Perfect for families or professionals.',
          price: 5200,
          address: 'Notting Hill, London W11',
          bedrooms: 3,
          bathrooms: 2,
          availability: 'Available from January',
          images: [
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&h=600&fit=crop'
          ],
          features: ['Garden', 'Period Features', 'Recently Renovated', 'Near Tube'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Modern Studio in Shoreditch',
          description: 'Contemporary studio apartment in trendy Shoreditch. Open-plan living with modern kitchen and bathroom. Perfect for young professionals.',
          price: 1800,
          address: 'Shoreditch, London E1',
          bedrooms: 0,
          bathrooms: 1,
          availability: 'Available Now',
          images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
          ],
          features: ['Modern Kitchen', 'High Ceilings', 'Near Transport', 'Trendy Area'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setProperties(sampleProperties)
    }
  }, [properties.length, setProperties])

  const addProperty = (property) => {
    const newProperty = {
      ...property,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setProperties([...properties, newProperty])
  }

  const updateProperty = (id, updatedProperty) => {
    setProperties(properties.map(prop => 
      prop.id === id 
        ? { ...updatedProperty, id, updatedAt: new Date().toISOString() }
        : prop
    ))
  }

  const deleteProperty = (id) => {
    setProperties(properties.filter(prop => prop.id !== id))
  }

  return (
    <Router>
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
              element={<Home properties={properties} />} 
            />
            <Route 
              path="/property/:id" 
              element={<PropertyDetail properties={properties} />} 
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
