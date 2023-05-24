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
        context.fillStyle = 'rgba(255, 0, 0, 0.5)';
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

//sprite class
class Sprite {
    constructor({position, image, frames = {max:1}}, sprites = []) {
        this.position = position;
        this.image = image;
        this.frames = {...frames, val: 0, elapsed: 0, max: frames.max};
        this.image.onload = () => {
            this.width = this.image.width/this.frames.max;
            this.height = this.image.height;
        }
        this.moving = false;
        this.sprites = sprites;
    }
    draw() {
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

        if(!this.moving) return;
        if(this.frames.max > 1) {
            this.frames.elapsed++;
        }
        if(this.frames.elapsed % 30 === 0) {
            if(this.frames.val < this.frames.max - 1) this.frames.val++;
            else this.frames.val = 0;  
        }
    }
}