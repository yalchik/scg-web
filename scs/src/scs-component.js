SCsComponent = {
    ext_lang: 'scs_code',
    formats: ['format_scs_json'],
    factory: function(sandbox) {
        return new SCsViewer(sandbox);
    },
    getRequestKeynodes: function() {
        var keynodes = ['nrel_section_base_order'];
        return keynodes.concat(SCs.SCnSortOrder);
    }
};

var SCsViewer = function(sandbox) {
    this.init(sandbox);
    return this;
};

var SCsConnectors = {};

$(document).ready(function() {
    
    SCsConnectors[sc_type_arc_pos_const_perm] = "->";
    SCsConnectors[sc_type_edge_common | sc_type_const] = "==";
    SCsConnectors[sc_type_edge_common | sc_type_var] = "_==";
    SCsConnectors[sc_type_arc_common | sc_type_const] = "=>";
    SCsConnectors[sc_type_arc_common | sc_type_var] = "_=>";
    SCsConnectors[sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm] = "_->";
});

SCsViewer.prototype = {
    
    container: null,
    objects: [],
    addrs: [],
    sc_links: {}, // map of sc-link objects key:addr, value: object
    data: null,
    sandbox: null,
    
    init: function(sandbox) {
        this.container = '#' + sandbox.container;
        this.sandbox = sandbox;
        
        this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
        this.sandbox.eventGetObjectsToTranslate = $.proxy(this.getObjectsToTranslate, this);
        this.sandbox.eventApplyTranslation = $.proxy(this.updateTranslation, this);
        
        var self = this;
        $(this.container).delegate('[sc_addr]', 'click', function(e) {
            self.sandbox.doDefaultCommand([$(e.currentTarget).attr('sc_addr')]);
        });
        
        this.viewer = new SCs.Viewer();
        this.viewer.init(sandbox.container, $.proxy(sandbox.getKeynode, sandbox));
    },
    
    // ---- window interface -----
    receiveData: function(data) {
        this.data = data;
        this.viewer.appendData(data);
        
        this.sandbox.createViewersForScLinks(this.viewer.getLinks(), 
                            function() { // success

                            }, function() { // error

                            });
    },
    
    updateTranslation: function(namesMap) {
        // apply translation
        $(this.container + ' [sc_addr]').each(function(index, element) {
            var addr = $(element).attr('sc_addr');
            if(namesMap[addr]) {
                $(element).text(namesMap[addr]);
            } else {
                if (!$(element).hasClass('scs-scn-content'))
                    $(element).html('<b>ⵔ</b>');
            }
        });
    },
    
    getObjectsToTranslate: function() {
        return this.viewer.getAddrs();
    }
    

};

SCWeb.core.ComponentManager.appendComponentInitialize(SCsComponent);
