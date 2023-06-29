const socket = io(); //Initialize socket.io

// Get a reference to the canvas and its 2D rendering context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Event listener for player input
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

// Player class
class Player {
  constructor(x, y, width, height, color, speed, id) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.normalHeight = height; // Store the normal height
    this.crouchHeight = height / 2; // Define the crouch height
    this.color = color;
    this.speed = speed;
    this.damagePercentage = 0;
    this.isJumping = false;
    this.jumpHeight = 30;
    this.jumpDuration = 5;
    this.jumpFrames = 0;
    this.initialY = y; // Store the initial y position
    this.id = id; // Add an ID property to uniquely identify each player
  }
// Add methods for player-specific functionality
move(canvas) {
  if (controls.left) {
    // Move left
    this.x -= this.speed;
  } else if (controls.right) {
    // Move right
    this.x += this.speed;
  } 

  // Limit the player within the canvas bounds
  if (this.x < 0) {
    this.x = 0;
  } else if (this.x + this.width > canvas.width) {
    this.x = canvas.width - this.width;
  }

  if (controls.up && !this.isJumping && controls.canJump) {
    // Start the jump
    this.isJumping = true;
    controls.canJump = false;
    this.jumpFrames = this.jumpDuration;
  }

  if (this.isJumping) {
    // Perform the jump
    this.y -= this.jumpHeight / this.jumpDuration;
    this.jumpFrames--;

    if (this.jumpFrames === 0) {
      // End the jump
      this.isJumping = false;
    }
  } else {
    // Apply gravity
    this.y = Math.min(this.y + 1, canvas.height - this.height);

    if (this.y === canvas.height - this.height) {
      // Player has landed, allow jumping again
      controls.canJump = true;
    }
  }
}

crouch() {
  this.height = this.crouchHeight;
  this.y = this.y + (this.normalHeight - this.crouchHeight);
  this.isCrouching = true;
}

unCrouch() {
  this.height = this.normalHeight;
  this.y = this.y - (this.normalHeight - this.crouchHeight);
  this.isCrouching = false;
}
}

// Create the player object
let player;
const players = {};

socket.on("makeYoSelfDontBreakYoSelf", (id)=> {
  player = new Player(10,140,5,5,"blue",3,id);
  players[id] = player;
  // Start the game loop
  gameLoop();
  socket.emit("NewPlayerCreated", player )
})

socket.on("CreateNewPlayer", (p)=>{
console.log('Me created player message recieved'),
console.log(p)
})

export const controls = {
  left: false, // Is the left arrow key pressed?
  right: false, // Is the right arrow key pressed?
  up: false, // Is the up arrow key pressed?
  down: false, // Is the down arrow key pressed?
  canJump: true // Can the player jump?
};

// Event listeners for player controls
function handleKeyDown(event) {
    if (event.key === "a") {
      controls.left = true;
    } else if (event.key === "d") {
      controls.right = true;
    } else if (event.key === "w") {
      controls.up = true;
    } else if (event.key === "s") {
      controls.down = true;
      player.crouch();
    }
    socket.emit("keydown", {
      key: event.key,
      playerID: player.id,
    });
}
function handleKeyUp(event) {
    if (event.key === "a") {
      controls.left = false;
    } else if (event.key === "d") {
      controls.right = false;
    } else if (event.key === "w") {
      controls.up = false;
    } else if (event.key === "s") {
      controls.down = false;
      player.unCrouch();
    } 
    socket.emit("keyup", {
      key: event.key,
      playerID: player.id,
    });
}

// Function to update the game state
function update() {
    // Update player position based on input
    player.move(canvas);
  
    // Check for collisions between characters and stage elements

    // Update damage percentages and check for knockouts
  
    // Render the game elements
    render();

    // Emit the player's updated position to the server
    socket.emit("updatePosition", {
        playerID: player.id,
        x: player.x,
        y: player.y,
    });
    // Receive player position updates from the server
    socket.on('updatePosition', (data) => {
    players[data.playerID].x = data.x;
    players[data.playerID].y = data.y;
  });
}

// Function to render the game elements on the canvas
function render() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Render all player rectangles
  for (const playerID in players) {
    const currentPlayer = players[playerID];
    ctx.fillStyle = currentPlayer.color;
    ctx.fillRect(
      currentPlayer.x,
      currentPlayer.y,
      currentPlayer.width,
      currentPlayer.height
    );
  }
}

// Game loop
function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}
