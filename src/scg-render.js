
SCg.Render = function() {
    this.scene = null;
};

SCg.Render.prototype = {

    init: function(params) {
        this.containerId = params.containerId;
        this.d3_drawer = d3.select('#' + this.containerId).append("svg:svg").attr("pointer-events", "all").attr("width", '100%').attr("height", '100%');
        
        
        var self = this;
        this.d3_container = this.d3_drawer.append('svg:g')
                                .attr("class", "SCgSvg")
                                .on('mousemove', function() {
                                    self.onMouseMove(this, self);
                                    })
                                .on('mousedown', function() {
                                    self.onMouseDown(this, self);
                                    })
                                .on('mouseup', function() {
                                    self.onMouseUp(this, self);
                                    })
                                .on('dblclick', function() {
                                    self.onMouseDoubleClick(this, self);
                                    });
        this.initDefs();
                                    
        this.d3_container.append('svg:rect')
                        .style("fill", "url(#backGrad)")
                        .attr('width', '100%') //parseInt(this.d3_drawer.style("width")))
                        .attr('height', '100%');//parseInt(this.d3_drawer.style("height")));
                        
                        
        this.d3_drag_line = this.d3_container.append('svg:path')
                .attr('class', 'SCgEdge dragline hidden')
                .attr('d', 'M0,0L0,0');
                
        this.d3_contour_line = d3.svg.line().interpolate("cardinal-closed");
                        
        this.d3_contours = this.d3_container.append('svg:g').selectAll('path');
        this.d3_edges = this.d3_container.append('svg:g').selectAll('path');
        this.d3_nodes = this.d3_container.append('svg:g').selectAll('g');
                                
        this.mouse_down_node = null;
        this.object_under_mouse = null;
        this.selected_node = null;
        
        
        // ----------- test -----------
        var self = this;
    },
    
    // -------------- Definitions --------------------
    initDefs: function() {
        // define arrow markers for graph links
        var defs = this.d3_drawer.append('svg:defs')
        
        defs.append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('markerWidth', 7)
            .attr('markerHeight', 10)
            .attr('orient', 'auto')
          .append('svg:path')
            .attr('d', 'M0,-4L10,0L0,4')
            .attr('fill', '#000');

        var grad = defs.append('svg:radialGradient')
            .attr('id', 'backGrad')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '100%').attr("spreadMethod", "pad");
            
            grad.append('svg:stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgb(255,253,252)')
            .attr('stop-opacity' , '1')
            grad.append('svg:stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgb(245,245,245)')
            .attr('stop-opacity', '1')
    },
    
    // -------------- draw -----------------------
    update: function() {
    
        var self = this;
        
        // update nodes visual
        this.d3_nodes = this.d3_nodes.data(this.scene.nodes, function(d) { return d.id; });
        
        // add nodes that haven't visual
        var g = this.d3_nodes.enter().append('svg:g')
                                     .attr("transform", function(d) { return 'translate(' + d.position.x + ', ' + d.position.y + ')'} );
        g.append('svg:circle')
            .attr('class', 'SCgNode')
            .attr('r', 10)
            .on('mouseover', function(d) {
                // enlarge target node
                d3.select(this).attr('transform', 'scale(1.1)')
                               .classed('SCgHighlighted', true);
                self.object_under_mouse = d;
            })
            .on('mouseout', function(d) {
                // unenlarge target node
                d3.select(this).attr('transform', '')
                               .classed('SCgHighlighted', false);
                self.object_under_mouse = null;
            })
            .on('mousedown', function(d) {
                if(d3.event.ctrlKey) return;

                // select node
                self.mouse_down_node = d;
                if (self.mouse_down_node === self.selected_node) 
                    self.selected_node = null;
                else 
                    self.selected_node = self.mouse_down_node;

                // reposition drag line
                self.d3_drag_line
                    .classed('hidden', false)
                    .attr('d', 'M' + self.mouse_down_node.position.x + ',' + self.mouse_down_node.position.y + 'L' + self.mouse_down_node.position.x + ',' + self.mouse_down_node.position.y);

                self.update();
            })
            .on('mouseup', function(d) {
                
                if (!self.mouse_down_node) return;

                // needed by FF
                self.d3_drag_line
                    .classed('hidden', true);

                // check for drag-to-self
                mouse_up_node = d;
                if (mouse_up_node === self.mouse_down_node) { 
                    self.mouse_down_node = null;
                    return; 
                }

                // add edge to graph
                self.scene.createEdge(self.mouse_down_node, mouse_up_node, null);
                self.relayout();
            
                self.update();
            });
        g.append('svg:text')
            .attr('class', 'SCgText')
            .attr('x', function(d) { return d.scale.x / 1.3; })
            .attr('y', function(d) { return d.scale.y / 1.3; })
            .text(function(d) { return d.text; });
            
        // update edges visual
        this.d3_edges = this.d3_edges.data(this.scene.edges, function(d) { return d.id; });
        
        // add edges that haven't visual
        g = this.d3_edges.enter().append('svg:g');
        
        g.append('svg:path')
            .attr('class', 'SCgEdge')
            .attr('d', function(d) {
                return 'M' + d.source_pos.x + ',' + d.source_pos.y + 'L' + d.target_pos.x + ',' + d.target_pos.y;
            })
            .style('marker-end', function(d) { return d.hasArrow() ? 'url(#end-arrow)' : ''; })
            .on('mouseover', function(d) {
                d3.select(this).classed('SCgHighlighted', true);
            })
            .on('mouseout', function(d) {
                d3.select(this).classed('SCgHighlighted', false);
            });
            
            
        // update contours visual
        this.d3_contours = this.d3_contours.data(this.scene.contours, function(d) { return d.id; });
        
        g = this.d3_contours.enter().append('svg:path')
                                    .attr('d', d3.svg.line().interpolate('cardinal-closed'))
                                    .attr('class', 'SCgContour');
        
        this.updatePositions();
    },

    updatePositions: function() {
        this.d3_nodes.attr("transform", function(d) { 
            return 'translate(' + d.position.x + ', ' + d.position.y + ')'
        });
        this.d3_edges.select('path').attr('d', function(d) {
            d.update();
            return 'M' + d.source_pos.x + ',' + d.source_pos.y + 'L' + d.target_pos.x + ',' + d.target_pos.y;
        });
                
        this.d3_contours.attr('d', function(d) { 
            d.update();
            return self.d3_contour_line(d.verticies) + 'Z'; 
        });
    },
    
    updateTexts: function() {
        this.d3_nodes.select('text').text(function(d) { return d.text; });
    },
            
    // -------------- Objects --------------------
    appendRenderNode: function(render_node) {
        render_node.d3_group = this.d3_container.append("svg:g");
    },

    appendRenderEdge: function(render_edge) {
        render_edge.d3_group = this.d3_container.append("g");
    },

    // --------------- Events --------------------
    onMouseDown: function(window, render) {
        var point = d3.mouse(window);
        render.scene.onMouseDown(point[0], point[1]);         
    },
    
    onMouseUp: function(window, render) {
        var point = d3.mouse(window);
        render.scene.onMouseUp(point[0], point[1]);
    },
    
    onMouseMove: function(window, render) {
        var point = d3.mouse(window);
        render.scene.onMouseMove(point[0], point[1]);
        
        if (!this.mouse_down_node) return;

        // update drag line
        this.d3_drag_line.attr('d', 'M' + this.mouse_down_node.position.x + ',' + this.mouse_down_node.position.y + 'L' + point[0] + ',' + point[1]);
    },
    
    onMouseDoubleClick: function(window, render) {
        var point = d3.mouse(window);
        
        if (!render.object_under_mouse) {
            render.scene.createNode(sc_type_node, new SCg.Vector3(point[0], point[1], 0), null);
            render.update();
//      render.relayout();
        }   
    },
    
    getContainerSize: function() {
        var el = document.getElementById(this.containerId);
        return [el.clientWidth, el.clientHeight];
    }
    

}
