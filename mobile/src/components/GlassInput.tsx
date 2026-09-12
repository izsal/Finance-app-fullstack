import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppTheme } from '../theme/ThemeContext'

interface Props extends TextInputProps {
  label?: string
  icon?: keyof typeof Ionicons.glyphMap
  containerStyle?: StyleProp<ViewStyle>
  prefix?: string
}

export const GlassInput: React.FC<Props> = ({
  label,
  icon,
  containerStyle,
  prefix,
  ...props
}) => {
  const { theme, isDark } = useAppTheme()
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? theme.colors.inputBg : theme.colors.inputBg,
            borderColor: isFocused ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={isFocused ? theme.colors.primary : theme.colors.textMuted}
            style={styles.icon}
          />
        )}
        {prefix && <Text style={[styles.prefixText, { color: theme.colors.text }]}>{prefix}</Text>}
        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { color: theme.colors.text }]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
  },
  icon: {
    marginRight: 10,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
})
