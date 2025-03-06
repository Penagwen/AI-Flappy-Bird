const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 501;
canvas.height = window.innerHeight;

const networkCanvas = document.getElementById("ai");
const networkCtx = networkCanvas.getContext("2d");   

const gravity = 0.75;
const getRandomPipeY = () => Math.floor(Math.random() * 300) - 150; // -150 to 150

const pipeSpawnDelay = 500;
let lastPipeSpawn = 0;
let lastPipeSpawnX = 500;

const N = 500;
let birds = [];

//birds.push(new Bird({ x: 400, y: canvas.height/2, width: 34, height: 24, controlType: "AI" }));
let bestBird = birds[0];

const background = {
    sprite: new Image(),
    loaded: false,

    load: function(){
        background.sprite.onload = () => { background.loaded = true; }
        background.sprite.src = "assests/background.png";
    },

    draw: function(ctx){
        if(!this.loaded){ return; }

        ctx.save();
        
        ctx.fillStyle = "#71C5CF";
        ctx.fillRect(-canvas.width, 0, 1000000, canvas.height/2);

        ctx.imageSmoothingEnabled = false;
        const pattern = ctx.createPattern(this.sprite, "repeat-x");
        ctx.fillStyle = pattern;
        ctx.rect(-canvas.width, 0, 1000000, canvas.height);
        ctx.translate(0, canvas.height/2-457/2);
        ctx.fill();


        ctx.restore();
    },
}
background.load();
const floor = new Hitbox({ x:-canvas.width, y: canvas.height-115, width: 1000000, height: canvas.height });

let pipes = [];

function save(bird){
    localStorage.setItem("bestBrain", JSON.stringify(bird.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");

    pipes = [];
    lastPipeSpawnX = 500;

    birds = generateBirds();
    bestBird = birds[0];

    save(bestBird);
}

function generateBirds(){
    let birds = []
    for(let i = 1; i <= N; i++){
        birds.push(new Bird({ x: 400, y: canvas.height/2, width: 34, height: 24, controlType: "AI" }));
    }
    return birds;
}

function reset(bestBirdz, saved){
    pipes = [];
    lastPipeSpawnX = 500;

    birds = generateBirds();
    bestBird = birds[0];

    for(let i = 0; i < birds.length; i++){
        birds[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if(i != 0){
            NeuralNetwork.mutate(birds[i].brain, 0.02);
        }
    }
    if(saved){
        save(bestBirdz);
    }
}
reset(JSON.parse(localStorage.getItem("bestBrain")), false);

function Update(time){
    birds.forEach((flappy, index) => {
        flappy.update();

        if(flappy.dead){ birds.splice(index, 1); }
    });
    if(0 >= birds.length){
        reset(bestBird, true);  
        requestAnimationFrame(Update);
        return;
    }


    canvas.height = window.innerHeight;

    networkCanvas.width = 500
    networkCanvas.height = window.innerHeight;

    bestBird = birds.find(
        b => b.x == Math.max(...birds.map(b => b.x))
    );

    ctx.save();
    ctx.translate(-bestBird.x + canvas.width * 0.25, 0);

    background.draw(ctx);
    
    pipes.forEach((pipe, index) => {
        pipe.draw(ctx);
        //pipe.hitbox1.render(ctx);
        //pipe.hitbox2.render(ctx);

        if(pipe.x - bestBird.x < -canvas.width/2){ pipes.splice(index, 1); }
    });

    ctx.globalAlpha = 0.4;
    birds.forEach(flappy => {
        flappy.draw(ctx, false);
    });
    ctx.globalAlpha = 1;
    bestBird.draw(ctx, true);

    if(pipes.length == 0 || bestBird.x - pipes[pipes.length - 1].x == -200){
        pipes.push( new Pipe({ x: lastPipeSpawnX + 250, y: getRandomPipeY() }) );
        lastPipeSpawnX += 250;
        lastPipeSpawn = Date.now();
    }

    // hide bottom of the pipe
    ctx.fillStyle = "#E0D796";
    ctx.fillRect(-canvas.width, canvas.height-105, 1000000, canvas.height);

    ctx.restore();
    
    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestBird.brain);

    requestAnimationFrame(Update);
}

Update();