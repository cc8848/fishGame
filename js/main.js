var can1 = document.querySelector("#canvas1"),
    ctx1 = can1.getContext('2d');
var can2 = document.querySelector("#canvas2"),
    ctx2 = can2.getContext('2d');
var canWidth = can2.width,
    canHeight = can2.height;
var x = can1.getBoundingClientRect().left,
    y = can1.getBoundingClientRect().top;
var lastTime = 0,
    deltaTime = 0;
var bgPic = new Image();
var ane = null,
    fruit = null;
var mom = null,
    baby = null;

var mx = canWidth * 0.5,
    my = canHeight * 0.5;
var data = null;

var wave = null;
var halo = null;

var dust = null;

window.addEventListener("load", init, false);
//初始化
function init() {
    ctx1.fillStyle = "#fff";
    ctx1.font = "20px Verdana";
    ctx1.textAlign = "center";
    bgPic.src = "images/background.jpg";
    ane = new aneObj();
    ane.init();
    fruit = new fruitObj();
    fruit.init();

    mom = new momObj();
    mom.init();

    baby = new babyObj();
    baby.init();

    data = new dataObj();

    wave = new waveObj(0);
    wave.init();
    halo = new waveObj(1);
    halo.init();

    dust = new dustObj();
    dust.init();

    lastTime = Date.now();
    gameloop();
}

function gameloop() {
    requestAnimationFrame(gameloop);
    var now = Date.now();
    deltaTime = now - lastTime;
    lastTime = now;
    if(deltaTime > 40) {
        deltaTime = 40;
    }

    ctx2.clearRect(0, 0, canWidth, canHeight);
    drawBackground();
    ane.draw();
    fruit.fruitMonitor();
    fruit.draw();
    ctx1.clearRect(0, 0, canWidth, canHeight);
    mom.draw();
    baby.draw();
    momFruitsCollision();
    momBabyCollision();

    data.draw();

    wave.draw();
    halo.draw();

    dust.draw();

}
//绘制背景
function drawBackground() {
    ctx2.drawImage(bgPic, 0, 0, canWidth, canHeight);
}
//绘制海葵
var aneObj = function() {
    this.rootx = [];
    this.headx = [];
    this.heady = [];
    this.amp = [];
    this.alpha = 0;
};

aneObj.prototype.num = 50;

aneObj.prototype.init = function() {
    for(var i = 0; i < this.num; i++) {
        this.rootx[i] = i * 16 + Math.random() * 20;
        this.headx[i] = this.rootx[i];
        this.heady[i] = canHeight - 250 + Math.random() * 50;
        this.amp[i] = Math.random() * 50 + 50;
    }
};
aneObj.prototype.draw = function() {
    this.alpha += deltaTime * 0.0008;
    var l = Math.sin(this.alpha);
    ctx2.save();
    ctx2.globalAlpha = 0.6;
    ctx2.lineWidth = 20;
    ctx2.lineCap = "round";
    ctx2.strokeStyle = "#3b154e";
    for(var i = 0; i < this.num; i++) {
        ctx2.beginPath();
        ctx2.moveTo(this.rootx[i], canHeight);
        this.headx[i] = this.rootx[i] + l * this.amp[i];
        ctx2.quadraticCurveTo(this.rootx[i], canHeight - 100, this.headx[i], this.heady[i]);
        ctx2.stroke();
    }
    ctx2.restore();
};
//绘制果实
var fruitObj = function() {
    this.alive = [];
    this.x = [];
    this.y = [];
    this.aneNO = [];
    this.l = [];
    this.spd = [];
    this.fruitType = [];
    this.orange = new Image();
    this.blue = new Image();
};
fruitObj.prototype.num = 30;
fruitObj.prototype.init = function() {
    for(var i = 0; i < this.num; i++) {
        this.alive[i] = !1;
        this.x[i] = 0;
        this.y[i] = 0;
        this.aneNO[i] = 0;
        this.spd[i] = Math.random() * 0.017 + 0.003;
        this.fruitType[i] = "";
    }
    this.orange.src = "images/fruit.png";
    this.blue.src = "images/blue.png";
};
fruitObj.prototype.draw = function() {
    // this.fruitMonitor();
    for(var i = 0; i < this.num; i++) {
        if(this.alive[i]) {
            var pic = this.fruitType[i] == "blue" ? this.blue : this.orange;
            if(this.l[i] <= this.orange.width) {
                this.l[i] += this.spd[i] * deltaTime;
                this.x[i] = ane.headx[this.aneNO[i]];
                this.y[i] = ane.heady[this.aneNO[i]];
            } else {
                this.y[i] -= this.spd[i] * 7 * deltaTime;
            }
            ctx2.drawImage(pic, this.x[i] - this.l[i] * 0.5, this.y[i] - this.l[i] * 0.5, this.l[i], this.l[i]);
            if(this.y[i] <= -this.orange.height) {
                this.alive[i] = !1;
            }
        }
    }
};
fruitObj.prototype.born = function(i) {
    this.aneNO[i] = Math.floor(Math.random() * ane.num) + 1;
    this.l[i] = 0;
    this.alive[i] = !0;
    var ran = Math.random();
    this.fruitType[i] = ran < 0.2 ? "blue" : "orange";
};
fruitObj.prototype.fruitMonitor = function() {
    var num = 0;
    for(var i = 0; i < this.num; i++) {
        if(this.alive[i]) {
            num++;
        }
    }
    if(num < 15) {
        this.sendFruit();
        return;
    }
}
fruitObj.prototype.sendFruit = function() {
    for(var i = 0; i < this.num; i++) {
        if(!this.alive[i]) {
            this.born(i);
            return;
        }
    }
}
//绘制大鱼
var momObj = function() {
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.bigEye = [];
    this.bigBodyOra = [];
    this.bigBodyBlue = [];
    this.bigTail = [];
    this.bigTailTimer = 0;
    this.bigTailCount = 0;

    this.bigEyeTimer = 0;
    this.bigEyeCount = 0;
    this.bigEyeInterval = 1000;

    this.bigBobyCount = 0;
}
momObj.prototype.init = function() {
    this.x = canWidth * 0.5;
    this.y = canHeight * 0.5;
    for(var i = 0; i < 8; i++) {
        this.bigTail[i] = new Image();
        this.bigTail[i].src = "images/bigTail" + i + ".png";
    }
    for(var i = 0; i < 2; i++) {
        this.bigEye[i] = new Image();
        this.bigEye[i].src = "images/bigEye" + i + ".png";
    }
    for(var i = 0; i < 8; i++) {
        this.bigBodyOra[i] = new Image();
        this.bigBodyOra[i].src = "images/bigSwim" + i + ".png";
        this.bigBodyBlue[i] = new Image();
        this.bigBodyBlue[i].src = "images/bigSwimBlue" + i + ".png";
    }
}
momObj.prototype.draw = function() {
    this.x = lerpDistance(mx, this.x, 0.98);
    this.y = lerpDistance(my, this.y, 0.98);

    var deltaX = this.x - mx;
    var deltaY = this.y - my;
    var beta = Math.atan2(deltaY, deltaX);
    this.angle = lerpAngle(beta, this.angle, 0.6);

    this.bigTailTimer += deltaTime;
    if(this.bigTailTimer > 50) {
        this.bigTailCount = (this.bigTailCount + 1) % 8;
        this.bigTailTimer %= 50;
    }

    this.bigEyeTimer += deltaTime;
    if(this.bigEyeTimer > this.bigEyeInterval) {
        this.bigEyeCount = (this.bigEyeCount + 1) % 2;
        this.bigEyeTimer %= this.bigEyeInterval;

        if(this.bigEyeCount == 0) {
            this.bigEyeInterval = Math.random() * 1500 + 2000;
        } else {
            this.bigEyeInterval = 200;
        }
    }

    var pic = data.double == 1 ? this.bigBodyOra[this.bigBobyCount] : this.bigBodyBlue[this.bigBobyCount];

    ctx1.save();
    ctx1.translate(this.x, this.y);
    ctx1.rotate(this.angle);
    ctx1.drawImage(pic, -pic.width * 0.5, -pic.height * 0.5);
    ctx1.drawImage(this.bigEye[this.bigEyeCount], -this.bigEye[this.bigEyeCount].width * 0.5, -this.bigEye[this.bigEyeCount].height * 0.5);
    ctx1.drawImage(this.bigTail[this.bigTailCount], -this.bigTail[this.bigTailCount].width * 0.5 + 30, -this.bigTail[this.bigTailCount].height * 0.5);
    ctx1.restore();
}

//大鱼跟随鼠标
can1.addEventListener("mousemove", onMouseMove, false);

function onMouseMove(e) {
    if(!data.gameOver) {
        mx = e.pageX - x;
        my = e.pageY - y;
    }
}

//判断大鱼和果实的距离
function momFruitsCollision() {
    if(!data.gameOver) {
        for(var i = 0; i < fruit.num; i++) {
            if(fruit.alive[i]) {
                var l = calLength2(fruit.x[i], fruit.y[i], mom.x, mom.y);
                if(l < 900) {
                    fruit.alive[i] = !1;

                    mom.bigBobyCount++;
                    if(mom.bigBobyCount > 7) {
                        mom.bigBobyCount = 7;
                    }

                    data.fruitNum++;
                    if(fruit.fruitType[i] == "blue") {
                        data.double = 2;
                    } else {
                        data.double = 1;
                    }
                    wave.born(fruit.x[i], fruit.y[i]);
                }
            }
        }
    }

}

//绘制小鱼
var babyObj = function() {
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.babyBody = [];
    this.babyTail = [];
    this.babyEye = [];
    this.babyTailTimer = 0;
    this.babyTailCount = 0;
    this.babyEyeTimer = 0;
    this.babyEyeCount = 0;
    this.babyEyeInterval = 1000;
    this.babyBodyTimer = 0;
    this.babyBodyCount = 0;
}
babyObj.prototype.init = function() {
    this.x = canWidth * 0.5 - 50;
    this.y = canHeight * 0.5 + 50;
    this.babyBody.src = "images/babyFade0.png";
    for(var i = 0; i < 8; i++) {
        this.babyTail[i] = new Image();
        this.babyTail[i].src = "images/babyTail" + i + ".png";
    }
    for(var i = 0; i < 2; i++) {
        this.babyEye[i] = new Image();
        this.babyEye[i].src = "images/babyEye" + i + ".png";
    }
    for(var i = 0; i < 20; i++) {
        this.babyBody[i] = new Image();
        this.babyBody[i].src = "images/babyFade" + i + ".png";
    }
}
babyObj.prototype.draw = function() {
    this.x = lerpDistance(mom.x, this.x, 0.98);
    this.y = lerpDistance(mom.y, this.y, 0.98);

    var deltaX = this.x - mom.x;
    var deltaY = this.y - mom.y;
    var beta = Math.atan2(deltaY, deltaX);
    this.angle = lerpAngle(beta, this.angle, 0.6);

    this.babyTailTimer += deltaTime;
    if(this.babyTailTimer > 50) {
        this.babyTailCount = (this.babyTailCount + 1) % 8;
        this.babyTailTimer %= 50;
    }

    this.babyEyeTimer += deltaTime;
    if(this.babyEyeTimer > this.babyEyeInterval) {
        this.babyEyeCount = (this.babyEyeCount + 1) % 2;
        this.babyEyeTimer %= this.babyEyeInterval;

        if(this.babyEyeCount == 0) {
            this.babyEyeInterval = Math.random() * 1500 + 2000;
        } else {
            this.babyEyeInterval = 200;
        }
    }

    this.babyBodyTimer += deltaTime;
    if(this.babyBodyTimer > 300) {
        this.babyBodyCount++;
        this.babyBodyTimer %= 300;
        if(this.babyBodyCount > 19) {
            this.babyBodyCount = 19;
            data.gameOver = true;
        }
    }

    ctx1.save();
    ctx1.translate(this.x, this.y);
    ctx1.rotate(this.angle);
    ctx1.drawImage(this.babyBody[this.babyBodyCount], -this.babyBody[this.babyBodyCount].width * 0.5, -this.babyBody[this.babyBodyCount].height * 0.5);
    ctx1.drawImage(this.babyEye[this.babyEyeCount], -this.babyEye[this.babyEyeCount].width * 0.5, -this.babyEye[this.babyEyeCount].height * 0.5);
    ctx1.drawImage(this.babyTail[this.babyTailCount], -this.babyTail[this.babyTailCount].width * 0.5 + 24, -this.babyTail[this.babyTailCount].height * 0.5);
    ctx1.restore();
}

//判断大鱼和小鱼的距离
function momBabyCollision() {
    if(data.fruitNum > 0 && !data.gameOver) {
        var l = calLength2(mom.x, mom.y, baby.x, baby.y);
        if(l < 900) {
            baby.babyBodyCount = 0;
            mom.bigBobyCount = 0;
            data.addScore();
            halo.born(baby.x, baby.y);
        }
    }
}

//计数
var dataObj = function() {
    this.fruitNum = 0;
    this.double = 1;
    this.score = 0;
    this.gameOver = false;
    this.alpha = 0;
}
dataObj.prototype.reset = function() {
    this.fruitNum = 0;
    this.double = 1;
}
dataObj.prototype.draw = function() {
    ctx1.save();
    ctx1.shadowBlur = 10;
    ctx1.shadowColor = "#fff";
    ctx1.fillText("SCORE: " + this.score, canWidth * 0.5, 80);
    if(this.gameOver) {
        this.alpha += deltaTime * 0.0005;
        if(this.alpha > 1) {
            this.alpha = 1;
        }
        ctx1.fillStyle = "rgba(255,255,255," + this.alpha + ")";
        ctx1.fillText("GAMEOVER", canWidth * 0.5, canHeight * 0.5);
    }
    ctx1.restore();
}
dataObj.prototype.addScore = function() {
    this.score += this.fruitNum * 100 * this.double;
    this.reset();
}

//画圈动画
/**
 *
 * @param {0:大鱼吃果实,1:大鱼喂小鱼} type
 */
var waveObj = function(type) {
    this.x = [];
    this.y = [];
    this.alive = [];
    this.r = [];
    this.type = type;
}
waveObj.prototype.num = 10;
waveObj.prototype.init = function() {
    for(var i = 0; i < this.num; i++) {
        this.alive[i] = false;
        this.r[i] = 0;
    }
}
waveObj.prototype.draw = function() {
    ctx1.save();
    ctx1.lineWidth = 2;
    ctx1.shadowBlur = 10;
    ctx1.shadowColor = "#fff";
    if(this.type === 0) {
        ctx1.shadowColor = "#fff";
    } else {
        ctx1.shadowColor = "rgba(203,91,0,1)";
    }
    for(var i = 0; i < this.num; i++) {
        if(this.alive[i]) {
            this.r[i] += deltaTime * 0.04;
            if(this.r[i] > 50) {
                this.alive[i] = false;
                continue;
            }
            var alpha = 1 - this.r[i] / 50;
            ctx1.beginPath();
            ctx1.arc(this.x[i], this.y[i], this.r[i], 0, Math.PI / 180 * 360);
            if(this.type === 0) {
                ctx1.strokeStyle = "rgba(255,255,255," + alpha + ")";
            } else {
                ctx1.strokeStyle = "rgba(203,91,0," + alpha + ")";
            }
            ctx1.stroke();
        }
    }
    ctx1.restore();
}
waveObj.prototype.born = function(x, y) {
    for(var i = 0; i < this.num; i++) {
        if(!this.alive[i]) {
            this.alive[i] = true;
            this.r[i] = 20;
            this.x[i] = x;
            this.y[i] = y;
            return;
        }
    }
}
//漂浮物
var dustObj = function() {
    this.x = [];
    this.y = [];
    this.amp = [];
    this.NO = [];
    this.alpha = 0;
    this.dustPic = [];
}
dustObj.prototype.num = 30;
dustObj.prototype.init = function() {
    for(var i = 0; i < 7; i++) {
        this.dustPic[i] = new Image();
        this.dustPic[i].src = "images/dust" + i + ".png";
    }
    for(var i = 0; i < this.num; i++) {
        this.x[i] = Math.random() * canWidth;
        this.y[i] = Math.random() * canHeight;
        this.amp[i] = Math.random() * 15 + 25;
        this.NO[i] = Math.floor(Math.random() * 7);
    }
}
dustObj.prototype.draw = function() {
    this.alpha += deltaTime * 0.0008;
    var l = Math.sin(this.alpha);
    for(var i = 0; i < this.num; i++) {
        ctx1.drawImage(this.dustPic[this.NO[i]], this.x[i] + this.amp[i] * l, this.y[i]);
    }
}
