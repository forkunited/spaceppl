var _ = require("underscore");

var apply = function(utterance, world, parameters) {
	return eval(utterance)(world, parameters);
}

var makeUtterances = function(possibilities) {
	if (typeof(possibilities[0]) === 'string') {
		return possibilities;
		//return _.map(possibilities, function(possibility) { return utterance + possibility });
	} else {
		var strPossibilities = _.map(possibilities, function(p) { return makeUtterances(p) });

		if (strPossibilities.length >= 3) {
			return strProduct(_.first(strPossibilities), 
				strProduct(_.reduce(_.initial(_.rest(strPossibilities)),
					function(acc, p) { return strProduct(acc, p, "", ",") },[""]),
				_.last(strPossibilities), "",""),
				"(", ")");	
		} else if (strPossibilities.length == 2) {
			return strProduct(_.first(strPossibilities),_.last(strPossibilities), "(", ")");
		} else {
			return strPossibilities;
		}
	}
}

var strProduct = function(strList1, strList2, midStr, endStr) {
	return _.flatten(_.map(strList1, function(str1) {
		return _.map(strList2, function(str2) {
			return str1 + midStr + str2 + endStr
		})
	}));
}

module.exports = {
	apply : apply,
	makeUtterances : makeUtterances
}
