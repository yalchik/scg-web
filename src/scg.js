var SCg = SCg || { version: "0.1.0" };

SCg.Viewer = function() {

	this.render = null;
	this.scene = null;
};

SCg.Viewer.prototype = {


	init: function(params)
	{
		this.render = new SCg.Render();
		this.scene = new SCg.Scene( {render: this.render } );
		this.scene.init();
		
		this.render.scene = this.scene;
		this.render.init(params);
	}
	
};