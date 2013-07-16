SCg.Vector2 = function(x, y) {
	this.x = x;
	this.y = y;
};

SCg.Vector2.prototype = {
	constructor: SCg.Vector2
};


// --------------------
SCg.Vector3 = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
};

SCg.Vector3.prototype = {
	constructor: SCg.Vector3,
	
	copyFrom: function(other) {
		this.x = other.x;
		this.y = other.y;
		this.z = other.z;
		
		return this;
	},
	
	sub: function(other) {
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		
		return this;
	},
	
	add: function(other) {
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		
		return this;
	},
	
	multiplyScalar: function(v) {
		this.x *= v;
		this.y *= v;
		this.z *= v;
		
		return this;
	},
	
	normalize: function() {
		var l = this.length();
		this.x /= l;
		this.y /= l;
		this.z /= l;
	},
	
	length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
};
