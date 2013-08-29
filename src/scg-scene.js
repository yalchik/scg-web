SCg.Scene = function(options) {

    this.render = options.render;
    this.nodes = [];
    this.edges = [];
    this.contours = [];
    
    this.objects = {};
};

SCg.Scene.prototype = {

    constructor: SCg.Scene,


    init: function() {
        this.layout_manager = new SCg.LayoutManager();
        this.layout_manager.init(this);
    },

    /**
     * Appends new sc.g-node to scene
     * @param {SCg.ModelNode} node Node to append
     */
    appendNode: function(node) {
        this.nodes.push(node);
        if (node.sc_addr)
            this.objects[node.sc_addr] = node;
    },

    /**
     * Appends new sc.g-edge to scene
     * @param {SCg.ModelEdge} edge Edge to append
     */
    appendEdge: function(edge) {
        this.edges.push(edge);
        if (edge.sc_addr)
            this.objects[edge.sc_addr] = edge;
    },
     
    /**
     * Append new sc.g-contour to scene
     * @param {SCg.ModelContour} contour Contour to append
     */
    appendContour: function(contour) {
        this.contours.push(contour);
        if (contour.sc_addr)
            this.objects[contour.sc_addr] = contour;
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

     },

     // --------- layout --------
     layout: function() {
        this.layout_manager.doLayout();
        this.render.update();
     },
     
     onLayoutTick: function() {
     
     },
     
     /**
      * Returns size of container, where graph drawing
      */
    getContainerSize: function() {
        return this.render.getContainerSize();
    },
     
     /**
      * Return array that contains sc-addrs of all objects in scene
      */
    getScAddrs: function() {
        var keys = new Array();
        for (key in this.objects) {
            keys.push(key);
        }
        return keys;
    },
    
    /**
     * Return object by sc-addr
     * @param {String} addr sc-addr of object to find
     * @return If object founded, then return it; otherwise return null
     */
    getObjectByScAddr: function(addr) {
        if (this.objects.hasOwnProperty(addr))
            return this.objects[addr];
            
        return null;
    }
};
