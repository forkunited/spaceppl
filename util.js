var _ = require("underscore");

var _mapProduct = function(fn, arr1, arr2) {
    return _.flatten(
        _.map(arr1, function(item1) {
            return _.map(arr2, function(item2) {
                return fn(item1, item2);
            });
        }), false);
}

var areDisjoint = function(l1, l2) {
    return _.some(_mapProduct(function(v1, v2) {
        return _.isEqual(v1, v2);
    }, l1, l2)) ? false : true;
}

var getDimension = function(points, index) {
	return _.map(points, function(point) {
		return point[index]
	});
}

var round = function(value, place) {
	if (place) {
		return Math.round(value*Math.pow(10,place))/(Math.pow(10,place));
	} else {
		return value;
	}
}

var arraySwap = function(arr, i, j) {
	var temp = arr[i];
	arr[i] = arr[j];
	arr[j] = temp;
	return arr;
}

var objectListToTSVString = function(objs) {
	var keys = _.keys(objs[0]);
	var makeTSVLine = function(strList) {
		var line = _.reduce(strList,
			function(acc, s) {
				return acc + "\t" + s;
			}, "");
		return line;
    };

	var headerStr = makeTSVLine(keys);
	var tsvList = _.map(objs,
		function(obj) {
			return makeTSVLine(_.values(obj));
		});

	return _.reduce(tsvList,
		function(acc, s) {
			return acc + "\n" + s;
		}, headerStr);
}

var objectToString = function(obj, valueToStringFn) {
	var objStrs = _.mapObject(obj,
		function(v, k) {
			return k + "\n" + valueToStringFn(v);
		});

    return _.reduce(_.values(objStrs),
    	function(acc, s) {
        	return s + "\n" + acc;
    	}, "");
}

var makeObject = function(l) {
	return _.object(l);
}

module.exports = {
	areDisjoint : areDisjoint,
	getDimension : getDimension,
	round : round,
	arraySwap : arraySwap,
	objectToString : objectToString,
	objectListToTSVString : objectListToTSVString,
	makeObject : makeObject
}

