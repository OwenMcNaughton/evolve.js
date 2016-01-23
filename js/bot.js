var botimg, hw, hh;

Init();

function Init() {
  botimg = new Image();
  botimg.src = 'res/botimg.png';
  hw = 8;
  hh = 8;
}

function Bot(world) {
  this.pos = new Vector(Random() * (world.width/2), Random() * (world.height/2));
  this.vel = new Vector(0, 0);
  this.acc = new Vector(0, 0);
  this.rot = 0;
  
  this.beh = new Behaviour();
}

function Bot(world, parent) {
  this.pos = new Vector(Random() * (world.width/2), Random() * (world.height/2));
  this.vel = new Vector(0, 0);
  this.acc = new Vector(0, 0);
  this.rot = 0;
  
  this.beh = new Behaviour(parent);
}

Bot.prototype.Update = function(world, dt) {
  this.acc = this.beh.Update(this, world);
  
  this.vel.Add(this.acc);
  //this.pos.Add(this.vel);
  this.rot = Math.acos(this.vel.x / 
                       Math.sqrt(this.vel.x*this.vel.x + this.vel.y*this.vel.y)) 
                       * 180 / Math.PI;
};

Bot.prototype.Draw = function(ctx) {
  ctx.translate(this.pos.x + hw, this.pos.y + hh);
  ctx.rotate(this.rot);
  ctx.drawImage(botimg, this.pos.x - hw, this.pos.y - hh);
  return ctx;
};

function Behaviour() {
  
}

function Behaviour(parent) {
  
}

Behaviour.prototype.Update = function(bot, world) {
  return bot.acc;
};

function World(w, h) {
  this.width = w;
  this.height = h;
}