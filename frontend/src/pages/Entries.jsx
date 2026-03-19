import React, { useEffect, useState } from 'react'
import { getEntries, createEntry } from '../api/entries'
import { getProducts } from '../api/products'
import { useAuth } from '../context/AuthContext'
import { Plus, X, Loader2, TrendingUp, Search, MapPin, Building2 } from 'lucide-react'

const today = new Date().toISOString().split('T')[0]

const CITIES = [
  { value: 'TANGER',     label: 'Tanger' },
  { value: 'FES',        label: 'Fès' },
  { value: 'CASABLANCA', label: 'Casablanca' },
]

const CITY_COLORS = {
  TANGER:     'bg-blue-100 text-blue-700',
  FES:        'bg-emerald-100 text-emerald-700',
  CASABLANCA: 'bg-orange-100 text-orange-700',
}

const emptyForm = {
  productName: '',
  dateEntry: today,
  quantity: '',
  comment: '',
  city: '',
}

const Entries = () => {
  const { isAdmin, userCity } = useAuth()
  const [entries, setEntries] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const fetchAll = async (city) => {
    setLoading(true)
    setError('')
    try {
      const [entriesRes, productsRes] = await Promise.all([
        getEntries(city || undefined),
        getProducts(),
      ])
      setEntries(entriesRes.data)
      setProducts(productsRes.data)
    } catch {
      setError('Impossible de charger les données.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll(cityFilter) }, [cityFilter])

  const openModal = () => {
    setForm(emptyForm)
    setFormErrors({})
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setForm(emptyForm)
    setFormErrors({})
    setFormError('')
  }

  const filteredSuggestions = form.productName.trim()
    ? products.filter(p => p.name.toLowerCase().includes(form.productName.toLowerCase()))
    : []

  const validateForm = () => {
    const errs = {}
    if (!form.productName.trim()) errs.productName = 'Le nom du produit est requis'
    if (!form.dateEntry) errs.dateEntry = 'La date est requise'
    if (!form.quantity) errs.quantity = 'La quantité est requise'
    else if (isNaN(Number(form.quantity)) || Number(form.quantity) < 1) errs.quantity = 'Quantité invalide (min. 1)'
    if (isAdmin && !form.city) errs.city = 'La ville est requise'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
    if (formError) setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateForm()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setFormLoading(true)
    setFormError('')
    try {
      await createEntry({
        productName: form.productName.trim(),
        dateEntry: form.dateEntry,
        quantity: Number(form.quantity),
        comment: form.comment.trim() || null,
        ...(isAdmin && form.city ? { city: form.city } : {}),
      })
      closeModal()
      fetchAll(cityFilter)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Une erreur est survenue.')
    } finally {
      setFormLoading(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR')
  }

  const cityLabel = (c) => CITIES.find(x => x.value === c)?.label || c

  const filtered = entries.filter(e =>
    e.productName?.toLowerCase().includes(search.toLowerCase()) ||
    (e.comment || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Entrées de Stock</h1>
          <p className="text-gray-500 text-sm mt-1">{entries.length} entrée(s) enregistrée(s)</p>
        </div>
        <button onClick={openModal} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nouvelle Entrée
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par produit ou commentaire..."
            className="input-field pl-9"
          />
        </div>
        {isAdmin ? (
          <div className="flex gap-1">
            <button
              onClick={() => setCityFilter('')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                cityFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes les villes
            </button>
            {CITIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCityFilter(c.value)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  cityFilter === c.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : (
          <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${CITY_COLORS[userCity] || 'bg-gray-100 text-gray-600'}`}>
            <Building2 size={13} />
            {CITIES.find(c => c.value === userCity)?.label || userCity}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <TrendingUp size={40} className="text-gray-300" />
            <p className="text-gray-400">Aucune entrée trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Produit</th>
                  <th className="table-header">Ville</th>
                  <th className="table-header">Quantité</th>
                  <th className="table-header">Date</th>
                  {isAdmin && <th className="table-header">Enregistré par</th>}
                  <th className="table-header">Commentaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400 text-xs">{idx + 1}</td>
                    <td className="table-cell font-semibold text-gray-800">{entry.productName}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${CITY_COLORS[entry.city] || 'bg-gray-100 text-gray-600'}`}>
                        <MapPin size={10} />
                        {cityLabel(entry.city)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                        <TrendingUp size={14} />
                        +{entry.quantity}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">{formatDate(entry.dateEntry)}</td>
                    {isAdmin && (
                      <td className="table-cell">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                          {entry.createdBy}
                        </span>
                      </td>
                    )}
                    <td className="table-cell text-gray-500 max-w-xs truncate">
                      {entry.comment || <span className="italic text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Nouvelle Entrée de Stock</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {formError}
                </div>
              )}

              {/* Ville — admin seulement (USER a sa ville assignée) */}
              {isAdmin ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    {CITIES.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => { setForm(prev => ({ ...prev, city: c.value })); setFormErrors(prev => ({ ...prev, city: '' })) }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                          form.city === c.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  {formErrors.city && <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>}
                </div>
              ) : (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${CITY_COLORS[userCity] || 'bg-gray-100 text-gray-600'}`}>
                  <MapPin size={14} />
                  Ville : {CITIES.find(c => c.value === userCity)?.label || userCity}
                </div>
              )}

              {/* Produit */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
                <input
                  type="text"
                  name="productName"
                  value={form.productName}
                  onChange={e => { handleChange(e); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className={`input-field ${formErrors.productName ? 'border-red-400' : ''}`}
                  placeholder="Taper le nom du produit..."
                  autoComplete="off"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredSuggestions.map(p => (
                      <li
                        key={p.id}
                        onMouseDown={() => {
                          setForm(prev => ({ ...prev, productName: p.name }))
                          setShowSuggestions(false)
                          setFormErrors(prev => ({ ...prev, productName: '' }))
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 flex justify-between items-center text-sm"
                      >
                        <span className="font-medium text-gray-800">{p.name}</span>
                        <span className="text-gray-400 text-xs">stock total: {p.quantity}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {formErrors.productName && <p className="mt-1 text-xs text-red-500">{formErrors.productName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'entrée *</label>
                <input
                  type="date"
                  name="dateEntry"
                  value={form.dateEntry}
                  onChange={handleChange}
                  className={`input-field ${formErrors.dateEntry ? 'border-red-400' : ''}`}
                />
                {formErrors.dateEntry && <p className="mt-1 text-xs text-red-500">{formErrors.dateEntry}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className={`input-field ${formErrors.quantity ? 'border-red-400' : ''}`}
                  placeholder="0"
                  min="1"
                />
                {formErrors.quantity && <p className="mt-1 text-xs text-red-500">{formErrors.quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  className="input-field resize-none"
                  placeholder="Commentaire (optionnel)"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {formLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Entries
