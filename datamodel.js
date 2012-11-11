(function(fwurg){

fwurg.system.systemmodel = {};
// starting resources to feed to a system.resources call.
fwurg.system.startingResources = {
		'gas mass': 50,
		'rock mass': 100,
		'bio mass': 200,
		'special points': 5
	};

fwurg.system.init = function (dump) {
	// create a clean system.
	var system = new fwurg.system.System();
	
	// assign to accessible variable.
	fwurg.system.systemmodel = system;
	
	if(typeof dump == 'undefined') {	
		// star orbit + 10 orbits.
		for(i = 0; i <= 10; i++) {
			system.addOrbit(new fwurg.system.Orbit(system));
		}
		
		// get the orbits for editting.
		var orbits = system.orbits();
		
		// assign star orbit.
		orbits[0].addFeature("rules:star_orbit");
		fwurg.system.view.drawSystem();
		fwurg.system.displayDumpTools(); 
	}
	else {
		// load the orbits and features from the dump object.
		system.load(dump);
		fwurg.system.view.redrawAfterSelection();
	}
}

/**
  * Apply a star feature to a system and set the orbits according to the stars orbits.
  */
fwurg.system.applyStar = function(starFeature, starIndex) {
	var orbits = fwurg.system.systemmodel.orbits();
	var current = 0;

	for (x in orbits) {
		// remove the old orbit types
		var selectedFeatures = orbits[x].featuresByClass('orbit_type');
		for(y in selectedFeatures) {
			orbits[x].removeFeature(selectedFeatures[y].id());
		}
	}
	
	// add the star feature to the starIndex orbit.
	orbits[starIndex].addFeature("rules:star_orbit").addFeature(starFeature);
	
	// get the star feature and fetch the orbit amounts.
	var f = fwurg.system.Feature.get(starFeature);
	var orbitresources = f.benefit();
	
	// assign the amount of orbit_name with the orbit_type feature
	var handleOrbits = function(orbit_name, orbit_type) {
		if(typeof orbitresources[orbit_name] != 'undefined') {
			for(i = 0; i < orbitresources[orbit_name]; i++) {
				if (current == starIndex) {
					current++;
				}
				orbits[current].addFeature(orbit_type);
				current++;
			}
		}
	}
	handleOrbits('hot orbits', "rules:hot_orbit");
	handleOrbits('goldilocks orbits', "rules:goldilocks_orbit");
	handleOrbits('cold orbits', "rules:cold_orbit");

	for (i = current; i <= 10; i++) {
		if (i != starIndex) {
			orbits[i].addFeature("rules:no_orbit");
		}

	}
}

var dumpSystem = function() {
	console.log("dump system");
	var version = "1.0";
	var root = {};
	
	root.builder_version = version;	
	root.system_version = fwurg.system.system_version + 1;
		
	var res = fwurg.system.systemmodel.dump(root);
	var text = JSON.stringify(res);
	$("textarea#dump_area").val(text);

}

var loadSystem = function () {
	var text = $("textarea#dump_area").val();
	if (text != "") {
		console.log("load system");
		var obj = JSON.parse(text);
		var system = obj.system;
		console.log("Builder version: "+ obj.builder_version);
		console.log("System version: "+ obj.system_version);
		fwurg.system.system_version = obj.system_version;
		fwurg.system.init(system);
	}
}

fwurg.system.displayDumpTools = function() {
	var sys = $("#dump_system").append("<h2>System Dump</h2>");
	sys.append('<textarea id="dump_area" style="width: 500px; height: 50px;"></textarea>');
	var dump = $('<button id="dump_button" type="button">Dump!</button>');
	dump.click(dumpSystem);
	sys.append(dump);
	var load = $('<button id="load_button" type="button">Load!</button>');
	load.click(loadSystem);
	sys.append(load);
}

fwurg.system.system_version = 0;


})(fwurg);
