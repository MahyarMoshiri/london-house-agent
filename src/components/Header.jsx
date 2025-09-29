import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Settings, ChevronDown } from 'lucide-react'
import logoUrl from '/your-logo.png'
import { PROPERTY_LOCATIONS } from '@/constants/locations'

function Header({ isAdmin }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false)
  const [isMobileLocationsOpen, setIsMobileLocationsOpen] = useState(false)
  const location = useLocation()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsMobileLocationsOpen(false)
  }

  const isActivePath = (path) => {
    if (path === '/properties') {
      return location.pathname === '/properties' || location.pathname.startsWith('/property/') || location.pathname.startsWith('/properties/')
    }
    return location.pathname === path
  }

  const isLocationActive = (slug) => location.pathname === `/properties/${slug}`

  const closeDesktopLocationMenu = () => setIsLocationMenuOpen(false)
  const isAnyLocationActive = PROPERTY_LOCATIONS.some((loc) => isLocationActive(loc.slug))

  return (
    <header className="bg-white shadow-lg border-b-4 border-[#FFCC00] sticky top-0 z-50">
      <div className="lha-container lha-section-padding py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/properties" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-[#FFCC00] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <img src={logoUrl} alt="London House Agent" className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold text-black">
                London House Agent
              </h1>
              <p className="text-sm text-gray-600">Premium Property Portfolio</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div
              className="relative"
              onMouseEnter={() => setIsLocationMenuOpen(true)}
            >
              <button
                type="button"
                onClick={() => setIsLocationMenuOpen((prev) => !prev)}
                onFocus={() => setIsLocationMenuOpen(true)}
                className={`font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  isActivePath('/properties') 
                    ? 'text-[#FFCC00] border-b-2 border-[#FFCC00] pb-1' 
                    : 'text-gray-700 hover:text-[#FFCC00]'
                }`}
                aria-haspopup="true"
                aria-expanded={isLocationMenuOpen}
              >
                <span>Properties</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isLocationMenuOpen ? 'rotate-180 text-[#FFCC00]' : ''
                  }`}
                />
              </button>
              <div
                className={`absolute right-0 mt-3 w-60 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${
                  isLocationMenuOpen ? 'block' : 'hidden'
                }`}
              >
                <Link
                  to="/properties"
                  className={`block px-4 py-3 text-sm transition-colors duration-200 ${
                    isActivePath('/properties') && !isAnyLocationActive
                      ? 'bg-[#FFCC00]/10 text-[#FFCC00]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={closeDesktopLocationMenu}
                >
                  All Properties
                </Link>
                <div className="border-t border-gray-100" />
                {PROPERTY_LOCATIONS.map((loc) => (
                  <Link
                    key={loc.value}
                    to={`/properties/${loc.slug}`}
                    className={`block px-4 py-3 text-sm transition-colors duration-200 ${
                      isLocationActive(loc.slug)
                        ? 'bg-[#FFCC00]/10 text-[#FFCC00]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={closeDesktopLocationMenu}
                  >
                    {loc.label} ({loc.value})
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/admin"
              className={`font-medium transition-colors duration-200 flex items-center space-x-1 ${
                isActivePath('/admin') 
                  ? 'text-[#FFCC00] border-b-2 border-[#FFCC00] pb-1' 
                  : 'text-gray-700 hover:text-[#FFCC00]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
              {isAdmin && (
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Link
                to="/properties"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsMobileLocationsOpen(false)
                }}
                className={`font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
                  location.pathname === '/properties' 
                    ? 'bg-[#FFCC00] text-black' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Properties
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileLocationsOpen((prev) => !prev)}
                className="flex items-center justify-between py-2 px-4 rounded-lg text-left font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                aria-expanded={isMobileLocationsOpen}
              >
                <span>Locations</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMobileLocationsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isMobileLocationsOpen && (
                <div className="flex flex-col space-y-2 pl-4">
                  {PROPERTY_LOCATIONS.map((loc) => (
                    <Link
                      key={loc.value}
                      to={`/properties/${loc.slug}`}
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setIsMobileLocationsOpen(false)
                      }}
                      className={`py-2 px-4 rounded-lg text-sm transition-colors duration-200 ${
                        isLocationActive(loc.slug)
                          ? 'bg-[#FFCC00] text-black'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {loc.label} ({loc.value})
                    </Link>
                  ))}
                </div>
              )}
              <Link
                to="/admin"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsMobileLocationsOpen(false)
                }}
                className={`font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                  isActivePath('/admin') 
                    ? 'bg-[#FFCC00] text-black' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin Panel</span>
                {isAdmin && (
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
