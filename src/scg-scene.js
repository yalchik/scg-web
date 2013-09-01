var SCgEditMode = {
    SCgModeSelect: 0,
    SCgModeEdge: 1,
    SCgModeBus: 2,
    SCgModeContour: 3,
    
    /**
     * Check if specified mode is valid
     */
    isValid: function(mode) {
        return (mode >= this.SCgModeSelect) && (mode <= this.SCgModeContour);
    }
};

var KeyCode = {
    Escape: 27
};

SCg.Scene = function(options) {

    this.render = options.render;
    this.nodes = [];
    this.edges = [];
    this.contours = [];
    
    this.objects = {};
    this.edit_mode = SCgEditMode.SCgModeSelect;
    
    // object, that placed under mouse
    this.pointed_object = null;
    // object, that was mouse pressed
    this.focused_object = null;
    
    // list of selected objects
    this.selected_objects = [];
    
    // drag line points
    this.drag_line_points = [];
    
    // mouse position
    this.mouse_pos = new SCg.Vector3(0, 0, 0);
    
    // edge source and target
    this.edge_data = {source: null, target: null};
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
     * @param {SCg.ModelObject} source Edge source object
     * @param {SCg.ModelObject} target Edge target object
     * @param {Integer} sc_type SC-type of edge
     *
     * @return Returns created edge
     */
    createEdge: function(source, target, sc_type) {
        var edge = new SCg.ModelEdge({
                                        source: source,
                                        target: target,
                                        sc_type: sc_type ? sc_type : sc_type_edge_common
                                    });
        this.appendEdge(edge);
        
        return edge;
    },
    
    /**
     * Updates render
     */
    updateRender: function() {
        this.render.update();
    },
    
    /**
     * Updates render objects state
     */
    updateObjectsVisual: function() {
        this.render.updateObjects();
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
    },
    
    /**
     * Append selection to object
     */
    appendSelection: function(obj) {
        if (obj.is_selected) {
            SCgDebug.error('Object trying to be selecting twice');
            return;
        }
        
        this.selected_objects.push(obj);
        obj._setSelected(true);
    },
    
    /**
     * Remove selection from object
     */
    removeSelection: function(obj) {
        
        var idx = this.selected_objects.indexOf(obj);
        
        if (idx == -1 || !obj.is_selected) {
            SCgDebug.error('Trying to remove selection from unselected object');
            return;
        }
        
        this.selected_objects.splice(idx, 1);
        obj._setSelected(false);
    },
    
    /**
     * Clear selection list
     */
    clearSelection: function() {
        
        for (idx in this.selected_objects) {
            this.selected_objects[idx]._setSelected(false);
        }
        
        this.selected_objects.slice(0, this.selected_objects.length);
    },
    
    // -------- input processing -----------
    onMouseMove: function(x, y) {
        
        this.mouse_pos.x = x;
        this.mouse_pos.y = y;
        
        if ((this.edit_mode == SCgEditMode.SCgModeSelect) && this.focused_object && (this.focused_object.sc_type & sc_type_node)) {
            this.focused_object.setPosition(new SCg.Vector3(x, y, 0));
            this.updateObjectsVisual();
        }
        
        if (this.edit_mode == SCgEditMode.SCgModeEdge) {
            this.render.updateDragLine();
        }
    },
    
    onMouseDown: function(x, y) {
    },
    
    onMouseUp: function(x, y) {
    },
    
    onMouseDoubleClick: function(x, y) {
        
        if (this.edit_mode == SCgEditMode.SCgModeSelect) {
            if (this.pointed_object)
                return; // do nothing
            
            this.createNode(sc_type_node | sc_type_const, new SCg.Vector3(x, y, 0), '');
            this.updateRender();
        }
        
    },
    
    
    onMouseOverObject: function(obj) {
        this.pointed_object = obj;
    },
    
    onMouseOutObject: function(obj) {
        this.pointed_object = null;
    },
    
    onMouseDownObject: function(obj) {
        
        if (this.edit_mode == SCgEditMode.SCgModeSelect)
            this.focused_object = obj;
            
        if (this.edit_mode == SCgEditMode.SCgModeEdge) {
            
            // start new edge
            if (!this.edge_data.source) {
                this.edge_data.source = obj;
                this.drag_line_points.push([this.mouse_pos.x, this.mouse_pos.y]);
            } else {
                // source and target must be not equal
                if (this.edge_data.source != obj) {
                    this.createEdge(this.edge_data.source, obj, sc_type_arc_pos_const_perm);
                    this.edge_data.source = this.edge_data.target = null;
                    
                    this.drag_line_points.splice(0, this.drag_line_points.length);
                    
                    this.updateRender();
                    this.render.updateDragLine();
                }
            }
        }
            
    },
    
    onMouseUpObject: function(obj) {
        
        if (this.edit_mode == SCgEditMode.SCgModeSelect) {
            if (obj == this.focused_object) {
                this.clearSelection();
                this.appendSelection(obj);
                this.updateObjectsVisual();
            }
        
            this.focused_object = null;
        }
    },
    
    onKeyDown: function(key_code) {
        
        // revert changes on escape key
        if (key_code == KeyCode.Escape) {
            if (this.edit_mode == SCgEditMode.SCgModeEdge)
                this.resetEdgeMode();
        }
    },
    
    onKeyUp: function(key_code) {
    },
    
    // -------- edit --------------
    /**
     * Setup new edit mode for scene. Calls from user interface
     * @param {SCgEditMode} mode New edit mode
     */
    setEditMode: function(mode) {
        
        if (this.edit_mode == mode) return; // do nothing
        
        this.edit_mode = mode;
        
        this.focused_object = null;
        this.edge_data.source = null; this.edge_data.target = null;
        
        this.resetEdgeMode();
    },
    
    /**
     * Reset edge creation mode state
     */
    resetEdgeMode: function() {
        this.drag_line_points.splice(0, this.drag_line_points.length);
        this.render.updateDragLine();
        
        this.edge_data.source = this.edge_data.target = null;
    }
};
