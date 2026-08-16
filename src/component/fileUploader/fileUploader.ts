import { ref, shallowRef } from 'vue'
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
  buffer: Uint8Array
  pageCount: number
  fields: string[]
  dimensions: PageSize
}

export const excelFile = ref<File>()
export const pdfFile = ref<File>()
export const excelData = ref<ExcelData>()
export const pdfData = ref<PDFData>()
export const pdfBuffer = shallowRef<Uint8Array | null>(null)
const excelTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
const pdfTypes = ['application/pdf']

// Store Uint8Array instead of raw ArrayBuffer

export async function processFiles() {
  if (!validateFiles()) return
  excelData.value = await parseSpreadsheet(excelFile.value!)
  pdfData.value = await parsePDF(pdfFile.value!)
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
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    return { jsonData: [], headers: [] }
  }

  const worksheet = workbook.Sheets[firstSheetName]
  const rawRows = XLSX.utils.sheet_to_json<string[]>(worksheet ?? {}, { header: 1 })
  const headers: string[] = (rawRows[0] as string[]) || []

  const jsonData = XLSX.utils.sheet_to_json<T>(worksheet ?? {}, {
    defval: '',
  })

  return { jsonData, headers }
}

export async function parsePDF(file: File): Promise<PDFData> {
  const arrayBuffer = await file.arrayBuffer()

  // Create an independent Uint8Array
  const bytes = new Uint8Array(arrayBuffer)
  pdfBuffer.value = bytes.slice(0)

  // Load using a cloned copy
  const pdfDoc = await PDFDocument.load(pdfBuffer.value.slice(0))

  const pageCount = pdfDoc.getPageCount()
  const dimensions: PageSize = pdfDoc.getPages().map((page) => page.getSize())[0] ?? {
    width: 0,
    height: 0,
  }
  const form = pdfDoc.getForm()
  const fields = form.getFields().map((field) => field.getName())

  return {
    pdfDoc,
    buffer: pdfBuffer.value,
    pageCount,
    fields,
    dimensions,
  }
}
