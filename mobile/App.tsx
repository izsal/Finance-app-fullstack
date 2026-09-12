import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LiquidBackground } from './src/components/LiquidBackground'
import { DashboardScreen } from './src/screens/DashboardScreen'
import { TransactionsScreen } from './src/screens/TransactionsScreen'
import { WalletsScreen } from './src/screens/WalletsScreen'
import { GoalsScreen } from './src/screens/GoalsScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { AuthScreen } from './src/screens/AuthScreen'
import { AppLogo } from './src/components/AppLogo'
import { ApiService } from './src/services/api'
import {
  emptySummary,
  GoalItem,
  SubscriptionItem,
  SummaryData,
} from './src/services/mockData'
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext'

type TabType = 'dashboard' | 'transactions' | 'wallets' | 'goals' | 'settings'

function MainContent() {
  const insets = useSafeAreaInsets()
  const { theme, isDark } = useAppTheme()
  const [initializing, setInitializing] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard')
  const [summary, setSummary] = useState<SummaryData>(emptySummary)
  const [goals, setGoals] = useState<GoalItem[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([])
  const [isLive, setIsLive] = useState(false)

  const loadAllData = useCallback(async () => {
    try {
      const sumData = await ApiService.getSummary()
      setSummary(sumData)
      setIsLive(true)

      const [goalsList, subsList] = await Promise.all([
        ApiService.getGoals(),
        ApiService.getSubscriptions(),
      ])
      setGoals(goalsList)
      setSubscriptions(subsList)
    } catch (e: any) {
      if (e?.message === 'UNAUTHORIZED') {
        setIsAuthenticated(false)
        setSummary(emptySummary)
      } else {
        setIsLive(false)
      }
    }
  }, [])

  useEffect(() => {
    const startup = async () => {
      try {
        await ApiService.init()
        const user = await ApiService.getMe()
        if (user && ApiService.getToken()) {
          setIsAuthenticated(true)
          await loadAllData()
        } else {
          setIsAuthenticated(false)
        }
      } catch (e) {
        setIsAuthenticated(false)
      } finally {
        setInitializing(false)
      }
    }
    startup()
  }, [loadAllData])

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true)
    await loadAllData()
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setSummary(emptySummary)
    setGoals([])
    setSubscriptions([])
    setCurrentTab('dashboard')
  }

  // Splash screen while reading stored session
  if (initializing) {
    return (
      <LiquidBackground>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <View style={styles.splashContainer}>
          <AppLogo size={72} borderRadius={20} style={styles.splashLogoBox} />
          <Text style={[styles.splashTitle, { color: theme.colors.text }]}>Dompetku</Text>
          <Text style={[styles.splashSubtitle, { color: theme.colors.textSecondary }]}>Memuat sesi akun Anda...</Text>
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
        </View>
      </LiquidBackground>
    )
  }

  // If not logged in, show AuthScreen (Login / Register / Google OAuth)
  if (!isAuthenticated) {
    return (
      <LiquidBackground>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <View style={[styles.mainArea, { paddingTop: Math.max(insets.top, 16) }]}>
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        </View>
      </LiquidBackground>
    )
  }

  const isPro = ApiService.getCurrentUser()?.plan === 'pro'

  const tabs: { id: TabType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'dashboard', label: 'Ringkasan', icon: 'grid-outline' },
    { id: 'transactions', label: 'Transaksi', icon: 'receipt-outline' },
    { id: 'wallets', label: 'Dompet', icon: 'wallet-outline' },
    { id: 'goals', label: isPro ? 'Target' : 'Target 🔒', icon: isPro ? 'flag-outline' : 'lock-closed-outline' },
    { id: 'settings', label: 'Setelan', icon: 'options-outline' },
  ]

  return (
    <LiquidBackground>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* Main Screen Content with top inset */}
      <View style={[styles.mainArea, { paddingTop: Math.max(insets.top, 14) }]}>
        {currentTab === 'dashboard' && (
          <DashboardScreen
            summary={summary}
            isLive={isLive}
            onRefresh={loadAllData}
            onOpenSettings={() => setCurrentTab('settings')}
            onNavigateTab={(tab) => setCurrentTab(tab as TabType)}
          />
        )}
        {currentTab === 'transactions' && (
          <TransactionsScreen
            transactions={summary.recentTransactions}
            wallets={summary.wallets}
            onRefresh={loadAllData}
          />
        )}
        {currentTab === 'wallets' && (
          <WalletsScreen wallets={summary.wallets} onRefresh={loadAllData} />
        )}
        {currentTab === 'goals' && (
          <GoalsScreen
            goals={goals}
            subscriptions={subscriptions}
            wallets={summary.wallets}
            onRefresh={loadAllData}
          />
        )}
        {currentTab === 'settings' && (
          <SettingsScreen
            isLive={isLive}
            onConfigChanged={loadAllData}
            onLogout={handleLogout}
          />
        )}
      </View>

      {/* FLOATING MINIMALIST NAVIGATION BAR */}
      <View
        style={[
          styles.bottomNavWrapper,
          { bottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <View
          style={[
            styles.glassNavContainer,
            {
              backgroundColor: theme.colors.navBackground,
              borderColor: theme.colors.border,
            },
            isDark ? styles.navDarkShadow : styles.navLightShadow,
          ]}
        >
          {Platform.OS !== 'web' && (
            <BlurView intensity={50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          )}

          {/* Nav Items */}
          <View style={styles.navRow}>
            {tabs.map((tab) => {
              const active = currentTab === tab.id
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.75}
                  onPress={() => setCurrentTab(tab.id)}
                  style={[
                    styles.navItem,
                    active && {
                      backgroundColor: isDark ? 'rgba(20, 184, 166, 0.12)' : '#f0fdfa',
                    },
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={19}
                    color={active ? theme.colors.primary : theme.colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.navLabel,
                      {
                        color: active ? theme.colors.primary : theme.colors.textMuted,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </View>
    </LiquidBackground>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainContent />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  mainArea: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogoBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  splashTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  splashSubtitle: {
    fontSize: 13,
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99,
  },
  glassNavContainer: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
  },
  navDarkShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  navLightShadow: {
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.1,
  },
})
