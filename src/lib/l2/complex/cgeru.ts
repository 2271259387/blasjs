/* This is a conversion from BLAS to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { Complex, errMissingIm, errWrongArg, FortranArr, isZero, Matrix } from '../../f_func';

const { max } = Math;

export function cgeru(
    m: number,
    n: number,
    alpha: Complex,
    x: FortranArr,
    incx: number,
    y: FortranArr,
    incy: number,
    a: Matrix,
    lda: number,
): void {
    if (x.i === undefined) {
        throw new Error(errMissingIm('x.i'));
    }
    if (y.i === undefined) {
        throw new Error(errMissingIm('y.i'));
    }
    if (a.i === undefined) {
        throw new Error(errMissingIm('a.i'));
    }

    let info = 0;
    if (m < 0) {
        info = 1;
    } else if (n < 0) {
        info = 2;
    } else if (incx === 0) {
        info = 5;
    } else if (incy === 0) {
        info = 7;
    } else if (lda < max(1, m)) {
        info = 9;
    }
    if (info !== 0) {
        throw new Error(errWrongArg('cgeru', info));
    }

    const { re: AlphaRe, im: AlphaIm } = alpha;

    const alphaIsZero = isZero(alpha);

    //Quick return if possible.

    if (m === 0 || n === 0 || alphaIsZero) return;

    let jy = incy > 0 ? 1 : 1 - (n - 1) * incy;
    const kx = incx > 0 ? 1 : 1 - (m - 1) * incx;

    for (let j = 1; j <= n; j++) {
        if (!(y.r[jy - y.base] === 0 && y.i[jy - y.base] === 0)) {
            const tempRe = AlphaRe * y.r[jy - y.base] - AlphaIm * y.i[jy - y.base];
            const tempIm = AlphaRe * y.i[jy - y.base] + AlphaIm * y.r[jy - y.base];
            let ix = kx;
            const coords = a.colOfEx(j);
            for (let i = 1; i <= m; i++) {
                a.r[coords + i] += x.r[ix - x.base] * tempRe - x.i[ix - x.base] * tempIm;
                a.i[coords + i] += x.r[ix - x.base] * tempIm + x.i[ix - x.base] * tempRe;
                ix += incx;
            }
        }
        jy += incy;
    }
}
