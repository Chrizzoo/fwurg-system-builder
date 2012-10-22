(function(fwurg, $){
	// alias the feature constructor
	var F = fwurg.system.Feature;
	
	// initialize the features with hardcoded data.

	/**
	 *  Basic resource method that returns costs as negative integers.
	*/
	var defaultCost = function() {
		var result = {};
		// construct correct resources dictionary
		for(var x in this.data('cost')) result[x]   = -this.data('cost')[x];
		return result;
	}
	/**
	 *  Basic resource method that returns benefits as positive integers.
	*/
	var defaultBenefit = function() {
		var result = {};
		// construct correct resources dictionary
		for(var x in this.data('benefit')) result[x] =  this.data('benefit')[x];
		return result;
	}	
	
    // -- Orbit types

    var hot_orbit = new F("rules:hot_orbit", ["orbit_type"]);
    var goldilocks_orbit = new F("rules:goldilocks_orbit", ["orbit_type"]);
    var cold_orbit = new F("rules:cold_orbit", ["orbit_type"]);
    var star_orbit = new F("rules:star_orbit", ["orbit_type"]);
    var no_orbit = new F("rules:no_orbit", ["orbit_type"]);
	
	// -- Gas Giants 

	// declare cost function generator
	var gasGiantCost = function(normal, gold) {
		return function(system, orbit, orbital) {
			var result = {};

			// custom cost
			if (orbit.hasFeature(goldilocks_orbit)) {
				result['gas mass'] = gold;
			} else {
				result['gas mass'] = normal;
			}
			return result;
		};
	}
	
	var brown_dwarf = new F("rules:brown_dwarf", ["gas_giant_type", "planet_type"]);
	brown_dwarf.data('_cost', gasGiantCost(-5, -9));
	brown_dwarf.data('_benefit', defaultBenefit);

	var jovian_giant = new F("rules:jovian_giant", ["gas_giant_type", "planet_type"]);
	jovian_giant.data('_cost', gasGiantCost(-4, -5));
	jovian_giant.data('_benefit', defaultBenefit);
	
	var ice_giant = new F("rules:ice_giant", ["gas_giant_type", "planet_type"]);
	ice_giant.data('_cost', gasGiantCost(-3, -1));
	ice_giant.data('_benefit', defaultBenefit);
	
	// -- Atmospheres
	
	// debug ->var orbit = new fwurg.system.Orbit("test"); fwurg.system.Feature._list["rules:type_iii_atmosphere"].resources("test", orbit, new fwurg.system.Orbital(orbit).addFeature("rules:large_planet"));

	// declare biosphere cost generator
	var biosphereCost = function(factor) {
		return function(system, orbit, orbital) {
			var result = {};
			result['bio mass'] = 0;
			var res = orbital.benefit(); 
			if(typeof res['zones'] != 'undefined') result['bio mass'] = -res['zones']*factor;
			return result;
		};
	}

	var atmos4 = new F("rules:type_iv_atmosphere", ["biosphere", "atmosphere"])
    	.data('_cost', biosphereCost(1))
    	.data('_benefit', defaultBenefit)
    	.data('image', "rules:type_iv_atmosphere.png")
    	.data('name', "Type IV Atmosphere");

	var atmos3 = new F("rules:type_iii_atmosphere", ["biosphere", "atmosphere"])
	.data('_cost', biosphereCost(2))
	.data('_benefit', defaultBenefit)
	.data('image', "rules:type_iv_atmosphere.png")
	.data('name', "Type III Atmosphere");
	
	var atmos2 = new F("rules:type_ii_atmosphere", ["biosphere", "atmosphere"])
	.data('_cost', biosphereCost(3))
	.data('_benefit', defaultBenefit)
	.data('image', "rules:type_ii_atmosphere.png")
	.data('name', "Type II Atmosphere");
	
	var atmos1 = new F("rules:type_i_atmosphere", ["biosphere", "atmosphere"])
	.data('_cost', biosphereCost(4))
	.data('_benefit', defaultBenefit)
	.data('image', "rules:type_i_atmosphere.png")
	.data('name', "Type I Atmosphere");
	
	var natural_life = new F("rules:natural_life", ["biosphere"])
	.data('_cost', biosphereCost(1))
	.data('_benefit', defaultBenefit)
	.data('image', "")
	.data('name', "Natural Life");
	
	var oceans = new F("rules:oceans", ["biosphere"])
	.data('_cost', biosphereCost(1))
	.data('_benefit', defaultBenefit)
	.data('image', "rules:water_ocean.png")
	.data('name', "Oceans");

	// automatically create the rest of the features with wiki data.
	
	/**
	  * Function that creates a feature.
	  * creating feature with key id.
	  * getting data from the map.
	 */
	var createFeature = function(id, map, noDescription) {
		try {
			var f = null;

			// if the Feature already exists use it
			if (F.exists(id)) {
				f = F.get(id);
			} else {
				f = new F(id, map['is a']);
				// set default resources method
				f.data('_cost', defaultCost);
				f.data('_benefit', defaultBenefit);
				
				f.data('name', map['entry title'][0]);
				f.data('image', map['Image'][0]);
				if (typeof noDescription == 'undefined') {
					f.data('description', map['Description'][0]);
				}
			}
		// return created/fetched feature
		return f;
		} catch(e) {
			console.log('Failed for ',id); 
		}
	}
	

	// set up wiki
	var wiki = new fwurg.Wiki('http://fwurg.xs4all.nl/dokuwiki/_export/strataendpoint/', 'tech:relations_endpoint', 'tech:resources_endpoint');

	// get query builder
	var qb = wiki.qb();	
	
	// build the queries
	var queries = {};
		
	queries.stars = {endpoint: wiki.endpoint('resources'), query: qb.query(
		qb.fields('?s'),
		qb.where('?s is a: star_class')
	)};
	queries.gas_giants = {endpoint: wiki.endpoint('resources'), query: qb.query(
		qb.fields('?s'),
		qb.where('?s is a: planet_type',
		'?s Type: Gas Giant')
	)};
	queries.planets = {endpoint: wiki.endpoint('resources'), query: qb.query(
		qb.fields('?s'),
		qb.where('?s is a: planet_type',
		'?s Type: Terrestrial')
	)};
	queries.moons = {endpoint: wiki.endpoint('resources'), query: qb.query(
		qb.fields('?s'),
		qb.where('?s is a: moon_type')
	)};
	queries.climates = {endpoint: wiki.endpoint('resources'), query: qb.query(
		qb.fields('?s'),
		qb.where('?s is a: climate')
	)};
	
	queries.specials = {endpoint: wiki.endpoint('resources'), query: qb.query(
		qb.fields('?s'),
		qb.where('?s is a: special_option')
	)};
	
	// start loading all the features from the wiki.
	wiki.queries(queries).then(function(data) {		
		
		// run over the stars
		if(data.stars.status == 'ok') {
			for(var k in data.stars.body) {
				var properties = data.stars.body[k];
				// create feature.
				var feature = createFeature(k, properties, true);

				// set relevant data
				feature.data('benefit', {
					'hot orbits': parseInt(properties['Hot Orbits'][0]),
					'goldilocks orbits': parseInt(properties['Goldilocks Orbits'][0]),
					'cold orbits': parseInt(properties['Cold Orbits'][0])
				});

				// some more data
				feature.data('cost', {
					'gas mass': parseInt(properties['Gas Cost'][0])
				});
			}
		} else {
			console.log(data.stars);
		}	
		
		// run over the gas giants
		if(data.gas_giants.status == 'ok') {
			for(var k in data.gas_giants.body) {
				var properties = data.gas_giants.body[k];
				// create feature.
				var feature = createFeature(k, properties);

				// set relevant data
				feature.data('benefit', {
					'lunar orbits': parseInt(properties['Lunar Orbits'][0]),
					'zones': parseInt(properties['Zones'][0])
				});
				
				// add name and image here because they do not use the normal feature creation.
				feature.data('name', properties['entry title'][0]);
				feature.data('image', properties['Image'][0]);
			}
		} else {
			console.log(data.gas_giants);
		}

		// run over the planets
		if(data.planets.status == 'ok') {
			for(var k in data.planets.body) {
				var properties = data.planets.body[k];
				// create feature.
				var feature = createFeature(k, properties);
				// some more data
				feature.data('benefit', {
					'lunar orbits': parseInt(properties['Lunar Orbits'][0]),
					'zones': parseInt(properties['Zones'][0])
				});
				feature.data('cost', {
					'rock mass': parseInt(properties['Cost'][0])
				});
			}
		} else {
			console.log(data.planets);
		}	
		
		// run over the moons
		if(data.moons.status == 'ok') {
			for(var k in data.moons.body) {
				var properties = data.moons.body[k];
				// create feature.
				var feature = createFeature(k, properties);
				// some more data
				feature.data('benefit', {
					'zones': parseInt(properties['Zones'][0])
				});
				feature.data('cost', {
					'lunar orbits': parseInt(properties['Lunar Orbits Used'][0]),
					'rock mass': parseInt(properties['Cost'][0])
				});
			}
		} else {
			console.log(data.moons);
		}		
		
		// run over the climates
		if(data.climates.status == 'ok') {
			for(var k in data.climates.body) {
				var properties = data.climates.body[k];
				// create feature.
				var feature = createFeature(k, properties);
				// no need for additional data?
			}
		} else {
			console.log(data.climates);
		}
		
		// run over the specials
		if(data.specials.status == 'ok') {
			for(var k in data.specials.body) {
				var properties = data.specials.body[k];
				// create feature.
				
				// add the category for the builder as a class.
				properties['is a'].push(properties['Builder'][0]);
				
				var feature = createFeature(k, properties);
				feature.data('cost', {
					'special points': parseInt(properties['Cost'][0])
				});
				feature.data('applies_to', properties['Applies To'][0]);
			}
		} else {
			console.log(data.specials);
		}
		console.log("loaded features from wiki.");
		fwurg.system.init();
	});
	
})(fwurg, jQuery);
