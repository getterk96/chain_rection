/**
 * Created by getterk on 2017/7/28.
 */

CR = {};

function pointToSeg(x, y, x1, y1, x2, y2) {
    let result;
    let cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
    if (cross <= 0) { result = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1)); return result; }
    let d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (cross >= d2) { result = Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2)); return result; }
    let r = cross / d2;
    let px = x1 + (x2 - x1) * r;
    let py = y1 + (y2 - y1) * r;
    result = Math.sqrt((x - px) * (x - px) + (py - y) * (py - y));
    return result;
}

function getRandom(length){ return Math.floor(Math.random()*(length - 0.001)); }

CR.initAll = function(){
    this.initEnvironment();
    this.initCanvas();
    this.initBorder();
    this.initRender();
    this.initEffect();
    this.switchScene("", "welcome");
};

CR.initEnvironment = function(){
    this.border_width = 10;
    this.explode_speed = 200; //smaller larger
    this.laser_speed = 100;
    this.wave_speed = 0.05;
    this.spinning_ex_interval = 250;
    this.wave_times = 3;
    this.delete_interval = 200;
    this.tree_line_width = 2;
    this.tree_max_ratio = 3;
    this.ball_ori_radius = 5;
    this.hanging_interval = 4000;
    this.start_ratio = 0.8;
    this.start_board_ratio = 0.6;
    this.start_hover_ratio = 0.57;
    this.start_hover_interval = 100;
    this.bump_out_ratio = 1.5;
    this.cur_scene = "welcome";
    this.target_scene = "";
    this.switching = false;
    this.score = 0;
    this.mode = 0;
    this.infect_move_interval = 200;
    this.stage_change_interval = 3000;
    this.cur_stage = 0;
    this.game_pressed = false;
    this.laser_source_set = false;
    this.mode_ended = false;  //need init
    this.mode_cleared = [false, false, false];
    this.game_width = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.8);
    this.whole_width = this.game_width * (this.tree_max_ratio + 1) / this.tree_max_ratio;
    this.function_width = this.game_width / this.tree_max_ratio;
    this.start_width = (this.function_width + this.game_width) * this.start_ratio;
    this.height = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.8);
    this.start_height = this.height * this.start_ratio;
    this.hanging_range = this.start_height * 0.1;
    this.game_left_bdry = ( window.innerWidth - CR.game_width * (this.tree_max_ratio + 1) / this.tree_max_ratio)/ 2 + CR.game_width / CR.tree_max_ratio;
    this.top_bdry = ( window.innerHeight - CR.height ) / 2;
    this.ball_types = [
        {"color": "orange", "score": 50, "explode_radius": 40, "laser_ex_radius": 40, "expand_radius": 80},
        {"color": "blue", "score": 100, "explode_radius": 35, "laser_ex_radius": 35, "expand_radius": 75},
        {"color": "red", "score": 200, "explode_radius": 25, "laser_ex_radius": 25, "expand_radius": 65},
        {"color": "purple", "score": 500, "explode_radius": 15, "laser_ex_radius": 15, "expand_radius": 55},
        {"color": "green", "score": 25, "explode_radius": 45, "laser_ex_radius": 45, "expand_radius": 85},
    ];
};

CR.initCanvas = function(){
    let canvas = document.getElementsByClassName("canvas");
    for (elem of canvas) {
        elem.setAttribute("height", this.height);
        elem.style.top = String(this.top_bdry)+"px";
        if(elem.id === "function") {
            elem.setAttribute("width", this.function_width);
            elem.style.left = String((window.innerWidth - this.game_width*(this.tree_max_ratio+1)/this.tree_max_ratio)/2)+"px";
        }
        else if(elem.id === "effects"){
            elem.setAttribute("width", this.function_width * (this.tree_max_ratio + 1));
            elem.style.left = String((window.innerWidth - this.game_width*(this.tree_max_ratio+1)/this.tree_max_ratio)/2)+"px";
        }
        else {
            elem.setAttribute("width", this.game_width);
            elem.style.left = String((window.innerWidth - this.game_width * (this.tree_max_ratio+1)/this.tree_max_ratio) / 2 + this.function_width) + "px";
        }
    }
    canvas = document.getElementById("start");
    canvas.setAttribute("width", this.start_width);
    canvas.setAttribute("height", this.start_height);
    canvas.style.left = String((window.innerWidth - this.start_width)/2)+"px";
    canvas.style.top = String((window.innerHeight - this.start_height)/2)+"px";
    this.ctx = {};
    canvas = document.getElementById('background');
    this.ctx.background = canvas.getContext('2d');
    canvas = document.getElementById('gaming');
    this.ctx.gaming = canvas.getContext('2d');
    canvas = document.getElementById('effects');
    this.ctx.effects = canvas.getContext('2d');
    canvas = document.getElementById('function');
    this.ctx.function = canvas.getContext('2d');
    canvas = document.getElementById('start');
    this.ctx.start = canvas.getContext('2d');
};

CR.initBorder = function(){
    this.border = {
        size: CR.game_width,
        depth: CR.border_width,
        color: "black",
        draw: function() {
            CR.ctx.background.save();
            CR.ctx.background.beginPath();
            CR.ctx.background.fillRect(0, 0, CR.game_width, CR.height);
            CR.fillStyle = "white";
            CR.ctx.background.fill();
            CR.ctx.background.closePath();
            let gradient=CR.ctx.background.createLinearGradient(0,0,CR.game_width,0);
            gradient.addColorStop("0","magenta");
            gradient.addColorStop("0.5","red");
            gradient.addColorStop("1.0","green");
            CR.ctx.background.strokeStyle = gradient;
            CR.ctx.background.lineWidth = this.depth;
            CR.ctx.background.rect(this.depth / 2, this.depth / 2, this.size - this.depth, this.size - this.depth);
            CR.ctx.background.stroke();
            CR.ctx.background.restore();
        },
    }
};

CR.initRender = function(){
    this.to_update = {
        items: Array(),
        update: function(){
            for (item of this.items){
                item.update();
            }
            if(CR.switching)
                CR.switch_check(CR.cur_scene);
            if(CR.cur_scene === "game")
                CR.checkClearStage();
        }
    };
    this.draw = function(){
        if(CR.cur_scene === "welcome") CR.draw_start();
        if(CR.cur_scene === "game") CR.draw_game();
        CR.draw_effect();
    };
    this.sub_start = {
        deg_interval: 0,
        target_distance: 0,
        items: Array(),
        init: function(){
            this.deg_interval = 90 / (this.items.length - 1);
            this.target_distance = CR.bump_out_ratio * CR.start_main.radius;
        },
        show: function(){
            for (let i = 0;i<this.items.length;++i){
                this.items[i].cx = CR.start_main.cx + this.target_distance * Math.cos((-45+this.deg_interval*i)*0.017453293);
                this.items[i].cy = CR.start_main.cy + this.target_distance * Math.sin((-45+this.deg_interval*i)*0.017453293);
                this.items[i].arrived = false;
                this.items[i].hangingComplete = function(){
                    this.arrived = true;
                    this.is_hanging = false;
                };
            }
        },
        hide: function(){
            for (item of this.items){
                item.arrived = false;
                item.cx = CR.start_main.cx;
                item.cy = CR.start_main.cy;
                item.hangingComplete = function(){
                    this.arrived = false;
                    this.is_hanging = false;
                };
            }
        },
        setUp: function(){
            this.deg_interval = 90 / (this.items.length - 1);
            this.target_distance = CR.bump_out_ratio * CR.start_main.radius;
            for (let i = 0;i<this.items.length;++i) {
                this.items[i].hover_radius = this.target_distance * this.deg_interval * 0.017453293 / 2 * 0.6;
                this.items[i].ori_radius = this.items[i].hover_radius * 0.8;
                this.items[i].radius = this.items[i].ori_radius;
                this.items[i].hover_interval = ( this.items[i].hover_radius - this.items[i].ori_radius ) /
                    (CR.start_main.ori_radius - CR.start_main.hover_radius) * CR.start_main.hover_interval / 3;
                this.items[i].hvv = ( this.items[i].hover_radius - this.items[i].ori_radius ) / this.items[i].hover_interval;
                this.items[i].hover = function(){
                    if(this.to_hover){
                        if(this.radius < this.hover_radius)
                            this.radius += this.hvv;
                    }
                    else{
                        if(this.radius > this.ori_radius)
                            this.radius -= this.hvv;
                    }
                };
                this.items[i].getHxy=  function(){
                    this.hx = this.cx;
                    this.hy = this.cy;
                };
                this.items[i].hanging_interval = 100;
            }
        },
        restartAnim: function(){
            for (item of this.items){
                if(item.hanging_anim) {
                    TWEEN.remove(item.hanging_anim);
                    item.is_hanging = false;
                }
            }
        },
        update: function(){
            for (item of this.items){
                item.update();
            }
        },
        draw: function(){
            for (item of this.items){
                item.draw();
            }
        },
        deleted:function(){
            for (item of this.items){
                if(item.deleted === false)
                    return false;
            }
            return true;
        }
    };
    window.requestAnimationFrame(update);
};

CR.initEffect = function() {
    CR.stage_tip = new text(CR.ctx.effects, "", CR.whole_width / 2 - 160, CR.height / 2, 34, 0);
    CR.stageCurtain = {
        ctx: CR.ctx.effects,
        stage_changing: false,
        appeared: false,
        transparent: 0,
    };
    CR.stageCurtain.draw = function () {
        this.ctx.save();
        this.ctx.fillStyle = "rgba(126, 170, 205, " + this.transparent + ")";
        this.ctx.fillRect(0, 0, CR.whole_width, CR.height);
        this.ctx.restore();
    };
    CR.stageCurtain.show = new TWEEN.Tween(CR.stageCurtain).to({transparent: 1}, CR.stage_change_interval * 0.5)
        .onComplete(function () {
            CR.stageCurtain.appeared = true;
        }).easing(TWEEN.Easing.Cubic.InOut);
    CR.stageCurtain.disappear = new TWEEN.Tween(CR.stageCurtain).to({transparent: 0}, CR.stage_change_interval * 0.5)
        .onComplete(function () {
            CR.stageCurtain.appeared = false;
            CR.stageCurtain.stage_changing = false;
            CR.ctx.background.clearRect(0, 0, this.game_width ,this.height);
            CR.border.draw();
            if(CR.cur_stage === 0)
                CR.game_ctrl.style.visibility = "visible";
            else
                CR.game_ctrl.style.zIndex = 100;
        });
    CR.stageCurtain.show.chain(CR.stage_tip.show);
    CR.stage_tip.disappear.chain(CR.stageCurtain.disappear);

    CR.complete_hint = {
        ctx: CR.ctx.effects,
        cup: new Image(),
        show: false,
        shown: false,
        transparent: 0,
    };
    CR.complete_hint.complete_tip = new text(CR.ctx.effects, "Click Anywhere To Continue!", CR.whole_width / 2 - 230, 3 * CR.height / 5, 34, 0);
    CR.complete_hint.cup.src = "./img/cup.png";
    CR.complete_hint.draw = function(){
        this.ctx.save();
        this.ctx.fillStyle = "rgba(255, 215, 0, " + this.transparent + ")";
        this.ctx.fillRect(0, 0, CR.whole_width, CR.height);
        if(this.shown){
            this.ctx.drawImage(this.cup,0, 0, 1000, 1000, CR.whole_width / 2 - 50, CR.height / 4, 100, 100);//绘制图片
            this.complete_tip.draw();
        }
        this.ctx.restore();
    };
    CR.complete_hint.lighting = new TWEEN.Tween(CR.complete_hint).to({transparent: 1}, CR.stage_change_interval * 0.5)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onStart(function(){
            CR.game_ctrl.style.zIndex = 0;
            CR.complete_hint.show = true;
        })
        .onComplete(function(){
            CR.complete_hint.shown = true;
        });
    CR.complete_hint.lighting.chain(CR.complete_hint.complete_tip.show);
    CR.complete_hint.complete_tip.disappear.chain(CR.complete_hint.complete_tip.show);
};

CR.switch_check = function(scene){
    switch(scene){
        case "welcome":
            if(CR.start_main.deleted && CR.sub_start.deleted()) {
                CR.switching = false;
                CR.switchScene(CR.cur_scene, CR.target_scene);
            }
            break;
        default:
            CR.switching = false;
            CR.switchScene(CR.cur_scene, CR.target_scene);
            break;
    }
};

CR.checkClearStage = function(){
    if(!CR.game_ended && this.score >= (4 - this.cur_stage) * 500) {
        CR.stage_congratulate_tip.setText("Marvelous!!");
        if(CR.cur_stage >= 3){
            CR.mode_cleared[CR.mode] = true;
            CR.game_ended = true;
            CR.complete_hint.lighting.start();
            return;
        }
        document.getElementById("2").style.visibility = "visible";
    }
};

CR.welcomeInit = function(){
    document.getElementById("start").onmousemove = document.mousemove;
    this.start_main = new startBoardBase(CR.ctx.start,
        this.start_width / 2,
        this.start_height / 2,
        this.start_height*0.5*this.start_board_ratio, 0, 0);
    this.start_sub_game = new startBoardBase(CR.ctx.start,
        this.start_width / 2,
        this.start_height / 2,
        0, 1, 0);
    this.start_help = new startBoardBase(CR.ctx.start,
        this.start_width / 2,
        this.start_height / 2,
        0, 2, 0);
    this.start_contect_me = new startBoardBase(CR.ctx.start,
        this.start_width / 2,
        this.start_height / 2,
        0, 3, 0);

    this.sub_start.items.push(this.start_sub_game, this.start_help, this.start_contect_me);
    this.to_update.items.push(this.sub_start, this.start_main);
    this.sub_start.init();
    this.sub_start.setUp();
};

CR.gameInit = function(){
    this.ball_all = {
        balls: Array(),
        update: function(){
            for (ball of this.balls){ if(ball.to_delete) ball.remove(); }
            for (ball of this.balls){ ball.update(); }
        },
        draw: function(){
            for (ball of this.balls){ ball.draw(); }
        }
    };
    this.ball_infected = {
        balls: Array(),
        checkConflict: function(target){
            for(ball of this.balls){
                if(ball.checkConflict(target)) {
                    if(ball.owner)
                        return ball.owner;
                    return ball;
                }
            }
            return null;
        }
    };
    this.ball_transformed = {
        //former_size: 0,
        balls: Array(),
        draw: function() {
            //if(this.former_size === this.balls.length) return;
            let left_max = CR.game_width;
            let top_max = CR.height;
            let size_max = 0;
            for (ball of this.balls) {
                if (left_max > ball.x)
                    left_max = ball.x;
                if (top_max > ball.y)
                    top_max = ball.y;
            }
            for (ball of this.balls) {
                if (ball.x - left_max > size_max
                    || ball.y - top_max > size_max) {
                    size_max = Math.max(ball.x - left_max, ball.y - top_max);
                }
            }
            let ratio;
            if (size_max === 0) {
                ratio = 1;
            }
            else {
                ratio = CR.function_width / size_max;
            }
            let r = CR.ball_ori_radius / CR.function_width;
            for (ball of this.balls) {
                ball.tx = ball.x - left_max;
                ball.ty = ball.y - top_max;
                ball.tx = ball.tx * ratio * (1 - 4 * r);
                ball.ty = ball.ty * ratio * (1 - 4 * r);
                ball.tx += CR.function_width * 2 * r;
                ball.ty += CR.function_width * 2 * r + CR.height - CR.function_width;
            }
            for (ball of this.balls) {
                if (ball.infect_src === ball || this.balls.indexOf(ball.infect_src) === -1) {
                    ball.treeDraw();
                }
                else {
                    ball.ctx.save();
                    ball.ctx.strokeStyle = "black";
                    ball.ctx.lineWidth = CR.tree_line_width;
                    ball.ctx.beginPath();
                    ball.ctx.moveTo(ball.infect_src.tx, ball.infect_src.ty);
                    ball.ctx.lineTo(ball.tx, ball.ty);
                    ball.ctx.stroke();
                    ball.ctx.restore();
                    ball.infect_src.treeDraw();
                    ball.treeDraw();
                }
            }
            //this.former_size = this.balls.length;
        }
    };
    this.score_label = new text(CR.ctx.function, String(CR.score), 0, 40, 36, 1);
    this.score_label.update = function(){
        this.text = String(CR.score) + "pts";
    };
    this.stage_congratulate_tip = new text(CR.ctx.function, "", 0, 1.5 * CR.height / 9, 20, 1);
    this.stage_clear_tip_1 = new text(CR.ctx.function, "", 0, 2 * CR.height / 9, 20, 1);
    this.to_update.items.push(CR.ball_all, CR.score_label);
    CR.game_ended = false;
    CR.game_ctrl = document.createElement("div");
    CR.game_ctrl.style.position = "absolute";
    CR.game_ctrl.style.top = (window.innerHeight - CR.height)/2 + CR.height / 3;
    CR.game_ctrl.style.left = (window.innerWidth - CR.whole_width)/2;
    CR.game_ctrl.style.zIndex = 100;
    CR.game_ctrl.style.width = CR.function_width;
    CR.game_ctrl.style.height = CR.function_width;
    document.getElementById("main").appendChild(CR.game_ctrl);
    var op = ["","",""];
    for (var i = 0;i<3;++i) {
        op[i] = document.createElement("button");
        op[i].style.width = "90%";
        op[i].style.height = CR.function_width / 4;
        op[i].style.textAlign = "center";
        op[i].style.marginBottom = CR.function_width / 24;
        op[i].style.marginTop = CR.function_width / 24;
        op[i].style.marginLeft = CR.function_width / 50;
        op[i].id = i;
        CR.game_ctrl.appendChild(op[i]);
    }
    op[0].onclick = function(){
        CR.switching = true;
        CR.target_scene = "welcome"
    };
    op[0].textContent = "主选单";
    op[1].onclick = function(){
        CR.stageInit(CR.cur_stage);
    };
    op[1].textContent = "重新开始";
    op[2].onclick = function(){
        CR.stageInit(++CR.cur_stage);
    };
    op[2].textContent = "下一关";
    CR.stageInit(0);
};

CR.stageInit = function(level){
    if(CR.cur_stage === 0)
        CR.game_ctrl.style.visibility = "hidden";
    else
        CR.game_ctrl.style.zIndex = 0;
    CR.score = 0;
    CR.game_pressed = false;
    CR.mode_ended = false;
    CR.laser_source_set = false;
    CR.stage_tip.finished = false;
    CR.stage_congratulate_tip.setText("Er...");
    CR.stage_clear_tip_1.setText("目标分：" + (4 - CR.cur_stage) * 500);
    CR.stage_tip.setText("Welcome to Stage" + (CR.cur_stage + 1));
    document.getElementById("2").style.visibility = "hidden";
    CR.ball_all.balls = [];
    CR.ball_transformed.balls = [];
    CR.ball_infected.balls = [];
    for (let i = 0;i<20 - CR.cur_stage * 5;++i) {
        let vx = Math.random()*0.5 + 0.7;
        if(Math.random() - 0.5 < 0) vx = -vx;
        let vy = Math.sqrt(2 - Math.pow(vx, 2));
        if(Math.random() - 0.5 < 0) vy = -vy;
        switch(CR.mode) {
            case 0:
                CR.createExplodeBall(this.ctx.gaming, getRandom(CR.game_width) * 0.7 + 50,
                    getRandom(CR.height) * 0.7 + 50, 10, CR.ball_types[i % 5].explode_radius,
                    CR.ball_types[i % 5].color, vx, vy, CR.ball_types[i % 5].score);
                break;
            case 1:
                let laser = CR.createLaserBall(this.ctx.gaming, getRandom(CR.game_width) * 0.7 + 50,
                    getRandom(CR.height) * 0.7 + 50, 10, CR.ball_types[i % 5].color, vx, vy, CR.ball_types[i % 5].score);
                laser.setDeg(Math.PI / 4);
                break;
            case 2:
                CR.createPlanetBall(this.ctx.gaming, getRandom(CR.game_width) * 0.7 + 50,
                    getRandom(CR.height) * 0.7 + 50, 10, CR.ball_types[i % 5].expand_radius,
                    CR.ball_types[i % 5].color, vx, vy, CR.ball_types[i % 5].score);
                break;
        }
    }
    CR.stageCurtain.show.start();
    CR.stageCurtain.stage_changing = true;
};

CR.helpInit = function(){
    CR.help = document.createElement("div");
    CR.help.style.position = "absolute";
    CR.help.style.top = (window.innerHeight - CR.start_height)/2;
    CR.help.style.left = (window.innerWidth - CR.start_width)/2;
    document.getElementById("main").appendChild(CR.help);
    let p = document.createElement("pre");
    p.textContent = "Chain Rection游戏帮助：\n\n游戏目标：通过不同的链接方式，以得到更高的分数为最终获胜目标。\n\n游戏方式：在游戏界面中放置若干个原点。\n    原点作为传播源头，将会传染其他的球，被传染的球将会继续传播过程。其中不同颜色的球有不同的分值，分值越高的球越难以传染其他的球。\n\n例如：\n紫色球分值最高，但扩散半径最小。\n绿色球分值最低，但扩散半径最大。\n\n祝您好运！\n\n\n点击任意位置返回主菜单。";
    p.style.width = CR.start_width;
    p.style.fontSize = 16;
    p.style.fontFamily = "Helvetica, 'Hiragino Sans GB', 'Microsoft Yahei', '微软雅黑', Arial, sans-serif";
    CR.help.appendChild(p);
};

CR.modeInit = function(){
    CR.modesc = document.createElement("div");
    document.getElementById("main").appendChild(CR.modesc);
    CR.modesc.style.position = "absolute";
    CR.modesc.style.top = (window.innerHeight - CR.start_height)/2;
    CR.modesc.style.left = (window.innerWidth - CR.start_width)/2;
    CR.modesc.style.width = this.start_width;
    CR.modesc.style.height = this.start_height;
    CR.modesc.style.zIndex = 100;
    let op = [];
    for (let i = 0;i<3;++i) {
        op.push(document.createElement("div"));
        CR.modesc.appendChild(op[i]);
        op[i].style.width = this.start_width * 0.3;
        op[i].style.height = this.start_height * 0.8;
        op[i].style.float = "left";
        op[i].style.marginLeft = op[i].style.marginRight = String(this.start_width / 60);
        op[i].style.marginTop = op[i].style.marginBottom = String(this.start_height / 10);
        op[i].style.background = "no-repeat url(img/a.png)";
        op[i].style.backgroundSize = "100%";
        op[i].id = i;
        let logo = document.createElement("div");
        op[i].appendChild(logo);
        logo.style.width = this.start_width * 0.3 - 2;
        logo.style.height = this.start_width * 0.3 - 2;
        logo.style.borderRadius = Math.floor(this.start_width * 0.3 / 2) + "px";
        let explanation = document.createElement("pre");
        op[i].appendChild(explanation);
        explanation.style.width = this.start_width * 0.3 - 2;
        switch(i){
            case 0:
                explanation.textContent = "标准模式\n标准模式下所有球的扩散方式为半径增幅，所有接触到正在扩散或已扩散的球将以同样的方式进行扩散。";
                break;
            case 1:
                explanation.textContent = "激光模式\n激光模式下所有球的扩散方式为向四周发射激光，激光存在时间为2s，被激光射到的球将会被链接。\n请注意：激光模式只允许放置一次原点，放置原点之后，鼠标再次点击屏幕以确定激光发射方向。";
                break;
            case 2:
                explanation.textContent = "行星模式\n行星模式下所有的球的扩散方式为向外螺旋发出三颗卫星，所有与卫星相接触的球都会被链接，并以同样的方式继续扩散。";
                break;
        }
        explanation.style.textAlign = "center";
        explanation.id = "mode_ex";
        explanation.style.visibility = "hidden";
        explanation.style.fontFamily = "Helvetica, 'Hiragino Sans GB', 'Microsoft Yahei', '微软雅黑', Arial, sans-serif";
        logo.setAttribute("onmousemove", "showModelText("+i+")");
        logo.setAttribute("onmouseout", "hideModelText("+i+")");
        logo.setAttribute("onclick", "chooseModel("+i+")");
    }
};
