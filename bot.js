var herbimg, bihw, bihh, herbhigh, bhhw, bhhh, carnimg, carnhigh;


var foodimg, fihw, fihh, food_particle, fooddie, foodeat, bullet, 
    herbeat, herbdie;
var sense_miss = "rgba(70, 70, 70, .3)", 
    sense_hitv = "rgba(50, 200, 50, .5)",
    sense_hith = "rgba(200, 200, 50, .5)",
    sense_hitc = "rgba(200, 50, 50, .5)";

var HERB_COUNT = 100, CARN_COUNT = 100, FOOD_COUNT = 60, MUT_FUNC = 20,
    MUT_REPEATS = 10, BEST_EXTRACTION_COUNT = 5, CHILDREN_COUNT = 10, 
    MAX_VEL = 3,  MAX_SENSE_MAG = 400, MOUSE_BOT_RADIUS = 15, 
    ROUTINE_LENGTH = 5, MOVE_COST = 0, BULLET_COST = 50, SENSE_MUTATION = 0,
    MULTI_SENSE = false;

var HERBIVORE = 0, CARNIVORE = 1;

var ACC = "A", DEC = "D", TL = "L", TR = "R", SH = "S";
var cmds = [ACC, DEC, TL, TR, SH];

Init();

function Init() {
  herbimg = new Image();
  herbimg.src = 'res/herb.png';
  bihw = 4;
  bihh = 4;
  
  herbhigh = new Image();
  herbhigh.src = 'res/herbhigh.png';
  bhhw = 8;
  bhhh = 8;
  
  carnimg = new Image();
  carnimg.src = 'res/carn.png';
  
  carnhigh = new Image();
  carnhigh.src = 'res/carnhigh.png';
  
  foodimg = new Image();
  foodimg.src = 'res/food.png';
  fihw = 4;
  fihh = 4;
  
  food_particle = new Image();
  food_particle.src = 'res/food_particle.png';
  
  fooddie = new Image();
  fooddie.src = 'res/fooddie.png';
  
  foodeat = new Image();
  foodeat.src = 'res/foodeat.png';
  
  herbdie = new Image();
  herbdie.src = 'res/herbdie.png';
  
  herbeat = new Image();
  herbeat.src = 'res/herbeat.png';
  
  bullet = new Image();
  bullet.src = 'res/bullet.png';
}

function CarnSenses(senses) {
  senses = [];
  senses.push({
    p: new Victor(14, 0), q: new Victor(80, 0), id: "F",
    rp: new Victor(14, 0), rq: new Victor(80, 0), accuracy: 1, hit: false
  });
  senses.push({
    p: new Victor(0, 0), q: new Victor(10, 0), id: "C",
    rp: new Victor(0, 0), rq: new Victor(10, 0), accuracy: 1, hit: false
  });
  senses.push({
    p: new Victor(4, 4), q: new Victor(55, 30), id: "R",
    rp: new Victor(4, 4), rq: new Victor(55, 30), accuracy: 1, hit: false
  });
  senses.push({
    p: new Victor(4, -4), q: new Victor(55, -30), id: "L",
    rp: new Victor(4, -4), rq: new Victor(55, -30), accuracy: 1, hit: false
  });
  return senses;
}

function HerbSenses(senses) {
  senses = [];
  senses.push({
    p: new Victor(14, 0), q: new Victor(80, 0), id: "F",
    rp: new Victor(14, 0), rq: new Victor(80, 0), accuracy: 1, hit: false
  });
  senses.push({
    p: new Victor(0, 0), q: new Victor(10, 0), id: "C",
    rp: new Victor(0, 0), rq: new Victor(10, 0), accuracy: 1, hit: false
  });
  senses.push({
    p: new Victor(4, 4), q: new Victor(55, 30), id: "R",
    rp: new Victor(4, 4), rq: new Victor(55, 30), accuracy: 1, hit: false
  });
  senses.push({
    p: new Victor(4, -4), q: new Victor(55, -30), id: "L",
    rp: new Victor(4, -4), rq: new Victor(55, -30), accuracy: 1, hit: false
  });
  senses.push({
    p: new Victor(-4, -4), q: new Victor(-20, -10), id: "BL",
    rp: new Victor(4, -4), rq: new Victor(55, -30), accuracy: 1, hit: false
  });
  senses.push({
    p: new Victor(-4, 4), q: new Victor(-20, 10), id: "BR",
    rp: new Victor(4, -4), rq: new Victor(55, -30), accuracy: 1, hit: false
  });  
  return senses;  
}

function Bot(world, type) {
  this.pos = new Victor(Random() * (world.width), Random() * (world.height));
  this.vel = new Victor(0, 0);
  this.vel.x += Math.random() - 0.5;
  this.vel.y += Math.random() - 0.5;
  this.acc = new Victor(0, 0);

  this.tl = new Victor(this.pos.x - 4, this.pos.y - 4);
  this.br = new Victor(this.pos.x + 4, this.pos.y + 4);

  this.rot = 0;
  this.ang_rot = 0;

  this.highlighted = false;

  this.energy = 50;

  this.type = type;
  this.beh = new Behaviour(type);
  
  switch (this.type) {
    case HERBIVORE: this.img = herbimg; this.highimg = herbhigh; break;
    case CARNIVORE: this.img = carnimg; this.highimg = carnhigh; break;
  }
}

Bot.prototype.Init = function(parent) {
  this.beh.Init(parent);
};

Bot.prototype.InitFromString = function(str) {
  this.beh.InitFromString(str);
};

Bot.prototype.Update = function(world, dt) {
  this.vel = this.beh.Update(this, world);

  this.vel.add(this.acc);
  if (this.vel.magnitude() > MAX_VEL) {
    this.vel = this.vel.norm();
    this.vel = this.vel.limit(Number.MIN_VALUE, MAX_VEL);
  }
  this.pos.add(this.vel);
  this.br.x = this.pos.x + 4; this.br.y = this.pos.y + 4;
  this.tl.x = this.pos.x - 4; this.tl.y = this.pos.y - 4;
  this.rot = this.vel.angle();
  

  if (this.pos.x > world.width) this.pos.x = 0;
  if (this.pos.x < 0) this.pos.x = world.width - 1;
  if (this.pos.y > world.height) this.pos.y = 0;
  if (this.pos.y < 0) this.pos.y = world.height - 1;

  if (this.type == HERBIVORE) {
    for (var i = 0; i != world.food.length; i++) {
      if (this.pos.distance(world.food[i].center) < 7) {
        world.VegEating(world.food[i].pos.x, world.food[i].pos.y);
        this.energy += 1;
        world.food[i].energy -= 1;
        if (world.food[i].energy < 0) {
          world.VegEaten(world.food[i].pos.x, world.food[i].pos.y);
          world.food.splice(i, 1);
          i--;
        }
      }
    }
  } else {
    for (var i = 0; i != world.bots.length; i++) {
      if (world.bots[i].type == CARNIVORE || world.bots[i] == this) continue;
      if (this.pos.distance(world.bots[i].pos) < 7) {
        world.HerbEating(world.bots[i].pos.x, world.bots[i].pos.y);
        this.energy += 1;
        world.bots[i].energy -= 1;
        if (world.bots[i].energy < 0) {
          world.HerbEaten(world.bots[i].pos.x, world.bots[i].pos.y);
          world.bots.splice(i, 1);
          i--;
        }
      }
    }
  }
  
  for (var i = 0; i != world.spikes.length; i++) {
    if (LineIntersects(this.br, this.tl, 
                       world.spikes[i].p, world.spikes[i].q)) {
      this.vel.invert();
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
    ctx.drawImage(this.highimg, -bhhw, -bhhh);
  } else {
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rot);
    ctx.drawImage(this.img, -bihw, -bihh);
  }
  ctx.restore();
  if (debug) ctx = this.beh.Draw(ctx, this);
  return ctx;
};

function Behaviour(type) {
  this.type = type;
  switch (type) {
    case HERBIVORE: this.senses = HerbSenses(); break;
    case CARNIVORE: this.senses = CarnSenses(); break;
  }
  
  this.MapSensesToActions();
  
  this.routines = [];
  for (var i = 0; i != this.reflex_count+1; i++) {
    var routine = [];
    for (var j = 0; j != ROUTINE_LENGTH; j++) {
      routine.push({func: cmds[Random2(cmds.length-1)], repeats: Random2(10)});
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
  
  var str = "";
  for (var i = 0; i != this.senses.length; i++) {
    if (this.type == HERBIVORE) {
      str += this.senses[i].id + "v,";
      str += this.senses[i].id + "c,";
    } else {
      str += this.senses[i].id + "h,";
    }
  }
  var arr = [];
  if (MULTI_SENSE) {
    arr = fn("", str, []);
  } else {
    arr = str.split(",");
    arr.pop();
  }
  
  this.senses_to_routines_arr = [];
  this.senses_to_routines_arr.push("N");
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

Behaviour.prototype.InitFromString = function(str) {
  var lines = str.split("\n");
  this.type = Number(lines[0]);
  var sense_strs = lines[1].split(";");
  this.senses = [];
  for (var i = 0; i != sense_strs.length; i++) {
    var s = sense_strs[i].split(" ");
    var sense = {
      p: new Victor(Number(s[1]), Number(s[2])),
      q: new Victor(Number(s[3]), Number(s[4])),
      id: s[0], rp: undefined, rq: undefined, accuracy: Number(s[5])
    };
    sense.rp = sense.p.clone();
    sense.rq = sense.q.clone();
    this.senses.push(sense);
  }
  
  this.MapSensesToActions();
  
  this.routines = [];
  for (var i = 2; i != lines.length; i++) {
    var r_str = lines[i].split(" ");
    var routine = [];
    for (var j = 1; j != r_str.length; j++) {
      var c_str = r_str[j].split("");
      routine.push({func: c_str[0], repeats: Number(c_str[1])});
    }
    this.routines.push(routine);
  }
};

Behaviour.prototype.Init = function(par) {
  this.type = par.type;
  this.senses = [];
  var old_senses = [];
  for (var i = 0; i != par.senses.length; i++) {
    old_senses.push({
      p: new Victor(par.senses[i].p.x, par.senses[i].p.y),
      q: new Victor(par.senses[i].q.x, par.senses[i].q.y), id: par.senses[i].id,
      rp: new Victor(0, 0), rq: new Victor(0, 0), accuracy: 0
    });
    var newq = new Victor(
      par.senses[i].q.x + Random2(SENSE_MUTATION)-SENSE_MUTATION/2,
      par.senses[i].q.y + Random2(SENSE_MUTATION)-SENSE_MUTATION/2)
    var sense = {p: par.senses[i].p, q: newq, id: par.senses[i].id,
                 rp: par.senses[i].rp, rq: par.senses[i].rq, 
                 accuracy: par.senses[i].accuracy};
    this.senses.push(sense);
  }
  if (this.SenseMag() > MAX_SENSE_MAG) {
    this.senses = old_senses;
  }
  
  this.MapSensesToActions();
  
  this.routines = [];
  for (var i = 0; i != par.routines.length; i++) {
    var routine = [];
    for (var j = 0; j != ROUTINE_LENGTH; j++) {
      var command = {func: par.routines[i][j].func,
                     repeats: par.routines[i][j].repeats};
      if (Random2(MUT_FUNC) == 0) command.func = cmds[Random2(cmds.length-1)];
      if (Random2(MUT_REPEATS) == 0) command.repeats = Random2(10);
      routine.push(command);
    }
    this.routines.push(routine);
  }
};

Behaviour.prototype.Draw = function(ctx, bot) {
  for (var i = 0; i != this.senses.length; i++) {
    var r = this.senses[i];
    ctx.save();
    switch (r.hit) {
      case "": DrawLineVic(ctx, r.rp, r.rq, sense_miss, 3); break;
      case "h": DrawLineVic(ctx, r.rp, r.rq, sense_hith, 3); break;
      case "c": DrawLineVic(ctx, r.rp, r.rq, sense_hitc, 3); break;
      case "v": DrawLineVic(ctx, r.rp, r.rq, sense_hitv, 3); break;
    }
    ctx.restore();
  }
  return ctx;
};

Behaviour.prototype.HerbSenseUpdate = function(bot, world, on_senses) {
  for (var i = 0; i != this.senses.length; i++) {
    var r = this.senses[i];
    var breaker = false;
    for (var j = 0; j != world.food.length; j++) {
      if (world.food[j].tl != undefined && world.food[j].tl != undefined) {
        if (LineIntersects(r.rp, r.rq, world.food[j].tl, world.food[j].br)) {
          r.hit = "v";
          on_senses = r.id + "v";
          breaker = true;
          break;
        }
      }
    }
    if (breaker) break;
  }
  
  for (var i = 0; i != this.senses.length; i++) {
    var r = this.senses[i];
    var breaker = false;
    for (var j = 0; j != world.bots.length; j++) {
      if (world.bots[j].type == HERBIVORE || world.bots[j] == bot) continue;
      if (world.bots[j].tl != undefined && world.bots[j].tl != undefined) {
        if (LineIntersects(r.rp, r.rq, world.bots[j].tl, world.bots[j].br)) {
          r.hit = "c";
          on_senses = r.id + "c";
          breaker = true;
          break;
        }
      }
    }
    if (breaker) break;
  }
  
  return on_senses;
};

Behaviour.prototype.CarnSenseUpdate = function(bot, world, on_senses) {
  for (var i = 0; i != this.senses.length; i++) {
    var r = this.senses[i];
    var breaker = false;
    for (var j = 0; j != world.bots.length; j++) {
      if (world.bots[j].type == CARNIVORE || world.bots[j] == bot) continue;
      if (world.bots[j].tl != undefined && world.bots[j].tl != undefined) {
        if (LineIntersects(r.rp, r.rq, world.bots[j].tl, world.bots[j].br)) {
          r.hit = "h";
          on_senses = r.id + "h";
          breaker = true;
          break;
        }
      }
    }
    if (breaker) break;
  }
  
  return on_senses;
};

Behaviour.prototype.Update = function(bot, world) {
  for (var i = 0; i != this.senses.length; i++) {
    var r = this.senses[i];  
    this.senses[i].hit = "";
    r.rp.x = r.p.x + bot.pos.x; 
    r.rp.y = r.p.y + bot.pos.y;
    r.rq.x = r.q.x + bot.pos.x; 
    r.rq.y = r.q.y + bot.pos.y;
    r.rp = RotatePointRad(r.rp, bot.pos, bot.rot);
    r.rq = RotatePointRad(r.rq, bot.pos, bot.rot); 
  }
  
  var on_senses = "";
  switch (this.type) {
    case HERBIVORE: 
      on_senses = this.HerbSenseUpdate(bot, world, on_senses); break;
    case CARNIVORE: 
      on_senses = this.CarnSenseUpdate(bot, world, on_senses); break;
  }
  
  this.r_ptr = this.senses_to_routines.get(on_senses);
  
  if (this.r_ptr != this.last_r_ptr) {
    this.repeat_cnt = 0;
    this.f_ptr = 0;
  }
  
  this.last_r_ptr = this.r_ptr;
  
  var old_vel = new Victor(bot.vel.x, bot.vel.y);
  switch (this.routines[this.r_ptr][this.f_ptr].func) {
    case ACC: 
      bot.vel = this.Accelerate(bot.vel); 
      bot.energy -= MOVE_COST; 
      break;
    case DEC: 
      bot.vel = this.Decelerate(bot.vel); 
      break;
    case TL: 
      bot.vel = this.TurnLeft(bot.vel); 
      break;
    case TR: 
      bot.vel = this.TurnRight(bot.vel);  
      break;
    case SH:
      world.AddBullet(bot.pos, bot.vel, this);
      bot.energy -= BULLET_COST;
      break;
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

Behaviour.prototype.Accelerate = function(vec) {
  var mag = vec.length();
  var xs = vec.x / mag;
  var ys = vec.y / mag;
  var alls = Math.abs(xs) + Math.abs(ys);
  xs = (xs / alls) * .1;
  ys = (ys / alls) * .1;
  
  vec.x += xs;
  vec.y += ys;
  
  return vec;
};

Behaviour.prototype.Decelerate = function(vec) {
  vec.x /= 3;
  vec.y /= 3;
  
  return vec;
};

Behaviour.prototype.TurnLeft = function(vec) {
  vec.rotate(-.05);
  return vec;
};

Behaviour.prototype.TurnRight = function(vec) {
  vec.rotate(.05);
  return vec;
};

Behaviour.prototype.Shoot = function(vec) {
  
};

function World(w, h, m) {
  this.width = w;
  this.height = h;
  this.margin = m;
  
  this.bots = [];
  for (var i = 0; i != HERB_COUNT; i++) {
    this.bots.push(new Bot(this, HERBIVORE));
  }
  
  for (var i = 0; i != CARN_COUNT; i++) {
    this.bots.push(new Bot(this, CARNIVORE));
  }

  this.food = [];
  for (var i = 0; i != FOOD_COUNT; i++) {
    this.NewFood();
  }

  this.animations = [];
  this.particles = [];
  this.spikes = [];
  
  this.focus_beh = [];
  this.bot_focus = -1;
  
  this.mouse_is_down = false;
  this.mouse_start = new Victor(0, 0);
  this.drag_line = {p: this.mouse_start, q: new Victor(0, 0)};
}

World.prototype.InitFromString = function(str) {
  for (var i = 0; i != HERB_COUNT; i++) {
    this.bots[i].InitFromString(str);
  }
};

World.prototype.NewFood = function() {
  var i = this.food.length;
  this.food.push({
    pos: undefined, tl: undefined, br: undefined,
    center: undefined, energy: 50
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

World.prototype.NewFoodCentred = function(x, y) {
  var newx, newy;
  //do {
    newx = x + Random2(20) - 10;
    newy = y + Random2(20) - 10;
  //} while (!(newx > this.margin && newx < this.width - this.margin &&
  //           newy > this.margin && newy < this.height - this.margin));
  var i = this.food.length;
  this.food.push({
    pos: undefined, tl: undefined, br: undefined, center: undefined,
  });
  this.food[i].pos = new Victor(newx, newy);
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
  
  for (var i = 0; i != this.particles.length; i++) {
    for (var j = 0; j != this.bots.length; j++) {
      if (this.bots[j].beh == this.particles[i].owner) continue;
      if (this.particles[i].pos.distance(this.bots[j].pos) < 7) {
        
        this.food.splice(0, 5);
        
        for (var k = 0; k != 5; k++) {
          this.NewFoodCentred(this.bots[j].pos.x, this.bots[j].pos.y);
        }
        
        this.bots.splice(j, 1);
        this.particles.splice(i, 1);
        i--;
        break;
      }
    }
  }
  
  for (var i = 0; i != this.particles.length; i++) {
    if (this.particles[i].Update(dt, this)) {
      this.particles.splice(i, 1);
      i--;
    }
  }
  
  if (this.food.length < FOOD_COUNT) {
    while (this.food.length < FOOD_COUNT) {
      this.NewFood();
    }
  } else if (this.food.length > FOOD_COUNT) {
    this.food.splice(0, this.food.length - FOOD_COUNT);
  }
};

World.prototype.Draw = function(ctx) {
  for (var i = 0; i != this.animations.length; i++) {
    ctx = this.animations[i].Draw(ctx);
  }
  
  for (var i = 0; i != this.particles.length; i++) {
    ctx = this.particles[i].Draw(ctx);
  }
  
  for (var i = 0; i != this.spikes.length; i++) {
    ctx = DrawLineVic(ctx, this.spikes[i].p, this.spikes[i].q, "#2222DD", 3);
  }
  
  ctx = DrawLineVic(ctx, this.drag_line.p, this.drag_line.q, "#2222FF", 3);
  
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
  
  return ctx;
};

World.prototype.VegEating = function(x, y) {
  var new_pos = new Victor(x + 4, y + 4);
  new_pos.x += Random2(8) - 4;
  new_pos.y += Random2(8) - 4;
  this.animations.push(new Animated(new_pos, foodeat, 4, 2, 4, false));
};

World.prototype.VegEaten = function(x, y) {
  var new_pos = new Victor(x + 4, y + 4);
  this.animations.push(new Animated(new_pos, fooddie, 8, 2, 16, false));
};

World.prototype.HerbEating = function(x, y) {
  var new_pos = new Victor(x + 4, y + 4);
  new_pos.x += Random2(8) - 4;
  new_pos.y += Random2(8) - 4;
  this.animations.push(new Animated(new_pos, herbeat, 4, 2, 4, false));
};

World.prototype.HerbEaten = function(x, y) {
  var new_pos = new Victor(x + 4, y + 4);
  this.animations.push(new Animated(new_pos, herbdie, 8, 2, 16, false));
};

World.prototype.AddBullet = function(pos, vel, owner) {
  var new_pos = new Victor(pos.x, pos.y);
  var new_vel = new Victor(0, 0);
  new_vel.x = vel.x; new_vel.y = vel.y;
  new_vel.normalize(); 
  new_vel.x *= 3; new_vel.y *= 3;
  this.particles.push(new Particle(new_pos, new_vel, bullet, 2, 30, owner));
};

World.prototype.NextGen = function() {
  var carn_energy = 0;
  var herb_energy = 0;
  for (var i = 0; i != this.bots.length; i++) {
    if (this.bots[i].type == HERBIVORE) {
      herb_energy += this.bots[i].energy;
    } else {
      carn_energy += this.bots[i].energy;
    }
  }
  carn_energy /= this.bots.length/2;
  herb_energy /= this.bots.length/2;
  
  var new_bots = [];
  for (var j = 0; j != HERB_COUNT/10 && j != this.bots.length; j++) {
    var search_for = j % 2 == 0 ? HERBIVORE : CARNIVORE;
    var best_score = Number.MIN_VALUE, best_idx = 0;
    for (var i = 0; i != this.bots.length; i++) {
      if (this.bots[i].type == search_for && this.bots[i].energy > best_score) {
        best_score = this.bots[i].energy;
        best_idx = i;
      }
    }
    var best = this.bots[best_idx];
    for (var i = 0; i != 10; i++) {
      var bot = new Bot(this, this.bots[best_idx].type);
      bot.Init(best.beh);
      new_bots.push(bot);
    }
    this.bots.splice(best_idx, 1);
  }
  while (new_bots.length > HERB_COUNT) {
    new_bots.splice(0, 1);
  }
  this.bots = new_bots;

  this.food = [];
  for (var i = 0; i != FOOD_COUNT; i++) {
    this.NewFood();
  }

  this.animations = [];
  
  return {c: carn_energy, h: herb_energy};
};

World.prototype.MouseMove = function(mouse_pos) {
  for (var i = 0; i != this.bots.length; i++) {
    if (this.bots[i].MouseHit(mouse_pos)) {
      this.bot_focus = i;
      this.focus_beh = this.BehToString(i);
      document.getElementById("SEL_BEH_BOX").value = "";
      if (this.bot_focus != -1) {
        for (var j = 0; j != this.focus_beh.length; j++) {
          document.getElementById("SEL_BEH_BOX").value += this.focus_beh[j] + 
            "\n";
        }
      }
    }
  }
  
  if (this.mouse_is_down) {
    this.drag_line.q = new Victor(mouse_pos.x, mouse_pos.y);
  }
};

World.prototype.MouseDown = function(mouse_pos) {
  this.mouse_is_down = true;
  this.mouse_start = new Victor(mouse_pos.x, mouse_pos.y);
  this.drag_line.p = this.mouse_start;
  this.drag_line.q = this.mouse_start;
};

World.prototype.MouseUp = function(mouse_pos) {
  this.mouse_is_down = false;
  this.spikes.push({
    p: this.mouse_start.clone(), 
    q: new Victor(mouse_pos.x, mouse_pos.y)
  });
  this.drag_line.p = new Victor(-100, -100);
  this.drag_line.q = new Victor(-100, -100);
};

World.prototype.AverageBehToString = function() {
  var s = [];
  
  var sense_str = "";
  for (var i = 0; i != this.bots[0].beh.senses.length; i++) {
    var ts = {px: 0, py: 0, qx: 0, qy: 0, acc: 0};
    for (var j = 0; j != this.bots.length; j++) {
      var b = this.bots[j];
      ts.px += b.beh.senses[i].p.x;
      ts.py += b.beh.senses[i].p.y;
      ts.qx += b.beh.senses[i].q.x;
      ts.qy += b.beh.senses[i].q.y;
      ts.acc += b.beh.senses[i].accuracy;
    }
    sense_str += this.bots[0].beh.senses[i].id + " " + ts.px/this.bots.length +
                 " " + ts.py/this.bots.length + " " + ts.qx/this.bots.length +
                 " " + ts.qy/this.bots.length + " " + ts.acc/this.bots.length +
                 ";";
  }
  s.push(sense_str.slice(0, sense_str.length-1));
  
  for (var i = 0; i != this.bots[0].beh.senses_to_routines_arr.length; i++) {
    var avg_routine = this.bots[0].beh.senses_to_routines_arr[i] + " ";
    for (var j = 0; j != ROUTINE_LENGTH; j++) {
      var total_repeats = 0;
      var cmd_count = [0, 0, 0, 0, 0];
      for (var k = 0; k != this.bots.length; k++) {
        switch (this.bots[k].beh.routines[i][j].func) {
          case ACC: cmd_count[0]++; break;
          case DEC: cmd_count[1]++; break;
          case TL: cmd_count[2]++; break;
          case TR: cmd_count[3]++; break;
          case SH: cmd_count[4]++; break;
        }
        total_repeats += this.bots[k].beh.routines[i][j].repeats;
      }
      avg_routine += cmds[cmd_count.indexOf(Math.max.apply(Math, cmd_count))] +
                     "" + (total_repeats/this.bots.length).toFixed(0) + " ";
    }
    s.push(avg_routine);
  }
  return s;
};

World.prototype.BehToString = function(k) {
  var s = [];
  
  var b = this.bots[k].beh;
  
  s.push(b.type);
  
  var sense_str = "";
  for (var i = 0; i != b.senses.length; i++) {
    sense_str += b.senses[i].id + " " + b.senses[i].p.x + " " +
                 b.senses[i].p.y + " " + b.senses[i].q.x + " " +
                 b.senses[i].q.y + " " + b.senses[i].accuracy + ";";
  }
  s.push(sense_str.slice(0, sense_str.length-1));
  
  for (var i = 0; i != b.senses_to_routines_arr.length; i++) {
    var avg_routine = b.senses_to_routines_arr[i] + " ";
    for (var j = 0; j != ROUTINE_LENGTH; j++) {
      avg_routine += b.routines[i][j].func + 
                     b.routines[i][j].repeats + " ";
    }
    s.push(avg_routine);
  }
  return s;
};

function Animated(pos, img, frame_count, fr, size, loop) {
  this.pos = pos;
  this.pos.x -= size/2; this.pos.y -= size/2;
  this.frame = 0;
  this.img = img;
  this.frame_count = frame_count;
  this.size = size;
  this.frame_repeat = fr;
  this.frame_repeat_cnt = 0;
  this.loop = loop;
}

Animated.prototype.Update = function(dt) {
  this.frame_repeat_cnt++;
  if (this.frame_repeat_cnt >= this.frame_repeat) {
    this.frame++;
    this.frame_repeat_cnt = 0;
  }
  
  if (this.loop) {
    if (this.frame >= this.frame_count) {
      this.frame = 0;
      this.frame_repeat_cnt = 0;
    }
    return false;
  }
  
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

function Particle(pos, vel, img, rad, life, owner) {
  this.pos = pos;
  this.vel = vel;
  this.img = img;
  this.rad = rad;
  this.life = life;
  this.rot = this.vel.angle();
  this.owner = owner;
}

Particle.prototype.Update = function(dt, world) {
  this.life--;
  this.pos.add(this.vel);
  return this.life <= 0;
};

Particle.prototype.Draw = function(ctx) {
  ctx.save();
  ctx.translate(this.pos.x, this.pos.y);
  ctx.rotate(this.rot);
  ctx.drawImage(this.img, 0, 0);
  ctx.restore();
  return ctx;
};

