import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GlassCard } from '../components/GlassCard'
import { WalletGlassCard } from '../components/WalletGlassCard'
import { TransferModal } from '../components/TransferModal'
import { WalletModal } from '../components/WalletModal'
import { WalletItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'
import { ProUpgradeModal } from '../components/ProUpgradeModal'

interface Props {
  wallets: WalletItem[]
  onRefresh: () => Promise<void>
}

export const WalletsScreen: React.FC<Props> = ({ wallets, onRefresh }) => {
  const { theme, isDark } = useAppTheme()
  const [transferVisible, setTransferVisible] = useState(false)
  const [selectedWalletId, setSelectedWalletId] = useState<number>(1)
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false)
  const [walletModalVisible, setWalletModalVisible] = useState(false)
  const [editingWallet, setEditingWallet] = useState<WalletItem | null>(null)

  const currentUser = ApiService.getCurrentUser()
  const isPro = currentUser?.plan === 'pro'

  const handleAddWallet = () => {
    if (!isPro && wallets.length >= 2) {
      setUpgradeModalVisible(true)
      return
    }
    setEditingWallet(null)
    setWalletModalVisible(true)
  }

  const handleEditWallet = (w: WalletItem) => {
    setEditingWallet(w)
    setWalletModalVisible(true)
  }

  const openTransfer = (id: number) => {
    setSelectedWalletId(id)
    setTransferVisible(true)
  }

  const totalBalance = wallets.reduce((sum, w) => sum + w.currentBalance, 0)

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Dompet & Rekening</Text>
            <Text style={[styles.pageSubtitle, { color: theme.colors.textSecondary }]}>
              Ketuk kartu untuk mengedit atau menghapus rekening
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddWallet}
            style={[styles.addWalletBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Ionicons name="add" size={16} color={theme.colors.primaryForeground} />
            <Text style={[styles.addWalletBtnText, { color: theme.colors.primaryForeground }]}>Tambah</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Total Wallet Summary */}
        <GlassCard borderRadius={20} style={styles.summaryCard}>
          <View style={styles.summaryInner}>
            <View>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Total Aset Tersebar
              </Text>
              <Text style={[styles.summaryAmount, { color: theme.colors.text }]}>
                {ApiService.formatRupiah(totalBalance)}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openTransfer(wallets[0]?.id || 1)}
              style={[styles.transferActionBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Ionicons name="swap-horizontal" size={16} color={theme.colors.primaryForeground} />
              <Text style={[styles.transferActionText, { color: theme.colors.primaryForeground }]}>Transfer</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Card list */}
        <View style={styles.cardList}>
          {wallets.length === 0 ? (
            <GlassCard borderRadius={18} style={{ padding: 28, width: '100%', alignItems: 'center' }}>
              <Ionicons name="wallet-outline" size={38} color={theme.colors.textMuted} />
              <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 15, marginTop: 12 }}>
                Belum ada dompet
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                Tekan tombol Tambah di atas untuk membuat rekening bank atau dompet baru.
              </Text>
            </GlassCard>
          ) : (
            wallets.map((wallet) => (
              <View key={wallet.id} style={styles.walletItemWrap}>
                <WalletGlassCard
                  wallet={wallet}
                  onPress={() => handleEditWallet(wallet)}
                  onTransfer={() => openTransfer(wallet.id)}
                />

                {/* Stat details beneath each card */}
                <GlassCard
                  borderRadius={14}
                  style={styles.detailPill}
                >
                  <View style={styles.detailRow}>
                    <View style={styles.detailCol}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>
                        Total Masuk
                      </Text>
                      <Text style={[styles.detailVal, { color: theme.colors.income }]}>
                        +{ApiService.formatRupiah(wallet.totalIncome)}
                      </Text>
                    </View>
                    <View style={[styles.colDivider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.detailCol}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>
                        Total Keluar
                      </Text>
                      <Text style={[styles.detailVal, { color: theme.colors.expense }]}>
                        -{ApiService.formatRupiah(wallet.totalExpense)}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </View>
            ))
          )}
        </View>

        {/* Free plan wallet quota limit card */}
        {!isPro && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setUpgradeModalVisible(true)}
            style={{ marginTop: 14 }}
          >
            <GlassCard
              borderRadius={18}
              style={[
                styles.proLimitCard,
                {
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#fde68a',
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb',
                },
              ]}
            >
              <View style={styles.proLimitInner}>
                <View style={[styles.proLimitIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7' }]}>
                  <Ionicons name="sparkles" size={18} color="#d97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.proLimitTitle, { color: theme.colors.text }]}>
                    Kelola Rekening Tanpa Batas 👑
                  </Text>
                  <Text style={[styles.proLimitDesc, { color: theme.colors.textSecondary }]}>
                    Akun Free terbatas maks 2 rekening. Upgrade ke PRO untuk menambah rekening & e-wallet sepuasnya.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Transfer Modal */}
      <TransferModal
        visible={transferVisible}
        onClose={() => setTransferVisible(false)}
        wallets={wallets}
        defaultFromWalletId={selectedWalletId}
        onSuccess={onRefresh}
      />

      {/* Wallet Add/Edit Modal */}
      <WalletModal
        visible={walletModalVisible}
        wallet={editingWallet}
        onClose={() => {
          setWalletModalVisible(false)
          setEditingWallet(null)
        }}
        onSuccess={onRefresh}
      />

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        visible={upgradeModalVisible}
        onClose={() => setUpgradeModalVisible(false)}
        onSuccess={onRefresh}
        featureName="Multi-Rekening PRO"
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
    marginBottom: 8,
  },
  addWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addWalletBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  transferActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  transferActionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  cardList: {
    gap: 16,
    alignItems: 'center',
  },
  walletItemWrap: {
    alignItems: 'center',
    width: '100%',
  },
  detailPill: {
    width: '90%',
    marginTop: -8,
    zIndex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  detailCol: {
    flex: 1,
    alignItems: 'center',
  },
  colDivider: {
    width: 1,
    height: '80%',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  proLimitCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  proLimitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  proLimitIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proLimitTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  proLimitDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
})
