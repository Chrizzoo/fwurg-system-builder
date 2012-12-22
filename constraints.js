(function(fwurg){

function violation(os, m) { 
  return {about: os, message: m};
}

/**
  * return the orbitals from an orbit that have a feature with class featureclass.
  */
var getOrbitals = function(orbit, featureclass) {
	var result = [];
	var orbitals = orbit.orbitals();
	// check every orbital for planet type features.
	for (var x in orbitals) {
		var orbital = orbitals[x];
		if (orbital.containsFeaturesByClass(featureclass)) {
			result.push(orbital);
		}
	}
	return result;
}

/** ===== System Constraints ===== **/

var largePlanetConstraint = function(system) {
	var result = [];
	var orbits = system.orbits();
	
	// variables to keep track of the large planet found.
	var currentLargePlanet = null;
	var currentOrbit = 0;
	var currentOrbitType = null;
	
	
	for (x in orbits) {
		
		var orbit = orbits[x];
		var orbitType = orbit.featuresByClass("orbit_type")[0];
		var orbitals =  orbit.orbitals();
		var heavy_gravity_world = orbit.hasFeature("rules:heavy_gravity_world");
		
		// perform check that states that the orbit after the large planet orbit must be empty. 
		if (currentLargePlanet != null && x == currentOrbit +1 && orbitals.length > 0) {
			var aboutObjects = [];
			aboutObjects.push(orbits[currentOrbit]);
			aboutObjects.push(currentLargePlanet);
			aboutObjects.push(orbits[x]);
			result.push(violation(aboutObjects, 'A large planet consumes two orbits. (the next orbit must be empty)'));
		}
		
		// perform check that states that the orbit after the large planet orbit must be of the same orbit type 
		if (currentLargePlanet != null && x == currentOrbit +1 && orbitType != currentOrbitType) {
			var aboutObjects = [];
			aboutObjects.push(orbits[currentOrbit]);
			aboutObjects.push(currentLargePlanet);
			aboutObjects.push(orbits[x]);
			result.push(violation(aboutObjects, 'A large planet consumes two orbits that must be of the same orbit type. (the next orbit must be of the same type)'));
		}
		
		/* reset the values */
		currentLargePlanet = null;
		currentOrbit = 0;
		currentOrbitType = null;
		
				
		for (var y in orbitals) {
			var orbital = orbitals[y];
			// Found a new large planet and it does not have the heavy gravity world special.
			if (orbital.hasFeature("rules:large_planet") && ! heavy_gravity_world) {
				currentLargePlanet = orbital;
				currentOrbit = parseInt(x);
				currentOrbitType = orbitType; 
			}
		}
	}
	return result;
}

/** ===== Orbit Constraints ===== **/

var singlePlanetConstraint = function(orbit) {
	var aboutObjects = [];
	// get the required information.
	var planets = getOrbitals(orbit, "planet_type");
	var planetCount = planets.length;
	// add the orbit and the planets it concerns.
	aboutObjects.push(orbit);
	aboutObjects = aboutObjects.concat(planets);
	// constraint is violated.
	if (planetCount > 1) {
		return [violation(aboutObjects, 'An orbit can contain only a single planet or gas giant.')];
	}
	else return [];
}

var lunarOrbitsConstraint = function(orbit) {
	var aboutObjects = [];
	var res= orbit.resources();
	aboutObjects.push(orbit);
	if (res['lunar orbits'] < 0) {
		return [violation(aboutObjects, 'The orbit contains more moons than it can support. (not enough lunar orbits.)')];
	}
	else return [];
}

var noOrbitConstraint = function(orbit) {
	var aboutObjects = [];
	var noOrbit = orbit.hasFeature("rules:no_orbit");
	aboutObjects.push(orbit);
	if (orbit.orbitals().length > 0 && noOrbit) {
		return [violation(aboutObjects, 'This orbit can not contain orbitals. (It is not a valid orbit.)')];
	}
	else return [];
}

/** ===== Orbital Constraints ===== **/


var atmosphereCountConstraint = function(orbital) {
	var aboutObjects = [];
	var atmos = orbital.featuresByClass("atmosphere");
	aboutObjects.push(orbital);
	if (atmos.length > 1) {
		return [violation(aboutObjects, 'This orbital can only have one atmosphere.')];
	}
	else return [];
}

var atmosphereGoldilockConstraint = function(orbital) {
	var aboutObjects = [];
	var atmos = orbital.featuresByClass("atmosphere");
	var orbit = orbital.orbit();
	var goldi = orbit.hasFeature("rules:goldilocks_orbit");
	aboutObjects.push(orbital);
	if (atmos.length > 0 && atmos[0].id() != "rules:type_iv_atmosphere" && !goldi) {
		return [violation(aboutObjects, 'Atmosphere IV is the best allowed atmosphere in orbits that are not goldilocks.')];
	}
	else return [];
}

var naturalLifeConstraint = function(orbital) {
	var aboutObjects = [];
	var atmos = orbital.containsFeaturesByClass("atmosphere"); 
	var natural_life = orbital.hasFeature("rules:natural_life");
	var orbit = orbital.orbit();
	var goldi = orbit.hasFeature("rules:goldilocks_orbit");
	aboutObjects.push(orbital);
	if (natural_life && ( !atmos || !goldi)) {
		return [violation(aboutObjects, 'Natural Life is only allowed on an orbital in goldilocks and there must be an atmosphere to support it.')];
	}
	else return [];
}

var climateAtmosphereGoldilockConstraint = function(orbital) {
	var aboutObjects = [];
	var climates = orbital.featuresByClass("climate");
	var atmos = orbital.containsFeaturesByClass("atmosphere"); 
	var orbit = orbital.orbit();
	var goldi = orbit.hasFeature("rules:goldilocks_orbit");

	aboutObjects.push(orbital);

	var underworld = orbital.hasFeature("rules:underworld");
	var solidified_core = orbital.hasFeature("rules:solidified_core");
	var underworld_exception  = climates.length == 1 && solidified_core && underworld;
	
	if (climates.length > 0 && (!atmos || ! goldi) && ! underworld_exception) {
		return [violation(aboutObjects, 'Climates are only allowed on a orbital in goldilocks that has an atmosphere.')];
	}
	else return [];	
}

var climateCountConstraint = function(orbital) {
	var aboutObjects = [];
	var climates = orbital.featuresByClass("climate");
	
	var underworld = orbital.hasFeature("rules:underworld");
	var solidified_core = orbital.hasFeature("rules:solidified_core");
	var underworld_exception = climates.length == 4 && solidified_core && underworld;
	
	aboutObjects.push(orbital);
	if (climates.length > 3 && ! underworld_exception) {
		return [violation(aboutObjects, 'An orbital can have maximally 3 climates.')];
	}
	else return [];	
}


// create the Checker instance that contains the lists with checks
fwurg.system.checker = new fwurg.system.constraints.Checker();
var checker = fwurg.system.checker;

checker.addCheck('system', largePlanetConstraint);

checker.addCheck('orbit', singlePlanetConstraint);
checker.addCheck('orbit', lunarOrbitsConstraint);
checker.addCheck('orbit', noOrbitConstraint);

checker.addCheck('orbital', atmosphereCountConstraint);
checker.addCheck('orbital', atmosphereGoldilockConstraint);
checker.addCheck('orbital', naturalLifeConstraint);
checker.addCheck('orbital', climateAtmosphereGoldilockConstraint);
checker.addCheck('orbital', climateCountConstraint);


/* 
=== Done ===
for every orbit:

orbit: 1 terrestial planet. max
orbit: lunar orbits >= 0.
orbit: no orbit = no orbitals.

for every orbital:

1 atmosphere per orbital
atmosphere only if goldi (exception atmos4)
natural life if atmosphere and goldi
climates only with atmosphere in goldilocks
3 climates max.

=== Todo ===
no atmospheres && climates on gas giants, astroid belts,  rings, trojan astroids
*/



})(fwurg);