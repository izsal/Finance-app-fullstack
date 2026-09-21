import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'
import { SPACING, RADII, TYPOGRAPHY } from '../theme/designSystem'

interface Props {
  visible: boolean
  onClose: () => void
  onSuccess?: () => void
  featureName?: string
  description?: string
}

export const ProUpgradeModal: React.FC<Props> = ({
  visible,
  onClose,
  featureName,
  description,
}) => {
  const { theme, isDark } = useAppTheme()
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly')

  const currentUser = ApiService.getCurrentUser()

  const handleStartTrial = async () => {
    const planText =
      selectedPlan === 'yearly'
        ? 'Paket Tahunan (Rp 149.000/thn • Hemat 35%)'
        : 'Paket Bulanan (Rp 19.000/bln)'

    const name = currentUser?.name || 'Pengguna Qwarts Finance'
    const email = currentUser?.email || 'email@example.com'

    const message = `Halo Admin Qwarts Finance, saya ingin mengaktifkan Masa Uji Coba Gratis & Akses PRO saya!\n\nNama: ${name}\nEmail: ${email}\nPaket Pilihan: ${planText}\n\nMohon bantu aktivasi akun PRO saya. Terima kasih!`
    const url = `https://wa.me/6281776370728?text=${encodeURIComponent(message)}`

    try {
      const supported = await Linking.canOpenURL(url)
      if (supported || Platform.OS === 'web') {
        await Linking.openURL(url)
      } else {
        await Linking.openURL(`https://api.whatsapp.com/send?phone=6281776370728&text=${encodeURIComponent(message)}`)
      }
    } catch (err) {
      Alert.alert(
        'Mulai Uji Coba PRO',
        'Hubungi WhatsApp Official Qwarts Finance di +62 817-7637-0728 untuk mengaktifkan akses Anda sekarang.',
        [{ text: 'Tutup' }]
      )
    }
  }

  // Visual Nyata Fitur Produk (Bukan ilustrasi generik)
  const productPreviews = [
    {
      icon: 'sparkles' as const,
      badge: 'PRO FITUR',
      title: 'Target Tabungan Impian',
      previewText: 'Progress bar tabungan rumah & dana darurat otomatis terakumulasi.',
      stat: '78% Terkumpul',
      accent: '#0d9488',
    },
    {
      icon: 'scan-outline' as const,
      badge: 'AI SCANNER',
      title: 'Pindai Struk Belanja Instan',
      previewText: 'Cukup foto struk belanja, AI membaca nominal & kategori secara otomatis.',
      stat: 'Akurasi 99%',
      accent: '#0284c7',
    },
    {
      icon: 'document-text-outline' as const,
      badge: 'EKSPOR LAPORAN',
      title: 'Laporan Excel (.xlsx) & CSV',
      previewText: 'Download buku kas bulanan dalam 1 klik untuk arsip atau pembukuan.',
      stat: '1-Klik Unduh',
      accent: '#7c3aed',
    },
    {
      icon: 'wallet-outline' as const,
      badge: 'UNLIMITED',
      title: 'Kelola Rekening Tanpa Batas',
      previewText: 'Hubungkan semua rekening bank dan e-wallet tanpa batasan 2 dompet.',
      stat: 'Semua Rekening',
      accent: '#d97706',
    },
  ]

  // Timeline Transparan (Solusi Layar B - Transparency Bias)
  const timelineSteps = [
    {
      day: 'Hari 1',
      title: 'Akses Penuh Semua Fitur PRO',
      desc: 'Buka Target Impian, Scanner AI Struk, dan Rekening Tanpa Batas hari ini.',
      icon: 'checkmark-circle' as const,
      color: '#10b981',
    },
    {
      day: 'Hari 5',
      title: 'Pengingat Notifikasi Ramah',
      desc: 'Kami akan mengirimkan notifikasi pengingat bahwa masa uji coba akan berakhir dalam 2 hari.',
      icon: 'notifications-outline' as const,
      color: '#f59e0b',
    },
    {
      day: 'Hari 7',
      title: 'Mulai Paket / Batalkan Bebas',
      desc: 'Lanjutkan paket pilihan Anda atau batalkan kapan saja tanpa biaya sepeser pun.',
      icon: 'shield-checkmark-outline' as const,
      color: '#38bdf8',
    },
  ]

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#e2e8f0',
            },
          ]}
        >
          {/* Ambient Glow */}
          <View style={styles.glowTopRight} />

          {/* Top Handle Bar */}
          <View
            style={[
              styles.handleBar,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' },
            ]}
          />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.proBadge}>
              <Ionicons name="sparkles" size={13} color="#f59e0b" />
              <Text style={styles.proBadgeText}>QWARTS FINANCE PRO</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9' },
              ]}
            >
              <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* SOLUSI LAYAR B: Ubah Pertanyaan & Reframe Judul */}
            <View style={styles.reframeHeader}>
              <Text style={[styles.mainTitle, { color: theme.colors.text }]}>
                Cara Uji Coba Gratis Bekerja ✨
              </Text>
              <Text style={[styles.mainSubtitle, { color: theme.colors.textSecondary }]}>
                {featureName
                  ? `Fitur ${featureName} dapat Anda nikmati langsung. Coba seluruh kemampuan PRO tanpa risiko sebelum memutuskan.`
                  : 'Coba seluruh fitur unggulan Qwarts Finance PRO secara gratis tanpa resiko sebelum memutuskan.'}
              </Text>
            </View>

            {/* TIMELINE TRANSPARAN (Hari 1, Hari 5, Hari 7) */}
            <View
              style={[
                styles.timelineBox,
                {
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : '#f8fafc',
                  borderColor: isDark ? 'rgba(51, 65, 85, 0.8)' : '#e2e8f0',
                },
              ]}
            >
              <Text style={[styles.timelineSectionTitle, { color: theme.colors.text }]}>
                Lini Masa Uji Coba Transparan
              </Text>

              <View style={styles.timelineList}>
                {timelineSteps.map((step, idx) => (
                  <View key={idx} style={styles.timelineItem}>
                    {/* Node line */}
                    <View style={styles.timelineNodeCol}>
                      <View style={[styles.timelineDot, { backgroundColor: step.color }]}>
                        <Ionicons name={step.icon} size={12} color="#ffffff" />
                      </View>
                      {idx < timelineSteps.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' },
                          ]}
                        />
                      )}
                    </View>

                    {/* Content */}
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineDayRow}>
                        <Text style={[styles.timelineDayText, { color: step.color }]}>
                          {step.day}
                        </Text>
                        <Text style={[styles.timelineStepTitle, { color: theme.colors.text }]}>
                          • {step.title}
                        </Text>
                      </View>
                      <Text style={[styles.timelineStepDesc, { color: theme.colors.textSecondary }]}>
                        {step.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* VISUAL NYATA PRODUK (Bukan ikon dekoratif generik) */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              Aset & Fitur Nyata Yang Anda Dapatkan
            </Text>

            <View style={styles.previewGrid}>
              {productPreviews.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.previewCard,
                    {
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                      borderColor: isDark ? 'rgba(51, 65, 85, 0.7)' : '#e2e8f0',
                    },
                  ]}
                >
                  <View style={styles.previewTopRow}>
                    <View style={[styles.previewIconBadge, { backgroundColor: item.accent + '20' }]}>
                      <Ionicons name={item.icon} size={16} color={item.accent} />
                    </View>
                    <View style={[styles.previewTag, { backgroundColor: item.accent + '15' }]}>
                      <Text style={[styles.previewTagText, { color: item.accent }]}>
                        {item.stat}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.previewCardTitle, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.previewCardDesc, { color: theme.colors.textSecondary }]}>
                    {item.previewText}
                  </Text>
                </View>
              ))}
            </View>

            {/* TAMPILAN HARGA PASTI & BADGE CERDAS */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              Pilihan Paket Transparan (Setelah Uji Coba)
            </Text>

            <View style={styles.pricingRow}>
              {/* Yearly Plan - Best Value */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSelectedPlan('yearly')}
                style={[
                  styles.pricingOption,
                  selectedPlan === 'yearly'
                    ? [
                        styles.pricingOptionSelected,
                        { borderColor: '#f59e0b', backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#fffbeb' },
                      ]
                    : [
                        styles.pricingOptionInactive,
                        { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated },
                      ],
                ]}
              >
                <View style={styles.smartBadge}>
                  <Text style={styles.smartBadgeText}>HEMAT 35% • BEST VALUE</Text>
                </View>
                <Text style={[styles.planTitle, { color: '#f59e0b' }]}>Paket Tahunan</Text>
                <Text style={[styles.planPriceNumber, { color: theme.colors.text }]}>
                  Rp 149.000
                </Text>
                <Text style={[styles.planRateEstimate, { color: '#10b981' }]}>
                  Hanya Rp 12.400 / bln
                </Text>
                <Text style={[styles.planBilledNote, { color: theme.colors.textMuted }]}>
                  Ditagih tahunan
                </Text>
              </TouchableOpacity>

              {/* Monthly Plan - Evaluative Ease */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSelectedPlan('monthly')}
                style={[
                  styles.pricingOption,
                  selectedPlan === 'monthly'
                    ? [
                        styles.pricingOptionSelected,
                        { borderColor: '#0d9488', backgroundColor: isDark ? 'rgba(13,148,136,0.12)' : '#f0fdfa' },
                      ]
                    : [
                        styles.pricingOptionInactive,
                        { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated },
                      ],
                ]}
              >
                <Text style={[styles.planTitle, { color: theme.colors.textSecondary }]}>Paket Bulanan</Text>
                <Text style={[styles.planPriceNumber, { color: theme.colors.text }]}>
                  Rp 19.000
                </Text>
                <Text style={[styles.planRateEstimate, { color: theme.colors.textSecondary }]}>
                  Fleksibel per bulan
                </Text>
                <Text style={[styles.planBilledNote, { color: theme.colors.textMuted }]}>
                  Ditagih bulanan
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* STICKY CTA FOOTER (THUMB ZONE ERGONOMICS) */}
          <View
            style={[
              styles.stickyFooter,
              {
                backgroundColor: isDark ? '#090d16' : '#ffffff',
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            {/* Micro-copy Kepemilikan: "Mulai Uji Coba Gratis Saya" */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleStartTrial}
              style={styles.ctaButtonWrapper}
            >
              <LinearGradient
                colors={['#0d9488', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Ionicons name="sparkles" size={17} color="#ffffff" />
                <Text style={styles.ctaButtonText}>Mulai Uji Coba Gratis Saya</Text>
                <View style={styles.ctaPricePill}>
                  <Text style={styles.ctaPricePillText}>Rp 0 Hari Ini</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Kurangi Ketidakpastian: "Start in 2 taps" */}
            <Text style={[styles.uncertaintyReducerText, { color: theme.colors.textMuted }]}>
              Mulai dalam 2 ketukan • Tanpa kartu kredit • Batalkan kapan saja
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '94%',
    borderTopLeftRadius: RADII.sheet,
    borderTopRightRadius: RADII.sheet,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  handleBar: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  glowTopRight: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.full,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  proBadgeText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADII.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  reframeHeader: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  mainTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  mainSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  timelineBox: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  timelineSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: SPACING.sm,
    letterSpacing: -0.1,
  },
  timelineList: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineNodeCol: {
    width: 24,
    alignItems: 'center',
    marginRight: 10,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginTop: 2,
    marginBottom: -6,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 4,
  },
  timelineDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  timelineDayText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  timelineStepTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineStepDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    letterSpacing: -0.1,
  },
  previewGrid: {
    gap: 8,
    marginBottom: SPACING.md,
  },
  previewCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
  },
  previewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewIconBadge: {
    width: 28,
    height: 28,
    borderRadius: RADII.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADII.xs,
  },
  previewTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  previewCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  previewCardDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.sm,
  },
  pricingOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: RADII.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    position: 'relative',
  },
  pricingOptionSelected: {
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  pricingOptionInactive: {
    opacity: 0.85,
  },
  smartBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.full,
  },
  smartBadgeText: {
    color: '#090d16',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 4,
  },
  planPriceNumber: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  planRateEstimate: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 3,
  },
  planBilledNote: {
    fontSize: 9.5,
    marginTop: 2,
  },
  stickyFooter: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.md,
    borderTopWidth: 1,
  },
  ctaButtonWrapper: {
    borderRadius: RADII.md,
    overflow: 'hidden',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  ctaPricePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADII.xs,
  },
  ctaPricePillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  uncertaintyReducerText: {
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 14,
  },
})
