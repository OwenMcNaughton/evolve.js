var botimg, bihw, bihh, bothigh, bhhw, bhhh;
var foodimg, fihw, fihh, food_particle, fooddie;
var sense_miss = "rgba(200, 50, 50, .3)", sense_hit = "rgba(200, 200, 50, .5)";

var BOT_COUNT = 50, FOOD_COUNT = 150, MUT_FUNC = 20, MUT_REPEATS = 5,
    BEST_EXTRACTION_COUNT = 5, CHILDREN_COUNT = 10, MAX_VEL = 3, 
    MAX_SENSE_MAG = 200, MOUSE_BOT_RADIUS = 15, ROUTINE_LENGTH = 5,
    MOVE_COST = 0, MOVE_COST_ON = false;

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

Bot.prototype.Update = function(world, dt) {
  this.vel = this.beh.Update(this, world);

  this.vel.add(this.acc);
  this.acc.x /= 2; this.acc.y /= 2;
  if (this.vel.magnitude() > MAX_VEL) {
    this.vel = this.vel.norm();
    this.vel = this.vel.limit(Number.MIN_VALUE, MAX_VEL);
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
      i--;
      this.energy += 200;
    }
  }

  return false;
  return this.energy < 0;
};

Bot.prototype.MouseHit = function(mouse_pos) {
  if (this.pos.distance(mouse_pos) < MOUSE_BOT_RADIUS) {
    this.highlighted = true;
    return true;
  } else {
    this.highlighted = false;
    return false;
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
  this.senses = [];
  this.senses.push({
    p: new Victor(4, 0), q: new Victor(80, 0),
    rp: new Victor(4, 0), rq: new Victor(80, 0), accuracy: 1, hit: false
  });
  this.senses.push({
    p: new Victor(4, 0), q: new Victor(55, 30),
    rp: new Victor(4, 0), rq: new Victor(55, 30), accuracy: 1, hit: false
  });
  this.senses.push({
    p: new Victor(4, 0), q: new Victor(55, -30),
    rp: new Victor(4, 0), rq: new Victor(55, -30), accuracy: 1, hit: false
  });
  
  this.MapSensesToActions();
  
  this.routines = [];
  for (var i = 0; i != this.reflex_count+1; i++) {
    var routine = [];
    for (var j = 0; j != ROUTINE_LENGTH; j++) {
      routine.push({func: Random2(4), repeats: Random2(15)});
    }
    this.routines.push(routine);
  }

  this.r_ptr = Random2(this.routines.length-1);
  this.last_r_ptr = this.r_ptr;
  this.f_ptr = 0;
  this.repeat_cnt = 0;
}

Behaviour.prototype.MapSensesToActions = function() {
  var fn = function(active, rest, a) {
    if (!active && !rest)
      return;
    if (!rest) {
      a.push(active);
    } else {
      fn(active + rest[0], rest.slice(1), a);
      fn(active, rest.slice(1), a);
    }
    return a;
  };
  
  var sense_count = 0;
  var str = "";
  for (var i = 0; i != this.senses.length; i++) {
    str += "" + sense_count++;
  }
  var arr = fn("", str, []);
  
  this.senses_to_routines_arr = [];
  this.senses_to_routines_arr.push("NA");
  this.senses_to_routines = new Map();
  this.senses_to_routines.set("", 0);
  var count = 1;
  for (var i = 0; i != arr.length; i++) {
    this.senses_to_routines.set(arr[i], count++);
    this.senses_to_routines_arr.push(arr[i]);
  }
  
  this.reflex_count = arr.length;
};

Behaviour.prototype.SenseMag = function() {
  var mag = 0;
  for (var i = 0; i != this.senses.length; i++) {
    mag += this.senses[i].p.distance(this.senses[i].q) * 
           1/this.senses[i].accuracy;
  }
  return mag;
};

Behaviour.prototype.Init = function(par) {
  this.routines = [];
  for (var i = 0; i != par.routines.length; i++) {
    var routine = [];
    for (var j = 0; j != ROUTINE_LENGTH; j++) {
      var command = {func: par.routines[i][j].func,
                     repeats: par.routines[i][j].repeats};
      if (Random2(MUT_FUNC) == 0) command.func = Random2(4);
      if (Random2(MUT_REPEATS) == 0) command.repeats = Random2(15);
      routine.push(command);
    }
    this.routines.push(routine);
  }
  
  this.senses = [];
  var old_senses = [];
  for (var i = 0; i != par.senses.length; i++) {
    old_senses.push({
      p: new Victor(par.senses[i].p.x, par.senses[i].p.y),
      q: new Victor(par.senses[i].q.x, par.senses[i].q.y),
      rp: new Victor(0, 0), rq: new Victor(0, 0), accuracy: 0
    });
    var newq = new Victor(par.senses[i].q.x + Random2(4)-2,
                          par.senses[i].q.y + Random2(4)-2)
    var sense = {p: par.senses[i].p, q: newq,
                 rp: par.senses[i].rp, rq: par.senses[i].rq, 
                 accuracy: par.senses[i].accuracy};
    this.senses.push(sense);
  }
  if (!mutate_senses || this.SenseMag() > MAX_SENSE_MAG) {
    this.senses = old_senses;
  }
};

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
  var on_senses = "";
  for (var i = 0; i != this.senses.length; i++) {
    this.senses[i].hit = false;
    for (var j = 0; j != world.food.length; j++) {
      if (world.food[j].tl != undefined && world.food[j].tl != undefined) {
        if (LineIntersects(this.senses[i].rp, this.senses[i].rq,
                           world.food[j].tl, world.food[j].br)) {
          this.senses[i].hit = true;
          on_senses += "" + i;
          break;
        }
      }
    }
  }
  
  this.r_ptr = this.senses_to_routines.get(on_senses);
  
  if (this.r_ptr != this.last_r_ptr) {
    this.repeat_cnt = 0;
    this.f_ptr = 0;
  }
  
  this.last_r_ptr = this.r_ptr;
  
  var old_vel = new Victor(bot.vel.x, bot.vel.y);
  switch (this.routines[this.r_ptr][this.f_ptr].func) {
    case 0: bot.vel = this.Accelerate(bot.vel); bot.energy -= MOVE_COST; break;
    case 1: bot.vel = this.Decelerate(bot.vel); break;
    case 2: bot.vel = this.TurnLeft(bot.vel); bot.energy -= MOVE_COST; break;
    case 3: bot.vel = this.TurnRight(bot.vel); bot.energy -= MOVE_COST; break;
  }
  if (isNaN(bot.vel.x) || isNaN(bot.vel.y)) {
    bot.vel = old_vel;
  }
  this.repeat_cnt++;
  if (this.repeat_cnt >= this.routines[this.r_ptr][this.f_ptr].repeats) {
    this.f_ptr++;
    if (this.f_ptr >= this.routines[this.r_ptr].length) {
      this.f_ptr = 0;
    }
    this.repeat_cnt = 0;
  }

  return bot.vel;
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

Behaviour.prototype.RoutineToString = function(i) {
  var s = "";
  for (var j = 0; j != this.routines[i].length; j++) {
    s += this.routines[i][j].func + "," + this.routines[i][j].repeats + " ";
  }
  return s;
};

Behaviour.prototype.Accelerate = function(vec) {
  vec.add(new Victor(0.02, 0.02));
  return vec;
};

Behaviour.prototype.Decelerate = function(vec) {
  vec.x /= 1.1;
  vec.y /= 1.1;
  
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
  
  this.bots = [];
  for (var i = 0; i != BOT_COUNT; i++) {
    this.bots.push(new Bot(this));
  }

  this.food = [];
  for (var i = 0; i != FOOD_COUNT; i++) {
    this.NewFood();
  }

  this.animations = [];
  
  this.focus_beh = [];
  this.bot_focus = -1;
}

World.prototype.NewFood = function() {
  var i = this.food.length;
  this.food.push({
    pos: undefined, tl: undefined, br: undefined, center: undefined,
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
  for (var i = 0; i < this.bots.length; i++) {
    if (this.bots[i].Update(this, dt)) {
      this.bots.splice(i--, 1);
    }
  }
  
  for (var i = 0; i != this.animations.length; i++) {
    if (this.animations[i].Update(dt)) {
      this.animations.splice(i, 1);
      i--;
    }
  }
  if (this.food.length < FOOD_COUNT) {
    this.NewFood();
  }
};

World.prototype.Draw = function(ctx) {
  for (var i = 0; i < this.bots.length; i++) {
    ctx = this.bots[i].Draw(ctx);
  }
  
  for (var i = 0; i != this.food.length; i++) {
    ctx.save();
    ctx.translate(this.food[i].pos.x, this.food[i].pos.y);
    ctx.drawImage(foodimg, 0, 0);
    ctx.restore();
    
    if (debug) {
      //ctx = DrawLineVic(ctx, this.food[i].tl, this.food[i].br, "#FFFFFF", 1);
    }
  }

  for (var i = 0; i != this.animations.length; i++) {
    this.animations[i].Draw(ctx);
  }
  return ctx;
};

World.prototype.FoodEaten = function(food) {
  this.animations.push(new Animated(food.pos, fooddie, 8, 2, 16));
};

World.prototype.NextGen = function() {
  var total_energy = 0;
  for (var i = 0; i != this.bots.length; i++) {
    total_energy += this.bots[i].energy;
  }
  
  var new_bots = [];
  for (var j = 0; j != BEST_EXTRACTION_COUNT; j++) {
    var best_score = Number.MIN_VALUE, best_idx = 0;
    for (var i = 0; i != this.bots.length; i++) {
      if (this.bots[i].energy > best_score) {
        best_score = this.bots[i].energy;
        best_idx = i;
      }
    }
    var best = this.bots[best_idx];
    for (var i = 0; i != CHILDREN_COUNT; i++) {
      var bot = new Bot(this);
      bot.Init(best.beh);
      new_bots.push(bot);
    }
    this.bots.splice(best_idx, 1);
  }
  this.bots = new_bots;

  this.food = [];
  for (var i = 0; i != FOOD_COUNT; i++) {
    this.NewFood();
  }

  this.animations = [];
  
  this.food = [];
  for (var i = 0; i != FOOD_COUNT; i++) {
    this.NewFood();
  }
  
  return total_energy;
};

World.prototype.MouseMove = function(mouse_pos) {
  for (var i = 0; i != this.bots.length; i++) {
    if (this.bots[i].MouseHit(mouse_pos)) {
      this.bot_focus = i;
      this.focus_beh = this.BehToString(i);
    }
  }
};

World.prototype.AverageBehToString = function() {
  var s = [];
  var func_str = ["A.", "D.", "L.", "R."];
  for (var i = 0; i != this.bots[0].beh.senses_to_routines_arr.length; i++) {
    var avg_routine = this.bots[0].beh.senses_to_routines_arr[i] + " ";
    for (var j = 0; j != ROUTINE_LENGTH; j++) {
      var total_repeats = 0;
      var funcs = [0, 0, 0, 0];
      for (var k = 0; k != this.bots.length; k++) {
        funcs[this.bots[k].beh.routines[i][j].func]++;
        total_repeats += this.bots[k].beh.routines[i][j].repeats;
      }
      var idx = funcs.indexOf(Math.max.apply(Math, funcs));
      avg_routine += func_str[idx] + "" + 
                     (total_repeats/this.bots.length).toFixed(0) + " ";
    }
    s.push(avg_routine);
  }
  return s;
};

World.prototype.BehToString = function(k) {
  var s = [];
  var func_str = ["A.", "D.", "L.", "R."];
  for (var i = 0; i != this.bots[k].beh.senses_to_routines_arr.length; i++) {
    var avg_routine = this.bots[k].beh.senses_to_routines_arr[i] + " ";
    for (var j = 0; j != ROUTINE_LENGTH; j++) {
      avg_routine += func_str[this.bots[k].beh.routines[i][j].func] + "" + 
                     this.bots[k].beh.routines[i][j].repeats + " ";
    }
    s.push(avg_routine);
  }
  return s;
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