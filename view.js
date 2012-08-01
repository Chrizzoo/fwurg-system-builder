(function(fwurg){
	
fwurg.system.view = {};

/** 
 * Draw the complete system overview in the #overview element using the systemmodel.
 * This function creates the orbit div elements that are filled by drawOrbit.
 */
fwurg.system.view.drawSystem = function() {
	var system = fwurg.system.systemmodel;
	var s = $("<div id='system'>").appendTo($('#overview').empty());
	
	console.log("draw system");
	
	var orbits = system.orbits();
	for (x in orbits) {
		var o = $("<div id='orbit_"+x+"' class='orbit' >").appendTo(s);
		//console.log("draw orbit "+x);
		drawOrbit(orbits[x], o);
	}	
}

/** 
 * Draw an orbit element using the orbit from the systemmodel.
 * This function creates the orbitals div elements that are filled by drawOrbital.
 */
var drawOrbit = function(orbit, orbitdiv) {
	var fs = orbit.features();
	drawFeatures(fs, orbitdiv);
	var orbitals = orbit.orbitals();
	for (x in orbitals) {
		var orb = $("<div id='orbital_"+x+"' class='orbital' >").appendTo(orbitdiv);
		//console.log("draw orbital "+x);
		drawOrbital(orbitals[x], orb);
	}
}

/** 
 * Draws the features on an orbital element using the orbital from the systemmodel
 */
var drawOrbital = function(orbital, orbitaldiv) {
	var fs = orbital.features();
	drawFeatures(fs, orbitaldiv);
}

/**
 * Handles the feature drawing by applying css or adding text.
 */
var drawFeatures = function(features, objectdiv) {
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

/** 
  * Redraw the system and empty the options.
  */
var redrawAfterSelection = function() {
	$('#options').empty();
	fwurg.system.view.drawSystem();
	fwurg.system.view.drawControls();
}

/** 
  * Remove the old star from the system because you only want 1 system in the orbitIndex orbit. 
  */
var removeOldStar = function (orbitIndex) {
	var orbits = fwurg.system.systemmodel.orbits();
	orbits[orbitIndex].removeFeaturesByClass("star_class");
}

/** 
  * Add an orbital to the orbitIndex. The orbital gets the orbitalfeature.
  */
var createNewOrbital = function (orbitIndex, orbitalFeature) {
	var orbits = fwurg.system.systemmodel.orbits();
	console.log(orbitIndex);
	var orb = new fwurg.system.Orbital(orbits[orbitIndex]);
	orb.addFeature(orbitalFeature);
	orbits[orbitIndex].addOrbital(orb);
}

/*
 * helper function that returns a function that handles applying a new star feature.
 */
var starFunction = function(orbitIndex) {
	return function() {
		addOptions(["star_class"], function(starFeature) {
			removeOldStar(orbitIndex);
			fwurg.system.applyStar(starFeature, orbitIndex);
			redrawAfterSelection();
		});
	};
}

var orbitalFunction = function(orbitIndex) {
	return function() {
		addOptions(["planet_type", "moon_type"], function(orbitalFeature) {
			createNewOrbital(orbitIndex, orbitalFeature);
			redrawAfterSelection();
		});
	};
}


/**
 * Draw the controls in the #controls element and applies click functions.
 */
fwurg.system.view.drawControls = function() {
	var controls = $('#controls').empty();
	var system = fwurg.system.systemmodel;
	var orbits = system.orbits();
	for (var x in orbits) {
		var o = $("<div id='orbit_control_"+x+"' class='orbit_control' >").appendTo(controls);
		if (orbits[x].hasFeature("rules:star_orbit")) {
			var control = $("<div class='control'>Change Star</div>");
			control.click(starFunction(x));
			control.appendTo(o);
				
			
		} else if (orbits[x].hasFeature("rules:no_orbit")) {
			// no controls.
		} else  {
			var control = $("<div class='control'>Add Orbital</div>");
			control.click(orbitalFunction(x));
			control.appendTo(o);
		}
	}	
	
}

/** 
  * function that adds options to the #options element.
  * @param classes are the classes where the features are selected from that are added.
  * @param clickFunction the function that is used if the option is selected. It will be called with the Feature that is belongs to. 
  */
var addOptions= function(classes, clickFunction) {
	var options = $('#options').empty();
	
	for(x in classes) {
		var opts = fwurg.system.Feature.getByClass(classes[x]);
		for (y in opts) {
			
			var feature = opts[y];
			var control = $("<div id='"+feature.id()+"' class='option'>"+feature._data.name+"</div>");
			control.data('feature', feature);
			control.appendTo(options);
			
			control.click( function () {
				var feat = $(this).data('feature');
				clickFunction(feat.id());
				}
			);
				

		}
	}
}

})(fwurg);