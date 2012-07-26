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
Feature.prototype.cost = function(system, orbit, orbital) {
	return resourcesPartial('__resources_cost')(system, orbit, orbital);
}

/**
 * Determines the benefit of the feature, based on custom data and
 * the context of use.
 */
Feature.prototype.benefit = function(system, orbit, orbital) {
	return resourcesPartial('__resources_benefit')(system, orbit, orbital);
}

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
			var c = fn(this.orbit().system(), this.orbit(), this);			
			for(var x in c) {
				if(typeof r[x] == 'undefined') r[x]=0;
				r[x] += c[x];
			}
		}
		return r;
	};
}

Orbital.prototype.cost = function(r) {
	return orbitalResourcesPartial('cost')(r);
}

Orbital.prototype.benefit = function(r) {
	return orbitalResourcesPartial('benefit')(r);
}

/**
 * Determines the resources of this orbital.
 */
Orbital.prototype.resources = function(r) {
	var cost = this.cost(r);
	var benefit = this.benefit(r);
	return mergeResourceObjects(cost, benefit);
}

/**
 * The orbit itself.
 */
var orbitalIdCounter = 0;
var orbitalId = function() {
	return orbitalIdCounter++;
}

/* 
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
			var c = fn(this.orbit().system(), this.orbit());
			for(var x in c) {
				if(typeof r[x] == 'undefined') r[x]=0;
				r[x] += c[x];
			}
		}
		for(var k in this._orbitals) {
			var fn = this._orbitals[k][function_val];
			fn(r);
		}
		return r;
	};
}

Orbit.prototype.cost = function(r) {
	return orbitResourcesPartial('cost')(r);
}

Orbit.prototype.benefit = function(r) {
	return orbitResourcesPartial('benefit')(r);
}


/**
 * Determines the resources of this orbit.
 */
Orbit.prototype.resources = function(r) {
	var cost = this.cost(r);
	var benefit = this.benefit(r);
	return mergeResourceObjects(cost, benefit);
}


fwurg.system = {
	Orbit: Orbit,
	Orbital: Orbital,
	Feature: Feature
};


})(fwurg);
