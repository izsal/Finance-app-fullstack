import React, { useState, useEffect } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { GlassInput } from './GlassInput'
import { GlassButton } from './GlassButton'
import { Ionicons } from '@expo/vector-icons'
import { TransactionItem, WalletItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'
import { SPACING, RADII, AMOUNT_PRESETS } from '../theme/designSystem'

interface Props {
  visible: boolean
  transaction: TransactionItem | null
  wallets: WalletItem[]
  onClose: () => void
  onSuccess: () => void
}

export const EditTransactionModal: React.FC<Props> = ({
  visible,
  transaction,
  wallets,
  onClose,
  onSuccess,
}) => {
  const { theme, isDark } = useAppTheme()
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedWalletId, setSelectedWalletId] = useState<number>(wallets[0]?.id || 1)
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(String(transaction.amount))
      setDescription(transaction.description)
      setSelectedWalletId(transaction.walletId || wallets[0]?.id || 1)
      setDate(transaction.date || new Date().toISOString().split('T')[0])
      setError('')
    }
  }, [transaction, wallets])

  const numAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0

  const handleUpdate = async () => {
    if (!transaction) return
    if (!numAmount || numAmount <= 0) {
      setError('Masukkan jumlah nominal yang valid')
      return
    }
    if (!description.trim()) {
      setError('Deskripsi transaksi wajib diisi')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await ApiService.updateTransaction(transaction.id, {
        walletId: selectedWalletId,
        type,
        amount: numAmount,
        description: description.trim(),
        date: date || new Date().toISOString().split('T')[0],
      })

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.message)
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal memperbarui transaksi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (!transaction) return
    Alert.alert(
      'Hapus Transaksi',
      `Yakin ingin menghapus transaksi "${transaction.description}"? Saldo rekening akan disesuaikan kembali secara otomatis.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            try {
              const res = await ApiService.deleteTransaction(transaction.id)
              if (res.success) {
                onSuccess()
                onClose()
              } else {
                Alert.alert('Gagal', res.message)
              }
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Gagal menghapus transaksi')
            } finally {
              setDeleting(false)
            }
          },
        },
      ]
    )
  }

  if (!transaction) return null

  const ctaLabel = numAmount > 0
    ? `Simpan Perubahan • Rp ${numAmount.toLocaleString('id-ID')}`
    : 'Simpan Perubahan'

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
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
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>Edit Transaksi</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Ubah nominal, keterangan, atau rekening
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* Type Selector */}
            <View style={styles.typeRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setType('expense')}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor:
                      type === 'expense' ? theme.colors.expenseBg : theme.colors.surfaceElevated,
                    borderColor:
                      type === 'expense' ? theme.colors.expense : theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="arrow-down-circle"
                  size={15}
                  color={type === 'expense' ? theme.colors.expense : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    {
                      color:
                        type === 'expense' ? theme.colors.expense : theme.colors.textSecondary,
                      fontWeight: type === 'expense' ? '800' : '600',
                    },
                  ]}
                >
                  Pengeluaran
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setType('income')}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor:
                      type === 'income' ? theme.colors.incomeBg : theme.colors.surfaceElevated,
                    borderColor:
                      type === 'income' ? theme.colors.income : theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={15}
                  color={type === 'income' ? theme.colors.income : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    {
                      color:
                        type === 'income' ? theme.colors.income : theme.colors.textSecondary,
                      fontWeight: type === 'income' ? '800' : '600',
                    },
                  ]}
                >
                  Pemasukan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <GlassInput
              label="Nominal Transaksi (Rp)"
              placeholder="0"
              keyboardType="numeric"
              value={amount}
              onChangeText={(val) => {
                const clean = val.replace(/\D/g, '')
                setAmount(clean ? parseInt(clean, 10).toLocaleString('id-ID') : '')
              }}
              icon="cash-outline"
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
                            ? (isDark ? 'rgba(13, 148, 136, 0.25)' : '#ccfbf1')
                            : theme.colors.surfaceElevated,
                          borderColor: isMatch ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickChipText,
                          {
                            color: isMatch ? theme.colors.primary : theme.colors.textSecondary,
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

            {/* Description Input */}
            <GlassInput
              label="Deskripsi / Catatan"
              placeholder="Misal: Makan Siang, Belanja Bulanan"
              value={description}
              onChangeText={setDescription}
              icon="create-outline"
            />

            {/* Date Input */}
            <GlassInput
              label="Tanggal (YYYY-MM-DD)"
              placeholder="2026-09-21"
              value={date}
              onChangeText={setDate}
              icon="calendar-outline"
            />

            {/* Wallet Selector */}
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Pilih Rekening Dompet
            </Text>
            <View style={styles.walletsList}>
              {wallets.map((w) => {
                const selected = selectedWalletId === w.id
                return (
                  <TouchableOpacity
                    key={w.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedWalletId(w.id)}
                    style={[
                      styles.walletItem,
                      {
                        backgroundColor: selected
                          ? (isDark ? 'rgba(13,148,136,0.18)' : '#ccfbf1')
                          : theme.colors.surfaceElevated,
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="wallet-outline"
                      size={14}
                      color={selected ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.walletItemText,
                        {
                          color: selected ? theme.colors.primary : theme.colors.textSecondary,
                          fontWeight: selected ? '800' : '500',
                        },
                      ]}
                    >
                      {w.name}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: theme.colors.expenseBg }]}>
                <Ionicons name="alert-circle" size={14} color={theme.colors.expense} />
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
            <View style={styles.actionRow}>
              <GlassButton
                title={loading ? 'Menyimpan...' : ctaLabel}
                onPress={handleUpdate}
                loading={loading}
                variant="primary"
                size="lg"
                style={{ flex: 1 }}
              />
              <GlassButton
                title="Hapus"
                onPress={handleDelete}
                loading={deleting}
                variant="danger"
                size="lg"
                icon="trash-outline"
              />
            </View>
            <Text style={[styles.reassuranceText, { color: theme.colors.textMuted }]}>
              Perubahan langsung merevisi catatan keuangan & mutasi saldo
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADII.full,
  },
  scrollBody: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADII.sm,
    borderWidth: 1,
  },
  typeBtnText: {
    fontSize: 13,
  },
  presetsSection: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 6,
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
  walletsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.sm,
    borderWidth: 1,
  },
  walletItemText: {
    fontSize: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: RADII.sm,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stickyFooter: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.md,
    borderTopWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reassuranceText: {
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
})
