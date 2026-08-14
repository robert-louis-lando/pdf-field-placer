import { ref } from 'vue'
import { triggerErrorSnackbar } from '../snackBar/snackBar'
import * as XLSX from 'xlsx'
export interface ExcelData<T = Record<string, any>> {
  jsonData: T[]
  headers: string[]
}

export const excelFile = ref()
export const pdfFile = ref()
export const excelData = ref({})
const excelTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
const pdfTypes = ['application/pdf']
export async function processFiles() {
  validateFiles()
  excelData.value = await parseSpreadsheet(excelFile.value)
}
function validateFiles() {
  if (!excelFile.value) {
    triggerErrorSnackbar('Excel file upload required')
    return
  }
  if (!excelTypes.includes(excelFile.value.type)) {
    triggerErrorSnackbar('Excel file upload required. Uploaded wrong file type')
    return
  }

  if (!pdfFile.value) {
    triggerErrorSnackbar('PDF file upload required')
    return
  }
  if (!pdfTypes.includes(pdfFile.value.type)) {
    triggerErrorSnackbar('PDF file upload required .Uploaded wrong file type')
    return
  }
}

export async function parseSpreadsheet<T = Record<string, any>>(file: File): Promise<ExcelData<T>> {
  // 1. Read file buffer
  const arrayBuffer = await file.arrayBuffer()

  // 2. Read workbook
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  // 3. Get first sheet safely
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    return { jsonData: [], headers: [] }
  }

  const worksheet = workbook.Sheets[firstSheetName]

  // 4. Extract headers (Row 1 as a string array)
  const rawRows = XLSX.utils.sheet_to_json<string[]>(worksheet ?? {}, { header: 1 })
  const headers: string[] = (rawRows[0] as string[]) || []

  // 5. Convert worksheet to Array of Objects (keyed by headers)
  const jsonData = XLSX.utils.sheet_to_json<T>(worksheet ?? {}, {
    defval: '', // Default value for empty cells
  })

  return { jsonData, headers }
}
