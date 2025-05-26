document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const cells = Array.from(grid.querySelectorAll('div'));
    const width = 15;
    const initialPacmanIndex = 151;
    let pacmanIndex = initialPacmanIndex;
    let pacmanRotation = 0; // variable global para ángulo
    let isInvincible = false; // Variable para hacerlo invencible por un momento

    // Variables de Puntaje y Vida
    let score = 0;
    let lives = 3;
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');

    // CLASS DE FANTASMA
    class Ghost {
        constructor(name, startIndex, className, speed = 500) {
            this.name = name;
            this.currentIndex = startIndex;
            this.className = className;
            this.speed = speed;
            this.timerId = null;
            this.directions = [-1, 1, -width, width];
        }

        draw() {
            cells[this.currentIndex].classList.add('ghost', this.className);
        }

        erase() {
            cells[this.currentIndex].classList.remove('ghost', this.className);
        }

        move() {
            const moveGhost = () => {
                const possibleDirections = this.directions.filter(dir => {
                    const nextIndex = this.currentIndex + dir;
                    return (
                        !cells[nextIndex].classList.contains('wall') &&
                        !cells[nextIndex].classList.contains('ghost')
                    );
                });

                if (possibleDirections.length === 0) return;

                // Control de dificultad: probabilidad de "inteligencia"
                const smartMoveProbability = 0.6; // 60% de las veces irá hacia Pac-Man

                let chosenDirection;
                if (Math.random() < smartMoveProbability) {
                    // Elegir dirección que acerque a Pac-Man
                    let minDistance = Infinity;
                    possibleDirections.forEach(dir => {
                        const nextIndex = this.currentIndex + dir;
                        const dx = (nextIndex % width) - (pacmanIndex % width);
                        const dy = Math.floor(nextIndex / width) - Math.floor(pacmanIndex / width);
                        const distance = Math.abs(dx) + Math.abs(dy);
                        if (distance < minDistance) {
                            minDistance = distance;
                            chosenDirection = dir;
                        }
                    });
                } else {
                    // Movimiento aleatorio
                    chosenDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                }

                const nextIndex = this.currentIndex + chosenDirection;
                this.erase();
                this.currentIndex = nextIndex;
                this.draw();


                // Verificar colisión solo si Pac-Man no es invencible
                if (this.currentIndex === pacmanIndex && !isInvincible) {
                    loseLife();
                }
            };

            this.timerId = setInterval(moveGhost, this.speed);
        }
    }

    // CREAR FANTASMAS 
    const blinky = new Ghost('blinky', 31, 'red', 900);
    const pinky = new Ghost('pinky', 55, 'pink', 900);
    const greenky = new Ghost('greenky', 87, 'green', 1300);
    const yellownky = new Ghost('yellownky', 111, 'yellow', 1200);
    const orangenky = new Ghost('orangenky', 159, 'orange', 1000);
    const ghosts = [blinky, pinky, greenky, yellownky, orangenky];

    ghosts.forEach(ghost => {
        ghost.draw();
        ghost.move();
    });

    // Dibujar Pac-Man
    function drawPacMan() {
        cells.forEach(cell => cell.classList.remove('pacman'));
        cells[pacmanIndex].classList.add('pacman');
    }

    drawPacMan();

    //Lógica de perder una vida

    function loseLife() {
        lives--;
        livesDisplay.textContent = lives;

        if (lives === 0) {
            alert('¡Perdiste! Juego reiniciado.');
            location.reload();
        } else {
            alert(`Te atraparon. Vidas restantes: ${lives}`);
            isInvincible = true; // <-- Activar ANTES de reaparecer
            pacmanIndex = initialPacmanIndex;
            drawPacMan();

            setTimeout(() => {
                isInvincible = false;
            }, 2000);
        }
    }

    // Funcion de ganar

    function checkWin() {
        const remainingDots = cells.some(cell => cell.classList.contains('dot'));
        if (!remainingDots) {
            setTimeout(() => {
                alert(`¡Ganaste! Tu puntaje final es: ${score}`);
                location.reload(); // o ir a una página de victoria
            }, 100);
        }
    }

    // Bloquear scroll con flechas
    window.addEventListener("keydown", function (e) {
        const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        if (keys.includes(e.key)) {
            e.preventDefault();
        }
    }, false);

    //Movimiento Del Teclado
    document.addEventListener('keydown', (e) => {
        // Quitar clase y rotación de la celda vieja
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

        // Comer punto
        if (cells[pacmanIndex].classList.contains('dot')) {
            cells[pacmanIndex].classList.remove('dot');
            score += 5;
            scoreDisplay.textContent = score;
            checkWin();
        }



        // Rotar solo Pac-Man
        let angle = 0;
        switch (e.key) {
            case 'ArrowUp': angle = -90; break;
            case 'ArrowDown': angle = 90; break;
            case 'ArrowLeft': angle = 180; break;
            case 'ArrowRight': angle = 0; break;
        }

        // para que no pierda si es invencible

        if (cells[pacmanIndex].classList.contains('ghost') && !isInvincible) {
            loseLife();
        }


        // Rotación solo para el packman
        if (
            cells[pacmanIndex].classList.contains('pacman') &&
            !cells[pacmanIndex].classList.contains('ghost')
        ) {
            cells[pacmanIndex].style.transform = `rotate(${angle}deg)`;
        }
    });
});
