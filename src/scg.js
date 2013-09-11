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
             $.ajax({
                    url: "static/sc_web/html/scg-types-panel-nodes.html", 
                    dataType: 'html',
                    success: function(response) {
                           self.node_types_panel_content = response;
                    },
                    error: function() {
                        SCgDebug.error("Error to get nodes type change panel");
                    },
                    complete: function() {
                        $.ajax({
                                url: "static/sc_web/html/scg-types-panel-edges.html", 
                                dataType: 'html',
                                success: function(response) {
                                       self.edge_types_panel_content = response;
                                },
                                error: function() {
                                        SCgDebug.error("Error to get edges type change panel");
                                },
                                complete: function() {
                                    self.bindToolEvents();
                                }
                            });
                    }
                });
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
     * Bind events to panel tools
     */
    bindToolEvents: function() {
        
        var self = this;
        var container = '#' + this.containerId;
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
            $(this).popover({container: container});
            $(this).popover('show');
            
            var tool = $(this);
            
            function stop_modal() {
                self.scene.setModal(SCgModalMode.SCgModalNone);
                tool.popover('destroy');
                self.scene.updateObjectsVisual();
            }
            
            
            var input = $(container + ' #scg-change-idtf-input');
            // setup initial value
            input.focus().val(self.scene.selected_objects[0].text);
            input.keypress(function (e) {
                if (e.keyCode == KeyCode.Enter || e.keyCode == KeyCode.Escape) {
                    
                    if (e.keyCode == KeyCode.Enter)   self.scene.selected_objects[0].setText(input.val());
                    stop_modal();
                    e.preventDefault();
                } 
                
            });
            
            // process controls
            $(container + ' #scg-change-idtf-apply').click(function() {
                self.scene.selected_objects[0].setText(input.val());
                stop_modal();
            });
            $(container + ' #scg-change-idtf-cancel').click(function() {
                stop_modal();
            });
            
        });
        
        cont.find('#scg-tool-change-type').click(function() {
            self.scene.setModal(SCgModalMode.SCgModalType);
            
            if (self.scene.selected_objects.length != 1) {
                SCgDebug.error('Something wrong with type selection');
                return;
            }
            
            var tool = $(this);
            
            function stop_modal() {
                self.scene.setModal(SCgModalMode.SCgModalNone);
                tool.popover('destroy');
                self.scene.updateObjectsVisual();
            }
            
            var obj = self.scene.selected_objects[0];
            
            el = $(this);
            el.popover({
                    content: (obj instanceof SCg.ModelEdge) ? self.edge_types_panel_content : self.node_types_panel_content,
                    container: container,
                    title: 'Change type',
                    html: true,
                    delay: {show: 500, hide: 100}
                  }).popover('show');
                  
            $(container + ' #scg-type-close').click(function() {
                stop_modal();
            });


        });
        
        cont.find('#scg-tool-delete').click(function() {
            self.scene.deleteObjects(self.scene.selected_objects.slice(0, self.scene.selected_objects.length));
            self.scene.clearSelection();
        });
        
        // initial update
        self.onModalChanged();
        self.onSelectionChanged();
    },
    
    /**
     * Function that process selection changes in scene
     * It updated UI to current selection
     */
    onSelectionChanged: function() {
        
        if (this.scene.selected_objects.length == 1) {
            this._enableTool('#scg-tool-change-idtf');
            this._enableTool('#scg-tool-change-type');
        } else {
            this._disableTool('#scg-tool-change-idtf');
            this._disableTool('#scg-tool-change-type');
        }
        
        if (this.scene.selected_objects.length > 0) {
            this._enableTool('#scg-tool-delete');
        } else {
            this._disableTool('#scg-tool-delete');
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
        update_tool('#scg-tool-change-type');
        update_tool('#scg-tool-delete');
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
