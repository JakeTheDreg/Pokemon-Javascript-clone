const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

//begin obligatory variable dump
canvas.width = 1024;
canvas.height = 576;
const offset = {x:  -2304, y: -1200};
const collisionsMap = []; //collision map from collisions.js
const battleZonesMap = []; //battle zone map from battleZones.js
const boundaries = [];  //array of boundaries based on collisionsMap
const battleZones = []; //array of battleZones based on battleZonesMap
const worldMapImage = new Image(); worldMapImage.src = './Assets/Images/WorldMap.png';
const playerImageDown = new Image(); playerImageDown.src = './Assets/Images/playerDown.png';
const playerImageUp = new Image(); playerImageUp.src = './Assets/Images/playerUp.png';
const playerImageRight = new Image(); playerImageRight.src = './Assets/Images/playerRight.png';
const playerImageLeft = new Image(); playerImageLeft.src = './Assets/Images/playerLeft.png';
const foregroundImage = new Image(); foregroundImage.src = './Assets/Images/foregroundObjects.png';
const battleBackgroundImage = new Image(); battleBackgroundImage.src = './Assets/Images/battleBackground.png';
const draggleImage = new Image(); draggleImage.src = './Assets/Images/draggleSprite.png';
const embyImage = new Image(); embyImage.src = './Assets/Images/embySprite.png';

//player sprite
const player = new Sprite({
    position: {
        x: canvas.width/2 - (192/4)/2,
        y: canvas.height/2 - 68/2
    },
    image: playerImageDown,
    frames: {
        max: 4,
        hold: 30
    },
    sprites: {
        up: playerImageUp,
        down: playerImageDown,
        left: playerImageLeft,
        right: playerImageRight
    }
});

//cuts collisions into rows for easier access
for(let i = 0; i < collisions.length; i+= 70) {
    collisionsMap.push(collisions.slice(i, i + 70));
} 

//cuts battleZonesData into rows for easier access
for(let i = 0; i < battleZonesData.length; i+= 70) {
    battleZonesMap.push(battleZonesData.slice(i, i + 70));
} 

//creates boundaries based on collisionsMap
collisionsMap.forEach((row, i) => {
    row.forEach((Symbol, j) => {
        if(Symbol === 1025)
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            );
    });
});

//creates battleZones based on battleZonesMap
battleZonesMap.forEach((row, i) => {
    row.forEach((Symbol, j) => {
        if(Symbol === 1025)
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            );
    });
});

//background sprite
const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: worldMapImage
});
//foreground sprite
const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
});

//keyboard input
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

//helpers for animation function
const moveables = [background, ...boundaries, ...battleZones, foreground];
function rectangularCollision(rect1, rect2) {
    return (
        (rect1.position.x + rect1.width >= rect2.position.x && rect1.position.x <= rect2.position.x + rect2.width) &&
        (rect1.position.y + rect1.height >= rect2.position.y && rect1.position.y <= rect2.position.y + rect2.height)
    );
}
function battleZoneCollision(animationId) {//looks for engagement with battleZones
    // let moving = true;
    // player.animate = false;
    
    //if(battle.initiated) return;
    for (let i = 0; i < battleZones.length; i++) {
        const battleZone = battleZones[i];
        const overlappingWidth = Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x);
        const overlappingHeight = Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - Math.max(player.position.y, battleZone.position.y);
        const overlappingArea = overlappingWidth * overlappingHeight;
        if(rectangularCollision(player, battleZone) && (overlappingArea > (player.width * player.height) / 2) && Math.random() < 0.01){
            console.log('battle begin!');
            window.cancelAnimationFrame(animationId);
            gsap.to('#overlappingDiv', {opacity: 1, repeat: 3, yoyo: true, duration: 0.4, 
                onComplete(){
                    gsap.to('#overlappingDiv', {opacity: 1, duration: 0.4, onComplete(){
                        animateBattle();
                        gsap.to('#overlappingDiv', {opacity: 0, duration: 0.4})
                    }});        
                }
            });
            //battle.initiated = true;
            break;
        }
    }
}

//animation function
function animate() {
    const animationId = window.requestAnimationFrame(animate);
    background.draw();
    boundaries.forEach((boundary) => boundary.draw());
    battleZones.forEach((battleZone) => battleZone.draw());
    if(player.sprites.up == undefined){
        player.sprites = {
            up: playerImageUp,
            down: playerImageDown,
            left: playerImageLeft,
            right: playerImageRight
        }
    }
    player.draw();
    foreground.draw();

    let moving = true;
    player.animate = false;
    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true;
        player.image = player.sprites.up;
        //prevents collision with boundaries
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision(player, {...boundary, position: {x: boundary.position.x, y: boundary.position.y + 2}})){
                console.log('collision');
                moving = false;
                break;
            }
        }
        battleZoneCollision(animationId);
        if(moving) moveables.forEach(moveable => moveable.position.y += 2);
    }
    else if (keys.a.pressed && lastKey === 'a') {
        player.animate = true;
        player.image = player.sprites.left;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision(player, {...boundary, position: {x: boundary.position.x + 2, y: boundary.position.y}})){
                console.log('collision');
                moving = false;
                break;
            }
        }
        battleZoneCollision(animationId);
        if(moving) moveables.forEach(moveable => moveable.position.x += 2);
    }
    else if (keys.s.pressed && lastKey === 's') {
        player.animate = true;
        player.image = player.sprites.down;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision(player, {...boundary, position: {x: boundary.position.x, y: boundary.position.y - 2}})){
                console.log('collision');
                moving = false;
                break;
            }
        }
        battleZoneCollision(animationId);
        if(moving) moveables.forEach(moveable => moveable.position.y -= 2);
    }
    else if (keys.d.pressed && lastKey === 'd') {
        player.animate = true;
        player.image = player.sprites.right;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision(player, {...boundary, position: {x: boundary.position.x - 2, y: boundary.position.y}})){
                console.log('collision');
                moving = false;
                break;
            }
        }
        battleZoneCollision(animationId);
        if(moving) moveables.forEach(moveable => moveable.position.x -= 2);
    }

}

const battleBackground = new Sprite({position:{x: 0, y: 0},  image: battleBackgroundImage});

const draggle = new Sprite({position:{x: 800, y: 100}, image: draggleImage, frames: {max: 4, hold: 60}, animate: true, isEnemy: true});
const emby = new Sprite({position:{x:  280,y: 325}, image: embyImage , frames: {max: 4, hold: 60}, animate: true});

//battle animation function
const renderedSprites = [draggle, emby];
function animateBattle(){
    window.requestAnimationFrame(animateBattle);
    battleBackground.draw();

    renderedSprites.forEach((sprite) => {
        sprite.draw();
    });
}

//battle button event listeners
document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (event) => {
        const selectedAttack = attacks[event.currentTarget.innerHTML];
        emby.attack({attack: selectedAttack, recipient: draggle, renderedSprites: renderedSprites});
    });
});


//begin main animation
animateBattle();
//animate();

//keyboard event listeners
let lastKey = '';
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
    }
});
window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
});