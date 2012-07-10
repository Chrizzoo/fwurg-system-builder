(function(fwurg, $){
	// alias the feature constructor
	var F = fwurg.system.Feature;

	// set up wiki
	var wiki = new fwurg.Wiki('http://fwurg.xs4all.nl/dokuwiki/_export/strataendpoint/', 'tech:relations_endpoint', 'tech:resources_endpoint');

	// get query builder
	var qb = wiki.qb();
	wiki.queryResources(qb.query(
		qb.fields('?s'),
		qb.where('?s is a: star_class')
	)).then(function(data) {
		// run over features
		for(var k in data.body) { try {
			var f = new F(k);

			var cs = {}; for(var x in data.body[k]['is a']) cs[data.body[k]['is a'][x]] = true;
			f.data('classes',cs);

			// construct resources function
			(function() {
				var cost = {
					'gas mass': -parseInt(data.body[k]['Gas Cost'][0]),
					'hot orbits': parseInt(data.body[k]['Hot Orbits'][0]),
					'goldilocks orbits': parseInt(data.body[k]['Goldilocks Orbits'][0]),
					'cold orbits': parseInt(data.body[k]['Cold Orbits'][0])
				};

				f.data('__resources', function() {
					return cost;
				});
			})();
		} catch(e) {console.log('Failed for ',k);} }
	});
})(fwurg, jQuery);
