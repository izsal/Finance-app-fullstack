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
import { GlassCard } from './GlassCard'
import { GlassInput } from './GlassInput'
import { GlassButton } from './GlassButton'
import { Ionicons } from '@expo/vector-icons'
import { WalletItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'

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
  const { theme } = useAppTheme()
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

  const handleTransfer = async () => {
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10)
    if (!numAmount || numAmount <= 0) {
      setError('Masukkan nominal transfer yang valid')
      return
    }
    if (fromWalletId === toWalletId) {
      setError('Dompet asal dan tujuan tidak boleh sama')
      return
    }

    const sourceWallet = wallets.find((w) => w.id === fromWalletId)
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.backdrop} />

        <View style={styles.sheetContainer}>
          <GlassCard
            borderRadius={28}
            style={[styles.glassSheet, { backgroundColor: theme.colors.surface }]}
          >
            <View style={[styles.handleBar, { backgroundColor: theme.colors.border }]} />

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceElevated }]}>
                  <Ionicons name="swap-horizontal" size={18} color={theme.colors.secondary} />
                </View>
                <Text style={[styles.title, { color: theme.colors.text }]}>Transfer Saldo</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceElevated }]}>
                <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              {/* From Wallet Picker */}
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Dari Dompet Sumber</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletRow}>
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    activeOpacity={0.7}
                    onPress={() => setFromWalletId(w.id)}
                    style={[
                      styles.walletItem,
                      {
                        backgroundColor: fromWalletId === w.id ? theme.colors.expenseBg : theme.colors.surfaceElevated,
                        borderColor: fromWalletId === w.id ? theme.colors.expense : theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.walletItemName, { color: theme.colors.text, fontWeight: fromWalletId === w.id ? '700' : '500' }]}>
                      {w.name}
                    </Text>
                    <Text style={[styles.walletItemBal, { color: theme.colors.textMuted }]}>
                      {ApiService.formatRupiah(w.currentBalance)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* To Wallet Picker */}
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Ke Dompet Tujuan</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletRow}>
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    activeOpacity={0.7}
                    onPress={() => setToWalletId(w.id)}
                    style={[
                      styles.walletItem,
                      {
                        backgroundColor: toWalletId === w.id ? theme.colors.incomeBg : theme.colors.surfaceElevated,
                        borderColor: toWalletId === w.id ? theme.colors.income : theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.walletItemName, { color: theme.colors.text, fontWeight: toWalletId === w.id ? '700' : '500' }]}>
                      {w.name}
                    </Text>
                    <Text style={[styles.walletItemBal, { color: theme.colors.textMuted }]}>
                      {ApiService.formatRupiah(w.currentBalance)}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                  <Text style={[styles.errorText, { color: theme.colors.expense }]}>{error}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <GlassButton
                title="Kirim Transfer Sekarang"
                onPress={handleTransfer}
                loading={loading}
                icon="paper-plane-outline"
                variant="secondary"
                size="lg"
                style={styles.submitBtn}
              />
            </ScrollView>
          </GlassCard>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    maxHeight: '90%',
  },
  glassSheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  walletRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  walletItem: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
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
  errorBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 6,
  },
})
