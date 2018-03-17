/**
 * Created by getterk on 2017/7/28.
 */

CR.switchScene = function(cur_scene, next_scene){
    CR.clearScene(cur_scene);
    switch(next_scene){
        case "welcome":
            CR.welcomeInit();
            break;
        case "help":
            CR.helpInit();
            break;
        case "game":
            CR.gameInit();
            break;
        case "mode":
            CR.modeInit();
            break;
    }
    CR.target_scene = "";
    CR.cur_scene = next_scene;
};

CR.clearScene = function(scene){
    switch(scene){
        case "":
            break;
        case "welcome":
            CR.to_update.items.splice(CR.to_update.items.indexOf(CR.start_main),1);
            CR.to_update.items.splice(CR.to_update.items.indexOf(CR.sub_start),1);
            CR.ctx.start.clearRect(0, 0, CR.start_width, CR.start_height);
            CR.start_main = null;
            CR.start_help= null;
            CR.start_game = null;
            CR.start_contact = null;
            CR.sub_start.items = [];
            CR.sub_start.deg_interval = CR.sub_start.target_distance = 0;
            break;
        case "help":
            document.getElementById("main").removeChild(CR.help);
            CR.help = null;
            break;
        case "mode":
            document.getElementById("main").removeChild(CR.modesc);
            CR.modesc = null;
            break;
        case "game":
            CR.to_update.items.splice(CR.to_update.items.indexOf(CR.ball_all),1);
            CR.to_update.items.splice(CR.to_update.items.indexOf(CR.score_label),1);
            document.getElementById("main").removeChild(CR.game_ctrl);
            CR.cur_stage = 0;
            CR.score = 0;
            CR.game_ctrl = null;
            CR.ball_all.balls = null;
            CR.ball_infected.balls = null;
            CR.ball_transformed.balls = null;
            CR.score_label = null;
            CR.stage_congratulate_tip = null;
            CR.stage_clear_tip_1 = null;
            if(CR.complete_hint){
                if(CR.complete_hint.shown) {
                    TWEEN.remove(CR.complete_hint.complete_tip.show);
                    TWEEN.remove(CR.complete_hint.complete_tip.disappear);
                }
                CR.complete_hint.show = CR.complete_hint.shown = false;
            }
            CR.ctx.gaming.clearRect(0,0,CR.game_width, CR.height);
            CR.ctx.background.clearRect(0,0,CR.game_width, CR.height);
            CR.ctx.function.clearRect(0,0,CR.function_width, CR.height);
            break;
    }
};

function update(){
    TWEEN.update();
    CR.to_update.update();
    CR.draw();
    window.requestAnimationFrame(update);
}

CR.draw_start = function(){
    CR.ctx.start.clearRect(0,0,CR.start_width, CR.start_height);
    CR.sub_start.draw();
    CR.start_main.draw();
};

CR.draw_game = function(){
    if(!CR.stageCurtain.stage_changing) {
        CR.ctx.gaming.clearRect(0, 0, CR.game_width, CR.height);
        CR.ball_all.draw();
        CR.ctx.function.clearRect(0, 0, CR.function_width, CR.height);
        CR.ball_transformed.draw();
        CR.score_label.draw();
        CR.stage_congratulate_tip.draw();
        CR.stage_clear_tip_1.draw();
    }
};

CR.draw_effect = function(){
    CR.ctx.effects.clearRect(0, 0, CR.whole_width, CR.height);
    if(CR.stageCurtain.stage_changing) {
        CR.stageCurtain.draw();
        CR.stage_tip.draw();
    }
    if(CR.complete_hint.show){
        CR.complete_hint.draw();
    }
};