class Sensor{
    constructor(bird){
        this.bird=bird;
        this.rayCount= 24;
        this.rayLength=500;
        this.raySpread=Math.PI;
        this.rays=[];
        this.readings=[];
    }
    update(floor, pipes){
        this.#castRays();
        this.readings=[];
        for(let i=0;i<this.rays.length;i++){
            this.readings.push(
                this.#getReading(this.rays[i],floor, pipes)
            );
        }
    }
    #getReading(ray,floor, pipes){
        let touches=[];
        const touch=getIntersection(
            ray[0],
            ray[1],
            floor[0],
            floor[1]
        );
        if(touch){
            touches.push(touch);
        }
        
        for(let i = 0; i < pipes.length; i++){
            const pipeHitbox = pipes[i].raycast;
            for(let j = 0; j < 4; j++){
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    pipeHitbox[j][0],
                    pipeHitbox[j][1]
                )
                if(value){
                    touches.push(value);
                }
            }
        }    


        if(touches.length==0){
            return null;
        }else{
            const offsets=touches.map(e=>e.offset);
            const minOffset=Math.min(...offsets);
            return touches.find(e=>e.offset==minOffset);
        }
    }
    #castRays(){
        this.rays=[];
        for(let i=0;i<this.rayCount;i++){
            const rayAngle=lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount==1?0.5:i/(this.rayCount-1)
            )-Math.PI/2;
            const start={x:this.bird.x + this.bird.width*0.6, y:this.bird.y + this.bird.height/2};
            const end={
                x:this.bird.x-
                    Math.sin(rayAngle)*this.rayLength,
                y:this.bird.y-
                    Math.cos(rayAngle)*this.rayLength
            };
            this.rays.push([start,end]);
        }
    }
    draw(ctx){
        for(let i=0;i<this.rayCount;i++){
            let end=this.rays[i][1];
            if(this.readings[i]){
                end=this.readings[i];
            }
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}