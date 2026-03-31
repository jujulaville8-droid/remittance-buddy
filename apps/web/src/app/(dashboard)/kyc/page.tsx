'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type KycState = 'idle' | 'loading' | 'loaded' | 'completed' | 'failed' | 'error'

export default function KycPage() {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [state, setState] = useState<KycState>('idle')
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setState('loading')
    fetch('/api/kyc/create-inquiry', { method: 'POST' })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            if (res.status === 409) {
              // Already approved — redirect to dashboard
              router.replace('/dashboard')
              return null
            }
            throw new Error(body.error ?? 'Failed to start verification')
          })
        }
        return res.json()
      })
      .then((data) => {
        if (!data) return
        const url = `https://withpersona.com/verify?inquiry-id=${data.inquiryId}&session-token=${data.sessionToken}`
        setIframeUrl(url)
        setState('loaded')
      })
      .catch((err: Error) => {
        setErrorMsg(err.message)
        setState('error')
      })
  }, [router])

  // Listen for Persona postMessage events
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== 'https://withpersona.com') return
      const { name } = event.data ?? {}
      if (name === 'persona:inquiry:completed') {
        setState('completed')
        setTimeout(() => router.replace('/dashboard'), 2000)
      } else if (name === 'persona:inquiry:failed' || name === 'persona:inquiry:declined') {
        setState('failed')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [router])

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Starting identity verification…</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-sm">Could not start verification</p>
          {errorMsg && <p className="text-muted-foreground mt-1 text-xs">{errorMsg}</p>}
          <button
            className="bg-primary text-primary-foreground mt-4 rounded px-4 py-2 text-sm"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (state === 'completed') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-green-500">Verification submitted — redirecting…</p>
      </div>
    )
  }

  if (state === 'failed') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-sm">Verification could not be completed</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Please try again or contact support.
          </p>
          <button
            className="bg-primary text-primary-foreground mt-4 rounded px-4 py-2 text-sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="w-full max-w-lg">
        <h1 className="mb-1 text-xl font-bold">Identity Verification</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          We are required to verify your identity before you can send money internationally.
        </p>
        {iframeUrl && (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="h-[640px] w-full rounded-lg border"
            allow="camera; microphone"
            title="Identity verification"
          />
        )}
      </div>
    </div>
  )
}
