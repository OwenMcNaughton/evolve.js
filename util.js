var seed = Math.random() * 10000;

var R2D = 180 / Math.PI;
var D2R = Math.PI / 180;

function Random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function Random2(upper) {
  var x = Math.sin(seed++) * 10000;
  return Math.floor(((x - Math.floor(x))*upper));
}

function RotatePointIntl(px, py, ox, oy, angle) {
  return {
    x: Math.cos(angle) * (px-ox) - Math.sin(angle) * (py-oy) + ox,
    y: Math.sin(angle) * (px-ox) + Math.cos(angle) * (py-oy) + oy
  };
}

function RotatePointDeg(p, o, degs) {
  var rads = degs * D2R;
  return RotatePointIntl(p.x, p.y, o.x, o.y, rads);
}

function RotatePointRad(p, o, rads) {
  return RotatePointIntl(p.x, p.y, o.x, o.y, rads);
}

function DrawLine(ctx, x1, y1, x2, y2, color, width) {
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  return ctx;
}

function DrawLineVic(ctx, p, q, color, width) {
  return DrawLine(ctx, p.x, p.y, q.x, q.y, color, width);
  return ctx;
}

function LineIntersects(p0, p1, q0, q1) {
  var s1_x, s1_y, s2_x, s2_y;
  s1_x = p1.x - p0.x;
  s1_y = p1.y - p0.y;
  s2_x = q1.x - q0.x;
  s2_y = q1.y - q0.y;

  var s, t;
  s = (-s1_y * (p0.x - q0.x) + s1_x * (p0.y - q0.y)) / 
      (-s2_x * s1_y + s1_x * s2_y);
  t = ( s2_x * (p0.y - q0.y) - s2_y * (p0.x - q0.x)) / 
      (-s2_x * s1_y + s1_x * s2_y);

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return true;
  }

  return false;
}

function NumberCombo(str) {
  str = Combinations(str);
  var combos = new Map();
  var count = 0;
  for (var i = 0; i != str.length; i++) {
    combos.set(str[i], count++);
  }
  return combos;
}

function KeyOfMaxVal(map) {
  var max_val = Number.MIN_VALUE, max_key;
  for (var v of map) {
    if (v[1] > max_val) max_key = v[0];
  }
  return max_key;
}