(function(fwurg){

function violation(os, m) { 
  return {about: os, message: m};
}
	
	
var singlePlanetConstraint = function(system, orbit) {
	var aboutObjects = [];
	// orbit is important
	aboutObjects.push(orbit);
	
	var orbitals = orbit.orbitals();
	var planetCount = 0;
	
	// check every orbital for planet type features.
	for (var x in orbitals) {
		var orbital = orbitals[x];
		features = orbital.featuresByClass("planet_type");
		if (features.length > 0) {
			// planet type feature found add it to the count and Objectslist.
			planetCount += features.length;
			aboutObjects.push(orbital);
		}
	}
	
	// constraint is violated.
	if (planetCount > 1) {
		return [violation(aboutObjects, 'An orbit can contain only a single planet or gas giant')];
	}
	else return [];
}

fwurg.system.checker = new fwurg.system.constraints.Checker();

var checker = fwurg.system.checker;

checker.addOrbitCheck(singlePlanetConstraint);

})(fwurg);