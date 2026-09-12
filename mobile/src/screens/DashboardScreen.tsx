import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GlassCard } from '../components/GlassCard'
import { WalletGlassCard } from '../components/WalletGlassCard'
import { StatGlassCard } from '../components/StatGlassCard'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { TransferModal } from '../components/TransferModal'
import { ProUpgradeModal } from '../components/ProUpgradeModal'
import { AppLogo } from '../components/AppLogo'
import { SummaryData } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'
import { getCategoryCuteBadge } from '../utils/categoryHelper'

interface Props {
  summary: SummaryData
  isLive: boolean
  onRefresh: () => Promise<void>
  onOpenSettings: () => void
  onNavigateTab: (tab: string) => void
}

export const DashboardScreen: React.FC<Props> = ({
  summary,
  isLive,
  onRefresh,
  onOpenSettings,
  onNavigateTab,
}) => {
  const { theme, isDark, toggleTheme } = useAppTheme()
  const [refreshing, setRefreshing] = useState(false)
  const [addTxVisible, setAddTxVisible] = useState(false)
  const [transferVisible, setTransferVisible] = useState(false)
  const [transferFromWalletId, setTransferFromWalletId] = useState<number>(1)
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  const openTransfer = (walletId?: number) => {
    if (walletId) setTransferFromWalletId(walletId)
    setTransferVisible(true)
  }

  const currentUser = ApiService.getCurrentUser()
  const isPro = currentUser?.plan === 'pro'

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Cute Minimal Header Bar */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <AppLogo size={38} borderRadius={11} />
            <View>
              <Text style={[styles.greetingText, { color: theme.colors.textMuted }]}>
                Hai,
              </Text>
              <View style={styles.userTitleRow}>
                <Text style={[styles.userNameText, { color: theme.colors.text }]}>
                  {currentUser?.name || currentUser?.email || 'Pengguna Dompetku'}
                </Text>
              <View
                style={[
                  styles.headerPlanTag,
                  {
                    backgroundColor: isPro
                      ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7')
                      : theme.colors.badgeBg,
                    borderColor: isPro ? '#f59e0b' : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.headerPlanText,
                    { color: isPro ? '#d97706' : theme.colors.textSecondary },
                  ]}
                >
                  {isPro ? 'PRO 👑' : 'FREE'}
                </Text>
              </View>
            </View>
          </View>
        </View>

          <View style={styles.headerRight}>
            {/* Quick Dark/Light Switcher */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={toggleTheme}
              style={[
                styles.themeToggleBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={18}
                color={isDark ? '#facc15' : '#6366f1'}
              />
            </TouchableOpacity>

            {/* Connection Status Badge */}
            <View
              style={[
                styles.statusBadge,
                {
                  borderColor: isLive ? 'rgba(22, 163, 74, 0.25)' : theme.colors.border,
                  backgroundColor: isLive ? theme.colors.incomeBg : theme.colors.surfaceElevated,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isLive ? theme.colors.income : '#ca8a04' },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isLive ? theme.colors.income : '#ca8a04' },
                ]}
              >
                {isLive ? 'ONLINE' : 'CONNECTING'}
              </Text>
            </View>

            {/* Settings */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onOpenSettings}
              style={[
                styles.iconBtn,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="settings-outline" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* MONEY TRACKER STYLE CUTE HERO BALANCE CARD */}
        <GlassCard borderRadius={20} style={styles.heroCard}>
          <View style={styles.heroInner}>
            <View style={styles.heroTopRow}>
              <Text style={[styles.heroLabel, { color: theme.colors.textMuted }]}>
                TOTAL SALDO BERSIH
              </Text>
              <View style={[styles.savingsBadge, { backgroundColor: theme.colors.incomeBg }]}>
                <Ionicons name="sparkles" size={11} color={theme.colors.income} />
                <Text style={[styles.savingsBadgeText, { color: theme.colors.income }]}>
                  Hemat {summary.metrics.savingsRate}%
                </Text>
              </View>
            </View>

            <Text style={[styles.heroBalance, { color: theme.colors.text }]}>
              {ApiService.formatRupiah(summary.metrics.totalBalance)}
            </Text>

            {/* 3-Column Summary Pill (Income, Expense, Wallets) */}
            <View style={[styles.summaryPillsRow, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <View style={styles.summaryPillCol}>
                <Text style={[styles.pillLabel, { color: theme.colors.textMuted }]}>Pemasukan</Text>
                <Text style={[styles.pillVal, { color: theme.colors.income }]}>
                  +{ApiService.formatRupiah(summary.metrics.totalIncome)}
                </Text>
              </View>
              <View style={[styles.pillDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.summaryPillCol}>
                <Text style={[styles.pillLabel, { color: theme.colors.textMuted }]}>Pengeluaran</Text>
                <Text style={[styles.pillVal, { color: theme.colors.expense }]}>
                  -{ApiService.formatRupiah(summary.metrics.totalExpense)}
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={[styles.heroActionsRow, { borderTopColor: theme.colors.border }]}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setAddTxVisible(true)}
                style={[styles.primaryActionBtn, { backgroundColor: theme.colors.primary }]}
              >
                <Ionicons name="add" size={18} color={theme.colors.primaryForeground} />
                <Text style={[styles.primaryActionText, { color: theme.colors.primaryForeground }]}>
                  Catat Transaksi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => openTransfer()}
                style={[styles.secondaryActionBtn, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              >
                <Ionicons name="swap-horizontal" size={16} color={theme.colors.text} />
                <Text style={[styles.secondaryActionText, { color: theme.colors.text }]}>
                  Transfer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* STATS ROW */}
        <View style={styles.statsRow}>
          <StatGlassCard
            title="Total Pemasukan"
            amount={summary.metrics.totalIncome}
            type="income"
            iconName="arrow-down"
          />
          <View style={{ width: 10 }} />
          <StatGlassCard
            title="Total Pengeluaran"
            amount={summary.metrics.totalExpense}
            type="expense"
            iconName="arrow-up"
          />
        </View>

        {/* WALLETS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dompet Saya</Text>
          <TouchableOpacity onPress={() => onNavigateTab('wallets')}>
            <Text style={[styles.sectionLink, { color: theme.colors.textSecondary }]}>
              Lihat Semua ({summary.wallets.length})
            </Text>
          </TouchableOpacity>
        </View>

        {summary.wallets.length === 0 ? (
          <GlassCard borderRadius={16} style={{ padding: 20, marginBottom: 18 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 14 }}>
              Belum ada dompet
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>
              Dompet awal Anda akan otomatis disiapkan saat mencatat mutasi.
            </Text>
          </GlassCard>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.walletsScroll}
          >
            {summary.wallets.map((wallet) => (
              <WalletGlassCard
                key={wallet.id}
                wallet={wallet}
                onTransfer={() => openTransfer(wallet.id)}
              />
            ))}
          </ScrollView>
        )}

        {/* EXPENSE CATEGORIES BREAKDOWN (MONEY+ CUTE STYLE) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pengeluaran per Kategori</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>Bulan Ini</Text>
        </View>

        <GlassCard borderRadius={18} style={styles.breakdownCard}>
          <View style={styles.breakdownInner}>
            {summary.categoryBreakdown.length === 0 ? (
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: 8 }}>
                Belum ada pengeluaran yang tercatat pada bulan ini.
              </Text>
            ) : (
              summary.categoryBreakdown.map((cat, idx) => {
                const cute = getCategoryCuteBadge(cat.categoryName, 'expense', theme)
                return (
                  <View key={cat.categoryId || idx} style={styles.catItem}>
                    <View style={styles.catTopRow}>
                      <View style={styles.catLeftInfo}>
                        <View style={[styles.cuteIconBox, { backgroundColor: cute.bg }]}>
                          <Ionicons name={cute.icon} size={15} color={cute.text} />
                        </View>
                        <Text style={[styles.catName, { color: theme.colors.text }]}>{cat.categoryName}</Text>
                      </View>
                      <Text style={[styles.catAmount, { color: theme.colors.text }]}>
                        {ApiService.formatRupiah(cat.totalAmount)}
                      </Text>
                    </View>

                    {/* Cute progress bar */}
                    <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceElevated }]}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            backgroundColor: cute.text,
                            width: `${Math.min(cat.percentage, 100)}%`,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.catBottomRow}>
                      <Text style={[styles.catPercentage, { color: theme.colors.textMuted }]}>
                        {cat.percentage}% dari total pengeluaran
                      </Text>
                    </View>
                  </View>
                )
              })
            )}
          </View>
        </GlassCard>

        {/* PRO TEASER BANNER (IF FREE USER) */}
        {!isPro && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setUpgradeModalVisible(true)}
            style={{ marginBottom: 16 }}
          >
            <GlassCard
              borderRadius={18}
              style={[
                styles.dashProCard,
                {
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#fde68a',
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb',
                },
              ]}
            >
              <View style={styles.dashProInner}>
                <View style={[styles.dashProIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7' }]}>
                  <Ionicons name="sparkles" size={18} color="#d97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dashProTitle, { color: theme.colors.text }]}>
                    Upgrade ke Dompetku PRO 👑
                  </Text>
                  <Text style={[styles.dashProDesc, { color: theme.colors.textSecondary }]}>
                    Buka target tabungan impian, pengingat tagihan rutin, & rekening tak terbatas.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}

        {/* RECENT TRANSACTIONS (CUTE ICON ROWS) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Riwayat Transaksi</Text>
          <TouchableOpacity onPress={() => onNavigateTab('transactions')}>
            <Text style={[styles.sectionLink, { color: theme.colors.textSecondary }]}>Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txList}>
          {summary.recentTransactions.length === 0 ? (
            <GlassCard borderRadius={16} style={{ padding: 24, alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={32} color={theme.colors.textMuted} />
              <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 14, marginTop: 8 }}>
                Belum ada transaksi
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                Tekan tombol Catat Transaksi untuk mulai mencatat keuangan Anda
              </Text>
            </GlassCard>
          ) : (
            summary.recentTransactions.slice(0, 5).map((tx) => {
              const cute = getCategoryCuteBadge(tx.categoryName, tx.type, theme)
              return (
                <GlassCard
                  key={tx.id}
                  borderRadius={14}
                  style={styles.txCard}
                >
                  <View style={styles.txInner}>
                    {/* Cute Category Icon Badge */}
                    <View style={[styles.txCuteBadge, { backgroundColor: cute.bg }]}>
                      <Ionicons name={cute.icon} size={18} color={cute.text} />
                    </View>

                    <View style={styles.txMiddle}>
                      <Text style={[styles.txDesc, { color: theme.colors.text }]} numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <View style={styles.txMetaRow}>
                        <View style={[styles.miniBadge, { backgroundColor: cute.bg }]}>
                          <Text style={[styles.miniBadgeText, { color: cute.text }]}>
                            {tx.categoryName || (tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                          </Text>
                        </View>
                        <Text style={[styles.dotSep, { color: theme.colors.textMuted }]}>•</Text>
                        <Text style={[styles.txDate, { color: theme.colors.textMuted }]}>{tx.date}</Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.txAmount,
                        {
                          color: tx.type === 'income' ? theme.colors.income : theme.colors.expense,
                        },
                      ]}
                    >
                      {tx.type === 'income' ? '+' : '-'} {ApiService.formatRupiah(tx.amount)}
                    </Text>
                  </View>
                </GlassCard>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <AddTransactionModal
        visible={addTxVisible}
        onClose={() => setAddTxVisible(false)}
        wallets={summary.wallets}
        onSuccess={onRefresh}
      />

      <TransferModal
        visible={transferVisible}
        onClose={() => setTransferVisible(false)}
        wallets={summary.wallets}
        defaultFromWalletId={transferFromWalletId}
        onSuccess={onRefresh}
      />

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        visible={upgradeModalVisible}
        onClose={() => setUpgradeModalVisible(false)}
        onSuccess={onRefresh}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    marginBottom: 14,
  },
  heroInner: {
    padding: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  heroBalance: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  summaryPillsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  summaryPillCol: {
    flex: 1,
  },
  pillDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  pillVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  primaryActionBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  walletsScroll: {
    paddingBottom: 18,
  },
  breakdownCard: {
    marginBottom: 18,
  },
  breakdownInner: {
    padding: 16,
    gap: 12,
  },
  catItem: {
    gap: 5,
  },
  catTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cuteIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  catBottomRow: {
    alignItems: 'flex-end',
  },
  catPercentage: {
    fontSize: 10,
    fontWeight: '500',
  },
  txList: {
    gap: 6,
  },
  txCard: {
    overflow: 'hidden',
  },
  txInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  txCuteBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  txMiddle: {
    flex: 1,
    marginRight: 8,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  txMeta: {
    fontSize: 11,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerPlanTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  headerPlanText: {
    fontSize: 10,
    fontWeight: '800',
  },
  dashProCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  dashProInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  dashProIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashProTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  dashProDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  dotSep: {
    fontSize: 8,
  },
  txDate: {
    fontSize: 10,
  },
})
