import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { GlassCard } from '../components/GlassCard'
import { GlassButton } from '../components/GlassButton'
import { GlassInput } from '../components/GlassInput'
import { AppLogo } from '../components/AppLogo'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'

interface Props {
  onLoginSuccess: () => void
}

export const AuthScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const { theme, isDark, toggleTheme } = useAppTheme()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [customToken, setCustomToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      try {
        const parsed = Linking.parse(event.url)
        const token = parsed.queryParams?.token
        if (token && typeof token === 'string') {
          ApiService.setToken(token).then(() => {
            onLoginSuccess()
          })
        }
      } catch (e) {}
    }

    const sub = Linking.addEventListener('url', handleUrl)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url })
    })

    return () => sub.remove()
  }, [onLoginSuccess])

  const handleSubmit = async () => {
    setError('')
    if (showTokenInput) {
      if (!customToken.trim()) {
        setError('Silakan tempel token sesi Anda')
        return
      }
      setLoading(true)
      try {
        await ApiService.setToken(customToken.trim())
        const user = await ApiService.getMe()
        if (user) {
          onLoginSuccess()
        } else {
          setError('Token sesi tidak valid atau sudah kedaluwarsa')
        }
      } catch (e: any) {
        setError(e?.message || 'Gagal memverifikasi token')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!email.trim() || !password) {
      setError('Email dan kata sandi wajib diisi')
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Nama lengkap wajib diisi')
          setLoading(false)
          return
        }
        const res = await ApiService.register(name, email, password)
        if (res.success) {
          onLoginSuccess()
        } else {
          setError(res.message)
        }
      } else {
        const res = await ApiService.login(email, password)
        if (res.success) {
          onLoginSuccess()
        } else {
          setError(res.message)
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const res = await ApiService.loginWithGoogle()
      if (res.success && res.token) {
        onLoginSuccess()
      } else if (res.message) {
        setError(res.message)
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal menghubungkan akun Google')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Top right theme switcher */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleTheme}
          style={[styles.themeBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={18}
            color={isDark ? '#facc15' : '#6366f1'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Brand Header */}
        <View style={styles.brandSection}>
          <AppLogo size={68} borderRadius={18} style={styles.logoBadge} />
          <Text style={[styles.brandTitle, { color: theme.colors.text }]}>Dompetku</Text>
          <Text style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]}>
            Aplikasi Keuangan Pribadi Minimalis & Real-Time
          </Text>
        </View>

        {/* Minimal Auth Card */}
        <GlassCard
          borderRadius={24}
          style={styles.authCard}
        >
          <View style={styles.cardInner}>
            {/* Mode Switcher */}
            <View style={[styles.modeSwitcher, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setMode('login')
                  setShowTokenInput(false)
                  setError('')
                }}
                style={[
                  styles.modeBtn,
                  mode === 'login' && !showTokenInput && {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    {
                      color: mode === 'login' && !showTokenInput ? theme.colors.text : theme.colors.textMuted,
                      fontWeight: mode === 'login' && !showTokenInput ? '700' : '500',
                    },
                  ]}
                >
                  Masuk Akun
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setMode('register')
                  setShowTokenInput(false)
                  setError('')
                }}
                style={[
                  styles.modeBtn,
                  mode === 'register' && !showTokenInput && {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    {
                      color: mode === 'register' && !showTokenInput ? theme.colors.text : theme.colors.textMuted,
                      fontWeight: mode === 'register' && !showTokenInput ? '700' : '500',
                    },
                  ]}
                >
                  Daftar Baru
                </Text>
              </TouchableOpacity>
            </View>

            {/* Google OAuth Button */}
            {!showTokenInput && (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleGoogleSignIn}
                  disabled={googleLoading}
                  style={[
                    styles.googleBtn,
                    {
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  {googleLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.text} />
                  ) : (
                    <View style={styles.googleBtnContent}>
                      <Ionicons name="logo-google" size={17} color={theme.colors.text} style={{ marginRight: 8 }} />
                      <Text style={[styles.googleBtnText, { color: theme.colors.text }]}>
                        Lanjutkan dengan Akun Google
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                  <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>
                    atau dengan email
                  </Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                </View>
              </>
            )}

            {/* Form Fields */}
            {showTokenInput ? (
              <View style={{ marginBottom: 12 }}>
                <GlassInput
                  label="Token Sesi (Bearer Token)"
                  placeholder="Tempel token sesi Anda di sini..."
                  icon="key-outline"
                  value={customToken}
                  onChangeText={setCustomToken}
                  autoCapitalize="none"
                />
                <Text style={[styles.tokenHelp, { color: theme.colors.textMuted }]}>
                  Bisa disalin langsung dari halaman pengaturan dashboard web Anda.
                </Text>
              </View>
            ) : (
              <>
                {mode === 'register' && (
                  <GlassInput
                    label="Nama Lengkap"
                    placeholder="Nama Anda"
                    icon="person-outline"
                    value={name}
                    onChangeText={setName}
                  />
                )}

                <GlassInput
                  label="Email Akun"
                  placeholder="nama@email.com"
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                <GlassInput
                  label="Kata Sandi"
                  placeholder="••••••••"
                  icon="lock-closed-outline"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </>
            )}

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: theme.colors.expenseBg, borderColor: theme.colors.expense }]}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.expense} />
                <Text style={[styles.errorText, { color: theme.colors.expense }]}>{error}</Text>
              </View>
            ) : null}

            {/* Action Button */}
            <GlassButton
              title={
                showTokenInput
                  ? 'Gunakan Sesi Ini'
                  : mode === 'register'
                  ? 'Daftar Akun Baru'
                  : 'Masuk Sekarang'
              }
              onPress={handleSubmit}
              loading={loading}
              icon="arrow-forward"
              variant="primary"
              size="lg"
              style={{ marginTop: 4 }}
            />

            {/* Quick Connect toggle */}
            <TouchableOpacity
              onPress={() => {
                setShowTokenInput(!showTokenInput)
                setError('')
              }}
              style={styles.switchAuthStyleBtn}
            >
              <Text style={[styles.switchAuthStyleText, { color: theme.colors.primary }]}>
                {showTokenInput
                  ? '← Kembali ke Login Biasa'
                  : 'Punya token sesi dari web? Masuk dengan Token'}
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
  },
  cardInner: {
    padding: 20,
  },
  modeSwitcher: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    marginBottom: 18,
    borderWidth: 1,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11,
  },
  modeBtnText: {
    fontSize: 13,
  },
  googleBtn: {
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  tokenHelp: {
    fontSize: 11,
    marginTop: -8,
  },
  switchAuthStyleBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchAuthStyleText: {
    fontSize: 12,
    fontWeight: '600',
  },
})
