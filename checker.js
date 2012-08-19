(function(fwurg){

var ConstraintChecker = function() {
	this._system = {};
	this._systemChecks = [];
	this._orbitChecks = [];
	this._orbitalChecks = [];
}

ConstraintChecker.prototype.system = function(v){if(typeof v=='undefined')return this._system; this._system=v; return this;};
ConstraintChecker.prototype.addSystemCheck = function(func) { this._systemChecks.push(func); return this; }
ConstraintChecker.prototype.addOrbitCheck = function(func) { this._orbitChecks.push(func); return this; }
ConstraintChecker.prototype.addOrbitalCheck = function(func) { this._OrbitalChecks.push(func); return this; }

ConstraintChecker.prototype.runSystem = function() {
	var orbits = this._system.orbits();
	// for every orbit.
	for (var o= 0; o < orbits.length; o++) {
		var currentOrbit = orbits[o];
		// run all the orbit checks on this orbit.
		for (var x in this._orbitChecks) {
			var result = this._orbitChecks[x](this._system, currentOrbit);
			
			if (result != false) {
				console.log(result[0]);
				console.log(result[1]);
			}
		}
	}
}

fwurg.system.constraints = {
	Checker:  ConstraintChecker
};

})(fwurg);