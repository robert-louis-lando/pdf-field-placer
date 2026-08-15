import { ref } from 'vue'
import { triggerErrorSnackbar } from '../snackBar/snackBar'
import * as XLSX from 'xlsx'
import { PDFDocument } from 'pdf-lib'
import router from '@/router'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ExcelData<T = Record<string, any>> {
  jsonData: T[]
  headers: string[]
}
export interface PageSize {
  width: number
  height: number
}
export interface PDFData {
  pdfDoc: PDFDocument
  buffer: ArrayBuffer
  pageCount: number
  fields: string[]
  dimensions: PageSize
}

export const excelFile = ref()
export const pdfFile = ref()
export const excelData = ref<ExcelData>()
export const pdfData = ref<PDFData>()
const excelTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
const pdfTypes = ['application/pdf']
export async function processFiles() {
  if (!validateFiles()) return
  excelData.value = await parseSpreadsheet(excelFile.value)
  pdfData.value = await parsePDF(pdfFile.value)
  await router.push('/pdf-preview')
}
function validateFiles() {
  if (!excelFile.value) {
    triggerErrorSnackbar('Excel file upload required')
    return false
  }
  if (!excelTypes.includes(excelFile.value.type)) {
    triggerErrorSnackbar('Excel file upload required. Uploaded wrong file type')
    return false
  }

  if (!pdfFile.value) {
    triggerErrorSnackbar('PDF file upload required')
    return false
  }
  if (!pdfTypes.includes(pdfFile.value.type)) {
    triggerErrorSnackbar('PDF file upload required .Uploaded wrong file type')
    return false
  }
  return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function parsePDF(file: File): Promise<PDFData> {
  // 1. Await the arrayBuffer promise
  const buffer = await file.arrayBuffer()

  // 2. Load the PDF document
  const pdfDoc = await PDFDocument.load(buffer)

  // 3. Extract key details
  const pageCount = pdfDoc.getPageCount()
  const dimensions: PageSize = pdfDoc.getPages().map((page) => page.getSize())[0] ?? {
    width: 0,
    height: 0,
  }
  const form = pdfDoc.getForm()
  const fields = form.getFields().map((field) => field.getName())

  return {
    pdfDoc,
    buffer,
    pageCount,
    fields,
    dimensions,
  }
}
