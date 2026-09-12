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
import { WalletItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'

interface Props {
  visible: boolean
  wallet: WalletItem | null // jika null = mode tambah baru, jika ada = mode edit
  onClose: () => void
  onSuccess: () => void
}

const WALLET_TYPES = ['Bank', 'E-Wallet', 'Tunai', 'Investasi']
const WALLET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1']

export const WalletModal: React.FC<Props> = ({
  visible,
  wallet,
  onClose,
  onSuccess,
}) => {
  const { theme, isDark } = useAppTheme()
  const [name, setName] = useState('')
  const [type, setType] = useState('Bank')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (wallet) {
      setName(wallet.name)
      setType(wallet.type || 'Bank')
      setBalance(String(wallet.initialBalance ?? wallet.currentBalance ?? 0))
      setColor(wallet.color || '#3b82f6')
    } else {
      setName('')
      setType('Bank')
      setBalance('')
      setColor('#3b82f6')
    }
    setError('')
  }, [wallet, visible])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nama rekening atau dompet wajib diisi')
      return
    }

    const numBalance = parseInt(balance.replace(/\D/g, ''), 10) || 0
    setError('')
    setLoading(true)

    try {
      if (wallet) {
        // Edit mode
        const res = await ApiService.updateWallet(wallet.id, {
          name: name.trim(),
          type,
          balance: numBalance,
          color,
        })
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.message)
        }
      } else {
        // Create mode
        const res = await ApiService.addWallet({
          name: name.trim(),
          type,
          balance: numBalance,
          color,
        })
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.message)
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan dompet')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (!wallet) return
    Alert.alert(
      'Hapus Dompet',
      `Yakin ingin menghapus dompet "${wallet.name}"? Transaksi yang terhubung mungkin akan terpengaruh.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            try {
              const res = await ApiService.deleteWallet(wallet.id)
              if (res.success) {
                onSuccess()
                onClose()
              } else {
                Alert.alert('Gagal', res.message)
              }
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Gagal menghapus dompet')
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
              {wallet ? 'Edit Dompet & Rekening' : 'Tambah Rekening Baru'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <GlassInput
              label="Nama Rekening / Dompet"
              placeholder="Misal: BCA Utama, Gopay, Uang Tunai"
              value={name}
              onChangeText={setName}
              icon="wallet-outline"
            />

            {/* Type Selector */}
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Jenis Rekening
            </Text>
            <View style={styles.typesRow}>
              {WALLET_TYPES.map((t) => {
                const selected = type === t
                return (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.8}
                    onPress={() => setType(t)}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceElevated,
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        {
                          color: selected ? theme.colors.primaryForeground : theme.colors.textSecondary,
                          fontWeight: selected ? '700' : '500',
                        },
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Initial Balance Input */}
            <GlassInput
              label={wallet ? 'Saldo Tersimpan (Rp)' : 'Saldo Awal (Rp)'}
              placeholder="0"
              keyboardType="numeric"
              value={balance}
              onChangeText={(val) => {
                const clean = val.replace(/\D/g, '')
                setBalance(clean ? parseInt(clean, 10).toLocaleString('id-ID') : '')
              }}
              icon="cash-outline"
            />

            {/* Color Selector */}
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Warna Kartu
            </Text>
            <View style={styles.colorsRow}>
              {WALLET_COLORS.map((c) => {
                const selected = color === c
                return (
                  <TouchableOpacity
                    key={c}
                    activeOpacity={0.8}
                    onPress={() => setColor(c)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      selected && { borderWidth: 3, borderColor: theme.colors.text },
                    ]}
                  >
                    {selected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
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
                title={loading ? 'Menyimpan...' : wallet ? 'Simpan Perubahan' : 'Tambah Rekening'}
                onPress={handleSave}
                loading={loading}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
              {wallet && (
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
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 12,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
