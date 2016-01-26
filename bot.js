var botimg, bihw, bihh, bothigh, bhhw, bhhh;
var radius;
var max_vel;
var food_count, foodimg, fihw, fihh, food_particle, fooddie;
var sense_miss = "rgba(200, 50, 50, .3)", sense_hit = "rgba(200, 200, 50, .5)";

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

  max_vel = 1;

  food_count = 50;

  foodimg = new Image();
  foodimg.src = 'res/food.png';
  fihw = 4;
  fihh = 4;

  food_particle = new Image();
  food_particle.src = 'res/food_particle.png';

  fooddie = new Image();
  fooddie.src = 'res/fooddie.png';
}

function Bot(world) {
  this.pos = new Victor(Random() * (world.width), Random() * (world.height));
  this.vel = new Victor(0, 0);
  this.acc = new Victor(0, 0)
                   .randomize(new Victor(-1, 1), new Victor(1, -1));
  this.rot = 0;

  this.highlighted = false;

  this.energy = 100;

  this.beh = new Behaviour();
}

Bot.prototype.Init = function(parent) {
  this.beh.Init(parent);
};

Bot.prototype.ValInit = function() {
  this.vel = new Victor(0, 0);
  this.acc = new Victor(0.1, 0.1);
  this.beh.ValInit();
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
    if (this.pos.distance(world.food[i].center) < 7) {
      world.FoodEaten(world.food[i]);
      world.food.splice(i, 1);
      this.energy += 100;
      i--;
    }
  }

  return false;
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
  }
  ctx.restore();
  if (debug)
    ctx = this.beh.Draw(ctx, this);
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
  this.senses.push({
    p: new Victor(4, 0), q: new Victor(80, 0),
    rp: new Victor(4, 0), rq: new Victor(80, 0), accuracy: 1, hit: false
  });
  this.senses.push({
    p: new Victor(4, 0), q: new Victor(60, 30),
    rp: new Victor(4, 0), rq: new Victor(60, 30), accuracy: 1, hit: false
  });
  this.senses.push({
    p: new Victor(4, 0), q: new Victor(60, -30),
    rp: new Victor(4, 0), rq: new Victor(60, -30), accuracy: 1, hit: false
  });
}

Behaviour.prototype.Init = function(parent) {

};

Behaviour.prototype.ValInit = function() {
  this.routines = [];
  var routine = [];
  for (var j = 0; j != 5; j++) {
    routine.push({func: 2, repeats: 1});
  }
  this.routines.push(routine);

  this.r_ptr = 0;
  this.f_ptr = 0;
  this.repeat_cnt = 0;

  this.senses = [];
  this.senses.push({
    p: new Victor(4, 0), q: new Victor(80, 0),
    rp: new Victor(4, 0), rq: new Victor(80, 0), accuracy: 1, hit: false
  });
  this.senses.push({
    p: new Victor(4, 0), q: new Victor(60, 30),
    rp: new Victor(4, 0), rq: new Victor(60, 30), accuracy: 1, hit: false
  });
  this.senses.push({
    p: new Victor(4, 0), q: new Victor(60, -30),
    rp: new Victor(4, 0), rq: new Victor(60, -30), accuracy: 1, hit: false
  });
}

Behaviour.prototype.Draw = function(ctx, bot) {
  for (var i = 0; i != this.senses.length; i++) {
    var r = this.senses[i];
    r.rp.x = r.p.x + bot.pos.x; 
    r.rp.y = r.p.y + bot.pos.y;
    r.rq.x = r.q.x + bot.pos.x; 
    r.rq.y = r.q.y + bot.pos.y;
    r.rp = RotatePointRad(r.rp, new Victor(r.rp.x-4, r.rp.y), bot.rot);
    r.rq = RotatePointRad(r.rq, new Victor(r.rp.x-4, r.rp.y), bot.rot);
    ctx.save();
    if (r.hit) {
      ctx.save();
      ctx = DrawLineVic(ctx, r.rp, r.rq, sense_hit, 3);
      ctx.restore();
    } else {
      ctx.save();
      ctx = DrawLineVic(ctx, r.rp, r.rq, sense_miss, 3);
      ctx.restore();
    }
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

  for (var i = 0; i != this.senses.length; i++) {
    this.senses[i].hit = false;
    for (var j = 0; j != world.food.length; j++) {
      if (world.food[j].tl != undefined && world.food[j].tl != undefined) {
        if (LineIntersects(this.senses[i].rp, this.senses[i].rq,
                           world.food[j].tl, world.food[j].br)) {
          this.senses[i].hit = true;
        }
      }
    }
  }

  return bot.acc;
};

Behaviour.prototype.ToString = function() {
  var s = "";
  for (var i = 0; i != this.routines.length; i++) {
    for (var j = 0; j != this.routines[i].length; j++) {
      s += "{" + this.routines[i][j].func + "," + this.routines[i][j].repeats;
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
  vec.x = vec.x/10;
  vec.y = vec.y/10;
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

function World(w, h, m) {
  this.width = w;
  this.height = h;
  this.margin = m;

  this.food = [];
  for (var i = 0; i != food_count; i++) {
    this.NewFood();
  }

  this.animations = [];
}

World.prototype.NewFood = function() {
  var i = this.food.length;
  this.food.push({
    pos: undefined, tl: undefined, br: undefined, center: undefined
  });
  this.food[i].pos = new Victor(Random2(this.width-margin*2) + margin, 
                                Random2(this.height-margin*2) + margin);
  this.food[i].tl = new Victor(this.food[i].pos.x - 1, 
                               this.food[i].pos.y - 1);
  this.food[i].br = new Victor(this.food[i].pos.x + 9, 
                               this.food[i].pos.y + 9);
  this.food[i].center = new Victor(this.food[i].pos.x + 4, 
                                   this.food[i].pos.y + 4);  
};

World.prototype.Update = function(dt) {
  for (var i = 0; i != this.animations.length; i++) {
    if (this.animations[i].Update(dt)) {
      this.animations.splice(i, 1);
      i--;
    }
  }
  if (this.food.length < food_count) {
    this.NewFood();
  }
};

World.prototype.Draw = function(ctx) {
  for (var i = 0; i != this.food.length; i++) {
    ctx.save();
    ctx.translate(this.food[i].pos.x, this.food[i].pos.y);
    ctx.drawImage(foodimg, 0, 0);
    ctx.restore();
    
    if (debug)
      ctx = DrawLineVic(ctx, this.food[i].tl, this.food[i].br, "#FFFFFF", 1);
  }

  for (var i = 0; i != this.animations.length; i++) {
    this.animations[i].Draw(ctx);
  }
  return ctx;
};

World.prototype.FoodEaten = function(food) {
  this.animations.push(new Animated(food.pos, fooddie, 8, 2, 16));
};

function Animated(pos, img, frame_count, fr, size) {
  this.pos = pos;
  this.frame = 0;
  this.img = img;
  this.frame_count = frame_count;
  this.size = size;
  this.frame_repeat = fr;
  this.frame_repeat_cnt = 0;
}

Animated.prototype.Update = function(dt) {
  this.frame_repeat_cnt++;
  if (this.frame_repeat_cnt >= this.frame_repeat) {
    this.frame++;
    this.frame_repeat_cnt = 0;
  }
  return this.frame == this.frame_count;
};

Animated.prototype.Draw = function(ctx) {
  if (this.pos == undefined) return ctx;
  ctx.save();
  ctx.translate(this.pos.x, this.pos.y);
  ctx.drawImage(this.img, this.frame*this.size, 0, this.size, this.size,
                -4, -4, this.size, this.size);
  ctx.restore();
  return ctx;
};