(function(fwurg){
	
fwurg.system.view = {};

fwurg.system.view.drawSystem = function() {
	var system = fwurg.system.datamodel;
	var s = $("<div id='system'>").appendTo($('#overview').empty());
	
	console.log("draw system");
	
	var orbits = system.orbits();
	for (x in orbits) {
		var o = $("<div id='orbit_"+x+"' class='orbit' >").appendTo(s);
		//console.log("draw orbit "+x);
		fwurg.system.view.drawOrbit(orbits[x], o);
	}	
	
}


fwurg.system.view.drawOrbit = function(orbit, orbitdiv) {
	var fs = orbit.features();
	fwurg.system.view.drawFeatures(fs, orbitdiv);
	var orbitals = orbit.orbitals();
	for (x in orbitals) {
		var orb = $("<div id='orbital_"+x+"' class='orbital' >").appendTo(orbitdiv);
		//console.log("draw orbital "+x);
		fwurg.system.view.drawOrbital(orbitals[x], orb);
	}
	
}

fwurg.system.view.drawOrbital = function(orbital, orbitaldiv) {
	
	var fs = orbital.features();
	fwurg.system.view.drawFeatures(fs, orbitaldiv);
}

fwurg.system.view.drawFeatures = function(features, objectdiv) {
	for (x in features) {
		var f = features[x];
		
		if (f.isA("orbit_type")) {
			objectdiv.addClass(""+f.id().split(":")[1]);
		}
		else {
			// if it has no name use id.
			if (typeof f._data.name == 'undefined') {
				objectdiv.append(f.id()+" ");
			}			
			else {
				objectdiv.append(f._data.name+" ");
			}
		}
	}
}


})(fwurg);