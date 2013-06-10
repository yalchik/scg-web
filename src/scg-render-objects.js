SCg.RenderObject = function(params) {
	this.model_object = params.model_object; // pointer to observed object in model
	this.render = params.render;
};

SCg.RenderObject.prototype = {

	parseParams: function(params) {
		this.model_object = params.model_object;
		this.render = params.render;
	}
};

// ------------ Node ------------


SCg.RenderNode = function(params) {

	SCg.RenderObject.call(this, params);

	this.parseParams(params);

	this.sprite = new THREE.Sprite(this.render.getMaterial(sc_type_node)); // sprite to draw node
};

SCg.RenderNode.prototype = SCg.ModelNode.prototype = Object.create( SCg.RenderObject.prototype );

SCg.RenderNode.prototype.update = function() {

	if (!this.model_object.need_observer_sync)
		return; // do nothing

	position = this.model_object.position;
	scale = this.model_object.scale;

	this.sprite.position.set( position.x, position.y, position.z );
	this.sprite.scale.set( scale.x, scale.y, scale.z );
	this.sprite.material = this.render.getMaterial(this.model_object.sc_type);

	this.model_object.need_observer_sync = false;
};
