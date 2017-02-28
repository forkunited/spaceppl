var _ = require("underscore");

var apply = function(utterance, world, parameters) {
    if (utterance === "") {
    	return 1.0;
    } else {
        return eval(utterance)(world, parameters);
    }
}

module.exports = {
	apply : apply
}
