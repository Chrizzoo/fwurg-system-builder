(function(fwurg){
	
fwurg.system.view = {};
var orbital_count = 0;
	
/** 
 * Draw the complete system overview in the #overview element using the systemmodel.
 * This function creates the orbit div elements that are filled by drawOrbit.
 */
fwurg.system.view.drawSystem = function() {
	var system = fwurg.system.systemmodel;
	
	// add the system element.
	var s = $("<div id='system'>").appendTo($('#overview').empty());
	
	//reset the orbital counter.
	orbital_count = 0;
	
	var orbits = system.orbits();
	for (x in orbits) {
		var o = $("<div id='orbit_"+x+"' class='orbit' >").appendTo(s);
		o.click(selectSystemObject("orbit_"+x));
		o.data('orbit', orbits[x]);
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
		var orb = $("<div id='orbital_"+orbital_count+"' class='orbital' >").appendTo(orbitdiv);
		orb.click(selectSystemObject("orbital_"+orbital_count));
		orb.data('orbital', orbitals[x]);
		//console.log("draw orbital "+x);
		drawOrbital(orbitals[x], orb);
		orbital_count++;
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
  * Redraw the system.
  */
var redrawAfterSelection = function() {
	fwurg.system.view.drawSystem();
	displayResources();
}

/** 
  * Add an orbital to the orbitIndex. The orbital gets the orbitalfeature.
  */
var createNewOrbital = function (orbit, orbitalFeature) {
	var orb = new fwurg.system.Orbital(orbit);
	orb.addFeature(orbitalFeature);
	orbit.addOrbital(orb);
}

/*
 * helper function that provides the star options and supplies the onclick handler.
 */
var starFunction = function(orbit, orbitIndex) {
	addOptions(["star_class"], function(starFeature) {
		// remove old star.
		orbit.removeFeaturesByClass("star_class");
		// apply new star
		fwurg.system.applyStar(starFeature, orbitIndex);
		// redraw the system.
		redrawAfterSelection();
	});
}

/*
 * helper function that provides the orbital options and supplies the onclick handler.
 */
var orbitalFunction = function(orbit) {
	addOptions(["planet_type", "moon_type"], function(orbitalFeature) {
		// create a new orbital object.
		createNewOrbital(orbit, orbitalFeature);
		redrawAfterSelection();
	});
}

/*
 * helper function that provides the feature options and supplies the onclick handler.
 */
var featureFunction = function(object) {
	addOptions(["biosphere", "climate"], function(feature) {
		// apply the feature to the object.
		object.addFeature(feature);
		redrawAfterSelection();
	});
}

/** 
  * function that adds options to the #options element.
  * @param classes are the classes where the features are selected from that are added.
  * @param clickFunction the function that is used if the option is selected. It will be called with the Feature that is belongs to. 
  */
var addOptions= function(classes, clickFunction) {
	var options = $('#options');
	
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

/**
 * handle the selection of an object in the system. (orbit or orbital)
 */
var selectSystemObject = function (objectId) {
	return function (e) {
		$(".orbit").removeClass("selected");
		$(".orbital").removeClass("selected");
		$("#"+objectId).addClass("selected");
		
		// make sure a planet selection does not become an orbit selection.
		e.stopPropagation();
		
		// empty the options if a new object is selected.
		$('#options').empty();
		
		if ($(this).hasClass('orbit')) {
			var orbitIndex = $(this).attr('id').split("_")[1];
			var orbit = $(this).data('orbit');
			if (orbit.hasFeature("rules:star_orbit")) {
				starFunction(orbit, orbitIndex);
			} else  {
				orbitalFunction(orbit);
			}				
		}
		else if ($(this).hasClass('orbital')) {
			var orbital = $(this).data('orbital');
			featureFunction(orbital);
		}
	}
}

/** 
 * display the resources in the resources element.
 */
var displayResources = function() {
	var system = fwurg.system.systemmodel;
	var startingResources = fwurg.system.startingResources;
	// make a working copy of the startingResources.
	var useRes = {};
	for (k in startingResources) {
		useRes[k] = startingResources[k];
	}
	var res = system.resources(useRes);
	$("#resources").empty().append(JSON.stringify(res));
}

})(fwurg);