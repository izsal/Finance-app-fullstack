import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppTheme } from '../theme/ThemeContext'

interface Props {
  title: string
  onPress: () => void
  icon?: keyof typeof Ionicons.glyphMap
  variant?: 'primary' | 'secondary' | 'glass' | 'danger'
  loading?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  size?: 'sm' | 'md' | 'lg'
}

export const GlassButton: React.FC<Props> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  size = 'md',
}) => {
  const { theme, isDark } = useAppTheme()

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primary,
          text: theme.colors.primaryForeground,
          border: 'transparent',
        }
      case 'secondary':
        return {
          bg: theme.colors.secondary,
          text: theme.colors.text,
          border: theme.colors.border,
        }
      case 'danger':
        return {
          bg: theme.colors.expense,
          text: '#ffffff',
          border: 'transparent',
        }
      case 'glass':
      default:
        return {
          bg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
          text: theme.colors.text,
          border: theme.colors.border,
        }
    }
  }

  const c = getColors()
  const height = size === 'sm' ? 36 : size === 'lg' ? 50 : 44
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 15 : 13

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          height,
          backgroundColor: c.bg,
          borderColor: c.border,
          borderWidth: c.border === 'transparent' ? 0 : 1,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={fontSize + 3} color={c.text} style={styles.icon} />}
          <Text style={[styles.title, { color: c.text, fontSize }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
})
