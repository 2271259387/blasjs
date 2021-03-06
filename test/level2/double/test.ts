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

import { fixture } from './fixtures';
import * as blas from '../../../src/lib';
import {
    approximatelyWithPrec,
    each,
    multiplexer,
    fortranArrComplex64,
    fortranMatrixComplex64,
    muxCmplx,
    approximately,
} from '../../test-helpers';

const {
    level2: {
        sgbmv,
        sgemv,
        sger,
        ssbmv,
        sspmv,
        sspr,
        sspr2,
        ssymv,
        ssyr,
        ssyr2,
        stbmv,
        stbsv,
        stpsv,
        stpmv,
        strmv,
        strsv,
    },
} = blas;

describe('blas level 2 single/double precision', function n() {
    describe('sgbmv', () => {
        describe('data tests', () => {
            const { sgbmv: testData } = fixture;

            each(testData)(
                (
                    { input: { trans, m, n, kl, ku, alpha, a, lda, x, incx, beta, y, incy }, output: expect, desc },
                    key,
                ) => {
                    it(`[${key}]/[${desc}]`, function t() {
                        const aM = fortranMatrixComplex64(muxCmplx(a))(lda, n);
                        const sx = fortranArrComplex64(muxCmplx(x))();
                        const sy = fortranArrComplex64(muxCmplx(y))();

                        sgbmv(trans, m, n, kl, ku, alpha, aM, lda, sx, incx, beta, sy, incy);
                        //console.log({ sy });
                        multiplexer(sy.toArr(), expect.y)(approximately);
                    });
                },
            );
        });

        describe('test errors', () => {
            const { sgbmvErrors: errors } = fixture;

            each(errors)(({ input: { trans, m, n, kl, ku, alpha, a, lda, x, incx, beta, y, incy }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const aM = fortranMatrixComplex64(muxCmplx(a))(0, 0);
                    const sx = fortranArrComplex64(muxCmplx(x))();
                    const sy = fortranArrComplex64(muxCmplx(y))();

                    const call = () => sgbmv(trans, m, n, kl, ku, alpha, aM, lda, sx, incx, beta, sy, incy);
                    //call();
                    expect(call).toThrow();
                });
            });
        });
    });
    describe('sgemv', () => {
        describe('data tests', () => {
            const { sgemv: testData } = fixture;

            each(testData)(
                ({ input: { trans, m, n, alpha, a, lda, x, incx, beta, y, incy }, output: expect, desc }, key) => {
                    it(`[${key}]/[${desc}]`, function t() {
                        const aM = fortranMatrixComplex64(muxCmplx(a))(lda, n);
                        const sx = fortranArrComplex64(muxCmplx(x))();
                        const sy = fortranArrComplex64(muxCmplx(y))();

                        //console.log({ am: Array.from(aM.r) });
                        sgemv(trans, m, n, alpha, aM, lda, sx, incx, beta, sy, incy);
                        // console.log({ sy: sy.toArr() });
                        multiplexer(sy.toArr(), expect.y)(approximatelyWithPrec(1e-6));
                    });
                },
            );
        });
        //
        describe('test errors', () => {
            const { sgemvErrors: errors } = fixture;

            each(errors)(({ input: { trans, m, n, alpha, a, lda, x, incx, beta, y, incy }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const aM = fortranMatrixComplex64(muxCmplx(a))(0, 0);
                    const sx = fortranArrComplex64(muxCmplx(x))();
                    const sy = fortranArrComplex64(muxCmplx(y))();

                    const call = () => sgemv(trans, m, n, alpha, aM, lda, sx, incx, beta, sy, incy);
                    //call();
                    expect(call).toThrow();
                });
            });
        });
    });

    describe('sger', () => {
        describe('data tests', () => {
            const { sger: testData } = fixture;
            each(testData)(({ input: { m, n, alpha, a, lda, x, incx, y, incy }, expect, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const aM = fortranMatrixComplex64(muxCmplx(a))(lda, n);
                    const sx = fortranArrComplex64(muxCmplx(x))();
                    const sy = fortranArrComplex64(muxCmplx(y))();
                    //const eA = fortranMatrixComplex64(muxCmplx(expect.a))(m, n);

                    sger(m, n, alpha, sx, incx, sy, incy, aM, lda);
                    //console.log({ a: aM.slice(1, m, 1, n).r });
                    multiplexer(aM.slice_used_for_test(1, m, 1, n).toArr(), expect.a)(approximatelyWithPrec(1e-7));
                });
            });
        });

        describe('error tests', () => {
            const { sgerError: testData } = fixture;
            each(testData)(({ input: { m, n, lda, incx, incy }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const aM = fortranMatrixComplex64(muxCmplx([0]))(1, 1);
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const sy = fortranArrComplex64(muxCmplx([0]))();

                    const call = () => sger(m, n, 0, sx, incx, sy, incy, aM, lda);

                    expect(call).toThrow();
                });
            });
        });
    });
    describe('ssbmv', () => {
        describe('data tests', () => {
            const { ssbmv: testData } = fixture;
            each(testData)(({ input: { uplo, n, k, alpha, beta, lda, incx, incy, a, x, y }, expect, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const aM = fortranMatrixComplex64(muxCmplx(a))(lda, n);
                    const sx = fortranArrComplex64(muxCmplx(x))();
                    const sy = fortranArrComplex64(muxCmplx(y))();

                    ssbmv(uplo, n, k, alpha, aM, lda, sx, incx, beta, sy, incy);
                    multiplexer(sy.toArr(), expect.y)(approximatelyWithPrec(1e-6));
                });
            });
        });

        describe('error tests', () => {
            const { ssbmvErrors: testData } = fixture;
            each(testData)(({ input: { uplo, n, k, alpha, beta, lda, incx, incy }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const aM = fortranMatrixComplex64(muxCmplx([0]))(1, 1);
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const sy = fortranArrComplex64(muxCmplx([0]))();

                    const call = () => ssbmv(uplo, n, k, alpha, aM, lda, sx, incx, beta, sy, incy);

                    expect(call).toThrow();
                });
            });
        });
    });
    describe('sspmv', () => {
        describe('data tests', () => {
            const { sspmv: testData } = fixture;
            each(testData)(({ input: { uplo, n, alpha, incx, beta, incy, ap, x, y }, expect, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sap = fortranArrComplex64(muxCmplx(ap))();
                    const sx = fortranArrComplex64(muxCmplx(x))();
                    const sy = fortranArrComplex64(muxCmplx(y))();
                    //console.log({ incx, incy, n, alpha, beta, sx: sx.toArr(), sy: sy.toArr() });

                    sspmv(uplo, n, alpha, sap, sx, incx, beta, sy, incy);
                    // console.log({ sy: sy.toArr() });

                    multiplexer(sy.toArr(), expect.y)(approximatelyWithPrec(1e-6));
                });
            });
        });
        describe('error tests', () => {
            const { sspmvErrors: testData } = fixture;
            each(testData)(({ input: { uplo, n, alpha, beta, incx, incy }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sap = fortranArrComplex64(muxCmplx([0]))();
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const sy = fortranArrComplex64(muxCmplx([0]))();

                    const call = () => sspmv(uplo, n, alpha, sap, sx, incx, beta, sy, incy);

                    expect(call).toThrow();
                });
            });
        });
    });

    describe('sspr', () => {
        describe('data tests', () => {
            const { sspr: testData } = fixture;

            each(testData)(({ input, expect, desc }, key) => {
                const { uplo, n, alpha, incx, ap, x } = input;

                const { ap: apExpect } = expect;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const sap = fortranArrComplex64(muxCmplx(ap))();
                    const sx = fortranArrComplex64(muxCmplx(x))();

                    //console.log({ incx, incy, n, alpha, beta, sx: sx.toArr(), sy: sy.toArr() });

                    sspr(uplo, n, alpha, sx, incx, sap);
                    multiplexer(apExpect, Array.from(sap.r))(approximatelyWithPrec(1e-6));
                });
            });
        });
        describe('error tests', () => {
            const { ssprErrors: testData } = fixture;
            each(testData)(({ input: { uplo, n, alpha, incx }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sap = fortranArrComplex64(muxCmplx([0]))();
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const call = () => sspr(uplo, n, alpha, sx, incx, sap);

                    expect(call).toThrow();
                });
            });
        });
    });
    describe('sspr2', () => {
        describe('data tests', () => {
            const { sspr2: testData } = fixture;

            each(testData)(({ input, expect, desc }, key) => {
                const { uplo, n, alpha, x, y, incx, incy, ap } = input;

                const { ap: apExpect } = expect;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const sap = fortranArrComplex64(muxCmplx(ap))();
                    const sx = fortranArrComplex64(muxCmplx(x))();
                    const sy = fortranArrComplex64(muxCmplx(y))();
                    sspr2(uplo, n, alpha, sx, incx, sy, incy, sap);
                    //console.log({ apAfter: sap.r });
                    multiplexer(apExpect, Array.from(sap.r))(approximatelyWithPrec(1e-6));
                });
            });
        });
        describe('error tests', () => {
            const { sspr2Errors: testData } = fixture;
            each(testData)(({ input: { uplo, n, alpha, incx, incy }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sap = fortranArrComplex64(muxCmplx([0]))();
                    const sy = fortranArrComplex64(muxCmplx([0]))();
                    const sx = fortranArrComplex64(muxCmplx([0]))();

                    const call = () => sspr2(uplo, n, alpha, sx, incx, sy, incy, sap);

                    expect(call).toThrow();
                });
            });
        });
    });
    describe('ssymv', () => {
        describe('data tests', () => {
            const { ssymv: testData } = fixture;
            each(testData)(({ input, expect: { y: ey }, desc }, key) => {
                const { uplo, n, alpha, a, lda, x, incx, y, incy, beta } = input;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const A = fortranMatrixComplex64(muxCmplx(a))(6, 6);
                    const sx = fortranArrComplex64(muxCmplx(x))();
                    const sy = fortranArrComplex64(muxCmplx(y))();

                    ssymv(uplo, n, alpha, A, lda, sx, incx, beta, sy, incy);
                    //console.log(sy.toArr());
                    multiplexer(ey, sy.toArr())(approximatelyWithPrec(1e-6));
                });
            });
        });

        describe('error tests', () => {
            const { ssymvErrors: testData } = fixture;
            each(testData)(({ input: { uplo, n, alpha, lda, incx, y, incy, beta }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const A = fortranMatrixComplex64(muxCmplx([]))(0, 9);
                    const sy = fortranArrComplex64(muxCmplx(y))();
                    const call = () => ssymv(uplo, n, alpha, A, lda, sx, incx, beta, sy, incy);
                    expect(call).toThrow();
                });
            });
        });
    });
    describe('ssyr', () => {
        describe('data tests', () => {
            const { ssyr: testData } = fixture;
            each(testData)(({ input, expect, desc }, key) => {
                const { uplo, n, alpha, a, lda, x, incx } = input;
                const eA = expect.a;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const A = fortranMatrixComplex64(muxCmplx(a))(6, 6);
                    const sx = fortranArrComplex64(muxCmplx(x))();
                    // const B = fortranMatrixComplex64(muxCmplx(a))(6, 6);

                    ssyr(uplo, n, alpha, sx, incx, A, lda);

                    multiplexer([A.r.length, ...Array.from(A.r)], [eA.length, ...eA])(approximatelyWithPrec(1e-6));
                });
            });
        });

        describe('error tests', () => {
            const { ssyrErrors: testData } = fixture;
            each(testData)(({ input: { uplo, n, alpha, lda, incx }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const A = fortranMatrixComplex64(muxCmplx([0]))(0, 0);

                    const call = () => ssyr(uplo, n, alpha, sx, incx, A, lda);
                    expect(call).toThrow();
                });
            });
        });
    });
    describe('ssyr2', () => {
        describe('data tests', () => {
            const { ssyr2: testData } = fixture;
            each(testData)(({ input, expect, desc }, key) => {
                const { uplo, n, alpha, incx, incy, lda, a, x, y } = input;
                const eA = expect.a;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const A = fortranMatrixComplex64(muxCmplx(a))(lda, n);
                    const sx = fortranArrComplex64(muxCmplx(x))();
                    const sy = fortranArrComplex64(muxCmplx(y))();

                    ssyr2(uplo, n, alpha, sx, incx, sy, incy, A, lda);
                    const approx = approximatelyWithPrec(1e-4);
                    //console.log(Array.from(A.r));
                    multiplexer(
                        [A.r.length, ...Array.from(A.r)],
                        [eA.length, ...eA],
                    )((a, b) => {
                        //debug stuff goes here
                        approx(a, b);
                    });
                });
            });
        });

        describe('error tests', () => {
            const { ssyr2Errors: testData } = fixture;
            each(testData)(({ input: { uplo, n, alpha, incx, incy, lda }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sy = fortranArrComplex64(muxCmplx([0]))();
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const A = fortranMatrixComplex64(muxCmplx([0]))(0, 0);

                    const call = () => ssyr2(uplo, n, alpha, sx, incx, sy, incy, A, lda);
                    expect(call).toThrow();
                });
            });
        });
    });
    describe('stbmv', () => {
        describe('data tests', () => {
            const { stbmv: testData } = fixture;
            each(testData)(({ input, expect, desc }, key) => {
                const { uplo, trans, diag, n, k, lda, incx, x, a } = input;
                const eX = expect.x;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const A = fortranMatrixComplex64(muxCmplx(a))(lda, n);
                    const sx = fortranArrComplex64(muxCmplx(x))();

                    //UPLO,TRANS,DIAG,N,K,A,LDA,X,INCX
                    stbmv(uplo, trans, diag, n, k, A, lda, sx, incx);
                    //console.log(sx.toArr())
                    const approx = approximatelyWithPrec(1e-6);
                    multiplexer(
                        [sx.r.length, ...sx.toArr()],
                        [eX.length, ...eX],
                    )((a, b) => {
                        //debug stuff goes here
                        approx(a, b);
                    });
                });
            });
        });

        describe('error tests', () => {
            const { stbmvErrors: testData } = fixture;
            each(testData)(({ input: { uplo, trans, diag, n, k, lda, incx }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const A = fortranMatrixComplex64(muxCmplx([0]))(0, 0);

                    const call = () => stbmv(uplo, trans, diag, n, k, A, lda, sx, incx);
                    expect(call).toThrow();
                });
            });
        });
    });
    describe('stbsv', () => {
        describe('data tests', () => {
            const { stbsv: testData } = fixture;
            each(testData)(({ input, expect, desc }, key) => {
                const { uplo, trans, diag, n, k, lda, incx, x, a } = input;
                const eX = expect.x;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const A = fortranMatrixComplex64(muxCmplx(a))(lda, n);
                    const sx = fortranArrComplex64(muxCmplx(x))();

                    //UPLO,TRANS,DIAG,N,K,A,LDA,X,INCX
                    stbsv(uplo, trans, diag, n, k, A, lda, sx, incx);
                    // console.log(sx.toArr())
                    const approx = approximatelyWithPrec(1e-4);
                    multiplexer(
                        [sx.r.length, ...sx.toArr()],
                        [eX.length, ...eX],
                    )((a, b) => {
                        //debug stuff goes here
                        approx(a, b);
                    });
                });
            });
        });

        describe('error tests', () => {
            const { stbsvErrors: testData } = fixture;
            each(testData)(({ input: { uplo, trans, diag, n, k, lda, incx }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const A = fortranMatrixComplex64(muxCmplx([0]))(0, 0);

                    const call = () => stbsv(uplo, trans, diag, n, k, A, lda, sx, incx);
                    expect(call).toThrow();
                });
            });
        });
    });
    describe('stpsv', () => {
        describe('data tests', () => {
            const { stpsv: testData } = fixture;
            each(testData)(({ input, expect, desc }, key) => {
                const { uplo, trans, diag, n, incx, x, a } = input;
                const eX = expect.x;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const ap = fortranArrComplex64(muxCmplx(a))();
                    const sx = fortranArrComplex64(muxCmplx(x))();

                    //UPLO,TRANS,DIAG,N,K,A,LDA,X,INCX
                    stpsv(uplo, trans, diag, n, ap, sx, incx);
                    //console.log(sx.toArr())
                    const approx = approximatelyWithPrec(1e-4);
                    multiplexer(
                        [sx.r.length, ...sx.toArr()],
                        [eX.length, ...eX],
                    )((a, b) => {
                        //debug stuff goes here
                        approx(a, b);
                    });
                });
            });
        });

        describe('error tests', () => {
            const { stpsvErrors: testData } = fixture;
            each(testData)(({ input: { uplo, trans, diag, n, incx }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const ap = fortranArrComplex64(muxCmplx([0]))();

                    const call = () => stpsv(uplo, trans, diag, n, ap, sx, incx);
                    expect(call).toThrow();
                });
            });
        });
    });
    describe('stpmv', () => {
        describe('data tests', () => {
            const { stpmv: testData } = fixture;
            each(testData)(({ input, expect, desc }, key) => {
                const { uplo, trans, diag, n, incx, x, a } = input;
                const eX = expect.x;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const ap = fortranArrComplex64(muxCmplx(a))();
                    const sx = fortranArrComplex64(muxCmplx(x))();

                    //UPLO,TRANS,DIAG,N,K,A,LDA,X,INCX
                    stpmv(uplo, trans, diag, n, ap, sx, incx);
                    //console.log(sx.toArr())
                    const approx = approximatelyWithPrec(1e-5);
                    multiplexer(
                        [sx.r.length, ...sx.toArr()],
                        [eX.length, ...eX],
                    )((a, b) => {
                        //debug stuff goes here
                        approx(a, b);
                    });
                });
            });
        });

        describe('error tests', () => {
            const { stpmvErrors: testData } = fixture;
            each(testData)(({ input: { uplo, trans, diag, n, incx }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const ap = fortranArrComplex64(muxCmplx([0]))();

                    const call = () => stpmv(uplo, trans, diag, n, ap, sx, incx);
                    expect(call).toThrow();
                });
            });
        });
    });
    describe('strmv', () => {
        describe('data tests', () => {
            const { strmv: testData } = fixture;
            each(testData)(({ input, expect, desc }, key) => {
                const { uplo, trans, diag, n, incx, lda, x, a } = input;
                const eX = expect.x;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const A = fortranMatrixComplex64(muxCmplx(a))(6, 6);
                    const sx = fortranArrComplex64(muxCmplx(x))();

                    //UPLO,TRANS,DIAG,N,K,A,LDA,X,INCX
                    //console.log(sx);
                    strmv(uplo, trans, diag, n, A, lda, sx, incx);
                    // console.log(sx.toArr())
                    const approx = approximatelyWithPrec(1e-5);
                    multiplexer(
                        [sx.r.length, ...sx.toArr()],
                        [eX.length, ...eX],
                    )((a, b) => {
                        //debug stuff goes here
                        approx(a, b);
                    });
                });
            });
        });

        describe('error tests', () => {
            const { strmvErrors: testData } = fixture;
            each(testData)(({ input: { uplo, trans, diag, n, lda, incx }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const A = fortranMatrixComplex64(muxCmplx([0]))(0, 0);

                    const call = () => strmv(uplo, trans, diag, n, A, lda, sx, incx);
                    expect(call).toThrow();
                });
            });
        });
    });
    describe('strsv', () => {
        describe('data tests', () => {
            const { strsv: testData } = fixture;
            each(testData)(({ input, expect, desc }, key) => {
                const { uplo, trans, diag, n, incx, lda, x, a } = input;
                const eX = expect.x;

                //console.log(input);
                it(`[${key}]/[${desc}]`, function t() {
                    const A = fortranMatrixComplex64(muxCmplx(a))(6, 6);
                    const sx = fortranArrComplex64(muxCmplx(x))();

                    //UPLO,TRANS,DIAG,N,K,A,LDA,X,INCX
                    strsv(uplo, trans, diag, n, A, lda, sx, incx);
                    // console.log(sx.toArr())
                    const approx = approximatelyWithPrec(1e-4);
                    multiplexer(
                        [sx.r.length, ...sx.toArr()],
                        [eX.length, ...eX],
                    )((a, b) => {
                        //debug stuff goes here
                        approx(a, b);
                    });
                });
            });
        });

        describe('error tests', () => {
            const { strsvErrors: testData } = fixture;
            each(testData)(({ input: { uplo, trans, diag, n, lda, incx }, desc }, key) => {
                it(`[${key}]/[${desc}]`, function t() {
                    const sx = fortranArrComplex64(muxCmplx([0]))();
                    const A = fortranMatrixComplex64(muxCmplx([0]))(0, 0);

                    const call = () => strsv(uplo, trans, diag, n, A, lda, sx, incx);
                    expect(call).toThrow();
                });
            });
        });
    });
});
