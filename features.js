(function(fwurg, $){
	// alias the feature constructor
	var F = fwurg.system.Feature;

	// set up wiki
	var wiki = new fwurg.Wiki('http://fwurg.xs4all.nl/dokuwiki/_export/strataendpoint/', 'tech:relations_endpoint', 'tech:resources_endpoint');

	// get query builder
	var qb = wiki.qb();
	
	/**
	  * Function that creates a feature.
	  * getting data from the map.
	  * creating feature with key k.
	  * using the custom resources function.
	 */
	var createFeature = function(map, k,  resources) {
		try {
			var f = null;	
			// if the Feature alrady exists use it.
			if (F.exists(k)) {
				f = F.get(k);
			}
			else {
				f = new F(k);
			}
			// assigning the classes.
			var cs = {}; for(var x in map['is a']) cs[map['is a'][x]] = true;
			f.data('classes',cs);
			// assigning resources function
			f.data('__resources', resources);
		} catch(e) {console.log('Failed for ',k); }
	}
	
	// query the stars
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: star_class')
	)).then(function(data) {
		if (data.status == 'ok') {
			// run over features
			for(var k in data.body) { 
				// function to make sure that the k value is used in a new scope.
				(function() {
					var map = data.body[k];
					// create the feature with the custom resources function
					createFeature(map, k,  function() {
						return {
							'gas mass': -parseInt(map['Gas Cost'][0]),
							'hot orbits': parseInt(map['Hot Orbits'][0]),
							'goldilocks orbits': parseInt(map['Goldilocks Orbits'][0]),
							'cold orbits': parseInt(map['Cold Orbits'][0])
						};
					});
				})();
			}
		}
		else {
			console.log(data);
		}
	});
	
	// gass giants
	var qb = wiki.qb();
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: planet_type',
		'?s Type: Gas Giant'
		)
	)).then(function(data) {
		console.log(data);
	});
	
	// planets
	var qb = wiki.qb();
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: planet_type',
		'?s Type: Terrestrial'
		)
	)).then(function(data) {
		console.log(data);
	});
	// moons
	
	var qb = wiki.qb();
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: moon_type')
	)).then(function(data) {
		console.log(data);
	});
})(fwurg, jQuery);
