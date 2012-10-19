(function(fwurg){
	
fwurg.system.view = {};
fwurg.system.view.imgRoot = "http://fwurg.xs4all.nl/dokuwiki/_media/";
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
	
	/* visual hax for large planet */
	$('div.orbit:has(div.large_planet)').addClass('large_planet_orbit');
	$('div.orbit:has(div.large_planet)').next().addClass('empty_orbit');

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
		
		if (f.isA("star_class")) {
			objectdiv.append($("<img src='"+fwurg.system.view.imgRoot+f._data.image+"?w=50' title='"+f._data.name+"'/>"));
		}
		else {
			// add all feature classes as css classes.
			var classes = f.classes();
			for (x in classes) {
				objectdiv.addClass(classes[x]);
			}
			
			// add all the features (remove the rules: for convenience)
			objectdiv.addClass(""+f.id().split(":")[1]);
		}
	}
}

/** 
  * Redraw the system.
  */
fwurg.system.view.redrawAfterSelection = function() {
	fwurg.system.view.drawSystem();
	displayResources();
	showFeaturesSelected();
	displayConstraintViolations();
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
	addOptions({"star_class": "Stars"}, function(starFeature) {
		// remove old star.
		orbit.removeFeaturesByClass("star_class");
		// apply new star
		fwurg.system.applyStar(starFeature, orbitIndex);
		// redraw the system.
		fwurg.system.view.redrawAfterSelection();
	});
}

/*
 * helper function that provides the orbital options and supplies the onclick handler.
 */
var orbitalFunction = function(orbit) {
	addOptions({"planet_type": "Planets", "moon_type": "Moons"}, function(orbitalFeature) {
		// create a new orbital object.
		createNewOrbital(orbit, orbitalFeature);
		fwurg.system.view.redrawAfterSelection();
	});
}

/*
 * helper function that provides the feature options and supplies the onclick handler.
 */
var featureFunction = function(object) {
	showFeaturesSelected();
	addOptions({"biosphere": "Biospheres", "climate": "Climates"}, function(feature) {
		// apply the feature to the object.
		object.addFeature(feature);
		fwurg.system.view.redrawAfterSelection();
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
		var opts = fwurg.system.Feature.getByClass(x);
		var header = $("<div class='feature_group_name'>"+classes[x]+"</div>");
		header.appendTo(options);
		for (y in opts) {
			var feature = opts[y];

			var control = $("<div id='"+feature.id()+"' class='feature'><div class='feature_name'>"+feature._data.name+"</div><div class='feature_image'><img src='"+fwurg.system.view.imgRoot+feature._data.image+"?w=100' /></div></div>");
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
  * show the features on the currently selected object.
  */
var showFeaturesSelected = function() {
	var object = $('#selected_object').data('object');
	var selected_object = $('#selected_object').empty();
	if (typeof object != 'undefined') {
		var features = object.features();
		for (x in features) {
			
			var feature = features[x];
			
			if (feature.isA("orbit_type")) {
				// skip this feature (user can not delete it)
			}
			else {
				var current_feature = $("<div id='"+feature.id()+"' class='feature'><div class='feature_name'>"+feature._data.name+"</div><div class='feature_image'><img src='"+fwurg.system.view.imgRoot+feature._data.image+"?w=100' /></div></div>");
				current_feature.appendTo(selected_object);
				var control = $("<div class='remove_feature'>X</div>");
				control.data('object', object);
				control.data('feature', feature);
				control.appendTo(current_feature);
				control.click( function () {
					var obj = $(this).data('object');
					var feat = $(this).data('feature');
					handleFeatureDeletion(obj, feat);
					}
				);
			}
		}
	}
}

/**
  * Function that is called when a feature deletion is requested.
  * @param o, the object that the features belong to.
  * @param f, the feature that is to be deleted.
  */
var handleFeatureDeletion = function(o, f) {
	// if it is a planet or moon remove the whole orbital.
	if (f.isA("planet_type") || f.isA("moon_type")) {
		// remove the currently selected item.
		$('#selected_object').removeData('object');
		// remove the whole orbital.
		o.orbit().removeOrbital(o);
		// clear the options and featurelist
		$('#options').empty();
		
	}
	else {
		// remove the specific feature.
		o.removeFeature(f.id());
	}
	
	fwurg.system.view.redrawAfterSelection();
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
			// set the currently selected object.
			$('#selected_object').data('object', orbit);
			if (orbit.hasFeature("rules:star_orbit")) {
				starFunction(orbit, orbitIndex);
			} else  {
				orbitalFunction(orbit);
			}				
		}
		else if ($(this).hasClass('orbital')) {
			var orbital = $(this).data('orbital');
			// set the currently selected object.
			$('#selected_object').data('object', orbital);
			featureFunction(orbital);
		}
		// display the features on the newly selected object.
		showFeaturesSelected();
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

var displayConstraintViolations = function() {
	var violations = fwurg.system.systemmodel.check(fwurg.system.checker.getChecks());
	console.log(violations);
	
	$("#violations").empty();
	
	for (var x in violations) {
		$("#violations").append(violations[x].message+"<br/>");
	}
	
}

})(fwurg);