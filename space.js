var _ = require("underscore");
var Tensor = require("adnn/tensor");

var nearPoints = function(point1, point2, parameters) {
	return Math.sigmoid(-(1.0/parameters.nearVagueness)*(distance(point1, point2) - parameters.nearThreshold))
}

var distance = function(point1, point2) {
	return Math.sqrt(Math.pow(point1[0] - point2[0], 2.0) + Math.pow(point1[1] - point2[1], 2.0));
}

var near = function(ref1, ref2) {
	return function(world, parameters) {
		//return { p1 : world[ref1][0], distance : distance(world[ref1], world[ref2])};
		return parameters.nearFn(world[ref1], world[ref2], parameters);
	};
}

//var makePointVector = function(points) {
//	var pointVector = _.flatten(points);
//	return new Tensor([pointVector.length,1], pointVector);
//}

var nearPointsNetwork = function(point1, point2, parameters) {
	var pointVector = _.flatten([point1,point2]);//makePointVector([point1,point2]);
	console.log("Argument");
	console.log(pointVector);
	var measurement = parameters.nearNetwork(1);//pointVector);
	console.log("Finished Measure");
	return ad.scalar.sigmoid(ad.scalar.mul(1.0/parameters.nearVagueness, ad.scalar.sub(measurement, parameters.nearThreshold)));
}

module.exports = { 
	near: near, 

	nearPoints : nearPoints,
	nearPointsNetwork : nearPointsNetwork
}

