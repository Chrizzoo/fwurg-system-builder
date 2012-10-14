(function(fwurg){

/**
 * A feature.
 */
var Feature = function(id, classes) {
	this._id = id;
	this._data = {};
    this._classes = {};
    for(var x in classes) this._classes[classes[x]] = true;
	Feature._list[id] = this;
}

// the global list of features
Feature._list = {};

/**
 * Retrieves a single feature by ID.
 */
Feature.get = function (id) {
	return Feature._list[id];
}

Feature.exists= function (id) {
	return typeof(Feature._list[id]) != 'undefined';
}

/**
 * Returns a list of features that have class name = true.
 */
Feature.getByClass = function(name) {
	var r=[];
	for(var id in Feature._list) {
		var feat = Feature._list[id];
		if (feat.isA(name)) {
			r.push(feat);
		}
	}
	return r;
}

//generic getters/setters
Feature.prototype.id = function(){return this._id;};
Feature.prototype.toString = Feature.prototype.id;
Feature.prototype.isA = function(f){return f in this._classes;};
Feature.prototype.classes = function(){var r=[];for(var f in this._classes) r.push(f);return r;}
Feature.prototype.data = function(d,v) {if(typeof v=='undefined')return this._data[d];this._data[d]=v;return this;}

var resourcesPartial = function(function_val) {
	return function(system, orbit, orbital) {
		if(typeof this.data(function_val) == 'function') {
			return this.data(function_val).apply(this,[system, orbit, orbital]);
		} else if(typeof this.data(function_val) == 'object') {
			return this.data(function_val);
		} else {
			return {};
		}
	};
}

var mergeResourceObjects = function(obj1, obj2) {
	var r = {};
	for(var x in obj1) {
		if(typeof r[x] == 'undefined') r[x]=0;
		r[x] += obj1[x];
	}
	for(var x in obj2) {
		if(typeof r[x] == 'undefined') r[x]=0;
		r[x] += obj2[x];
	}
	return r;
}

/**
 * Determines the cost of the feature, based on custom data and
 * the context of use.
 */
Feature.prototype.cost = resourcesPartial('_cost');


/**
 * Determines the benefit of the feature, based on custom data and
 * the context of use.
 */
Feature.prototype.benefit = resourcesPartial('_benefit');

/**
 * Determines the cost and benefit of the feature, based on custom data and
 * the context of use.
 */
Feature.prototype.resources = function(system, orbit, orbital) {
	var cost = this.cost(system, orbit, orbital);
	var benefit = this.benefit(system, orbit, orbital);
	return mergeResourceObjects(cost, benefit);
}

/**
 * Adds the feature aspect to a type.
 */
var featurify = function(type) {
	type.prototype.hasFeature = function(f){return f in this._features;};
	type.prototype.addFeature = function(f){this._features[f] = true; return this;};
	type.prototype.removeFeature = function(f){delete this._features[f]; return this;};

	var x = type.prototype.init;
	type.prototype.init = function() {
		x.apply(this);
		this._features = {};
	}

	/**
	 * Returns a list of features, or sets the list of features.
	 */
	type.prototype.features = function(fs) {
		if(typeof fs == 'undefined') {
			var r=[];
			for(var f in this._features) r.push(Feature.get(f));
			return r;
		} else {
			this._features = {};
			for(var k in fs) this.addFeature(fs[k]);
			return this;
		}
	}
	
	
	/**
	 * Returns a list of feature IDs.
	 */
	type.prototype.featureIDs = function() {
		var r=[];
		for(var f in this._features) r.push(f);
		return r;
	}

	/**
	 * Returns all features with the given class on this object.
	 */
	type.prototype.featuresByClass = function(classname) {
			var r=[];
            var fs = this.features();
			for(var i=0;i<fs.length;i++) {
				if (fs[i].isA(classname)) {
					r.push(fs[i]);
				}
			}
			return r;
	}
	
	/** 
	  * Returns true if the object contains at least one feature with the given class.
	  */
	type.prototype.containsFeaturesByClass = function(classname) {
		var f = this.featuresByClass(classname);
		return f.length > 0;
	}
	
	/**
	 * Removes all the features with the given class.
	 */
	type.prototype.removeFeaturesByClass = function(classname) {
        var fs = this.featuresByClass(classname);
		for(var i=0;i<fs.length;i++) this.removeFeature(fs[i]);
		return this;
	}
	
}


/**
 * An orbital
 */
var Orbital = function(orbit) {
	this._orbit = orbit;
	this._name = "";
	this._image = "";
	this._description = "";
	this.init();
}

Orbital.prototype.init = function(){};

featurify(Orbital);

Orbital.prototype.name = function(v){if(typeof v=='undefined')return this._name; this._name=v; return this;};
Orbital.prototype.image = function(v){if(typeof v=='undefined')return this._image; this._image=v; return this;};
Orbital.prototype.description = function(v){if(typeof v=='undefined')return this._description; this._description=v; return this;};
Orbital.prototype.orbit = function(){return this._orbit;};

var orbitalResourcesPartial = function(function_val) {
	return function(r) {
		if(typeof r == 'undefined') r = {};
		var fs = this.features();
		for(var i in fs) {
			var f = fs[i];
			var fn = f[function_val];
			var c = fn.apply(f, [this.orbit().system(), this.orbit(), this]);	
			for(var x in c) {
				if(typeof r[x] == 'undefined') r[x]=0;
				r[x] += c[x];
			}
		}
		return r;
	};
}

Orbital.prototype.cost = orbitalResourcesPartial('cost');
Orbital.prototype.benefit = orbitalResourcesPartial('benefit');

/**
 * Determines the resources of this orbital.
 */
Orbital.prototype.resources = function(r) {
	if(typeof r == 'undefined') r = {};
	this.cost(r);
	this.benefit(r);
	return r;
}

Orbital.prototype.check = function(checks) {
	var res = [];
	// do the orbital checks
	for (var x in checks['orbital']) {
		res = res.concat(checks['orbital'][x](this));	
	}
	return res;
}

Orbital.prototype.dump = function() {
	var res = {};
	res.name = this.name();
	res.features = this.featureIDs();
	return res;
}

Orbital.prototype.load = function(dump) {
	this.features(dump.features);
	return this;
}

var orbitalIdCounter = 0;
var orbitalId = function() {
	return orbitalIdCounter++;
}

/* 
 * The orbit itself.
 * @param system, the system that this orbit is part of.
 */
var Orbit = function(system) {
	this._system = system;
	this._orbitals = {};
	this.init();
}
Orbit.prototype.init = function(){}

featurify(Orbit);

Orbit.prototype.system = function(){return this._system;};
Orbit.prototype.addOrbital = function(orb){this._orbitals[orbitalId()] = orb; return this;};
Orbit.prototype.removeOrbital = function(orb){for(var i in this._orbitals) if(orb == this._orbitals[i]) delete this._orbitals[i]; return this;}
Orbit.prototype.orbitals = function(){var r = [];for(var k in this._orbitals) r.push(this._orbitals[k]); return r;};


var orbitResourcesPartial = function(function_val) {
	return function(r) {
		if(typeof r == 'undefined') r = {};
		var fs = this.features();
		for(var i in fs) {
			var f = fs[i];
			var fn = f[function_val];
			var c = fn.apply(f, [this.system(), this]);
			for(var x in c) {
				if(typeof r[x] == 'undefined') r[x]=0;
				r[x] += c[x];
			}
		}
		for(var k in this._orbitals) {
			var fn = this._orbitals[k][function_val];
			fn.apply(this._orbitals[k], [r]);
		}
		return r;
	};
}

Orbit.prototype.cost = orbitResourcesPartial('cost');
Orbit.prototype.benefit = orbitResourcesPartial('benefit');


/**
 * Determines the resources of this orbit.
 */
Orbit.prototype.resources = function(r) {
	if(typeof r == 'undefined') r = {};
	this.cost(r);
	this.benefit(r);
	return r;
}

Orbit.prototype.check = function (checks) {
	var res = [];
	
	// do the orbit checks
	for (var x in checks['orbit']) {
		res = res.concat(checks['orbit'][x](this));	
	}
	// let the orbitals check themselves.
	for(var k in this._orbitals) {
		res = res.concat(this._orbitals[k].check(checks));
	}
	return res;
}

Orbit.prototype.dump = function() {
	var res = {};
	res.features = this.featureIDs();
	res.orbitals = [];
	var orbitals = this.orbitals();
	for (o in orbitals) {
		res.orbitals.push(orbitals[o].dump());
	}
	return res;
}

Orbit.prototype.load = function(dump) {
	this.features(dump.features);
	for (o in dump.orbitals) {
		this.addOrbital(new fwurg.system.Orbital(this).load(dump.orbitals[o]));
	}
	return this;
}

var System = function() {
	this._name = "";
	this._orbits = [];
	this.init();
};


System.prototype.init = function(){}
	
featurify(System);

System.prototype.name = function(v){if(typeof v=='undefined')return this._name; this._name=v; return this;};
System.prototype.addOrbit = function(orb, i){ if(typeof i=='undefined') this._orbits.push(orb); else this._orbits[i] = orb; return this;};
System.prototype.removeOrbit = function(orb){for(var i in this._orbits) if(orb == this._orbits[i]) delete this._orbits[i]; return this;}
System.prototype.orbits = function(){var r = [];for(var k in this._orbits) r.push(this._orbits[k]); return r;};

var systemResourcesPartial = function(function_val) {
	return function(r) {
		if(typeof r == 'undefined') r = {};
		var fs = this.features();
		for(var i in fs) {
			var f = fs[i];
			var fn = f[function_val];
			var c = fn.apply(f, [this]);
			for(var x in c) {
				if(typeof r[x] == 'undefined') r[x]=0;
				r[x] += c[x];
			}
		}
		
		// get the resources from the orbits
		for(var k in this._orbits) {
			var fn = this._orbits[k][function_val];
			fn.apply(this._orbits[k], [r]);
		}
		return r;
	};
}

System.prototype.cost = systemResourcesPartial('cost');
System.prototype.benefit = systemResourcesPartial('benefit');

/**
 * Determines the resources of the whole system (all orbits and the star).
 */
System.prototype.resources = function(r) {
	if(typeof r == 'undefined') r = {};
	this.cost(r);
	this.benefit(r);
	return r;
}

System.prototype.check = function (checks) {
	var res = [];
	
	// do the system checks
	for (var x in checks['system']) {
		res = res.concat(checks['system'][x](this));	
	}
	// let the orbits check themselves.
	for(var k in this._orbits) {
		res = res.concat(this._orbits[k].check(checks));
	}
	return res;
}

System.prototype.dump = function(dump) {
	var system = {};
	dump.system = system;
	system.name = this._name;
	system.features = this.featureIDs();
	system.orbits = [];
	var orbits = this.orbits();
	for (o in orbits) {
		system.orbits.push(orbits[o].dump());
	}
	return dump;
}

System.prototype.load = function(dump) {
	this.name(dump.name);
	this.features(dump.features);
	for (o in dump.orbits) {
		this.addOrbit(new fwurg.system.Orbit(this).load(dump.orbits[o]));
	}
}

fwurg.system = {
	Orbit: Orbit,
	Orbital: Orbital,
	Feature: Feature,
	System: System
};


})(fwurg);
