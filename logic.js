var or = function(p, q, parameters) {
	return function(world) {
		return p(world) + q(world); // FIXME
	}
}

var and = function(p, q, parameters) {
	return function(world) {
		return p(world) * q(world); // FIXME
	}
}

var not = function(p, parameters) {
	return function(world) {
		return 1.0 - p(world); // FIXME
	}
}

module.exports = {
	or : or, 
	and : and,
	not : not
}
