(function(fwurg){

/**
 * A feature.
 */
var Feature = function(id) {
	this._id = id;
	this._data = {};
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

//generic getters/setters
Feature.prototype.id = function(){return this._id;};
Feature.prototype.toString = Feature.prototype.id;
Feature.prototype.data = function(d,v) {if(typeof v=='undefined')return this._data[d];this._data[d]=v;return this;}

/**
 * Determines the cost of the feature, based on custom data and
 * the context of use.
 */
Feature.prototype.resources = function(system, orbit, orbital) {
	if(typeof this.data('__resources') == 'function') {
		return this.data('__resources')(system, orbit, orbital);
	} else if(typeof this.data('__resources') == 'object') {
		return this.data('__resources');
	} else {
		return {};
	}
}


/**
 * An orbital
 */
var Orbital = function(orbit) {
	this._orbit = orbit;
	this._features = {};
	this._name = "";
	this._image = "";
	this._description = "";
}

Orbital.prototype.name = function(v){if(typeof v=='undefined')return this._name; this._name=v; return this;}
Orbital.prototype.image = function(v){if(typeof v=='undefined')return this._image; this._image=v; return this;}
Orbital.prototype.description = function(v){if(typeof v=='undefined')return this._description; this._description=v; return this;}
Orbital.prototype.orbit = function(){return this._orbit;};

Orbital.prototype.hasFeature = function(f){return f in this._features;}
Orbital.prototype.addFeature = function(f){this._features[f] = true; return this;}
Orbital.prototype.removeFeature = function(f){delete this._features[f]; return this;}

/**
 * Returns a list of features, or sets the list of features.
 */
Orbital.prototype.features = function(fs) {
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
 * Determines the resources of this orbital.
 */
Orbital.prototype.resources = function(r) {
	if(typeof r == 'undefined') r = {};
	var fs = this.features();
	for(var i in fs) {
		var f = fs[i];
		var c = f.resources(this.orbit().system(), this.orbit(), this);
		for(var x in c) {
			if(typeof r[x] == 'undefined') r[x]=0;
			r[x] += c[x];
		}
	}
	return r;
}


fwurg.system = {
	Orbital: Orbital,
	Feature: Feature
};


})(fwurg);
