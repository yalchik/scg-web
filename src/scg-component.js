SCgComponent = {
    type: 0,
    outputLang: 'hypermedia_format_scg_json',
    formats: [],
    factory: function(config) {
        return new scgViewerWindow(config);
    }
};

/**
 * scgViewerWindow
 * @param config
 * @constructor
 */
var scgViewerWindow = function(config){
    this._initWindow(config);
};

scgViewerWindow.prototype = {

    /**
     * scgViewer Window init
     * @param config
     * @private
     */
    _initWindow : function(config){

        /**
         * Container for render graph
         * @type {String}
         */
        this.domContainer = config.container;

        this.viewer = new SCg.Viewer();
        this.viewer.init({containerId: config.container});
    },

    /**
     * Set new data in viewer
     * @param {Object} data
     */
    receiveData : function(data){
        
        this._buildGraph(data);
    },

    /**
     * Build scGraph from JSON
     * @param {Object} data
     * @return {scGraph}
     * @private
     */
    _buildGraph : function(data){
        
        var elements = {};
        var edges = new Array();
        for (var i = 0; i < data.length; i++) {
            var el = data[i];
            
            if (elements.hasOwnProperty(el.id))
                continue;
            
            if (el.el_type & sc_type_node || el.el_type & sc_type_link) {
                var model_node = new SCg.ModelNode({ 
                        position: new SCg.Vector3(10 * Math.random(), 10 * Math.random(), 0), //1000 * Math.random() - 500), 
                        sc_type: el.el_type,
                        text: "",
                        sc_addr: el.id
                    });
                this.viewer.scene.appendNode(model_node);
                
                elements[el.id] = model_node;
            } else if (el.el_type & sc_type_arc_mask) {
                edges.push(el);
            }
        }
        
        // create edges
        var founded = true;
        while (edges.length > 0 && founded) {
            founded = false;
            for (idx in edges) {
                var obj = edges[idx];
                var beginId = obj.begin;
                var endId = obj.end;
                // try to get begin and end object for arc
                if (elements.hasOwnProperty(beginId) && elements.hasOwnProperty(endId)) {
                    var beginNode = elements[beginId];
                    var endNode = elements[endId];
                    
                    founded = true;
                    edges.splice(idx, 1);
                    
                    var model_edge = new SCg.ModelEdge({
                        source: beginNode,
                        target: endNode,
                        sc_type: obj.el_type,
                        sc_addr: obj.id
                    });

                    this.viewer.scene.appendEdge(model_edge);
                    
                    elements[obj.id] = model_edge;
                } 
            }
        }
        
        if (edges.length > 0)
            alert("error");
        
        this.viewer.render.update();
        this.viewer.scene.layout();
    },

    /**
     * Destroy window
     * @return {Boolean}
     */
    destroy : function(){
        delete this.viewer;
        return true;
    },


    /**
     * Emit translate identifiers
     */
    translateIdentifiers    : function(language){
        
        var self = this;
        
        SCWeb.core.Translation.translate(this.viewer.scene.getScAddrs(), language, function(namesMap) {
            for (addr in namesMap) {
                var obj = self.viewer.scene.getObjectByScAddr(addr);
                if (obj) {
                    obj.text = namesMap[addr];
                }
            }
            
            self.viewer.render.updateTexts();
        });

    },

    /**
     * Get current language in viewer
     * @return String
     */
    getIdentifiersLanguage  : function(){
        return this._currentLanguage;
    },

    _getObjectsForTranslate : function(){      
        return [];
    },

    _translateObjects       : function(namesMap){

    }

};


SCWeb.core.ComponentManager.appendComponentInitialize(function() {
    SCWeb.core.ComponentManager.registerComponent(SCgComponent);
});
