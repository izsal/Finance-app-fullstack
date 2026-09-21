import React, { useState } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { GlassInput } from './GlassInput'
import { GlassButton } from './GlassButton'
import { Ionicons } from '@expo/vector-icons'
import { WalletItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'
import { SPACING, RADII, AMOUNT_PRESETS } from '../theme/designSystem'

interface Props {
  visible: boolean
  onClose: () => void
  wallets: WalletItem[]
  defaultFromWalletId?: number
  onSuccess: () => void
}

export const TransferModal: React.FC<Props> = ({
  visible,
  onClose,
  wallets,
  defaultFromWalletId,
  onSuccess,
}) => {
  const { theme, isDark } = useAppTheme()
  const [fromWalletId, setFromWalletId] = useState<number>(
    defaultFromWalletId || wallets[0]?.id || 1
  )
  const [toWalletId, setToWalletId] = useState<number>(
    wallets.find((w) => w.id !== fromWalletId)?.id || wallets[1]?.id || 2
  )
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const numAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0
  const targetWallet = wallets.find((w) => w.id === toWalletId)
  const sourceWallet = wallets.find((w) => w.id === fromWalletId)

  const handleTransfer = async () => {
    if (!numAmount || numAmount <= 0) {
      setError('Masukkan nominal transfer yang valid')
      return
    }
    if (fromWalletId === toWalletId) {
      setError('Dompet asal dan tujuan tidak boleh sama')
      return
    }

    if (sourceWallet && sourceWallet.currentBalance < numAmount) {
      setError(`Saldo ${sourceWallet.name} tidak mencukupi (${ApiService.formatRupiah(sourceWallet.currentBalance)})`)
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await ApiService.transferBetweenWallets(
        fromWalletId,
        toWalletId,
        numAmount,
        description.trim() || 'Transfer Dompet'
      )
      if (res.success) {
        setAmount('')
        setDescription('')
        onSuccess()
        onClose()
      } else {
        setError(res.message)
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal memproses transfer')
    } finally {
      setLoading(false)
    }
  }

  const ctaLabel = numAmount > 0 && targetWallet
    ? `Transfer Rp ${numAmount.toLocaleString('id-ID')} ke ${targetWallet.name}`
    : 'Kirim Transfer Sekarang'

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.backdrop} />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Handle Bar */}
          <View
            style={[
              styles.handleBar,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' },
            ]}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceElevated }]}>
                <Ionicons name="swap-horizontal" size={18} color={theme.colors.secondary} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.colors.text }]}>Transfer Antar Rekening</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Pindah dana antar bank & e-wallet
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceElevated }]}>
              <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* From Wallet Picker */}
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Dari Rekening Sumber
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletRow}>
              {wallets.map((w) => {
                const selected = fromWalletId === w.id
                return (
                  <TouchableOpacity
                    key={w.id}
                    activeOpacity={0.7}
                    onPress={() => setFromWalletId(w.id)}
                    style={[
                      styles.walletItem,
                      {
                        backgroundColor: selected ? theme.colors.expenseBg : theme.colors.surfaceElevated,
                        borderColor: selected ? theme.colors.expense : theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.walletItemName, { color: theme.colors.text, fontWeight: selected ? '800' : '500' }]}>
                      {w.name}
                    </Text>
                    <Text style={[styles.walletItemBal, { color: theme.colors.textMuted }]}>
                      {ApiService.formatRupiah(w.currentBalance)}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {/* To Wallet Picker */}
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Ke Rekening Tujuan
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletRow}>
              {wallets.map((w) => {
                const selected = toWalletId === w.id
                return (
                  <TouchableOpacity
                    key={w.id}
                    activeOpacity={0.7}
                    onPress={() => setToWalletId(w.id)}
                    style={[
                      styles.walletItem,
                      {
                        backgroundColor: selected ? theme.colors.incomeBg : theme.colors.surfaceElevated,
                        borderColor: selected ? theme.colors.income : theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.walletItemName, { color: theme.colors.text, fontWeight: selected ? '800' : '500' }]}>
                      {w.name}
                    </Text>
                    <Text style={[styles.walletItemBal, { color: theme.colors.textMuted }]}>
                      {ApiService.formatRupiah(w.currentBalance)}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {/* Amount */}
            <GlassInput
              label="Nominal Transfer"
              placeholder="0"
              keyboardType="numeric"
              prefix="Rp"
              value={amount}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '')
                setAmount(cleaned ? parseInt(cleaned, 10).toLocaleString('id-ID') : '')
              }}
            />

            {/* Micro-UX: Quick Chip Presets */}
            <View style={styles.presetsSection}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                Pilihan Cepat Nominal
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {AMOUNT_PRESETS.map((preset) => {
                  const isMatch = numAmount === preset.value
                  return (
                    <TouchableOpacity
                      key={preset.value}
                      activeOpacity={0.7}
                      onPress={() => setAmount(preset.value.toLocaleString('id-ID'))}
                      style={[
                        styles.quickChip,
                        {
                          backgroundColor: isMatch
                            ? (isDark ? 'rgba(99, 102, 241, 0.25)' : '#e0e7ff')
                            : theme.colors.surfaceElevated,
                          borderColor: isMatch ? theme.colors.secondary : theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickChipText,
                          {
                            color: isMatch ? theme.colors.secondary : theme.colors.textSecondary,
                            fontWeight: isMatch ? '800' : '600',
                          },
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>

            {/* Description */}
            <GlassInput
              label="Catatan (Opsional)"
              placeholder="Contoh: Top-up E-Wallet, Tabungan"
              icon="chatbox-ellipses-outline"
              value={description}
              onChangeText={setDescription}
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: theme.colors.expenseBg, borderColor: theme.colors.expense }]}>
                <Ionicons name="alert-circle" size={15} color={theme.colors.expense} />
                <Text style={[styles.errorText, { color: theme.colors.expense }]}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* STICKY CTA FOOTER (THUMB ZONE) */}
          <View
            style={[
              styles.stickyFooter,
              {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            <GlassButton
              title={loading ? 'Memproses Transfer...' : ctaLabel}
              onPress={handleTransfer}
              loading={loading}
              icon="paper-plane-outline"
              variant="secondary"
              size="lg"
            />
            <Text style={[styles.reassuranceText, { color: theme.colors.textMuted }]}>
              Tanpa biaya admin • Mutasi otomatis tercatat di kedua dompet
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheetContainer: {
    borderTopLeftRadius: RADII.sheet,
    borderTopRightRadius: RADII.sheet,
    borderWidth: 1,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADII.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADII.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  walletRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  walletItem: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.sm,
    marginRight: 8,
    minWidth: 110,
  },
  walletItemName: {
    fontSize: 12,
    marginBottom: 2,
  },
  walletItemBal: {
    fontSize: 11,
  },
  presetsSection: {
    marginBottom: SPACING.md,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADII.sm,
    borderWidth: 1,
    marginRight: 6,
  },
  quickChipText: {
    fontSize: 11.5,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: RADII.sm,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  stickyFooter: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.md,
    borderTopWidth: 1,
  },
  reassuranceText: {
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
})
