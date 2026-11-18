// Quantas letras trocadas ainda contam como "parecida" (D32)
const MAX_EDITS_FOR_SIMILAR = 3
const MIN_LETTERS_TO_COMPARE = 4

// Minúsculas e sem acento: "Senhá" e "senha" são iguais
function normalize(password: string): string {
  return password.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

function lettersOnly(password: string): string {
  return normalize(password).replace(/[^a-z]/g, "")
}

// Distância de Levenshtein: quantas trocas levam de a até b
function editDistance(a: string, b: string): number {
  let previousRow = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i++) {
    const currentRow = [i]
    for (let j = 1; j <= b.length; j++) {
      const substitution = (previousRow[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1)
      currentRow[j] = Math.min((previousRow[j] ?? 0) + 1, (currentRow[j - 1] ?? 0) + 1, substitution)
    }
    previousRow = currentRow
  }

  return previousRow[b.length] ?? 0
}

/**
 * Parecida: até 3 trocas de caractere, ou as mesmas letras
 * com números e símbolos diferentes ("Kabana@2025" → "Kabana#2026").
 */
export function isSimilarPassword(previous: string, next: string): boolean {
  if (editDistance(normalize(previous), normalize(next)) <= MAX_EDITS_FOR_SIMILAR) {
    return true
  }

  const previousLetters = lettersOnly(previous)
  const nextLetters = lettersOnly(next)
  if (previousLetters.length < MIN_LETTERS_TO_COMPARE || nextLetters.length < MIN_LETTERS_TO_COMPARE) {
    return false
  }

  return previousLetters.includes(nextLetters) || nextLetters.includes(previousLetters)
}
