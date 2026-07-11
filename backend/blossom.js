/**
 * Realistic ASCII Flower Blossom
 * Run with: node blossom.js
 */

const WIDTH = 80;
const HEIGHT = 40;
const RAMPS = " .:-=+*#%@"; // Character density map for shading

// Mathematical constants for 3D-to-2D projection
const ISO_X = 1.0;
const ISO_Y = 0.5;

function renderFrame(age) {
  // Create an empty screen buffer
  let buffer = Array(HEIGHT)
    .fill(null)
    .map(() => Array(WIDTH).fill(" "));
  // Depth buffer to ensure proper layering of front vs back petals
  let zBuffer = Array(HEIGHT)
    .fill(null)
    .map(() => Array(WIDTH).fill(-9999));

  // 1. Draw the Stem
  let stemHeight = Math.floor(HEIGHT * 0.4);
  let startY = HEIGHT - 5;
  for (let i = 0; i < stemHeight; i++) {
    let y = startY - i;
    // Slight organic curve to the stem
    let x = Math.floor(WIDTH / 2 + Math.sin(i * 0.1) * 1.5);
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
      buffer[y][x] = "|";
      zBuffer[y][x] = 1000; // Keep stem behind the main blossom layers
    }
  }

  // Center coordinates of the flower head
  let cx = WIDTH / 2;
  let cy = startY - stemHeight;

  // 2. Generate the Petal Geometry
  // We simulate multiple layers of petals overlapping
  let numLayers = 5;

  for (let layer = 0; layer < numLayers; layer++) {
    // Inner layers are smaller, outer layers are larger
    let layerScale = 0.3 + (layer / numLayers) * 0.7;

    // Age dictates how "open" the layers are.
    // Outer layers open first, inner layers open last.
    let layerOpenness = Math.min(1, Math.max(0, age * 1.5 - (1 - layerScale)));

    // Calculate 3D petal bending based on openness
    // Closed = tall cone (high Z, low radius). Open = flat disk (low Z, high radius).
    let maxRadius = 14 * layerScale * (0.3 + 0.7 * layerOpenness);
    let petalTightness = 5; // Number of petals per layer
    let angleOffset = layer * 0.5; // Stagger layers so petals overlap beautifully

    for (let angle = 0; angle < Math.PI * 2; angle += 0.02) {
      // Rose curve equation to shape individual petals
      let rPattern = Math.abs(
        Math.sin((angle + angleOffset) * (petalTightness / 2)),
      );
      let currentMaxR = maxRadius * (0.4 + 0.6 * rPattern);

      for (let r = 0; r < currentMaxR; r += 0.5) {
        // Calculate 3D position relative to the center
        let pct = r / currentMaxR;

        // Petal curves upward (Z axis) depending on how closed it is
        let z =
          Math.cos(pct * Math.PI * 0.5) *
          (15 * layerScale) *
          (1 - layerOpenness);

        // 3D coordinates
        let x3d = r * Math.cos(angle);
        let y3d = r * Math.sin(angle);

        // Tilt the entire flower slightly forward toward the camera for realism
        let tiltAngle = 0.4;
        let cosT = Math.cos(tiltAngle);
        let sinT = Math.sin(tiltAngle);

        let rotY = y3d * cosT - z * sinT;
        let rotZ = y3d * sinT + z * cosT;

        // Project isometric 3D down to 2D screen pixels
        let screenX = Math.floor(cx + x3d * ISO_X);
        let screenY = Math.floor(cy + rotY * ISO_Y);

        // Bounds check
        if (
          screenX >= 0 &&
          screenX < WIDTH &&
          screenY >= 0 &&
          screenY < HEIGHT
        ) {
          // Depth check (Z-buffering) to render closer petals over distant ones
          if (rotZ > zBuffer[screenY][screenX]) {
            zBuffer[screenY][screenX] = rotZ;

            // Shading math based on petal depth and light source
            let lighting = Math.floor(pct * (RAMPS.length - 1));

            // Highlight the very center pistil/stamen differently
            if (layer === 0 && pct < 0.3 && age > 0.6) {
              buffer[screenY][screenX] = "*";
            } else {
              buffer[screenY][screenX] = RAMPS[lighting];
            }
          }
        }
      }
    }
  }

  // Flatten buffer to a string frame
  return buffer.map((row) => row.join("")).join("\n");
}

// 3. The Main Animation Loop
let age = 0.0; // 0.0 = Tight Bud, 1.0 = Full Bloom
const speed = 0.012; // How fast the flower grows

function animate() {
  // Clear the screen and reset cursor home
  process.stdout.write("\x1B[2J\x1B[H");

  // Render the current frame calculation
  console.log(renderFrame(age));

  // Advance time
  age += speed;

  // Loop the animation infinitely
  if (age > 1.2) {
    age = 0.0; // Reset back to bud
  }
}

// Run at a smooth 30 frames per second
setInterval(animate, 33);
