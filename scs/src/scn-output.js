SCs.SCnOutput = function() {
};

SCs.SCnOutput.prototype = {
    
    init: function(tree, container, keynode_func) {
        this.tree = tree;
        this.container = container;
        this.sc_links = [];
        this.linkCounter = 0;
        this.getKeynode = keynode_func;
    },

    /*! Returns string that contains html representation of scn-text
     */
    toHtml: function() {
        this.treeSort();

        var output = '';
        for (idx in this.tree.nodes) {
            output += this.treeNodeHtml(this.tree.nodes[idx]);
        }
        return output;
    },

    /*! Returns string that contains html representation of scn-tree node
     */
    treeNodeHtml: function(treeNode) {
        var output = '';

        if (treeNode.type == SCs.SCnTreeNodeType.Keyword) {
            output = '<div class="scn-keyword"><a href="#" class="scs-scn-element" sc_addr="' + treeNode.element.addr + '">' + treeNode.element.addr + '</a></div>';
        } else {
            var marker = SCs.SCnConnectors[treeNode.predicate.type];
            marker = treeNode.backward ? marker.b : marker.f;

            output = '<div class="scs-scn-field" style="padding-left: ' + (treeNode.level * 15) + 'px">';
            output += '<div class="scs-scn-field-marker scs-scn-element">' + marker + '</div>';
            if (treeNode.attrs.length > 0) {
                output += '<div>';
                for (idx in treeNode.attrs) {
                    var attr = treeNode.attrs[idx];
                    var sep = '∶';
                    if (attr.a.type & sc_type_var) {
                        sep = '∷';
                    }
                    output += '<a href="#" class="scs-scn-element" sc_addr="' + attr.n.addr + '">' + attr.n.addr + '</a>' + '<span>' + sep + '</span>';
                }
                output += '</div>';
                output += '<div style="padding-left: 15px">' + this.treeNodeElementHtml(treeNode) + '</div>';
            } else {
                output += '<div>' + this.treeNodeElementHtml(treeNode) + '</div>';
            }
            output += '</div>';
        }

        for (idx in treeNode.childs) {
            output += this.treeNodeHtml(treeNode.childs[idx]);
        }

        return output;
    },

    treeNodeElementHtml: function(treeNode) {
        if (treeNode.element.type & sc_type_link) {
            var containerId = this.container + '_' + this.linkCounter;
            this.linkCounter++;
            this.sc_links[containerId] = treeNode.element.addr;
            return '<div class="scs-scn-element scs-scn-content scs-scn-field" id="' + containerId + '" sc_addr="' + treeNode.element.addr + '">' + '</div>';
        } else {
            return '<a href="#" class="scs-scn-element scs-scn-field" sc_addr="' + treeNode.element.addr + '">' + treeNode.element.addr + '</a>';
        }
    },

    /*! Sort tree elements
     */
    treeSort: function() {
        var queue = [];
        for (idx in this.tree.nodes) {
            queue.push(this.tree.nodes[idx]);
        }

        // prepare order map
        var orderMap = {}; 
        for (idx in SCs.SCnSortOrder) {
            var addr = this.getKeynode(SCs.SCnSortOrder[idx]);
            if (addr)
                orderMap[addr] = idx;
        }

        function sortCompare(a, b) {
            // determine order by attributes
            function minOrderAttr(attrs) {
                var res = null;
                for (i in attrs) {
                    var v = orderMap[attrs[i].n.addr];
                    if (!res || (v && v < res)) {
                        res = v;
                    }
                }
                return res;
            }
            
            var orderA = minOrderAttr(a.attrs);
            var orderB = minOrderAttr(b.attrs);
            
            if (orderA && orderB) {
                return orderA - orderB;
            } else {
                if (!orderA) return 1;
                if (!orderB) return -1;
            }
            
            return 0;
        }

        while (queue.length > 0) {
            var node = queue.shift();

            node.childs.sort(sortCompare);
            for (idx in node.childs) {
                queue.push(node.childs[idx]);
            }
        }
    }

};
