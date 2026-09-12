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
  Alert,
  ActivityIndicator,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
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
  onSuccess: () => void
}

export const AddTransactionModal: React.FC<Props> = ({
  visible,
  onClose,
  wallets,
  onSuccess,
}) => {
  const { theme, isDark } = useAppTheme()
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedWalletId, setSelectedWalletId] = useState<number>(wallets[0]?.id || 1)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanNote, setScanNote] = useState('')
  const [error, setError] = useState('')

  const handleScanReceipt = async (fromCamera: boolean) => {
    try {
      let result: ImagePicker.ImagePickerResult

      if (fromCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (!permission.granted) {
          Alert.alert('Izin Kamera', 'Izin akses kamera dibutuhkan untuk memotret struk belanja.')
          return
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          base64: true,
          quality: 0.7,
        })
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) {
          Alert.alert('Izin Galeri', 'Izin akses galeri foto dibutuhkan untuk memilih struk belanja.')
          return
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          base64: true,
          quality: 0.7,
        })
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return
      }

      const asset = result.assets[0]
      let base64 = asset.base64

      // Jika platform web atau base64 belum ada, ambil dari uri
      if (!base64 && asset.uri) {
        const fetchRes = await fetch(asset.uri)
        const blob = await fetchRes.blob()
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const res = reader.result as string
            resolve(res.includes(',') ? res.split(',')[1] : res)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      }

      if (!base64) {
        Alert.alert('Gagal', 'Tidak dapat memproses gambar yang dipilih.')
        return
      }

      setScanning(true)
      setScanNote('AI sedang memindai struk & membaca nominal...')
      setError('')

      const scanRes = await ApiService.scanReceipt(base64, asset.mimeType || 'image/jpeg')

      if (scanRes.success && scanRes.data) {
        const d = scanRes.data
        setType(d.type)
        if (d.amount > 0) {
          setAmount(d.amount.toLocaleString('id-ID'))
        }
        if (d.description) {
          setDescription(d.description)
        }
        setScanNote(`✨ Terdeteksi: ${d.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} • ${d.categoryName} (${d.description})`)
      } else {
        setError(scanRes.message || 'Gagal membaca struk belanja')
        setScanNote('')
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memindai struk')
      setScanNote('')
    } finally {
      setScanning(false)
    }
  }

  const handleSave = async () => {
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
      const res = await ApiService.addTransaction({
        walletId: selectedWalletId,
        categoryId: type === 'income' ? 1 : 2,
        type,
        amount: numAmount,
        description: description.trim(),
        date: new Date().toISOString().split('T')[0],
      })

      if (res.success) {
        setAmount('')
        setDescription('')
        onSuccess()
        onClose()
      } else {
        setError(res.message)
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan transaksi')
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
              <Text style={[styles.title, { color: theme.colors.text }]}>Catat Transaksi</Text>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceElevated }]}>
                <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              {/* SMART AI RECEIPT SCANNER CARD */}
              <View
                style={[
                  styles.scannerCard,
                  {
                    backgroundColor: isDark ? 'rgba(20, 184, 166, 0.08)' : '#f0fdfa',
                    borderColor: isDark ? 'rgba(20, 184, 166, 0.3)' : '#99f6e4',
                  },
                ]}
              >
                <View style={styles.scannerTopRow}>
                  <View style={styles.scannerIconWrap}>
                    <Ionicons name="scan-outline" size={18} color="#0d9488" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={[styles.scannerTitle, { color: theme.colors.text }]}>
                        Pindai Struk / Bukti AI
                      </Text>
                      <View style={styles.scannerAiBadge}>
                        <Text style={styles.scannerAiBadgeText}>AI ✨</Text>
                      </View>
                    </View>
                    <Text style={[styles.scannerSubtitle, { color: theme.colors.textSecondary }]}>
                      Foto struk belanja / transfer untuk isi nominal otomatis
                    </Text>
                  </View>
                </View>

                {scanning ? (
                  <View style={styles.scanningStatusRow}>
                    <ActivityIndicator size="small" color="#0d9488" />
                    <Text style={[styles.scanningStatusText, { color: '#0d9488' }]}>
                      {scanNote}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.scannerActionsRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleScanReceipt(true)}
                      style={[styles.scannerBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#ffffff', borderColor: theme.colors.border }]}
                    >
                      <Ionicons name="camera" size={14} color={theme.colors.text} />
                      <Text style={[styles.scannerBtnText, { color: theme.colors.text }]}>Kamera 📸</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleScanReceipt(false)}
                      style={[styles.scannerBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#ffffff', borderColor: theme.colors.border }]}
                    >
                      <Ionicons name="images" size={14} color={theme.colors.text} />
                      <Text style={[styles.scannerBtnText, { color: theme.colors.text }]}>Galeri 🖼️</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {scanNote && !scanning ? (
                  <View style={styles.scanSuccessRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                    <Text style={styles.scanSuccessText}>{scanNote}</Text>
                  </View>
                ) : null}
              </View>

              {/* Type Switcher */}
              <View style={[styles.typeSwitcher, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setType('expense')}
                  style={[
                    styles.typeBtn,
                    type === 'expense' && { backgroundColor: theme.colors.expenseBg, borderColor: theme.colors.expense, borderWidth: 1 },
                  ]}
                >
                  <Ionicons
                    name="arrow-down-circle"
                    size={17}
                    color={type === 'expense' ? theme.colors.expense : theme.colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      { color: type === 'expense' ? theme.colors.expense : theme.colors.textSecondary, fontWeight: type === 'expense' ? '700' : '500' },
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
                    type === 'income' && { backgroundColor: theme.colors.incomeBg, borderColor: theme.colors.income, borderWidth: 1 },
                  ]}
                >
                  <Ionicons
                    name="arrow-up-circle"
                    size={17}
                    color={type === 'income' ? theme.colors.income : theme.colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      { color: type === 'income' ? theme.colors.income : theme.colors.textSecondary, fontWeight: type === 'income' ? '700' : '500' },
                    ]}
                  >
                    Pemasukan
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Amount Input */}
              <GlassInput
                label="Nominal Transaksi"
                placeholder="0"
                keyboardType="numeric"
                prefix="Rp"
                value={amount}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '')
                  setAmount(cleaned ? parseInt(cleaned, 10).toLocaleString('id-ID') : '')
                }}
              />

              {/* Wallet Selector */}
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Pilih Dompet</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
                {wallets.map((w) => {
                  const selected = selectedWalletId === w.id
                  return (
                    <TouchableOpacity
                      key={w.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedWalletId(w.id)}
                      style={[
                        styles.walletChip,
                        {
                          backgroundColor: selected ? (isDark ? 'rgba(20,184,166,0.15)' : '#ccfbf1') : theme.colors.surfaceElevated,
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
                          styles.walletChipText,
                          {
                            color: selected ? theme.colors.primary : theme.colors.textSecondary,
                            fontWeight: selected ? '700' : '500',
                          },
                        ]}
                      >
                        {w.name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>

              {/* Description */}
              <GlassInput
                label="Catatan / Keperluan"
                placeholder="Contoh: Belanja Bulanan, Makan Siang"
                icon="document-text-outline"
                value={description}
                onChangeText={setDescription}
              />

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: theme.colors.expenseBg, borderColor: theme.colors.expense }]}>
                  <Text style={[styles.errorText, { color: theme.colors.expense }]}>{error}</Text>
                </View>
              ) : null}

              {/* Submit */}
              <GlassButton
                title="Simpan Mutasi"
                onPress={handleSave}
                loading={loading}
                icon="checkmark-circle-outline"
                variant={type === 'expense' ? 'danger' : 'primary'}
                style={styles.submitBtn}
                size="lg"
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
  title: {
    fontSize: 17,
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
  scannerCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 12,
    marginBottom: 14,
  },
  scannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scannerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  scannerAiBadge: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  scannerAiBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  scannerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  scanningStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13, 148, 136, 0.2)',
  },
  scanningStatusText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  scannerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  scannerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  scannerBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  scanSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  scanSuccessText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
  },
  typeSwitcher: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  typeText: {
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  walletScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  walletChipText: {
    fontSize: 12,
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
    marginTop: 4,
  },
})
