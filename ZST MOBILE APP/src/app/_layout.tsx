import { useEffect, useState } from "react"
import { Slot, SplashScreen } from "expo-router"
import { useFonts } from "@expo-google-fonts/space-grotesk"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import { initI18n } from "@/i18n"
import { ThemeProvider } from "@/theme/context"
import { AuthProvider } from "@/context/AuthContext"
import { customFontsToLoad } from "@/theme/typography"
import { loadDateFnsLocale } from "@/utils/formatDate"

SplashScreen.preventAutoHideAsync()

if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("@/devtools/ReactotronConfig")
}

export default function Root() {
  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
      .catch((error) => {
        console.error('Error initializing i18n:', error)
        setIsI18nInitialized(true) // Fallback: continue anyway
      })
  }, [])

  const loaded = fontsLoaded && isI18nInitialized

  useEffect(() => {
    if (fontError) throw fontError
  }, [fontError])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  // Fallback: Force hide splash screen after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('Forcing splash screen to hide after timeout')
      SplashScreen.hideAsync()
    }, 5000)

    return () => clearTimeout(timeout)
  }, [])

  if (!loaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <AuthProvider>
            <Slot />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
