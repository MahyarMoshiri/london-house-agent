import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Calendar, 
  Phone, 
  Mail, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Star,
  Home as HomeIcon,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

function PropertyDetail({ properties, isLoading }) {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (isLoading) {
      return
    }

    const foundProperty = properties.find(p => p.id === id)

    if (foundProperty) {
      setProperty(foundProperty)
    } else {
      setProperty(null)
    }

    setHasChecked(true)
  }, [id, properties, isLoading])

  useEffect(() => {
    if (isLoading) {
      setHasChecked(false)
    }
  }, [isLoading])

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [property?.id])

  if (!hasChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Property</h2>
          <p className="text-gray-600">Fetching the latest information.</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <HomeIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link to="/properties" className="lha-button-primary inline-flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </Link>
        </div>
      </div>
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop']

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
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
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="lha-container py-4">
          <Link 
            to="/properties" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-[#FFCC00] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </Link>
        </div>
      </div>

      {/* Image Gallery */}
      <section className="relative">
        <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setShowImageModal(true)}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+'
            }}
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-[#FFCC00] text-black px-4 py-2 rounded-full font-bold text-lg">
              {formatPrice(property.price)}/month
            </span>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="bg-gray-100 p-4">
            <div className="lha-container">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-[#FFCC00] scale-105' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OWEzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+'
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Property Information */}
      <section className="lha-section-padding">
        <div className="lha-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <h1 className="lha-heading-lg mb-4">{property.title}</h1>
                
                {property.address && (
                  <div className="flex items-center text-gray-600 mb-6">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{property.address}</span>
                  </div>
                )}

                {/* Property Stats */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Bed className="w-5 h-5" />
                    <span className="font-medium">
                      {property.bedrooms || 0} Bedroom{property.bedrooms !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bath className="w-5 h-5" />
                    <span className="font-medium">
                      {property.bathrooms || 0} Bathroom{property.bathrooms !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {property.availability && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">{property.availability}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h2 className="lha-heading-sm mb-4">About This Property</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div>
                  <h2 className="lha-heading-sm mb-4">Property Features</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-gray-50 rounded-lg p-6 sticky top-32">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#FFCC00] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-black fill-current" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Interested in this property?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Contact our expert team for more information or to arrange a viewing.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button className="w-full lha-button-primary flex items-center justify-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>Call +44 20 7123 4567</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-[#FFCC00] text-[#FFCC00] hover:bg-[#FFCC00] hover:text-black flex items-center justify-center space-x-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Send Email</span>
                  </Button>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      Available Mon-Fri 9AM-6PM<br />
                      Saturday 10AM-4PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Property Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-semibold">{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bedrooms:</span>
                    <span className="font-semibold">{property.bedrooms || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bathrooms:</span>
                    <span className="font-semibold">{property.bathrooms || 0}</span>
                  </div>
                  {property.availability && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Availability:</span>
                      <span className="font-semibold">{property.availability}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property ID:</span>
                      <span className="font-semibold">LHA-{property.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <img
              src={images[currentImageIndex]}
              alt={`${property.title} - Full size`}
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors duration-200"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors duration-200"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Share Property</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">Share this property with others:</p>
            
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
              <p className="text-green-600 text-sm text-center">
                Link copied to clipboard!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyDetail
