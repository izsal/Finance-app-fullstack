import React, { useState } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { GlassInput } from './GlassInput'
import { GlassButton } from './GlassButton'
import { Ionicons } from '@expo/vector-icons'
import { GoalItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'
import { SPACING, RADII, AMOUNT_PRESETS } from '../theme/designSystem'

interface Props {
  visible: boolean
  onClose: () => void
  goal: GoalItem | null
  onSuccess: () => void
}

export const GoalDepositModal: React.FC<Props> = ({
  visible,
  onClose,
  goal,
  onSuccess,
}) => {
  const { theme, isDark } = useAppTheme()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!goal) return null

  const numAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0

  const handleDeposit = async () => {
    if (!numAmount || numAmount <= 0) {
      setError('Masukkan nominal setoran yang valid')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await ApiService.depositToGoal(goal.id, numAmount, 1)
      if (res.success) {
        setAmount('')
        onSuccess()
        onClose()
      } else {
        setError(res.message)
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal menambahkan setoran')
    } finally {
      setLoading(false)
    }
  }

  const setQuickAmount = (val: number) => {
    setAmount(val.toLocaleString('id-ID'))
  }

  const ctaLabel = numAmount > 0
    ? `Setor Rp ${numAmount.toLocaleString('id-ID')} ke ${goal.name}`
    : 'Konfirmasi Setoran'

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
                <Ionicons name="sparkles" size={17} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.colors.text }]}>Setor Tabungan</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{goal.name}</Text>
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
            {/* Quick amount chips */}
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
                    onPress={() => setQuickAmount(preset.value)}
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

            <GlassInput
              label="Nominal Setoran"
              placeholder="0"
              keyboardType="numeric"
              prefix="Rp"
              value={amount}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '')
                setAmount(cleaned ? parseInt(cleaned, 10).toLocaleString('id-ID') : '')
              }}
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
              title={loading ? 'Memproses Setoran...' : ctaLabel}
              onPress={handleDeposit}
              loading={loading}
              icon="wallet-outline"
              variant="primary"
              size="lg"
            />
            <Text style={[styles.reassuranceText, { color: theme.colors.textMuted }]}>
              Progress tabungan otomatis bertambah • Target tercatat rapi
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
    maxHeight: '85%',
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
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
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
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
