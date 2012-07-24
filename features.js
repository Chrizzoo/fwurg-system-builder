(function(fwurg, $){
	// alias the feature constructor
	var F = fwurg.system.Feature;

	// set up wiki
	var wiki = new fwurg.Wiki('http://fwurg.xs4all.nl/dokuwiki/_export/strataendpoint/', 'tech:relations_endpoint', 'tech:resources_endpoint');

	// get query builder
	var qb = wiki.qb();
	
	// initialize the features with hardcoded data.
	
	// debug -> fwurg.system.Feature._list["rules:brown_dwarf"].resources("test", new fwurg.system.Orbit("1", "goldilocks"));
	
	// -- Gas Giants 

	// declare cost function generator
	var gasGiantCost = function(normal, gold) {
		return function(system, orbit, orbital) {
			var result = {};

			// custom cost
			if (orbit.getType() == 'goldilocks') {
				result['gass mass'] = gold;
			} else {
				result['gass mass'] = normal;
			}

			// usual benefit
			for(var x in this.data('benefit')) result[x] =  this.data('benefit')[x];
			return result;
		};
	}
	
	// brown dwarf
	var brown_dwarf = new F("rules:brown_dwarf", ["gas_giant_type", "planet_type"]);
	brown_dwarf.data('__resources', gasGiantCost(-5, -9));

	var jovian_giant = new F("rules:jovian_giant", ["gas_giant_type", "planet_type"]);
	jovian_giant.data('__resources', gasGiantCost(-4, -5));

	var ice_giant = new F("rules:ice_giant", ["gas_giant_type", "planet_type"]);
	ice_giant.data('__resources', gasGiantCost(-1, -3));
	
	// -- Atmospheres
	
	// debug ->var orbit = new fwurg.system.Orbit("test"); fwurg.system.Feature._list["rules:type_iii_atmosphere"].resources("test", orbit, new fwurg.system.Orbital(orbit).addFeature("rules:large_planet"));

    // declare biosphere cost generator
	var biosphereCost = function(factor) {
		return function(system, orbit, orbital) {
			var result = {};
			result['bio mass'] = 0;
			var res = orbital.resources(); // FIXME: endless loop! (Correct fix: split cost and benefit functionality)
			if(typeof res['zones'] != 'undefined') result['bio mass'] = -res['zones']*factor;
			return result;
		};
	}

	var atmos4 = new F("rules:type_iv_atmosphere", ["biosphere"]);
	var atmos3 = new F("rules:type_iii_atmosphere", ["biosphere"]);
	var atmos2 = new F("rules:type_ii_atmosphere", ["biosphere"]);
	var atmos1 = new F("rules:type_i_atmosphere", ["biosphere"]);
	var natural_life = new F("rules:natural_life", ["biosphere"]);
	var oceans = new F("rules:oceans", ["biosphere"]);
	atmos4.data('__resources', biosphereCost(1));	
	atmos3.data('__resources', biosphereCost(2));	
	atmos2.data('__resources', biosphereCost(3));	
	atmos1.data('__resources', biosphereCost(4));	
	natural_life.data('__resources', biosphereCost(1));	
	oceans.data('__resources', biosphereCost(1));

	// automatically create the rest of the features with wiki data.
	
	/**
	  * Function that creates a feature.
	  * creating feature with key id.
	  * getting data from the map.
	 */
	var createFeature = function(id, map) {
		try {
			var f = null;

			// if the Feature already exists use it
			if (F.exists(id)) {
				f = F.get(id);
			} else {
				f = new F(id, map['is a']);
				// set default resources method
				f.data('__resources', featureResources);
			}
		// return created/fetched feature
		return f;
		} catch(e) {
			console.log('Failed for ',id); 
		}
	}
	
	/**
	 *  Basic resource method that returns benefits as positive integers and costs as negative integers.
	*/
	var featureResources = function() {
		var result = {};
		// construct correct resources dictionary
		for(var x in this.data('benefit')) result[x] =  this.data('benefit')[x];
		for(var x in this.data('cost')) result[x]   = -this.data('cost')[x];
		return result;
	}
	
	// query the stars
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: star_class')
	)).then(function(data) {
		if (data.status == 'ok') {
		// run over features
		for(var k in data.body) {
			var properties = data.body[k];

			// create feature.
			var feature = createFeature(k, properties);

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
			console.log(data);
		}
	});
	
	// gas giants
	var qb = wiki.qb();
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: planet_type',
		'?s Type: Gas Giant'
		)
	)).then(function(data) {
		if (data.status == 'ok') {
		// run over features
		for(var k in data.body) {
			var properties = data.body[k];

			// create feature.
			var feature = createFeature(k, properties);

			// set relevant data
			feature.data('benefit', {
				'lunar orbits': parseInt(properties['Lunar Orbits'][0]),
				'zones': parseInt(properties['Zones'][0])
			});

			}
		} else {
			console.log(data);
		}
	});
	
	// planets
	var qb = wiki.qb();
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: planet_type',
		'?s Type: Terrestrial'
		)
	)).then(function(data) {
		if (data.status == 'ok') {
		// run over features
		for(var k in data.body) {
			var properties = data.body[k];

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
			console.log(data);
		}
	});
	
	// moons
	var qb = wiki.qb();
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: moon_type')
	)).then(function(data) {
		if (data.status == 'ok') {

		// run over features
		for(var k in data.body) {
			var properties = data.body[k];
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
			console.log(data);
		}
	});
	
	// climates
	var qb = wiki.qb();
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: climate')
	)).then(function(data) {
		if (data.status == 'ok') {

		// run over features
		for(var k in data.body) {
			var properties = data.body[k];
			// create feature.
			var feature = createFeature(k, properties);
			// no need for additional data?
			}
		} else {
			console.log(data);
		}
	});	
	
})(fwurg, jQuery);
