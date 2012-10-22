/**
 * Base fwurg namespace.
 */
fwurg = {};

/**
 * Returns a resolved url. This function exists due to the
 * the fact that the fwurg library might be hosted elsewhere.
 *
 * @param resource the resource to resolve for
 */
fwurg.url = function(resource) {return "http://fwurg.xs4all.nl/fwurg-lib/"+resource;};