import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GlassCard } from '../components/GlassCard'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { EditTransactionModal } from '../components/EditTransactionModal'
import { CategoryManageModal } from '../components/CategoryManageModal'
import { TransactionItem, WalletItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'
import { getCategoryCuteBadge } from '../utils/categoryHelper'

interface Props {
  transactions: TransactionItem[]
  wallets: WalletItem[]
  onRefresh: () => Promise<void>
}

export const TransactionsScreen: React.FC<Props> = ({
  transactions,
  wallets,
  onRefresh,
}) => {
  const { theme, isDark } = useAppTheme()
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [addTxVisible, setAddTxVisible] = useState(false)
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null)
  const [catManageVisible, setCatManageVisible] = useState(false)

  const filteredList = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const descMatch = tx.description.toLowerCase().includes(q)
      const catMatch = (tx.categoryName || '').toLowerCase().includes(q)
      if (!descMatch && !catMatch) return false
    }
    return true
  })

  const totalFilteredAmount = filteredList.reduce((sum, item) => {
    return item.type === 'income' ? sum + item.amount : sum - item.amount
  }, 0)

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Riwayat Transaksi</Text>
            <Text style={[styles.pageSubtitle, { color: theme.colors.textSecondary }]}>
              Ketuk transaksi untuk mengedit atau menghapus
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCatManageVisible(true)}
            style={[styles.catManageBtn, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
          >
            <Ionicons name="pricetags-outline" size={14} color={theme.colors.text} />
            <Text style={[styles.catManageText, { color: theme.colors.text }]}>Kategori</Text>
          </TouchableOpacity>
        </View>

        {/* Minimal Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={17} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Cari transaksi atau kategori..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'expense', label: 'Pengeluaran' },
            { id: 'income', label: 'Pemasukan' },
          ].map((tab) => {
            const active = filterType === tab.id
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.7}
                onPress={() => setFilterType(tab.id as any)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: active ? theme.colors.primaryForeground : theme.colors.textSecondary,
                      fontWeight: active ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* List content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        <View style={styles.metaSummaryRow}>
          <Text style={[styles.metaCount, { color: theme.colors.textMuted }]}>
            {filteredList.length} transaksi tercatat
          </Text>
          <Text
            style={[
              styles.metaTotal,
              { color: totalFilteredAmount >= 0 ? theme.colors.income : theme.colors.expense },
            ]}
          >
            {totalFilteredAmount >= 0 ? '+' : ''}
            {ApiService.formatRupiah(totalFilteredAmount)}
          </Text>
        </View>

        {filteredList.length === 0 ? (
          <GlassCard borderRadius={18} style={styles.emptyCard}>
            <View style={styles.emptyInner}>
              <Ionicons name="receipt-outline" size={38} color={theme.colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Tidak ada transaksi
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Tekan tombol (+) di bawah untuk mencatat transaksi'}
              </Text>
            </View>
          </GlassCard>
        ) : (
          filteredList.map((tx) => {
            const badge = getCategoryCuteBadge(tx.categoryName, tx.type, theme)
            return (
              <TouchableOpacity
                key={tx.id}
                activeOpacity={0.75}
                onPress={() => setEditingTx(tx)}
              >
                <GlassCard
                  borderRadius={16}
                  style={styles.txCard}
                >
                  <View style={styles.txInner}>
                    <View
                      style={[
                        styles.iconBox,
                        {
                          backgroundColor: badge.bg,
                        },
                      ]}
                    >
                      <Ionicons
                        name={badge.icon}
                        size={18}
                        color={badge.text}
                      />
                    </View>

                    <View style={styles.txMain}>
                      <Text style={[styles.txDesc, { color: theme.colors.text }]}>{tx.description}</Text>
                      <View style={styles.tagRow}>
                        <View style={[styles.miniBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.miniBadgeText, { color: badge.text }]}>
                            {tx.categoryName || (tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                          </Text>
                        </View>
                        <Text style={[styles.dotSeparator, { color: theme.colors.textMuted }]}>•</Text>
                        <Text style={[styles.txDate, { color: theme.colors.textMuted }]}>{tx.date}</Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text
                        style={[
                          styles.amountText,
                          {
                            color: tx.type === 'income' ? theme.colors.income : theme.colors.expense,
                          },
                        ]}
                      >
                        {tx.type === 'income' ? '+' : '-'} {ApiService.formatRupiah(tx.amount)}
                      </Text>
                      <Ionicons name="create-outline" size={12} color={theme.colors.textMuted} />
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setAddTxVisible(true)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="add" size={26} color={theme.colors.primaryForeground} />
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={addTxVisible}
        onClose={() => setAddTxVisible(false)}
        wallets={wallets}
        onSuccess={onRefresh}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        visible={!!editingTx}
        transaction={editingTx}
        wallets={wallets}
        onClose={() => setEditingTx(null)}
        onSuccess={onRefresh}
      />

      {/* Category Management Modal */}
      <CategoryManageModal
        visible={catManageVisible}
        onClose={() => setCatManageVisible(false)}
        onSuccess={onRefresh}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  pageSubtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  catManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  catManageText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
    gap: 8,
  },
  metaSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  metaCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaTotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  txCard: {
    overflow: 'hidden',
  },
  txInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  txMain: {
    flex: 1,
    marginRight: 8,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  txTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  dotSeparator: {
    fontSize: 8,
  },
  txDate: {
    fontSize: 11,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyCard: {
    padding: 28,
    marginTop: 16,
  },
  emptyInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
})
