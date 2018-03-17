/**
 * Created by getterk on 2017/7/28.
 */

document.onmousedown = function(event){
    if(CR.cur_scene === "game" && event.clientX > CR.game_left_bdry + CR.border_width &&
        event.clientX < CR.game_left_bdry + CR.game_width - CR.border_width &&
        event.clientY > CR.top_bdry + CR.border_width &&
        event.clientY < CR.top_bdry + CR.height + CR.border_width && !CR.stageCurtain.stage_changing && (CR.mode === 0 || CR.mode === 2) && !CR.game_ended) {
        if(CR.mode === 0)
            CR.source = CR.createExplodeBall(CR.ctx.gaming, event.clientX - CR.game_left_bdry, event.clientY - CR.top_bdry, 10, 20, "grey", 0, 0, 0);
        else if(CR.mode === 2) {
            CR.source = CR.createPlanetBall(CR.ctx.gaming, event.clientX - CR.game_left_bdry, event.clientY - CR.top_bdry, 10, 30, "grey", 0, 0, 0);
        }
        CR.score -= 250;
        CR.source.infect_src = CR.source;
        CR.ball_infected.balls.push(CR.source);
    }
    else if (CR.cur_scene === "help"){
        CR.switching = true;
        CR.target_scene = "welcome";
    }
    else if(CR.cur_scene === "welcome" && !CR.start_main.deleting) {
        let x = event.clientX - (window.innerWidth - CR.start_width) / 2;
        let y = event.clientY - (window.innerHeight - CR.start_height) / 2;
        for (let i = 0; i < 3; ++i) {
            if (Math.pow((x - CR.sub_start.items[i].x), 2) + Math.pow((y - CR.sub_start.items[i].y), 2) < Math.pow(CR.sub_start.items[i].radius, 2)) {
                CR.start_main.to_delete();
                CR.start_main.deleting = true;
                for (item of CR.sub_start.items) {
                    item.to_delete();
                    item.deleting = true;
                }
                CR.switching = true;
                if(i === 0)
                    CR.target_scene = "game";
                else if(i === 1)
                    CR.target_scene = "help";
                else
                    CR.target_scene = "mode";
                return;
            }
        }
    }
};

document.mousemove = function(event){
    if(CR.cur_scene === "welcome") {
        for (item of CR.sub_start.items) {
            item.color = "#c0c0c0";
            item.to_hover = false;
        }
        let x = event.clientX - (window.innerWidth - CR.start_width) / 2;
        let y = event.clientY - (window.innerHeight - CR.start_height) / 2;
        if (Math.pow((x - CR.start_main.x), 2) + Math.pow((y - CR.start_main.y), 2) < Math.pow(CR.start_main.radius, 2)) {
            if (!(CR.sub_start.items[0].arrived ||
                CR.sub_start.items[1].arrived ||
                CR.sub_start.items[2].arrived))
                CR.sub_start.show();
            CR.start_main.to_hover = true;
            return;
        }
        for (let i = 0; i < 3; ++i) {
            if (Math.pow((x - CR.sub_start.items[i].x), 2) + Math.pow((y - CR.sub_start.items[i].y), 2) < Math.pow(CR.sub_start.items[i].radius, 2)) {
                CR.sub_start.restartAnim();
                CR.sub_start.show();
                CR.sub_start.items[i].color = "#969696";
                CR.sub_start.items[i].to_hover = true;
                return;
            }
        }
        CR.sub_start.hide();
        CR.start_main.to_hover = false;
    }
};

document.onclick = function(){
    if(CR.cur_scene === "game" && event.clientX > CR.game_left_bdry + CR.border_width &&
        event.clientX < CR.game_left_bdry + CR.game_width - CR.border_width &&
        event.clientY > CR.top_bdry + CR.border_width &&
        event.clientY < CR.top_bdry + CR.height + CR.border_width && !CR.stageCurtain.stage_changing && CR.mode === 1 && !CR.game_ended){
        if(CR.laser_source_set){
            CR.source.setDeg(Math.PI+Math.atan((event.clientY - CR.top_bdry - CR.source.y) / (event.clientX - CR.game_left_bdry - CR.source.x)));
            CR.source.infect_src = CR.source;
        }
        else{
            CR.source = CR.createLaserBall(CR.ctx.gaming, event.clientX - CR.game_left_bdry, event.clientY - CR.top_bdry, 10, "grey", 0, 0, 0);
            CR.source.infect_move_timer = CR.infect_move_interval;
            CR.game_pressed = true;
            CR.score -= 250;
            CR.ball_infected.balls.push(CR.source);
            CR.laser_source_set = true;
            return;
        }
    }
    else if(CR.game_ended && CR.cur_scene === "game" && CR.complete_hint.shown){
        CR.switching = true;
        CR.target_scene = "welcome";
    }
};

function showModelText(id) {
    document.getElementById(String(id)).lastChild.style.visibility = "visible";
}

function hideModelText(id) {
    document.getElementById(String(id)).lastChild.style.visibility = "hidden";
}

function chooseModel(mode){
    CR.mode = mode;
    CR.switching = true;
    CR.target_scene = "game";
}