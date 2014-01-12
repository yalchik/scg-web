SCs.Viewer = function() {

};

SCs.Viewer.prototype = {

    init: function(container) {
        this.containerId = '#' + container;
        this.tree = new SCs.SCnTree();
        this.tree.init();
        
        this.output = new SCs.SCnOutput();
        this.output.init(this.tree, container);
    },
    
    /*! Append new scs-data to visualize
     */
    appendData: function(data) {
        this.tree.build(data.keywords, data.triples);
        $(this.containerId).html(this.output.toHtml());
    },

    getAddrs: function() {
        return this.tree.addrs;
    },

    getLinks: function() {
        return this.output.sc_links;
    }

};
