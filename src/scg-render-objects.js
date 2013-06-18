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

	SCg.RenderObject.prototype.getConnectionPos.call(this, from, dotPos);

	var radius = this.model_object.scale.x;
	var center = this.model_object.position;
	var result = new THREE.Vector3(); 
	result.copy(center).sub(from).normalize();
	result.multiplyScalar(radius).add(center);

	return result;
};

SCg.RenderNode.prototype.parseParams = function(params) {
	SCg.RenderObject.prototype.parseParams.call(this, params);


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

SCg.RenderEdge.prototype.parseParams = function(params) {
	SCg.RenderObject.prototype.parseParams.call(this, params);

};

/** Updates specified render buffer for edge geometry. This function writes 
 * geometry data that represents the edge.
 * @param buffer Geometry buffer to update
 * @param startIdx Start index to fill data
 * @return Returns number of quads, that need to represent this edge. And boolena value, that is true, when buffer changed.
 * Example: [10, False]
 * @note If edge couldn't be inserted into buffed, from specified index (buffer to small), then this function, just return 
 * number of requested quads and doesn't change buffer at all.
 */
SCg.RenderEdge.prototype.updateBuffer = function(buffer, startIdx) {

	// for now wihtout camera rotation
	positions = buffer.attributes.position.array;
	colors = buffer.attributes.color.array;
	uvs = buffer.attributes.uv.array;

	idx = startIdx;

	pos = this.model_object.position;

	positions[idx] = pos.x - 1;
	positions[idx + 1] = pos.y - 1;
	positions[idx + 2] = pos.z;
	uvs[idx] = 0;
	uvs[idx + 1] = 0;
	idx++;


	positions[idx] = pos.x + 1;
	positions[idx + 1] = pos.y - 1;
	positions[idx + 2] = pos.z;
	uvs[idx] = 1;
	uvs[idx + 1] = 0;
	idx++;


	positions[idx] = pos.x - 1;
	positions[idx + 1] = pos.y + 1;
	positions[idx + 2] = pos.z;
	uvs[idx] = 0;
	uvs[idx + 1] = 1;
	idx++;

	positions[idx] = pos.x + 1;
	positions[idx + 1] = pos.y - 1;
	positions[idx + 2] = pos.z;
	uvs[idx] = 1;
	uvs[idx + 1] = 0;
	idx++;


	positions[idx] = pos.x - 1;
	positions[idx + 1] = pos.y + 1;
	positions[idx + 2] = pos.z;
	uvs[idx] = 0;
	uvs[idx + 1] = 1;
	idx++;

	positions[idx] = pos.x - 1;
	positions[idx + 1] = pos.y + 1;
	positions[idx + 2] = pos.z;
	uvs[idx] = 0;
	uvs[idx + 1] = 1;
	idx++;


	for (var i = 0; i < 18; ++i)
		colors[startIdx + i] = 0.5;

	return 1;
};