import React, { useEffect, useState } from 'react'
import { getSites, createSite, updateSite, deleteSite } from '../api/sites'
import ConfirmDialog from '../components/ConfirmDialog'
import { Plus, Pencil, Trash2, X, Loader2, MapPin, Building } from 'lucide-react'

const CITIES = [
  { value: 'TANGER',     label: 'Tanger' },
  { value: 'MEKNES',     label: 'Meknès' },
  { value: 'CASABLANCA', label: 'Casablanca' },
]

const CITY_COLORS = {
  TANGER:     'bg-blue-100 text-blue-700',
  MEKNES:     'bg-emerald-100 text-emerald-700',
  CASABLANCA: 'bg-orange-100 text-orange-700',
}

const emptyForm = { name: '', city: '', active: true }

const Sites = () => {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchSites = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getSites()
      setSites(res.data)
    } catch {
      setError('Impossible de charger les sites.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSites() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormErrors({})
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (site) => {
    setEditing(site)
    setForm({ name: site.name, city: site.city, active: site.active })
    setFormErrors({})
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(emptyForm)
    setFormErrors({})
    setFormError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Le nom est requis'
    if (!form.city) errs.city = 'La ville est requise'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    setFormLoading(true)
    setFormError('')
    try {
      const payload = { name: form.name.trim(), city: form.city, active: form.active }
      if (editing) {
        await updateSite(editing.id, payload)
      } else {
        await createSite(payload)
      }
      closeModal()
      fetchSites()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Une erreur est survenue.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteSite(deleteTarget.id)
      setDeleteTarget(null)
      fetchSites()
    } catch (err) {
      alert(err.response?.data?.error || 'Impossible de supprimer ce site.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sites</h1>
          <p className="text-gray-500 text-sm mt-1">{sites.length} site(s) enregistré(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouveau Site
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Building size={40} className="text-gray-300" />
            <p className="text-gray-400">Aucun site enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="table-header">Nom</th>
                  <th className="table-header">Ville</th>
                  <th className="table-header">Statut</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sites.map(site => (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        {site.name}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${CITY_COLORS[site.city] || 'bg-gray-100 text-gray-600'}`}>
                        {CITIES.find(c => c.value === site.city)?.label || site.city}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        site.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {site.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(site)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(site)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editing ? 'Modifier le Site' : 'Nouveau Site'}
              </h3>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormErrors(p => ({ ...p, name: '' })) }}
                  className={`input-field ${formErrors.name ? 'border-red-400' : ''}`}
                  placeholder="Nom du site"
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {CITIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => { setForm(p => ({ ...p, city: c.value })); setFormErrors(p => ({ ...p, city: '' })) }}
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

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Site actif</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {formLoading && <Loader2 size={16} className="animate-spin" />}
                  {editing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer le site"
        message={`Supprimer le site "${deleteTarget?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default Sites
