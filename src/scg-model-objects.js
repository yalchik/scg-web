var SCgObjectState = {
    Normal: 0,
    MergedWithMemory: 1,
    NewInMemory: 2,
    FromMemory: 3
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

    this.edges = [];    // list of connected edges
    this.need_update = true;    // update flag
    this.state = SCgObjectState.Normal;
    this.is_selected = false;
};

SCg.ModelObject.prototype = {

    constructor: SCg.ModelObject

};

/**
 * Destroy object
 */
SCg.ModelObject.prototype.destroy = function() {
};

/**
 * Setup new position of object
 * @param {SCg.Vector3} pos
 *      New position of object
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
 *      New scale of object
 */
SCg.ModelObject.prototype.setScale = function(scale) {
    this.scale = scale;
    this.need_observer_sync = true;

    this.requestUpdate();
    this.update();
};

/**
 * Setup new text value
 * @param {String} text New text value
 */
SCg.ModelObject.prototype.setText = function(text) {
    this.text = text;
    this.need_observer_sync = true;
};

/**
 * Notify all connected edges to sync
 */
SCg.ModelObject.prototype.notifyEdgesUpdate = function() {

    for (var i = 0; i < this.edges.length; i++) {
       this.edges[i].need_update = true;
       this.edges[i].need_observer_sync = true;
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

/*! Setup new state of object
 * @param {SCgObjectState} state New object state
 */
SCg.ModelObject.prototype.setObjectState = function(state) {
    this.state = state;
    this.need_observer_sync = true;
};

/*!
 * Change value of selection flag
 */
SCg.ModelObject.prototype._setSelected = function(value) {
    this.is_selected = value;
    this.need_observer_sync = true;
};

/**
 * Remove edge from edges list
 */
SCg.ModelObject.prototype.removeEdge = function(edge) {
    var idx = this.edges.indexOf(edge);
    
    if (idx < 0) {
        SCg.error("Something wrong in edges deletion");
        return;
    }
    
    this.edges.splice(idx, 1);
};

// -------------- node ---------

/**
 * Initialize sc.g-node object.
 * @param {Object} options
 *      Initial options of sc.g-node. It can include params from base object
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
 *      Initial opations of sc.g-arc. 
 */
SCg.ModelEdge = function(options) {
    
    SCg.ModelObject.call(this, options);

    this.source = null;
    this.target = null;

    if (options.source)
        this.setSource(options.source);
    if (options.target)
        this.setTarget(options.target);

    this.source_pos = new SCg.Vector3(0, 0, 0); // the begin position of egde in world coordinates
    this.target_pos = new SCg.Vector3(0, 0, 0); // the end position of edge in world coordinates

    this.requestUpdate();
    this.update();
};

SCg.ModelEdge.prototype = Object.create( SCg.ModelObject.prototype );

/**
 * Destroy object
 */
SCg.ModelEdge.prototype.destroy = function() {
    SCg.ModelObject.prototype.destroy.call(this);
    
    if (this.target)
        this.target.removeEdge(this);
    if (this.source)
        this.source.removeEdge(this);
};

/** 
 * Setup new source object for sc.g-edge
 * @param {Object} scg_obj
 *      sc.g-object, that will be the source of edge
 */
SCg.ModelEdge.prototype.setSource = function(scg_obj) {
    
    if (this.source == scg_obj) return; // do nothing
    
    if (this.source)
        this.source.removeEdge(this);
    
    this.source = scg_obj;
    this.source.edges.push(this);
    this.need_observer_sync = true;
};

/**
 * Setup new target object for sc.g-edge
 * @param {Object} scg_obj
 *      sc.g-object, that will be the target of edge
 */
 SCg.ModelEdge.prototype.setTarget = function(scg_obj) {
     
    if (this.target == scg_obj) return; // do nothing
    
    if (this.target)
        this.target.removeEdge(this);
    
    this.target = scg_obj;
    this.target.edges.push(this);
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
 *      Initial opations of sc.g-arc. 
 */
SCg.ModelContour = function(options) {
    
    SCg.ModelObject.call(this, options);

    this.childs = [];
    this.verticies = [];
};

SCg.ModelContour.prototype = Object.create( SCg.ModelObject.prototype );

SCg.ModelContour.prototype.update = function() {

    // http://jsfiddle.net/NNwFa/44/
    
    var verts = [];
    var cx = 0;
    var cy = 0;
    for (var i = 0; i < this.childs.length; i++) {
        var pos = this.childs[i].position;
        verts.push([pos.x , pos.y]);
        
        cx += pos.x;
        cy += pos.y;
    }
    
    cx /= float(this.childs.length);
    cy /= float(this.childs.length);
    
    var cV = new SCg.Vector2(cx, cy);
    var pV = new SCg.Vector2(0, 0);
    
    for (var i = 0; i < this.verts.length; i++) {
        var pos = this.verts[i];
        
        
        cx += pos.x;
        cy += pos.y;
    }
    
    this.verticies = d3.geom.hull(verts);
};

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
 
