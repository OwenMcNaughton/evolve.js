var seed = Math.random() * 10000;

function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.Mag = function() {
  return Math.sqrt(this.x*this.x + this.y*this.y);
};

Vector.prototype.Normalize = function() {
  var m = this.mag();
  if(m != 0 && m != 1) {
    this.x /= m;
    this.y /= m;
  }
};

Vector.prototype.Limit = function(max) {
  if(this.mag() > max) {
    this.normalize();
    this.x *= max;
    this.y *= max;
  }
};

Vector.prototype.Dist = function(v2) {
  var dx = v2.x - this.x;
  var dy = v2.y - this.y;
  var dx2 = dx*dx; var dy2 = dy*dy;
  return Math.sqrt(dx*dx + dy*dy);
};

Vector.prototype.Add = function(v2) {
  this.x += v2.x;
  this.y += v2.y;
};

Vector.prototype.Sub = function(v2) {
  this.x -= v2.x;
  this.y -= v2.y;
};

Vector.prototype.DivScalar = function(scalar) {
  this.x /= scalar;
  this.y /= scalar;
};

Vector.prototype.MulScalar = function(scalar) {
  this.x *= scalar;
  this.y *= scalar;
};

function Random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}