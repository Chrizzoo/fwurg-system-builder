(function(fwurg){


fwurg.system.init = function () {
	
	// starting resources to feed to a system.resources call.
	var startingResources = {
		'gas mass': 50,
		'rock mass': 100,
		'bio mass': 200
	};
	
	var system = fwurg.system.applyStar("rules:orange_giant_star");
	
	var orbit_0 = system.Orbits()[0];
	var giant = new fwurg.system.Orbital(orbit_0);
	orbit_0.addOrbital(giant);
	giant.addFeature("rules:brown_dwarf");
	
	var orbit = system.Orbits()[2];
	var orbital = new fwurg.system.Orbital(orbit);
	orbit.addOrbital(orbital);
	orbital.addFeature("rules:large_planet");
	orbital.addFeature("rules:type_ii_atmosphere");
	orbital.addFeature("rules:oceans");
	
	// debug prints.
	console.log(orbital.resources());
	console.log(system);
	console.log(system.resources(startingResources));
	
}

/**
  * Apply a star feature, creating a new system with the necessary orbits.
  */
fwurg.system.applyStar = function(starFeature) {
	// alias the Orbit constructor
	var O = fwurg.system.Orbit;
	
	// create a clean system.
	var s = new fwurg.system.System();
	
	// add the star feature to the star orbit.
	s.star(new O(s).addFeature(starFeature));
	
	var f = fwurg.system.Feature.get(starFeature);
	var orbitresources = f.benefit();
	
	if(typeof orbitresources['hot orbits'] != 'undefined') {
		for(i = 0; i < orbitresources['hot orbits']; i++) {
			s.addOrbit(new O(s).addFeature("rules:hot_orbit"));
		}
	}
	if(typeof orbitresources['goldilocks orbits'] != 'undefined') {
		for(i = 0; i < orbitresources['goldilocks orbits']; i++) {
			s.addOrbit(new O(s).addFeature("rules:goldilocks_orbit"));
		}
	}
	if(typeof orbitresources['cold orbits'] != 'undefined') {
		for(i = 0; i < orbitresources['cold orbits']; i++) {
			s.addOrbit(new O(s).addFeature("rules:cold_orbit"));
		}
	}
	return s;
}

})(fwurg);
