import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GlassCard } from '../components/GlassCard'
import { GlassButton } from '../components/GlassButton'
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
      'Apakah Anda yakin ingin keluar dari akun Dompetku ini?',
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
                  {currentUser?.name || 'Pengguna Dompetku'}
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
                      Dompetku PRO Aktif 👑
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
                      Tingkatkan ke Dompetku PRO 👑
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

        {/* APP INFO & SECURITY */}
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark-outline" size={17} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informasi & Keamanan</Text>
        </View>

        <GlassCard borderRadius={18} style={styles.card}>
          <View style={styles.infoCardInner}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Versi Aplikasi</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>Dompetku Mobile v1.2.0</Text>
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
  logoutWrapper: {
    marginTop: 8,
    marginBottom: 20,
  },
})
