class Bird {
    constructor({ x, y, width, height, controlType }){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.sprite = new Image();
        this.sprite.onload = () => {
            this.loaded = true;
        }
        
        this.sprite.src = "assests/flappy.png";
        this.loaded = false;

        this.onFloor = false;
        this.dead = false;
        this.hitboxOffSets = [0, 0];

        this.jumpDelay = 150;
        this.lastJumpTime = 0;

        this.useBrain = controlType == "AI";

        this.velocity = {x: 0, y: 0};

        this.controls = new Controls(controlType);
        this.hitbox  = new Hitbox({ x: this.x, y: this.y, width: this.width, height: this.height });
        this.sensor = new Sensor(this);
        this.brain = new NeuralNetwork([this.sensor.rayCount, 10, 6, 4, 1]);
    }

    draw(ctx, drawSensor){
        if(!this.loaded){ return; }

        if(drawSensor){ this.sensor.draw(ctx); }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.velocity.y >= 0) ? (15 * Math.PI / 180) : (-15 * Math.PI / 180));

        //if(this.dead){ ctx.filter = 'grayscale(1)'; }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.sprite, 0, 0, this.width, this.height);


        ctx.restore();
    }

    update(){
        this.movement();

        if(this.dead){ return; }


        if(this.sensor){
            this.sensor.update([{x: -canvas.width, y: canvas.height - 105}, {x: 1000000, y: canvas.height - 105}], pipes);            
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1-s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if(this.useBrain){
                this.controls.jump = outputs[0];
            }
        }
    }

    movement(){
        if(!this.dead){
            this.velocity.x += 2; 
        }

        if(this.controls.jump && Date.now() - this.lastJumpTime > this.jumpDelay && !this.dead && this.y - 18 > 0){
            this.velocity.y = -8; 
            this.lastJumpTime = Date.now();
        }

        // gravity
        if(!this.onFloor){
            this.velocity.y += gravity;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.hitbox.x = this.x + this.hitboxOffSets[0];
        this.hitbox.y = this.y + this.hitboxOffSets[1];

        // is on floor
        if(this.hitbox.collison(floor)){
            this.onFloor = true;
            this.y = floor.height - 116 - this.hitbox.height;
        }

        // reset velocity
        this.velocity.x = 0;
        if(this.onFloor){
            this.velocity.y = 0;
            this.dead = true;
        }

        pipes.forEach(pipe => {
            if(this.hitbox.collison(pipe.hitbox1) || this.hitbox.collison(pipe.hitbox2)){
                this.dead = true
            }
        });

    }
}

class Hitbox{
    constructor({ x, y, width, height }){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.hitbox = this;
    }

    render(ctx){
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    collison(hitbox){
        return (
            this.x < hitbox.x + hitbox.width &&
            this.x + this.width > hitbox.x &&
            this.y < hitbox.y + hitbox.height &&
            this.y + this.height > hitbox.y
        )
    }

    distance(hitbox){
        return Math.hypot(hitbox.x - this.x, hitbox.y - this.y);
    }

    update(){}
}

class Controls{
    constructor(controlType){
        this.jump = false;

        if(controlType == "KEYS"){
            this.#addKeyboardListeners();
        }
    }

    #addKeyboardListeners(){
        document.onkeydown = (e) => {
            switch(e.key.toLowerCase()){
                case " ": this.jump = true; break;
            }
        }

        document.onkeyup = (e) => {
            switch(e.key.toLowerCase()){
                case " ": this.jump = false; break;
            }
        }
    }
}