import React, { useEffect, useState, useCallback } from 'react'
import { getDashboard, getDashboardStats, getStockByCity, getStockByProduct } from '../api/dashboard'
import { useAuth } from '../context/AuthContext'
import {
  Package, TrendingUp, TrendingDown, AlertTriangle,
  RefreshCw, Boxes, ClipboardList, Calendar, MapPin, Search, LayoutGrid
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

const PERIODS = [
  { key: 'week',    label: 'Cette semaine' },
  { key: 'month',   label: 'Ce mois' },
  { key: '3months', label: '3 derniers mois' },
  { key: 'year',    label: 'Cette année' },
  { key: 'all',     label: 'Tout' },
]

const CITIES = [
  { value: '',           label: 'Toutes les villes', color: 'text-gray-600',   bg: 'bg-gray-50',     border: 'border-gray-200' },
  { value: 'TANGER',     label: 'Tanger',            color: 'text-blue-700',   bg: 'bg-blue-50',     border: 'border-blue-200' },
  { value: 'FES',        label: 'Fès',               color: 'text-emerald-700',bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  { value: 'CASABLANCA', label: 'Casablanca',        color: 'text-orange-700', bg: 'bg-orange-50',   border: 'border-orange-200' },
]

const CITY_ICON_COLORS = {
  TANGER:     { icon: 'text-blue-600',    bg: 'bg-blue-50',    bar: '#3b82f6' },
  FES:        { icon: 'text-emerald-600', bg: 'bg-emerald-50', bar: '#10b981' },
  CASABLANCA: { icon: 'text-orange-600',  bg: 'bg-orange-50',  bar: '#f97316' },
}

const StatCard = ({ icon: Icon, label, value, color, bgColor, sub }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

const Dashboard = () => {
  const { isAdmin, userCity } = useAuth()
  const [data, setData] = useState(null)
  const [stats, setStats] = useState(null)
  const [cityStocks, setCityStocks] = useState([])
  const [productStocks, setProductStocks] = useState([])
  const [period, setPeriod] = useState('month')
  const [cityFilter, setCityFilter] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchKpis = async () => {
    setLoading(true)
    setError('')
    try {
      const [dashRes, cityRes, productRes] = await Promise.all([
        getDashboard(),
        getStockByCity(),
        getStockByProduct(),
      ])
      setData(dashRes.data)
      setCityStocks(cityRes.data)
      setProductStocks(productRes.data)
    } catch {
      setError('Impossible de charger le tableau de bord.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = useCallback(async (p, city) => {
    setStatsLoading(true)
    try {
      const res = await getDashboardStats(p, city || undefined)
      setStats(res.data)
    } catch {
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => { fetchKpis() }, [])
  useEffect(() => { fetchStats(period, cityFilter) }, [period, cityFilter, fetchStats])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  const currentCityLabel = CITIES.find(c => c.value === cityFilter)?.label || 'Toutes les villes'
  const currentPeriodLabel = PERIODS.find(p => p.key === period)?.label

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchKpis} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble du stock</p>
        </div>
        <button onClick={() => { fetchKpis(); fetchStats(period, cityFilter) }} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {/* KPI Cards (global) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Boxes} label="Stock Total (toutes villes)" value={data?.totalStock ?? 0}
          color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard icon={Package} label="Produits" value={data?.totalProducts ?? 0}
          color="text-indigo-600" bgColor="bg-indigo-50" />
        <StatCard icon={AlertTriangle} label="Stock Faible (≤5)" value={data?.lowStockCount ?? 0}
          color={data?.lowStockCount > 0 ? "text-red-600" : "text-gray-400"}
          bgColor={data?.lowStockCount > 0 ? "bg-red-50" : "bg-gray-50"} />
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <ClipboardList size={22} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Écarts inventaire</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-red-600">▼ {data?.negativeGapCount ?? 0}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-bold text-orange-500">▲ {data?.positiveGapCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock par ville */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={18} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">Stock par Ville</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cityStocks.map(cs => {
            const colors = CITY_ICON_COLORS[cs.city] || { icon: 'text-gray-600', bg: 'bg-gray-50' }
            const cityMeta = CITIES.find(c => c.value === cs.city)
            return (
              <div key={cs.city} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <MapPin size={16} className={colors.icon} />
                  </div>
                  <span className="font-semibold text-gray-800">{cityMeta?.label || cs.city}</span>
                </div>
                <p className="text-3xl font-bold text-gray-800 mb-2">{cs.currentStock}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp size={11} /> Entrées : {cs.totalEntries}
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <TrendingDown size={11} /> Sorties : {cs.totalExits}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stock par Produit par Ville */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Stock par Produit</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{productStocks.length} produit(s)</span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              placeholder="Filtrer produits..."
              className="input-field pl-8 py-1.5 text-sm w-52"
            />
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header text-left">Produit</th>
                  {isAdmin ? (
                    <>
                      <th className="table-header">
                        <span className="inline-flex items-center gap-1 text-blue-700"><MapPin size={11} />Tanger</span>
                      </th>
                      <th className="table-header">
                        <span className="inline-flex items-center gap-1 text-emerald-700"><MapPin size={11} />Fès</span>
                      </th>
                      <th className="table-header">
                        <span className="inline-flex items-center gap-1 text-orange-700"><MapPin size={11} />Casablanca</span>
                      </th>
                      <th className="table-header font-bold text-gray-700">Total</th>
                    </>
                  ) : (
                    <th className="table-header">
                      <span className={`inline-flex items-center gap-1 ${CITY_ICON_COLORS[userCity]?.icon || 'text-gray-600'}`}>
                        <MapPin size={11} />{CITIES.find(c => c.value === userCity)?.label || userCity}
                      </span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productStocks
                  .filter(p => p.productName.toLowerCase().includes(productSearch.toLowerCase()))
                  .map(p => (
                    <tr key={p.productName} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={13} className="text-indigo-500" />
                          </div>
                          <span className="font-semibold text-gray-800">{p.productName}</span>
                        </div>
                      </td>
                      {isAdmin ? (
                        <>
                          <td className="table-cell text-center">
                            {p.stockTanger > 0
                              ? <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{p.stockTanger}</span>
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="table-cell text-center">
                            {p.stockFes > 0
                              ? <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">{p.stockFes}</span>
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="table-cell text-center">
                            {p.stockCasablanca > 0
                              ? <span className="inline-block px-2.5 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-bold">{p.stockCasablanca}</span>
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="table-cell text-center">
                            <span className="inline-block px-3 py-0.5 bg-gray-800 text-white rounded-full text-xs font-bold">{p.totalStock}</span>
                          </td>
                        </>
                      ) : (
                        <td className="table-cell text-center">
                          {(() => {
                            const val = userCity === 'TANGER' ? p.stockTanger : userCity === 'FES' ? p.stockFes : p.stockCasablanca
                            const colors = CITY_ICON_COLORS[userCity]
                            return val > 0
                              ? <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${colors?.bg || 'bg-gray-50'} ${colors?.icon || 'text-gray-700'}`}>{val}</span>
                              : <span className="text-gray-300 text-xs">—</span>
                          })()}
                        </td>
                      )}
                    </tr>
                  ))
                }
                {productStocks.filter(p => p.productName.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 2} className="table-cell text-center text-gray-400 py-8">
                      Aucun produit en stock
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Period Stats Section */}
      <div className="card">
        {/* City + Period selectors */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-800">Activité du stock</h2>
            </div>
            <div className="flex gap-1 flex-wrap">
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    period === p.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* City filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {CITIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCityFilter(c.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  cityFilter === c.value
                    ? `${c.bg} ${c.color} ${c.border} border`
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-1">
                  {c.value && <MapPin size={10} />}
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Period KPIs */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium">Entrées — {currentPeriodLabel} {cityFilter ? `· ${currentCityLabel}` : ''}</p>
                <p className="text-2xl font-bold text-green-700 mt-1">+{stats.entriesTotal}</p>
              </div>
              <TrendingUp size={28} className="text-green-400" />
            </div>
            <div className="bg-red-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-medium">Sorties — {currentPeriodLabel} {cityFilter ? `· ${currentCityLabel}` : ''}</p>
                <p className="text-2xl font-bold text-red-600 mt-1">-{stats.exitsTotal}</p>
              </div>
              <TrendingDown size={28} className="text-red-300" />
            </div>
          </div>
        )}

        {/* Chart */}
        {statsLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : stats?.chartData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(value, name) => [value, name === 'entries' ? 'Entrées' : 'Sorties']}
                labelFormatter={(label) => `Période : ${label}`}
              />
              <Legend formatter={(val) => val === 'entries' ? 'Entrées' : 'Sorties'} />
              <Area type="monotone" dataKey="entries" stroke="#22c55e" strokeWidth={2}
                fill="url(#colorEntries)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="exits" stroke="#ef4444" strokeWidth={2}
                fill="url(#colorExits)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Aucune activité sur cette période
          </div>
        )}
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Entries */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">Dernières Entrées</h2>
          </div>
          {data?.recentEntries?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucune entrée récente</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header">Produit</th>
                    <th className="table-header">Ville</th>
                    <th className="table-header">Quantité</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.recentEntries?.map(entry => {
                    const colors = CITY_ICON_COLORS[entry.city]
                    const cityMeta = CITIES.find(c => c.value === entry.city)
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{entry.productName}</td>
                        <td className="table-cell">
                          {entry.city && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors?.bg || 'bg-gray-50'} ${colors?.icon || 'text-gray-600'}`}>
                              <MapPin size={9} />
                              {cityMeta?.label || entry.city}
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className="text-green-600 font-semibold">+{entry.quantity}</span>
                        </td>
                        <td className="table-cell text-gray-500">{formatDate(entry.dateEntry)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Exits */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-red-500" />
            <h2 className="text-lg font-semibold text-gray-800">Dernières Sorties</h2>
          </div>
          {data?.recentExits?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucune sortie récente</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header">Produit</th>
                    <th className="table-header">Ville</th>
                    <th className="table-header">Quantité</th>
                    <th className="table-header">Bénéficiaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.recentExits?.map(exit => {
                    const colors = CITY_ICON_COLORS[exit.city]
                    const cityMeta = CITIES.find(c => c.value === exit.city)
                    return (
                      <tr key={exit.id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{exit.productName}</td>
                        <td className="table-cell">
                          {exit.city && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors?.bg || 'bg-gray-50'} ${colors?.icon || 'text-gray-600'}`}>
                              <MapPin size={9} />
                              {cityMeta?.label || exit.city}
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className="text-red-500 font-semibold">-{exit.quantity}</span>
                        </td>
                        <td className="table-cell text-gray-500">{exit.beneficiary}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
