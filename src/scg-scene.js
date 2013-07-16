SCg.Scene = function(options) {

	this.render = options.render;
	this.nodes = [];
	this.edges = [];
	this.contours = [];
};

SCg.Scene.prototype = {

	constructor: SCg.Scene,


	init: function() {

	},

	/**
	 * Appends new sc.g-node to scene
 	 * @param {SCg.ModelNode} node Node to append
	 */
	appendNode: function(node) {
		this.nodes.push(node);
	},

	/**
	 * Appends new sc.g-edge to scene
	 * @param {SCg.ModelEdge} edge Edge to append
	 */
	appendEdge: function(edge) {
		this.edges.push(edge);
	},
	 
	/**
	 * Append new sc.g-contour to scene
	 * @param {SCg.ModelContour} contour Contour to append
	 */
	appendContour: function(contour) {
		this.contours.push(contour);
	},	

	// --------- objects create/destroy -------
	/**
	 * Create new node
	 * @param {Integer} sc_type Type of node
	 * @param {SCg.Vector3} pos Position of node
	 * @param {String} text Text assotiated with node
	 * 
	 * @return Returns created node
	 */
	createNode: function(sc_type, pos, text) {
		var node = new SCg.ModelNode({ 
						position: new SCg.Vector3(pos.x, pos.y, pos.z), 
						scale: new SCg.Vector2(20, 20),
						sc_type: sc_type,
						text: text
					});
		this.appendNode(node);
		
		return node;
	},
	
	/**
	 * Create edge between two specified objects
	 * @param {SCg.ModelObject} begin Begin object of edge
	 * @param {SCg.ModelObject} end End object of edge
	 * @param {Integer} sc_type SC-type of edge
	 *
	 * @return Returns created edge
	 */
	createEdge: function(begin, end, sc_type) {
		var edge = new SCg.ModelEdge({
										begin: begin,
										end: end,
										sc_type: sc_type ? sc_type : sc_type_edge_common
									});
		this.appendEdge(edge);
		
		return edge;
	},

	// --------- mouse events ------------

	 onMouseDown: function(x, y) {

	 },

	 onMouseMove: function(x, y) {

	 },

	 onMouseUp: function(x, y) {

	 }

	 
};