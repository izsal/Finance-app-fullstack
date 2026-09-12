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
  const { isDark } = useAppTheme()
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly')

  const currentUser = ApiService.getCurrentUser()

  const handleOpenWhatsApp = async () => {
    const planText =
      selectedPlan === 'yearly'
        ? 'Tahunan (Rp 149.000 / Hemat 35%)'
        : 'Bulanan (Rp 19.000)'

    const name = currentUser?.name || 'Pengguna Dompetku'
    const email = currentUser?.email || 'email@example.com'

    const message = `Halo Admin Dompetku, saya ingin upgrade ke akun Dompetku PRO!\n\nNama: ${name}\nEmail: ${email}\nPaket: ${planText}\n\nMohon info nomor rekening / QRIS untuk pembayaran.`
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
        'Buka WhatsApp',
        'Silakan hubungi WhatsApp Admin di nomor +62 817-7637-0728 untuk konfirmasi pembayaran PRO.',
        [
          { text: 'Salin Nomor', onPress: () => {} },
          { text: 'Tutup' },
        ]
      )
    }
  }

  const benefits = [
    {
      title: 'Target Impian',
      desc: 'Tabungan rumah, mobil, dan dana darurat',
    },
    {
      title: 'Budget Bulanan',
      desc: 'Batas belanja per kategori & alert overbudget',
    },
    {
      title: 'Tagihan Rutin',
      desc: 'Pengingat jatuh tempo langganan & utilitas',
    },
    {
      title: 'Ekspor Laporan',
      desc: 'Download file Excel (.xlsx) & CSV otomatis',
    },
    {
      title: 'Unlimited Dompet',
      desc: 'Catat semua rekening bank & e-wallet tanpa batas',
    },
  ]

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Ambient Glows */}
          <View style={styles.glowTopRight} />
          <View style={styles.glowBottomLeft} />

          {/* Top Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.proBadge}>
              <Ionicons name="sparkles" size={13} color="#fcd34d" />
              <Text style={styles.proBadgeText}>DOMPETKU PRO EXCLUSIVE</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
            {/* Title & Description */}
            <Text style={styles.title}>Tingkatkan ke Dompetku PRO 🚀</Text>
            <Text style={styles.description}>
              {description ||
                (featureName
                  ? `Fitur ${featureName} adalah fitur eksklusif Dompetku PRO. Tingkatkan akun Anda untuk mengontrol anggaran, target tabungan, dan mengunduh laporan keuangan tanpa batasan.`
                  : 'Tingkatkan akun Anda ke PRO untuk mengontrol anggaran, mengejar target tabungan, dan mengunduh laporan keuangan tanpa batasan.')}
            </Text>

            {/* Feature Benefits List */}
            <View style={styles.benefitsBox}>
              {benefits.map((b, idx) => (
                <View key={idx} style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={17} color="#2dd4bf" style={{ marginTop: 1 }} />
                  <Text style={styles.benefitText}>
                    <Text style={styles.benefitBold}>{b.title}</Text> — {b.desc}
                  </Text>
                </View>
              ))}
            </View>

            {/* Pricing Selection Cards */}
            <View style={styles.pricingGrid}>
              {/* Monthly Plan */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSelectedPlan('monthly')}
                style={[
                  styles.pricingCard,
                  selectedPlan === 'monthly' ? styles.pricingCardSelected : styles.pricingCardInactive,
                ]}
              >
                <Text style={styles.planName}>Paket Bulanan</Text>
                <Text style={styles.planPrice}>Rp 19.000</Text>
                <Text style={styles.planSub}>per bulan</Text>
              </TouchableOpacity>

              {/* Yearly Plan (Best Value) */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSelectedPlan('yearly')}
                style={[
                  styles.pricingCard,
                  selectedPlan === 'yearly' ? styles.pricingCardSelectedYearly : styles.pricingCardInactive,
                ]}
              >
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>HEMAT 35%</Text>
                </View>
                <Text style={[styles.planName, { color: '#fcd34d' }]}>Paket Tahunan</Text>
                <Text style={styles.planPrice}>Rp 149.000</Text>
                <Text style={styles.planSubRate}>Rp 12.400/bln</Text>
              </TouchableOpacity>
            </View>

            {/* WhatsApp Upgrade Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenWhatsApp}
              style={styles.upgradeBtnWrapper}
            >
              <LinearGradient
                colors={['#14b8a6', '#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeBtnGradient}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#022c22" />
                <Text style={styles.upgradeBtnText}>Upgrade via WhatsApp / QRIS</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Activation Note */}
            <Text style={styles.activationNote}>
              Aktivasi instan dalam 5 menit setelah konfirmasi bukti transfer ke Admin.
            </Text>

            {/* Later Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.laterBtn}
            >
              <Text style={styles.laterBtnText}>Nanti Saja</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '92%',
    backgroundColor: '#090d16',
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  glowTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  proBadgeText: {
    color: '#fcd34d',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 4,
  },
  description: {
    fontSize: 12.5,
    color: '#cbd5e1',
    marginTop: 6,
    lineHeight: 18,
  },
  benefitsBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.7)',
    gap: 9,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  benefitText: {
    flex: 1,
    fontSize: 11.5,
    color: '#e2e8f0',
    lineHeight: 16,
  },
  benefitBold: {
    fontWeight: '800',
    color: '#ffffff',
  },
  pricingGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  pricingCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  pricingCardInactive: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  pricingCardSelected: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderColor: '#38bdf8',
  },
  pricingCardSelectedYearly: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: '#f59e0b',
  },
  saveBadge: {
    position: 'absolute',
    top: -9,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  saveBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#090d16',
  },
  planName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 3,
  },
  planPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  planSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  planSubRate: {
    fontSize: 10,
    color: '#34d399',
    fontWeight: '700',
    marginTop: 2,
  },
  upgradeBtnWrapper: {
    marginTop: 18,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  upgradeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  upgradeBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#022c22',
  },
  activationNote: {
    fontSize: 10.5,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 15,
  },
  laterBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  laterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
})
