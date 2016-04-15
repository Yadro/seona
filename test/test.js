var assert = require('assert');

var requirejs = require('requirejs');
requirejs.config({
    baseUrl: '../build',
    paths: {
        react: '../node_modules/react/dist/react',
        'react-dom': '../node_modules/react-dom/dist/react-dom',
        fraction: '../node_modules/fraction.js/fraction',
        matrix: './helper/matrix'
    }
});

function createMatrix(n, m) {
    var a = [];
    for (var i = 0; i < n; i++) {
        a.push([]);
        for (var j = 0; j < m; j++) {

        }
    }
}

describe('FractMatrix', () => {
    var MatrixM;
    var Fraction;

    function equalVec(v1, v2) {
        if (v1.length != v2.length) {
            return false;
        }
        for (var i = 0; i < v1.length; i++) {
            if (typeof v2[i] == "number") {
                v2[i] = new Fraction(v2[i]);
            }
            if (!v1[i].equals(v2[i])) {
                return false;
            }
        }
        return true;
    }

    before(function (done) {
        requirejs(['matrix', 'fraction'], (m, f) => {
            MatrixM = m.MatrixM;
            Fraction = f;
            done();
        });
    });

    describe('#require MatrixM', () => {
        it('проверка матрицы 1x1', function () {
            var m = new MatrixM([[new Fraction(1)]]);

            assert.equal(m.matrix[0][0].equals(new Fraction(1)), true);
        });
    });

    describe('#constructor', () => {
        it('from number', function () {
            var m = [[1, 2, 3], [3, 2, 1]];
            var m1 = new MatrixM(m);
            var m2 = new MatrixM(m);

            for (var i = 0; i < m1.length; i++) {
                assert.equal(m1.matrix[0][i].equals(m2.matrix[0][i]), true);
            }
        });
    });

    describe('#equalVec', () => {
        it('разные вектора, числовой', () => {
            assert.equal(equalVec([new Fraction(0)], [1]), false);
        });

        it('одинаковые вектора, числовой', () => {
            assert.equal(equalVec([new Fraction(0)], [0]), true);
        });

        it('одинаковые вектора, дробный', () => {
            assert.equal(equalVec([new Fraction(0)], [new Fraction(0)]), true);
        });

        it('разные вектора, дробный', () => {
            assert.equal(equalVec([new Fraction(0)], [new Fraction(1)]), false);
        });
    });

    describe('#getRow', () => {
        it('возвращает строку матрицы, проверка первого элемента', () => {
            var m = new MatrixM([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
            assert.equal(m.getRow(0)[0].equals(new Fraction(0)), true);
        });

        it('возвращает строку матрицы, проверка второй строки', () => {
            var m = new MatrixM([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
            assert.equal(equalVec(m.getRow(1), [3, 4, 5]), true);
        });
    });

    describe('#getCol', () => {
        it('возвращает столбец матрицы, проверка 1 строки', () => {
            var m = new MatrixM([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
            assert.equal(equalVec(m.getCol(0), [0, 3, 6]), true);
        });

        it('возвращает столбец матрицы, проверка 2 строки', () => {
            var m = new MatrixM([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
            assert.equal(equalVec(m.getCol(1), [1, 4, 7]), true);
        });

        it('возвращает столбец матрицы, проверка 3 строки', () => {
            var m = new MatrixM([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
            assert.equal(equalVec(m.getCol(2), [2, 5, 8]), true);
        });
    });

    describe('#addRow', () => {
        it('добавление строки', function () {
            var s = 10;
            var list1 = [];
            for (var i = 0; i < s; i++) {
                list1.push(new Fraction(i));
            }
            var list2 = [];
            for (i = 0; i < s; i++) {
                list2.push(new Fraction(i));
            }

            var m = new MatrixM([list1]);
            m.addRow(0, list2);
            for (i = 0; i < s; i++) {
                assert.equal(m.matrix[0][i].equals(list2[i].mul(2)), true);
            }
        });

        it('добавление строки c умножением на коэффициент', function () {
            var m = new MatrixM([
                [new Fraction(0), new Fraction(1)],
                [new Fraction(0), new Fraction(0)]]);

            m.addRow(1, [new Fraction(1), new Fraction(2)], 2);
            for (var i = 0; i < 2; i++) {
                assert.equal(m.matrix[1][i].equals(new Fraction(i + 1).mul(2)), true);
            }
        });

        it('добавление строки большего размера', function () {
            var m = new MatrixM([
                [new Fraction(0), new Fraction(1)],
                [new Fraction(0), new Fraction(0)]]);

            m.addRow(1, [new Fraction(1), new Fraction(2), new Fraction(3)], 2);

            for (var i = 0; i < 2; i++) {
                assert.equal(m.matrix[1][i].equals(new Fraction(i + 1).mul(2)), true);
            }
        });

        it('добавление строки меньшего размера', function () {
            var m = new MatrixM([[new Fraction(0), new Fraction(0)]]);
            m.addColumn(0, [new Fraction(1)], 2);

            assert.equal(m.matrix[0][0].equals(new Fraction(1).mul(2)), true);
            assert.equal(m.matrix[0][1].equals(new Fraction(0)), true);
        });

    });

    describe('#addColumn', () => {
        it('прибавить столбец', () => {
            var m = new MatrixM([[3, 0], [3, 1]]);
            m.addColumn(0, [1, 1]);

            for (var i = 0; i < m.height; i++) {
                assert.equal(m.matrix[i][0].equals(4), true);
            }
        })
    });

    describe('#mulRow', () => {
        it('умножение строки на вектор1', () => {
            var m = new MatrixM([[3, 9], [3, 1]]);
            m.mulRow(0, [2, 9]);
            assert.equal(equalVec(m.getRow(0), [3 * 2, 9 * 9]), true);
        });

        it('умножение строки на вектор2', () => {
            var m = new MatrixM([[3, 9], [3, 1]]);
            m.mulRow(1, [2, 9]);
            assert.equal(equalVec(m.getRow(1), [3 * 2, 9]), true);
        });

    });

    describe('#eachRow', () => {
        it('итерация', () => {
            var vec = [1, 2, 3, 4];
            var m = new MatrixM([vec.slice(), vec.slice()]);
            m.eachRow(0, (n, i) => {
                assert.equal(n, i + 1);
            })
        });

        it('проверка на неизменяемость строки', () => {
            var vec = [1, 2, 3, 4];
            var m = new MatrixM([vec.slice(), vec.slice()]);
            m.eachRow(0, () => {
                return null;
            });

            m.eachRow(0, (n, i) => {
                assert.equal(n, i + 1);
            })
        });

        it('заполнение одним числом', () => {
            var vec = [1, 2, 3, 4];
            var m = new MatrixM([vec.slice()]);
            m.eachRow(0, () => {
                return 5;
            });

            m.eachRow(0, (n, i) => {
                assert.equal(n.equals(5), true);
            })
        });

        it('проверка остановки итерации', () => {
            var vec = [1, 1, 1, 1];
            var m = new MatrixM([vec.slice(), vec.slice()]);
            m.eachRow(1, (n, i, stop) => {
                if (i == 1) stop();
                return n.mul(5);
            });

            m.eachRow(1, (n, i) => {
                assert.equal(n.equals(i == 0 ? 5 : 1), true);
            })
        });
    });
});