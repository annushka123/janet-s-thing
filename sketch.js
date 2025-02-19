let circleX, circleY, circleSize = 200;
let dragging = false;
let offsetX, offsetY;
let playButton;
let currentTrack = null;
let trackPlaying = false;
let audioZones = {};
let initialSound;
let circleColor;

// Define colors for visualization
let joy, anger, sadness, trust;

// Audio Position Markers
let audioPositions = [];

function preload() {
  let baseURL = "/public/"; // Adjust for Netlify if necessary

  // Define quadrant categories and zones
  let categories = ["angry", "happy", "calm", "sad"];
  let zones = ["a", "b", "c"];

  // Initialize each quadrant's audio list
  for (let cat of categories) {
    for (let z of zones) {
      let key = `${cat}_${z}`;
      audioZones[key] = [];
    }
  }

  // Load only 2 sounds per zone (for a total of 24)
  for (let i = 0; i < 10; i++) {
    for (let cat of categories) {
      for (let z of zones) {
        let key = `${cat}_${z}`;
        let filename = `${baseURL}${cat}_${z}_${i}.wav`;

        console.log(`🔄 Trying to load: ${filename}`);

        let sound = loadSound(
          filename,
          () => console.log(`✅ Loaded: ${filename}`),
          () => console.warn(`❌ Failed to load: ${filename}`)
        );

        audioZones[key].push(sound);
      }
    }
  }

  // Load center sound
  let centerSoundURL = `${baseURL}sound.wav`;
  initialSound = loadSound(
    centerSoundURL,
    () => console.log(`✅ Loaded center sound`),
    () => console.warn(`❌ Failed to load center sound: ${centerSoundURL}`)
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  userStartAudio();
  circleX = width / 2;
  circleY = height / 2;

  // Define Plutchik’s colors
  joy = color(255, 255, 0);
  anger = color(200, 0, 0);
  sadness = color(0, 0, 255);
  trust = color(0, 200, 0);

  circleColor = getQuadrantColor(circleX, circleY);

  // Play Button
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

  generateAudioPositions(); // Place audio markers
  noLoop();
}

function draw() {
  background(0, 50);

  drawAudioMarkers(); // Show where sounds are positioned

  // Draggable Ellipse with Lerp Color
  noStroke();
  fill(circleColor);
  ellipse(circleX, circleY, circleSize);
}

// 🎯 **Updated Zone Calculation Using Distance & Angle**
function getAudioZone() {
  let distance = dist(circleX, circleY, width / 2, height / 2);
  let angle = atan2(circleY - height / 2, circleX - width / 2); // Angle from center

  let zone = (distance < width / 4) ? "a" :
             (distance < (width - width / 4) / 2) ? "b" :
             "c";

  let quadrant =
    (angle >= PI / 2 && angle <= PI) ? "angry" :
    (angle > 0 && angle < PI / 2) ? "happy" :
    (angle > -PI / 2 && angle <= 0) ? "calm" :
    "sad";

  return `${quadrant}_${zone}`;
}

// 🟢 **Play Audio Based on Zone**
function playCurrentTrack() {
  if (!trackPlaying) {
    let key = getAudioZone();

    if (audioZones[key] && audioZones[key].length > 0) {
      let trackList = audioZones[key];
      let newTrack = random(trackList);

      if (newTrack && !newTrack.isPlaying()) {
        console.log(`🎵 Playing: ${key}`);
        newTrack.play();
        trackPlaying = true;
        playButton.style('background-color', 'gray');

        newTrack.onended(() => {
          trackPlaying = false;
          playButton.style('background-color', '#800080');
        });
      } else {
        console.warn(`🚫 Track is undefined or already playing for key: ${key}`);
      }
    } else {
      console.warn(`⚠️ No audio found for key: ${key}`);
    }
  }
}

// 🔹 **Create a Visual Representation of Audio Zones**
function generateAudioPositions() {
  let radii = [width / 4, (width - width / 4) / 2, width / 1.5];
  let angles = [-PI, -PI / 2, 0, PI / 2];

  audioPositions = [];

  for (let r of radii) {
    for (let angle of angles) {
      let x = width / 2 + cos(angle) * r;
      let y = height / 2 + sin(angle) * r;
      audioPositions.push({ x, y, color: getQuadrantColor(x, y) });
    }
  }
}

// 🔹 **Draw Audio Markers on the Screen**
function drawAudioMarkers() {
  for (let pos of audioPositions) {
    fill(pos.color);
    noStroke();
    ellipse(pos.x, pos.y, 20, 20);
  }
}

// 🎨 **Determine Color Based on Position**
function getQuadrantColor(x, y) {
  let topColor = lerpColor(anger, joy, map(x, 0, width, 0, 1));
  let bottomColor = lerpColor(sadness, trust, map(x, 0, width, 0, 1));
  return lerpColor(topColor, bottomColor, map(y, 0, height, 0, 1));
}

// 🎯 **Touch & Dragging Logic**
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
    let newX = touches[0].x - offsetX;
    let newY = touches[0].y - offsetY;

    if (newX !== circleX || newY !== circleY) {
      circleX = newX;
      circleY = newY;
      circleColor = getQuadrantColor(circleX, circleY);
      redraw();
    }
  }
  return false;
}

function touchEnded() {
  dragging = false;
  return false;
}
