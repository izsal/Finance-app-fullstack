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
import { GlassInput } from './GlassInput'
import { GlassButton } from './GlassButton'
import { Ionicons } from '@expo/vector-icons'
import { CategoryItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'
import { getCategoryCuteBadge } from '../utils/categoryHelper'

interface Props {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const CAT_COLORS = ['#ea580c', '#e11d48', '#0284c7', '#16a34a', '#ca8a04', '#9333ea', '#0d9488', '#64748b']

export const CategoryManageModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { theme, isDark } = useAppTheme()
  const [tabType, setTabType] = useState<'expense' | 'income'>('expense')
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#ea580c')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadCategories = async () => {
    setLoading(true)
    try {
      const list = await ApiService.getCategories(tabType)
      setCategories(list)
    } catch (e) {
      console.warn('Gagal memuat kategori:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      loadCategories()
      setEditingCat(null)
      setName('')
      setError('')
    }
  }, [visible, tabType])

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingCat(cat)
    setName(cat.name)
    setColor(cat.color || '#ea580c')
    setError('')
  }

  const handleCancelEdit = () => {
    setEditingCat(null)
    setName('')
    setError('')
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nama kategori tidak boleh kosong')
      return
    }

    setError('')
    setSaving(true)
    try {
      if (editingCat) {
        // Edit existing
        const res = await ApiService.updateCategory(editingCat.id, {
          name: name.trim(),
          type: tabType,
          color,
        })
        if (res.success) {
          handleCancelEdit()
          await loadCategories()
          onSuccess()
        } else {
          setError(res.message)
        }
      } else {
        // Add new
        const res = await ApiService.addCategory({
          name: name.trim(),
          type: tabType,
          color,
        })
        if (res.success) {
          setName('')
          await loadCategories()
          onSuccess()
        } else {
          setError(res.message)
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (cat: CategoryItem) => {
    Alert.alert(
      'Hapus Kategori',
      `Yakin ingin menghapus kategori "${cat.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await ApiService.deleteCategory(cat.id)
              if (res.success) {
                if (editingCat?.id === cat.id) handleCancelEdit()
                await loadCategories()
                onSuccess()
              } else {
                Alert.alert('Gagal', res.message)
              }
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Gagal menghapus kategori')
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
            <Text style={[styles.title, { color: theme.colors.text }]}>Kelola Kategori</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Type Toggle Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTabType('expense')}
              style={[
                styles.tabBtn,
                tabType === 'expense' && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: tabType === 'expense' ? theme.colors.primaryForeground : theme.colors.textSecondary,
                    fontWeight: tabType === 'expense' ? '700' : '500',
                  },
                ]}
              >
                Pengeluaran
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTabType('income')}
              style={[
                styles.tabBtn,
                tabType === 'income' && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: tabType === 'income' ? theme.colors.primaryForeground : theme.colors.textSecondary,
                    fontWeight: tabType === 'income' ? '700' : '500',
                  },
                ]}
              >
                Pemasukan
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
            {/* Input Form (Add or Edit) */}
            <View style={[styles.formBox, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <Text style={[styles.formTitle, { color: theme.colors.text }]}>
                {editingCat ? `Edit Kategori "${editingCat.name}"` : 'Tambah Kategori Baru'}
              </Text>

              <GlassInput
                label="Nama Kategori"
                placeholder="Misal: Makan Siang, Gym, Kopi"
                value={name}
                onChangeText={setName}
                icon="pricetag-outline"
              />

              {/* Color dots */}
              <View style={styles.colorsRow}>
                {CAT_COLORS.map((c) => {
                  const selected = color === c
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setColor(c)}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c },
                        selected && { borderWidth: 3, borderColor: theme.colors.text },
                      ]}
                    />
                  )
                })}
              </View>

              {error ? (
                <Text style={[styles.errorText, { color: theme.colors.expense }]}>{error}</Text>
              ) : null}

              <View style={styles.formActionRow}>
                <GlassButton
                  title={saving ? 'Menyimpan...' : editingCat ? 'Simpan' : 'Tambah'}
                  onPress={handleSave}
                  loading={saving}
                  variant="primary"
                  size="sm"
                  style={{ flex: 1 }}
                />
                {editingCat && (
                  <GlassButton
                    title="Batal"
                    onPress={handleCancelEdit}
                    variant="glass"
                    size="sm"
                  />
                )}
              </View>
            </View>

            {/* Existing Categories List */}
            <Text style={[styles.listLabel, { color: theme.colors.textSecondary }]}>
              Daftar Kategori Tersedia ({categories.length})
            </Text>

            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : categories.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                Belum ada kategori untuk tipe ini.
              </Text>
            ) : (
              categories.map((cat) => {
                const cute = getCategoryCuteBadge(cat.name, cat.type, theme)
                return (
                  <View
                    key={cat.id}
                    style={[
                      styles.catItemRow,
                      {
                        backgroundColor: theme.colors.surfaceElevated,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.catBadgeCircle, { backgroundColor: cute.bg }]}>
                      <Ionicons name={cute.icon} size={16} color={cute.text} />
                    </View>

                    <Text style={[styles.catItemName, { color: theme.colors.text }]}>
                      {cat.name}
                    </Text>

                    <View style={styles.catActionBtns}>
                      <TouchableOpacity
                        onPress={() => handleStartEdit(cat)}
                        style={[styles.miniBtn, { backgroundColor: theme.colors.badgeBg }]}
                      >
                        <Ionicons name="pencil" size={14} color={theme.colors.text} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDelete(cat)}
                        style={[styles.miniBtn, { backgroundColor: theme.colors.expenseBg }]}
                      >
                        <Ionicons name="trash-outline" size={14} color={theme.colors.expense} />
                      </TouchableOpacity>
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
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
  },
  formBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginTop: -2,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  formActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  listLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 14,
  },
  catItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  catBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catItemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  catActionBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  miniBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
