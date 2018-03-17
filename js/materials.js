/**
 * Created by getterk on 2017/7/28.
 */

function ballBase(ctx, x, y, radius, color, vx, vy, score){
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.tx = x;
    this.ty = y;
    this.radius = radius;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.infect_src = null;
    this.stopped = false;
    this.delete_timer = 0;
    this.to_delete = false;
    this.chained = false;
    this.score = score;
    this.draw = function() {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.restore();
    };

    this.treeDraw = function() {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.tx, this.ty, this.radius, 0, Math.PI*2, true);
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.restore();
    };

    this.update = function() {
        if(!this.stopped) {
            if (!this.infect_src) {
                this.infect_src = CR.ball_infected.checkConflict(this);
                if (this.infect_src) {
                    CR.ball_infected.balls.push(this);
                    return;
                }
                this.rebound();
                this.x += this.vx;
                this.y += this.vy;
            }
            else {
                this.getInfected();
            }
        }
        else{
            if(this.delete_timer === CR.delete_interval){this.to_delete = true; return;}
            this.delete_timer++;
        }
    };

    this.rebound = function(){
        if(this.x + this.radius > CR.game_width - CR.border_width || this.x - this.radius < CR.border_width){
            this.vx = -this.vx;
        }
        if(this.y + this.radius > CR.height - CR.border_width || this.y - this.radius < CR.border_width) {
            this.vy = -this.vy;
        }
    };

    this.checkConflict = function(target){
        let distance = Math.pow((this.x - target.x), 2) + Math.pow((this.y - target.y), 2);
        if(distance > Math.pow((this.radius + target.radius),2))
            return false;
        return true;
    };

    this.remove = function(){
        CR.score += this.score;
        CR.ball_all.balls.splice(CR.ball_all.balls.indexOf(this), 1);
        CR.ball_infected.balls.splice(CR.ball_infected.balls.indexOf(this), 1);
        CR.ball_transformed.balls.push(this);
        this.radius = CR.ball_ori_radius;
        this.ctx = CR.ctx.function; //
    }
}

function laser(ctx, x1, y1, x2, y2, vx, vy, owner) {
    this.ctx = ctx;
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.vx1 = vx;
    this.vx2 = vx;
    this.vy1 = vy;
    this.vy2 = vy;
    this.bx1 = 0;
    this.bx2 = 0;
    this.by1 = 0;
    this.by2 = 0;
    this.owner = owner;
    this.disappear_timer = 0;
    this.disappear_interval = 40;
    this.to_delete = false;
    this.update = function(){
        if(this.disappear_timer<this.disappear_interval) {
            this.rebound();
            this.x1 += this.vx1;
            this.x2 += this.vx2;
            this.y1 += this.vy1;
            this.y2 += this.vy2;
            this.disappear_timer++;
        }
        else{
            this.to_delete = true;
        }
    };
    this.draw = function(){
        this.ctx.save();
        this.ctx.beginPath();
        if(this.bx1 && this.bx2){
            this.ctx.moveTo(this.x1, this.y1);
            this.ctx.lineTo(this.bx1,this.by1);
            this.ctx.moveTo(this.bx1, this.by1);
            this.ctx.lineTo(this.bx2, this.by2);
            this.ctx.moveTo(this.bx2, this.by2);
            this.ctx.lineTo(this.x2, this.y2);
        }
        else if(this.bx2){
            this.ctx.moveTo(this.x1, this.y1);
            this.ctx.lineTo(this.bx2, this.by2);
            this.ctx.moveTo(this.bx2, this.by2);
            this.ctx.lineTo(this.x2, this.y2);
        }
        else if(this.bx1){
            this.ctx.moveTo(this.x1, this.y1);
            this.ctx.lineTo(this.bx1, this.by1);
            this.ctx.moveTo(this.bx1, this.by1);
            this.ctx.lineTo(this.x2, this.y2);
        }
        else {
            this.ctx.moveTo(this.x1, this.y1);
            this.ctx.lineTo(this.x2, this.y2);
        }
        this.ctx.closePath();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = "yellow";
        this.ctx.stroke();
        this.ctx.restore();
    };
    this.rebound = function(){
        if(this.x1 > CR.game_width - CR.border_width || this.x1 < CR.border_width){
            if(this.x1 < CR.border_width){
                if(this.bx2 === 0) {
                    this.by2 = this.y1 - (CR.border_width - this.x1) / this.vx1 * this.vy1;
                    this.bx2 = CR.border_width;
                }
                else{
                    this.by1 = this.y1 - (CR.border_width - this.x1) / this.vx1 * this.vy1;
                    this.bx1 = CR.border_width;
                }
                this.x1 += 2 * (CR.border_width - this.x1);

            }
            else{
                if(this.bx2 === 0) {
                    this.by2 = this.y1 - (this.x1 - CR.game_width + CR.border_width) / this.vx1 * this.vy1;
                    this.bx2 = CR.game_width - CR.border_width;
                }
                else{
                    this.by1 = this.y1 - (this.x1 - CR.game_width + CR.border_width) / this.vx1 * this.vy1;
                    this.bx1 = CR.game_width - CR.border_width;
                }
                this.x1 -= 2 * (this.x1 - CR.game_width + CR.border_width);
            }

            this.vx1 = -this.vx1;
        }
        if(this.x2 > CR.game_width - CR.border_width || this.x2 < CR.border_width){
            if(this.bx2 === 0) {this.bx1 = this.by1 = 0;}
            else{this.bx2 = this.by2 = 0;}
            this.x2 += this.x2 < CR.border_width ? 2 * (CR.border_width - this.x2) : -2 * (this.x2 - CR.game_width + CR.border_width);
            this.vx2 = -this.vx2;
        }
        if(this.y1 > CR.height - CR.border_width || this.y1 < CR.border_width) {
            if(this.y1 < CR.border_width){
                if(this.bx2 === 0) {
                    this.bx2 = this.x1 - (CR.border_width - this.y1) / this.vy1 * this.vx1;
                    this.by2 = CR.border_width;
                }
                else{
                    this.bx1 = this.x1 - (CR.border_width - this.y1) / this.vy1 * this.vx1;
                    this.by1 = CR.border_width;
                }
                this.y1 += 2 * (CR.border_width - this.y1);

            }
            else{
                if(this.by2 === 0) {
                    this.bx2 = this.x1 - (this.y1 - CR.game_width + CR.border_width) / this.vy1 * this.vx1;
                    this.by2 = CR.game_width - CR.border_width;
                }
                else{
                    this.bx1 = this.x1 - (this.y1 - CR.game_width + CR.border_width) / this.vy1 * this.vx1;
                    this.by1 = CR.game_width - CR.border_width;
                }
                this.y1 -= 2 * (this.y1 - CR.game_width + CR.border_width);
            }

            this.vy1 = -this.vy1;
        }
        if(this.y2 > CR.height - CR.border_width || this.y2 < CR.border_width) {
            if(this.bx2 === 0) {this.bx1 = this.by1 = 0;}
            else{this.bx2 = this.by2 = 0;}
            this.y2 += this.y2 < CR.border_width ? 2 * (CR.border_width - this.y2) : -2 * (this.y2 - CR.height + CR.border_width);
            this.vy2 = -this.vy2;
        }
    };
    this.checkConflict = function(target){
        return pointToSeg(target.x, target.y, this.x1, this.y1, this.x2, this.y2) <= target.radius;
    };

    this.remove = function(){
        CR.ball_all.balls.splice(CR.ball_all.balls.indexOf(this), 1);
        CR.ball_infected.balls.splice(CR.ball_infected.balls.indexOf(this), 1);
    }
}

CR.createExplodeBall = function(ctx, x, y, radius, explode_radius,  color, vx, vy, score){
    let e = new ballBase(ctx, x, y, radius, color, vx, vy, score);
    e.explode_radius = explode_radius;
    e.explode_v = ( explode_radius - radius ) / CR.explode_speed;
    e.explode_ended = false;
    e.getInfected = function(){
        if(this.radius >= this.explode_radius){
            this.radius = this.explode_radius;
            this.stopped = true;
            return;
        }
        this.radius += this.explode_v;
    };
    CR.ball_all.balls.push(e);
    return e;
};

CR.createLaserBall = function(ctx, x, y, radius, color, vx, vy, score){
    let e = new ballBase(ctx, x, y, radius, color, vx, vy, score);
    e.infect_move_timer = 0;
    e.infect_move_ended = false;
    e.deg = Math.random() * 2 * Math.PI;
    e.getInfected = function(){
        if(this.infect_move_timer < CR.infect_move_interval) {
            this.infect_move_timer++;
        }
        else {
            let l;
            for(var i = 0; i < 4; ++i) {
                l = new laser(CR.ctx.gaming, this.x + this.radius * Math.cos(this.deg + i * Math.PI / 2),
                    this.y + this.radius * Math.sin( this.deg + i * Math.PI / 2),
                    this.x - this.radius * Math.cos( this.deg + i * Math.PI / 2),
                    this.y - this.radius * Math.sin( this.deg + i * Math.PI / 2),
                    this.radius * Math.cos( this.deg + i * Math.PI / 2),
                    this.radius * Math.sin( this.deg + i * Math.PI / 2), this);
                CR.ball_all.balls.push(l);
                CR.ball_infected.balls.push(l);
            }
            this.to_delete = true;
        }
    };
    e.checkConflict = function(target){
        return false;
    };
    e.setDeg = function(deg){
        this.deg = deg;
    };
    e.update = function() {
        if(!this.to_delete) {
            if (!this.infect_src) {
                this.infect_src = CR.ball_infected.checkConflict(this);
                if(this.infect_src) {
                    this.color = "yellow";
                    CR.ball_infected.balls.push(this);
                }
            }
            if (this.infect_src) {
                this.getInfected();
                if(this.infect_move_timer < CR.infect_move_interval) {
                    this.rebound();
                    this.x += this.vx;
                    this.y += this.vy;
                }
                return;
            }
            this.rebound();
            this.x += this.vx;
            this.y += this.vy;
        }
    };
    CR.ball_all.balls.push(e);
    return e;
};

CR.createPlanetBall = function(ctx, x, y, radius, spinning_ex_radius,  color, vx, vy, score){
    let e = new ballBase(ctx, x, y, radius, color, vx, vy, score);
    e.radius = radius;
    e.satellite_radius = 5;
    e.spinning_radius = radius - e.satellite_radius - 2;
    e.spinning_ex_radius = spinning_ex_radius;
    e.spinning_ex_v = (spinning_ex_radius - radius) / CR.spinning_ex_interval;
    e.spinning_omg = CR.wave_speed;
    e.spinning_timer = 0;
    e.spinning_interval = 500;
    e.delete_timer = CR.delete_interval;
    e.satellites = [{x:e.x + e.spinning_radius, y:e.y},
        {x:e.x + e.spinning_radius * Math.cos(2 * Math.PI / 3), y:e.y + e.spinning_radius * Math.cos(2 * Math.PI / 3)},
        {x:e.x + e.spinning_radius * Math.cos(4 * Math.PI / 3), y:e.y + e.spinning_radius * Math.cos(4 * Math.PI / 3)}];
    e.getInfected = function(){
        if(this.spinning_timer >= this.spinning_interval)
            this.to_delete = true;
        else{
            this.spinning_timer++;
        }
        if(this.spinning_radius >= this.spinning_ex_radius){
            return;
        }
        this.spinning_radius += this.spinning_ex_v;
    };
    e.checkConflict = function(target){
        let dist_1 = Math.pow((target.x - this.satellites[0].x), 2)+ Math.pow((target.y - this.satellites[0].y), 2);
        let dist_2 = Math.pow((target.x - this.satellites[1].x), 2)+ Math.pow((target.y - this.satellites[1].y), 2);
        let dist_3 = Math.pow((target.x - this.satellites[2].x), 2)+ Math.pow((target.y - this.satellites[2].y), 2);
        let distance = Math.min(dist_1, dist_2, dist_3);
        if(distance > Math.pow((this.satellite_radius+target.radius),2))
            return false;
        return true;
    };
    e.update = function() {
        if(!this.to_delete) {
            if (!this.infect_src) {
                this.infect_src = CR.ball_infected.checkConflict(this);
                if (this.infect_src) {
                    CR.ball_infected.balls.push(this);
                    return;
                }
                this.rebound();
                this.x += this.vx;
                this.y += this.vy;
            }
            else {
                this.getInfected();
            }
            for(var i = 0;i<3;++i) {
                this.satellites[i].x = this.x + this.spinning_radius * Math.cos(this.spinning_omg*this.spinning_timer + i * 2 * Math.PI / 3);
                this.satellites[i].y = this.y + this.spinning_radius * Math.sin(this.spinning_omg*this.spinning_timer + i * 2 * Math.PI / 3);
            }
        }
    };
    e.draw = function() {
        this.ctx.save();
        for (var i = 0;i < 3; ++i){
            this.ctx.beginPath();
            this.ctx.arc(this.satellites[i].x, this.satellites[i].y, this.satellite_radius, 0, Math.PI*2, true);
            this.ctx.closePath();
            this.ctx.fillStyle = "#c0c0c0";
            this.ctx.fill();
        }
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.restore();
    };
    CR.ball_all.balls.push(e);
    return e;
};

function startBoardBase(ctx, x, y, radius, px, py){
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.cx = x;
    this.cy = y;
    this.hx = 0;
    this.hy = 0;
    this.dvx = 0;
    this.dvy = 0;
    this.dvs = 0;
    this.background = new Image();
    this.background.src = "./img/balls.png";
    this.hanging_anim = null;
    this.is_hanging = false;
    this.hanging_range = CR.hanging_range;
    this.hanging_interval = CR.hanging_interval;
    this.ori_radius = radius;
    this.radius = radius;
    this.hover_radius = CR.start_hover_ratio * 0.5 * CR.start_height;
    this.hover_interval = CR.start_hover_interval;
    this.hvv = (this.radius - this.hover_radius)/this.hover_interval;
    this.to_hover = false;
    this.arrived = false;
    this.disappear_interval = 20;
    this.deleted = false;
    this.deleting = false;
    this.delete_timer = 0;
    this.hanging = function() {
        if(!this.is_hanging && !this.arrived) {
            if (this.hanging_anim)
                TWEEN.remove(this.hanging_anim);
            this.getHxy();
            let ratio = Math.sqrt((Math.pow((this.hx - this.x),2)+ Math.pow((this.hy - this.y),2))/Math.pow(this.hanging_range,2));
            this.hanging_anim = new TWEEN.Tween(this).to({x: this.hx, y: this.hy}, this.hanging_interval * ratio)
                .onComplete(this.hangingComplete).easing(TWEEN.Easing.Cubic.InOut);
            this.hanging_anim.start();
            this.is_hanging = true;
        }
    };
    this.getHxy = function(){
        this.hx = (Math.random() - 0.5) * this.hanging_range + this.cx;
        this.hy = (Math.random() - 0.5) * this.hanging_range + this.cy;
    };
    this.draw = function(){
        this.ctx.drawImage(this.background, px * 200, py * 200, 200, 200, this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius)
    };
    this.hover = function(){
        if(this.to_hover){
            if(this.radius > this.hover_radius)
                this.radius -= this.hvv;
        }
        else{
            if(this.radius < this.ori_radius)
                this.radius += this.hvv;
        }
    };
    this.update = function(){
        if(this.deleting) {
            if(this.delete_timer === this.disappear_interval*0.9) {
                this.deleted = true;
                return;
            }
            this.x += this.dvx;
            this.y += this.dvy;
            this.radius += this.dvs;
            this.delete_timer++;
            return;
        }
        this.hover();
        this.hanging();
    };
    this.hangingComplete = function(){
        this.is_hanging = false;
    };
    this.to_delete = function(){
        this.dvx = (CR.start_width / 2 - this.x) / this.disappear_interval;
        this.dvy = (CR.start_height / 2 - this.y) / this.disappear_interval;
        this.dvs = (0 - this.radius) / this.disappear_interval;
    }
}

function text(ctx, text, x, y, font_size, transparent) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.transparent = transparent;
    this.font_size = font_size;
    this.changing = false;
    this.finished = false;
    this.interval = 2000;
    this.draw = function () {
        ctx.save();
        ctx.font = this.font_size + "px futura";
        ctx.fillStyle = "rgba(0, 0, 0, " + this.transparent + ")";
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    };
    this.setText = function (text) {
        this.text = text;
    };
    this.show = new TWEEN.Tween(this).to({transparent: 1}, this.interval * 0.5).easing(TWEEN.Easing.Cubic.In);
    this.disappear = new TWEEN.Tween(this).to({transparent: 0}, this.interval * 0.5).delay(2000)
        .onComplete(function () {
            this.changing = false;
            this.finished = true;
        });
    this.show.chain(this.disappear);

}
