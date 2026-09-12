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
import { SubscriptionItem, WalletItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'

interface Props {
  visible: boolean
  subscription: SubscriptionItem | null // jika null = tambah baru, jika ada = edit
  wallets: WalletItem[]
  onClose: () => void
  onSuccess: () => void
}

export const SubscriptionModal: React.FC<Props> = ({
  visible,
  subscription,
  wallets,
  onClose,
  onSuccess,
}) => {
  const { theme, isDark } = useAppTheme()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('1')
  const [selectedWalletId, setSelectedWalletId] = useState<number>(wallets[0]?.id || 1)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (subscription) {
      setName(subscription.name)
      setAmount(String(subscription.amount))
      setDueDate(String(subscription.dueDate || 1))
      setSelectedWalletId(subscription.walletId || wallets[0]?.id || 1)
    } else {
      setName('')
      setAmount('')
      setDueDate('1')
      setSelectedWalletId(wallets[0]?.id || 1)
    }
    setError('')
  }, [subscription, visible, wallets])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nama layanan atau tagihan wajib diisi')
      return
    }

    const numAmount = parseInt(amount.replace(/\D/g, ''), 10)
    if (!numAmount || numAmount <= 0) {
      setError('Nominal tagihan harus lebih dari 0')
      return
    }

    const numDue = parseInt(dueDate.replace(/\D/g, ''), 10)
    if (!numDue || numDue < 1 || numDue > 31) {
      setError('Tanggal jatuh tempo harus antara 1 sampai 31')
      return
    }

    setError('')
    setLoading(true)

    try {
      if (subscription) {
        // Edit mode
        const res = await ApiService.updateSubscription(subscription.id, {
          name: name.trim(),
          amount: numAmount,
          dueDate: numDue,
          walletId: selectedWalletId,
        })
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.message)
        }
      } else {
        // Create mode
        const res = await ApiService.addSubscription({
          name: name.trim(),
          amount: numAmount,
          dueDate: numDue,
          walletId: selectedWalletId,
          billingCycle: 'monthly',
        })
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.message)
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan tagihan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (!subscription) return
    Alert.alert(
      'Hapus Tagihan',
      `Yakin ingin menghapus tagihan "${subscription.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            try {
              const res = await ApiService.deleteSubscription(subscription.id)
              if (res.success) {
                onSuccess()
                onClose()
              } else {
                Alert.alert('Gagal', res.message)
              }
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Gagal menghapus tagihan')
            } finally {
              setDeleting(false)
            }
          },
        },
      ]
    )
  }

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
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {subscription ? 'Edit Tagihan Rutin' : 'Tambah Tagihan Rutin Baru'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <GlassInput
              label="Nama Layanan / Tagihan"
              placeholder="Misal: Netflix, Spotify, Listrik PLN, WiFi"
              value={name}
              onChangeText={setName}
              icon="receipt-outline"
            />

            {/* Amount */}
            <GlassInput
              label="Nominal Tagihan (Rp)"
              placeholder="0"
              keyboardType="numeric"
              value={amount}
              onChangeText={(val) => {
                const clean = val.replace(/\D/g, '')
                setAmount(clean ? parseInt(clean, 10).toLocaleString('id-ID') : '')
              }}
              icon="cash-outline"
            />

            {/* Due Date Day */}
            <GlassInput
              label="Tanggal Jatuh Tempo Setiap Bulan (1 - 31)"
              placeholder="15"
              keyboardType="numeric"
              value={dueDate}
              onChangeText={(val) => setDueDate(val.replace(/\D/g, ''))}
              icon="calendar-outline"
            />

            {/* Wallet Selector */}
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Rekening Pembayaran Utama
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
                title={loading ? 'Menyimpan...' : subscription ? 'Simpan Perubahan' : 'Tambah Tagihan'}
                onPress={handleSave}
                loading={loading}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
              {subscription && (
                <GlassButton
                  title="Hapus"
                  onPress={handleDelete}
                  loading={deleting}
                  variant="danger"
                  size="md"
                  icon="trash-outline"
                />
              )}
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
