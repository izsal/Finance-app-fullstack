import { Platform, StyleSheet, ViewStyle } from 'react-native'

/**
 * 4pt / 8pt Grid Spacing System
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const

/**
 * Modern Curved Radii
 */
export const RADII = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  sheet: 24,
  full: 9999,
} as const

/**
 * Typography Scale & Line Heights (1.4 - 1.6 for comfortable reading)
 */
export const TYPOGRAPHY = {
  h1: {
    fontSize: 22,
    fontWeight: '800' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 15,
    fontWeight: '700' as const,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 19, // ~1.46 line-height
  },
  bodyMedium: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 19,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.6, // Positive letter-spacing for uppercase badges
  },
} as const

/**
 * Soft Elevation & Shadows
 */
export const SHADOWS = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  floatingCTA: {
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
} as const

/**
 * Quick Chip Amount Presets for Micro-UX
 */
export const AMOUNT_PRESETS = [
  { label: '+25rb', value: 25000 },
  { label: '+50rb', value: 50000 },
  { label: '+100rb', value: 100000 },
  { label: '+250rb', value: 250000 },
  { label: '+500rb', value: 500000 },
  { label: '+1jt', value: 1000000 },
] as const

/**
 * Common Layout Helpers (Bottom Sheet, Handle Bar, Sticky CTA)
 */
export const commonStyles = StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: RADII.sheet,
    borderTopRightRadius: RADII.sheet,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: '92%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: SPACING.sm,
  },
  stickyFooter: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.md,
    borderTopWidth: 1,
  },
  ctaReassuranceText: {
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
})
