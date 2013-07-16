var SCgObjectState = {
	Normal: 0,
	Deleted: 1,
	Merged: 2,
	NewInMemory: 3
};

var ObjectId = 0;

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

	if (options.position) {
		this.position = options.position;
	}  else {
		this.position = new SCg.Vector3(0.0, 0.0, 0.0);
	}

	if (options.scale) {
		this.scale = options.scale;
	} else {
		this.scale = new SCg.Vector2(20.0, 20.0);
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
	
	this.id = ObjectId++;

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

/*! Calculate connector position.
 * @param {SCg.Vector3} Position of other end of connector
 * @param {Float} Dot position on this object.
 * @returns Returns position of connection point (new instance of SCg.Vector3, that can be modified later)
 */
SCg.ModelObject.prototype.getConnectionPos = function(from, dotPos) {
	return new SCg.Vector3(this.position.x, this.position.y, this.position.z);
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

SCg.ModelNode.prototype.getConnectionPos = function(from, dotPos) {

	SCg.ModelObject.prototype.getConnectionPos.call(this, from, dotPos);

	var radius = this.scale.x;
	var center = this.position;
	
	var result = new SCg.Vector3(0, 0, 0);
	
	result.copyFrom(from).sub(center).normalize();
	result.multiplyScalar(radius).add(center);

	return result;
};


// --------------- arc -----------

/**
 * Initialize sc.g-arc(edge) object
 * @param {Object} options
 * 		Initial opations of sc.g-arc. 
 */
SCg.ModelEdge = function(options) {
 	
	SCg.ModelObject.call(this, options);

	this.source = null;
	this.target = null;

	if (options.begin)
		this.source = options.begin;
	if (options.end)
		this.target = options.end;

	this.source_pos = new SCg.Vector3(0, 0, 0);	// the begin position of egde in world coordinates
	this.target_pos = new SCg.Vector3(0, 0, 0); // the end position of edge in world coordinates

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
	
	this.source = scg_obj;

	this.need_observer_sync = true;
};

/**
 * Setup new end object for sc.g-edge
 * @param {Object} scg_obj
 *		sc.g-object, that will be the end of edge
 */
 SCg.ModelEdge.prototype.setEnd = function(scg_obj) {
 	this.target = scg_obj;

 	this.need_observer_sync = true;
 };

 SCg.ModelEdge.prototype.update = function() {
 	SCg.ModelObject.prototype.update.call(this);

 	// calculate begin and end positions
 	this.source_pos = this.source.getConnectionPos(this.target.position, 0);
 	this.target_pos = this.target.getConnectionPos(this.source.position, 0);

 	this.position.copyFrom(this.target_pos).add(this.source_pos).multiplyScalar(0.5);
 };
 
 /*! Checks if this edge need to be drawen with arrow at the end
  */
 SCg.ModelEdge.prototype.hasArrow = function() {
	return this.sc_type & (sc_type_arc_common | sc_type_arc_access);
 };
 
 //---------------- contour ----------------
 /**
 * Initialize sc.g-arc(edge) object
 * @param {Object} options
 * 		Initial opations of sc.g-arc. 
 */
SCg.ModelContour = function(options) {
 	
	SCg.ModelObject.call(this, options);

	this.childs = [];
};

SCg.ModelContour.prototype = Object.create( SCg.ModelObject.prototype );

/**
 * Append new child into contour
 * @param {SCg.ModelObject} child Child object to append
 */
SCg.ModelContour.prototype.addChild = function(child) {
	this.childs.push(child);
};

/**
 * Remove child from contour
 * @param {SCg.ModelObject} child Child object for remove
 */
 SCg.ModelContour.prototype.removeChild = function(child) {
	this.childs.remove(child);
 };
 