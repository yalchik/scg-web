SCg.RenderObject = function(params) {
	this.model_object = params.model_object; // pointer to observed object in model
	if (this.model_object)
		this.model_object.observer = this;
	this.force_sync = true;

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

var textId = 0;
// ------------ Text ------------
SCg.Text = function(container) {

	this.id = "SCg_Text_" + textId.toString();
	textId++;
	
	$(container).append('<div id="' + this.id + '" style="position: absolute;" class="SCgText"></div>');
};

SCg.Text.prototype.setValue = function(value) {
	$("#" + this.id).text(value);
};

SCg.Text.prototype.updatePosition = function(render, pos3d) {
	var widthHalf = render.windowHalfX, heightHalf = render.windowHalfY;

	var projector = new THREE.Projector();
	var vector = projector.projectVector( pos3d.clone(), render.camera );

	vector.x = ( vector.x * widthHalf ) + widthHalf;
	vector.y = - ( vector.y * heightHalf ) + heightHalf;
	$("#" + this.id).css({left:Math.ceil(vector.x), top:Math.ceil(vector.y)});
};


// ------------ Node ------------


SCg.RenderNode = function(params) {

	SCg.RenderObject.call(this, params);

	this.parseParams(params);

	this.sprite = new THREE.Sprite(this.render.getMaterial(sc_type_node)); // sprite to draw node
	this.text = new SCg.Text(this.render.container);
};

SCg.RenderNode.prototype = Object.create( SCg.RenderObject.prototype );

SCg.RenderNode.prototype.sync = function() {

	if (!this.model_object.need_observer_sync && !this.force_sync)
		return; // do nothing

	position = this.model_object.position;
	scale = this.model_object.scale;

	this.sprite.position.set( position.x, position.y, position.z );
	this.sprite.scale.set( scale.x, scale.y, scale.z );
	this.sprite.material = this.render.getMaterial(this.model_object.sc_type);

	this.model_object.need_observer_sync = false;
	
	var textPos = new SCg.Vector3();
	var textOffset = new SCg.Vector2();
	
	textOffset.copy(scale).multiplyScalar(0.1);
	textPos.copy(position);
	textPos.x += textOffset.x;
	textPos.y -= textOffset.y;
	
	this.text.setValue(this.model_object.text);
	this.text.updatePosition(this.render, textPos);
	
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
	
	this.geometry = null;
	this.verticies_count = 0;

	this.parseParams(params);
};

SCg.RenderEdge.prototype = Object.create(SCg.RenderObject.prototype);

SCg.RenderEdge.prototype.sync = function() {

	if (!this.model_object.need_observer_sync && !this.force_sync)
		return; // do nothing
		
	this.updateGeometry();
};

SCg.RenderEdge.prototype.parseParams = function(params) {
	SCg.RenderObject.prototype.parseParams.call(this, params);

};

SCg.RenderEdge.prototype.hasArrow = function() {
	if (!this.model_object)
		return false;
		
	return this.model_object.sc_type & (sc_type_arc_access | sc_type_arc_common);
};

SCg.RenderEdge.prototype.updateGeometry = function() {
	var end_dot = 0.0;
	var beg_dot = 0.0;
	var beg_pos = this.model_object.begin.position;
	var end_pos = this.model_object.end.observer.getConnectionPos(beg_pos, end_dot);
	beg_pos = this.model_object.begin.observer.getConnectionPos(end_pos, beg_dot);
	
	// calculate length
	var dir = new THREE.Vector3();
	dir.copy(end_pos).sub(beg_pos);
	var len = dir.length();
	
	// calculate number of segments
	var segments = len / 2.0; /* determine texel constant */
	if (segments > Math.floor(segments))
		segments = Math.floor(segments) + 1;
		
	if (this.hasArrow())
		segments += 1;
	
	this.createBuffer(segments);
	
};

SCg.RenderEdge.prototype.createBuffer = function(segments) {

	this.geometry = new THREE.BufferGeometry();
	this.geometry.dynamic = true;

	var triangles = segments * 2;
		
	this.verticies_count = triangles * 3;
	
	this.geometry.attributes = {
		position: {
			itemSize: 3,
			array: new Float32Array(this.verticies_count * 3),
			numItems: this.verticies_count * 3
		},
		color: {
			itemSize: 3,
			array: new Float32Array(this.verticies_count * 3),
			numItems: this.verticies_count * 3
		},
		uv: {
			itemSize: 2,
			array: new Float32Array(this.verticies_count * 2),
			numItems: this.verticies_count * 2
		}
	};
	
	this.mesh = new THREE.Mesh( this.geometry, this.material );
};
