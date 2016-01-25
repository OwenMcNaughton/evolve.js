var botimg, bihw, bihh, bothigh, bhhw, bhhh, vision;
var radius;
var max_vel;
var food_count, foodimg, fihw, fihh, food_particle, fooddie;

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
  
  max_vel = 4;
  
  food_count = 50;
  
  foodimg = new Image();
  foodimg.src = 'res/food.png';
  fihw = 4;
  fihh = 4;
  
  food_particle = new Image();
  food_particle.src = 'res/food_particle.png';
  
  fooddie = new Image();
  fooddie.src = 'res/fooddie.png';
  
  vision = new Image();
  vision.src = 'res/vision.png';
}

function Bot(world) {
  this.pos = new Victor(Random() * (world.width), Random() * (world.height));
  this.vel = new Victor(0, 0);
  this.acc = new Victor(0.1, 0.1);
  this.rot = 0;
  
  this.highlighted = false;
  
  this.energy = 100;
  
  this.beh = new Behaviour();
}

Bot.prototype.Init = function(parent) {
  this.beh.Init(parent);
};

Bot.prototype.Update = function(world, dt) {
  this.acc = this.beh.Update(this, world);
  
  this.vel.add(this.acc);
  if (this.vel.magnitude() > max_vel) {
    this.vel = this.vel.norm();
    this.vel = this.vel.limit(Number.MIN_VALUE, max_vel);
  }
  this.pos.add(this.vel);
  this.rot = this.vel.angle();
  
  if (this.pos.x > world.width) this.pos.x = 0;
  if (this.pos.x < 0) this.pos.x = world.width - 1;
  if (this.pos.y > world.height) this.pos.y = 0;
  if (this.pos.y < 0) this.pos.y = world.height - 1;
  
  for (var i = 0; i != world.food.length; i++) {
    if (this.pos.distance(world.food[i]) < 7) {
      world.FoodEaten(new Victor(this.pos.x, this.pos.y));
      world.food.splice(i, 1);
      this.energy += 100;
      i--;
    }
  }
  
  return this.energy < 0;
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
    ctx = this.beh.Draw(ctx);
  }
  ctx.restore();
  return ctx;
};

function Behaviour() {
  this.routines = [];
  for (var i = 0; i != 10; i++) {
    var routine = [];
    for (var j = 0; j != 5; j++) {
      routine.push({func: Random2(4), repeats: Random2(15)});
    }
    this.routines.push(routine);
  }
  
  this.r_ptr = 0;
  this.f_ptr = 0;
  this.repeat_cnt = 0;
  
  this.senses = [];
  this.senses.push({x: 0, y: 0, w: 80, h: 12});
  this.senses.push({x: 0, y: 19, w: 70, h: 20});
  this.senses.push({x: 0, y: -19, w: 70, h: 20});
}

Behaviour.prototype.Init = function(parent) {
  
};

Behaviour.prototype.Draw = function(ctx) {
  for (var i = 0; i != this.senses.length; i++) {
    ctx.save();
    var r = this.senses[i];
    ctx.translate(bihw, -r.h/2 + r.y);
    ctx.drawImage(vision, 0, 0, 1, 1, 0, 0, r.w, r.h);
    ctx.restore();
  }
  
  return ctx;
};

Behaviour.prototype.Update = function(bot, world) {
  var old_acc = new Victor(bot.acc.x, bot.acc.y);
  switch (this.routines[this.r_ptr][this.f_ptr].func) {
    case 0: bot.acc = this.Accelerate(bot.acc); bot.energy -= 4; break;
    case 1: bot.acc = this.Decelerate(bot.acc); break;
    case 2: bot.acc = this.TurnLeft(bot.acc); bot.energy -= 1; break;
    case 3: bot.acc = this.TurnRight(bot.acc); bot.energy -= 1; break;
  }
  if (isNaN(bot.acc.x) || isNaN(bot.acc.y)) {
    bot.acc = old_acc;
  }
  this.repeat_cnt++;
  if (this.repeat_cnt >= this.routines[this.r_ptr][this.f_ptr].repeats) {
    this.f_ptr++;
    if (this.f_ptr >= this.routines[this.r_ptr].length) {
      this.f_ptr = 0;
    }
    this.repeat_cnt = 0;
  }
  return bot.acc;
};

Behaviour.prototype.ToString = function() {
  var s = "";
  for (var i = 0; i != this.routines.length; i++) {
    for (var j = 0; j != this.routines[i].length; j++) {
      s += "{" +this.routines[i][j].func + "," + this.routines[i][j].repeats;
      s += "}";
    }
    s += "\n";
  }
  return s;
};

Behaviour.prototype.Accelerate = function(vec) {
  vec.multiply(1.1);
  return vec;
};

Behaviour.prototype.Decelerate = function(vec) {
  vec.divide(1.1);
  return vec;
};

Behaviour.prototype.TurnLeft = function(vec) {
  vec.rotate(-.1);
  return vec;
};

Behaviour.prototype.TurnRight = function(vec) {
  vec.rotate(.1);
  return vec;
};

function World(w, h) {
  this.width = w;
  this.height = h;
  
  this.food = [];
  for (var i = 0; i != food_count; i++) {
    this.food.push(new Victor(Random2(this.width), Random2(this.height)));
  }
  
  this.animations = [];
}

World.prototype.Update = function(dt) {
  for (var i = 0; i != this.animations.length; i++) {
    if (this.animations[i].Update(dt)) {
      this.animations.splice(i, 1);
      i--;
    }
  }
  if (this.food.length < food_count) {
    this.food.push(new Victor(Random2(this.width), Random2(this.height)));
  }
};

World.prototype.Draw = function(ctx) {
  for (var i = 0; i != this.food.length; i++) {
    ctx.save();
    ctx.translate(this.food[i].x, this.food[i].y);
    ctx.drawImage(foodimg, -fihw, -fihh);
    ctx.restore();
  }
  
  for (var i = 0; i != this.animations.length; i++) {
    this.animations[i].Draw(ctx);
  }
  return ctx;
};

World.prototype.FoodEaten = function(pos) {
  var velxs = [1, -1, -2, 2];
  var velys = [1, -1, -2, 2];
  for (var i = 0; i != 4; i++) {
    for (var j = 0; j != 4; j++) {
      var vel = new Victor(velxs[i], velys[j]);
      this.animations.push(new Animated(pos, fooddie, 8, 16));
    }
  }
};

function Animated(pos, img, frame_count, size) {
  this.pos = pos;
  this.frame = 0;
  this.img = img;
  this.frame_count = frame_count;
  this.size = size;
}

Animated.prototype.Update = function(dt) {
  this.frame++;
  return this.frame == this.frame_count;
};

Animated.prototype.Draw = function(ctx) {
  if (this.pos == undefined) return ctx;
  ctx.save();
  ctx.translate(this.pos.x, this.pos.y);
  ctx.drawImage(this.img, this.frame*this.size, 0, this.size, this.size,
                0, 0, this.size, this.size);
  ctx.restore();
  return ctx;
};