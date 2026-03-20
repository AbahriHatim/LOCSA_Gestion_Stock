import React, { useEffect, useState } from 'react'
import { getAuditLogs } from '../api/audit'
import Pagination from '../components/Pagination'
import { History } from 'lucide-react'

const ACTION_COLORS = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  ADJUST: 'bg-amber-100 text-amber-700',
}

const ENTITY_LABELS = {
  PRODUCT:     'Produit',
  STOCK_ENTRY: 'Entrée',
  STOCK_EXIT:  'Sortie',
  INVENTORY:   'Inventaire',
  TRANSFER:    'Transfert',
}

const AuditLog = () => {
  const [data, setData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
  })
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [page, setPage]                 = useState(0)

  const fetchLogs = async (p = 0, entity = entityFilter) => {
    setLoading(true)
    setError('')
    try {
      const res = await getAuditLogs(p, 20, entity || null)
      setData(res.data)
    } catch {
      setError('Impossible de charger les journaux.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs(page, entityFilter) }, [page, entityFilter])

  const formatDateTime = (dt) => dt ? new Date(dt).toLocaleString('fr-FR') : '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Journal d'Audit</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {data.totalElements} entrée(s) enregistrée(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <History size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={entityFilter}
          onChange={e => { setEntityFilter(e.target.value); setPage(0) }}
          className="input-field w-52 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
        >
          <option value="">Toutes les entités</option>
          {Object.entries(ENTITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden dark:bg-gray-800">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : data.content.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <History size={40} className="text-gray-300" />
            <p className="text-gray-400 dark:text-gray-500">Aucun journal trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="table-header dark:text-gray-400">Date / Heure</th>
                    <th className="table-header dark:text-gray-400">Action</th>
                    <th className="table-header dark:text-gray-400">Entité</th>
                    <th className="table-header dark:text-gray-400">ID</th>
                    <th className="table-header dark:text-gray-400">Effectué par</th>
                    <th className="table-header dark:text-gray-400">Ville</th>
                    <th className="table-header dark:text-gray-400">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {data.content.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="table-cell text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDateTime(log.performedAt)}
                      </td>
                      <td className="table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="table-cell text-sm dark:text-gray-300">
                        {ENTITY_LABELS[log.entityType] || log.entityType}
                      </td>
                      <td className="table-cell text-sm text-gray-500 dark:text-gray-400">
                        {log.entityId}
                      </td>
                      <td className="table-cell">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium dark:text-gray-300">
                          {log.performedBy}
                        </span>
                      </td>
                      <td className="table-cell text-sm text-gray-500 dark:text-gray-400">
                        {log.city || '—'}
                      </td>
                      <td
                        className="table-cell text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate"
                        title={log.details}
                      >
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              pageSize={data.pageSize}
              onPageChange={p => setPage(p)}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default AuditLog
