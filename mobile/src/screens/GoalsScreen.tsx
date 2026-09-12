import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { GlassCard } from '../components/GlassCard'
import { GoalDepositModal } from '../components/GoalDepositModal'
import { GoalModal } from '../components/GoalModal'
import { SubscriptionModal } from '../components/SubscriptionModal'
import { GoalItem, SubscriptionItem, WalletItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'
import { getCategoryCuteBadge } from '../utils/categoryHelper'
import { ProUpgradeModal } from '../components/ProUpgradeModal'

interface Props {
  goals: GoalItem[]
  subscriptions: SubscriptionItem[]
  wallets?: WalletItem[]
  onRefresh: () => Promise<void>
}

export const GoalsScreen: React.FC<Props> = ({
  goals,
  subscriptions,
  wallets = [],
  onRefresh,
}) => {
  const { theme, isDark } = useAppTheme()
  const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null)
  const [payingSubId, setPayingSubId] = useState<number | null>(null)
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false)
  const [goalModalVisible, setGoalModalVisible] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null)
  const [subModalVisible, setSubModalVisible] = useState(false)
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const currentUser = ApiService.getCurrentUser()
  const isPro = currentUser?.plan === 'pro'

  const handlePullRefresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  const handlePaySub = async (sub: SubscriptionItem) => {
    if (!isPro) {
      setUpgradeModalVisible(true)
      return
    }
    setPayingSubId(sub.id)
    try {
      const res = await ApiService.paySubscription(sub.id, sub.walletId)
      Alert.alert('Sukses', res.message)
      await onRefresh()
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Gagal membayar tagihan')
    } finally {
      setPayingSubId(null)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Target & Tagihan</Text>
        <Text style={[styles.pageSubtitle, { color: theme.colors.textSecondary }]}>
          Rencana tabungan masa depan dan tagihan berkala
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* FREE USER LOCKED BANNER */}
        {!isPro && (
          <GlassCard
            borderRadius={20}
            style={[
              styles.lockedBannerCard,
              {
                borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#fde68a',
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb',
              },
            ]}
          >
            <View style={styles.lockedBannerInner}>
              <View style={[styles.lockIconBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7' }]}>
                <Ionicons name="lock-closed" size={24} color="#d97706" />
              </View>
              <Text style={[styles.lockedBannerTitle, { color: theme.colors.text }]}>
                Fitur Eksklusif Dompetku PRO 👑
              </Text>
              <Text style={[styles.lockedBannerDesc, { color: theme.colors.textSecondary }]}>
                Target Impian & Pengingat Tagihan Rutin hanya dapat diakses penuh oleh member PRO sebagaimana di versi website.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setUpgradeModalVisible(true)}
                style={[styles.lockedUpgradeBtn, { backgroundColor: theme.colors.primary }]}
              >
                <Ionicons name="sparkles" size={15} color="#d97706" />
                <Text style={[styles.lockedUpgradeBtnText, { color: theme.colors.primaryForeground }]}>Buka Akses PRO 👑</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        {/* FINANCIAL GOALS SECTION */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="sparkles" size={17} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Target Tabungan Impian</Text>
            {!isPro && (
              <View style={[styles.miniProPill, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7' }]}>
                <Text style={styles.miniProText}>PRO 🔒</Text>
              </View>
            )}
          </View>

          <View style={styles.sectionRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (!isPro) {
                  setUpgradeModalVisible(true)
                  return
                }
                setEditingGoal(null)
                setGoalModalVisible(true)
              }}
              style={[styles.miniAddActionBtn, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
            >
              <Ionicons name="add" size={13} color={theme.colors.text} />
              <Text style={[styles.miniAddActionText, { color: theme.colors.text }]}>Tambah</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionBadge, { color: theme.colors.textSecondary, backgroundColor: theme.colors.badgeBg }]}>
              {goals.length}
            </Text>
          </View>
        </View>

        <View style={styles.goalList}>
          {goals.length === 0 ? (
            <GlassCard borderRadius={18} style={{ padding: 24, alignItems: 'center' }}>
              <Ionicons name="flag-outline" size={36} color={theme.colors.textMuted} />
              <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 14, marginTop: 8 }}>
                Belum Ada Target Impian
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                Tekan tombol Tambah di atas untuk membuat rencana tabungan impian Anda.
              </Text>
            </GlassCard>
          ) : (
            goals.map((goal) => {
              const percentage = Math.min(
                100,
                Math.round((goal.currentAmount / goal.targetAmount) * 100)
              )

              return (
                <GlassCard
                  key={goal.id}
                  borderRadius={18}
                  style={styles.goalCard}
                >
                  <View style={styles.goalInner}>
                    <View style={styles.goalTopRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.goalName, { color: theme.colors.text }]}>{goal.name}</Text>
                        <Text style={[styles.goalDate, { color: theme.colors.textMuted }]}>
                          Deadline: {goal.targetDate}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.percentBadge, { backgroundColor: theme.colors.incomeBg }]}>
                          <Text style={[styles.percentText, { color: theme.colors.income }]}>{percentage}%</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            if (!isPro) {
                              setUpgradeModalVisible(true)
                              return
                            }
                            setEditingGoal(goal)
                            setGoalModalVisible(true)
                          }}
                          style={[styles.cardEditIconBtn, { backgroundColor: theme.colors.surfaceElevated }]}
                        >
                          <Ionicons name="pencil" size={13} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Minimal Progress Bar */}
                    <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
                      <LinearGradient
                        colors={['#0d9488', '#14b8a6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBar, { width: `${percentage}%` }]}
                      />
                    </View>

                    <View style={styles.goalBottomRow}>
                      <View>
                        <Text style={[styles.savedLabel, { color: theme.colors.textMuted }]}>Terkumpul</Text>
                        <Text style={[styles.savedAmount, { color: theme.colors.text }]}>
                          {ApiService.formatRupiah(goal.currentAmount)}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          if (!isPro) {
                            setUpgradeModalVisible(true)
                            return
                          }
                          setSelectedGoal(goal)
                        }}
                        style={[styles.depositBtn, { backgroundColor: theme.colors.primary }]}
                      >
                        <Ionicons name="add-circle" size={15} color={theme.colors.primaryForeground} />
                        <Text style={[styles.depositBtnText, { color: theme.colors.primaryForeground }]}>Setor</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassCard>
              )
            })
          )}
        </View>

        {/* SUBSCRIPTIONS & BILLS SECTION */}
        <View style={[styles.sectionHeader, { marginTop: 22 }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="receipt-outline" size={17} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tagihan & Langganan</Text>
            {!isPro && (
              <View style={[styles.miniProPill, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7' }]}>
                <Text style={styles.miniProText}>PRO 🔒</Text>
              </View>
            )}
          </View>

          <View style={styles.sectionRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (!isPro) {
                  setUpgradeModalVisible(true)
                  return
                }
                setEditingSub(null)
                setSubModalVisible(true)
              }}
              style={[styles.miniAddActionBtn, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
            >
              <Ionicons name="add" size={13} color={theme.colors.text} />
              <Text style={[styles.miniAddActionText, { color: theme.colors.text }]}>Tambah</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionBadge, { color: theme.colors.textSecondary, backgroundColor: theme.colors.badgeBg }]}>
              {subscriptions.length}
            </Text>
          </View>
        </View>

        <View style={styles.subList}>
          {subscriptions.length === 0 ? (
            <GlassCard borderRadius={18} style={{ padding: 24, alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={36} color={theme.colors.textMuted} />
              <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 14, marginTop: 8 }}>
                Belum Ada Tagihan Rutin
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                Tekan tombol Tambah di atas untuk mencatat tagihan listrik, internet, atau langganan Anda.
              </Text>
            </GlassCard>
          ) : (
            subscriptions.map((sub) => {
              const badge = getCategoryCuteBadge(sub.name, 'expense', theme)
              return (
                <GlassCard
                  key={sub.id}
                  borderRadius={16}
                  style={styles.subCard}
                >
                  <View style={styles.subInner}>
                    <View
                      style={[
                        styles.subIconContainer,
                        {
                          backgroundColor: badge.bg,
                        },
                      ]}
                    >
                      <Ionicons name={badge.icon as any} size={18} color={badge.text} />
                    </View>

                    <View style={styles.subMiddle}>
                      <Text style={[styles.subName, { color: theme.colors.text }]}>{sub.name}</Text>
                      <Text style={[styles.subDue, { color: theme.colors.textMuted }]}>
                        Tempo setiap tgl {sub.dueDate}
                      </Text>
                    </View>

                    <View style={styles.subRight}>
                      <Text style={[styles.subAmount, { color: theme.colors.text }]}>
                        {ApiService.formatRupiah(sub.amount)}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <TouchableOpacity
                          onPress={() => {
                            if (!isPro) {
                              setUpgradeModalVisible(true)
                              return
                            }
                            setEditingSub(sub)
                            setSubModalVisible(true)
                          }}
                          style={[styles.subEditIconBtn, { backgroundColor: theme.colors.surfaceElevated }]}
                        >
                          <Ionicons name="pencil" size={13} color={theme.colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          disabled={payingSubId === sub.id}
                          onPress={() => handlePaySub(sub)}
                          style={[styles.payBtn, { backgroundColor: theme.colors.primary }]}
                        >
                          <Text style={[styles.payBtnText, { color: theme.colors.primaryForeground }]}>
                            {payingSubId === sub.id ? '...' : 'Bayar'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* Goal Deposit Modal */}
      <GoalDepositModal
        visible={!!selectedGoal}
        goal={selectedGoal}
        onClose={() => setSelectedGoal(null)}
        onSuccess={onRefresh}
      />

      {/* Goal Add/Edit Modal */}
      <GoalModal
        visible={goalModalVisible}
        goal={editingGoal}
        onClose={() => {
          setGoalModalVisible(false)
          setEditingGoal(null)
        }}
        onSuccess={onRefresh}
      />

      {/* Subscription Add/Edit Modal */}
      <SubscriptionModal
        visible={subModalVisible}
        subscription={editingSub}
        wallets={wallets}
        onClose={() => {
          setSubModalVisible(false)
          setEditingSub(null)
        }}
        onSuccess={onRefresh}
      />

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        visible={upgradeModalVisible}
        onClose={() => setUpgradeModalVisible(false)}
        onSuccess={onRefresh}
        featureName="Target & Tagihan PRO"
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
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  pageSubtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontWeight: '600',
  },
  goalList: {
    gap: 12,
  },
  goalCard: {
    overflow: 'hidden',
  },
  goalInner: {
    padding: 16,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  goalDate: {
    fontSize: 11,
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  percentText: {
    fontWeight: '700',
    fontSize: 11,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  goalBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedLabel: {
    fontSize: 11,
  },
  savedAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  depositBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  subList: {
    gap: 8,
  },
  subCard: {
    overflow: 'hidden',
  },
  subInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  subIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  subMiddle: {
    flex: 1,
  },
  subName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  subDue: {
    fontSize: 11,
  },
  subRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  subAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  payBtn: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  lockedBannerCard: {
    marginBottom: 16,
    borderWidth: 1,
  },
  lockedBannerInner: {
    padding: 16,
    alignItems: 'center',
    textAlign: 'center',
  },
  lockIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  lockedBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  lockedBannerDesc: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  lockedUpgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  lockedUpgradeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  miniProPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  miniProText: {
    color: '#d97706',
    fontSize: 9,
    fontWeight: '800',
  },
  sectionRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAddActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  miniAddActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardEditIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subEditIconBtn: {
    padding: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
