/**
 * Парсер веса/объёма товара из строки `product.weight`.
 * Понимает: «1 кг», «1.5 кг», «500 г», «1 л», «500 мл», «10 шт», «1 кг · свежие».
 *
 * Возвращает граммы (для веса/объёма; 1 л = 1000 г) либо null если штучный/нераспознанный.
 */
export function parseWeightToGrams(weight: string): number | null {
  if (!weight) return null
  // Берём первый сегмент до разделителя
  const seg = weight.split(/[·,;|]/)[0].trim().toLowerCase().replace(',', '.')
  // штучные — не вес
  if (/\bшт\.?\b/.test(seg)) return null
  const m = seg.match(/^([0-9]+(?:\.[0-9]+)?)\s*(кг|г|л|мл)\b/i)
  if (!m) return null
  const value = parseFloat(m[1])
  if (!isFinite(value) || value <= 0) return null
  switch (m[2].toLowerCase()) {
    case 'кг': return value * 1000
    case 'г':  return value
    case 'л':  return value * 1000   // 1 л ≈ 1 кг
    case 'мл': return value          // 1 мл ≈ 1 г
    default:   return null
  }
}

/** Признак «штучного» товара. */
export function parsePieceCount(weight: string): number | null {
  if (!weight) return null
  const seg = weight.split(/[·,;|]/)[0].trim().toLowerCase().replace(',', '.')
  const m = seg.match(/^([0-9]+(?:\.[0-9]+)?)\s*шт\.?/i)
  if (!m) return null
  const value = parseFloat(m[1])
  return isFinite(value) && value > 0 ? value : null
}

/** Форматирует общий вес/штук для hero-карточки корзины. */
export function formatTotalWeight(items: Array<{ weight: string; qty: number }>): string {
  let totalGrams = 0
  let totalPieces = 0
  for (const it of items) {
    const g = parseWeightToGrams(it.weight)
    if (g != null) {
      totalGrams += g * it.qty
      continue
    }
    const p = parsePieceCount(it.weight)
    if (p != null) {
      totalPieces += p * it.qty
    } else {
      // нераспознан — считаем как 1 шт
      totalPieces += it.qty
    }
  }
  const parts: string[] = []
  if (totalGrams > 0) {
    if (totalGrams >= 1000) parts.push(`${(totalGrams / 1000).toFixed(1).replace(/\.0$/, '')} кг`)
    else parts.push(`${Math.round(totalGrams)} г`)
  }
  if (totalPieces > 0) {
    parts.push(`${totalPieces} шт`)
  }
  return parts.length > 0 ? parts.join(' + ') : '—'
}
