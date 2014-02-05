SCsComponent = {
    ext_lang: 'scs_code',
    formats: ['format_scs_json'],
    factory: function(sandbox) {
        return new SCsViewer(sandbox);
    },
    getRequestKeynodes: function() {
        var keynodes = ['nrel_section_base_order', 'rrel_key_sc_element'];
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
        
        this.viewer = new SCs.Viewer();
        this.viewer.init(sandbox, $.proxy(sandbox.getKeynode, sandbox));
        
        this.sandbox.updateContent();
    },
    
    // ---- window interface -----
    receiveData: function(data) {
        this.data = data;
        this.viewer.appendData(data);
        
        var dfd = new jQuery.Deferred();
        
        $.when(this.sandbox.createViewersForScLinks(this.viewer.getLinks())).then(
                            function() {
                                dfd.resolve();
                            }, 
                            function() {
                                dfd.reject();
                            });
        return dfd.promise();
    },
    
    updateTranslation: function(namesMap) {
        // apply translation
        $(SCWeb.ui.Core.selectorWindowScAddr(this.container)).each(function(index, element) {
            var addr = $(element).attr('sc_addr');
            if(namesMap[addr]) {
                $(element).text(namesMap[addr]);
            } else {
                if (!$(element).hasClass('sc-content') && !$(element).hasClass('sc-contour') && !$(element).hasClass('scs-scn-connector'))
                    $(element).html('<b>ⵔ</b>');
            }
        });
    },
    
    getObjectsToTranslate: function() {
        return this.viewer.getAddrs();
    }
    

};

SCWeb.core.ComponentManager.appendComponentInitialize(SCsComponent);
