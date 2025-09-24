import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Eye, EyeOff, Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon, Link2, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isSupabaseConfigured, uploadPropertyImages } from '@/lib/supabaseStorage'
import { fetchAlbums, createAlbum, updateAlbum, removeAlbum } from '@/lib/supabaseProperties'

function Admin({ properties, addProperty, updateProperty, deleteProperty, isAdmin, setIsAdmin, isLoading, error, onReload }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    availability: '',
    images: [],
    features: [],
    albumId: ''
  })
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [albums, setAlbums] = useState([])
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false)
  const [albumError, setAlbumError] = useState('')
  const [albumActionError, setAlbumActionError] = useState('')
  const [showAlbumDialog, setShowAlbumDialog] = useState(false) // kept for backward-compat, not used in new inline UI
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [albumForm, setAlbumForm] = useState({
    name: '',
    slug: '',
    displayOrder: '0'
  })
  const [isSavingAlbum, setIsSavingAlbum] = useState(false)
  const [deletingAlbumId, setDeletingAlbumId] = useState(null)
  const [showCreateAlbumInline, setShowCreateAlbumInline] = useState(false)

  // Simple password authentication (in production, use proper authentication)
  const ADMIN_PASSWORD = 'admin123'

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      setLoginError('')
      setPassword('')
    } else {
      setLoginError('Invalid password. Please try again.')
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    setPassword('')
    setShowAddForm(false)
    setEditingProperty(null)
    setActionError('')
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      address: '',
      bedrooms: '',
      bathrooms: '',
      availability: '',
      images: [],
      features: [],
      albumId: ''
    })
  }

  const resetAlbumForm = () => {
    setAlbumForm({
      name: '',
      slug: '',
      displayOrder: '0'
    })
  }

  const loadAlbums = useCallback(async () => {
    setIsLoadingAlbums(true)
    setAlbumError('')

    try {
      const data = await fetchAlbums()
      setAlbums(data)
    } catch (error) {
      console.error('Failed to load albums:', error)
      setAlbumError(error.message || 'Failed to load albums.')
    } finally {
      setIsLoadingAlbums(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) {
      return
    }

    loadAlbums()
  }, [isAdmin, loadAlbums])

  const albumPropertyCounts = useMemo(() => {
    return (properties || []).reduce((acc, property) => {
      const albumId = property?.album?.id || property?.albumId
      if (!albumId) {
        return acc
      }

      acc[albumId] = (acc[albumId] || 0) + 1
      return acc
    }, {})
  }, [properties])

  const openCreateAlbumDialog = () => {
    resetAlbumForm()
    setEditingAlbum(null)
    setAlbumActionError('')
    setShowCreateAlbumInline(true)
  }

  const openEditAlbumDialog = (album) => {
    setAlbumForm({
      name: album.name || '',
      slug: album.slug || '',
      displayOrder: (album.displayOrder ?? 0).toString()
    })
    setEditingAlbum(album)
    setAlbumActionError('')
    setShowCreateAlbumInline(false)
  }

  const handleAlbumInputChange = (e) => {
    const { name, value } = e.target
    setAlbumForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const closeAlbumDialog = () => {
    setShowCreateAlbumInline(false)
    setEditingAlbum(null)
    resetAlbumForm()
  }

  const handleAlbumSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name: albumForm.name.trim(),
      slug: albumForm.slug.trim(),
      displayOrder: Number(albumForm.displayOrder) || 0
    }

    setAlbumActionError('')
    setIsSavingAlbum(true)

    try {
      if (editingAlbum) {
        await updateAlbum(editingAlbum.id, payload)
      } else {
        await createAlbum(payload)
      }

      await loadAlbums()
      if (typeof onReload === 'function') {
        onReload()
      }

      closeAlbumDialog()
    } catch (error) {
      console.error('Failed to save album:', error)
      setAlbumActionError(error.message || 'Failed to save album. Please try again.')
    } finally {
      setIsSavingAlbum(false)
    }
  }

  const handleDeleteAlbum = async (album) => {
    const propertyCount = albumPropertyCounts[album.id] || 0
    const confirmationMessage = propertyCount > 0
      ? `This album currently has ${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'}. Deleting it will remove the album assignment from those properties. Continue?`
      : 'Are you sure you want to delete this album?'

    if (!window.confirm(confirmationMessage)) {
      return
    }

    setAlbumActionError('')
    setDeletingAlbumId(album.id)

    try {
      await removeAlbum(album.id)
      await loadAlbums()
      if (typeof onReload === 'function') {
        onReload()
      }
    } catch (error) {
      console.error('Failed to delete album:', error)
      setAlbumActionError(error.message || 'Failed to delete album. Please try again.')
    } finally {
      setDeletingAlbumId(null)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUrlAdd = () => {
    const url = prompt('Enter image URL:')
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }))
    }
  }

  const handleImageUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (event) => {
    const input = event.target
    const files = Array.from(input?.files || [])
    if (files.length === 0) {
      return
    }

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase storage is not configured yet. Please add the required environment variables first.')
      }

      setIsUploading(true)
      setActionError('')
      const uploadedUrls = await uploadPropertyImages(files)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
    } catch (error) {
      console.error('Image upload failed:', error)
      setActionError(error.message || 'Image upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      if (input) {
        input.value = ''
      }
    }
  }

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleFeatureAdd = () => {
    const feature = prompt('Enter property feature:')
    if (feature && feature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature.trim()]
      }))
    }
  }

  const handleFeatureRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.albumId && !albums.some(album => album.id === formData.albumId)) {
      setActionError('Selected album is no longer available. Please refresh albums and try again.')
      return
    }

    const propertyData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      albumId: formData.albumId || null
    }

    setActionError('')
    setIsSaving(true)

    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, propertyData)
        setEditingProperty(null)
      } else {
        await addProperty(propertyData)
        setShowAddForm(false)
      }

      resetForm()
    } catch (error) {
      console.error('Failed to save property:', error)
      setActionError(error.message || 'Failed to save property. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (property) => {
    setFormData({
      title: property.title || '',
      description: property.description || '',
      price: property.price?.toString() || '',
      address: property.address || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      availability: property.availability || '',
      images: property.images || [],
      features: property.features || [],
      albumId: property.album?.id || property.albumId || ''
    })
    setEditingProperty(property)
    setShowAddForm(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return
    }

    setActionError('')
    setDeletingId(id)

    try {
      await deleteProperty(id)
    } catch (error) {
      console.error('Failed to delete property:', error)
      setActionError(error.message || 'Failed to delete property. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const cancelEdit = () => {
    setEditingProperty(null)
    resetForm()
  }

  const cancelAdd = () => {
    setShowAddForm(false)
    resetForm()
  }

  // Login Form
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center lha-section-padding">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#FFCC00] rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-black" />
              </div>
              <h2 className="lha-heading-md">Admin Access</h2>
              <p className="text-gray-600 mt-2">Enter your password to manage properties</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="lha-input pr-12"
                    placeholder="Enter admin password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <Button type="submit" className="w-full lha-button-primary">
                Login to Admin Panel
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Inline album editor (compact for mobile) */}

      <div className="lha-container lha-section-padding">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="lha-heading-lg">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your property portfolio</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {isLoading
                  ? 'Loading properties...'
                  : `${properties.length} ${properties.length === 1 ? 'Property' : 'Properties'}`}
              </span>
              {onReload && (
                <Button
                  onClick={onReload}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex items-center space-x-1"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              )}
              <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 text-sm flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Add Property Button */}
        {!showAddForm && !editingProperty && (
          <div className="mb-8">
            <Button 
              onClick={() => setShowAddForm(true)}
              className="lha-button-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Property</span>
            </Button>
          </div>
        )}

        {/* Add/Edit Property Form */}
        {(showAddForm || editingProperty) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="lha-heading-md">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h2>
              <Button 
                onClick={editingProperty ? cancelEdit : cancelAdd}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="lha-input"
                    placeholder="e.g., Luxury 2-Bedroom Apartment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (£ per month)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="lha-input"
                    placeholder="e.g., 2500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="lha-input"
                    placeholder="e.g., Canary Wharf, London E14"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <input
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="lha-input"
                    placeholder="e.g., Available Now"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Album
                  </label>
                  <select
                    name="albumId"
                    value={formData.albumId}
                    onChange={handleInputChange}
                    className="lha-input"
                    disabled={isLoadingAlbums || Boolean(albumError)}
                  >
                    <option value="">No album</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.name}
                      </option>
                    ))}
                  </select>
                  {albumError && (
                    <p className="text-xs text-red-600 mt-1">{albumError}</p>
                  )}
                  {!albumError && !isLoadingAlbums && albums.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">Create an album to group properties.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="lha-input"
                    placeholder="e.g., 2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="lha-input"
                    placeholder="e.g., 2"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="lha-textarea"
                  placeholder="Describe the property features, location, and amenities..."
                  rows="4"
                />
              </div>

              {/* Images Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Property Images
                  </label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button"
                      onClick={handleImageUrlAdd}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Link2 className="w-4 h-4" />
                      <span>Add Image URL</span>
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleImageUploadClick}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                      disabled={isUploading}
                    >
                      <Upload className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
                      <span>{isUploading ? 'Uploading…' : 'Upload Images'}</span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  {!isSupabaseConfigured && (
                    <p className="text-xs text-amber-600 mt-2">
                      Add your Supabase credentials to enable direct uploads.
                    </p>
                  )}
                </div>
                
                {formData.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No images added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add Image URL" to add property photos</p>
                  </div>
                )}
              </div>

              {/* Features Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Property Features
                  </label>
                  <Button 
                    type="button"
                    onClick={handleFeatureAdd}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Feature</span>
                  </Button>
                </div>
                
                {formData.features.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-[#FFCC00] text-black px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleFeatureRemove(index)}
                          className="ml-2 text-black hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No features added yet</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button"
                  onClick={editingProperty ? cancelEdit : cancelAdd}
                  variant="outline"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="lha-button-primary flex items-center space-x-2"
                  disabled={isSaving || isUploading}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {isSaving
                      ? 'Saving...'
                      : editingProperty
                        ? 'Update Property'
                        : 'Add Property'}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Album Management */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="lha-heading-md">Album Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Group properties into curated collections for faster browsing.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => loadAlbums()}
                variant="outline"
                size="sm"
                disabled={isLoadingAlbums}
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingAlbums ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={openCreateAlbumDialog}
                className="lha-button-primary flex items-center space-x-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Album</span>
              </Button>
            </div>
          </div>

          {albumActionError && !showAlbumDialog && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {albumActionError}
            </div>
          )}

          <div className="p-6">
            {showCreateAlbumInline && (
              <div className="border border-gray-200 rounded-lg p-3 mb-6">
                <form onSubmit={handleAlbumSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={albumForm.name}
                      onChange={handleAlbumInputChange}
                      className="lha-input py-2"
                      placeholder="e.g., Premium Studios"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      value={albumForm.slug}
                      onChange={handleAlbumInputChange}
                      className="lha-input py-2"
                      placeholder="premium-studios"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={albumForm.displayOrder}
                      onChange={handleAlbumInputChange}
                      className="lha-input py-2"
                    />
                  </div>
                  <div className="sm:col-span-5 flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={closeAlbumDialog} disabled={isSavingAlbum}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="lha-button-primary flex items-center space-x-2" disabled={isSavingAlbum}>
                      {isSavingAlbum ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{editingAlbum ? 'Update' : 'Create'}</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {albumError ? (
              <div className="text-center text-sm text-red-600">
                {albumError}
              </div>
            ) : isLoadingAlbums ? (
              <div className="text-center text-gray-600 text-sm flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading albums...</span>
              </div>
            ) : albums.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">
                No albums created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {albums.map((album) => {
                  const propertyCount = albumPropertyCounts[album.id] || 0

                  return (
                    <div
                      key={album.id}
                      className="border border-gray-200 rounded-lg p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                    >
                      <div className="w-full">
                        <div className="inline-block bg-[#FFCC00] text-black px-2 py-1 rounded">
                          <span className="font-semibold text-sm">{album.name}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
                          <p>
                            <span className="font-medium">Slug:</span> {album.slug}
                          </p>
                          <p>
                            <span className="font-medium">Display Order:</span> {album.displayOrder ?? 0}
                          </p>
                          <p>
                            <span className="font-medium">Properties:</span> {propertyCount}
                          </p>
                        </div>
                        {editingAlbum?.id === album.id && (
                          <div className="mt-3">
                            <form onSubmit={handleAlbumSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" name="name" value={albumForm.name} onChange={handleAlbumInputChange} className="lha-input py-2" required />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                                <input type="text" name="slug" value={albumForm.slug} onChange={handleAlbumInputChange} className="lha-input py-2" required />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                                <input type="number" name="displayOrder" value={albumForm.displayOrder} onChange={handleAlbumInputChange} className="lha-input py-2" />
                              </div>
                              <div className="sm:col-span-5 flex justify-end gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={closeAlbumDialog} disabled={isSavingAlbum}>Cancel</Button>
                                <Button type="submit" size="sm" className="lha-button-primary flex items-center space-x-2" disabled={isSavingAlbum}>
                                  {isSavingAlbum ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                  <span>Save</span>
                                </Button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => {
                            if (editingAlbum?.id === album.id) {
                              closeAlbumDialog()
                            } else {
                              openEditAlbumDialog(album)
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                          disabled={deletingAlbumId === album.id}
                        >
                          <Edit className="w-4 h-4" />
                          <span>{editingAlbum?.id === album.id ? 'Close' : 'Edit'}</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteAlbum(album)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 flex items-center space-x-1"
                          disabled={deletingAlbumId === album.id}
                        >
                          {deletingAlbumId === album.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="lha-heading-md">Property Management</h2>
          </div>
          
          {error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Unable to load properties</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              {onReload && (
                <Button
                  onClick={onReload}
                  className="lha-button-primary flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </Button>
              )}
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
              <p className="text-gray-600 mt-4">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No properties added yet.</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="mt-4 lha-button-primary"
              >
                Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {properties.map((property) => (
                <div key={property.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {property.title || 'Untitled Property'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Price:</span> £{property.price || 0}/month
                        </div>
                        <div>
                          <span className="font-medium">Bedrooms:</span> {property.bedrooms || 0}
                        </div>
                        <div>
                          <span className="font-medium">Bathrooms:</span> {property.bathrooms || 0}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {property.availability || 'Not specified'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        {property.address && (
                          <p>
                            <span className="font-medium">Address:</span> {property.address}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Album:</span> {property.album?.name || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleEdit(property)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                        disabled={deletingId === property.id}
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        onClick={() => handleDelete(property.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50 flex items-center space-x-1"
                        disabled={deletingId === property.id}
                      >
                        {deletingId === property.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin
