/* --- scg.js --- */
var SCg = SCg || { version: "0.1.0" };

SCg.Viewer = function() {

	this.render = null;
	this.scene = null;
};

SCg.Viewer.prototype = {


	init: function()
	{
		this.render = new SCg.Render();
		this.render.init();

		this.scene = new SCg.Scene( {render: this.render } );
		this.scene.init();

	}
	
};

/* --- scg-math.js --- */
SCg.Vector2 = THREE.Vector2;
SCg.Vector3 = THREE.Vector3;
SCg.Color = THREE.Color;

/* --- scg-model.js --- */


/* --- scg-model-objects.js --- */
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

/* --- scg-render.js --- */

SCg.Render = function() {

	this.container	= null;
	this.stats 		= null;
	this.camera 	= null; 
	this.scene 		= null;
	this.renderer 	= null;
	this.mouseX 	= 0;
	this.mouseY 	= 0;

	this.windowHalfX = 0;
	this.windowHalfY = 0;

	this.node_material = null;
	
	this.node_materials = {}; // map of sc-types to node materials
	this.nodes = [];
	this.edges = [];
};

SCg.Render.prototype = {

	constructor: SCg.Render,


	init: function() {

		if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

		var container = document.createElement( 'div' );
		document.body.appendChild( container );

		this.container = container;
		this.windowHalfX = window.innerWidth / 2;
		this.windowHalfY = window.innerHeight / 2;

		this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 2, 2000 );
		this.camera.position.z = 1000;

		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.Fog( 0xffffff, 210, 1100 );

		this.renderer = new THREE.WebGLRenderer( { clearAlpha: 1 } );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setClearColor(new THREE.Color().setRGB( 1.0, 1.0, 1.0 ));
		container.appendChild( this.renderer.domElement );

		//

		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		container.appendChild( this.stats.domElement );

		// --------- Materials -------------------
		this.initializeMaterials();


		window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

		this.animate();

	},

	onWindowResize: function() {

		this.windowHalfX = window.innerWidth / 2;
		this.windowHalfY = window.innerHeight / 2;

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );
	},


	// -----------------------

	animate: function() {

		requestAnimationFrame( this.animate.bind(this) );

		this.updateObjects();

		this.render();
		this.stats.update();
	},

	render: function() {

		var time = Date.now() * 0.00005;

		this.camera.position.x += ( this.mouseX - this.camera.position.x ) * 0.05;
		this.camera.position.y += ( - this.mouseY - this.camera.position.y ) * 0.05;

		//this.camera.lookAt( this.scene.position );

		this.renderer.render( this.scene, this.camera );
	},

	// -------------- Objects --------------------
	appendRenderNode: function(render_node) {
		this.nodes.push(render_node);
		this.scene.add(render_node.sprite);
	},

	appendRenderEdge: function(render_edge) {
		this.edges.push(render_edge);
		
	},

	updateObjects: function() {

		// upadte nodes
		for (var i = 0; i < this.nodes.length; ++i) {
			var node = this.nodes[i];
			node.sync();
		}

		// now iterate all edges and fill geometry buffer
		for (var i = 0; i < this.edges.length; ++i) {
			var edge = this.edges[i];
			edge.sync();
		}

	},

	// -------------- Materials ------------------

	/** Initialize materials, that will be used to render objects
	 */
    initializeMaterials: function() {

	 	map_empty = THREE.ImageUtils.loadTexture( "textures/sprites/empty.png" );

		map_node = THREE.ImageUtils.loadTexture( "textures/sprites/node.png" );
	 	map_node_const = THREE.ImageUtils.loadTexture( "textures/sprites/node_const.png" );
	 	map_node_const_material = THREE.ImageUtils.loadTexture( "textures/sprites/node_const_material.png" );
	 	map_node_const_abstract = THREE.ImageUtils.loadTexture( "textures/sprites/node_const_abstract.png" );
	 	map_node_const_class = THREE.ImageUtils.loadTexture( "textures/sprites/node_const_class.png" );
	 	map_node_const_struct = THREE.ImageUtils.loadTexture( "textures/sprites/node_const_struct.png" );
	 	map_node_const_norole = THREE.ImageUtils.loadTexture( "textures/sprites/node_const_norole.png" );
	 	map_node_const_role = THREE.ImageUtils.loadTexture( "textures/sprites/node_const_role.png" );
	 	map_node_const_tuple = THREE.ImageUtils.loadTexture( "textures/sprites/node_const_tuple.png" );

	 	map_node_var = THREE.ImageUtils.loadTexture( "textures/sprites/node_var.png" );
	 	map_node_var_material = THREE.ImageUtils.loadTexture( "textures/sprites/node_var_material.png" );
	 	map_node_var_abstract = THREE.ImageUtils.loadTexture( "textures/sprites/node_var_abstract.png" );
	 	map_node_var_class = THREE.ImageUtils.loadTexture( "textures/sprites/node_var_class.png" );
	 	map_node_var_struct = THREE.ImageUtils.loadTexture( "textures/sprites/node_var_struct.png" );
	 	map_node_var_norole = THREE.ImageUtils.loadTexture( "textures/sprites/node_var_norole.png" );
	 	map_node_var_role = THREE.ImageUtils.loadTexture( "textures/sprites/node_var_role.png" );
	 	map_node_var_tuple = THREE.ImageUtils.loadTexture( "textures/sprites/node_var_tuple.png" );


	 	this.node_materials[0] = this._createMaterial(map_empty);

		this.node_materials[sc_type_node] = this._createMaterial(map_node);
	 	this.node_materials[sc_type_node | sc_type_const] = this._createMaterial(map_node_const);
	 	this.node_materials[sc_type_node | sc_type_const | sc_type_node_material] = this._createMaterial(map_node_const_material);
	 	this.node_materials[sc_type_node | sc_type_const | sc_type_node_abstract] = this._createMaterial(map_node_const_abstract);
	 	this.node_materials[sc_type_node | sc_type_const | sc_type_node_class] = this._createMaterial(map_node_const_class);
	 	this.node_materials[sc_type_node | sc_type_const | sc_type_node_struct] = this._createMaterial(map_node_const_struct);
	 	this.node_materials[sc_type_node | sc_type_const | sc_type_node_norole] = this._createMaterial(map_node_const_norole)
	 	this.node_materials[sc_type_node | sc_type_const | sc_type_node_role] = this._createMaterial(map_node_const_role);
	 	this.node_materials[sc_type_node | sc_type_const | sc_type_node_tuple] = this._createMaterial(map_node_const_tuple);

	 	this.node_materials[sc_type_node | sc_type_var] = this._createMaterial(map_node_var);
	 	this.node_materials[sc_type_node | sc_type_var | sc_type_node_material] = this._createMaterial(map_node_var_material);
	 	this.node_materials[sc_type_node | sc_type_var | sc_type_node_abstract] = this._createMaterial(map_node_var_abstract);
	 	this.node_materials[sc_type_node | sc_type_var | sc_type_node_class] = this._createMaterial(map_node_var_class);
	 	this.node_materials[sc_type_node | sc_type_var | sc_type_node_struct] = this._createMaterial(map_node_var_struct);
	 	this.node_materials[sc_type_node | sc_type_var | sc_type_node_norole] = this._createMaterial(map_node_var_norole)
	 	this.node_materials[sc_type_node | sc_type_var | sc_type_node_role] = this._createMaterial(map_node_var_role);
	 	this.node_materials[sc_type_node | sc_type_var | sc_type_node_tuple] = this._createMaterial(map_node_var_tuple);
	 },

	 /** Create material instance for a specified texture
	  * @param {Object} texture_map Texture map object to create material
	  * @return Returns created material instance
	  */
	 _createMaterial: function(texture_map) {
	 	result = new THREE.SpriteMaterial( { map: texture_map, useScreenCoordinates: false, color: 0xffffff, fog: true, sizeAttenuation: false } );
	 	result.color.setRGB(1.0, 0.0, 0.0);

	 	return result;
	 },

	 /** Get material for a specified object type
	  * @param {Integer} obj_type Object type
	  * @return Returns material for a specified object type. If material doesn't exist, then return 
	  * default
	  */
	 getMaterial: function(obj_type) {
	 	var mat_map = this.node_materials;

	 	if (mat_map[obj_type])
	  		return mat_map[obj_type]

	 	return this.node_materials[0];
	 }

}

/* --- scg-render-objects.js --- */
SCg.RenderObject = function(params) {
	this.model_object = params.model_object; // pointer to observed object in model
	if (this.model_object)
		this.model_object.observer = this;

	this.render = params.render;
};

SCg.RenderObject.prototype = {

	parseParams: function(params) {
		this.model_object = params.model_object;
		this.render = params.render;
	}
};

/**
 * Calculate connector point
 * @param {SCg.Vector3} from
 *		Position of second point of connector from this
 * @param {Float} dotPos
 *		Dot position (relative position on this object). It depend on object type
 */
SCg.RenderObject.prototype.getConnectionPos = function(from, dotPos) {
	if (this.need_observer_sync)
		this.sync();
};

var textId = 0;
// ------------ Text ------------
SCg.Text = function(container) {

	this.id = "SCg_Text_" + textId.toString();
	textId++;
	
	$(container).append('<div id="' + this.id + '" style="position: absolute;" class="SCgText"></div>');
};

SCg.Text.prototype.setValue = function(value) {
	$("#" + this.id).text(value);
};

SCg.Text.prototype.updatePosition = function(render, pos3d) {
	var widthHalf = render.windowHalfX, heightHalf = render.windowHalfY;

	var projector = new THREE.Projector();
	var vector = projector.projectVector( pos3d.clone(), render.camera );

	vector.x = ( vector.x * widthHalf ) + widthHalf;
	vector.y = - ( vector.y * heightHalf ) + heightHalf;
	$("#" + this.id).css({left:Math.ceil(vector.x), top:Math.ceil(vector.y)});
};


// ------------ Node ------------


SCg.RenderNode = function(params) {

	SCg.RenderObject.call(this, params);

	this.parseParams(params);

	this.sprite = new THREE.Sprite(this.render.getMaterial(sc_type_node)); // sprite to draw node
	this.text = new SCg.Text(this.render.container);
};

SCg.RenderNode.prototype = Object.create( SCg.RenderObject.prototype );

SCg.RenderNode.prototype.sync = function() {

	if (!this.model_object.need_observer_sync)
		return; // do nothing

	position = this.model_object.position;
	scale = this.model_object.scale;

	this.sprite.position.set( position.x, position.y, position.z );
	this.sprite.scale.set( scale.x, scale.y, scale.z );
	this.sprite.material = this.render.getMaterial(this.model_object.sc_type);

	this.model_object.need_observer_sync = false;
	
	var textPos = new SCg.Vector3();
	var textOffset = new SCg.Vector2();
	textOffset.copy(scale).multiplyScalar(0.1);
	textPos.copy(position);
	textPos.x += textOffset.x;
	textPos.y -= textOffset.y;
	this.text.setValue(this.model_object.text);
	this.text.updatePosition(this.render, textPos);
	
};

SCg.RenderNode.prototype.getConnectionPos = function(from, dotPos) {

	SCg.RenderObject.prototype.getConnectionPos.call(this, from, dotPos);

	var radius = this.model_object.scale.x;
	var center = this.model_object.position;
	var result = new THREE.Vector3(); 
	result.copy(center).sub(from).normalize();
	result.multiplyScalar(radius).add(center);

	return result;
};

SCg.RenderNode.prototype.parseParams = function(params) {
	SCg.RenderObject.prototype.parseParams.call(this, params);


};


// ------------ Edge -------------

SCg.RenderEdge = function(params) {

	SCg.RenderObject.call(this, params);
	
	this.geometry = null;
	this.verticies_count = 0;

	this.parseParams(params);
};

SCg.RenderEdge.prototype = Object.create(SCg.RenderObject.prototype);

SCg.RenderEdge.prototype.sync = function() {

	if (!this.model_object.need_observer_sync)
		return; // do nothing
		
	this.updateGeometry();

};

SCg.RenderEdge.prototype.parseParams = function(params) {
	SCg.RenderObject.prototype.parseParams.call(this, params);

};

SCg.RenderEdge.prototype.hasArrow = function() {
	if (!this.model_object)
		return false;
		
	return this.model_object.sc_type & (sc_type_arc_access | sc_type_arc_common);
};

SCg.RenderEdge.prototype.updateGeometry = function() {
	var end_dot = 0.0;
	var beg_dot = 0.0;
	var beg_pos = this.model_object.begin.position;
	var end_pos = this.model_object.end.observer.getConnectionPos(beg_pos, end_dot);
	beg_pos = this.model_object.begin.observer.getConnectionPos(end_pos, beg_dot);
	
	// calculate length
	var dir = new THREE.Vector3();
	dir.copy(end_pos).sub(beg_pos);
	var len = dir.length();
	
	// calculate number of segments
	var segments = len / 2.0; /* determine texel constant */
	if (segments > Math.floor(segments))
		segments = Math.floor(segments) + 1;
		
	if (this.hasArrow())
		segments += 1;
	
	this.createBuffer(segments);
	
};

SCg.RenderEdge.prototype.createBuffer = function(segments) {

	this.geometry = new THREE.BufferGeometry();
	this.geometry.dynamic = true;

	var triangles = segments * 2;
		
	this.verticies_count = triangles * 3;
	
	this.geometry.attributes = {
		position: {
			itemSize: 3,
			array: new Float32Array(this.verticies_count * 3),
			numItems: this.verticies_count * 3
		},
		color: {
			itemSize: 3,
			array: new Float32Array(this.verticies_count * 3),
			numItems: this.verticies_count * 3
		},
		uv: {
			itemSize: 2,
			array: new Float32Array(this.verticies_count * 2),
			numItems: this.verticies_count * 2
		}
	};
	
	this.mesh = new THREE.Mesh( this.geometry, this.material );
};


/* --- scg-scene.js --- */
SCg.Scene = function(options) {

	this.render = options.render;
	this.nodes = [];
	this.edges = [];

};

SCg.Scene.prototype = {

	constructor: SCg.Scene,


	init: function() {

		// --------------- Events ----------------
		document.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );
		document.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
		document.addEventListener( 'mouseup', this.onMouseUp.bind(this), false);

		document.addEventListener( 'touchstart', this.onTouchStart.bind(this), false );
		document.addEventListener( 'touchmove', this.onTouchMove.bind(this), false );
		document.addEventListener( 'touchend', this.onTouchEnd.bind(this), false);
		document.addEventListener( 'touchcancel', this.onTouchCancel.bind(this), false);
		document.addEventListener( 'touchleave', this.onTouchLeave.bind(this), false);

	},

	/**
	 * Appends new sc.g-node to scene. This function create renderable object for the last one.
 	 * @param {Object} node Node to append
	 */
	appendNode: function(node) {

	 	this.nodes.push(node);

	 	render_node = new SCg.RenderNode( { render: this.render, model_object: node } );
		render_node.sync();

	 	this.render.appendRenderNode(render_node);
	 },

	 /**
	  * Appends new sc.g-edge to scene. This function create renderable object for the last one.
	  * @param {Object} edge Adge to append
	  */
	 appendEdge: function(edge) {
	 	this.edges.push(edge);

	 	render_edge = new SCg.RenderEdge( {render: this.render, model_object: edge } );
	 	render_edge.sync();

	 	this.render.appendRenderEdge(render_edge);
	 },


	 // --------- mouse events ------------

	 onMouseDown: function(event) {

	 },

	 onMouseMove: function(event) {

	 },

	 onMouseUp: function(event) {

	 },

	 // --------- touch events ------------
	 onTouchStart: function(event) {

	 },

	 onTouchMove: function(event) {

	 },

	 onTouchEnd: function(event) {

	 },

	 onTouchCancel: function(event) {

	 },

	 onTouchLeave: function(event) {

	 }

	 
};

