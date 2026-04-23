/**
 * Native bridge — safe wrappers around Capacitor plugins.
 *
 * All exports are safe to call from server components (they no-op) and from
 * web browsers (they no-op). Only fire native APIs when running inside the
 * Capacitor WebView on iOS / Android.
 *
 * Rule: never throw from this module. A missing plugin or failed native call
 * must degrade gracefully — the web flow must always keep working.
 */

type HapticStyle = 'light' | 'medium' | 'heavy'

function isNative(): boolean {
  if (typeof window === 'undefined') return false
  // Capacitor injects `window.Capacitor` only inside the native WebView.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor
  return Boolean(cap?.isNativePlatform?.())
}

export function isNativePlatform(): boolean {
  return isNative()
}

export async function haptic(style: HapticStyle = 'medium'): Promise<void> {
  if (!isNative()) return
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    const map = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    } as const
    await Haptics.impact({ style: map[style] })
  } catch {
    // plugin unavailable — silently ignore
  }
}

export async function notificationHaptic(): Promise<void> {
  if (!isNative()) return
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics')
    await Haptics.notification({ type: NotificationType.Success })
  } catch {
    /* noop */
  }
}

export async function shareReceipt(opts: {
  title: string
  text: string
  url?: string
}): Promise<void> {
  if (!isNative()) {
    // Fall back to web Share API if available
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(opts)
      } catch {
        /* user cancelled */
      }
    }
    return
  }
  try {
    const { Share } = await import('@capacitor/share')
    await Share.share({
      title: opts.title,
      text: opts.text,
      url: opts.url,
      dialogTitle: 'Share receipt',
    })
  } catch {
    /* noop */
  }
}

/**
 * Request push notification permission and return an APNs / FCM token.
 * Returns null on web, on permission denial, or on any failure.
 * Caller should POST the token to /api/push/register.
 */
export async function registerForPush(): Promise<string | null> {
  if (!isNative()) return null
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const perm = await PushNotifications.requestPermissions()
    if (perm.receive !== 'granted') return null

    return await new Promise<string | null>((resolve) => {
      const timeout = setTimeout(() => resolve(null), 10_000)
      PushNotifications.addListener('registration', (token) => {
        clearTimeout(timeout)
        resolve(token.value)
      })
      PushNotifications.addListener('registrationError', () => {
        clearTimeout(timeout)
        resolve(null)
      })
      void PushNotifications.register()
    })
  } catch {
    return null
  }
}

/**
 * Subscribe to connectivity changes. Returns an unsubscribe function.
 * On web, uses navigator.onLine events. On native, uses @capacitor/network.
 */
export function subscribeConnectivity(
  onChange: (online: boolean) => void,
): () => void {
  if (!isNative()) {
    if (typeof window === 'undefined') return () => {}
    const onOnline = () => onChange(true)
    const onOffline = () => onChange(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }
  let handle: { remove: () => Promise<void> } | null = null
  void (async () => {
    try {
      const { Network } = await import('@capacitor/network')
      handle = await Network.addListener('networkStatusChange', (status) => {
        onChange(status.connected)
      })
    } catch {
      /* noop */
    }
  })()
  return () => {
    void handle?.remove()
  }
}

/**
 * Opt-in biometric unlock. Call at app-level settings toggle, NOT as a
 * blocking gate on mount — a failed Face ID would lock users out of their
 * transfer history.
 */
export async function verifyBiometric(reason: string): Promise<boolean> {
  if (!isNative()) return true
  try {
    const mod = await import('@capgo/capacitor-native-biometric')
    const NativeBiometric = mod.NativeBiometric
    const available = await NativeBiometric.isAvailable()
    if (!available.isAvailable) return true // no biometric hardware → let user in
    await NativeBiometric.verifyIdentity({
      reason,
      title: 'My Remittance Pal',
      subtitle: 'Confirm it’s you',
    })
    return true
  } catch {
    return false
  }
}
