import { computed, ref } from 'vue'
import { pdfBuffer, pdfData, type PageSize } from '../fileUploader/fileUploader.ts'
import { PDFDocument } from 'pdf-lib'

export const pdfDimensions = computed(() => pdfData.value?.dimensions)
export const page = ref(1)

export function getPdfCoordinates(event: MouseEvent): PageSize {
  const target = event.currentTarget as HTMLElement | null
  if (!target) throw new Error('no target')

  const rect = target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top

  const viewPortRatioX = clickX / rect.width
  const viewPortRatioY = clickY / rect.height

  if (!pdfDimensions.value) throw new Error('No PDF dimensions')

  const positionXFromTop_LeftOrigin = Math.round(viewPortRatioX * pdfDimensions.value.width)
  const positionYFromTop_LeftOrigin = Math.round(viewPortRatioY * pdfDimensions.value.height)

  const width = positionXFromTop_LeftOrigin
  const height = Math.round(pdfDimensions.value.height - positionYFromTop_LeftOrigin)
  return { width, height }
}

export async function processPdfClick(event: MouseEvent) {
  if (!pdfBuffer.value) return
  const result = await addFillableFieldToForm('test', getPdfCoordinates(event), page.value)
  console.log('PDF updated successfully, byte count:', result.length)
}

export async function addFillableFieldToForm(
  fieldName: string,
  dimensions: PageSize,
  currentPage: number,
): Promise<Uint8Array> {
  // Check if buffer exists and is not detached (byteLength > 0)
  if (!pdfBuffer.value || pdfBuffer.value.byteLength === 0) {
    throw new Error(
      'PDF buffer is detached or empty. Pass a cloned source to your PDF viewer component.',
    )
  }

  // Create a copy for pdf-lib to work with
  const bytesToLoad = new Uint8Array(pdfBuffer.value)
  const pdfDoc = await PDFDocument.load(bytesToLoad)

  const form = pdfDoc.getForm()
  const pageIndex = Math.max(0, currentPage - 1) // 0-indexed page lookup
  const pdfPage = pdfDoc.getPage(pageIndex)

  const textField = form.createTextField(fieldName)
  textField.addToPage(pdfPage, {
    x: dimensions.width,
    y: dimensions.height,
    width: 150,
    height: 20,
  })

  // Save modified bytes and update reactive state with a fresh buffer
  const updatedBytes = await pdfDoc.save()
  pdfBuffer.value = new Uint8Array(updatedBytes)

  return updatedBytes
}
