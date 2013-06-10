var SCgObjectState = {
	Normal: 0,
	Deleted: 1,
	Merged: 2,
	NewInMemory: 3
};

/**
     * Initialize sc.g-object with specified options.
     * 
     * @param {Object} options
     * Initial options of object. There are possible options:
     * - position - object position. SCg.Vector3 object
     * - scale - object size. SCg.Vector2 object.
     * - sc_type - object type. See sc-types for more info.
     */
SCg.ModelObject = function(options) {
	
	this.need_observer_sync = true;

	if (options.position) {
		this.position = options.position;
	}  else {
		this.position = new SCg.Vector3(0.0, 0.0, 0.0);
	}

	if (options.scale) {
		this.scale = options.scale;
	} else {
		this.scale = new SCg.Vector2(32.0, 32.0);
	}

	if (options.sc_type) {
		this.sc_type = options.sc_type;
	} else {
		this.sc_type = sc_type_node;
	}
};

SCg.ModelObject.prototype = {

	constructor: SCg.ModelObject

};

// -------------- node ---------

/**
 * Initialize sc.g-node object.
 * @param {Object} options
 * 		Initial options of sc.g-node. It can include params from base object
 */
SCg.ModelNode = function(options) {

	SCg.ModelObject.call(this, options);

};

SCg.ModelNode.prototype = Object.create( SCg.ModelObject.prototype );


// --------------- arc -----------

/**
 * Initialize sc.g-arc(edge) object
 * @param {Object} options
 * 		Initial opations of sc.g-arc. 
 */
SCg.ModelEdge = function(options) {
 	
	SCg.ModelObject.call(this, options);

	this.begin = null;
	this.end = null;

};

SCg.ModelEdge.prototype = Object.create( SCg.ModelObject.prototype );


/** 
 * Setup new begin object for sc.g-edge
 * @param {Object} scg_obj
 * 		sc.g-object, that will be the begin of edge
 */
SCg.ModelEdge.prototype.setBegin = function(scg_obj) {
	
	this.begin = scg_obj;

	this.need_observer_sync = true;
};

/**
 * Setup new end object for sc.g-edge
 * @param {Object} scg_obj
 *		sc.g-object, that will be the end of edge
 */
 SCg.ModelEdge.prototype.setEnd = function(scg_obj) {
 	this.end = scg_obj;

 	this.need_observer_sync = true;
 };