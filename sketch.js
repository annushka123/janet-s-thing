let circleX, circleY, circleSize = 200;
let dragging = false;
let offsetX, offsetY;
let playButton;
let currentTrack = null;
let trackPlaying = false;
let audioZones = []; // Stores all 12 tracks


// Define Plutchik's colors
let joy, anger, sadness, trust;

function preload() {
  // Load all 12 audio files
  audioZones = [
    loadSound('angrylaugh_1.wav'), loadSound('screams_1.wav'), loadSound('shortangry_1.wav'), loadSound('shortangry_6.wav'), // Inner Quadrants
    loadSound('angrylaugh_2.wav'), loadSound('screams_2.wav'), loadSound('shortangry_2.wav'), loadSound('shortangry_7.wav'), // Mid-Zone Quadrants
    loadSound('angrylaugh_3.wav'), loadSound('screams_3.wav'), loadSound('shortangry_3.wav'), loadSound('shortangry_8.wav')  // Outer Quadrants
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  userStartAudio(); // Fix for mobile audio
  circleX = width / 2;
  circleY = height / 2;

  // Define Plutchik’s colors
  joy = color(255, 255, 0); // Yellow (Joy)
  anger = color(200, 0, 0, 200); // Dark Red (Anger)
  sadness = color(0, 0, 255, 200); // Blue (Sadness)
  trust = color(0, 200, 0, 200); // Green (Calm/Trust)

  // Create Play Button
  playButton = createButton('▶ ');
  playButton.position(width / 2 - 75, height - 200);
  playButton.size(150, 150);
  playButton.style('font-size', '50px');
  playButton.style('background-color', '#800080');
  playButton.style('color', 'white');
  playButton.style('border', 'none');
  playButton.style('border-radius', '10px');
  playButton.style('cursor', 'pointer');
  playButton.style('cursor', '140px 140px'); // Increases clickable area


  playButton.mousePressed(playCurrentTrack);
  playButton.touchStarted(playCurrentTrack);

  
}

function draw() {
  fill(0, 50); // Black with low opacity (20 out of 255)
  rect(0, 0, width, height); // Covers the whole canvas but allows previous frames to show through


  //Draw quadrants and ellipses
  // noFill();
  // strokeWeight(2);
  // stroke(255, 0, 0);
  // ellipse(width / 2, height / 2, width*0.7, height*0.5); // Inner ellipse
  // stroke(0, 255, 0);
  // ellipse(width / 2, height / 2, width*1.2, height*0.8); // Mid ellipse
  // strokeWeight(5);
  // stroke(130, 130, 130);
  // line(0, height / 2, width, height / 2);
  // line(width / 2, 0, width / 2, height);

  // Determine the current color based on position
  let circleColor = getQuadrantColor(circleX, circleY);

  // Draggable Ellipse with Lerp Color
  noStroke();
  fill(circleColor);
  ellipse(circleX, circleY, circleSize);
}

// Determine the interpolated color based on the quadrant
function getQuadrantColor(x, y) {
  let topColor = lerpColor(anger, joy, map(x, 0, width, 0, 1)); // Left to right: Anger → Joy
  let bottomColor = lerpColor(sadness, trust, map(x, 0, width, 0, 1)); // Left to right: Sadness → Trust

  return lerpColor( topColor, bottomColor, map(y, 0, height, 0, 1)); // Blends top-bottom colors
}

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

function touchMoved() {
  if (dragging && touches.length > 0) {
    circleX = touches[0].x - offsetX;
    circleY = touches[0].y - offsetY;
  }
  return false;
}

function touchEnded() {
  dragging = false;
  return false;
}

// Determine which zone the ellipse is in
function getAudioZone() {
  let d = dist(circleX, circleY, width / 2, height / 2);

  if (d < width / 4) {
    // Inner Quadrants
    if (circleX < width / 2 && circleY < height / 2) return 0; // Top-left
    if (circleX > width / 2 && circleY < height / 2) return 1; // Top-right
    if (circleX < width / 2 && circleY > height / 2) return 2; // Bottom-left
    if (circleX > width / 2 && circleY > height / 2) return 3; // Bottom-right
  } else if (d < (width - width / 4) / 2) {
    // Mid-Zone Quadrants
    if (circleX < width / 2 && circleY < height / 2) return 4;
    if (circleX > width / 2 && circleY < height / 2) return 5;
    if (circleX < width / 2 && circleY > height / 2) return 6;
    if (circleX > width / 2 && circleY > height / 2) return 7;
  } else {
    // Outer Quadrants
    if (circleX < width / 2 && circleY < height / 2) return 8;
    if (circleX > width / 2 && circleY < height / 2) return 9;
    if (circleX < width / 2 && circleY > height / 2) return 10;
    if (circleX > width / 2 && circleY > height / 2) return 11;
  }

  return -1; // No valid zone
}

// Play the current track based on ellipse position
function playCurrentTrack() {
  if (!trackPlaying) {
    let zone = getAudioZone();
    if (zone !== -1 && audioZones[zone]) {
      currentTrack = audioZones[zone];

      userStartAudio().then(() => {
        currentTrack.play();
        trackPlaying = true;
        playButton.style('background-color', 'gray'); // Disable look

        currentTrack.onended(() => {
          trackPlaying = false;
          playButton.style('background-color', '#800080'); // Ready for next track
        });
      }).catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
  }
}
