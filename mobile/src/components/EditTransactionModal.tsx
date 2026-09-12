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

  const handleUpdate = async () => {
    if (!transaction) return
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10)
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
      `Yakin ingin menghapus transaksi "${transaction.description}"? Saldo rekening akan disesuaikan kembali.`,
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
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Edit Transaksi</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Type Selector (Pengeluaran vs Pemasukan) */}
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
                  name="arrow-up"
                  size={15}
                  color={type === 'expense' ? theme.colors.expense : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    {
                      color:
                        type === 'expense' ? theme.colors.expense : theme.colors.textSecondary,
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
                  name="arrow-down"
                  size={15}
                  color={type === 'income' ? theme.colors.income : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    {
                      color:
                        type === 'income' ? theme.colors.income : theme.colors.textSecondary,
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
              placeholder="2026-09-12"
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
                          ? (isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5')
                          : theme.colors.surfaceElevated,
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="wallet-outline"
                      size={16}
                      color={selected ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.walletItemText,
                        {
                          color: selected ? theme.colors.text : theme.colors.textSecondary,
                          fontWeight: selected ? '700' : '500',
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

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <GlassButton
                title={loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                onPress={handleUpdate}
                loading={loading}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
              <GlassButton
                title="Hapus"
                onPress={handleDelete}
                loading={deleting}
                variant="danger"
                size="md"
                icon="trash-outline"
              />
            </View>
          </ScrollView>
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
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  walletsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
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
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
  },
})
