const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

//begin obligatory variable dump
canvas.width = 1024;
canvas.height = 576;
const offset = {x:  -2304, y: -1200};
const collisionsMap = []; //collision map from collisions.js
const boundaries = [];  //array of boundaries based on collisionsMap
const worldMapImage = new Image(); worldMapImage.src = './Assets/Images/WorldMap.png';
const playerImageDown = new Image(); playerImageDown.src = './Assets/Images/playerDown.png';
const playerImageUp = new Image(); playerImageUp.src = './Assets/Images/playerUp.png';
const playerImageRight = new Image(); playerImageRight.src = './Assets/Images/playerRight.png';
const playerImageLeft = new Image(); playerImageLeft.src = './Assets/Images/playerLeft.png';
const foregroundImage = new Image(); foregroundImage.src = './Assets/Images/foregroundObjects.png';

//player sprite
const player = new Sprite({
    position: {
        x: canvas.width/2 - (192/4)/2,
        y: canvas.height/2 - 68/2
    },
    image: playerImageDown,
    frames: {
        max: 4
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
const moveables = [background, ...boundaries, foreground];
function rectangularCollision(rect1, rect2) {
    return (
        (rect1.position.x + rect1.width >= rect2.position.x && rect1.position.x <= rect2.position.x + rect2.width) &&
        (rect1.position.y + rect1.height >= rect2.position.y && rect1.position.y <= rect2.position.y + rect2.height)
    );
}

//animation function
function animate() {
    window.requestAnimationFrame(animate);
    background.draw();
    boundaries.forEach((boundary) => boundary.draw());
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
    player.moving = false;
    if (keys.w.pressed && lastKey === 'w') {
        player.moving = true;
        player.image = player.sprites.up;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision(player, {...boundary, position: {x: boundary.position.x, y: boundary.position.y + 2}})){
                console.log('collision');
                moving = false;
                break;
            }
        }
        if(moving) moveables.forEach(moveable => moveable.position.y += 2);
    }
    else if (keys.a.pressed && lastKey === 'a') {
        player.moving = true;
        player.image = player.sprites.left;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision(player, {...boundary, position: {x: boundary.position.x + 2, y: boundary.position.y}})){
                console.log('collision');
                moving = false;
                break;
            }
        }
        if(moving) moveables.forEach(moveable => moveable.position.x += 2);
    }
    else if (keys.s.pressed && lastKey === 's') {
        player.moving = true;
        player.image = player.sprites.down;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision(player, {...boundary, position: {x: boundary.position.x, y: boundary.position.y - 2}})){
                console.log('collision');
                moving = false;
                break;
            }
        }
        if(moving) moveables.forEach(moveable => moveable.position.y -= 2);
    }
    else if (keys.d.pressed && lastKey === 'd') {
        player.moving = true;
        player.image = player.sprites.right;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision(player, {...boundary, position: {x: boundary.position.x - 2, y: boundary.position.y}})){
                console.log('collision');
                moving = false;
                break;
            }
        }
        if(moving) moveables.forEach(moveable => moveable.position.x -= 2);
    }

}

//begin main animation
animate();

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