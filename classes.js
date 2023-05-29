//prevents player from walking into collisions
class Boundary {
    static width = 48;
    static height = 48;
    constructor({position}) {
        this.position = position;
        this.width = 48;
        this.height = 48;
    }
    draw() {
        context.fillStyle = 'rgba(255, 0, 0, 0.0)';
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

//sprite class
class Sprite {
    constructor({position, image, frames = {max: 1, hold: 30}, sprites, animate = false, isEnemy = false, rotation = 0}) {
        this.position = position;
        this.image = image;
        this.frames = {...frames, val: 0, elapsed: 0, max: frames.max};
        this.image.onload = () => {
            this.width = this.image.width/this.frames.max;
            this.height = this.image.height;
        }
        this.sprites = sprites;
        this.animate = animate;
        this.opacity = 1;
        this.health = 100;
        this.isEnemy = isEnemy;
        this.rotation = rotation;
    }
    draw() {
        context.save();
        context.translate(this.position.x + this.width/2, this.position.y + this.height/2);
        context.rotate(this.rotation * Math.PI/180);
        context.translate(-(this.position.x + this.width/2), -(this.position.y + this.height/2));
        context.globalAlpha = this.opacity;
        context.drawImage(
            this.image, //image
            this.frames.val * this.width,  //source x
            0,  //source y
            this.image.width/this.frames.max,   //source width
            this.image.height,  //source height
            this.position.x,    //destination x
            this.position.y,    //destination y
            this.image.width/this.frames.max,   //destination width
            this.image.height   //destination height
        );
        context.restore();

        if(!this.animate) return;
        if(this.frames.max > 1) {
            this.frames.elapsed++;
        }
        if(this.frames.elapsed % this.frames.hold === 0) {
            if(this.frames.val < this.frames.max - 1) this.frames.val++;
            else this.frames.val = 0;  
        }
    }
    attack({attack, recipient, renderedSprites}) {
        let rotation = 45;
        let healthBar = '#enemyHealthBar';
        let movementDistance = 20;
        if (this.isEnemy){
            movementDistance = -20;
            healthBar = '#playerHealthBar';
            rotation = -135;
        }
        switch (attack.name) {
            case 'Tackle':
                this.health -= attack.damage;
                
                
                const timeLine = gsap.timeline();
                timeLine.to(this.position, {x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2, 
                    duration: 0.1,
                    onComplete: () => { //enemy gets hit
                        gsap.to(healthBar, {width: this.health - attack.damage + '%'});
                        gsap.to(recipient.position, {x: recipient.position.x + 20, yoyo: true, repeat: 5, duration: 0.1});
                        gsap.to(recipient, {opacity: 0, repeat: 5, yoyo: true, duration: 0.1})
                    }
                }).to(this.position, {x: this.position.x - movementDistance});
                break;

            case 'Fireball':
                const fireballImage = new Image(); fireballImage.src = './Assets/images/fireball.png';
                const fireball = new Sprite({
                    position: {x: this.position.x, y: this.position.y},
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    rotation
                });

                renderedSprites.splice(1, 0, fireball);
                gsap.to(fireball.position, {x: recipient.position.x, y: recipient.position.y, duration: 1, onComplete: () => {
                    fireball.animate = false;
                    fireball.opacity = 0;
                    recipient.health -= attack.damage;
                    gsap.to(healthBar, {width: recipient.health + '%'});
                    gsap.to(recipient.position, {x: recipient.position.x + 20, yoyo: true, repeat: 5, duration: 0.1});
                    gsap.to(recipient, {opacity: 0, repeat: 5, yoyo: true, duration: 0.1})
                }});
                gsap.splice(1, 1);

                break;
        }
        
    }
}