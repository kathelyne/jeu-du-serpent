window.onload = () => {
    var canvasWidth = 900, // creation du canvas
        canvasHeight = 600,
        blockSize = 30, // tailles des bloque
        ctx, // creation de la variable contexte
        delay = 150, // creation de la variabelde temps
        snakee, // creation del a vairable du serpent du debut
        applee, // variable de la pomme
        widthInBlocks = canvasWidth / blockSize, // creation de block de canvas
        heightInBlocks = canvasHeight / blockSize,
        score,
        timeOut;

    class Apple {
        constructor(position) {
            this.position = position;
            this.draw = function() {

                ctx.beginPath();
                var radius = blockSize / 2,
                    x = this.position[0] * blockSize + radius,
                    y = this.position[1] * blockSize + radius;
                ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
                ctx.strokeStyle = "green";
                ctx.lineWidth = "8";
                ctx.stroke();
                ctx.save();
                ctx.restore();
            };
            this.setNewPosition = () => {
                var newX = Math.round(Math.random() * (widthInBlocks - 1));
                var newY = Math.round(Math.random() * (heightInBlocks - 1));
                this.position = [newX, newY]; // nouvelle position de la pomme aléatoirement
            };
            this.isOnSnake = (snakeToCheck) => {
                var isOnSnake = false;

                for (var i = 0; i < snakeToCheck.body.length; i++) {
                    if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) { // verifier si la pomme ce replace à un endroit du corps du serpent
                        isOnSnake = true;
                    }
                }
                return isOnSnake;
            }
        }
    }


    // prototype du serpent
    class Snake {
        constructor(body, direction) {
            this.body = body;
            this.direction = direction;
            this.ateApple = false;



            this.draw = () => { // methode de class
                ctx.save(); // sauvegardé le contexte 
                ctx.fill = "red";
                for (var i = 0; i < this.body.length; i++) { // refaire en fonction fléché
                    drawBlock(ctx, this.body[i]);
                }
                ctx.restore();

            };
            this.advance = () => {

                var nextPosition = this.body[0].slice();
                switch (this.direction) {
                    case "left":
                        nextPosition[0]--; // direction de la tete seulement 
                        break;

                    case "right":
                        nextPosition[0]++;
                        break;

                    case "up":
                        nextPosition[1]--;
                        break;

                    case "down":
                        nextPosition[1]++;
                        break;
                    default:
                        throw ("invalide direction");
                }

                this.body.unshift(nextPosition);
                if (!this.ateApple) {
                    this.body.pop(); // si le serpent a mangé une pomme je supprime pas le dernier element du corps du serpent
                } else {
                    this.ateApple = false; //pour rajouté qu'un seul block à la fois, et pas indéfiniment
                }

            };
            this.setDirection = function(newDirection) { // /!\ les direction sont restreinte, le serpent ne peux pas reculer
                var allowedDirection;
                switch (this.direction) {
                    case "left":
                    case "right":
                        allowedDirection = ["up", "down"];
                        break;
                    case "down":
                    case "up":
                        allowedDirection = ["left", "right"];
                        break;
                    default:
                        throw ("invalidation direction")
                }
                if (allowedDirection.indexOf(newDirection) > -1) { // si la nouvelle direction 
                    this.direction = newDirection;

                }
            };
            // creation des contrainte de déplacement : mur et corp du serpent
            this.checkCollision = () => {
                var wallCollision = false,
                    snakeCollision = false,
                    head = this.body[0], // tete du serpent
                    rest = this.body.slice(1), // corps du serpent
                    snakeX = head[0],
                    snakeY = head[1],
                    minX = 0,
                    minY = 0,
                    maxX = widthInBlocks - 1,
                    maxY = heightInBlocks - 1,
                    isNotBeetweenHorizontalWalls = snakeX < minX || snakeX > maxX,
                    isNotBeetweenVerticalWalls = snakeY < minY || snakeY > maxY;

                if (isNotBeetweenHorizontalWalls || isNotBeetweenVerticalWalls) {
                    wallCollision = true; // verification que le serpent ne c'est pas pris un mur
                };
                for (var i = 0; i < rest.length; i++) {
                    if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
                        snakeCollision = true; // verification de collision de serpent entre le corps et la tete 
                    }
                }
                return wallCollision || snakeCollision;


            };
            this.isEatingApple = (appleToEat) => { // le serpent à t'in mangé la pomme?
                var head = this.body[0];
                if (head[0] === appleToEat.position[0] /*si la position de la tete -du premier bloc, celui en position x=0 - corespond à la position x de la pomme  x*/ && head[1] === appleToEat.position[1]) /* idem pour position du y*/ {
                    return true;
                } else { return false; };
            }
        };
    }



    function init() {
        var canvas;
        canvas = document.createElement("canvas"); // création d'un élement type canvas
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid gray";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas); // accroche le canvas au body
        ctx = canvas.getContext('2d');
        snakee = new Snake([
            [6, 4],
            [5, 4],
            [4, 4],
            [3, 4],
            [2, 4]
        ], "right"); // serpent du debut
        applee = new Apple([10, 10]); // POmme
        score = 0; //score
        refreshCanvas(); // appel de la fonction refreshcanvas
    }
    init(); // appel de la fonction
    // animation du canvas
    function refreshCanvas() {
        snakee.advance();
        if (snakee.checkCollision()) {
            gameOver();
        } else {
            if (snakee.isEatingApple(applee)) { // le serpent a manger la pomme
                snakee.ateApple = true; // le serpent a mangé une pomme
                score++;
                do {
                    applee.setNewPosition();
                }
                while (applee.isOnSnake(snakee)) {}


            };
            ctx.clearRect(0, 0, canvasWidth, canvasHeight); // efface le canvas precedent
            drawScore();
            snakee.draw();
            applee.draw();

            timeOut = setTimeout(refreshCanvas, delay); // /!\ PAS setTimeOut
        }


    }
    // fonction Game Over
    function gameOver() {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.textBaseline = "middle";
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        ctx.strokeText("Game Over Looser", centerX, centerY - 180);
        ctx.fillText("Game Over Looser", centerX, centerY - 180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Espace pour rejouer", centerX, centerY - 120);
        ctx.fillText("Espace pour rejouer", centerX, centerY - 120);
        ctx.restore();
    }

    // Fonction restart
    function restart() {
        snakee = new Snake([
            [6, 4],
            [5, 4],
            [4, 4],
            [3, 4],
            [2, 4]
        ], "right");
        applee = new Apple([10, 10]);
        score = 0;
        clearTimeout(timeOut); // sinon, quand on relance le jeu avec la barre espace sans avoir perdu, setTimeout n'est pas réinitialisé, et le serpent avant bcp plus vite
        refreshCanvas();

    }
    // score
    function drawScore() { // affiché le score
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        ctx.textBaseline = "middle";
        ctx.globalAlpha = 0.4;

        ctx.fillText(score.toString(), centerX, centerY);
        ctx.restore();
    }



    // création de fonction qui va déssiner le serpent 

    function drawBlock(ctx, position) {
        var x = position[0] * blockSize; // position initial + taille du block définit dans le canvas
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }




    document.onkeydown = function handleKeyDown(event) { // pour changer la direction du serpent en fonction de la fleche saisie par l'utilisateur
        var key = event.keyCode;
        var newDirection;
        switch (key) {
            case 37: // fleche gauche
                newDirection = "left"
                break;
            case 38: // fleche haut
                newDirection = "up"
                break;
            case 39: // fleche droite
                newDirection = "right"
                break;
            case 40: // fleche bas
                newDirection = "down"
                break;
            case 32: //espace, pour rejouer
                restart();
                return;

            default:
                throw ("non");
        }
        snakee.setDirection(newDirection);

    }
}