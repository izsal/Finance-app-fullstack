import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { GlassCard } from './GlassCard'
import { Ionicons } from '@expo/vector-icons'
import { ApiService } from '../services/api'
import { useAppTheme } from '../theme/ThemeContext'

interface Props {
  title: string
  amount: number
  type?: 'income' | 'expense' | 'savings' | 'neutral'
  badge?: string
  iconName: keyof typeof Ionicons.glyphMap
}

export const StatGlassCard: React.FC<Props> = ({
  title,
  amount,
  type = 'neutral',
  badge,
  iconName,
}) => {
  const { theme } = useAppTheme()

  const getColor = () => {
    switch (type) {
      case 'income':
        return {
          text: theme.colors.income,
          bg: theme.colors.incomeBg,
        }
      case 'expense':
        return {
          text: theme.colors.expense,
          bg: theme.colors.expenseBg,
        }
      case 'savings':
        return {
          text: theme.colors.primary,
          bg: theme.colors.surfaceElevated,
        }
      default:
        return {
          text: theme.colors.text,
          bg: theme.colors.badgeBg,
        }
    }
  }

  const c = getColor()

  return (
    <GlassCard borderRadius={16} style={styles.card}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: c.bg }]}>
            <Ionicons name={iconName} size={16} color={c.text} />
          </View>
          {badge && (
            <View style={[styles.badge, { backgroundColor: c.bg }]}>
              <Text style={[styles.badgeText, { color: c.text }]}>{badge}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: theme.colors.textMuted }]}>{title}</Text>
        <Text style={[styles.amount, { color: type === 'neutral' ? theme.colors.text : c.text }]}>
          {ApiService.formatRupiah(amount)}
        </Text>
      </View>
    </GlassCard>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  content: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 3,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
})
