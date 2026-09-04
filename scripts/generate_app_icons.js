import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceLogoPath = path.resolve('flutter/assets/shaddai-logo.png');

async function buildIcons() {
  if (!fs.existsSync(sourceLogoPath)) {
    throw new Error(`Source logo not found at ${sourceLogoPath}`);
  }

  console.log('Reading source logo from:', sourceLogoPath);

  // Trim transparent borders from the source logo
  const trimmedBuffer = await sharp(sourceLogoPath).trim().toBuffer();
  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  console.log('Trimmed source logo dimensions:', trimmedMeta.width, 'x', trimmedMeta.height);

  // 1. Create the Master 1024x1024 Square App Icon with White Background
  // Safe margin for standard icons: width = 840px, centered
  const logoTargetWidth = 840;
  const logoResizedForStandard = await sharp(trimmedBuffer)
    .resize(logoTargetWidth, null, { fit: 'inside' })
    .toBuffer();
  
  const standardLogoMeta = await sharp(logoResizedForStandard).metadata();
  const leftStandard = Math.round((1024 - standardLogoMeta.width) / 2);
  const topStandard = Math.round((1024 - standardLogoMeta.height) / 2);

  const masterIcon1024Buffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: logoResizedForStandard,
        left: leftStandard,
        top: topStandard,
      },
    ])
    .png()
    .toBuffer();

  // 2. Create the Android Adaptive Foreground Icon (1024x1024 transparent canvas,
  // safe circular zone diameter = 682px, width = 600px centered)
  const logoForegroundWidth = 600;
  const logoResizedForForeground = await sharp(trimmedBuffer)
    .resize(logoForegroundWidth, null, { fit: 'inside' })
    .toBuffer();
  
  const fgLogoMeta = await sharp(logoResizedForForeground).metadata();
  const leftFg = Math.round((1024 - fgLogoMeta.width) / 2);
  const topFg = Math.round((1024 - fgLogoMeta.height) / 2);

  const masterForeground1024Buffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      {
        input: logoResizedForForeground,
        left: leftFg,
        top: topFg,
      },
    ])
    .png()
    .toBuffer();

  // Helper to ensure directory exists
  const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  };

  // --- SAVE TO FLUTTER ASSETS ---
  const flutterAssetsImages = path.resolve('flutter/assets/images');
  ensureDir(flutterAssetsImages);

  fs.writeFileSync(path.join(flutterAssetsImages, 'icon.png'), masterIcon1024Buffer);
  fs.writeFileSync(path.join(flutterAssetsImages, 'icon_foreground.png'), masterForeground1024Buffer);
  fs.writeFileSync(path.join(flutterAssetsImages, 'app_icon.png'), masterIcon1024Buffer);

  const flutterAssetsIcon = path.resolve('flutter/assets/icon');
  ensureDir(flutterAssetsIcon);
  fs.writeFileSync(path.join(flutterAssetsIcon, 'icon.png'), masterIcon1024Buffer);
  fs.writeFileSync(path.join(flutterAssetsIcon, 'icon_foreground.png'), masterForeground1024Buffer);

  console.log('Saved Flutter master assets to flutter/assets/images/ and flutter/assets/icon/');

  // --- GENERATE ANDROID NATIVE MIPMAP ICONS ---
  const androidResDir = path.resolve('flutter/android/app/src/main/res');
  ensureDir(androidResDir);

  const androidMipmaps = [
    { dir: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
  ];

  for (const m of androidMipmaps) {
    const targetDir = path.join(androidResDir, m.dir);
    ensureDir(targetDir);

    // Standard square launcher icon
    await sharp(masterIcon1024Buffer)
      .resize(m.iconSize, m.iconSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // Round launcher icon (pre-masked circle for legacy launchers)
    const circleMask = Buffer.from(
      `<svg width="${m.iconSize}" height="${m.iconSize}"><circle cx="${m.iconSize / 2}" cy="${m.iconSize / 2}" r="${m.iconSize / 2}" fill="white"/></svg>`
    );
    const roundIcon = await sharp(masterIcon1024Buffer)
      .resize(m.iconSize, m.iconSize)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), roundIcon);

    // Adaptive foreground icon
    await sharp(masterForeground1024Buffer)
      .resize(m.fgSize, m.fgSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated Android ${m.dir} icons`);
  }

  // Generate mipmap-anydpi-v26 for Android 8.0+ adaptive icons
  const anydpiDir = path.join(androidResDir, 'mipmap-anydpi-v26');
  ensureDir(anydpiDir);

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml);
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml);

  // Generate values/colors.xml and values/ic_launcher_background.xml
  const valuesDir = path.join(androidResDir, 'values');
  ensureDir(valuesDir);
  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
`;
  fs.writeFileSync(path.join(valuesDir, 'colors.xml'), colorsXml);
  fs.writeFileSync(path.join(valuesDir, 'ic_launcher_background.xml'), colorsXml);

  console.log('Generated Android adaptive XML and resource values');

  // --- GENERATE IOS NATIVE APPICON ASSET CATALOG ---
  const iosAppIconDir = path.resolve('flutter/ios/Runner/Assets.xcassets/AppIcon.appiconset');
  ensureDir(iosAppIconDir);

  const iosIcons = [
    { name: 'Icon-App-20x20@1x.png', size: 20, idiom: 'ipad', scale: '1x' },
    { name: 'Icon-App-20x20@2x.png', size: 40, idiom: 'iphone', scale: '2x' },
    { name: 'Icon-App-20x20@3x.png', size: 60, idiom: 'iphone', scale: '3x' },
    { name: 'Icon-App-29x29@1x.png', size: 29, idiom: 'ipad', scale: '1x' },
    { name: 'Icon-App-29x29@2x.png', size: 58, idiom: 'iphone', scale: '2x' },
    { name: 'Icon-App-29x29@3x.png', size: 87, idiom: 'iphone', scale: '3x' },
    { name: 'Icon-App-40x40@1x.png', size: 40, idiom: 'ipad', scale: '1x' },
    { name: 'Icon-App-40x40@2x.png', size: 80, idiom: 'iphone', scale: '2x' },
    { name: 'Icon-App-40x40@3x.png', size: 120, idiom: 'iphone', scale: '3x' },
    { name: 'Icon-App-60x60@2x.png', size: 120, idiom: 'iphone', scale: '2x' },
    { name: 'Icon-App-60x60@3x.png', size: 180, idiom: 'iphone', scale: '3x' },
    { name: 'Icon-App-76x76@1x.png', size: 76, idiom: 'ipad', scale: '1x' },
    { name: 'Icon-App-76x76@2x.png', size: 152, idiom: 'ipad', scale: '2x' },
    { name: 'Icon-App-83.5x83.5@2x.png', size: 167, idiom: 'ipad', scale: '2x' },
    { name: 'Icon-App-1024x1024@1x.png', size: 1024, idiom: 'ios-marketing', scale: '1x' },
  ];

  for (const icon of iosIcons) {
    await sharp(masterIcon1024Buffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(iosAppIconDir, icon.name));
  }

  // Create iOS Contents.json
  const contentsJson = {
    images: [
      { size: "20x20", idiom: "iphone", filename: "Icon-App-20x20@2x.png", scale: "2x" },
      { size: "20x20", idiom: "iphone", filename: "Icon-App-20x20@3x.png", scale: "3x" },
      { size: "29x29", idiom: "iphone", filename: "Icon-App-29x29@2x.png", scale: "2x" },
      { size: "29x29", idiom: "iphone", filename: "Icon-App-29x29@3x.png", scale: "3x" },
      { size: "40x40", idiom: "iphone", filename: "Icon-App-40x40@2x.png", scale: "2x" },
      { size: "40x40", idiom: "iphone", filename: "Icon-App-40x40@3x.png", scale: "3x" },
      { size: "60x60", idiom: "iphone", filename: "Icon-App-60x60@2x.png", scale: "2x" },
      { size: "60x60", idiom: "iphone", filename: "Icon-App-60x60@3x.png", scale: "3x" },
      { size: "20x20", idiom: "ipad", filename: "Icon-App-20x20@1x.png", scale: "1x" },
      { size: "20x20", idiom: "ipad", filename: "Icon-App-20x20@2x.png", scale: "2x" },
      { size: "29x29", idiom: "ipad", filename: "Icon-App-29x29@1x.png", scale: "1x" },
      { size: "29x29", idiom: "ipad", filename: "Icon-App-29x29@2x.png", scale: "2x" },
      { size: "40x40", idiom: "ipad", filename: "Icon-App-40x40@1x.png", scale: "1x" },
      { size: "40x40", idiom: "ipad", filename: "Icon-App-40x40@2x.png", scale: "2x" },
      { size: "76x76", idiom: "ipad", filename: "Icon-App-76x76@1x.png", scale: "1x" },
      { size: "76x76", idiom: "ipad", filename: "Icon-App-76x76@2x.png", scale: "2x" },
      { size: "83.5x83.5", idiom: "ipad", filename: "Icon-App-83.5x83.5@2x.png", scale: "2x" },
      { size: "1024x1024", idiom: "ios-marketing", filename: "Icon-App-1024x1024@1x.png", scale: "1x" }
    ],
    info: {
      version: 1,
      author: "xcode"
    }
  };

  fs.writeFileSync(
    path.join(iosAppIconDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );

  console.log('Generated complete iOS AppIcon.appiconset with Contents.json');

  // --- ALSO SYNC WITH WEB / PUBLIC PWA ICONS ---
  const publicDir = path.resolve('public');
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, 'icon.png'), masterIcon1024Buffer);
    await sharp(masterIcon1024Buffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
    await sharp(masterIcon1024Buffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
    await sharp(masterIcon1024Buffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Synchronized web / PWA public icons as well');
  }

  console.log('All icons generated successfully!');
}

buildIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
