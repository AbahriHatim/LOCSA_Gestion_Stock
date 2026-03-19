import React, { useEffect, useState } from 'react'
import { getExits, createExit } from '../api/exits'
import { getProducts } from '../api/products'
import { useAuth } from '../context/AuthContext'
import { Plus, X, Loader2, TrendingDown, Search, Package, MapPin, Building2 } from 'lucide-react'

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

const emptyForm = { productId: '', dateExit: today, quantity: '', beneficiary: '', comment: '', city: '' }

const Exits = () => {
  const { isAdmin, userCity } = useAuth()
  const [exits, setExits] = useState([])
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

  const fetchAll = async (city) => {
    setLoading(true)
    setError('')
    try {
      const [exitsRes, productsRes] = await Promise.all([
        getExits(city || undefined),
        getProducts(),
      ])
      setExits(exitsRes.data)
      setProducts(productsRes.data)
    } catch {
      setError('Impossible de charger les données.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll(cityFilter) }, [cityFilter])

  const selectedProduct = products.find(p => String(p.id) === String(form.productId)) || null

  const openModal = () => { setForm(emptyForm); setFormErrors({}); setFormError(''); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setForm(emptyForm); setFormErrors({}); setFormError('') }

  const validateForm = () => {
    const errs = {}
    if (isAdmin && !form.city) errs.city = 'La ville est requise'
    if (!form.productId) errs.productId = 'Veuillez sélectionner un produit'
    if (!form.dateExit) errs.dateExit = 'La date est requise'
    if (!form.quantity) errs.quantity = 'La quantité est requise'
    else if (isNaN(Number(form.quantity)) || Number(form.quantity) < 1) errs.quantity = 'Quantité invalide (min. 1)'
    if (!form.beneficiary.trim()) errs.beneficiary = 'Le bénéficiaire est requis'
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
      await createExit({
        productId: Number(form.productId),
        dateExit: form.dateExit,
        quantity: Number(form.quantity),
        beneficiary: form.beneficiary.trim(),
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

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'
  const cityLabel = (c) => CITIES.find(x => x.value === c)?.label || c

  const filtered = exits.filter(e =>
    e.productName?.toLowerCase().includes(search.toLowerCase()) ||
    e.beneficiary?.toLowerCase().includes(search.toLowerCase()) ||
    (e.comment || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sorties de Stock</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? `${exits.length} sortie(s) enregistrée(s)` : `${exits.length} sortie(s) — vos enregistrements`}
          </p>
        </div>
        <button onClick={openModal} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouvelle Sortie
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
            placeholder="Rechercher par produit, bénéficiaire..."
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
            <TrendingDown size={40} className="text-gray-300" />
            <p className="text-gray-400">Aucune sortie trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Produit</th>
                  <th className="table-header">Ville</th>
                  <th className="table-header">Quantité</th>
                  <th className="table-header">Bénéficiaire</th>
                  <th className="table-header">Date</th>
                  {isAdmin && <th className="table-header">Enregistré par</th>}
                  <th className="table-header">Commentaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((exit, idx) => (
                  <tr key={exit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400 text-xs">{idx + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                          <Package size={13} className="text-red-500" />
                        </div>
                        <span className="font-semibold text-gray-800">{exit.productName}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${CITY_COLORS[exit.city] || 'bg-gray-100 text-gray-600'}`}>
                        <MapPin size={10} />
                        {cityLabel(exit.city)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1 font-bold text-red-500">
                        <TrendingDown size={14} /> -{exit.quantity}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {exit.beneficiary}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500 text-sm">{formatDate(exit.dateExit)}</td>
                    {isAdmin && (
                      <td className="table-cell">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                          {exit.createdBy}
                        </span>
                      </td>
                    )}
                    <td className="table-cell text-gray-500 max-w-xs truncate text-sm">
                      {exit.comment || <span className="italic text-gray-300">—</span>}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingDown size={18} className="text-red-500" />
                <h3 className="text-lg font-semibold text-gray-800">Nouvelle Sortie de Stock</h3>
              </div>
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
                        onClick={() => { setForm(prev => ({ ...prev, city: c.value, productId: '' })); setFormErrors(prev => ({ ...prev, city: '' })) }}
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

              {/* Product select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produit <span className="text-red-500">*</span>
                </label>
                <select
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                  className={`input-field ${formErrors.productId ? 'border-red-400' : ''}`}
                >
                  <option value="">— Sélectionner un produit —</option>
                  {products.filter(p => p.quantity > 0).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — stock total : {p.quantity}
                    </option>
                  ))}
                </select>
                {formErrors.productId && <p className="mt-1 text-xs text-red-500">{formErrors.productId}</p>}
              </div>

              {/* Stock disponible */}
              {selectedProduct && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex justify-between items-center">
                  <span className="text-sm text-orange-700 font-medium">Stock total disponible</span>
                  <span className="text-xl font-bold text-orange-800">{selectedProduct.quantity}</span>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de sortie <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateExit"
                  value={form.dateExit}
                  onChange={handleChange}
                  className={`input-field ${formErrors.dateExit ? 'border-red-400' : ''}`}
                />
                {formErrors.dateExit && <p className="mt-1 text-xs text-red-500">{formErrors.dateExit}</p>}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité <span className="text-red-500">*</span>
                </label>
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

              {/* Beneficiary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bénéficiaire <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="beneficiary"
                  value={form.beneficiary}
                  onChange={handleChange}
                  className={`input-field ${formErrors.beneficiary ? 'border-red-400' : ''}`}
                  placeholder="Nom du bénéficiaire"
                />
                {formErrors.beneficiary && <p className="mt-1 text-xs text-red-500">{formErrors.beneficiary}</p>}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  className="input-field resize-none"
                  placeholder="Commentaire (optionnel)"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {formLoading && <Loader2 size={16} className="animate-spin" />}
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

export default Exits
