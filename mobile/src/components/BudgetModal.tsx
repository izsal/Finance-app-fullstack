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
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GlassInput } from './GlassInput'
import { GlassButton } from './GlassButton'
import { GlassCard } from './GlassCard'
import { CategoryItem, BudgetItem, BudgetResponse } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'
import { getCategoryCuteBadge } from '../utils/categoryHelper'

interface Props {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const PRESET_AMOUNTS = [300000, 500000, 1000000, 2000000, 3500000, 5000000]

export const BudgetModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const { theme, isDark } = useAppTheme()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [budgetData, setBudgetData] = useState<BudgetResponse | null>(null)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  
  // Form create / edit budget
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [res, cats] = await Promise.all([
        ApiService.getBudgets(),
        ApiService.getCategories('expense'),
      ])
      setBudgetData(res)
      setCategories(cats)
      if (cats.length > 0 && !selectedCatId) {
        setSelectedCatId(cats[0].id)
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat data anggaran')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      loadData()
      setAmount('')
    }
  }, [visible])

  const handleSelectCategory = (cat: CategoryItem) => {
    setSelectedCatId(cat.id)
    const existing = budgetData?.budgets.find((b) => b.categoryId === cat.id)
    if (existing) {
      setAmount(existing.amount.toLocaleString('id-ID'))
    } else {
      setAmount('')
    }
  }

  const handleSave = async () => {
    if (!selectedCatId) {
      setError('Pilih kategori anggaran terlebih dahulu')
      return
    }
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0
    if (!numAmount || numAmount <= 0) {
      setError('Masukkan nominal pagu anggaran yang valid')
      return
    }

    setSaving(true)
    setError('')
    try {
      const res = await ApiService.saveBudget(selectedCatId, numAmount)
      if (res.success) {
        await loadData()
        onSuccess()
        setAmount('')
        Alert.alert('Sukses', 'Pagu anggaran bulanan berhasil disimpan!')
      } else {
        setError(res.message)
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan anggaran')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (budget: BudgetItem) => {
    Alert.alert(
      'Hapus Anggaran',
      `Hapus pagu anggaran untuk kategori "${budget.categoryName}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              const res = await ApiService.deleteBudget(budget.id)
              if (res.success) {
                await loadData()
                onSuccess()
              } else {
                Alert.alert('Gagal', res.message)
              }
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Gagal menghapus')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  const summary = budgetData?.summary || {
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallPercentage: 0,
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View
          style={[
            styles.sheetContainer,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          {/* Top Sheet Handle */}
          <View style={styles.handleBar} />

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>Pos Anggaran Bulanan</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Bulan {budgetData?.month || new Date().toISOString().slice(0, 7)} • Atur pagu belanja cerdas
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* OVERALL SUMMARY CARD */}
            <GlassCard borderRadius={16} style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>
                    Total Pagu Anggaran
                  </Text>
                  <Text style={[styles.summaryAmount, { color: theme.colors.text }]}>
                    {ApiService.formatRupiah(summary.totalBudget)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.percentagePill,
                    {
                      backgroundColor:
                        summary.overallPercentage > 100
                          ? '#ef444420'
                          : summary.overallPercentage > 80
                            ? '#f59e0b20'
                            : '#10b98120',
                      borderColor:
                        summary.overallPercentage > 100
                          ? '#ef4444'
                          : summary.overallPercentage > 80
                            ? '#f59e0b'
                            : '#10b981',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.percentageText,
                      {
                        color:
                          summary.overallPercentage > 100
                            ? '#ef4444'
                            : summary.overallPercentage > 80
                              ? '#f59e0b'
                              : '#10b981',
                      },
                    ]}
                  >
                    {summary.overallPercentage}% Terpakai
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(summary.overallPercentage, 100)}%`,
                      backgroundColor:
                        summary.overallPercentage > 100
                          ? '#ef4444'
                          : summary.overallPercentage > 80
                            ? '#f59e0b'
                            : theme.colors.primary,
                    },
                  ]}
                />
              </View>

              <View style={styles.summaryBottom}>
                <Text style={[styles.summarySub, { color: theme.colors.textSecondary }]}>
                  Terpakai: <Text style={{ color: '#ef4444', fontWeight: '700' }}>{ApiService.formatRupiah(summary.totalSpent)}</Text>
                </Text>
                <Text style={[styles.summarySub, { color: theme.colors.textSecondary }]}>
                  Sisa: <Text style={{ color: summary.totalRemaining >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                    {ApiService.formatRupiah(summary.totalRemaining)}
                  </Text>
                </Text>
              </View>
            </GlassCard>

            {/* FORM ATUR PAGU ANGGARAN */}
            <View style={styles.sectionHeader}>
              <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Tetapkan / Perbarui Pagu Kategori
              </Text>
            </View>

            {/* Kategori Horisontal Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catChipsScroll}
            >
              {categories.map((cat) => {
                const isSelected = selectedCatId === cat.id
                const badge = getCategoryCuteBadge(cat.name, 'expense', theme)
                const hasBudget = budgetData?.budgets.some((b) => b.categoryId === cat.id)
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectCategory(cat)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : isDark
                            ? 'rgba(255,255,255,0.06)'
                            : '#f1f5f9',
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={badge.icon}
                      size={14}
                      color={isSelected ? theme.colors.primaryForeground : badge.text}
                    />
                    <Text
                      style={[
                        styles.catLabel,
                        {
                          color: isSelected ? theme.colors.primaryForeground : theme.colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {hasBudget && (
                      <View
                        style={[
                          styles.catDot,
                          { backgroundColor: isSelected ? '#ffffff' : theme.colors.primary },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {/* Input Nominal */}
            <View style={{ marginTop: 12 }}>
              <GlassInput
                label="Nominal Pagu Anggaran Bulanan (Rp)"
                placeholder="Contoh: 1.500.000"
                keyboardType="numeric"
                value={amount}
                onChangeText={(val) => {
                  const cleaned = val.replace(/\D/g, '')
                  if (!cleaned) {
                    setAmount('')
                  } else {
                    setAmount(parseInt(cleaned, 10).toLocaleString('id-ID'))
                  }
                }}
              />
            </View>

            {/* Quick Chip Presets */}
            <View style={styles.presetsRow}>
              {PRESET_AMOUNTS.map((val) => (
                <TouchableOpacity
                  key={val}
                  activeOpacity={0.7}
                  onPress={() => setAmount(val.toLocaleString('id-ID'))}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.presetText, { color: theme.colors.textSecondary }]}>
                    +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={{ marginTop: 12, marginBottom: 20 }}>
              <GlassButton
                title={saving ? 'Menyimpan...' : 'Simpan Pagu Anggaran'}
                onPress={handleSave}
                disabled={saving}
                icon="save-outline"
                size="md"
              />
            </View>

            {/* DAFTAR ANGGARAN AKTIF */}
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Daftar Pos Anggaran ({budgetData?.budgets.length || 0})
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : budgetData?.budgets.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="pie-chart-outline" size={36} color={theme.colors.textMuted} />
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  Belum ada pos anggaran yang dibuat bulan ini. Pilih kategori di atas untuk mulai membatasi pengeluaran.
                </Text>
              </View>
            ) : (
              budgetData?.budgets.map((b) => {
                const badge = getCategoryCuteBadge(b.categoryName, 'expense', theme)
                return (
                  <View
                    key={b.id}
                    style={[
                      styles.budgetItemCard,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                        borderColor: b.isOverbudget ? '#ef444440' : theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.budgetItemHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.itemIconBox, { backgroundColor: badge.bg }]}>
                          <Ionicons name={badge.icon} size={15} color={badge.text} />
                        </View>
                        <View>
                          <Text style={[styles.budgetName, { color: theme.colors.text }]}>
                            {b.categoryName}
                          </Text>
                          <Text style={[styles.budgetDetail, { color: theme.colors.textSecondary }]}>
                            Pagu: {ApiService.formatRupiah(b.amount)}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View
                          style={[
                            styles.percentageMiniPill,
                            {
                              backgroundColor: b.isOverbudget
                                ? '#ef444420'
                                : b.percentage > 80
                                  ? '#f59e0b20'
                                  : '#10b98120',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.percentageMiniText,
                              {
                                color: b.isOverbudget
                                  ? '#ef4444'
                                  : b.percentage > 80
                                    ? '#f59e0b'
                                    : '#10b981',
                              },
                            ]}
                          >
                            {b.percentage}%
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDelete(b)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="trash-outline" size={17} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Progress track */}
                    <View style={styles.itemProgressTrack}>
                      <View
                        style={[
                          styles.itemProgressBar,
                          {
                            width: `${Math.min(b.percentage, 100)}%`,
                            backgroundColor: b.isOverbudget
                              ? '#ef4444'
                              : b.percentage > 80
                                ? '#f59e0b'
                                : theme.colors.primary,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.budgetItemFooter}>
                      <Text style={[styles.budgetFooterText, { color: theme.colors.textMuted }]}>
                        Terpakai: {ApiService.formatRupiah(b.spent)}
                      </Text>
                      <Text
                        style={[
                          styles.budgetFooterText,
                          { color: b.remaining >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' },
                        ]}
                      >
                        {b.remaining >= 0 ? `Sisa: ${ApiService.formatRupiah(b.remaining)}` : `Over: ${ApiService.formatRupiah(Math.abs(b.remaining))}`}
                      </Text>
                    </View>
                  </View>
                )
              })
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(150,150,150,0.3)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 18,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  percentagePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(150,150,150,0.15)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  summaryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summarySub: {
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  catChipsScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  catEmoji: {
    fontSize: 14,
  },
  catLabel: {
    fontSize: 12,
  },
  itemIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  budgetItemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  budgetItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 14,
    fontWeight: '700',
  },
  budgetDetail: {
    fontSize: 11,
    marginTop: 1,
  },
  percentageMiniPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  percentageMiniText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(150,150,150,0.15)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  itemProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  budgetItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetFooterText: {
    fontSize: 11,
  },
})
