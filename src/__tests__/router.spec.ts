import { afterEach, describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import router from '../router'
import { excelData, pdfData } from '../component/fileUploader/fileUploader'

afterEach(async () => {
  excelData.value = undefined
  pdfData.value = undefined
  await router.push('/')
})

describe('PDF preview route guard', () => {
  it('redirects to the uploader when parsed file state is missing', async () => {
    await router.push('/pdf-preview')

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('allows preview navigation when both parsed files exist', async () => {
    const pdfDocument = await PDFDocument.create()
    pdfDocument.addPage([300, 400])
    excelData.value = { headers: ['Name'], jsonData: [{ Name: 'Alice' }] }
    pdfData.value = {
      pdfDoc: pdfDocument,
      buffer: new Uint8Array(await pdfDocument.save()),
      pageCount: 1,
      fields: [],
      dimensions: { width: 300, height: 400 },
    }

    await router.push('/pdf-preview')

    expect(router.currentRoute.value.path).toBe('/pdf-preview')
  })
})
