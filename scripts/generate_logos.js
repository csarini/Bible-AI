import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgEmblem = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FAF8F5" />
    </radialGradient>
    <linearGradient id="rayOrangeGrad" x1="200" y1="20" x2="200" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F97316" />
      <stop offset="60%" stop-color="#EA580C" />
      <stop offset="100%" stop-color="#C2410C" />
    </linearGradient>
    <linearGradient id="navyWaveGradMain" x1="10" y1="130" x2="390" y2="210" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#142366" />
      <stop offset="40%" stop-color="#1E328A" />
      <stop offset="80%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="cyanWaveGradMain" x1="80" y1="180" x2="380" y2="230" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00AEEF" />
      <stop offset="60%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#7DD3FC" />
    </linearGradient>

    <!-- Mask to cut out the crisp Latin Cross in center ray -->
    <mask id="crossCutoutMask">
      <rect width="400" height="280" fill="white" />
      <path d="M 188 38 H 212 V 58 H 234 V 74 H 212 V 170 H 188 V 74 H 166 V 58 H 188 Z" fill="black" />
    </mask>
  </defs>

  <!-- Background rounded canvas -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />

  <!-- Centered Logo Group scaled to fit 512x512 -->
  <g transform="translate(56, 36) scale(1.0)">
    <!-- Sunburst Rays with White Cross Negative Space -->
    <g id="sunburst-rays" mask="url(#crossCutoutMask)">
      <path d="M 24 150 C 35 125 58 105 88 90 L 175 145 C 120 162 70 168 24 150 Z" fill="url(#rayOrangeGrad)" />
      <path d="M 68 84 C 95 62 130 46 166 38 L 186 138 C 145 145 106 156 68 84 Z" fill="url(#rayOrangeGrad)" />
      <path d="M 148 30 C 182 20 218 20 252 30 L 222 155 C 208 156 192 156 178 155 Z" fill="url(#rayOrangeGrad)" />
      <path d="M 234 38 C 270 46 305 62 332 84 L 332 84 C 294 156 255 145 214 138 Z" fill="url(#rayOrangeGrad)" />
      <path d="M 312 90 C 342 105 365 125 376 150 C 330 168 280 162 225 145 Z" fill="url(#rayOrangeGrad)" />
    </g>

    <!-- Cross Fill -->
    <path d="M 188 38 H 212 V 58 H 234 V 74 H 212 V 158 H 188 V 74 H 166 V 58 H 188 Z" fill="#FFFFFF" />

    <!-- Primary Navy Wave Ribbon -->
    <path d="M 6 135 C 40 200 135 220 215 190 C 295 160 365 175 394 200 C 360 215 285 192 215 198 C 120 206 48 220 6 135 Z" fill="url(#navyWaveGradMain)" />

    <!-- Secondary Cyan Water Ribbon -->
    <path d="M 95 210 C 165 218 250 202 320 196 C 362 192 384 200 396 216 C 368 225 320 212 258 214 C 185 218 135 216 95 210 Z" fill="url(#cyanWaveGradMain)" />

    <!-- Text: El-Shaddai -->
    <text x="200" y="325" font-family="'Playfair Display', Georgia, serif" font-size="50" font-style="italic" font-weight="bold" fill="#142366" text-anchor="middle">El-Shaddai</text>
    
    <!-- Text: DIOS TODOPODEROSO -->
    <text x="200" y="365" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" letter-spacing="5" fill="#142366" text-anchor="middle">DIOS TODOPODEROSO</text>
  </g>
</svg>
`;

const svgDarkEmblem = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgDarkGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#141824" />
      <stop offset="100%" stop-color="#0B0F19" />
    </radialGradient>
    <linearGradient id="rayOrangeGrad" x1="200" y1="20" x2="200" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="60%" stop-color="#F97316" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
    <linearGradient id="navyWaveGradDark" x1="10" y1="130" x2="390" y2="210" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2A3B90" />
      <stop offset="50%" stop-color="#3B49A8" />
      <stop offset="100%" stop-color="#5465D4" />
    </linearGradient>
    <linearGradient id="cyanWaveGradMain" x1="80" y1="180" x2="380" y2="230" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="60%" stop-color="#7DD3FC" />
      <stop offset="100%" stop-color="#BAE6FD" />
    </linearGradient>
    <mask id="crossCutoutMaskDark">
      <rect width="400" height="280" fill="white" />
      <path d="M 188 38 H 212 V 58 H 234 V 74 H 212 V 170 H 188 V 74 H 166 V 58 H 188 Z" fill="black" />
    </mask>
  </defs>

  <!-- Background rounded canvas -->
  <rect width="512" height="512" rx="108" fill="url(#bgDarkGrad)" />

  <!-- Centered Logo Group scaled to fit 512x512 -->
  <g transform="translate(56, 36) scale(1.0)">
    <g id="sunburst-rays-dark" mask="url(#crossCutoutMaskDark)">
      <path d="M 24 150 C 35 125 58 105 88 90 L 175 145 C 120 162 70 168 24 150 Z" fill="url(#rayOrangeGrad)" />
      <path d="M 68 84 C 95 62 130 46 166 38 L 186 138 C 145 145 106 156 68 84 Z" fill="url(#rayOrangeGrad)" />
      <path d="M 148 30 C 182 20 218 20 252 30 L 222 155 C 208 156 192 156 178 155 Z" fill="url(#rayOrangeGrad)" />
      <path d="M 234 38 C 270 46 305 62 332 84 L 332 84 C 294 156 255 145 214 138 Z" fill="url(#rayOrangeGrad)" />
      <path d="M 312 90 C 342 105 365 125 376 150 C 330 168 280 162 225 145 Z" fill="url(#rayOrangeGrad)" />
    </g>

    <path d="M 188 38 H 212 V 58 H 234 V 74 H 212 V 158 H 188 V 74 H 166 V 58 H 188 Z" fill="#141824" />

    <path d="M 6 135 C 40 200 135 220 215 190 C 295 160 365 175 394 200 C 360 215 285 192 215 198 C 120 206 48 220 6 135 Z" fill="url(#navyWaveGradDark)" />
    <path d="M 95 210 C 165 218 250 202 320 196 C 362 192 384 200 396 216 C 368 225 320 212 258 214 C 185 218 135 216 95 210 Z" fill="url(#cyanWaveGradMain)" />

    <text x="200" y="325" font-family="'Playfair Display', Georgia, serif" font-size="50" font-style="italic" font-weight="bold" fill="#FFFFFF" text-anchor="middle">El-Shaddai</text>
    <text x="200" y="365" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" letter-spacing="5" fill="#FED65B" text-anchor="middle">DIOS TODOPODEROSO</text>
  </g>
</svg>
`;

async function generateAll() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'logo-light.svg'), svgEmblem);
  fs.writeFileSync(path.join(publicDir, 'logo-dark.svg'), svgDarkEmblem);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgEmblem);

  const svgBuffer = Buffer.from(svgEmblem);

  // Generate 512x512
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon.png'));

  // Generate 192x192
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Generate dark mode icons
  const svgDarkBuffer = Buffer.from(svgDarkEmblem);
  await sharp(svgDarkBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-dark-512.png'));
  await sharp(svgDarkBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-dark-192.png'));

  // Also update in dist if exists
  const distDir = path.resolve('dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'logo-light.svg'), svgEmblem);
    fs.writeFileSync(path.join(distDir, 'logo-dark.svg'), svgDarkEmblem);
    fs.writeFileSync(path.join(distDir, 'favicon.svg'), svgEmblem);
    await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(distDir, 'icon-512.png'));
    await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(distDir, 'icon.png'));
    await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(distDir, 'icon-192.png'));
    await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(distDir, 'apple-touch-icon.png'));
  }

  console.log('Successfully generated all new El-Shaddai church logo PNG and SVG icons!');
}

generateAll().catch(console.error);

