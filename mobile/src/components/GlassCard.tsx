import React from 'react'
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native'
import { useAppTheme } from '../theme/ThemeContext'

interface GlassCardProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  glowColor?: string
  gradientColors?: any
  intensity?: number
  borderRadius?: number
  noBorder?: boolean
  overflowHidden?: boolean
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  borderRadius = 18,
  noBorder = false,
  overflowHidden = true,
}) => {
  const { theme, isDark } = useAppTheme()

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius,
          backgroundColor: theme.colors.surface,
          borderColor: noBorder ? 'transparent' : theme.colors.border,
          borderWidth: noBorder ? 0 : 1,
          ...(overflowHidden ? { overflow: 'hidden' } : {}),
        },
        isDark ? styles.darkShadow : styles.lightShadow,
        style,
      ]}
    >
      <View style={styles.inner}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  darkShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  lightShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inner: {
    position: 'relative',
  },
})
