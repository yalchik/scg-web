
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