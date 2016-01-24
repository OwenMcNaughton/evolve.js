var botimg, bihw, bihh, bothigh, bhhw, bhhh;
var radius;

Init();

function Init() {
  botimg = new Image();
  botimg.src = 'res/bot.png';
  bihw = 4;
  bihh = 4;
  
  bothigh = new Image();
  bothigh.src = 'res/bothigh.png';
  bhhw = 8;
  bhhh = 8;
  
  radius = 8;
}

function Bot(world) {
  this.pos = new Victor(Random() * (world.width), Random() * (world.height));
  this.vel = new Victor(1, 0);
  this.acc = new Victor(0, 0);
  this.rot = 0;
  
  this.highlighted = false;
  this.flipped = false;
  
  this.beh = new Behaviour();
}

Bot.prototype.Init = function(parent) {
  this.beh.Init(parent);
};

Bot.prototype.Update = function(world, dt) {
  this.acc = this.beh.Update(this, world);
  
  this.vel.add(this.acc);
  //this.pos.Add(this.vel);
  this.vel.rotate(0.01);
  this.rot = this.vel.angle(this.rot);
};

Bot.prototype.MouseHit = function(mouse_pos) {
  if (this.pos.distance(mouse_pos) < radius) {
    this.highlighted = true;
  } else {
    this.highlighted = false;
  }
};

Bot.prototype.Draw = function(ctx) {
  ctx.save();
  if (this.highlighted) {
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rot);
    ctx.drawImage(bothigh, -bhhw, -bhhh);
  } else {
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rot);
    ctx.drawImage(botimg, -bihw, -bihh);
  }
  ctx.restore();
  return ctx;
};

function Behaviour() {
  
}

Behaviour.prototype.Init = function(parent) {
  
};

Behaviour.prototype.Update = function(bot, world) {
  return bot.acc;
};

Behaviour.prototype.GoForward = function(vec) {
  vec.MulScalar(1.1);
};

function World(w, h) {
  this.width = w;
  this.height = h;
}