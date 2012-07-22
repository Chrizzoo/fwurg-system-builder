(function(fwurg, $){
	// alias the feature constructor
	var F = fwurg.system.Feature;

	// set up wiki
	var wiki = new fwurg.Wiki('http://fwurg.xs4all.nl/dokuwiki/_export/strataendpoint/', 'tech:relations_endpoint', 'tech:resources_endpoint');

	// get query builder
	var qb = wiki.qb();
	
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
			}

            // return created/fetched feature
            return f;
		} catch(e) {
            console.log('Failed for ',id); 
        }
	}
	
	// query the stars
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: star_class')
	)).then(function(data) {
		if (data.status == 'ok') {
            // declare resource method
            var starResources = function() {
                var result = {};
                // construct correct resources dictionary
                for(var x in this.data('orbits')) result[x] =  this.data('orbits')[x];
                for(var x in this.data('cost')) result[x]   = -this.data('cost')[x];
                return result;
            }

			// run over features
			for(var k in data.body) {
                var properties = data.body[k];

                // create feature.
                var feature = createFeature(k, properties);

                // set relevant data
                feature.data('orbits', {
	    			'hot orbits': parseInt(properties['Hot Orbits'][0]),
    				'goldilocks orbits': parseInt(properties['Goldilocks Orbits'][0]),
				    'cold orbits': parseInt(properties['Cold Orbits'][0])
                });

                // some more data
                feature.data('cost', {
				    'gas mass': parseInt(properties['Gas Cost'][0])
                });

                // set resources method
                feature.data('__resources', starResources);
			}
		} else {
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
