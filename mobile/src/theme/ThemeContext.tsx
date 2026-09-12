import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useColorScheme } from 'react-native'

export type ThemeMode = 'dark' | 'light'

export interface AppTheme {
  isDark: boolean
  colors: {
    background: string
    surface: string
    surfaceElevated: string
    border: string
    borderSubtle: string
    text: string
    textSecondary: string
    textMuted: string
    primary: string
    primaryForeground: string
    secondary: string
    income: string
    incomeBg: string
    expense: string
    expenseBg: string
    navBackground: string
    inputBg: string
    badgeBg: string
    // Cute category colors inspired by Money+ & Money Tracker
    cuteCategories: {
      food: { bg: string; text: string; icon: string }
      shopping: { bg: string; text: string; icon: string }
      transport: { bg: string; text: string; icon: string }
      salary: { bg: string; text: string; icon: string }
      bills: { bg: string; text: string; icon: string }
      entertainment: { bg: string; text: string; icon: string }
      investment: { bg: string; text: string; icon: string }
      general: { bg: string; text: string; icon: string }
    }
  }
}

export const lightTheme: AppTheme = {
  isDark: false,
  colors: {
    background: '#ffffff', // Pure white like web version
    surface: '#ffffff',
    surfaceElevated: '#f4f4f5',
    border: '#e4e4e7', // Web border token
    borderSubtle: '#f4f4f5',
    text: '#09090b', // Web foreground token
    textSecondary: '#52525b',
    textMuted: '#71717a',
    primary: '#18181b', // Web primary
    primaryForeground: '#ffffff',
    secondary: '#f4f4f5',
    income: '#16a34a',
    incomeBg: '#f0fdf4',
    expense: '#dc2626',
    expenseBg: '#fef2f2',
    navBackground: '#ffffff',
    inputBg: '#f4f4f5',
    badgeBg: '#f4f4f5',
    cuteCategories: {
      food: { bg: '#ffedd5', text: '#ea580c', icon: 'fast-food-outline' },
      shopping: { bg: '#ffe4e6', text: '#e11d48', icon: 'bag-handle-outline' },
      transport: { bg: '#e0f2fe', text: '#0284c7', icon: 'car-outline' },
      salary: { bg: '#dcfce7', text: '#16a34a', icon: 'cash-outline' },
      bills: { bg: '#fef9c3', text: '#ca8a04', icon: 'flash-outline' },
      entertainment: { bg: '#f3e8ff', text: '#9333ea', icon: 'game-controller-outline' },
      investment: { bg: '#ccfbf1', text: '#0d9488', icon: 'trending-up-outline' },
      general: { bg: '#f4f4f5', text: '#52525b', icon: 'receipt-outline' },
    },
  },
}

export const darkTheme: AppTheme = {
  isDark: true,
  colors: {
    background: '#09090b', // Deep black/zinc-950 like web dark version
    surface: '#18181b', // Web dark card
    surfaceElevated: '#27272a',
    border: 'rgba(255, 255, 255, 0.1)', // Web dark border
    borderSubtle: 'rgba(255, 255, 255, 0.05)',
    text: '#fafafa', // Web dark foreground
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    primary: '#fafafa', // Web dark primary
    primaryForeground: '#09090b',
    secondary: '#27272a',
    income: '#22c55e',
    incomeBg: 'rgba(34, 197, 94, 0.15)',
    expense: '#ef4444',
    expenseBg: 'rgba(239, 68, 68, 0.15)',
    navBackground: '#121214',
    inputBg: '#27272a',
    badgeBg: '#27272a',
    cuteCategories: {
      food: { bg: 'rgba(234, 88, 12, 0.2)', text: '#fb923c', icon: 'fast-food-outline' },
      shopping: { bg: 'rgba(225, 29, 72, 0.2)', text: '#fb7185', icon: 'bag-handle-outline' },
      transport: { bg: 'rgba(2, 132, 199, 0.2)', text: '#38bdf8', icon: 'car-outline' },
      salary: { bg: 'rgba(22, 163, 74, 0.2)', text: '#4ade80', icon: 'cash-outline' },
      bills: { bg: 'rgba(202, 138, 4, 0.2)', text: '#facc15', icon: 'flash-outline' },
      entertainment: { bg: 'rgba(147, 51, 234, 0.2)', text: '#c084fc', icon: 'game-controller-outline' },
      investment: { bg: 'rgba(13, 148, 136, 0.2)', text: '#2dd4bf', icon: 'trending-up-outline' },
      general: { bg: 'rgba(255, 255, 255, 0.1)', text: '#a1a1aa', icon: 'receipt-outline' },
    },
  },
}

interface ThemeContextType {
  themeMode: ThemeMode
  isDark: boolean
  theme: AppTheme
  toggleTheme: () => void
  setThemeMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  isDark: false,
  theme: lightTheme,
  toggleTheme: () => {},
  setThemeMode: () => {},
})

const STORAGE_KEY_THEME = '@dompetku_theme_mode'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light')

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_THEME).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setThemeModeState(saved)
      } else if (systemScheme === 'dark') {
        setThemeModeState('dark')
      }
    })
  }, [systemScheme])

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode)
    await AsyncStorage.setItem(STORAGE_KEY_THEME, mode)
  }

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark'
    setThemeMode(next)
  }

  const isDark = themeMode === 'dark'
  const currentTheme = isDark ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        theme: currentTheme,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useAppTheme = () => useContext(ThemeContext)
