import React, { useState } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { GlassCard } from './GlassCard'
import { GlassInput } from './GlassInput'
import { GlassButton } from './GlassButton'
import { Ionicons } from '@expo/vector-icons'
import { GoalItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'

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
  const { theme } = useAppTheme()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!goal) return null

  const handleDeposit = async () => {
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10)
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

            {/* Quick amount chips */}
            <View style={styles.quickChipsRow}>
              {[250000, 500000, 1000000, 2500000].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setQuickAmount(val)}
                  style={[styles.chip, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.chipText, { color: theme.colors.primary }]}>
                    +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
                <Text style={[styles.errorText, { color: theme.colors.expense }]}>{error}</Text>
              </View>
            ) : null}

            <GlassButton
              title="Konfirmasi Setoran"
              onPress={handleDeposit}
              loading={loading}
              icon="wallet-outline"
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />
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
    maxHeight: '80%',
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
  subtitle: {
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  chip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '700',
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
