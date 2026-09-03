import { afterEach, describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import {
  artificialDateValues,
  artificialHeaders,
  createAndFillPdfs,
  fieldPlacements,
  filenameHeaders,
  getHeaderValue,
  getPdfCoordinates,
  makePdfFilename,
  processFieldDrop,
  removeField,
  validateOutputFilenames,
} from '../component/filePreviewer/filePreviewer'
import {
  excelData,
  excelFile,
  parsePDF,
  parseSpreadsheet,
  pdfBuffer,
  pdfData,
  pdfFile,
} from '../component/fileUploader/fileUploader'

afterEach(() => {
  fieldPlacements.value = []
  filenameHeaders.value = []
  excelData.value = undefined
  pdfData.value = undefined
  pdfBuffer.value = null
  excelFile.value = undefined
  pdfFile.value = undefined
  vi.restoreAllMocks()
})

describe('file parsing', () => {
  it('reads headers and rows from the first worksheet', async () => {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Name', 'Amount'],
      ['Alice', 12],
    ])
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    const bytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })

    await expect(parseSpreadsheet(new File([bytes], 'data.xlsx'))).resolves.toEqual({
      headers: ['Name', 'Amount'],
      jsonData: [{ Name: 'Alice', Amount: 12 }],
    })
  })

  it('reads PDF metadata and stores an independent buffer', async () => {
    const document = await PDFDocument.create()
    document.addPage([300, 400])
    const bytes = await document.save()

    const result = await parsePDF(
      new File([new Uint8Array(bytes).buffer as ArrayBuffer], 'template.pdf', {
        type: 'application/pdf',
      }),
    )

    expect(result.pageCount).toBe(1)
    expect(result.dimensions).toEqual({ width: 300, height: 400 })
    expect(result.fields).toEqual([])
    expect(pdfBuffer.value).toEqual(result.buffer)
  })
})

describe('field placement', () => {
  it('converts drop coordinates and stores one placement per header', async () => {
    const pdfDocument = await PDFDocument.create()
    pdfDocument.addPage([600, 800])
    pdfData.value = {
      pdfDoc: pdfDocument,
      buffer: new Uint8Array(await pdfDocument.save()),
      pageCount: 1,
      fields: [],
      dimensions: { width: 600, height: 800 },
    }

    const target = window.document.createElement('div')
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
      width: 300,
      height: 400,
      right: 400,
      bottom: 450,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    })
    const event = {
      currentTarget: target,
      clientX: 250,
      clientY: 250,
      preventDefault: vi.fn(),
      dataTransfer: { getData: () => 'Name' },
    } as unknown as DragEvent

    expect(getPdfCoordinates(event)).toEqual({ width: 300, height: 400 })
    await processFieldDrop(event)
    await processFieldDrop(event)

    expect(fieldPlacements.value).toEqual([
      { fieldName: 'Name', page: 1, x: 300, y: 380, width: 150, height: 20 },
    ])
  })

  it('removes a placement', () => {
    fieldPlacements.value = [{ fieldName: 'Name', page: 1, x: 10, y: 20, width: 150, height: 20 }]

    removeField('Name')

    expect(fieldPlacements.value).toEqual([])
  })
})

describe('artificial dates and filenames', () => {
  it('provides four current-date header values', () => {
    const values = artificialDateValues()

    expect(artificialHeaders).toHaveLength(4)
    expect(Object.keys(values)).toEqual(artificialHeaders)
    expect(values[artificialHeaders[0]!]).toMatch(/\d{4}/)
    expect(values[artificialHeaders[1]!]).toMatch(/\d{4}/)
    expect(values[artificialHeaders[2]!]).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    expect(values[artificialHeaders[3]!]).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
  })

  it('resolves spreadsheet and artificial header values', () => {
    const row = { Name: 'Alice' }

    expect(getHeaderValue(row, 'Name')).toBe('Alice')
    expect(getHeaderValue(row, artificialHeaders[0]!)).toBe(
      artificialDateValues()[artificialHeaders[0]!],
    )
  })

  it('joins and sanitizes selected row values', () => {
    expect(makePdfFilename({ Name: 'Alice / Smith', Invoice: 'A:12' }, ['Name', 'Invoice'])).toBe(
      'Alice - Smith_A-12',
    )
  })

  it('reports blank and duplicate output filenames', () => {
    expect(validateOutputFilenames(['Alice', 'Bob'])).toBeUndefined()
    expect(validateOutputFilenames(['Alice', ''])).toContain('blank')
    expect(validateOutputFilenames(['Alice', 'alice'])).toContain('Duplicate')
  })
})

describe('PDF export', () => {
  it('creates a named ZIP containing flattened PDFs', async () => {
    const pdfDocument = await PDFDocument.create()
    pdfDocument.addPage([300, 400])
    const originalBytes = new Uint8Array(await pdfDocument.save())
    pdfData.value = {
      pdfDoc: pdfDocument,
      buffer: originalBytes,
      pageCount: 1,
      fields: [],
      dimensions: { width: 300, height: 400 },
    }
    excelData.value = { headers: ['Name'], jsonData: [{ Name: 'Alice' }] }
    filenameHeaders.value = ['Name']
    fieldPlacements.value = [
      {
        fieldName: 'Name',
        page: 1,
        x: 10,
        y: 20,
        width: 150,
        height: 20,
      },
    ]

    let downloadedZip: Blob | undefined
    vi.spyOn(URL, 'createObjectURL').mockImplementation((value) => {
      downloadedZip = value as Blob
      return 'blob:test'
    })
    const click = vi.fn()
    vi.spyOn(window.document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement)

    await createAndFillPdfs()

    expect(click).toHaveBeenCalledOnce()
    const archive = await JSZip.loadAsync(await downloadedZip!.arrayBuffer())
    expect(Object.keys(archive.files)).toEqual(['Alice.pdf'])
    const output = await archive.file('Alice.pdf')!.async('uint8array')
    const outputDocument = await PDFDocument.load(output)
    expect(outputDocument.getForm().getFields()).toHaveLength(0)
  })
})
