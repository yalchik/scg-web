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