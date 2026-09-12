import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { WalletItem } from '../services/mockData'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'

const { width } = Dimensions.get('window')
const CARD_WIDTH = Math.min(width * 0.8, 320)

interface Props {
  wallet: WalletItem
  onPress?: () => void
  onTransfer?: () => void
}

export const WalletGlassCard: React.FC<Props> = ({ wallet, onPress, onTransfer }) => {
  const { theme, isDark } = useAppTheme()

  const getWalletAccent = () => {
    const n = wallet.name.toLowerCase()
    if (n.includes('bca')) return { color: '#2563eb', bg: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff' }
    if (n.includes('mandiri')) return { color: '#0d9488', bg: isDark ? 'rgba(13,148,136,0.15)' : '#f0fdfa' }
    if (n.includes('gopay') || n.includes('ovo') || wallet.type.includes('wallet'))
      return { color: '#0284c7', bg: isDark ? 'rgba(2,132,199,0.15)' : '#f0f9ff' }
    if (n.includes('jago')) return { color: '#7c3aed', bg: isDark ? 'rgba(124,58,237,0.15)' : '#faf5ff' }
    return { color: '#16a34a', bg: isDark ? 'rgba(22,163,74,0.15)' : '#f0fdf4' }
  }

  const acc = getWalletAccent()

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.outerContainer}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          isDark ? styles.cardDark : styles.cardLight,
        ]}
      >
        {/* Top: Icon & Type pill */}
        <View style={styles.headerRow}>
          <View style={[styles.typeBadge, { backgroundColor: acc.bg }]}>
            <Ionicons
              name={wallet.type === 'Bank' ? 'business' : wallet.type === 'Tunai' || wallet.type === 'Cash' ? 'cash' : 'wallet'}
              size={13}
              color={acc.color}
            />
            <Text style={[styles.typeText, { color: acc.color }]}>
              {wallet.name}
            </Text>
          </View>
          <Text style={[styles.cardTypeLabel, { color: theme.colors.textMuted }]}>
            {wallet.type}
          </Text>
        </View>

        {/* Center: Balance */}
        <View style={styles.centerSection}>
          <Text style={[styles.balanceLabel, { color: theme.colors.textMuted }]}>
            Saldo Saat Ini
          </Text>
          <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
            {ApiService.formatRupiah(wallet.currentBalance)}
          </Text>
        </View>

        {/* Bottom row */}
        <View style={styles.footerRow}>
          <Text style={[styles.maskedNumber, { color: theme.colors.textMuted }]}>
            •••• {wallet.id.toString().padStart(4, '0')}
          </Text>

          {onTransfer && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onTransfer}
              style={[
                styles.transferBtn,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="swap-horizontal" size={13} color={theme.colors.text} />
              <Text style={[styles.transferBtnText, { color: theme.colors.text }]}>Transfer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  card: {
    height: 160,
    borderRadius: 18,
    padding: 18,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  cardDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  cardLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTypeLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  centerSection: {
    marginVertical: 6,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maskedNumber: {
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  transferBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
