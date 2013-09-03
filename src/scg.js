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
            cont.find('#scg-tool-change-idtf').click(function() {
                self.scene.setModal(SCgModalMode.SCgModalIdtf);
                $(this).popover('show');
            });
            
            // initial update
            self.onSelectionChanged();
            self.onModalChanged();
        });
        
        var self = this;
        this.scene.event_selection_changed = function() {
            self.onSelectionChanged();
        }
        this.scene.event_modal_changed = function() {
            self.onModalChanged();
        }
    },
    
    /**
     * Function that process selection changes in scene
     * It updated UI to current selection
     */
    onSelectionChanged: function() {
        
        if (this.scene.selected_objects.length == 1) {
            this._enableTool('#scg-tool-change-idtf');
        } else {
            this._disableTool('#scg-tool-change-idtf');
        }
    },
    
    /**
     * Function, that process modal state changes of scene
     */
    onModalChanged: function() {
        var self = this;
        function update_tool(tool_id) {
            if (self.scene.modal != SCgModalMode.SCgModalNone)
                self._disableTool(tool_id);
            else
                self._enableTool(tool_id);
        }
        
        update_tool('#scg-tool-select');
        update_tool('#scg-tool-edge');
        update_tool('#scg-tool-bus');
        update_tool('#scg-tool-contour');

        update_tool('#scg-tool-change-idtf');
        update_tool('#scg-tool-zoomin');
        update_tool('#scg-tool-zoomout');
    }, 
    
    
    // -------------------------------- Helpers ------------------
    /**
     * Change specified tool state to disabled
     */
    _disableTool: function(tool_id) {
        $('#' + this.containerId).find(tool_id).attr('disabled', 'disabled');
    },
    
    /**
     * Change specified tool state to enabled
     */
    _enableTool: function(tool_id) {
         $('#' + this.containerId).find(tool_id).removeAttr('disabled');
    }
};
