import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor config — remote mode.
 * The mobile shell loads the live Vercel deployment. When we're ready to
 * ship offline-capable builds, switch `server.url` to a bundled static
 * export and drop the url here.
 */
const config: CapacitorConfig = {
  appId: 'com.myremittancepal.app',
  appName: 'My Remittance Pal',
  webDir: 'www',
  server: {
    url: 'https://my-remittance-pal.vercel.app',
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
