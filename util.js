var _ = require("underscore");

var round = function(value, place) {
	if (place) {
		return Math.round(value*Math.pow(10,place))/(Math.pow(10,place));
	} else {
		return value;
	}
}

var distToObject = function(dist, roundPlace) {
	return _.mapObject(dist.params.dist, function(val, key) {
		return round(val.prob, roundPlace); 
	});
}

var distToArray = function(dist, round) {
	return _.pairs(distToObject(dist, round)).sort(function(p1, p2) { return p1[1] === p2[1] ? 0 : p1[1] < p2[1] ? 1 : -1 });
}

var KL = function(p, q) {
	return objectKL(distToObject(p), distToObject(q));
}

var arrayKL = function(p, q) {
	return objectKL(_.object(p), _.object(q));
}

var objectKL = function(p, q) {
	return _.reduce(
		_.mapObject(p, function(val, key) {
			return val*Math.log(val/q[key])/Math.log(2);
	
		}), 
		function (sum, val) { return sum + val }
	);
}

var arraySwap = function(arr, i, j) {
	var temp = arr[i];
	arr[i] = arr[j];
	arr[j] = temp;
	return arr;
}

var mapProduct = function(fn, arr1, arr2) {
	return _.flatten(
		_.map(arr1, function(item1) {
			return _.map(arr2, function(item2) {
				return fn(item1, item2);
			});
		}), false);		
}


module.exports = {
        round : round,	
	distToArray : distToArray,
	distToObject : distToObject,
	KL : KL,
	objectKL : objectKL,
	arrayKL : arrayKL,
	arraySwap : arraySwap,
}

