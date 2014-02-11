SCs.Viewer = function() {

};

SCs.Viewer.prototype = {

    init: function(sandbox, keynode_func) {
        this.sandbox = sandbox;
        this.containerId = '#' + sandbox.container;
        this.getKeynode = keynode_func;

        this.tree = new SCs.SCnTree();
        this.tree.init(null, keynode_func);
        
        this.output = new SCs.SCnOutput();
        this.output.init(this.tree, sandbox.container, this.getKeynode, this.sandbox.generateWindowContainer);
    },
    
    /*! Append new scs-data to visualize
     */
    appendData: function(data) {
        var self = this;
        this.tree.build(data.keywords, data.triples);
        $(self.containerId).html($(self.containerId).html() + self.output.toHtml());
    },

    getAddrs: function() {
        return this.tree.addrs;
    },

    getLinks: function() {
        return this.output.sc_links;
    }

};
