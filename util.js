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

var unifySupport = function(p, q) {
	return objectUnifySupport(distToObject(p), distToObject(q));
}

var arrayUnifySupport = function(p, q) {
	return objectUnifySupport(_.object(p), _.object(q));
}

var objectUnifySupport = function(p, q) {
	var support = _.union(_.keys(p), _.keys(q));
	var newP = _.object(_.map(support, function(item) {
		return _.has(p, item) ? [item, p[item]] : [item, 0]
	}));

	var newQ = _.object(_.map(support, function(item) {
		return _.has(q, item) ? [item, q[item]] : [item, 0]
	}));

	return [newP,newQ];
}

var topMatch = function(p, q) {
    return objectTopMatch(distToObject(p), distToObject(q));
}

var arrayTopMatch = function(p, q) {
    return objectTopMatch(_.object(p), _.object(q));
}

var objectTopMatch = function(p, q) {
	var pList = _.pairs(p);
	var qList = _.pairs(q);

	var pSorted = _.sortBy(pList, function(v){ return -v[1]; });
    var qSorted = _.sortBy(qList, function(v){ return -v[1]; });

	var pTop = _.filter(pSorted, function(v) { return v[1] == pSorted[0][1] });
    var qTop = _.filter(qSorted, function(v) { return v[1] == qSorted[0][1] });

    return _.some(mapProduct(function(v1, v2) {
    	return _.isEqual(v1[0], v2[0]);
    }, pTop, qTop)) ? 1 : 0;
}

var KL = function(p, q) {
	return objectKL(distToObject(p), distToObject(q));
}

var arrayKL = function(p, q) {
	return objectKL(_.object(p), _.object(q));
}

var objectKL = function(p, q) {
	/*var pq = objectUnifySupport(p,q);
	var uP = pq[0];
	var uQ = pq[1];*/

	return _.reduce(
		_.mapObject(p, function(val, key) {
			return (q[key] == 0) ? 0 : val*Math.log(val/q[key])/Math.log(2);
	
		}), 
		function (sum, val) { return sum + val }
	);
}

var kendallTauDistance = function(p, q) {
	return objectKendallTauDistance(distToObject(p), distToObject(q));
}

var arrayKendallTauDistance = function(p, q) {
	return arrayKendallTauDistance(_.object(p), _.object(q));
}

var objectKendallTauDistance = function(p, q) {
	var pq = objectUnifySupport(p,q);
	var uP = pq[0];
	var uQ = pq[1];
	var support = _.keys(uP);

	var results = _.reduce(_.flatten(
		_.map(support, function(i1) {
			return _.map(support, function(i2) {
				if (i1 >= i2 || uP[i1] == uP[i2]) {
					return { v : 0.0, n : 0.0 };
				} else if (Math.sign(uP[i1]-uP[i2]) == Math.sign(uQ[i1]-uQ[i2])) {
					return { v: 0.0, n : 1.0 };
				} else {
					return { v: 1.0, n : 1.0 };
				}
			})
		})), function(acc, i) { return { v : acc.v + i.v, n: acc.n + i.n } }, { v : 0, n : 0 }); 

	return results.v/results.n;
}

var weightedKendallTauDistance = function(p, q) {
	return objectWeightedKendallTauDistance(distToObject(p), distToObject(q));
}

var arrayWeightedKendallTauDistance = function(p, q) {
	return arrayWeightedKendallTauDistance(_.object(p), _.object(q));
}

var objectWeightedKendallTauDistance = function(p, q) {
	var pq = objectUnifySupport(p,q);
	var uP = pq[0];
	var uQ = pq[1];
	var support = _.keys(uP);

	var results = _.reduce(_.flatten(
		_.map(support, function(i1) {
			return _.map(support, function(i2) {
				if (i1 >= i2 || uP[i1] == uP[i2]) {
					return { v : 0.0, n : 0.0 };
				} else if (Math.sign(uP[i1]-uP[i2]) == Math.sign(uQ[i1]-uQ[i2])) {
					return { v: 0.0, n : uP[i1]*uP[i2] };
				} else {
					return { v: uP[i1]*uP[i2], n : uP[i1]*uP[i2] };
				}
			})
		})), function(acc, i) { return { v : acc.v + i.v, n: acc.n + i.n } }, { v : 0, n : 0 }); 

	return results.v/results.n;
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

module.exports = {
	round : round,
	distToArray : distToArray,
	distToObject : distToObject,
	KL : KL,
	objectKL : objectKL,
	arrayKL : arrayKL,
    topMatch : topMatch,
    objectTopMatch : objectTopMatch,
    arrayTopMatch : arrayTopMatch,
	unifySupport : unifySupport,
	kendallTauDistance : kendallTauDistance,
	objectKendallTauDistance : objectKendallTauDistance,
	arrayKendallTauDistance : arrayKendallTauDistance,
	weightedKendallTauDistance : weightedKendallTauDistance,
	objectWeightedKendallTauDistance : objectWeightedKendallTauDistance,
	arrayWeightedKendallTauDistance : arrayWeightedKendallTauDistance,
	objectUnifySupport : objectUnifySupport,
	arrayUnifySupport : arrayUnifySupport,
	arraySwap : arraySwap,
	objectToString : objectToString,
	objectListToTSVString : objectListToTSVString
}

