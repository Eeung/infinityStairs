console.log("start");

let $Stairs = new Array();
let $score = document.getElementById("current");
let $best = document.getElementById("best");
let $health = document.querySelector("#remained.health");

let highest_stair = {"direction":-1,"height":13,"index":-1};
let player_direction = -1;  //수직선 방향(-1 = 왼쪽, 1 = 오른쪽)
let TURN_CHANCE = 20;   //계단의 회전 확률
let stair_arr = [
    undefined,undefined,undefined,undefined,undefined,
    undefined,undefined,undefined,undefined,undefined,
    undefined,undefined,undefined,undefined,undefined,
    undefined,undefined
];  //각 높이의 계단의 x좌표
let PLAYER_Y = 14;

function copy(object){
    return JSON.parse(JSON.stringify(object));
}

class Main {
    constructor(){
        this.stair = new Stair();
        this.user = new User();
        this.score = new Score();
        this.health = new Health();

        addEventListener("keydown",this.bindKeyEvent);
        setTimeout(() => {
           addEventListener("keydown", main.bindStart) 
        }, 0);

        this.score.getBestScore();
        this.gameOverDiv = undefined;
        this.damageId = undefined;
    }

    bindKeyEvent(e){
        console.log(e.code);
        switch(e.code){
        case "Space":
            main.user.turn();
        case "ArrowDown":
            main.user.goAhead();
            main.stair.updateStairs();
            if(main.user.checkOnGround()) 
                main.gameover()
            else {
                main.score.updateScore();
                main.health.heal();
            }
        }
    }
    bindStart(e){
        switch(e.code){
        case "ArrowDown":
            main.damageId = setInterval(() => {
               if(main.health.damage())
                    main.gameover(); 
            }, 10);

            removeEventListener("keydown",main.bindStart);
        }
    }
    gameover(){
        removeEventListener("keydown", this.bindKeyEvent);
        clearInterval(main.damageId);
        this.gameOverDiv = document.createElement("div");
        this.gameOverDiv.classList.add('gameover-background');
        document.body.appendChild(this.gameOverDiv);
        let message = document.createElement('div');
        message.classList.add('gameover-message');

        let title = document.createElement('h1');
        title.classList.add('gameover-title');
        title.innerText = "떨어졌습니다!";
        let contentBox = document.createElement('div');
        contentBox.style.display = 'flex';
        contentBox.style.alignItems = 'center';
        contentBox.style.justifyContent = "center";
        let keyBox = document.createElement('div');
        keyBox.classList.add('gameover-keyBox');
        keyBox.innerText = "F5";
        let content = document.createElement('h2');
        content.classList.add('gameover=content');
        content.innerText = "새 게임을 시작하려면";

        contentBox.append(keyBox,content);
        message.append(title,contentBox);
        this.gameOverDiv.append(message);
        setTimeout(() => {
            main.user.dropPlayer();
        }, 300);
        setTimeout(() => {
            main.score.setBestScore();
        }, 1);
    }
}

class User{
    constructor(){
    }
    goAhead(){
        stair_arr.pop();
        stair_arr.unshift(highest_stair.index);
        highest_stair.index += highest_stair.direction;

        if(Math.random()*100<TURN_CHANCE)
            highest_stair.direction *= -1; // 20%로 계단 생성의 방향 전환

        highest_stair.index -= player_direction;

        for(let i=0;i<17;i++)
            if(stair_arr[i] != undefined)
                stair_arr[i] -= player_direction;
    }
    turn(){
        player_direction *= -1;
        if(player_direction == -1){
            document.getElementById("player").classList.remove("right");
            document.getElementById("player").classList.add("left");
        } else if (player_direction == 1){
            document.getElementById("player").classList.remove("left");
            document.getElementById("player").classList.add("right");
        }
    }
    checkOnGround() {
        if(stair_arr[PLAYER_Y] != 0)
            return true;
    }
    dropPlayer(){
        document.getElementById("player").classList.add("drop");
    }
}

class Stair{
    constructor(){
        this.createGrid();
    }
    updateStairs(){
        for(let i=0;i<17;i++){
            for(let j=0;j<7;j++)
                $Stairs[i][j].classList.remove("activate");
            
            if(Math.abs(stair_arr[i])<4)
                $Stairs[i][stair_arr[i]+3].classList.add("activate");
        }
    }
    createGrid(){
        let $board = document.getElementById('board');
        for(let r=0;r<17;r++){
            let tr = document.createElement('tr');
            let temp = new Array();
            for(let c=0;c<7;c++){
                let td = document.createElement('td');
                let created = document.createElement('div');
                temp.push(created);
                created.classList.add('stair');
                created.column = c;
                created.row = r;
                td.appendChild(created);

                tr.appendChild(td);
            }
            $Stairs.push(temp);
            $board.appendChild(tr);
        }
        this.createStair(true);
    }
    createStair(isFirst){
        if(isFirst){
            for(let i=0;i<3;i++){
                $Stairs[highest_stair.height][highest_stair.index+3].classList.add("activate");
                stair_arr[highest_stair.height--] = highest_stair.index--;
            }
        }

        do{
            if(Math.random()*100 < TURN_CHANCE)
                highest_stair.direction *= -1;

            stair_arr[highest_stair.height] = highest_stair.index;
            let $index = highest_stair.index+3;
            highest_stair.index+=highest_stair.direction;
            if($index<0 || $index>6) continue;
            else $Stairs[highest_stair.height][$index].classList.add("activate");
        } while(highest_stair.height--);
        highest_stair.height = 0;
    }
}

class Health{
    constructor(){
        this.current_health = 50000;
    }
    heal(){
        this.current_health += 5500;
        this.current_health = this.current_health>50000 ? 50000 : this.current_health;
        this.updateHealth();
    }
    damage(){
        let score = JSON.parse($score.innerText);
        if(this.current_health<=0) return true;

        if(score<110){  //(0,33.3),(10,100) y = 6.67x+33.3
            this.current_health -= 6.67*Math.floor(score/10)+33.3;
            //33.3~100 (15초~5초)
        } else if(score<1010){  //(10.100),(100.357.1) y = 6.67x+33.3
            this.current_health -= 2.86*Math.floor(score/10)+71.1;
            //100~357.1 (5초~1.4초)
        } else if(score<2010){
            this.current_health -= 357.1;   //1.4초
        } else {
            this.current_health -= 384.6;   //1.3초
        }
        this.updateHealth();
    }
    updateHealth(){
        $health.style.width = this.current_health/100;
    }
}

class Score{
    constructor(){
        this.score = 0;
        this.best_score = localStorage.getItem("io.github.eeung.infinityStairs.bestScore");
        this.best_player = localStorage.getItem("io.github.eeung.infinityStairs.bestPlayer");
    }
    updateScore(){
        $score.innerText = ++this.score;
    }
    getBestScore(){
        this.best_score = this.best_score==undefined ? 0 : this.best_score;
        this.best_player = this.best_player==undefined || this.best_player=="null" || this.best_player==""? "" : " by " + this.best_player;
        $best.innerText = this.best_score + this.best_player;
    }
    setBestScore(){
        let score = JSON.parse($score.innerText);
        if(this.best_score<score){
            localStorage.setItem("io.github.eeung.infinityStairs.bestScore",score);
            localStorage.setItem("io.github.eeung.infinityStairs.bestPlayer", prompt('신기록!\n닉네임을 입력하세요.'));
        }
    }
}
let main = new Main();