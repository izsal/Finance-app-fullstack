import { AppTheme } from '../theme/ThemeContext'
import { Ionicons } from '@expo/vector-icons'

export function getCategoryCuteBadge(
  categoryName: string = '',
  type: 'income' | 'expense' = 'expense',
  theme: AppTheme
): { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap } {
  const n = categoryName.toLowerCase()
  const cats = theme.colors.cuteCategories

  if (n.includes('makan') || n.includes('kuliner') || n.includes('food') || n.includes('kopi')) {
    return cats.food as any
  }
  if (n.includes('belanja') || n.includes('shop') || n.includes('mall')) {
    return cats.shopping as any
  }
  if (n.includes('trans') || n.includes('bensin') || n.includes('grab') || n.includes('gojek')) {
    return cats.transport as any
  }
  if (n.includes('gaji') || n.includes('income') || n.includes('pendapatan') || type === 'income') {
    return cats.salary as any
  }
  if (n.includes('tagihan') || n.includes('pln') || n.includes('listrik') || n.includes('wifi') || n.includes('bpjs')) {
    return cats.bills as any
  }
  if (n.includes('hiburan') || n.includes('game') || n.includes('nonton') || n.includes('hobi')) {
    return cats.entertainment as any
  }
  if (n.includes('invest') || n.includes('saham') || n.includes('reksa')) {
    return cats.investment as any
  }

  return cats.general as any
}
