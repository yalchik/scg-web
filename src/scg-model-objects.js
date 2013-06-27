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
     * - observer - object, that observe this
     * - position - object position. SCg.Vector3 object
     * - scale - object size. SCg.Vector2 object.
     * - sc_type - object type. See sc-types for more info.
	 * - text - text identifier of object
     */
SCg.ModelObject = function(options) {
	
	this.need_observer_sync = true;
	this.observer = options.observer;	// observer (render object)

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

	if (options.sc_addr) {
		this.sc_addr = options.sc_addr;
	} else {
		this.sc_addr = null;
	}
	
	if (options.text) {
		this.text = options.text;
	} else {
		this.text = null;
	}

	this.edges = [];	// list of connected edges
	this.need_update = true;	// update flag
};

SCg.ModelObject.prototype = {

	constructor: SCg.ModelObject

};

/**
 * Setup new position of object
 * @param {SCg.Vector3} pos
 *		New position of object
 */
SCg.ModelObject.prototype.setPosition = function(pos) {
	this.position = pos;
	this.need_observer_sync = true;

	this.requestUpdate();
	this.notifyEdgesUpdate();
};

/**
 * Setup new scale of object
 * @param {SCg.Vector2} scale
 *		New scale of object
 */
SCg.ModelObject.prototype.setScale = function(scale) {
	this.scale = scale;
	this.need_observer_sync = true;

	this.requestUpdate();
	this.update();
};

/**
 * Notify all connected edges to sync
 */
SCg.ModelObject.prototype.notifyEdgesUpdate = function() {

	for (var i = 0; i < this.edges.length; i++) {
       this.edges[i].need_update = true;
    }

};

/** Function iterate all objects, that need to be updated recursively, and 
 * mark them for update.
 */
SCg.ModelObject.prototype.requestUpdate = function() {
	this.need_update = true;
	for (var i = 0; i < this.edges.length; ++i) {
		this.edges[i].requestUpdate();
	}
};

/** Updates object state.
 */
SCg.ModelObject.prototype.update = function() {

	this.need_update = false;
	this.need_observer_sync = true;

	for (var i = 0; i < this.edges.length; ++i) {
		var edge = this.edges[i];

		if (edge.need_update) {
			edge.update();
		}
	}
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

	if (options.begin)
		this.begin = options.begin;
	if (options.end)
		this.end = options.end;

	this.begin_pos = new THREE.Vector3(0, 0, 0);	// the begin position of egde in world coordinates
	this.end_pos = new THREE.Vector3(0, 0, 0); // the end position of edge in world coordinates

	this.requestUpdate();
	this.update();
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

 SCg.ModelEdge.prototype.update = function() {
 	SCg.ModelObject.prototype.update.call(this);

 	// calculate begin and end positions
 	this.begin_pos = this.begin.observer.getConnectionPos(this.end.position, 0);
 	this.end_pos = this.end.observer.getConnectionPos(this.begin.position, 0);

 	this.position.copy(this.end_pos).add(this.begin_pos).multiplyScalar(0.5);
 }