import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import { Warehouse, Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Email requis'); return }
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch {
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4">
            <Warehouse size={32} className="text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold text-white">LOCSA SARL</h1>
          <p className="text-blue-200 mt-1">Système de Gestion de Stock</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-2">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Email envoyé !</h2>
              <p className="text-gray-500 text-sm">
                Si l'adresse <strong>{email}</strong> correspond à un compte, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="text-gray-400 text-xs">Vérifiez aussi vos spams.</p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2 mt-4">
                <ArrowLeft size={16} /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Mot de passe oublié</h2>
              <p className="text-gray-500 text-sm mb-6">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder="votre@email.com"
                      className="input-field pl-9"
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Envoi...</> : 'Envoyer le lien'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <ArrowLeft size={14} /> Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
