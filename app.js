//<=====================================wing flapping logic=====================================>

let gameOver = false;
let isGameStarted = false;

let birdBox = document.querySelector('.bird');
let birdPos = [birdBox.style.top, birdBox.style.left];
let groundContainer = document.querySelector('.groundContainer');
let wingPos = ['left', 'center', 'right'];
let wingIdx = 1;

let wingFlapSetIntervalRef = setInterval(() => {
    birdBox.style.backgroundPosition = `${wingPos[wingIdx = (wingIdx + 1) % wingPos.length]}`;
}, 100)

//<=========================================== Score ================================>

let maxScore = document.querySelector('#maxScore');
let currScore = document.querySelector('#currScore');

if (!localStorage.getItem('score')) {
    localStorage.setItem('score', 0);
}
else {
    maxScore.textContent = localStorage.getItem('score');
}

//function to increase score
function updateScore() {
    currScore.textContent = Number(currScore.textContent) + 1;
    maxScore.textContent = Math.max(Number(maxScore.innerHTML), Number(currScore.textContent));
    localStorage.setItem('score', maxScore.textContent);
}

let souldUpdateScore = true;
//function to check if an pipe is passed to increase score
function checkObjectPass(ele) {
    if (birdBox.getBoundingClientRect().left > ele.getBoundingClientRect().left && birdBox.getBoundingClientRect().right < ele.getBoundingClientRect().right && souldUpdateScore) {
        souldUpdateScore = false;
        updateScore();
    }
    else if (birdBox.getBoundingClientRect().left > ele.getBoundingClientRect().right && !souldUpdateScore) {
        souldUpdateScore = true;
    }
}

//<==========================================Game Over ====================================================>
function isOverlapping(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

function stopEverything() {
    gameOver = true;
    restart.style.scale = '1';
    clearInterval(fallSetIntervalRef);
    clearTimeout(jumpRef);
    clearTimeout(callFallSetTimeOut);
    clearInterval(wingFlapSetIntervalRef);
    clearInterval(comeObjRef);
    clearTimeout(newObjRef);

    birdBox.style.backgroundPosition = 'center';
    document.querySelectorAll('*').forEach(element => {
        element.style.animationPlayState = 'paused';
    });
    birdBox.style.filter = 'grayscale(100%)';
}

let playSection = document.querySelector('.playsection');
let playSectionIMG = document.querySelector('.playsection img');
function isGameOver() {
    if (birdBox.getBoundingClientRect().bottom >= groundContainer.getBoundingClientRect().top) {
        stopEverything();
        birdBox.style.top = `${playSection.clientHeight - birdBox.clientHeight}px`;
        birdBox.style.transform = 'rotate(0deg)';
        return true;
    }
    document.querySelectorAll('.topPipe').forEach((val, idx) => {
        if (isOverlapping(val, birdBox)) {
            stopEverything();
            if (birdBox.getBoundingClientRect().right - birdBox.clientWidth / 2 <= val.getBoundingClientRect().left) {
                birdBox.style.top = `${groundContainer.getBoundingClientRect().top - birdBox.clientHeight}px`;
            }
            else if (birdBox.getBoundingClientRect().right - birdBox.clientWidth / 2 > val.getBoundingClientRect().left) {
                birdBox.style.top = `${document.querySelectorAll('.bottomPipe')[idx].getBoundingClientRect().top - birdBox.clientHeight}px`;
            }
            return true;
        }
        checkObjectPass(val);
    });
    document.querySelectorAll('.bottomPipe').forEach(val => {
        if (isOverlapping(val, birdBox)) {
            stopEverything();
            if (birdBox.getBoundingClientRect().right - birdBox.clientWidth / 2 > val.getBoundingClientRect().left) {
                birdBox.style.top = `${val.getBoundingClientRect().top - birdBox.clientHeight}px`;
            }
            else if (birdBox.getBoundingClientRect().right - birdBox.clientWidth / 2 <= val.getBoundingClientRect().left) {
                birdBox.style.top = `${groundContainer.getBoundingClientRect().top - birdBox.clientHeight}px`;
            }
            return true;
        }
        checkObjectPass(val);
    });
    return false;
}

//<===========================================Jump and fall bird logic=============================================>

let deltaY = 30, accelaration = 1, birdTop, diff;
let transitionDuration = 200;   //mili-sec
let fallSetIntervalRef, callFallSetTimeOut;
let initialFallPos, jumpRef;

//function to keep bird in the play window
function birdRestriction(diff) {
    document.querySelectorAll('.bottomPipe').forEach(val => {
        if (isOverlapping(val, birdBox)) {
            return val.getBoundingClientRect().top() - birdBox.clientHeight;
        }
    });
    if (diff <= 10) return 10;
    else if (birdBox.getBoundingClientRect().bottom >= groundContainer.getBoundingClientRect().top)
        return playSection.clientHeight - birdBox.clientHeight;
    return diff;
}

//function ro apply jump logic for bird
function jump(e) {
    if (!isGameStarted) {
        isGameStarted = true;
        invokeObjects();
    }
    if (gameOver) return;
    //clear previous pending tasks
    jumpRef = setTimeout(() => {

        clearInterval(fallSetIntervalRef);
        clearTimeout(callFallSetTimeOut);

        //reset accelaration
        accelaration = 1;

        //get and set position of the bird;
        birdTop = Number((window.getComputedStyle(birdBox).top).replace('px', ''));
        diff = birdRestriction((birdTop - deltaY).toFixed());
        birdBox.style.top = `${diff}px`;
        initialFallPos = diff;

        //up-down bird animation must be
        birdBox.style.animation = 'none';

        //set transsition speed
        birdBox.style.transitionProparty = 'all';
        birdBox.style.transitionDuration = `${transitionDuration}ms`;
        birdBox.style.transform = `rotate(-25deg)`;

        //set timimg for fall the bird
        callFallSetTimeOut = setTimeout(() => {
            fall(e);
        }, transitionDuration);
    }, 4)
}

//function to apply falling logic for bird
function fall(e) {
    if (gameOver) return;
    //rotate bird 
    birdBox.style.transform = `rotate(0deg)`;

    //apply fall

    fallSetIntervalRef = setInterval(() => {
        birdTop = Number((window.getComputedStyle(birdBox).top).replace('px', ''));
        diff = birdRestriction((birdTop + deltaY).toFixed() * accelaration);

        if (diff - initialFallPos >= 200) {
            birdBox.style.transform = `rotate(45deg)`;
        }
        else if (diff - initialFallPos >= 100) {
            birdBox.style.transform = `rotate(25deg)`;
        }
        if (accelaration < 1.5) {
            accelaration += 0.01;
        }

        if (isGameOver()) {
            return;
        }
        birdBox.style.top = `${diff}px`;
    }, 80);
}

document.addEventListener('keydown', e => {
    if (e.key === " ") {
        e.stopPropagation();
        clearInterval(fallSetIntervalRef);
        jump(e);
    }
}, false);
document.addEventListener('click', jump);


//<================================================= Object logic ==========================================================>

let object = document.querySelector('.object');
let shouldAppend = true;

let firstObj = true;
let objecComeMax = 4000, objecComeMin = 3000;

let objectAdd = 0;
let newObjRef;

let comeObjRef;

//interval to apply object add and coming logic
function invokeObjects() {

    comeObjRef = setInterval(() => {
        if (isGameOver()) {
            return;
        }
        console.log('hi');

        if (firstObj) {
            firstObj = false;
            objectAdd = 0;
        }
        else
            objectAdd = Math.floor((Math.random() * (objecComeMax - objecComeMin + 1)) + objecComeMin);
        if (shouldAppend) {
            let newNode = document.createElement('div');
            let upperBound = playSection.clientHeight / 4;
            let lowerBound = -upperBound;
            let translateY = Math.floor((Math.random() * (upperBound - lowerBound + 1)) + lowerBound);
            newNode.classList.add('objChild');
            newNode.innerHTML =
                ` 
        <img src="./images/pipe.png" alt="pipe" decoding="async" loading="lazy" class="topPipe">
        <img src="./images/pipe.png" alt="pipe" decoding="async" loading="lazy" class="bottomPipe">
        `;
            shouldAppend = false;
            newObjRef = setTimeout(() => {
                newNode.style.setProperty('--translateY', `${translateY}px`);
                object.appendChild(newNode);
                shouldAppend = true;
            }, objectAdd);
        }
        try {
            let firstChild = object.children[0];
            if ((firstChild.getBoundingClientRect().right) - (firstChild.clientWidth / 3) < playSection.getBoundingClientRect().left) {
                object.removeChild(firstChild);
            }
        }
        catch (err) { }
    }, 100);

}

// invokeObjects();
//<==============================================pause====================================>


let restart = document.querySelector('.restart img');

restart.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    gameOver = false;
    isGameStarted = false;
    currScore.innerHTML = '0';
    object.innerHTML = '';

    birdBox.style.backgroundPosition = 'center';
    birdBox.style.top = `${playSection.clientHeight / 2}px`;
    birdBox.style.left = birdPos[1];
    birdBox.style.animation = 'upDown 800ms ease-in-out infinite';
    birdBox.style.filter = '';

    restart.style.scale = '0';
    document.querySelectorAll('*').forEach(element => {
        element.style.animationPlayState = 'running';
    });

    wingFlapSetIntervalRef = setInterval(() => {
        birdBox.style.backgroundPosition = `${wingPos[wingIdx = (wingIdx + 1) % wingPos.length]}`;
    }, 100)

    shouldAppend = true;
    firstObj = true;

}, false)