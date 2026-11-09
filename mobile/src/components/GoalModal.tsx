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
import { GoalItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'

interface Props {
  visible: boolean
  goal: GoalItem | null // jika null = mode tambah baru, jika ada = mode edit
  onClose: () => void
  onSuccess: () => void
}

const GOAL_COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981']

export const GoalModal: React.FC<Props> = ({
  visible,
  goal,
  onClose,
  onSuccess,
}) => {
  const { theme, isDark } = useAppTheme()
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [color, setColor] = useState('#0d9488')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (goal) {
      setName(goal.name)
      setTargetAmount(String(goal.targetAmount))
      setTargetDate(goal.targetDate || '')
      setColor(goal.color || '#0d9488')
    } else {
      setName('')
      setTargetAmount('')
      // Default deadline 6 bulan ke depan
      const d = new Date()
      d.setMonth(d.getMonth() + 6)
      setTargetDate(d.toISOString().split('T')[0])
      setColor('#0d9488')
    }
    setError('')
  }, [goal, visible])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nama target impian wajib diisi')
      return
    }

    const numTarget = parseInt(targetAmount.replace(/\D/g, ''), 10)
    if (!numTarget || numTarget <= 0) {
      setError('Nominal target harus lebih dari 0')
      return
    }

    if (!targetDate.trim()) {
      setError('Target tanggal deadline wajib diisi (YYYY-MM-DD)')
      return
    }

    setError('')
    setLoading(true)

    try {
      if (goal) {
        // Edit mode
        const res = await ApiService.updateGoal(goal.id, {
          name: name.trim(),
          targetAmount: numTarget,
          targetDate: targetDate.trim(),
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
        const res = await ApiService.addGoal({
          name: name.trim(),
          targetAmount: numTarget,
          targetDate: targetDate.trim(),
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
      setError(e?.message || 'Gagal menyimpan target')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (!goal) return
    Alert.alert(
      'Hapus Target',
      `Yakin ingin menghapus target "${goal.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            try {
              const res = await ApiService.deleteGoal(goal.id)
              if (res.success) {
                onSuccess()
                onClose()
              } else {
                Alert.alert('Gagal', res.message)
              }
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Gagal menghapus target')
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
              {goal ? 'Edit Target Impian' : 'Tambah Target Impian Baru'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <GlassInput
              label="Nama Target Finansial"
              placeholder="Misal: Dana Darurat, Beli Laptop, Liburan"
              value={name}
              onChangeText={setName}
              icon="flag-outline"
            />

            {/* Target Amount */}
            <GlassInput
              label="Nominal Target (Rp)"
              placeholder="0"
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={(val) => {
                const clean = val.replace(/\D/g, '')
                setTargetAmount(clean ? parseInt(clean, 10).toLocaleString('id-ID') : '')
              }}
              icon="cash-outline"
            />

            {/* Target Date */}
            <GlassInput
              label="Target Tanggal Tercapai (YYYY-MM-DD)"
              placeholder="2026-12-31"
              value={targetDate}
              onChangeText={setTargetDate}
              icon="calendar-outline"
            />

            {/* Color Selector */}
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              Warna Penanda Target
            </Text>
            <View style={styles.colorsRow}>
              {GOAL_COLORS.map((c) => {
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
                title={loading ? 'Menyimpan...' : goal ? 'Simpan Perubahan' : 'Buat Target Baru'}
                onPress={handleSave}
                loading={loading}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
              {goal && (
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
