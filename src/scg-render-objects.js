SCg.RenderObject = function(params) {
	this.model_object = params.model_object; // pointer to observed object in model
	if (this.model_object)
		this.model_object.observer = this;

	this.render = params.render;
};

SCg.RenderObject.prototype = {

	parseParams: function(params) {
		this.model_object = params.model_object;
		this.render = params.render;
	}
};

/**
 * Calculate connector point
 * @param {SCg.Vector3} from
 *		Position of second point of connector from this
 * @param {Float} dotPos
 *		Dot position (relative position on this object). It depend on object type
 */
SCg.RenderObject.prototype.getConnectionPos = function(from, dotPos) {
	if (this.need_observer_sync)
		this.sync();
};

// ------------ Node ------------


SCg.RenderNode = function(params) {

	SCg.RenderObject.call(this, params);

	this.parseParams(params);

	this.sprite = new THREE.Sprite(this.render.getMaterial(sc_type_node)); // sprite to draw node
};

SCg.RenderNode.prototype = Object.create( SCg.RenderObject.prototype );

SCg.RenderNode.prototype.sync = function() {

	if (!this.model_object.need_observer_sync)
		return; // do nothing

	position = this.model_object.position;
	scale = this.model_object.scale;

	this.sprite.position.set( position.x, position.y, position.z );
	this.sprite.scale.set( scale.x, scale.y, scale.z );
	this.sprite.material = this.render.getMaterial(this.model_object.sc_type);

	this.model_object.need_observer_sync = false;
};

SCg.RenderNode.prototype.getConnectionPos = function(from, dotPos) {

	SCg.RenderObject.prototype.getConnectionPos.calls(this, from, dotPos);

	radius = this.model_object.scale.x;

	
};


// ------------ Edge -------------

SCg.RenderEdge = function(params) {

	SCg.RenderObject.call(this, params);

	this.parseParams(params);
};

SCg.RenderEdge.prototype = Object.create(SCg.RenderObject.prototype);

SCg.RenderEdge.prototype.sync = function() {

	if (!this.model_object.need_observer_sync)
		return; // do nothing


}