(function(fwurg){

var ConstraintChecker = function() {
	this._checks = {system: [], orbit:[], orbital: []};
}

ConstraintChecker.prototype.addCheck = function(type, func) { this._checks[type].push(func); return this; }
ConstraintChecker.prototype.getChecks = function(type) { if(typeof type=='undefined') return this._checks;  else return this._checks[type]; }

fwurg.system.constraints = {
	Checker:  ConstraintChecker
};

})(fwurg);