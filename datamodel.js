(function(fwurg){


fwurg.system.init = function () {
	var system = new fwurg.system.System({
		'gas mass': 50,
		'rock mass': 100,
		'bio mass': 200
	});
	// alias the Orbit constructor
	var O = fwurg.system.Orbit;

	system.star(new O(system));
	system.star().addFeature("rules:orange_giant_star");
	
	system.addOrbit(new O(system).addFeature("rules:hot_orbit"));
	system.addOrbit(new O(system).addFeature("rules:hot_orbit"));
	system.addOrbit(new O(system).addFeature("rules:goldilocks_orbit"));
	system.addOrbit(new O(system).addFeature("rules:goldilocks_orbit"));
	system.addOrbit(new O(system).addFeature("rules:cold_orbit"));
	system.addOrbit(new O(system).addFeature("rules:cold_orbit"));
	system.addOrbit(new O(system).addFeature("rules:cold_orbit"));
	
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
	console.log(orbital.resources());
	console.log(system);
	console.log(system.resources());
	
}





})(fwurg);
