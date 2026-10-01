import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GlassCard } from '../components/GlassCard'
import { GlassButton } from '../components/GlassButton'
import { GlassInput } from '../components/GlassInput'
import { AppLogo } from '../components/AppLogo'
import { ProUpgradeModal } from '../components/ProUpgradeModal'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'

interface Props {
  isLive: boolean
  onConfigChanged: () => Promise<void>
  onLogout: () => void
}

export const SettingsScreen: React.FC<Props> = ({ isLive, onConfigChanged, onLogout }) => {
  const { theme, isDark, themeMode, setThemeMode } = useAppTheme()
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false)
  const [switchingPlan, setSwitchingPlan] = useState(false)

  const currentUser = ApiService.getCurrentUser()
  const isPro = currentUser?.plan === 'pro'

  // Server URL settings for physical device testing
  const [serverUrl, setServerUrl] = useState(ApiService.getBaseUrl())
  const [pingTesting, setPingTesting] = useState(false)
  const [pingResult, setPingResult] = useState<{ ok: boolean; message: string; ms: number } | null>(null)
  const [savingUrl, setSavingUrl] = useState(false)

  const handleTestPing = async () => {
    setPingTesting(true)
    setPingResult(null)
    const res = await ApiService.testConnection(serverUrl.trim())
    setPingResult(res)
    setPingTesting(false)
  }

  const handleSaveServerUrl = async (newUrl?: string) => {
    const targetUrl = (newUrl || serverUrl).trim()
    if (!targetUrl) {
      Alert.alert('Perhatian', 'URL server tidak boleh kosong')
      return
    }
    setSavingUrl(true)
    try {
      await ApiService.setBaseUrl(targetUrl)
      setServerUrl(targetUrl)
      await onConfigChanged()
      const ping = await ApiService.testConnection(targetUrl)
      setPingResult(ping)
      Alert.alert(
        ping.ok ? 'Terhubung!' : 'Tersimpan (Periksa Jaringan)',
        ping.ok
          ? `Berhasil terhubung ke: ${targetUrl} (${ping.ms}ms)`
          : `URL disimpan ke: ${targetUrl}, namun server belum merespon (${ping.message}). Pastikan dev server berjalan.`
      )
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Gagal menyimpan URL')
    } finally {
      setSavingUrl(false)
    }
  }

  const handleTogglePlanDemo = async (targetPlan: 'free' | 'pro') => {
    setSwitchingPlan(true)
    try {
      const res = await ApiService.updatePlan(targetPlan)
      Alert.alert(
        res.success ? 'Status Diperbarui' : 'Gagal',
        res.message
      )
      await onConfigChanged()
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Gagal mengubah paket')
    } finally {
      setSwitchingPlan(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari akun Qwarts Finance ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await ApiService.logout()
            onLogout()
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Pengaturan & Akun</Text>
            <Text style={[styles.pageSubtitle, { color: theme.colors.textSecondary }]}>
              Kelola profil, paket keanggotaan, dan preferensi tampilan
            </Text>
          </View>
          <AppLogo size={42} borderRadius={12} style={{ marginLeft: 12 }} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* USER PROFILE CARD */}
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={17} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profil Pengguna</Text>
        </View>

        <GlassCard borderRadius={18} style={styles.card}>
          <View style={styles.userProfileInner}>
            <View
              style={[
                styles.userAvatarBox,
                {
                  backgroundColor: isPro
                    ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7')
                    : theme.colors.badgeBg,
                },
              ]}
            >
              <Ionicons
                name={isPro ? 'sparkles' : 'person'}
                size={24}
                color={isPro ? '#d97706' : theme.colors.primary}
              />
            </View>

            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={[styles.userNameText, { color: theme.colors.text }]}>
                  {currentUser?.name || 'Pengguna Qwarts Finance'}
                </Text>
              </View>

              <Text style={[styles.userEmailText, { color: theme.colors.textSecondary }]}>
                {currentUser?.email || 'email@example.com'}
              </Text>

              {/* Status Badge */}
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.planBadge,
                    {
                      backgroundColor: isPro
                        ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7')
                        : theme.colors.surfaceElevated,
                      borderColor: isPro ? '#f59e0b' : theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={isPro ? 'diamond' : 'shield-outline'}
                    size={12}
                    color={isPro ? '#d97706' : theme.colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.planText,
                      { color: isPro ? '#d97706' : theme.colors.textSecondary },
                    ]}
                  >
                    {isPro ? 'PRO MEMBER 👑' : 'FREE PLAN'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* MEMBERSHIP PLAN CARD (FREE VS PRO) */}
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon-outline" size={17} color="#d97706" />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Status Langganan</Text>
        </View>

        <GlassCard
          borderRadius={20}
          style={[
            styles.card,
            {
              borderColor: isPro
                ? (isDark ? 'rgba(245, 158, 11, 0.4)' : '#fde68a')
                : theme.colors.border,
            },
          ]}
        >
          <View style={styles.planCardInner}>
            {isPro ? (
              <View>
                <View style={styles.proActiveHeader}>
                  <View style={[styles.proCrownIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fffbeb' }]}>
                    <Ionicons name="sparkles" size={20} color="#d97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.proActiveTitle, { color: theme.colors.text }]}>
                      Qwarts Finance PRO Aktif 👑
                    </Text>
                    <Text style={[styles.proActiveSub, { color: theme.colors.textSecondary }]}>
                      Anda memiliki akses tak terbatas ke seluruh fitur eksklusif
                    </Text>
                  </View>
                </View>

                <View style={styles.perksList}>
                  <View style={styles.perkRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                    <Text style={[styles.perkText, { color: theme.colors.text }]}>
                      Multi-Rekening Dompet & Bank Tanpa Batas
                    </Text>
                  </View>
                  <View style={styles.perkRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                    <Text style={[styles.perkText, { color: theme.colors.text }]}>
                      Perencanaan Target Tabungan Impian
                    </Text>
                  </View>
                  <View style={styles.perkRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                    <Text style={[styles.perkText, { color: theme.colors.text }]}>
                      Pengingat Tagihan Rutin & Jatuh Tempo
                    </Text>
                  </View>
                  <View style={styles.perkRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                    <Text style={[styles.perkText, { color: theme.colors.text }]}>
                      Analisis Distribusi Kategori Pengeluaran
                    </Text>
                  </View>
                </View>

                {/* Tester Switch Option */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleTogglePlanDemo('free')}
                  disabled={switchingPlan}
                  style={[styles.testSwitchBtn, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.testSwitchText, { color: theme.colors.textMuted }]}>
                    {switchingPlan ? 'Mengubah...' : 'Uji Tampilan Akun Free'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.freeHeaderRow}>
                  <View style={[styles.freeLockIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb' }]}>
                    <Ionicons name="lock-closed" size={20} color="#d97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.freeTitle, { color: theme.colors.text }]}>
                      Tingkatkan ke Qwarts Finance PRO 👑
                    </Text>
                    <Text style={[styles.freeSub, { color: theme.colors.textSecondary }]}>
                      Beberapa fitur lanjutan saat ini dikunci untuk akun Free
                    </Text>
                  </View>
                </View>

                {/* Locked features preview */}
                <View style={styles.lockedBox}>
                  <View style={styles.lockedItem}>
                    <Ionicons name="lock-closed" size={14} color="#f59e0b" />
                    <Text style={[styles.lockedText, { color: theme.colors.textSecondary }]}>
                      Target Impian (Terkunci)
                    </Text>
                  </View>
                  <View style={styles.lockedItem}>
                    <Ionicons name="lock-closed" size={14} color="#f59e0b" />
                    <Text style={[styles.lockedText, { color: theme.colors.textSecondary }]}>
                      Tagihan Rutin & Langganan (Terkunci)
                    </Text>
                  </View>
                  <View style={styles.lockedItem}>
                    <Ionicons name="lock-closed" size={14} color="#f59e0b" />
                    <Text style={[styles.lockedText, { color: theme.colors.textSecondary }]}>
                      Maksimal 2 Rekening Dompet (Free Limit)
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setUpgradeModalVisible(true)}
                  style={[styles.upgradeBtn, { backgroundColor: theme.colors.primary }]}
                >
                  <Ionicons name="sparkles" size={16} color="#d97706" />
                  <Text style={[styles.upgradeBtnText, { color: theme.colors.primaryForeground }]}>Buka Semua Fitur PRO 👑</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </GlassCard>

        {/* THEME SELECTOR */}
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette-outline" size={17} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tema Tampilan</Text>
        </View>

        <GlassCard borderRadius={18} style={styles.card}>
          <View style={styles.themeSelectorInner}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setThemeMode('light')}
              style={[
                styles.themeOption,
                {
                  borderColor: themeMode === 'light' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: themeMode === 'light' ? (theme.isDark ? 'rgba(255,255,255,0.08)' : '#f4f4f5') : theme.colors.surfaceElevated,
                },
              ]}
            >
              <View style={[styles.themeIconBox, { backgroundColor: '#facc15' }]}>
                <Ionicons name="sunny" size={18} color="#ffffff" />
              </View>
              <Text style={[styles.themeOptionTitle, { color: theme.colors.text }]}>Mode Terang</Text>
              <Text style={[styles.themeOptionDesc, { color: theme.colors.textMuted }]}>Clean & Minimalist</Text>
              {themeMode === 'light' && (
                <View style={styles.themeActiveCheck}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setThemeMode('dark')}
              style={[
                styles.themeOption,
                {
                  borderColor: themeMode === 'dark' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: themeMode === 'dark' ? (theme.isDark ? 'rgba(255,255,255,0.08)' : '#f4f4f5') : theme.colors.surfaceElevated,
                },
              ]}
            >
              <View style={[styles.themeIconBox, { backgroundColor: '#18181b' }]}>
                <Ionicons name="moon" size={18} color="#ffffff" />
              </View>
              <Text style={[styles.themeOptionTitle, { color: theme.colors.text }]}>Mode Gelap</Text>
              <Text style={[styles.themeOptionDesc, { color: theme.colors.textMuted }]}>Sleek & Focused</Text>
              {themeMode === 'dark' && (
                <View style={styles.themeActiveCheck}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* SERVER CONNECTION & PHYSICAL DEVICE TESTING */}
        <View style={styles.sectionHeader}>
          <Ionicons name="hardware-chip-outline" size={17} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Koneksi Server & Testing HP Fisik</Text>
        </View>

        <GlassCard borderRadius={18} style={styles.card}>
          <View style={styles.serverCardInner}>
            <Text style={[styles.serverHelperText, { color: theme.colors.textSecondary }]}>
              Untuk pengetesan di perangkat HP fisik (Expo Go / APK), pastikan HP dan laptop di Wi-Fi yang sama, lalu gunakan IP lokal laptop (contoh: <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>http://192.168.x.x:3000</Text>) atau URL produksi.
            </Text>

            <View style={{ marginTop: 10 }}>
              <GlassInput
                label="REST API Base URL"
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://192.168.1.15:3000"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Quick Preset Buttons */}
            <View style={styles.serverPresetsRow}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  setServerUrl('http://localhost:3000')
                  handleSaveServerUrl('http://localhost:3000')
                }}
                style={[styles.serverPresetBtn, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              >
                <Text style={[styles.serverPresetText, { color: theme.colors.text }]}>Localhost:3000</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  setServerUrl('http://10.0.2.2:3000')
                  handleSaveServerUrl('http://10.0.2.2:3000')
                }}
                style={[styles.serverPresetBtn, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              >
                <Text style={[styles.serverPresetText, { color: theme.colors.text }]}>Android Emu (10.0.2.2)</Text>
              </TouchableOpacity>
            </View>

            {/* Ping Test Result Box */}
            {pingResult && (
              <View
                style={[
                  styles.pingResultBox,
                  {
                    backgroundColor: pingResult.ok ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: pingResult.ok ? '#22c55e' : '#ef4444',
                  },
                ]}
              >
                <Ionicons
                  name={pingResult.ok ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={pingResult.ok ? '#22c55e' : '#ef4444'}
                />
                <Text
                  style={[
                    styles.pingResultText,
                    { color: pingResult.ok ? '#22c55e' : '#ef4444' },
                  ]}
                >
                  {pingResult.ok
                    ? `Terhubung! Latensi: ${pingResult.ms}ms (${pingResult.message})`
                    : `Gagal: ${pingResult.message} (${pingResult.ms}ms)`}
                </Text>
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.serverActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleTestPing}
                disabled={pingTesting}
                style={[styles.serverPingBtn, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              >
                {pingTesting ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <>
                    <Ionicons name="pulse" size={15} color={theme.colors.primary} />
                    <Text style={[styles.serverPingText, { color: theme.colors.primary }]}>Test Ping</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSaveServerUrl()}
                disabled={savingUrl}
                style={[styles.serverSaveBtn, { backgroundColor: theme.colors.primary }]}
              >
                {savingUrl ? (
                  <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={15} color={theme.colors.primaryForeground} />
                    <Text style={[styles.serverSaveText, { color: theme.colors.primaryForeground }]}>Simpan URL</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* APP INFO & SECURITY */}
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark-outline" size={17} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informasi & Keamanan</Text>
        </View>

        <GlassCard borderRadius={18} style={styles.card}>
          <View style={styles.infoCardInner}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Versi Aplikasi</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>Qwarts Finance Mobile v1.2.0</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Koneksi Backend</Text>
              <View style={styles.statusLiveRow}>
                <View style={[styles.liveDot, { backgroundColor: isLive ? '#22c55e' : '#ef4444' }]} />
                <Text style={[styles.infoValue, { color: isLive ? '#22c55e' : '#ef4444' }]}>
                  {isLive ? 'Terhubung Realtime' : 'Menghubungkan...'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Sinkronisasi Sesi</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {currentUser?.emailVerified ? 'Akun Terverifikasi' : 'Sesi Aktif'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* LOGOUT BUTTON */}
        <View style={styles.logoutWrapper}>
          <GlassButton
            title="Keluar dari Akun"
            onPress={handleLogout}
            variant="danger"
            icon="log-out-outline"
            size="md"
          />
        </View>
      </ScrollView>

      {/* PRO UPGRADE MODAL */}
      <ProUpgradeModal
        visible={upgradeModalVisible}
        onClose={() => setUpgradeModalVisible(false)}
        onSuccess={onConfigChanged}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  pageSubtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  userProfileInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  userAvatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  userEmailText: {
    fontSize: 12,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  planText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  planCardInner: {
    padding: 16,
  },
  proActiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  proCrownIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proActiveTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  proActiveSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  perksList: {
    gap: 8,
    marginBottom: 12,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testSwitchBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 4,
  },
  testSwitchText: {
    fontSize: 11,
    fontWeight: '600',
  },
  freeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  freeLockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  freeSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  lockedBox: {
    gap: 6,
    marginBottom: 14,
    paddingLeft: 4,
  },
  lockedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  upgradeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  themeSelectorInner: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  themeOption: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    position: 'relative',
  },
  themeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  themeOptionDesc: {
    fontSize: 10,
  },
  themeActiveCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  infoCardInner: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  serverCardInner: {
    padding: 16,
  },
  serverHelperText: {
    fontSize: 12,
    lineHeight: 18,
  },
  serverPresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  serverPresetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  serverPresetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pingResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  pingResultText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  serverActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  serverPingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  serverPingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  serverSaveBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  serverSaveText: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutWrapper: {
    marginTop: 8,
    marginBottom: 20,
  },
})
