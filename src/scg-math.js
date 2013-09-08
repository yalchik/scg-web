SCg.Vector2 = function(x, y) {
    this.x = x;
    this.y = y;
};

SCg.Vector2.prototype = {
    constructor: SCg.Vector2,
    
    copyFrom: function(other) {
        this.x = ohter.x;
        this.y = other.y;
        
        return this;
    },
    
    clone: function() {
        return new SCg.Vector2(this.x, this.y);
    },
    
    add: function(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    },
    
    sub: function(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    },
    
    mul: function(other) {
        this.x *= other.x;
        this.y *= other.y;
        return this;
    },
    
    div: function(other) {
        this.x /= other.x;
        this.y /= other.y;
        return this;
    },
    
    multiplyScalar: function(v) {
        this.x *= v;
        this.y *= v;
        return this;
    },
    
    divideScalar: function(v) {
        this.x /= v;
        this.y /= v;
        return this;
    },
    
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    
    lengthSquared: function() {
        return this.x * this.x + this.y * this.y;
    },
    
    normalize: function() {
        return this.divideScalar(this.length());
    },
    
    dotProduct: function(other) {
        return this.x * other.x + this.y * other.y;
    },
    
    crossProduct: function(other) {
        return this.x * other.y - this.y * other.x;
    }
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
    
    clone: function() {
        return new SCg.Vector3(this.x, this.y, this.z);
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
    
    mul: function(other) {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
        
        return this;
    },
    
    div: function(other) {
        this.x /= other.x;
        this.y /= other.y;
        this.z /= other.z;
        
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
    },
    
    lengthSquared: function() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    },
    
    dotProduct: function(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    },
    
    crossProduct: function(other) {
        return new SCg.Vector3(
                this.y * other.z - this.z * other.y,
                this.z * other.x - this.x * other.z,
                this.x * other.y - this.y * other.x);
    },
    
    to2d: function() {
        return new SCg.Vector2(this.x, this.y);
    }
};
