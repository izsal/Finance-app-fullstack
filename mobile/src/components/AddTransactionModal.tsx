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
      setScanNote('AI sedang membaca struk & mendeteksi nominal...')
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

  // Micro-UX: Quick chip preset handler
  const handleApplyPreset = (val: number) => {
    setAmount(val.toLocaleString('id-ID'))
  }

  const numAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0

  const handleSave = async () => {
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

  // Feedback Harga & Aksi Transparan pada CTA Button
  const ctaLabel = numAmount > 0
    ? `${type === 'expense' ? 'Simpan Pengeluaran' : 'Simpan Pemasukan'} • Rp ${numAmount.toLocaleString('id-ID')}`
    : 'Simpan Transaksi'

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
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>Catat Transaksi</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Pencatatan pengeluaran & pemasukan instan
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceElevated }]}
            >
              <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.scannerTitle, { color: theme.colors.text }]}>
                      Pindai Struk / Bukti AI
                    </Text>
                    <View style={styles.scannerAiBadge}>
                      <Text style={styles.scannerAiBadgeText}>AI ✨</Text>
                    </View>
                  </View>
                  <Text style={[styles.scannerSubtitle, { color: theme.colors.textSecondary }]}>
                    Foto struk belanja untuk isi otomatis nominal & detail
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
                    style={[
                      styles.scannerBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons name="camera-outline" size={15} color={theme.colors.text} />
                    <Text style={[styles.scannerBtnText, { color: theme.colors.text }]}>Kamera 📸</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleScanReceipt(false)}
                    style={[
                      styles.scannerBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons name="images-outline" size={15} color={theme.colors.text} />
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
            <View
              style={[
                styles.typeSwitcher,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setType('expense')}
                style={[
                  styles.typeBtn,
                  type === 'expense' && {
                    backgroundColor: theme.colors.expenseBg,
                    borderColor: theme.colors.expense,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons
                  name="arrow-down-circle"
                  size={16}
                  color={type === 'expense' ? theme.colors.expense : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.typeText,
                    {
                      color: type === 'expense' ? theme.colors.expense : theme.colors.textSecondary,
                      fontWeight: type === 'expense' ? '800' : '500',
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
                  type === 'income' && {
                    backgroundColor: theme.colors.incomeBg,
                    borderColor: theme.colors.income,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={16}
                  color={type === 'income' ? theme.colors.income : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.typeText,
                    {
                      color: type === 'income' ? theme.colors.income : theme.colors.textSecondary,
                      fontWeight: type === 'income' ? '800' : '500',
                    },
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

            {/* MICRO-UX: Quick Chip Presets (Kurangi Langkah Pengguna) */}
            <View style={styles.presetsSection}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Pilihan Cepat Nominal
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {AMOUNT_PRESETS.map((preset) => {
                  const isMatch = numAmount === preset.value
                  return (
                    <TouchableOpacity
                      key={preset.value}
                      activeOpacity={0.7}
                      onPress={() => handleApplyPreset(preset.value)}
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

            {/* Wallet Selector */}
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Pilih Rekening Dompet
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
              {wallets.map((w) => {
                const selected = selectedWalletId === w.id
                return (
                  <TouchableOpacity
                    key={w.id}
                    activeOpacity={0.75}
                    onPress={() => setSelectedWalletId(w.id)}
                    style={[
                      styles.walletChip,
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
                        styles.walletChipText,
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
            </ScrollView>

            {/* Description */}
            <GlassInput
              label="Catatan / Keperluan"
              placeholder="Contoh: Belanja Bulanan, Makan Siang, Gaji"
              icon="document-text-outline"
              value={description}
              onChangeText={setDescription}
            />

            {error ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: theme.colors.expenseBg, borderColor: theme.colors.expense },
                ]}
              >
                <Ionicons name="alert-circle" size={15} color={theme.colors.expense} />
                <Text style={[styles.errorText, { color: theme.colors.expense }]}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* STICKY CTA ACTION BAR (THUMB ZONE ERGONOMICS) */}
          <View
            style={[
              styles.stickyActionBar,
              {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            <GlassButton
              title={loading ? 'Menyimpan Transaksi...' : ctaLabel}
              onPress={handleSave}
              loading={loading}
              icon={type === 'expense' ? 'arrow-down-circle' : 'arrow-up-circle'}
              variant={type === 'expense' ? 'danger' : 'primary'}
              size="lg"
            />
            <Text style={[styles.reassuranceText, { color: theme.colors.textMuted }]}>
              Pencatatan instan • Saldo langsung ter-update di dompet
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
  scannerCard: {
    borderRadius: RADII.md,
    borderWidth: 1.2,
    padding: SPACING.sm + 4,
    marginBottom: SPACING.md,
  },
  scannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADII.sm,
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
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: RADII.xs,
  },
  scannerAiBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  scannerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  scanningStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
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
    marginTop: SPACING.sm,
  },
  scannerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: RADII.sm,
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
    marginTop: SPACING.sm,
    padding: 7,
    borderRadius: RADII.xs,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  scanSuccessText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
  },
  typeSwitcher: {
    flexDirection: 'row',
    borderRadius: RADII.md,
    padding: 3,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADII.sm,
    gap: 6,
  },
  typeText: {
    fontSize: 13,
  },
  presetsSection: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
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
  walletScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.sm,
    marginRight: 8,
  },
  walletChipText: {
    fontSize: 12,
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
  },
  stickyActionBar: {
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
