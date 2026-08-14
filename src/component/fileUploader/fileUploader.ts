import { ref } from 'vue'
import { triggerErrorSnackbar } from '../snackBar/snackBar'

export const excelFile = ref()
export const pdfFile = ref()
const excelTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
const pdfTypes = ['application/pdf']
export function processFiles() {
  validateFiles()
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
