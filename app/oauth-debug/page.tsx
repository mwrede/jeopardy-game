'use client'

import { useEffect, useState } from 'react'

export default function OAuthDebugPage() {
  const [config, setConfig] = useState<any>(null)
  const [redirectInfo, setRedirectInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth-check').then(res => res.json()),
      fetch('/api/test-redirect').then(res => res.json())
    ])
      .then(([authCheck, redirect]) => {
        setConfig(authCheck)
        setRedirectInfo(redirect)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching config:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading configuration...</div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-600">Failed to load configuration</div>
      </div>
    )
  }

  const redirectUri = redirectInfo?.redirectUri || config?.redirectUri?.expected || 'Not configured'

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-purple-800">OAuth Configuration Debug</h1>
        
        <div className="space-y-6">
          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">🚨 CRITICAL: Redirect URI Mismatch</h2>
            <p className="text-red-700 mb-4 font-semibold">
              You MUST add this EXACT URL to Google Cloud Console:
            </p>
            <div className="bg-white border-2 border-red-300 rounded p-4 mb-4">
              <code className="text-xl font-mono text-purple-800 break-all font-bold">
                {redirectUri}
              </code>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <h3 className="font-bold text-blue-800 mb-3">Step-by-step fix:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-700">
                <li>Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Google Cloud Console → Credentials</a> in a new tab</li>
                <li>Find and click on OAuth 2.0 Client ID: <code className="bg-blue-100 px-1 rounded">543014356558-bqcf9eco2h2p44nh12i5mgu6komgj5vf</code></li>
                <li>Scroll down to <strong>&quot;Authorized redirect URIs&quot;</strong></li>
                <li>Click <strong>&quot;+ ADD URI&quot;</strong> button</li>
                <li>Copy the URL from the purple box above and paste it into the text field</li>
                <li>Click <strong>&quot;SAVE&quot;</strong> at the bottom</li>
                <li>Wait <strong>3-5 minutes</strong> for Google to update</li>
                <li>Try signing in again</li>
              </ol>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800 font-semibold mb-2">⚠️ Common mistakes:</p>
              <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                {redirectInfo?.commonMistakes ? (
                  redirectInfo.commonMistakes.map((mistake: string, i: number) => (
                    <li key={i}>{mistake}</li>
                  ))
                ) : (
                  <>
                    <li>❌ Adding trailing slash: <code className="bg-red-100 px-1">/google/</code></li>
                    <li>❌ Wrong path: <code className="bg-red-100 px-1">/api/auth/callback</code> (missing /google)</li>
                    <li>❌ HTTP instead of HTTPS</li>
                    <li>✅ Correct: <code className="bg-green-100 px-1">https://raccoonjep.com/api/auth/callback/google</code></li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Current Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">NEXTAUTH_URL</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm">{config.nextAuth?.url || 'Not set'}</code>
                  {config.nextAuth?.hasTrailingSlash && (
                    <p className="text-red-600 text-sm mt-1">⚠️ Has trailing slash - this may cause issues!</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Expected Callback URL</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm break-all">{redirectUri}</code>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Google OAuth</h3>
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <p className="text-sm">Client ID: {config.google?.hasClientId ? '✅ Set' : '❌ Missing'}</p>
                  <p className="text-sm">Client Secret: {config.google?.hasClientSecret ? '✅ Set' : '❌ Missing'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">NextAuth Secret</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">{config.nextAuth?.hasSecret ? '✅ Set' : '❌ Missing'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

