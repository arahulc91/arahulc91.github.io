class SnakeGame {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameOver = false;
        this.speed = 150;
        
        // Touch handling variables
        this.touchStartX = null;
        this.touchStartY = null;
        this.minSwipeDistance = 30; // Minimum distance for a swipe
        
        // Colors matching the site theme
        this.colors = {
            snake: '#4ade80', // green-400
            food: '#22c55e',  // green-500
            background: '#000000',
            text: '#4ade80'
        };

        // Add touch event listeners
        this.initTouchControls();
    }

    initTouchControls() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling while playing
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.touchStartX || !this.touchStartY) return;

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;

            // Only process if the swipe distance is greater than minimum
            if (Math.abs(deltaX) < this.minSwipeDistance && Math.abs(deltaY) < this.minSwipeDistance) {
                return;
            }

            // Determine swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0 && this.direction !== 'left') {
                    this.direction = 'right';
                } else if (deltaX < 0 && this.direction !== 'right') {
                    this.direction = 'left';
                }
            } else {
                // Vertical swipe
                if (deltaY > 0 && this.direction !== 'up') {
                    this.direction = 'down';
                } else if (deltaY < 0 && this.direction !== 'down') {
                    this.direction = 'up';
                }
            }

            // Reset touch coordinates
            this.touchStartX = null;
            this.touchStartY = null;
        }, { passive: false });

        // Add tap to restart on game over
        this.canvas.addEventListener('touchend', (e) => {
            if (this.gameOver) {
                e.preventDefault();
                this.restart();
            }
        }, { passive: false });
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.height / this.gridSize));
        return {x, y};
    }

    update() {
        if (this.gameOver) return;

        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check for collisions
        if (head.x < 0 || head.x >= this.width / this.gridSize ||
            head.y < 0 || head.y >= this.height / this.gridSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            return;
        }

        this.snake.unshift(head);

        // Check if snake ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            // Increase speed slightly
            this.speed = Math.max(50, this.speed - 5);
        } else {
            this.snake.pop();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw snake
        this.ctx.fillStyle = this.colors.snake;
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // Draw food
        this.ctx.fillStyle = this.colors.food;
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );

        // Draw score
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '20px "Share Tech Mono"';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        if (this.gameOver) {
            this.ctx.fillStyle = this.colors.text;
            this.ctx.font = '40px "Share Tech Mono"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
            this.ctx.font = '20px "Share Tech Mono"';
            this.ctx.fillText('Tap to restart', this.width / 2, this.height / 2 + 40);
            this.ctx.textAlign = 'left';
        }
    }

    restart() {
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameOver = false;
        this.speed = 150;
    }
}
