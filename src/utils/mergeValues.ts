const frenchDateWordsHeader = 'Date FR - mots et chiffres'
const englishDateWordsHeader = 'Date EN - words and numbers'
const frenchDateNumbersHeader = 'Date FR - chiffres'
const englishDateNumbersHeader = 'Date EN - numbers'

export const artificialHeaders = [
  frenchDateWordsHeader,
  englishDateWordsHeader,
  frenchDateNumbersHeader,
  englishDateNumbersHeader,
]

export function artificialDateValues(): Record<string, string> {
  const today = new Date()
  return {
    [frenchDateWordsHeader]: new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(today),
    [englishDateWordsHeader]: new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(today),
    [frenchDateNumbersHeader]: new Intl.DateTimeFormat('fr-FR').format(today),
    [englishDateNumbersHeader]: new Intl.DateTimeFormat('en-US').format(today),
  }
}

export function getHeaderValue(row: Record<string, unknown>, header: string) {
  const dateValues = artificialDateValues()
  return dateValues[header] ?? row[header]
}

export function makeOutputFilename(row: Record<string, unknown>, headers: string[]) {
  return headers
    .map((header) => String(getHeaderValue(row, header) ?? '').trim())
    .join('_')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

export function validateOutputFilenames(filenames: string[]) {
  if (filenames.some((filename) => !filename)) {
    return 'A selected filename header is blank for at least one row.'
  }

  const duplicateFilename = filenames.find(
    (filename, index) =>
      filenames.findIndex((candidate) => candidate.toLowerCase() === filename.toLowerCase()) !==
      index,
  )
  return duplicateFilename
    ? `Duplicate output filename "${duplicateFilename}". Choose different headers.`
    : undefined
}
