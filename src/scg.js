var SCg = SCg || { version: "0.1.0" };

SCg.Editor = function() {

    this.render = null;
    this.scene = null;
};

SCg.Editor.prototype = {


    init: function(params)
    {
        this.render = new SCg.Render();
        this.scene = new SCg.Scene( {render: this.render } );
        this.scene.init();
        
        this.render.scene = this.scene;
        this.render.init(params);
        
        this.containerId = params.containerId;
        this.initUI();
    },
    
    /**
     * Initialize user interface
     */
    initUI: function() {
        var self = this;
        
        var container = '#' + this.containerId;
        $(container).prepend('<div id="tools-' + this.containerId + '"></div>');
        var tools_container = '#tools-' + this.containerId;
        $(tools_container).load('static/sc_web/html/scg-tools-panel.html', function() {
            
            var cont = $(container);
            
            cont.find('#scg-tool-select').button('toggle');
            
            // handle clicks on mode change
            cont.find('#scg-tool-select').click(function() {
                self.scene.setEditMode(SCgEditMode.SCgModeSelect);
            });
            cont.find('#scg-tool-edge').click(function() {
                self.scene.setEditMode(SCgEditMode.SCgModeEdge);
            });
            cont.find('#scg-tool-bus').click(function() {
                self.scene.setEditMode(SCgEditMode.SCgModeBus);
            });
            cont.find('#scg-tool-contour').click(function() {
                self.scene.setEditMode(SCgEditMode.SCgModeContour);
            });
        });
        
        
        
    },
    
};
