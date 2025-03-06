class Pipe {
    constructor({ x, y }){
        this.x = x;

        this.y = y;

        this.width = 69;
        
        let space = 40;
        this.height = canvas.height/2+space;

        this.sprite = new Image();
        this.sprite.onload = () => {
            this.loaded = true;
        }
        
        this.sprite.src = "assests/pipe.png";
        this.loaded = false;

        this.raycast = [
            [{x: this.x - this.width/2, y: 0}, { x: this.x - this.width/2, y: this.height/2+this.y}],
            [{x: this.x - this.width/2, y: this.height/2+this.y+space*4}, { x: this.x - this.width/2, y: canvas.height}],
            [{x: this.x - this.width/2, y: this.height/2+this.y}, { x: this.x + this.width/2, y: this.height/2+this.y}],
            [{x: this.x - this.width/2, y: this.height/2+this.y+space*4}, { x: this.x + this.width/2, y: this.height/2+this.y+130}],
        ];

        this.hitbox1 = new Hitbox({ x: this.x - this.width/2, y: 0, width: this.width, height: this.height/2+this.y });
        this.hitbox2 = new Hitbox({ x: this.x - this.width/2, y: this.height/2+this.y+space*4, width: this.width, height: canvas.height });
    }

    draw(ctx){

        if(!this.loaded){ return; }
        ctx.save();

        ctx.translate(0, this.y)

        ctx.translate(this.x, 0);
        ctx.rotate(-Math.PI);
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.sprite, -this.width/2, -this.height/2, this.width, this.height);

        ctx.rotate(Math.PI);
        ctx.translate(0, canvas.height - 115);
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.sprite, -this.width/2, -this.height/2, this.width, this.height);


        ctx.restore();

    }
}