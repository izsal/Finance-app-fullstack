import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useAppTheme } from '../theme/ThemeContext'

interface Props {
  children: React.ReactNode
}

export const LiquidBackground: React.FC<Props> = ({ children }) => {
  const { theme } = useAppTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})
