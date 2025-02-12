let circleX, circleY, circleSize = 150;
let dragging = false;
let offsetX, offsetY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  circleX = width / 2;
  circleY = height / 2;
}

function draw() {
  background(220);

  // Change color if dragging
  fill(dragging ? 'red' : 'blue');
  ellipse(circleX, circleY, circleSize);
}

// Detect when the ellipse is touched
function touchStarted() {
  if (touches.length > 0) { // Make sure there's a touch
    let d = dist(touches[0].x, touches[0].y, circleX, circleY);
    if (d < circleSize / 2) {
      dragging = true;
      offsetX = touches[0].x - circleX;
      offsetY = touches[0].y - circleY;
    }
  }
  return false; // Prevent default touch behavior
}

// Move the ellipse while touching
function touchMoved() {
  if (dragging && touches.length > 0) {
    circleX = touches[0].x - offsetX;
    circleY = touches[0].y - offsetY;
  }
  return false; // Prevent scrolling
}

// Release the ellipse when touch ends
function touchEnded() {
  dragging = false;
  return false;
}
