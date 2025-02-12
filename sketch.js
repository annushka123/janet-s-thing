let circleX, circleY, circleSize = 200;
let dragging = false;
let offsetX, offsetY;
let playButton;
let currentTrack = null;
let trackPlaying = false;
let audioZones = [];
let initialSound;
let circleColor;

// Define Plutchik's colors
let joy, anger, sadness, trust;

function preload() {
  // Load all 12 quadrant sounds
  audioZones = [
    loadSound('angrylaugh_1.wav'), loadSound('screams_1.wav'), loadSound('shortangry_1.wav'), loadSound('shortangry_6.wav'), // Inner Quadrants
    loadSound('angrylaugh_2.wav'), loadSound('screams_2.wav'), loadSound('shortangry_2.wav'), loadSound('shortangry_7.wav'), // Mid-Zone Quadrants
    loadSound('angrylaugh_3.wav'), loadSound('screams_3.wav'), loadSound('shortangry_3.wav'), loadSound('shortangry_8.wav')  // Outer Quadrants
  ];
  
  // Load center sound
  initialSound = loadSound('angrylaugh_10.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  userStartAudio(); // Ensures mobile sound works
  circleX = width / 2;
  circleY = height / 2;

  // Define Plutchik’s colors
  joy = color(255, 255, 0);
  anger = color(200, 0, 0);
  sadness = color(0, 0, 255);
  trust = color(0, 200, 0);

  circleColor = getQuadrantColor(circleX, circleY); // Initial color

  // Create Play Button
  playButton = createButton('▶ ');
  playButton.position(width / 2 - 75, height - 200);
  playButton.size(160, 160);
  playButton.style('font-size', '100px');
  playButton.style('background-color', '#800080');
  playButton.style('color', 'white');
  playButton.style('border', 'none');
  playButton.style('border-radius', '10px');
  playButton.style('cursor', 'pointer');

  playButton.mousePressed(playCurrentTrack);
  playButton.touchStarted(playCurrentTrack);

  noLoop(); // Stops draw() from looping continuously
}

function draw() {
  // Creates the fading trail effect
  fill(0, 50);
  rect(0, 0, width, height);

  // Draggable Ellipse with Lerp Color
  noStroke();
  fill(circleColor);
  ellipse(circleX, circleY, circleSize);
}

// Determine color based on quadrant
function getQuadrantColor(x, y) {
  let topColor = lerpColor(anger, joy, map(x, 0, width, 0, 1));
  let bottomColor = lerpColor(sadness, trust, map(x, 0, width, 0, 1));
  return lerpColor(topColor, bottomColor, map(y, 0, height, 0, 1));
}

// Handle touch start (dragging)
function touchStarted() {
  if (touches.length > 0) {
    let d = dist(touches[0].x, touches[0].y, circleX, circleY);
    if (d < circleSize / 2) {
      dragging = true;
      offsetX = touches[0].x - circleX;
      offsetY = touches[0].y - circleY;
    }
  }
  return false;
}

// Handle dragging
function touchMoved() {
  if (dragging && touches.length > 0) {
    let newX = touches[0].x - offsetX;
    let newY = touches[0].y - offsetY;
    
    // Only update if the position changes
    if (newX !== circleX || newY !== circleY) {
      circleX = newX;
      circleY = newY;
      circleColor = getQuadrantColor(circleX, circleY);
      redraw(); // Redraw only when necessary
    }
  }
  return false;
}

// Stop dragging
function touchEnded() {
  dragging = false;
  return false;
}

// Determine which zone the ellipse is in
function getAudioZone() {
  let d = dist(circleX, circleY, width / 2, height / 2);

  if (d < width / 4) {
    if (circleX < width / 2 && circleY < height / 2) return 0;
    if (circleX > width / 2 && circleY < height / 2) return 1;
    if (circleX < width / 2 && circleY > height / 2) return 2;
    if (circleX > width / 2 && circleY > height / 2) return 3;
  } else if (d < (width - width / 4) / 2) {
    if (circleX < width / 2 && circleY < height / 2) return 4;
    if (circleX > width / 2 && circleY < height / 2) return 5;
    if (circleX < width / 2 && circleY > height / 2) return 6;
    if (circleX > width / 2 && circleY > height / 2) return 7;
  } else {
    if (circleX < width / 2 && circleY < height / 2) return 8;
    if (circleX > width / 2 && circleY < height / 2) return 9;
    if (circleX < width / 2 && circleY > height / 2) return 10;
    if (circleX > width / 2 && circleY > height / 2) return 11;
  }

  return -1;
}

// Play the current track
function playCurrentTrack() {
  if (!trackPlaying) {
    let zone = getAudioZone();
    let newTrack = (zone === -1) ? initialSound : audioZones[zone];

    // Play sound only if it's not already playing
    if (newTrack && !newTrack.isPlaying()) {
      userStartAudio().then(() => {
        newTrack.play();
        trackPlaying = true;
        playButton.style('background-color', 'gray');

        newTrack.onended(() => {
          trackPlaying = false;
          playButton.style('background-color', '#800080');
        });
      }).catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
  }
}
