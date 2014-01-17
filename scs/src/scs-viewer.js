SCs.Viewer = function() {

};

SCs.Viewer.prototype = {

    init: function(container, keynode_func) {
        this.containerId = '#' + container;
        this.getKeynode = keynode_func;

        this.tree = new SCs.SCnTree();
        this.tree.init();
        
        this.output = new SCs.SCnOutput();
        this.output.init(this.tree, container, this.getKeynode);
    },
    
    /*! Append new scs-data to visualize
     */
    appendData: function(data) {
        this.tree.build(data.keywords, data.triples);
        $(this.containerId).html($(this.containerId).html() + this.output.toHtml());
    },

    getAddrs: function() {
        return this.tree.addrs;
    },

    getLinks: function() {
        return this.output.sc_links;
    }

};
