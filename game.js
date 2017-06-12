class Animation {
  constructor(imageList, defaultImage) {
    this.images = imageList;
    this.defaultImage = defaultImage || 0;
    this.currentImage = 0;
    this.direction = 1;
    this.limit = this.images.length-1;
    this.delay = 0;
  }
  
  advance() {
    this.delay++;
    
    if (this.delay >= 5) {
      this.delay = 0;
      this.currentImage += this.direction;
      
      const i = this.currentImage;
      
      if (i > this.limit) this.currentImage = this.limit;
      if (i < 0) this.currentImage = 0;

      if (i >= this.limit || i <= 0) this.direction *= -1;
    }
  }
  
  reset() {
    this.currentImage = this.defaultImage;
  }
  
  get image() {
    return this.images[this.currentImage];
  }
}

class Player {
  constructor(x, y) {
    this.x = x || 0;
    this.y = 100;
    this.z = 0;
    
    this.w = 100;
    this.h = 130;
    
    this.direction = 1;
    
    this.originalW = this.w;
    this.originalH = this.h;
    
    this.jumping = true;
    this.vY = 0;
    
    this.speed = 200;
    
    this.floor = 510;
    
    this.currentFloor = 0;
    
    const l = [
      images.blacklivesmatter['0'],
      images.blacklivesmatter['1'],
      images.blacklivesmatter['2'],
      images.blacklivesmatter['3'],
    ];
    
    this.animation = new Animation(l);
    
    this.grablingPoint = {
      x: 0,
      y: 0,
    };
    
    this.hasGrablingPoint = false;
  }
  
  goLeft() {
    if (this.hasGrablingPoint) return 0;
    this.direction = -1;
    const increment = this.speed * modifier;
    this.x -= increment;
    return increment;
  }
  
  goRight() {
    if (this.hasGrablingPoint) return 0;
    this.direction = 1;
    const increment = this.speed * modifier;
    this.x += increment;
    return increment;
  }
  
  goAway() {
    this.z += this.speed * modifier;
    if (this.z > 120) this.z = 120;
  }
  
  goClose() {
    this.z -= this.speed * modifier;
    if (this.z < 0) this.z = 0;
  }
  
  jump() {
    if (!this.jumping) {
      this.jumping = true;
      this.vY = -400;
    }
  }
  
  fall() {
    this.jumping = true;
    this.vY = 0;
  }
  
  setGrablingPoint(x, y) {
    this.grablingPoint.x = x;
    this.grablingPoint.y = y;
    this.hasGrablingPoint = true;
    this.jumping = false;
  }
  
  update(worldX, boxes) {
    if (this.jumping) {
      this.vY += 800 * modifier;
      this.y += 400 * Math.pow(modifier, 2) + this.vY * modifier;
      
      this.animation.currentImage = 3;
    }
    
    let floorY = this.floor - this.h;
    if (!this.hasGrablingPoint) {
      if (this.y + this.h > this.floor) {
        this.y = this.floor - this.h + 1;
        this.jumping = false;
        floorY = this.y;
      }

      boxes.forEach(box => {
        if (box.tryStand(this)) {
          this.jumping = false;
          this.y = box.y - this.h + 1;
          floorY = this.y;
        }
      });
    }
    
    if (Math.abs(floorY - this.y) > 10 && !this.jumping && !this.hasGrablingPoint) {
      this.fall();
    }
    
    if (this.hasGrablingPoint) {
      const dx = this.grablingPoint.x - (this.x+this.w/2);
      const dy = this.grablingPoint.y - (this.y);
      const len = Math.sqrt(dx*dx + dy*dy);

      const grabSpeed = 400;
      const incrementX = grabSpeed*modifier * (dx / len);
      const incrementY = grabSpeed*modifier * (dy / len);
      
      if (len > 10 && this.y + this.h + incrementY < this.floor) {
        this.x += incrementX;
        this.y += incrementY;
        return (incrementX);
      } else {
        this.hasGrablingPoint = false;
        this.jumping = true;
        this.vY = 0;
        return (worldX + this.x + this.w/2) - 400;
      }
    }
  }
  
  get offset() {
    const z = this.z;
    //return -(9/4000)*Math.pow(z,2) + (9/10) * z;
    return -(7/4000)*Math.pow(z,2) + (7/10) * z;
  }
  
  get dimensions() {
    const w = this.originalW;
    const h = this.originalH;
    const offset = this.offset;
    const scl = (1-offset/90 * 0.2);
    return {w: w*scl, h: h*scl};
  }
  
  draw(world) {
    const {x, y, z, w, h, offset, dimensions} = this;
    const {w: newW, h: newH} = dimensions;
    const centerX = x + w/2 + world.x;
    const centerY = y - offset + h/2;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(this.direction, 1);
    ctx.drawImage(this.animation.image, -newW/2, -newH/2, newW, newH);
    ctx.restore();
    
    if (this.hasGrablingPoint) {
      ctx.beginPath();
      ctx.moveTo(world.x + this.grablingPoint.x, this.grablingPoint.y);
      ctx.lineTo(world.x + this.x + this.w/2, this.y);
      ctx.stroke();
    }
  }
}

class World {
  constructor() {
    this.x = 0;
    this.targetX = 0;
    this.hasTarget = false;
  }
  
  setTarget(x) {
    console.log(x);
    this.targetX = x;
    this.hasTarget = true;
  }
  
  goRight(increment) {
    if (this.hasTarget) this.x = this.targetX;
    this.x -= increment;
  }
  
  goLeft(increment) {
    if (this.hasTarget) this.x = this.targetX;
    this.x += increment;
  }
  
  static drawMultiple(img, x) {
    ctx.drawImage(img, x-cW, 0, cW, cH);
    ctx.drawImage(img, x, 0, cW, cH);
    ctx.drawImage(img, x+cW, 0, cW, cH);
  }
  
  update() {
    if (this.hasTarget) {
      const x = this.targetX - this.x;
      if (Math.abs(x) > 10) {
        this.x += x / 10;
      } else {
        this.hasTarget = false;
        this.x = this.targetX;
      }
    }
  }
  
  drawFloor() {
    const x = this.x % cW;
    World.drawMultiple(images.forrest['0'], x);
  }
  
  drawBehind() {
    World.drawMultiple(images.forrest.back5, this.x/10 % cW);
    World.drawMultiple(images.forrest.back4, this.x/8 % cW);
    //World.drawMultiple(images.forrest.back3, this.x/6 % cW);
    //World.drawMultiple(images.forrest.back2, this.x/4 % cW);
    World.drawMultiple(images.forrest.back1, this.x/2 % cW);
  }
  
  drawFront() {
    World.drawMultiple(images.forrest.front1, this.x*2 % cW);
    World.drawMultiple(images.forrest.front2, this.x*4 % cW);
    World.drawMultiple(images.forrest.front3, this.x*6 % cW);
  }
}

class GrabPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    this.r = 20;
  }
  
  tryGrab(x, y) {
    if (
      Math.abs(x - this.x) < this.r
      && Math.abs(y - this.y) < this.r
    ) {
      return true;
    }
    return false;
  }
  
  draw(worldX) {
    ctx.beginPath();
    ctx.arc(worldX + this.x, this.y, this.r, 0, 2*Math.PI, false);
    ctx.fillStyle = 'black';
    ctx.fill();
  }
}

class Box {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = 'black';
  }
  
  tryStand(obj) {
    if (
      this.x <= obj.x + obj.w
      && obj.x <= this.x + this.w
      && this.y <= obj.y + obj.h
      && obj.y + obj.h - this.h/2 <= this.y + this.h/2
    ) {
      return true;
    }
    return false;
  }
  
  draw(worldX) {
    ctx.fillStyle = this.color;
    ctx.fillRect(worldX + this.x, this.y, this.w, this.h);
  }
}

class Trap extends Box {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.color = 'red';
  }
  
  tryTrap(obj) {
    return this.tryStand(obj);
  }
}

function game() {
  
  var player, world, points, traps;
  
  function setup() {
    player = new Player(350, 400);
    world = new World();
    points = [];

    function addPoint(x, y) {
      const p = new GrabPoint(x, y);

      points.push(p);
    }

    addPoint(600, 100);
    addPoint(-430, 150);
    addPoint(1100, 100);
    addPoint(1430, 100);

    boxes = [];
    function addBox(x, y, w, h) {
      const p = new Box(x, y, w, h);

      boxes.push(p);
    }

    addBox(600, 300, 200, 50);
    addBox(-200, 450, 300, 50);
    addBox(-600, 300, 200, 50);
    addBox(-800, 225, 150, 30);
    addBox(1400, 300, 200, 50);

    traps = [];
    function addTrap(x, y, w, h) {
      const t = new Trap(x, y, w, h);

      traps.push(t);
    }

    addTrap(800, 450, 600, 50);
  }
  setup();
  
  const LEFT = 65;
  const RIGHT = 68;
  const UP = 87;
  const DOWN = 83;
  
  function loop(keys) {
    if (LEFT in keys) {
      const increment = player.goLeft();
      world.goLeft(increment);
    }
    
    if (RIGHT in keys) {
      const increment = player.goRight();
      world.goRight(increment);
    }
    
    if (UP in keys) {
      //player.goAway();
    }
    
    if (DOWN in keys) {
      //player.goClose();
    }
    
    if (
      LEFT in keys
      || RIGHT in keys
      || UP in keys
      || DOWN in keys
    ) {
      player.animation.advance();
    } else {
      player.animation.reset();
    }
    
    if (32 in keys) {
      player.jump();
    }
    
    world.update();
    const moveWorld = player.update(world.x, boxes);
    if (moveWorld) {
      world.setTarget(world.x - moveWorld);
    }
    
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, cW, cH);
    
    world.drawBehind();
    
    world.drawFloor();
    
    boxes.forEach(box => {
      box.draw(world.x);
    });
    
    traps.forEach(box => {
      box.draw(world.x);
      if (box.tryTrap(player)) {
        setup();
      }
    });
    
    points.forEach(point => {
      point.draw(world.x);
    });
    
    player.draw(world);
  }
  
  window.player = player;
  window.world = world;
  window.boxes = boxes;
  
  function mouseDown(x, y) {
    if (!player.hasGrablingPoint) {
      const realX = -world.x + x;
      points.forEach(point => {
        if (point.tryGrab(realX, y)) {
          player.setGrablingPoint(point.x, point.y);
          if (realX < player.x + player.w/2) player.direction = -1;
          else player.direction = 1;
        }
      });
    }
  }
  
  function mouseMove(x, y) {
    
  }
  
  return {
    loop,
    mouseDown,
    mouseMove,
  };
}