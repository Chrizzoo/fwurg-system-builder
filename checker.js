(function(fwurg){

var ConstraintChecker = function() {
	this._systemChecks = [];
	this._orbitChecks = [];
	this._orbitalChecks = [];
}

ConstraintChecker.prototype.addSystemCheck = function(func) { this._systemChecks.push(func); return this; }
ConstraintChecker.prototype.addOrbitCheck = function(func) { this._orbitChecks.push(func); return this; }
ConstraintChecker.prototype.addOrbitalCheck = function(func) { this._OrbitalChecks.push(func); return this; }

ConstraintChecker.prototype.check = function(system) {
	var orbits = system.orbits();
	// for every orbit.
	for (var o in orbits) {
		var currentOrbit = orbits[o];
		// run all the orbit checks on this orbit.
		for (var x in this._orbitChecks) {
			var result = this._orbitChecks[x](system, currentOrbit);
			
			if (result.length > 0) {
				for (var x in result) {
					var res = result[x];
					console.log(res.about);
					console.log(res.message);
				}
			}
		}
	}
}

fwurg.system.constraints = {
	Checker:  ConstraintChecker
};

})(fwurg);