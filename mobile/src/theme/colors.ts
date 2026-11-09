export const theme = {
  colors: {
    background: '#090d16',
    backgroundLight: '#f8fafc',
    surfaceDark: '#131a2a',
    surfaceLight: '#ffffff',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassBorderLight: '#e2e8f0',
    
    textPrimary: '#ffffff',
    textPrimaryLight: '#0f172a',
    textSecondary: '#94a3b8',
    textSecondaryLight: '#475569',
    textMuted: '#64748b',

    primary: '#0d9488',
    primaryLight: '#14b8a6',
    secondary: '#6366f1',
    income: '#10b981',
    expense: '#f43f5e',

    walletThemes: {
      bca: {
        gradientDark: ['#1e3a8a', '#172554'] as const,
        gradientLight: ['#2563eb', '#1d4ed8'] as const,
        accent: '#38bdf8',
        name: 'BCA Prioritas',
      },
      mandiri: {
        gradientDark: ['#0f766e', '#134e4a'] as const,
        gradientLight: ['#0d9488', '#0f766e'] as const,
        accent: '#2dd4bf',
        name: 'Mandiri Platinum',
      },
      gopay: {
        gradientDark: ['#0369a1', '#075985'] as const,
        gradientLight: ['#0284c7', '#0369a1'] as const,
        accent: '#60a5fa',
        name: 'GoPay Saldo',
      },
      cash: {
        gradientDark: ['#047857', '#064e3b'] as const,
        gradientLight: ['#059669', '#047857'] as const,
        accent: '#34d399',
        name: 'Dompet Tunai',
      },
      jago: {
        gradientDark: ['#6d28d9', '#4c1d95'] as const,
        gradientLight: ['#7c3aed', '#6d28d9'] as const,
        accent: '#c084fc',
        name: 'Bank Jago',
      },
    },
  },
}
