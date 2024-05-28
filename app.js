function playOn(birdCurrentImage) {
    let exit = false;
    //<===============================audio====================>
    let scorePointSound = document.querySelector('.point');
    let deadSound = document.querySelector('.dead');
    let flapSound = document.querySelector('.flap');
    // // let fallSound = document.querySelector('.fall');
    //<=====================================wing flapping logic=====================================>

    let gameOver = false;
    let isGameStarted = false;

    let birdBox = document.querySelector('.bird');
    let birdInnerBox = document.querySelectorAll('.birdInner');
    let birdPos = [birdBox.style.top, birdBox.style.left];
    let groundContainer = document.querySelector('.groundContainer');
    let wingPos = ['left', 'center', 'right'];
    let wingIdx = 1;
    let message = document.querySelector('.message img');
    let name = document.querySelector('.name');
    let bgInterval;
    birdBox.style.backgroundImage = `url('${birdCurrentImage}')`;

    let wingFlapSetIntervalRef = setInterval(() => {
        birdBox.style.backgroundPosition = `${wingPos[wingIdx = (wingIdx + 1) % wingPos.length]}`;
    }, 100);
    //<===========================================Life count====================================>
    let lifeArray = [];
    let lives = document.querySelectorAll('.life img');
    lives.forEach(val => {
        lifeArray.push(val);
    })
    let lifeIdx = lifeArray.length, shouldTakeLife = true;

    function resetForLife() {
        deadSound.play();
        clearInterval(fallSetIntervalRef);
        clearTimeout(jumpRef);
        clearTimeout(callFallSetTimeOut);
        if (shouldTakeLife) lifeIdx--;
        lifeArray[lifeIdx].style.filter = 'grayscale(100%)';
        if (lifeIdx <= 0) {
            return true;
        }
        shouldTakeLife = false;
        clearInterval(takeLifeInterval);
        takeLifeInterval = setInterval(() => {
            shouldTakeLife = true;
        }, 500);
        object.innerHTML = '';
        birdBox.style.top = `${document.querySelector('main').clientHeight / 2}px`;
        birdBox.style.left = birdPos[1];
        birdBox.style.filter = '';
        birdBox.style.transform = 'rotate(0deg)';
        birdBox.style.animation = "blink 0.15s infinite alternate";
        setTimeout(() => {
            birdBox.style.animation = "";
        }, 500);
        return false;
    }
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
        scorePointSound.play();
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

        restart.forEach(val => {
            val.style.scale = '1';
        })
        clearInterval(bgInterval);
        birdBox.style.backgroundPosition = 'center';
        document.querySelectorAll('*').forEach(element => {
            element.style.animationPlayState = 'paused';
        });
        birdBox.style.filter = 'grayscale(100%)';
    }

    let playSection = document.querySelector('.playsection');
    let playSectionIMG = document.querySelector('.playsection img');
    let takeLifeInterval;
    function isGameOver() {
        birdInnerBox.forEach(childTemp => {
            if (childTemp.getBoundingClientRect().bottom >= groundContainer.getBoundingClientRect().top) {
                if (resetForLife()) {
                    clearInterval(wingFlapSetIntervalRef);
                    clearInterval(comeObjRef);
                    clearTimeout(newObjRef);
                    stopEverything();
                    return true;
                }
            }
            document.querySelectorAll('.topPipe').forEach((val, idx) => {
                if (isOverlapping(val, childTemp)) {
                    if (resetForLife()) {
                        clearInterval(wingFlapSetIntervalRef);
                        clearInterval(comeObjRef);
                        clearTimeout(newObjRef);
                        stopEverything();
                        return true;
                    }
                }
                checkObjectPass(val);
            });
            document.querySelectorAll('.bottomPipe').forEach(val => {
                if (isOverlapping(val, childTemp)) {
                    if (resetForLife()) {
                        clearInterval(wingFlapSetIntervalRef);
                        clearInterval(comeObjRef);
                        clearTimeout(newObjRef);
                        stopEverything();
                        return true;
                    }
                }
                checkObjectPass(val);
            });
        })
        return false;
    }

    //<===========================================Jump and fall bird logic=============================================>

    let deltaY = 20, accelaration = 1, birdTop, diff;
    let transitionDuration = 200;   //mili-sec
    let fallSetIntervalRef, callFallSetTimeOut;
    let initialFallPos, jumpRef;
    let score = document.querySelector('.score');

    //function to keep bird in the play window
    function birdRestriction(diff) {
        document.querySelectorAll('.bottomPipe').forEach(val => {
            if (isOverlapping(val, birdBox)) {
                return val.getBoundingClientRect().top - birdBox.clientHeight;
            }
        });
        if (diff <= 10) return 10;
        else if (birdBox.getBoundingClientRect().bottom >= groundContainer.getBoundingClientRect().top)
            return playSection.clientHeight - birdBox.clientHeight;
        return diff;
    }

    //function ro apply jump logic for bird
    let livesParent = document.querySelector('.life');
    function jump(e) {
        if (!isGameStarted) {
            livesParent.style.scale = '1';
            isGameStarted = true;
            message.style.scale = '0';
            message.style.opacity = '0';
            score.style.scale = '1';
            name.style.display = 'none';
            invokeObjects();

        }
        if (gameOver || isGameOver()) return;

        flapSound.currentTime = 0;
        flapSound.play();
        jumpRef = setTimeout(() => {

            //clear previous pending tasks
            clearInterval(fallSetIntervalRef);
            clearTimeout(callFallSetTimeOut);

            //reset accelaration
            accelaration = 1;

            //get and set position of the bird;
            birdTop = Number((window.getComputedStyle(birdBox).top).replace('px', ''));
            diff = birdRestriction((birdTop - deltaY).toFixed()) * 0.9;
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
            diff = Math.min(birdRestriction((birdTop + 30).toFixed() * accelaration), playSection.clientHeight - birdBox.clientHeight);
            if (isGameOver()) {
                return;
            }

            if (diff - initialFallPos >= 200) {
                birdBox.style.transform = `rotate(45deg)`;
            }
            else if (diff - initialFallPos >= 100) {
                birdBox.style.transform = `rotate(25deg)`;
            }
            if (accelaration < 1.15) accelaration += 0.05;
            birdBox.style.top = `${diff}px`;
        }, 100);
    }

    document.addEventListener('keydown', e => {
        if (e.key === " " && shouldTakeLife) {
            e.stopPropagation();
            clearInterval(fallSetIntervalRef);
            jump(e);
        }
    }, false);
    document.addEventListener('touchstart', e => {
        if (shouldTakeLife) jump(e);
    });

    //<================================================= Object logic ==========================================================>

    let object = document.querySelector('.object');
    let shouldAppend = true;

    let firstObj = true;
    let objecComeMax = 2000, objecComeMin = 1700;

    let objectAdd = 0;
    let newObjRef;

    let comeObjRef;

    //interval to apply object add and coming logic
    function invokeObjects() {

        comeObjRef = setInterval(() => {
            if (isGameOver()) {
                return;
            }

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
                    if (gameOver) {
                        clearTimeout(newObjRef);
                        return;
                    }
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

    function playAgain(e) {
        e.preventDefault();
        e.stopPropagation();
        currScore.innerHTML = '0';
        object.innerHTML = '';
        message.style.scale = '1';
        livesParent.style.scale = '0';
        message.style.opacity = '1';
        score.style.scale = '0';
        name.style.display = 'block';

        birdBox.style.backgroundPosition = 'center';
        birdBox.style.top = `${document.querySelector('main').clientHeight / 2}px`;
        birdBox.style.left = birdPos[1];
        birdBox.style.animation = 'upDown 800ms ease-in-out infinite';
        birdBox.style.filter = '';

        restart.forEach(val => {
            val.style.scale = '0';
        })
        document.querySelectorAll('*').forEach(element => {
            element.style.animationPlayState = 'running';
        });

        lives.forEach(val => {
            val.style.filter = "";
        })
        lifeIdx = lifeArray.length;

        document.querySelector('.playOn').style.display = 'none';
        document.querySelector('.menu').style.display = 'flex';
        exit = true;
    }

    let restart = document.querySelectorAll('.restart img');
    document.addEventListener('keydown', e => {
        if (gameOver && e.keyCode == 13) playAgain(e);
    }, false);
    restart[1].addEventListener('click', playAgain, false);
    if (exit) return;

    //<==============================bg change ====================================>
    let bgImg = document.querySelectorAll('.playsection img')[1];
    function bgChange() {
        bgInterval = setInterval(() => {
            if (window.getComputedStyle(bgImg).opacity == '1') {
                bgImg.style.opacity = '0';
            }
            else {
                bgImg.style.opacity = '1';
            }
        }, 10000);
    }
    bgChange();
}

function menu() {
    let allBirdBgImg = ['./images/bird/bird.png', './images/bird/rainbowBird.png', './images/bird/goldenBird.png', './images/bird/whiteBird.png', './images/bird/blueBird.png', './images/bird/blackBird.png', './images/bird/greenBird.png'];
    let allBirdBgImgIndex = 0;
    let wingPosMenuBird = ['left', 'center', 'right'];
    let wingIdxMenuBird = 1;
    let birdImages = document.querySelector('.birdImg');

    birdImages.style.backgroundImage = `url('${allBirdBgImg[allBirdBgImgIndex]}')`;

    setInterval(() => {
        birdImages.style.backgroundPosition = `${wingPosMenuBird[wingIdxMenuBird = (wingIdxMenuBird + 1) % wingPosMenuBird.length]}`;
    }, 100);
    let start = document.querySelector('.start');

    let leftBtn = document.querySelector('.birdContainer .left');
    let rightBtn = document.querySelector('.birdContainer .right');

    rightBtn.addEventListener('click', () => {
        allBirdBgImgIndex = (allBirdBgImgIndex + 1) % allBirdBgImg.length;
        birdImages.style.backgroundImage = `url('${allBirdBgImg[allBirdBgImgIndex]}')`;
    });
    leftBtn.addEventListener('click', () => {
        allBirdBgImgIndex--;
        if (allBirdBgImgIndex < 0) allBirdBgImgIndex = allBirdBgImg.length - 1
        birdImages.style.backgroundImage = `url('${allBirdBgImg[allBirdBgImgIndex]}')`;
    });

    //<========================================================hat section=========================================================>

    let hatShop = document.querySelector('.hatShop');
    let hatList = document.querySelector('.hatList');
    let hatCross = document.querySelector('.cross');
    hatShop.addEventListener('click', e => {
        hatList.style.scale = '1';
    });
    hatCross.addEventListener('click', e => {
        hatList.style.scale = '0';
    });
    let hatCurrent = document.querySelectorAll('.hat');
    let allHats = document.querySelectorAll('.hatbox');
    allHats.forEach(hats => {
        hats.addEventListener('click', e => {
            hatCurrent.forEach(hat => {
                let hatSrc = hats.childNodes[1].getAttribute('src');
                hat.style.backgroundImage = `url('${hatSrc}')`;
            });
            hatList.style.scale = '0';
        })
    })
    //<========================================================mouth section=========================================================>

    let mouthShop = document.querySelector('.mouthShop');
    let mouthList = document.querySelector('.mouthList');
    let mouthCross = document.querySelector('.mouthCross');
    mouthShop.addEventListener('click', e => {
        mouthList.style.scale = '1';
    });
    mouthCross.addEventListener('click', e => {
        mouthList.style.scale = '0';
    });
    let mouthCurrent = document.querySelectorAll('.mouth');
    let mouthBox = document.querySelectorAll('.mouthbox');
    mouthBox.forEach(mouths => {
        mouths.addEventListener('click', e => {
            mouthCurrent.forEach(mouth => {
                let mouthSrc = mouths.childNodes[1].getAttribute('src');
                mouth.style.backgroundImage = `url('${mouthSrc}')`;
            });
            mouthList.style.scale = '0';
        })
    })

    //<==========================================================start game===========================================================>
    start.addEventListener('click', e => {
        document.querySelector('.playOn').style.display = 'block';
        document.querySelector('.menu').style.display = 'none';
        //start play
        playOn(allBirdBgImg[allBirdBgImgIndex]);
    });



}
menu();