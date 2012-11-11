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
	// make your_system clickable (for systemwide features and later the name)
	var nameval = "Your system name!";
	if (system.name() != '') {
		nameval = system.name();
	}
		
	var o = $("<div id='your_system' class='system'>"+nameval+"</div>").appendTo(s);
	o.click(selectSystemObject("your_system"));
	
	//reset the orbital counter.
	orbital_count = 0;
	
	var orbits = system.orbits();
	for (x in orbits) {
		var o = $("<div id='orbit_"+x+"' class='orbit' >").appendTo(s);
		o.click(selectSystemObject("orbit_"+x));
		o.data('orbit', orbits[x]);
		//console.log("draw orbit "+x);
		
		if (x == 0) {
			o.text("Select your star!");
		}
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
		var orb = $("<div id='orbital_"+orbital_count+"' class='orbital' title='"+orbitals[x].name()+"'>").appendTo(orbitdiv);
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
			objectdiv.empty().append($("<img src='"+fwurg.system.view.imgRoot+f._data.image+"?w=75' title='"+f._data.name+"'/>"));
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
 * helper function that provides the system feature options and supplies the onclick handler.
 */
var systemFeaturesFunction = function(system) {
	addOptions({"system": "Specials"}, function(feature) {
		// apply the feature to the object.
		system.addFeature(feature);
		fwurg.system.view.redrawAfterSelection();
	});
	
}

/*
 * helper function that provides the star options and supplies the onclick handler.
 */
var starFeaturesFunction = function(orbit, orbitIndex) {
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
var orbitFeaturesFunction = function(orbit) {
	addOptions({"planet_type": "Planets", "moon_type": "Moons"}, function(orbitalFeature) {
		// create a new orbital object.
		createNewOrbital(orbit, orbitalFeature);
		fwurg.system.view.redrawAfterSelection();
	});
	addOptions({"orbit": "Specials"}, function(feature) {
		// handle special cases.
		handleSpecialFeatureAddition(orbit, feature);
		// apply the feature to the object.
		orbit.addFeature(feature);
		fwurg.system.view.redrawAfterSelection();
	});
}

/*
 * helper function that provides the feature options and supplies the onclick handler.
 */
var orbitalFeaturesFunction = function(object) {
	showFeaturesSelected();
	addOptions({"biosphere": "Biospheres", "climate": "Climates", "orbital": "Specials"}, function(feature) {
		// handle special cases.
		handleSpecialFeatureAddition(object, feature);
		// apply the feature to the object.
		object.addFeature(feature);
		fwurg.system.view.redrawAfterSelection();
	});
}

var addNameInput = function(object) {
	var options = $('#options');
	var header = $("<div class='input_name'>Name: <input id='current_object_name' type='text' value='"+object.name()+"'></div>");
	
	var button = $("<input type='button' id='update_object_name' value='Update name'>");
	button.click(function() {
		var val = $('#current_object_name').val();
		object.name(val);
		fwurg.system.view.redrawAfterSelection();
	});
	button.appendTo(header);
	header.appendTo(options);
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
			var description = "";
			if (typeof feature.data('description') != 'undefined') {
				description = feature.data('description');
			}
			var control = $("<div id='"+feature.id()+"' class='feature' title='"+description+"'><div class='feature_name'>"+feature._data.name+"</div><div class='feature_image'><img src='"+fwurg.system.view.imgRoot+feature._data.image+"?w=100' /></div></div>");
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
	// get the object.
	var object = $('#selected_object').data('object');
	
	// display the header title with the object name.
	var displayName = "";
	if (typeof object.name != 'undefined') {
		displayName = object.name();
	}
	else {
		if (typeof $('.selected').attr('id') != 'undefined') {
			displayName = $('.selected').attr('id').replace("_", " ");
		}
	}
	var selected_object = $('#selected_object').empty().append("<h2>Selected Object: "+displayName+"</h2>");
	
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
  * Function that is called when a feature addition is requested.
  * This function handles special cases.
  * @param o, the object that the features belong to.
  * @param f, the feature that is to be deleted.
  */
var handleSpecialFeatureAddition = function (o, f) {
	if (f == "rules:active_sun" && (! o.hasFeature("rules:active_sun"))) {
		//upgrade the orbit.
		if (o.hasFeature("rules:cold_orbit")) {
			o.removeFeature("rules:cold_orbit");
			o.addFeature("rules:goldilocks_orbit");
		}
		else if (o.hasFeature("rules:goldilocks_orbit")) {
			o.removeFeature("rules:goldilocks_orbit");
			o.addFeature("rules:hot_orbit");
		}
	}
}

/**
  * Function that is called when a feature addition is requested.
  * This function handles special cases.
  * @param o, the object that the features belong to.
  * @param f, the feature that is to be deleted.
  */
var handleSpecialFeatureDeletion = function (o, f) {
	if (f == "rules:active_sun" && (o.hasFeature("rules:active_sun"))) {
		//downgrade the orbit.
		if (o.hasFeature("rules:hot_orbit")) {
			o.removeFeature("rules:hot_orbit");
			o.addFeature("rules:goldilocks_orbit");
		}
		else if (o.hasFeature("rules:goldilocks_orbit")) {
			o.removeFeature("rules:goldilocks_orbit");
			o.addFeature("rules:cold_orbit");
		}
	}
}



/**
  * Function that is called when a feature deletion is requested.
  * This function handles special cases.
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
		// handle special cases.
		handleSpecialFeatureDeletion(o,f);
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
		$("#your_system").removeClass("selected");
		$(".orbit").removeClass("selected");
		$(".orbital").removeClass("selected");
		
		$("#"+objectId).addClass("selected");
		
		// make sure a planet selection does not become an orbit selection.
		e.stopPropagation();
		
		// empty the options if a new object is selected.
		$('#options').empty();
		
		if ($(this).hasClass('system')) {
			// set the currently selected object.
			var system = fwurg.system.systemmodel;
			$('#selected_object').data('object', system);
			addNameInput(system);
			systemFeaturesFunction(system);
			
		}		
		if ($(this).hasClass('orbit')) {
			var orbitIndex = $(this).attr('id').split("_")[1];
			var orbit = $(this).data('orbit');
			// set the currently selected object.
			$('#selected_object').data('object', orbit);
			if (orbit.hasFeature("rules:star_orbit")) {
				starFeaturesFunction(orbit, orbitIndex);
			} else  {
				orbitFeaturesFunction(orbit);
			}				
		}
		else if ($(this).hasClass('orbital')) {
			var orbital = $(this).data('orbital');
			// set the currently selected object.
			$('#selected_object').data('object', orbital);
			addNameInput(orbital);
			orbitalFeaturesFunction(orbital);
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

	//$("#resources").empty().append(JSON.stringify(res));
	$("#resources").empty().append("<h2>Resources</h2>");
	
	for (x in res) {
		$("#resources").append("<div>"+fwurg.icons.draw(x.replace(" ", "-"))+" "+x+ ": "+res[x]+"</div>");
	}
}

var displayConstraintViolations = function() {
	var violations = fwurg.system.systemmodel.check(fwurg.system.checker.getChecks());
	console.log(violations);
	
	$("#violations").empty().append("<h2>Violations</h2>");
	
	for (var x in violations) {
		$("#violations").append(violations[x].message+"<br/>");
	}
	
}

})(fwurg);