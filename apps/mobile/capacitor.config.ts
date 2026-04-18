import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor config — remote mode.
 * The mobile shell loads the live Vercel deployment. When we're ready to
 * ship offline-capable builds, switch `server.url` to a bundled static
 * export and drop the url here.
 */
const config: CapacitorConfig = {
  appId: 'com.remittancebuddy.app',
  appName: 'Remittance Buddy',
  webDir: 'www',
  server: {
    // Native shell drops users straight into the tool, skipping the
    // landing page. Landing is for web visitors; app users already
    // installed — they want the product.
    url: 'https://remitance-buddy.vercel.app/compare?source=app',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#14110D',
  },
  android: {
    backgroundColor: '#14110D',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#14110D',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#14110D',
    },
    Keyboard: {
      resize: 'body',
    },
  },
}

export default config
