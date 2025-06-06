document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const cells = Array.from(grid.querySelectorAll('div'));
    const width = 15;
    const initialPacmanIndex = 151;
    let pacmanIndex = initialPacmanIndex;
    let pacmanRotation = 0;
    let isInvincible = false;
    let score = 0;
    let lives = 3;
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');


    //POSICION ORIGINAL DE LOS DOTS Y PASTILLAS

    const originalDots = new Set(); 
    cells.forEach((cell, i) => {
        if (cell.classList.contains('dot')) originalDots.add(i);
    });
    const eatenDots = new Set();
    const eatenPellets = new Set();

    const originalPellets = new Set();
    cells.forEach((cell, i) => {
        if (cell.classList.contains('power-pellet')) originalPellets.add(i);
    });


    // CLASE FANTASMA

    class Ghost {
        constructor(name, startIndex, className, speed = 500) {
            this.name = name;
            this.currentIndex = startIndex;
            this.startIndex = startIndex;  // <-- agregado para resetear
            this.className = className;
            this.speed = speed;
            this.isScared = false;
            this.timerId = null;
            this.directions = [-1, 1, -width, width];
        }

        draw() {
            cells[this.currentIndex].classList.add('ghost', this.className);
            if (this.isScared) {
                cells[this.currentIndex].classList.add('scared');
            }
        }

        erase() {
            cells[this.currentIndex].classList.remove('ghost', this.className, 'scared');
        }


        // FUNCION DE ASUSTADO

        setScared(state) {
            this.isScared = state;
            if (state) {
                cells[this.currentIndex].classList.add('scared');
            } else {
                cells[this.currentIndex].classList.remove('scared');
            }
        }

        //MOVIMIENTO DE FANTASMA

        move() {
            const moveGhost = () => {
                const possibleDirections = this.directions.filter(dir => {
                    const next = this.currentIndex + dir;
                    return (
                        !cells[next].classList.contains('wall') &&
                        !cells[next].classList.contains('ghost')
                    );
                });

                if (possibleDirections.length === 0) return;

                let chosenDirection;
                if (Math.random() < 0.6) {
                    // Movimiento inteligente
                    let minDist = Infinity;
                    possibleDirections.forEach(dir => {
                        const next = this.currentIndex + dir;
                        const dx = (next % width) - (pacmanIndex % width);
                        const dy = Math.floor(next / width) - Math.floor(pacmanIndex / width);
                        const dist = Math.abs(dx) + Math.abs(dy);
                        if (dist < minDist) {
                            minDist = dist;
                            chosenDirection = dir;
                        }
                    });
                } else {
                    chosenDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                }

                const nextIndex = this.currentIndex + chosenDirection;

                // RESTAURACIÓN DE LOS PUNTITOS Y PASTILLAS
              
               if (
                     originalDots.has(this.currentIndex) &&
                    !eatenDots.has(this.currentIndex) &&
                    !cells[this.currentIndex].classList.contains('pacman')
                ) {
                    cells[this.currentIndex].classList.add('dot');
                }

                
               if (
                    originalPellets.has(this.currentIndex) &&
                    !eatenPellets.has(this.currentIndex) &&
                    !cells[this.currentIndex].classList.contains('pacman')
                ) {
                    cells[this.currentIndex].classList.add('power-pellet');
                }

                this.erase();
                this.currentIndex = nextIndex;

                // Si pisa dot, ocultarlo
                if (cells[this.currentIndex].classList.contains('dot')) {
                    cells[this.currentIndex].classList.remove('dot');
                }

                if (cells[this.currentIndex].classList.contains('power-pellet')) {
                    cells[this.currentIndex].classList.remove('power-pellet');
                }

                this.draw();

                // Colisión con Pac-Man
                if (this.currentIndex === pacmanIndex && !isInvincible) {
                    if (this.isScared) {
                        // Fantasma comido
                        this.erase();
                        this.currentIndex = this.startIndex;
                        this.draw();
                        this.setScared(false);
                        score += 50;
                        scoreDisplay.textContent = score;
                    } else {
                        loseLife();
                    }
                }
            };

            this.timerId = setInterval(moveGhost, this.speed);
        }
    }


    // CREACIÓN DE FANTASMAS
    const blinky = new Ghost('blinky', 80, 'red', 800);
    const pinky = new Ghost('pinky', 81, 'pink', 800);
    const blue = new Ghost('blue', 83, 'blue', 1000);
    const orange = new Ghost('orange', 100, 'orange', 1000);
    const ghosts = [blinky, pinky, blue, orange];

    ghosts.forEach(ghost => {
        ghost.draw();
        ghost.move();
    });


    // MANEJO DE PUNTAJES DE ACUERDO A LO QUE SE COME EL

    function drawPacMan() {
        cells.forEach(cell => cell.classList.remove('pacman'));
        cells[pacmanIndex].classList.add('pacman');

        if (cells[pacmanIndex].classList.contains('dot')) {
            cells[pacmanIndex].classList.remove('dot');
            eatenDots.add(pacmanIndex);
            score += 5;
            scoreDisplay.textContent = score;
            checkWin();
        }

        if (cells[pacmanIndex].classList.contains('power-pellet')) {
            cells[pacmanIndex].classList.remove('power-pellet');
            eatenPellets.add(pacmanIndex);
            score += 10;
            scoreDisplay.textContent = score;

            ghosts.forEach(g => g.setScared(true));

            setTimeout(() => {
                ghosts.forEach(g => g.setScared(false));
            }, 10000);
        }
    }

    // FUNCIÓN DE PERDIDA DE VIDAS
    function loseLife() {
        lives--;
        livesDisplay.textContent = lives;

        if (lives === 0) {
            alert('¡Perdiste! Reiniciando...');
            location.reload();
        } else {
            alert(`Te atraparon. Vidas restantes: ${lives}`);
            isInvincible = true;
            pacmanIndex = initialPacmanIndex;
            drawPacMan();
            setTimeout(() => isInvincible = false, 2000);
        }
    }


    // FUNCIÓN QUE VERIFICA SI YA NO EXISTEN DOT

    function checkWin() {
        const remainingDots = cells.some(cell => cell.classList.contains('dot'));
        if (!remainingDots) {
            setTimeout(() => {
                alert(`¡Ganaste! Puntaje final: ${score}`);
                location.reload();
            }, 200);
        }
    }

    // Bloquear scroll
    window.addEventListener('keydown', e => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
    });


    // LECTURA DE LOS COMANDOS DE TECLADO

    document.addEventListener('keydown', e => {
        cells[pacmanIndex].classList.remove('pacman');
        cells[pacmanIndex].style.transform = '';

        switch (e.key) {
            case 'ArrowLeft':
                if (pacmanIndex % width !== 0 && !cells[pacmanIndex - 1].classList.contains('wall')) {
                    pacmanIndex -= 1;
                }
                break;
            case 'ArrowRight':
                if (pacmanIndex % width < width - 1 && !cells[pacmanIndex + 1].classList.contains('wall')) {
                    pacmanIndex += 1;
                }
                break;
            case 'ArrowUp':
                if (pacmanIndex - width >= 0 && !cells[pacmanIndex - width].classList.contains('wall')) {
                    pacmanIndex -= width;
                }
                break;
            case 'ArrowDown':
                if (pacmanIndex + width < cells.length && !cells[pacmanIndex + width].classList.contains('wall')) {
                    pacmanIndex += width;
                }
                break;
        }

        drawPacMan();

        if (cells[pacmanIndex].classList.contains('ghost') && !isInvincible) {
            const ghostHere = ghosts.find(g => g.currentIndex === pacmanIndex);

            if (ghostHere) {
                if (ghostHere.isScared) {
                    // Pacman se come al fantasma
                    ghostHere.erase();
                    ghostHere.currentIndex = ghostHere.startIndex;
                    ghostHere.draw();
                    ghostHere.setScared(false);
                    score += 50;
                    scoreDisplay.textContent = score;
                } else {
                    loseLife();
                }
            }
        }

        // Rotación visual
        let angle = 0;
        switch (e.key) {
            case 'ArrowUp': angle = -90; break;
            case 'ArrowDown': angle = 90; break;
            case 'ArrowLeft': angle = 180; break;
            case 'ArrowRight': angle = 0; break;
        }

        if (cells[pacmanIndex].classList.contains('pacman')) {
            cells[pacmanIndex].style.transform = `rotate(${angle}deg)`;
        }
    });

    drawPacMan();
});


//REPRODUCCIÓN DEL AUDIO
document.addEventListener('DOMContentLoaded', () => {
    const introSound = document.getElementById('intro-sound');
    function playIntroSound() {
        introSound.play().catch((error) => {
            console.log("no dejo");
        });
        document.removeEventListener('click', playIntroSound);
        document.removeEventListener('keydown', playIntroSound);
    }

    document.addEventListener('click', playIntroSound);
    document.addEventListener('keydown', playIntroSound);
});
