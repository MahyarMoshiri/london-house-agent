import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, MapPin, Bed, Bath, Calendar, Phone, Mail, ArrowRight, Star, Share2, X, Check, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function Home({ properties, isLoading, error, onRetry }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [bedroomFilter, setBedroomFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const propertiesList = useMemo(() => {
    return Array.isArray(properties) ? properties : []
  }, [properties])
  const totalProperties = propertiesList.length

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    return propertiesList.filter(property => {
      const matchesSearch = !searchTerm || 
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPrice = !priceFilter || 
        (priceFilter === 'under-2000' && property.price < 2000) ||
        (priceFilter === '2000-4000' && property.price >= 2000 && property.price <= 4000) ||
        (priceFilter === 'over-4000' && property.price > 4000)

      const matchesBedrooms = !bedroomFilter || 
        (bedroomFilter === 'studio' && property.bedrooms === 0) ||
        (bedroomFilter === '1' && property.bedrooms === 1) ||
        (bedroomFilter === '2' && property.bedrooms === 2) ||
        (bedroomFilter === '3+' && property.bedrooms >= 3)

      return matchesSearch && matchesPrice && matchesBedrooms
    })
  }, [propertiesList, searchTerm, priceFilter, bedroomFilter])

  const clearFilters = () => {
    setSearchTerm('')
    setPriceFilter('')
    setBedroomFilter('')
  }

  const handleSharePortfolio = async () => {
    const url = window.location.href
    const title = 'London House Agent - Property Portfolio'
    const text = `Check out our premium property portfolio with ${totalProperties} available properties in London.`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        })
      } catch (err) {
        console.log('Error sharing:', err)
        setShowShareModal(true)
      }
    } else {
      setShowShareModal(true)
    }
  }

  const handleEmailPortfolio = () => {
    const subject = encodeURIComponent('London House Agent - Property Portfolio')
    const body = encodeURIComponent(`Hi,

I'm interested in your property portfolio. I found ${filteredProperties.length} properties that match my criteria.

Please send me more information about available properties.

Portfolio Link: ${window.location.href}

Best regards`)
    
    window.location.href = `mailto:info@londonhouseagent.co.uk?subject=${subject}&body=${body}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="lha-hero-section lha-section-padding">
        <div className="lha-container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="lha-heading-xl mb-6 animate-fade-in">
              Premium Properties in London
            </h1>
            <p className="lha-body-lg mb-8 text-black/80 animate-slide-up">
              Discover exceptional rental properties across London's most desirable neighbourhoods. 
              We are working so you can find your perfect home with London House Agent.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-scale-in">
              <div className="flex items-center space-x-2 text-black">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">Premium Service</span>
              </div>
              <div className="flex items-center space-x-2 text-black">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">Prime Locations</span>
              </div>
              <div className="flex items-center space-x-2 text-black">
                <Phone className="w-5 h-5" />
                <span className="font-semibold">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="lha-container py-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by location, property type, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent text-lg"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-center">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {(priceFilter || bedroomFilter) && (
                  <span className="bg-[#FFCC00] text-black text-xs px-2 py-1 rounded-full">
                    {[priceFilter, bedroomFilter].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-6 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
                    >
                      <option value="">Any Price</option>
                      <option value="under-2000">Under £2,000</option>
                      <option value="2000-4000">£2,000 - £4,000</option>
                      <option value="over-4000">Over £4,000</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <select
                      value={bedroomFilter}
                      onChange={(e) => setBedroomFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
                    >
                      <option value="">Any Bedrooms</option>
                      <option value="studio">Studio</option>
                      <option value="1">1 Bedroom</option>
                      <option value="2">2 Bedrooms</option>
                      <option value="3+">3+ Bedrooms</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="lha-section-padding bg-gray-50">
        <div className="lha-container">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h2 className="lha-heading-lg">Available Properties</h2>
              <p className="text-gray-600 mt-2">
                {isLoading
                  ? 'Loading properties...'
                  : error
                    ? 'Unable to load properties. Please try again.'
                    : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'property' : 'properties'} found${searchTerm ? ` for "${searchTerm}"` : ''}`}
              </p>
            </div>
            
            {!isLoading && !error && filteredProperties.length > 0 && (
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleSharePortfolio}
                  className="lha-button-secondary flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Portfolio</span>
                </Button>
                <Button 
                  onClick={handleEmailPortfolio}
                  className="lha-button-secondary flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Portfolio</span>
                </Button>
                <Button className="lha-button-primary flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </Button>
              </div>
            )}
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                </div>
                <h3 className="lha-heading-sm mb-4">Loading Properties</h3>
                <p className="text-gray-600">Fetching the latest listings from Supabase.</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="lha-heading-sm mb-4">Unable to Load Properties</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                {onRetry && (
                  <Button onClick={onRetry} className="lha-button-primary">
                    Retry
                  </Button>
                )}
              </div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="lha-heading-sm mb-4">No Properties Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || priceFilter || bedroomFilter
                    ? "Try adjusting your search criteria or filters to find more properties."
                    : "No properties have been added yet. Check back soon for new listings."}
                </p>
                {(searchTerm || priceFilter || bedroomFilter) && (
                  <Button onClick={clearFilters} className="lha-button-primary">
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="lha-property-grid">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-black text-white lha-section-padding">
        <div className="lha-container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="lha-heading-lg text-[#FFCC00] mb-6">
              Ready to Find Your Perfect Home?
            </h2>
            <p className="lha-body-lg text-gray-300 mb-8">
              Our experienced team is here to help you find the ideal property in London. 
              Contact us today for personalised assistance and exclusive listings.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button className="lha-button-primary flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>+44 20 7123 4567</span>
              </Button>
              <Button variant="outline" className="border-[#FFCC00] text-[#FFCC00] hover:bg-[#FFCC00] hover:text-black flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>info@londonhouseagent.co.uk</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Share Portfolio</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Share our property portfolio with others:
            </p>
            
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <Button
                onClick={copyToClipboard}
                className={`px-4 py-2 text-sm ${
                  copySuccess 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'lha-button-primary'
                }`}
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            
            {copySuccess && (
              <div className="flex items-center justify-center text-green-600 text-sm">
                <Check className="w-4 h-4 mr-1" />
                Link copied to clipboard!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Property Card Component
function PropertyCard({ property }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const primaryImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'

  return (
    <Link to={`/property/${property.id}`} className="group">
      <div className="lha-card h-full">
        {/* Image */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4='
            }}
          />
          
          {/* Price Badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-[#FFCC00] text-black px-3 py-1 rounded-full font-bold text-sm">
              {formatPrice(property.price)}/month
            </span>
          </div>

          {/* Availability Badge */}
          {property.availability && (
            <div className="absolute top-4 right-4">
              <span className="bg-black/80 text-white px-3 py-1 rounded-full text-sm">
                {property.availability}
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="lha-image-overlay">
            <div className="text-white text-center">
              <ArrowRight className="w-8 h-8 mx-auto mb-2" />
              <span className="font-semibold">View Details</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FFCC00] transition-colors duration-200">
            {property.title}
          </h3>
          
          {property.address && (
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate">{property.address}</span>
            </div>
          )}

          {property.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {property.description}
            </p>
          )}

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms || 0} bed{property.bedrooms !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms || 0} bath{property.bathrooms !== 1 ? 's' : ''}</span>
              </div>
            </div>
            {property.availability && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">{property.availability}</span>
              </div>
            )}
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {property.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {feature}
                </span>
              ))}
              {property.features.length > 3 && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  +{property.features.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default Home
