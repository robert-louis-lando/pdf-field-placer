import { computed, ref } from 'vue'
import { excelData, pdfData, type PageSize } from '../fileUploader/fileUploader.ts'
import { PDFDocument, rgb } from 'pdf-lib'
import JSZip from 'jszip'

export const pdfDimensions = computed(() => pdfData.value?.dimensions)
export const page = ref(1)
export interface FieldPlacement {
  fieldName: string
  page: number
  x: number
  y: number
  width: number
  height: number
}

export const fieldPlacements = ref<FieldPlacement[]>([])
let movingField: FieldPlacement | undefined

export function getPdfCoordinates(event: DragEvent | MouseEvent): PageSize {
  const target = event.currentTarget as HTMLElement | null
  if (!target) throw new Error('no target')

  const rect = target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top

  const viewPortRatioX = clickX / rect.width
  const viewPortRatioY = clickY / rect.height

  if (!pdfDimensions.value) throw new Error('No PDF dimensions')

  return {
    width: Math.round(viewPortRatioX * pdfDimensions.value.width),
    height: Math.round(viewPortRatioY * pdfDimensions.value.height),
  }
}

export function allowFieldDrop(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
}

export async function processFieldDrop(event: DragEvent) {
  event.preventDefault()
  const fieldName = event.dataTransfer?.getData('text/plain')
  if (!fieldName || !pdfData.value || fieldPlacements.value.some((field) => field.fieldName === fieldName)) {
    return
  }

  const position = getPdfCoordinates(event)
  const dimensions = pdfDimensions.value
  if (!dimensions) return

  const width = Math.min(150, dimensions.width - position.width)
  const height = 20
  const placement: FieldPlacement = {
    fieldName,
    page: page.value,
    x: position.width,
    y: Math.max(0, dimensions.height - position.height - height),
    width,
    height,
  }
  fieldPlacements.value.push(placement)
}

export function removeField(fieldName: string) {
  fieldPlacements.value = fieldPlacements.value.filter((field) => field.fieldName !== fieldName)
}

export function startFieldMove(field: FieldPlacement, event: PointerEvent) {
  event.preventDefault()
  event.stopPropagation()
  movingField = field
  const fieldElement = event.currentTarget as HTMLElement

  const move = (moveEvent: PointerEvent) => {
    if (!movingField || !pdfDimensions.value) return
    const wrapper = fieldElement.parentElement
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const x = ((moveEvent.clientX - rect.left) / rect.width) * pdfDimensions.value.width
    const top = ((moveEvent.clientY - rect.top) / rect.height) * pdfDimensions.value.height
    movingField.x = Math.max(0, Math.min(pdfDimensions.value.width - movingField.width, Math.round(x)))
    movingField.y = Math.max(
      0,
      Math.min(pdfDimensions.value.height - movingField.height, Math.round(pdfDimensions.value.height - top - movingField.height)),
    )
  }

  const stop = async () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', stop)
    movingField = undefined
  }

  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', stop, { once: true })
}

export async function createAndFillPdfs() {
  if (!pdfData.value?.buffer || !fieldPlacements.value.length) return

  const rows = excelData.value?.jsonData
  if (!rows?.length) return

  const zip = new JSZip()
  for (const [index, row] of rows.entries()) {
    const pdfDoc = await PDFDocument.load(new Uint8Array(pdfData.value.buffer))
    const form = pdfDoc.getForm()
    for (const placement of fieldPlacements.value) {
      const pdfPage = pdfDoc.getPage(Math.max(0, placement.page - 1))
      const textField = form.createTextField(placement.fieldName)
      textField.addToPage(pdfPage, {
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        borderWidth: 0,
        borderColor: undefined,
        backgroundColor: rgb(1, 1, 1),
      })
      const value = row[placement.fieldName as keyof typeof row]
      textField.setText(value == null ? '' : String(value))
    }
    form.flatten()
    zip.file(`filled-${index + 1}.pdf`, await pdfDoc.save())
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'filled-pdfs.zip'
  link.click()
  URL.revokeObjectURL(url)
}
