const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const counter = require('./counter');
const bilookup = require('./bilookup');
const rgame = require('./rgame');
const matrix = require('./matrix');

var FEATURE_FILE_PREFIX = "_f.";

var symbols = {
    TERMINAL_SYMBOL : "vvv.vvv.",
    START_SYMBOL : "^^^.^^^."
};

var types = {
    ACTION_DIMENSION_SCALAR : "actionDimensionScalar",
    ACTION_DIMENSION_ENUMERABLE : "actionDimensionEnumerable",
    UTTERANCE_TOKEN_ANNOTATION_SCALAR : "utteranceTokenAnnotationScalar",
    UTTERANCE_TOKEN_ANNOTATION_ENUMERABLE : "utteranceTokenAnnotationEnumerable"
};

var initFeatureActionDimensionScalar = function(name, inputGameDirectory, utteranceFn, actionFn, parameters) {
    var game = rgame.readOneGame(inputGameDirectory);
    var actions = actionFn(game);
    var c = counter.init();

    for (var i = 0; i < actions.length; i++) {
        for (var dim in actions[i]) {
            if (dim.startsWith(parameters.prefix))
                counter.increment(c, dim);
        }
    }

    var bi = bilookup.init(counter.buildIndex(c));

    return {
        name : name,
        type : types.ACTION_DIMENSION_SCALAR,
        inputGameDirectory : inputGameDirectory,
        utteranceFn : utteranceFn.toString(),
        actionFn : actionFn.toString(),
        parameters : parameters,
        vocabulary : bi,
        size : bilookup.size(bi)
    }
};

var computeFeatureActionDimensionScalar = function(feature, utterance, action) {
    var v = matrix.vectorInit(bilookup.size(feature.vocabulary));

    for (var key in action) {
        if (bilookup.contains(feature.vocabulary, key)) {
            var index = bilookup.get(feature.vocabulary, key);
            matrix.vectorSet(v, index, parseFloat(action[key]));
        }
    }

    var M = matrix.matrixInit(0, matrix.vectorLength(v));
    return matrix.matrixAddRowVector(M, v);
};

var initFeatureActionDimensionEnumerable = function(name, inputGameDirectory, utteranceFn, actionFn, parameters) {
    var c = counter.init();
    var processGame = function(game) {
        var actions = actionFn(game);
        for (var a = 0; a < actions.length; a++) {
            var action = actions[a];
            for (var dim in action) {
                if (dim.startsWith(parameters.prefix)) {
                    counter.increment(c, dim + "_" + action[dim]);
                }
            }
        }
    };

    rgame.readGames(inputGameDirectory, processGame);

    counter.removeLessThan(c, parameters.minCount);

    var bi = bilookup.init(counter.buildIndex(c));

    return {
        name : name,
        type : types.ACTION_DIMENSION_ENUMERABLE,
        inputGameDirectory : inputGameDirectory,
        utteranceFn : utteranceFn.toString(),
        actionFn : actionFn.toString(),
        parameters : parameters,
        vocabulary : bi,
        size : bilookup.size(bi)
    }
};

var computeFeatureActionDimensionEnumerable = function(feature, utterance, action) {
    var v = matrix.vectorInit(bilookup.size(feature.vocabulary));
    for (var key in action) {
        var f = key + "_" + action[key];
        if (bilookup.contains(feature.vocabulary, f)) {
            var index = bilookup.get(feature.vocabulary, f);
            matrix.vectorSet(v, index, 1);
        }
    }

    var M = matrix.matrixInit(0, matrix.vectorLength(v));
    return matrix.matrixAddRowVector(M, v);
};

var initFeatureUtteranceTokenAnnotationScalar = function(name, inputGameDirectory, utteranceFn, actionFn, parameters) {
    var game = rgame.readOneGame(inputGameDirectory);
    var utterances = utteranceFn(game);
    var c = counter.init();

    for (var u = 0; u < utterances.length; u++) {
        var utt = utterances[u];
        for (var i = 0; i < rgame.getUtteranceSentenceCount(utt); i++) {
            for (var j = 0; j < rgame.getUtteranceSentenceTokenCount(utt, i); j++) {
                var anno = rgame.getUtteranceTokenAnnotation(utt, parameters.annotation, i, j);
                for (var key in anno)
                    counter.increment(c, key);
            }
        }
    }

    counter.increment(c, symbols.TERMINAL_SYMBOL);
    counter.increment(c, symbols.START_SYMBOL);

    var bi = bilookup.init(counter.buildIndex(c));

    return {
        name : name,
        type : types.UTTERANCE_TOKEN_ANNOTATION_SCALAR,
        inputGameDirectory : inputGameDirectory,
        utteranceFn : utteranceFn.toString(),
        actionFn : actionFn.toString(),
        parameters : parameters,
        vocabulary : bi,
        size : bilookup.size(bi)
    }
};

var computeFeatureUtteranceTokenAnnotationScalar = function(feature, utterance, action) {
    var M = matrix.matrixInit(0, bilookup.size(feature.vocabulary));

    for (var i = 0; i < rgame.getUtteranceSentenceCount(utterance); i++) {
        for (var j = 0; j < rgame.getUtteranceSentenceTokenCount(utterance, i); j++) {
            var anno = rgame.getUtteranceTokenAnnotation(utterance, feature.parameters.annotation, i, j);
            var v = matrix.vectorInit(bilookup.size(feature.vocabulary));
            for (var key in anno) {
                if (bilookup.contains(feature.vocabulary, key)) {
                    var index = bilookup.get(feature.vocabulary, key);
                    matrix.vectorSet(v, index, parseFloat(anno[key]));
                }
            }
            M = matrix.matrixAddRowVector(M, v);
        }
    }

    // Add terminals
    var vT = matrix.vectorInit(bilookup.size(feature.vocabulary));
    var index = bilookup.get(feature.vocabulary, symbols.TERMINAL_SYMBOL);
    matrix.vectorSet(vT, index, 1);
    M = matrix.matrixAddRowVector(M, vT);

    var vS = matrix.vectorInit(bilookup.size(feature.vocabulary));
    var index = bilookup.get(feature.vocabulary, symbols.START_SYMBOL);
    matrix.vectorSet(vS, index, 1);
    M = matrix.matrixAddRowVector(M, vS);

    return M;
};

var initFeatureUtteranceTokenAnnotationEnumerable = function(name, inputGameDirectory, utteranceFn, actionFn, parameters) {
    var c = counter.init();
    var processGame = function(game) {
        var utterances = utteranceFn(game);
        for (var u = 0; u < utterances.length; u++) {
            var utt = utterances[u];
            for (var i = 0; i < rgame.getUtteranceSentenceCount(utt); i++) {
                for (var j = 0; j < rgame.getUtteranceSentenceTokenCount(utt, i); j++) {
                    counter.increment(c, rgame.getUtteranceTokenAnnotation(utt, parameters.annotation, i, j));
                }
            }
        }
    }

    rgame.readGames(inputGameDirectory, processGame);

    counter.removeLessThan(c, parameters.minCount);

    counter.increment(c, symbols.TERMINAL_SYMBOL);
    counter.increment(c, symbols.START_SYMBOL);

    var bi = bilookup.init(counter.buildIndex(c));

    return {
        name : name,
        type : types.UTTERANCE_TOKEN_ANNOTATION_ENUMERABLE,
        inputGameDirectory : inputGameDirectory,
        utteranceFn : utteranceFn.toString(),
        actionFn : actionFn.toString(),
        parameters : parameters,
        vocabulary : bi,
        size : bilookup.size(bi)
    }
};

var computeFeatureUtteranceTokenAnnotationEnumerable = function(feature, utterance, action) {
    var M = matrix.matrixInit(0, bilookup.size(feature.vocabulary));

    for (var i = 0; i < rgame.getUtteranceSentenceCount(utterance); i++) {
        for (var j = 0; j < rgame.getUtteranceSentenceTokenCount(utterance, i); j++) {
            var anno = rgame.getUtteranceTokenAnnotation(utterance, feature.parameters.annotation, i, j);
            var v = matrix.vectorInit(bilookup.size(feature.vocabulary));
            if (bilookup.contains(feature.vocabulary, anno)) {
                var index = bilookup.get(feature.vocabulary, anno);
                matrix.vectorSet(v, index, 1);
            }
            M = matrix.matrixAddRowVector(M, v);
        }
    }

    // Add terminals
    var vT = matrix.vectorInit(bilookup.size(feature.vocabulary));
    var index = bilookup.get(feature.vocabulary, symbols.TERMINAL_SYMBOL);
    matrix.vectorSet(vT, index, 1);
    M = matrix.matrixAddRowVector(M, vT);

    var vS = matrix.vectorInit(bilookup.size(feature.vocabulary));
    var index = bilookup.get(feature.vocabulary, symbols.START_SYMBOL);
    matrix.vectorSet(vS, index, 1);
    M = matrix.matrixAddRowVector(M, vS);

    return M;
};

var initFeatureSet = function(name, inputGameDirectory, utteranceFn, actionFn, featureTypes, vector) {
    var features = {};
    var size = 0;
    for (var i = 0; i < featureTypes.length; i++) {
        var fname = featureTypes[i].name;
        var fparameters = featureTypes[i].parameters;
        var ftype = featureTypes[i].type;
        if (ftype == types.ACTION_DIMENSION_SCALAR) {
            var feature = initFeatureActionDimensionScalar(fname, inputGameDirectory, utteranceFn, actionFn, fparameters);
            features[fname] = feature;
        } else if (ftype == types.ACTION_DIMENSION_ENUMERABLE) {
            var feature = initFeatureActionDimensionEnumerable(fname, inputGameDirectory, utteranceFn, actionFn, fparameters);
            features[fname] = feature;
        } else if (ftype == types.UTTERANCE_TOKEN_ANNOTATION_SCALAR) {
            var feature = initFeatureUtteranceTokenAnnotationScalar(fname, inputGameDirectory, utteranceFn, actionFn, fparameters);
            features[fname] = feature;
        } else if (ftype == types.UTTERANCE_TOKEN_ANNOTATION_ENUMERABLE) {
            var feature = initFeatureUtteranceTokenAnnotationEnumerable(fname, inputGameDirectory, utteranceFn, actionFn, fparameters);
            features[fname] = feature;
        }

        size += features[fname].size;
    }

    return {
        name : name,
        inputGameDirectory : inputGameDirectory,
        utteranceFn : utteranceFn.toString(),
        actionFn : actionFn.toString(),
        features : features,
        vector : vector,
        size : size
    }
};

// NOTE: This currently assumes that utteranceActionFn returns at most one
// utterance-action pair per game round.  This assumption is necessary
// for the returned datum ids to be computed uniquely in terms of game ids and rounds
var computeFeatureSet = function(f, inputGameDirectory, utteranceActionFn) {
    var featureMatrices = {};
    var processGame = function(game) {
        var utteranceActions = utteranceActionFn(game);
        for (var i = 0; i < utteranceActions.length; i++) {
            var utterance = rgame.getUtteranceActionPairUtterance(utteranceActions[i]);
            var action = rgame.getUtteranceActionPairAction(utteranceActions[i]);
            var F = matrix.matrixInit(1, 0);
            var round = rgame.getUtteranceActionPairRound(utteranceActions[i]);
            var game = rgame.getUtteranceActionPairGame(utteranceActions[i]);

            for (var j = 0; j < f.vector.length; j++) {
                var feature = f.features[f.vector[j]];
                if (feature.type == types.ACTION_DIMENSION_SCALAR) {
                    var M = computeFeatureActionDimensionScalar(feature, utterance, action);
                    F = matrix.matrixRowProductCat(F, M);
                } else if (feature.type == types.ACTION_DIMENSION_ENUMERABLE) {
                    var M = computeFeatureActionDimensionEnumerable(feature, utterance, action);
                    F = matrix.matrixRowProductCat(F, M);
                } else if (feature.type == types.UTTERANCE_TOKEN_ANNOTATION_SCALAR) {
                    var M = computeFeatureUtteranceTokenAnnotationScalar(feature, utterance, action);
                    F = matrix.matrixRowProductCat(F, M);
                } else if (feature.type == types.UTTERANCE_TOKEN_ANNOTATION_ENUMERABLE) {
                    var M = computeFeatureUtteranceTokenAnnotationEnumerable(feature, utterance, action);
                    F = matrix.matrixRowProductCat(F, M);
                }
            }

            var id = game + '_' + round;
            featureMatrices[id] = { id : id, game : game, round : round, F: F };
        }
    };

    rgame.readGames(inputGameDirectory, processGame);

    return { name : f.name, inputGameDirectory : inputGameDirectory, utteranceActionFn : utteranceActionFn, D : featureMatrices };
};

var loadFeatureSet = function(inputDirectory) {
    if (!fs.existsSync(inputDirectory))
        throw(inputDirectory + " does not exist.");
    var features = {};
    var f = {};
    var fileNames = fs.readdirSync(inputDirectory);
    for (var i = 0; i < fileNames.length; i++) {
        if (fileNames[i].startsWith(FEATURE_FILE_PREFIX)) {
            var feature = JSON.parse(fs.readFileSync(path.join(inputDirectory, fileNames[i]), 'utf8'));
            features[feature.name] = feature;
        } else {
            f = JSON.parse(fs.readFileSync(path.join(inputDirectory, fileNames[i]), 'utf8'));
        }
    }

    f.features = features;
    return f;
}

var saveFeatureSet = function(f, outputDirectory) {
    if (!fs.existsSync(outputDirectory))
        fs.mkdirSync(outputDirectory);

    var features = f.features;
    delete f.features;

    fs.writeFileSync(path.join(outputDirectory, f.name), JSON.stringify(f));

    for (key in features) {
        fs.writeFileSync(path.join(outputDirectory, FEATURE_FILE_PREFIX + f.name + "." + features[key].name), JSON.stringify(features[key]));
    }

    f.features = features;
}

var loadFeatureMatrix = function(inputFile) {
    if (!fs.existsSync(inputFile))
        throw(inputFile + " does not exist.");

    return JSON.parse(fs.readFileSync(inputFile));
};

var saveFeatureMatrix = function(F, outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(F));
};

var getFeatureMatrixData = function(F) {
    return F.D;
}

var getFeatureMatrixFromDatum = function(d) {
    return d.F;
}

var getGameFromDatum = function(d) {
    return d.game;
}

var getFeatureSetSize = function(f) {
    return f.size;
}

module.exports = {
    types : types,
    symbols : symbols,
    initFeatureActionDimensionScalar : initFeatureActionDimensionScalar,
    computeFeatureActionDimensionScalar : computeFeatureActionDimensionScalar,
    initFeatureActionDimensionEnumerable : initFeatureActionDimensionEnumerable,
    computeFeatureActionDimensionEnumerable : computeFeatureActionDimensionEnumerable,
    initFeatureUtteranceTokenAnnotationScalar : initFeatureUtteranceTokenAnnotationScalar,
    computeFeatureUtteranceTokenAnnotationScalar : computeFeatureUtteranceTokenAnnotationScalar,
    initFeatureUtteranceTokenAnnotationEnumerable : initFeatureUtteranceTokenAnnotationEnumerable,
    computeFeatureUtteranceTokenAnnotationEnumerable : computeFeatureUtteranceTokenAnnotationEnumerable,
    initFeatureSet : initFeatureSet,
    computeFeatureSet : computeFeatureSet,
    loadFeatureSet : loadFeatureSet,
    saveFeatureSet : saveFeatureSet,
    loadFeatureMatrix : loadFeatureMatrix,
    saveFeatureMatrix : saveFeatureMatrix,
    getFeatureMatrixData : getFeatureMatrixData,
    getFeatureMatrixFromDatum : getFeatureMatrixFromDatum,
    getGameFromDatum : getGameFromDatum,
    getFeatureSetSize : getFeatureSetSize
};