var util = require("./util");
var counter = require("./counter");
var bilookup = require("./bilookup")
var matrix = require("./matrix");
var rgame = require("./rgame");
var feature = require("./feature");
var evaluation = require("./evaluation.js");

/*var dist = require("./dist");
var evaluation = require("./evaluation");
var semantics = require("./semantics");
var space = require("./space");
var logic = require("./logic");
var util = require("./util");*/

module.exports = {
	util : util,
	counter : counter,
	bilookup : bilookup,
    matrix : matrix,
	rgame : rgame,
	feature : feature,
	evaluation : evaluation/*,
	dist : dist,
	evaluation : evaluation,
	space : space,
	semantics : semantics,
	logic : logic,
	util : util*/
}
