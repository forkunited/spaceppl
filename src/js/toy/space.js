var _ = require("underscore");
var Tensor = require("adnn/tensor");

var translatePoint = function(point, xTrans, yTrans) {
	return [point[0] + xTrans, point[1] + yTrans]
}

var scalePoint = function(point, xScale, yScale) {
	return [point[0]*xScale, point[1]*yScale]
}

var rotatePoint = function(point, theta) {
	return [point[0]*Math.cos(theta)-point[1]*Math.sin(theta), point[0]*Math.sin(theta)+point[1]*Math.cos(theta)]
}

var nearPoints = function(point1, point2, parameters) {
	return Math.sigmoid(-(1.0/parameters.nearVagueness)*(distanceL2(point1, point2) - parameters.nearThreshold))
}

var distanceL2 = function(point1, point2) {
	return Math.sqrt(Math.pow(point1[0] - point2[0], 2.0) + Math.pow(point1[1] - point2[1], 2.0));
}

var near = function(ref1, ref2) {
	return function(world, parameters) {
		//return { p1 : world[ref1][0], distance : distance(world[ref1], world[ref2])};
		return parameters.nearFn(world[ref1], world[ref2], parameters);
	};
}

var makePointVector = function(points) {
	var pointVector = _.flatten(points);
	return new Tensor([pointVector.length,1]).fromFlatArray(pointVector);
}

var network = function(point1, point2, params) {
	//console.log("Input");
	//console.log(input)
	
	var inputVector = makePointVector([point1,point2]);
	var h = T.tanh(T.add(T.dot(params.W[0], inputVector), params.b[0]));
	var output = T.add(T.dot(params.W[1], h), params.b[1]);

	//var inputAsArray = input.toFlatArray();
	// console.log("height: " + inputAsArray[0] +
	//     ", weight: " + inputAsArray[1] +
	//     ", output: " + T.sumreduce(ad.value(output)));
	//
	//console.log("points " + point1 + " " + point2);
	//console.log("input " + inputVector);
	//console.log("output " + output);
	return T.sumreduce(output)
	
}

var nearPointsNetwork = function(point1, point2, parameters) {
	//var pointVector = _.flatten([point1,point2]);//makePointVector([point1,point2]);
	//console.log("Argument");
	//console.log(pointVector);
	var measurement = network(point1, point2, parameters.nearPointsNetworkParameters);
	return ad.scalar.sigmoid(ad.scalar.mul(1.0/parameters.nearVagueness, ad.scalar.sub(measurement, parameters.nearThreshold)));
}

module.exports = { 
	translatePoint : translatePoint,
	scalePoint : scalePoint,
	rotatePoint : rotatePoint,

	distanceL2: distanceL2,
	
	near: near, 

	nearPoints : nearPoints,
	nearPointsNetwork : nearPointsNetwork
}

