var seed = Math.random() * 10000;

var R2D = 180 / Math.PI;
var D2R = Math.PI / 180;

function Random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}