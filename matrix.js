const _ = require('underscore');

var vectorInit = function(length) {
    return { length : length, vec : {}};
};

var vectorSet = function(v, index, value) {
    v.vec[index] = value;
};

var vectorGet = function(v, index) {
    return v.vec[index];
}

var vectorFromArray = function(arr) {
    var v = vectorInit(arr.length);
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] != 0.0) {
            vectorSet(v, i, arr[i]);
        }
    }

    return v;
};

var vectorLength = function(v) {
    return v.length;
};

var vectorCat = function(v1, v2) {
    var v = vectorInit(v1.length + v2.length);

    for (var key in v1.vec) {
        vectorSet(v, key, vectorGet(v1, key));
    }

    for (var key in v2.vec) {
        vectorSet(v, parseInt(key) + v1.length, vectorGet(v2, key));
    }

    return v;
};

var matrixInit = function(m, n) {
    var M = { m : m, n : n, mat : []};

    for (var i = 0; i < m; i++)
        M.mat.push(vectorInit(n));

    return M;
};

var matrixGetDimension = function(M, dim) {
    if (dim == 0)
        return M.m;
    else
        return M.n;
};

var matrixGetRowVector = function(M, index) {
    return M.mat[index];
};

var matrixAddRowVector = function(M, v) {
    M.mat.push(v);
    M.m += 1;
    return M;
};

var matrixRowProductCat = function(M1, M2) {
    var M = matrixInit(0, M1.n + M2.n);

    for (var i = 0; i < matrixGetDimension(M1, 0); i++) {
        for (var j = 0; j < matrixGetDimension(M2, 0); j++) {
            var v = vectorCat(matrixGetRowVector(M1, i), matrixGetRowVector(M2, j));
            M = matrixAddRowVector(M, v);
        }
    }

    return M;
};

module.exports = {
    vectorInit: vectorInit,
    vectorSet : vectorSet,
    vectorGet : vectorGet,
    vectorFromArray : vectorFromArray,
    vectorLength : vectorLength,
    vectorCat : vectorCat,
    matrixInit : matrixInit,
    matrixGetDimension : matrixGetDimension,
    matrixGetRowVector : matrixGetRowVector,
    matrixAddRowVector : matrixAddRowVector,
    matrixRowProductCat : matrixRowProductCat
};