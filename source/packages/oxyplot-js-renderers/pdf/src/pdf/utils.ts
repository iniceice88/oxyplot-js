import { jsPDF } from 'jspdf'
import { newOxySize, OxyRectHelper, ScreenPoint_LeftTop } from 'oxyplot-js'

/**
 * get pdf size in 'px' unit
 * @param pdf
 */
export function calculatePdfClientArea(pdf: jsPDF) {
  const { width, height } = pdf.internal.pageSize
  // -1 to avoid generating a blank page
  const pdfPageSize = newOxySize(width - 1, height - 1)
  return OxyRectHelper.fromScreenPointAndSize(ScreenPoint_LeftTop, pdfPageSize)
}
