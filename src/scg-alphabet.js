var SCgAlphabet = {
    
    scType2Str: {},
    
    /**
     * Initialize all definitions, for svg drawer
     */
    initSvgDefs: function(defs) {
        
        this.initTypesMapping();
        
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
            
        // nodes
        //<circle id="scg.node.const.outer" cx="0" cy="0" r="10"/>
        defs.append('svg:circle')
            .attr('id', 'scg.node.const.outer')
            .attr('cx', '0')
            .attr('cy', '0')
            .attr('r', '10');
            
        //<rect id="scg.node.var.outer" width="20" height="20" x="-10" y="-10"/>
        defs.append('svg:rect')
            .attr('id', 'scg.node.var.outer')
            .attr('x', '-10')
            .attr('y', '-10')
            .attr('width', '20')
            .attr('height', '20');
            
        /*<clip-path id="scg.node.const.clip">
            <use xlink:href="scg.node.const.outer" />
        </clip-path>*/
        
        defs.append('svg:clip-path')
            .attr('id', 'scg.node.const.clip')
            .append('svg:use')
                .attr('xlink:href', '#scg.node.const.clip');
        
        /*<clip-path id="scg.node.var.clip">
            <use xlink:href="#scg.node.var.outer" />
        </clip-path>*/
        
        defs.append('svg:clip-path')
            .attr('id', 'scg.node.var.clip')
            .append('svg:use')
                .attr('xlink:href', '#scg.node.var.clip');
                
        //  ----- define constant nodes -----      
        var g = defs.append('svg:g').attr('id', 'scg.node');
        g.append('svg:circle').attr('cx', '0').attr('cy', '0').attr('r', '5');
        g.append('svg:text').attr('x', '7').attr('y', '15').attr('class', 'SCgText');
        
        g = defs.append('svg:g').attr('id', 'scg.node.const');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.const.tuple');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.const.struct');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        g.append('svg:circle').attr('cx', '0').attr('cy', '0').attr('r', '3').attr('stroke', 'none').attr('fill', '#000');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.const.role');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        g.append('svg:line').attr('x1', '0').attr('x2', '0').attr('y1', '-10').attr('y2', '10').attr('stroke-width', '3');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.const.norole');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.const.class');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.const.abstract').attr('clip-path', 'url(#scg.node.const.clip)');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.const.material').attr('clip-path', 'url(#scg.node.const.clip)');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1').attr('transform', 'rotate(-45, 0, 0)');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);
        
        
        //  ----- define variable nodes -----
        g = defs.append('svg:g').attr('id', 'scg.node.var');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.var.tuple');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.var.struct');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        g.append('svg:circle').attr('cx', '0').attr('cy', '0').attr('r', '3').attr('stroke', 'none').attr('fill', '#000');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.var.role');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        g.append('svg:line').attr('x1', '0').attr('x2', '0').attr('y1', '-10').attr('y2', '10').attr('stroke-width', '3');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.var.norole');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.var.class');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'scg.node.var.abstract').attr('clip-path', 'url(#scg.node.var.clip)');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.var.material').attr('clip-path', 'url(#scg.node.var.clip)');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1').attr('transform', 'rotate(-45, 0, 0)');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);
        
    },
    
    /**
     * Append sc.g-text to definition
     */
     appendText: function(def, x, y) {
        def.append('svg:text')
            .attr('x', '17')
            .attr('y', '21')
            .attr('class', 'SCgText')
     },
     
     /**
      * Return definition name by sc-type
      */
     getDefId: function(sc_type) {
         if (this.scType2Str.hasOwnProperty(sc_type)) {
             return this.scType2Str[sc_type];
         }
         
         return 'scg.node';
     },
     
     /**
      * Initialize sc-types mapping
      */
      initTypesMapping: function() {
        this.scType2Str[sc_type_node] = 'scg.node';
        this.scType2Str[sc_type_node | sc_type_const] = 'scg.node.const';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_material] = 'scg.node.const.material';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_abstract] = 'scg.node.const.abstract';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_class] = 'scg.node.const.class';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_struct] = 'scg.node.const.struct';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_norole] = 'scg.node.const.norole';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_role] = 'scg.node.const.role';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_tuple] = 'scg.node.const.tuple';

        this.scType2Str[sc_type_node | sc_type_var] = 'scg.node.var';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_material] = 'scg.node.var.material';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_abstract] = 'scg.node.var.abstract';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_class] = 'scg.node.var.class';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_struct] = 'scg.node.var.struct';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_norole] = 'scg.node.var.norole';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_role] = 'scg.node.var.role';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_tuple] = 'scg.node.var.tuple';
      }
};
