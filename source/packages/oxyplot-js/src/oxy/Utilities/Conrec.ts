/**
 * Renderer delegate
 */
export type ConrecRendererDelegate = (x1: number, y1: number, x2: number, y2: number, z: number) => void

/**
 * Provides functionality to create contours from a triangular mesh.
 */
export class Conrec {
  /**
   * Contour is a contouring subroutine for rectangularily spaced data
   * It emits calls to a line drawing subroutine supplied by the user
   * which draws a contour map corresponding to data on a randomly
   * spaced rectangular grid. The coordinates emitted are in the same
   * units given in the x() and y() arrays.
   * Any number of contour levels may be specified, but they must be
   * in order of increasing value.
   */
  static contour(d: number[][], x: number[], y: number[], z: number[], renderer: ConrecRendererDelegate): void {
    let x1 = 0.0
    let x2 = 0.0
    let y1 = 0.0
    let y2 = 0.0

    const h: number[] = new Array(5)
    const sh: number[] = new Array(5)
    const xh: number[] = new Array(5)
    const yh: number[] = new Array(5)

    const ilb = 0
    const iub = d.length - 1
    const jlb = 0
    const jub = d[0].length - 1
    const nc = z.length

    // The indexing of im and jm should be noted as it has to start from zero
    // unlike the fortran counter part
    const im = [0, 1, 1, 0]
    const jm = [0, 0, 1, 1]

    // Note that castab is arranged differently from the FORTRAN code because
    // Fortran and C/C++ arrays are transposed of each other, in this case
    // it is more tricky as castab is in 3 dimension
    const castab = [
      [
        [0, 0, 8],
        [0, 2, 5],
        [7, 6, 9],
      ],
      [
        [0, 3, 4],
        [1, 3, 1],
        [4, 3, 0],
      ],
      [
        [9, 6, 7],
        [5, 2, 0],
        [8, 0, 0],
      ],
    ]

    const xsect = (p1: number, p2: number) => (h[p2] * xh[p1] - h[p1] * xh[p2]) / (h[p2] - h[p1])
    const ysect = (p1: number, p2: number) => (h[p2] * yh[p1] - h[p1] * yh[p2]) / (h[p2] - h[p1])

    for (let j = jub - 1; j >= jlb; j--) {
      for (let i = ilb; i <= iub - 1; i++) {
        const temp1 = Math.min(d[i][j], d[i][j + 1])
        const temp2 = Math.min(d[i + 1][j], d[i + 1][j + 1])
        const dmin = Math.min(temp1, temp2)
        const temp3 = Math.max(d[i][j], d[i][j + 1])
        const temp4 = Math.max(d[i + 1][j], d[i + 1][j + 1])
        const dmax = Math.max(temp3, temp4)

        if (!(dmax >= z[0] && dmin <= z[nc - 1])) {
          continue
        }

        for (let k = 0; k < nc; k++) {
          if (!(z[k] >= dmin && z[k] <= dmax)) {
            //console.log('continue2')
            continue
          }

          for (let m = 4; m >= 0; m--) {
            if (m > 0) {
              h[m] = d[i + im[m - 1]][j + jm[m - 1]] - z[k]
              xh[m] = x[i + im[m - 1]]
              yh[m] = y[j + jm[m - 1]]
            } else {
              h[0] = 0.25 * (h[1] + h[2] + h[3] + h[4])
              xh[0] = 0.5 * (x[i] + x[i + 1])
              yh[0] = 0.5 * (y[j] + y[j + 1])
            }

            if (h[m] > 0.0) {
              sh[m] = 1
            } else if (h[m] < 0.0) {
              sh[m] = -1
            } else {
              sh[m] = 0
            }
          }

          for (let m = 1; m <= 4; m++) {
            const m1 = m
            const m2 = 0
            const m3 = m !== 4 ? m + 1 : 1

            const caseValue = castab[sh[m1] + 1][sh[m2] + 1][sh[m3] + 1]
            if (caseValue === 0) {
              // console.log('continue3')
              continue
            }

            switch (caseValue) {
              case 1: // Line between vertices 1 and 2
                x1 = xh[m1]
                y1 = yh[m1]
                x2 = xh[m2]
                y2 = yh[m2]
                break
              case 2: // Line between vertices 2 and 3
                x1 = xh[m2]
                y1 = yh[m2]
                x2 = xh[m3]
                y2 = yh[m3]
                break
              case 3: // Line between vertices 3 and 1
                x1 = xh[m3]
                y1 = yh[m3]
                x2 = xh[m1]
                y2 = yh[m1]
                break
              case 4: // Line between vertex 1 and side 2-3
                x1 = xh[m1]
                y1 = yh[m1]
                x2 = xsect(m2, m3)
                y2 = ysect(m2, m3)
                break
              case 5: // Line between vertex 2 and side 3-1
                x1 = xh[m2]
                y1 = yh[m2]
                x2 = xsect(m3, m1)
                y2 = ysect(m3, m1)
                break
              case 6: // Line between vertex 3 and side 1-2
                x1 = xh[m3]
                y1 = yh[m3]
                x2 = xsect(m1, m2)
                y2 = ysect(m1, m2)
                break
              case 7: // Line between sides 1-2 and 2-3
                x1 = xsect(m1, m2)
                y1 = ysect(m1, m2)
                x2 = xsect(m2, m3)
                y2 = ysect(m2, m3)
                break
              case 8: // Line between sides 2-3 and 3-1
                x1 = xsect(m2, m3)
                y1 = ysect(m2, m3)
                x2 = xsect(m3, m1)
                y2 = ysect(m3, m1)
                break
              case 9: // Line between sides 3-1 and 1-2
                x1 = xsect(m3, m1)
                y1 = ysect(m3, m1)
                x2 = xsect(m1, m2)
                y2 = ysect(m1, m2)
                break
            }
            renderer(x1, y1, x2, y2, z[k])
          }
        }
      }
    }
  }
}
