(() => {
  // ===== ARCADE DISPLAY SCALING =====
  // Dynamically scale the entire game to fit any screen size (especially for rotated arcade monitors)
  function scaleGameToScreen() {
    const app = document.querySelector('.app');
    if (!app) return;
    
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    
    // Base design dimensions (9:16 aspect ratio)
    const baseWidth = 360;
    const baseHeight = 640;
    
    // Calculate scale to fill screen while maintaining aspect ratio
    const scaleX = availableWidth / baseWidth;
    const scaleY = availableHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Apply scale transform to the entire app container
    app.style.transform = `scale(${scale})`;
    app.style.transformOrigin = 'center center';
    
    console.log(`🎮 Arcade Scale: ${scale.toFixed(2)}x (${availableWidth}x${availableHeight})`);
  }

  // Apply scaling on load and window resize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scaleGameToScreen);
  } else {
    scaleGameToScreen();
  }
  window.addEventListener('resize', scaleGameToScreen);
  window.addEventListener('orientationchange', scaleGameToScreen);
  // ==================================

  // ===== SEED CONFIGURATION =====
  // Set USE_WEEKLY_SEED to false to use a fixed manual seed
  // Set USE_WEEKLY_SEED to true to change the seed weekly (every Monday at midnight)
  const USE_WEEKLY_SEED = false;  // Toggle this to switch between modes
  const MANUAL_SEED = "34125";       // Your fixed seed (number or week key like "2026-W03" to test future weeks)
  const POWERUP_SEED = "65236";      // Static seed for powerup spawning (change this to modify powerup positions)
  const SURVIVAL_STATIC_SEED = "StickerSnatch99"; // Static seed for survival mode
  // ==============================

  // ===== DEBUG MODE =====
  // Set to true to enable level skip shortcuts (press 2, 3, or 4 on title screen)
  // Set to false to disable debug shortcuts for production
  const DEBUG_MODE = false;  // ⚠️ SET TO FALSE BEFORE DEPLOYING
  // ======================

  // ===== SURVIVAL MODE FEATURE FLAG =====
  // Survival mode disabled for arcade cabinet version
  const SURVIVAL_MODE_ENABLED = false;
  // ======================================
  
  // ===== ARCADE CABINET CONTROLS =====
  // Joystick (4-way): Maps to Arrow Keys
  //   UP    → ArrowUp (menu navigation)
  //   DOWN  → ArrowDown (menu navigation)
  //   LEFT  → ArrowLeft (gameplay + menu navigation)
  //   RIGHT → ArrowRight (gameplay + menu navigation)
  // 
  // Button 1: Maps to Enter key (primary action/select)
  // Button 2: Maps to Space key (secondary action/select)
  // Both buttons work identically for menu selection
  // 
  // Coin Acceptor: Will map to '5' key (standard arcade credit key)
  // 
  // Note: UP/DOWN are ignored during gameplay (only LEFT/RIGHT used)
  // =======================================
  
  // ===== WORDPRESS COMPATIBILITY =====
  // Support dynamic base URL for WordPress while maintaining standalone functionality
  // WordPress will set window.STICKERSNATCH_BASE_URL, otherwise defaults to relative paths
  const BASE_URL = (typeof window.STICKERSNATCH_BASE_URL !== 'undefined') 
    ? window.STICKERSNATCH_BASE_URL 
    : '';
  // ====================================

  // ===== GAME CONFIGURATION (EASY ACCESS) =====
  // All important gameplay settings consolidated here for easy tuning

  // Gameplay
  const LIVES_START = 3;
  const LIVES_MAX = 10;
  const EXTRA_LIFE_STICKER_THRESHOLD = 25; // Stickers needed per extra life
  const RUN_TIME = 60;
  const MAX_LEVEL = 3;

  // Level-based difficulty settings
  const LEVEL_CONFIG = {
    1: {
      scrollSpeed: 300,
      spawnMin: 0.32,
      spawnMax: 0.53,
      doubleSpawnChance: 0.30,
      bigAsteroidChance: 0.24
    },
    2: {
      scrollSpeed: 340,
      spawnMin: 0.28,
      spawnMax: 0.48,
      doubleSpawnChance: 0.35,
      bigAsteroidChance: 0.28
    },
    3: {
      scrollSpeed: 380,
      spawnMin: 0.24,
      spawnMax: 0.44,
      doubleSpawnChance: 0.40,
      bigAsteroidChance: 0.32
    }
  };

  // Level-specific powerup configuration
  // Defines which 2 powerups spawn for each level (SHIELD always spawns separately)
  const LEVEL_POWERUPS = {
    1: ["2X", "DRUNK"],      // Level 1: TURNT & MAGNET
    2: ["DRUNK", "TIME"],    // Level 2: TIME WARP & TURNT
    3: ["TIME", "2X"]        // Level 3: MAGNET & TIME WARP
  };

  // Optional overrides specifically for the secret level. Set to `null` to
  // inherit from LEVEL_CONFIG[3], or set a value to override.
  const SECRET_LEVEL_OVERRIDES = {
    WORLD_SCROLL_SPEED: 360, // e.g. 380
    SPAWN_MIN: 0.24,         // e.g. 0.24
    SPAWN_MAX: 0.44,         // e.g. 0.44
    DOUBLE_SPAWN_CHANCE: 0.40,// e.g. 0.40
    BIG_ASTEROID_CHANCE: 0.32,// e.g. 0.32
    TIME_LEFT: 120          // e.g. 120 (seconds)
  };

  // ===== THEME COLOR SYSTEM =====
  // Dynamic theme color that can be changed at runtime
  let THEME_COLOR = '#E0FF00'; // Default STICKER GOAT yellow-green
  
  // Helper function to convert hex to rgb object
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 243, g: 226, b: 0 }; // Default to yellow
  }
  
  // Helper function to get theme color with opacity
  function getThemeColor(opacity = 1) {
    const rgb = hexToRgb(THEME_COLOR);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }
  
  // Helper function to get theme color as rgb object
  function getThemeRgb() {
    return hexToRgb(THEME_COLOR);
  }
  
  // Helper function to darken a color (reduce brightness by percentage)
  function darkenColor(rgb, percentage = 0.4) {
    return {
      r: Math.round(rgb.r * percentage),
      g: Math.round(rgb.g * percentage),
      b: Math.round(rgb.b * percentage)
    };
  }
  
  // Recolor an image by replacing yellow pixels with theme color
  function recolorImage(sourceImage, targetColor) {
    if (!sourceImage || !sourceImage.complete) return sourceImage;
    
    const canvas = document.createElement('canvas');
    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(sourceImage, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Parse target color
    const targetRgb = hexToRgb(targetColor);
    const darkTargetRgb = darkenColor(targetRgb, 0.4); // 40% brightness for dark shade
    
    // Define bright yellow range (original color to replace)
    // Expanded to include #def30c (rgb(222, 243, 12))
    const brightYellowMin = { r: 220, g: 210, b: 0 };
    const brightYellowMax = { r: 255, g: 255, b: 20 };
    
    // Define dark yellow range (darker shade in logo)
    // Dark yellow is roughly r:150-200, g:135-180, b:0-10
    const darkYellowMin = { r: 140, g: 125, b: 0 };
    const darkYellowMax = { r: 210, g: 190, b: 15 };
    
    // Replace yellow pixels with theme color
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip transparent pixels
      if (a === 0) continue;
      
      // Check if pixel is bright yellow
      if (r >= brightYellowMin.r && r <= brightYellowMax.r &&
          g >= brightYellowMin.g && g <= brightYellowMax.g &&
          b >= brightYellowMin.b && b <= brightYellowMax.b) {
        // Replace with bright target color
        data[i] = targetRgb.r;
        data[i + 1] = targetRgb.g;
        data[i + 2] = targetRgb.b;
      }
      // Check if pixel is dark yellow
      else if (r >= darkYellowMin.r && r <= darkYellowMax.r &&
               g >= darkYellowMin.g && g <= darkYellowMax.g &&
               b >= darkYellowMin.b && b <= darkYellowMax.b) {
        // Replace with dark target color
        data[i] = darkTargetRgb.r;
        data[i + 1] = darkTargetRgb.g;
        data[i + 2] = darkTargetRgb.b;
      }
      // Keep original alpha in all cases
    }
    
    // Put modified image data back
    ctx.putImageData(imageData, 0, 0);
    
    // Create new image from canvas
    const recoloredImg = new Image();
    recoloredImg.src = canvas.toDataURL();
    return recoloredImg;
  }
  
  // Store original (yellow) versions of images for recoloring
  let originalTitleFrames = [];
  let originalBannerImg = null;
  let originalPlayerImg = null;
  let originalPlayerCrashImg = null;
  
  // Function to recolor all theme-dependent images
  function recolorThemeImages(color) {
    // Recolor title frames
    if (originalTitleFrames.length > 0 && titleFrameImages.length > 0) {
      const recoloredFrames = originalTitleFrames.map(img => recolorImage(img, color));
      // Update titleFrameImages array
      titleFrameImages[0] = recoloredFrames[0]; // frame1_3
      titleFrameImages[1] = recoloredFrames[1]; // frame2
      titleFrameImages[2] = recoloredFrames[0]; // frame1_3 (repeat)
      titleFrameImages[3] = recoloredFrames[2]; // frame4
      
      // Update current displayed logo if visible
      if (gameLogo && titleFrameImages[titleFrameIndex]) {
        gameLogo.src = titleFrameImages[titleFrameIndex].src;
      }
    }
    
    // Recolor banner
    if (originalBannerImg && bannerImg) {
      const recoloredBanner = recolorImage(originalBannerImg, color);
      // Update immediately - dimensions are preserved from canvas
      bannerImg.src = recoloredBanner.src;
    }
    
    // Recolor player sprites
    if (originalPlayerImg && assets && assets.player) {
      const recoloredPlayer = recolorImage(originalPlayerImg, color);
      assets.player = recoloredPlayer;
    }
    if (originalPlayerCrashImg && assets && assets.playerCrash) {
      const recoloredCrash = recolorImage(originalPlayerCrashImg, color);
      assets.playerCrash = recoloredCrash;
    }
  }
  // ==============================

  // Player
  const PLAYER_Y = 470;
  const PLAYER_W = 62;
  const PLAYER_H = 59;
  const PLAYER_STEP = 22;
  const PLAYER_MARGIN = 20;
  const HOLD_MOVE_SPEED = 260; // pixels per second when holding left/right
  const DRUNK_MOVE_SPEED = 190; // reduced speed during DRUNK powerup

  // Collision
  const PLAYER_COLLISION_RADIUS = 16;

  // Stickers (uses separate PRNG instance - safe to change)
  const STICKER_TARGET_W = 38;
  const STICKER_SPAWN_CHANCE = 0.75;
  const STICKER_ROT_RANGE = 0.9;
  const THICK_STICKER_CHANCE = 0.25;

  // Asteroid sizing - discrete sizes for clean scaling
  const ASTEROID_SMALL_SIZES = [28, 32, 36, 40, 44, 48];  // Small asteroid (64px source) - wider spread, smaller
  const ASTEROID_MEDIUM_SIZES = [64, 72, 80, 88, 96, 104, 112, 120, 128];  // ast1/ast2 (128px sources)
  const ASTEROID_LARGE_SIZES = [192, 192, 192, 192, 256, 160, 176, 208];  // ast3 (256px source) - defaults to 192px

  // =============================================

  const ASSETS = {
    background: `${BASE_URL}assets/new-background.jpg`,
    webp: {
      player: `${BASE_URL}assets/sprites/player-goat.png`,
      playerCrash: `${BASE_URL}assets/sprites/player-goat-crash.png`,
      goatIcon: `${BASE_URL}assets/webp/goat-icon.webp`,
      sticker: `${BASE_URL}assets/sprites/sticker.png`,
      thickSticker: `${BASE_URL}assets/sprites/thick-stick.png`,
      earth: `${BASE_URL}assets/sprites/earth2.png`,
      moon: `${BASE_URL}assets/sprites/moon.png`,
      banner: `${BASE_URL}assets/sprites/banner.png`,

      // New asteroid assets with hit states
      asteroidSmall: `${BASE_URL}assets/asteroids/smallast.png`,
      asteroidSmall2: `${BASE_URL}assets/asteroids/smallast2.png`,
      asteroidSmall3: `${BASE_URL}assets/asteroids/smallast3.png`,
      asteroid1: `${BASE_URL}assets/asteroids/ast1.png`,
      asteroid1Hit: `${BASE_URL}assets/asteroids/ast1-hit.png`,
      asteroid2: `${BASE_URL}assets/asteroids/ast2.png`,
      asteroid2Hit: `${BASE_URL}assets/asteroids/ast2-hit.png`,
      asteroid3: `${BASE_URL}assets/asteroids/ast3.png`,
      asteroid3Hit: `${BASE_URL}assets/asteroids/ast3-hit.png`,

      // Boss assets
      bren1: `${BASE_URL}assets/sprites/bren1.png`,
      bren2: `${BASE_URL}assets/sprites/bren2.png`,
      bren3: `${BASE_URL}assets/sprites/bren3.png`,
      
      // Credits assets
      surfGoat: `${BASE_URL}assets/sprites/surf-goat.png`,
    },
    credits: {
      surfBg: `${BASE_URL}assets/surf-bg.png`,
    },
    powerups: {
      twoX: `${BASE_URL}assets/powerups/magnet.png`,
      drunk: `${BASE_URL}assets/powerups/turnt.png`,
      shield: `${BASE_URL}assets/powerups/shield.png`,
      time: `${BASE_URL}assets/powerups/time.png`,
    },
    titleFrames: {
      frame1_3: `${BASE_URL}assets/title/stickersnatch-title-1-3.png`,
      frame2: `${BASE_URL}assets/title/stickersnatch-title-2.png`,
      frame4: `${BASE_URL}assets/title/stickersnatch-title-4.png`,
    },
    konami: {
      sandBackground: `${BASE_URL}assets/konami/sand-background.jpg`,
      boulder: `${BASE_URL}assets/konami/boulder.png`,
      pyramid: `${BASE_URL}assets/konami/pyramid.png`,
      sphynx: `${BASE_URL}assets/konami/sphynx.png`,
    },
    sounds: {
      move: `${BASE_URL}assets/sounds/turn.mp3`,
      grab: `${BASE_URL}assets/sounds/sticker.mp3`,
      thickGrab: `${BASE_URL}assets/sounds/thick-sticker.mp3`,
      menuCursor: `${BASE_URL}assets/sounds/cursor.mp3`,
      menuSelect: `${BASE_URL}assets/sounds/select.mp3`,
      getMagnet: `${BASE_URL}assets/sounds/get-magnet.mp3`,
      magnetEnd: `${BASE_URL}assets/sounds/magnet-end.mp3`,
      getBeer: `${BASE_URL}assets/sounds/get-beer-2.mp3`,
      belch: `${BASE_URL}assets/sounds/belch-2.mp3`,
      hit: `${BASE_URL}assets/sounds/collision-2.mp3`,
      c321: `${BASE_URL}assets/sounds/321-2.mp3`,
      start: `${BASE_URL}assets/sounds/go-2.mp3`,
      levelDisplay: `${BASE_URL}assets/sounds/collision-1.mp3`,
      finalSeconds: `${BASE_URL}assets/sounds/321-1.mp3`,
      extraLife: `${BASE_URL}assets/sounds/extra-life.mp3`,
      oneUp: `${BASE_URL}assets/sounds/one-up.mp3`,
      // TIME WARP powerup sounds
      clockGet: `${BASE_URL}assets/sounds/clock-get-2.mp3`,
      clockTick: `${BASE_URL}assets/sounds/clock-tick.mp3`,
      timerMenu: `${BASE_URL}assets/sounds/timer+menu.mp3`,
      clockEnd: `${BASE_URL}assets/sounds/clock-end-2.mp3`,
      // SHIELD powerup sound
      shieldGet: `${BASE_URL}assets/sounds/sheild-get-1.mp3`,
      mainGameMusic: `${BASE_URL}assets/music/og.mp3`,
      mainGameMusic2X: `${BASE_URL}assets/music/2x.mp3`,
      mainGameMusicTurnt: `${BASE_URL}assets/music/drunk.mp3`,
      bossMusic: `${BASE_URL}assets/sounds/boss-music.mp3`,
      winMusic: `${BASE_URL}assets/sounds/win-music.mp3`,
      creditMusic: `${BASE_URL}assets/music/credit-music.mp3`,
      secretLevelMusic: `${BASE_URL}assets/sounds/secret-level-music.mp3`,
      survivalMusic: `${BASE_URL}assets/music/title.mp3`,
      gameIntroMusic: `${BASE_URL}assets/music/game-intro-music.mp3`,
      // Boss taunt audio clips
      holler: `${BASE_URL}assets/sounds/holler.mp3`,
      fcuk: `${BASE_URL}assets/sounds/fcku.mp3`,
      map: `${BASE_URL}assets/sounds/map.mp3`,
      jpeg: `${BASE_URL}assets/sounds/jpeg.mp3`,
      bitch: `${BASE_URL}assets/sounds/lilbitch.mp3`,
      thick: `${BASE_URL}assets/sounds/thick.mp3`,
      nooooo: `${BASE_URL}assets/sounds/nooooo.mp3`,
    }
  };

  // Virtual resolution
  const W = 360;
  const H = 640;

  // Boss level constants
  const BOSS_ENTER_DELAY = 2.0;  // seconds before boss enters
  const BOSS_ENTER_SPEED = 80;   // pixels per second descending
  const BOSS_Y_STOP = 50;        // y position where boss stops (raised from 80)
  const BOSS_BLINK_INTERVAL = 0.5; // switch between bren1/bren2
  const BOSS_ARM_SPEED = 300;    // asteroid arming descent speed
  const BOSS_ARM_Y = 180;        // y position where asteroids stop (armed) - raised from 240
  const BOSS_ARM_DELAY = 2.0;    // delay after arming before throw
  const BOSS_THROW_SPEED = 480;  // speed of thrown asteroids
  const BOSS_STAGGER_DELAY = 0.15; // delay between staggered throws
  const BOSS_VICTORY_DELAY = 3.0;  // show bren3 before win
  const BOSS_ASTEROID_SIZE = 70;   // size of boss asteroids

  let WORLD_SCROLL_SPEED = 280;

  // Background scroll speed (pattern)
  const BG_SCROLL_SPEED = 40;

  // Player rotation (visual only, does not affect gameplay)
  const PLAYER_ROT_LEFT = -0.436;   // -25° in radians
  const PLAYER_ROT_RIGHT = 0.436;   // +25° in radians
  const PLAYER_ROT_NEUTRAL = 0;     // 0° upright
  const PLAYER_ROT_SNAP_SPEED = 0.25; // Lerp factor for smooth snap-back

  // Spawning (dynamic, set by current level)
  let SPAWN_MIN = 0.32;
  let SPAWN_MAX = 0.52;
  let DOUBLE_SPAWN_CHANCE = 0.32;

  let BIG_ASTEROID_CHANCE = 0.22;

  // Barely rotating
  const ASTEROID_SPIN_MIN = 0.01;
  const ASTEROID_SPIN_MAX = 0.05;

  // Trail configuration
  const TRAIL_MAX_POINTS = 15; // Maximum trail points
  const TRAIL_SPAWN_INTERVAL = 0.02; // Spawn a trail point every 20ms
  const TRAIL_LIFETIME = 0.4; // How long each trail point lives (seconds)
  const TRAIL_WIDTH = 24; // Base width of trail (wider to match player size)
  let trailSpawnTimer = 0; // Timer for spawning trail points

  // Countdown
  const COUNTDOWN_TOTAL = 2.3;
  const COUNTDOWN_LEVEL_DURATION = 2.0;

  // Out of time overlay duration
  const OUT_OF_TIME_DURATION = 1.0;

  // Weekly seed keys
  const LS_WEEKLY_DATE = "ss_weekly_date_v4";
  const LS_WEEKLY_SEED = "ss_weekly_seed_v4";
  const LS_LEADERBOARD = "ss_leaderboard_v1";
  const LS_MONTHLY_LEADERBOARD = "ss_monthly_leaderboard_v1";
  const LS_LEADERBOARD_MONTH = "ss_leaderboard_month_v1";
  const LS_WEEKLY_LEADERBOARD = "ss_weekly_leaderboard_v1";
  const LS_LEADERBOARD_WEEK = "ss_leaderboard_week_v1";

  // Settings localStorage keys
  const LS_MUSIC_VOLUME = "settings_music";
  const LS_SFX_VOLUME = "settings_sfx";
  const LS_HAPTICS_ENABLED = "settings_haptics";

  // Stats localStorage keys
  const LS_PERSONAL_BEST = "ss_personal_best";
  const LS_TOTAL_GAMES = "ss_total_games";
  const LS_TOTAL_STICKERS = "ss_total_stickers_collected";
  const LS_BEST_STICKER_COUNT = "ss_best_sticker_count";
  
  // Achievements localStorage key
  const LS_ACHIEVEMENTS = "ss_achievements_unlocked";

  // Tutorial localStorage key
  const LS_TUTORIAL_SHOWN = "ss_tutorial_shown";

  // ===== ARCADE CREDIT SYSTEM =====
  const LS_ARCADE_CREDITS = "ss_arcade_credits";
  const CREDITS_PER_COIN = 1; // How many credits per coin inserted
  // ===== END ARCADE CREDIT SYSTEM =====

  // DOM
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { 
    alpha: false,              // Disable transparency for faster compositing
    willReadFrequently: false  // Optimize for drawing, not reading
  });
  
  // Disable image smoothing for crisp pixel-art rendering
  ctx.imageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;

  const shell = document.getElementById("gameShell");

  const gameLogo = document.getElementById("gameLogo");
  const titleOverlay = document.getElementById("titleOverlay");
  const startOverlay = document.getElementById("startOverlay");
  const countdownOverlay = document.getElementById("countdownOverlay");
  const countdownText = document.getElementById("countdownText");
  const bossIntroOverlay = document.getElementById("bossIntroOverlay");
  const winOverlay = document.getElementById("winOverlay");
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const survivalGameOverOverlay = document.getElementById("survivalGameOverOverlay");
  const survivalTryAgainBtn = document.getElementById("survivalTryAgainBtn");
  const survivalMainMenuBtn = document.getElementById("survivalMainMenuBtn");
  const survivalShareBtn = document.getElementById("survivalShareBtn");
  const survivalOrderStickersBtn = document.getElementById("survivalOrderStickersBtn");
  const survivalNameInput = document.getElementById("survivalNameInput");
  const survivalSubmitNameBtn = document.getElementById("survivalSubmitNameBtn");
  const survivalStatusMessage = document.getElementById("survivalStatusMessage");
  const survivalEmailInput = document.getElementById("survivalEmailInput");
  const outOfTimeOverlay = document.getElementById("outOfTimeOverlay");
  
  // ===== ARCADE NAME ENTRY DOM ELEMENTS =====
  const arcadeNameEntryOverlay = document.getElementById("arcadeNameEntryOverlay");
  const arcadeEntryTitle = document.getElementById("arcadeEntryTitle");
  const arcadeNameDisplay = document.getElementById("arcadeNameDisplay");
  const arcadeAlphabetGrid = document.getElementById("arcadeAlphabetGrid");
  const arcadeBackspaceBtn = document.getElementById("arcadeBackspaceBtn");
  const arcadeEnterBtn = document.getElementById("arcadeEnterBtn");
  const arcadeCancelBtn = document.getElementById("arcadeCancelBtn");
  // ===== END ARCADE NAME ENTRY DOM =====
  
  const menuOverlay = document.getElementById("menuOverlay");
  const howToPlayOverlay = document.getElementById("howToPlayOverlay");
  const leaderboardOverlay = document.getElementById("leaderboardOverlay");
  const settingsOverlay = document.getElementById("settingsOverlay");
  const statsOverlay = document.getElementById("statsOverlay");
  const pauseOverlay = document.getElementById("pauseOverlay");
  const pauseMainCard = document.getElementById("pauseMainCard");
  const pauseConfirmCard = document.getElementById("pauseConfirmCard");
  const pauseContinueBtn = document.getElementById("pauseContinueBtn");
  const pauseSettingsBtn = document.getElementById("pauseSettingsBtn");
  const pauseOrderStickersBtn = document.getElementById("pauseOrderStickersBtn");
  const pauseLeaderboardBtn = document.getElementById("pauseLeaderboardBtn");
  const pauseMainMenuBtn = document.getElementById("pauseMainMenuBtn");
  const pauseCloseBtn = document.getElementById("pauseCloseBtn");
  const pauseConfirmYes = document.getElementById("pauseConfirmYes");
  const pauseConfirmNo = document.getElementById("pauseConfirmNo");

  // Konami Code Elements
  const konamiOverlay = document.getElementById("konamiOverlay");
  const konamiBBtn = document.getElementById("konamiBBtn");
  const konamiABtn = document.getElementById("konamiABtn");
  const konamiStartBtn = document.getElementById("konamiStartBtn");
  
  // Secret Level Overlays
  const secretWinOverlay = document.getElementById("secretWinOverlay");
  const secretWinReturnBtn = document.getElementById("secretWinReturnBtn");
  const secretGameOverOverlay = document.getElementById("secretGameOverOverlay");
  const secretGameOverTryAgainBtn = document.getElementById("secretGameOverTryAgainBtn");
  const secretGameOverReturnBtn = document.getElementById("secretGameOverReturnBtn");

  const livesText = document.getElementById("livesText");
  const pointsText = document.getElementById("pointsText");
  const stickersText = document.getElementById("stickersText");

  const hud = document.querySelector(".hud");
  const hudLifeIcon = document.getElementById("hudLifeIcon");
  const hudStickerIcon = document.getElementById("hudStickerIcon");
  const hudPointsBox = document.getElementById("hudPointsBox");
  const pauseInstruction = document.getElementById("pauseInstruction");
  const gestureTutorial = document.getElementById("gestureTutorial");

  const nameInput = document.getElementById("nameInput");
  const emailInput = document.getElementById("emailInput");
  const submitNameBtn = document.getElementById("submitNameBtn");
  const statusMessage = document.getElementById("statusMessage");
  const gameOverNameInput = document.getElementById("gameOverNameInput");
  const gameOverEmailInput = document.getElementById("gameOverEmailInput");
  const gameOverSubmitNameBtn = document.getElementById("gameOverSubmitNameBtn");
  const gameOverStatusMessage = document.getElementById("gameOverStatusMessage");
  const leaderboardList = document.getElementById("leaderboardList");
  const winPlayAgainBtn = document.getElementById("winPlayAgainBtn");
  const winShareBtn = document.getElementById("winShareBtn");
  const winOrderStickersBtn = document.getElementById("winOrderStickersBtn");
  const gameOverPlayAgainBtn = document.getElementById("gameOverPlayAgainBtn");
  const gameOverShareBtn = document.getElementById("gameOverShareBtn");
  const gameOverOrderStickersBtn = document.getElementById("gameOverOrderStickersBtn");
  
  // ===== ARCADE CREDIT DOM ELEMENTS =====
  const arcadeCreditDisplay = document.getElementById("arcadeCreditDisplay");
  const insertCoinMessage = document.getElementById("insertCoinMessage");
  const creditCounter = document.getElementById("creditCounter");
  const creditCount = document.getElementById("creditCount");
  // ===== END ARCADE CREDIT DOM =====
  
  const sharePreviewOverlay = document.getElementById("sharePreviewOverlay");
  const shareCanvas = document.getElementById("shareCanvas");
  const downloadShareBtn = document.getElementById("downloadShareBtn");
  const shareToBtn = document.getElementById("shareToBtn");
  const sharePreviewBackBtn = document.getElementById("sharePreviewBackBtn");
  const startGameBtn = document.getElementById("startGameBtn");
  const playNowBtn = document.getElementById("playNowBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const statsBtn = document.getElementById("statsBtn");
  const howToPlayBtn = document.getElementById("howToPlayBtn");
  const orderStickersBtn = document.getElementById("orderStickersBtn");
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  const howToPlayBackBtn = document.getElementById("howToPlayBackBtn");
  const leaderboardBackBtn = document.getElementById("leaderboardBackBtn");

  // Game mode selection overlay elements
  const gameModeOverlay = document.getElementById("gameModeOverlay");
  const mainGameBtn = document.getElementById("mainGameBtn");
  const survivalGameBtn = document.getElementById("survivalGameBtn"); // Removed from HTML but keep reference for compatibility
  const gameModeBackBtn = document.getElementById("gameModeBackBtn");
  
  // How to play tabs and content
  const howToPlayMainTab = document.getElementById("howToPlayMainTab");
  const howToPlaySurvivalTab = document.getElementById("howToPlaySurvivalTab");
  const mainHowToPlayContent = document.getElementById("mainHowToPlayContent");
  const survivalHowToPlayContent = document.getElementById("survivalHowToPlayContent");
  
  // Stats tabs
  const statsMainTab = document.getElementById("statsMainTab");
  const statsSurvivalTab = document.getElementById("statsSurvivalTab");

  // Leaderboard main tabs
  const leaderboardMainTab = document.getElementById("leaderboardMainTab");
  const leaderboardSurvivalTab = document.getElementById("leaderboardSurvivalTab");
  const mainLeaderboardContent = document.getElementById("mainLeaderboardContent");
  const survivalLeaderboardContent = document.getElementById("survivalLeaderboardContent");
  const survivalLeaderboardList = document.getElementById("survivalLeaderboardList");
  
  // Main game leaderboard time tabs
  const thisWeekTab = document.getElementById("thisWeekTab");
  const thisMonthTab = document.getElementById("thisMonthTab");
  const allTimeTab = document.getElementById("allTimeTab");
  
  // Survival leaderboard time tabs
  const survivalThisWeekTab = document.getElementById("survivalThisWeekTab");
  const survivalThisMonthTab = document.getElementById("survivalThisMonthTab");
  const survivalAllTimeTab = document.getElementById("survivalAllTimeTab");
  
  const settingsBackBtn = document.getElementById("settingsBackBtn");
  const statsBackBtn = document.getElementById("statsBackBtn");

  const statPersonalBest = document.getElementById("statPersonalBest");
  const statTotalGames = document.getElementById("statTotalGames");
  const statTotalStickers = document.getElementById("statTotalStickers");
  const statBestStickerCount = document.getElementById("statBestStickerCount");
  
  // Arcade stats container
  const mainGameStats = document.getElementById("mainGameStats");
  
  // Survival stats elements (removed but referenced)
  const survivalStats = document.getElementById("survivalStats");
  const statSurvivalLongestTime = document.getElementById("statSurvivalLongestTime");
  const statSurvivalHighScore = document.getElementById("statSurvivalHighScore");
  const statSurvivalTotalRuns = document.getElementById("statSurvivalTotalRuns");
  const statSurvivalTotalStickers = document.getElementById("statSurvivalTotalStickers");

  const achievementDetail = document.getElementById("achievementDetail");
  const achievementDetailTitle = document.getElementById("achievementDetailTitle");
  const achievementDetailDesc = document.getElementById("achievementDetailDesc");
  const achievementDetailBackBtn = document.getElementById("achievementDetailBackBtn");

  const musicSlider = document.getElementById("musicSlider");
  const musicValue = document.getElementById("musicValue");
  const sfxSlider = document.getElementById("sfxSlider");
  const sfxValue = document.getElementById("sfxValue");
  const hapticsToggle = document.getElementById("hapticsToggle");
  const themeColorBtn = document.getElementById("themeColorBtn");
  const themeColorOverlay = document.getElementById("themeColorOverlay");
  const themeColorBackBtn = document.getElementById("themeColorBackBtn");

  const bannerImg = document.getElementById("bannerImg");
  const highScoreBanner = document.getElementById("highScoreBanner");

  const achievementNotification = document.getElementById("achievementNotification");
  const achievementNotificationImage = document.getElementById("achievementNotificationImage");
  const achievementNotificationName = document.getElementById("achievementNotificationName");

  // Helpers
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function weekKey() {
    const d = new Date();
    // Get the Monday of the current week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const yyyy = monday.getFullYear();
    // Calculate ISO week number
    const firstDayOfYear = new Date(yyyy, 0, 1);
    const days = Math.floor((monday - firstDayOfYear) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    
    return `${yyyy}-W${String(weekNum).padStart(2, "0")}`;
  }

  function hashToSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let t = seed >>> 0;
    return function() {
      t += 0x6D2B79F5;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getDailyDateKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getDailySeed(level) {
    const dateKey = getDailyDateKey();
    const d = new Date();
    const hour = String(d.getHours()).padStart(2, "0");
    return hashToSeed(`StickerSnatch:PowerupDaily:${dateKey}:Hour${hour}:Level${level}`);
  }

  function circleHit(ax, ay, ar, bx, by, br) {
    const dx = ax - bx;
    const dy = ay - by;
    const rr = ar + br;
    return (dx*dx + dy*dy) <= rr*rr;
  }

  // Ellipse-to-circle collision detection
  // Used for asteroid collisions where asteroids are elliptical
  function ellipseHit(cx, cy, cr, ex, ey, erx, ery, angle = 0) {
    // Translate circle center to ellipse coordinate system
    const dx = cx - ex;
    const dy = cy - ey;
    
    // Rotate point by negative ellipse angle (if ellipse is rotated)
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    
    // Find closest point on ellipse to circle center
    // Using parametric form: x = erx*cos(t), y = ery*sin(t)
    const theta = Math.atan2(localY * erx, localX * ery);
    const closestX = erx * Math.cos(theta);
    const closestY = ery * Math.sin(theta);
    
    // Check distance from circle center to closest point
    const distX = localX - closestX;
    const distY = localY - closestY;
    const distSq = distX * distX + distY * distY;
    
    return distSq <= (cr * cr);
  }

  // Spawn particle sparkles at position
  function spawnParticles(x, y, count = 5, color = null) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 50 + Math.random() * 100;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5,
        maxLife: 0.5,
        size: 2 + Math.random() * 2,
        color: color || THEME_COLOR // Default to theme color
      });
    }
  }

  // Haptic feedback helper - safe wrapper for vibration API
  function triggerHaptic(pattern) {
    if (hapticsEnabled && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  // ===== KEYBOARD NAVIGATION SYSTEM =====
  let focusedButtonIndex = 0;
  let currentNavigableButtons = [];

  // Define navigable buttons for each overlay
  const overlayButtonMaps = {
    title: () => [startGameBtn],
    menu: () => [playNowBtn, howToPlayBtn, leaderboardBtn],
    gamemode: () => {
      const buttons = [mainGameBtn];
      if (SURVIVAL_MODE_ENABLED) {
        buttons.push(survivalGameBtn);
      }
      buttons.push(gameModeBackBtn);
      return buttons;
    },
    pause: () => {
      // Check which card is visible
      if (pauseConfirmCard && pauseConfirmCard.classList.contains('show')) {
        return [pauseConfirmYes, pauseConfirmNo];
      }
      return [pauseContinueBtn, pauseSettingsBtn, pauseOrderStickersBtn, pauseLeaderboardBtn, pauseMainMenuBtn];
    },
    howtoplay: () => {
      // Include game mode tabs at the top
      const buttons = [];
      if (howToPlayMainTab) buttons.push(howToPlayMainTab);
      if (howToPlaySurvivalTab && SURVIVAL_MODE_ENABLED) buttons.push(howToPlaySurvivalTab);
      buttons.push(howToPlayBackBtn);
      return buttons;
    },
    leaderboard: () => {
      // Include game mode tabs at the top
      const buttons = [];
      if (leaderboardMainTab) buttons.push(leaderboardMainTab);
      if (leaderboardSurvivalTab && SURVIVAL_MODE_ENABLED) buttons.push(leaderboardSurvivalTab);
      
      // Then include time period tabs based on active mode
      if (activeLeaderboardMode === "survival") {
        if (survivalThisWeekTab) buttons.push(survivalThisWeekTab);
        if (survivalThisMonthTab) buttons.push(survivalThisMonthTab);
        if (survivalAllTimeTab) buttons.push(survivalAllTimeTab);
      } else {
        if (thisWeekTab) buttons.push(thisWeekTab);
        if (thisMonthTab) buttons.push(thisMonthTab);
        if (allTimeTab) buttons.push(allTimeTab);
      }
      
      buttons.push(leaderboardBackBtn);
      return buttons;
    },
    settings: () => [musicSlider, sfxSlider, hapticsToggle, themeColorBtn, settingsBackBtn],
    themecolor: () => {
      // Get all color choice buttons
      const colorBtns = Array.from(document.querySelectorAll(".colorChoiceBtn"));
      colorBtns.push(themeColorBackBtn);
      return colorBtns;
    },
    stats: () => {
      // Check if achievement detail is showing
      if (achievementDetail && achievementDetail.classList.contains('show')) {
        return [achievementDetailBackBtn];
      }
      
      // Include game mode tabs at the top
      const buttons = [];
      if (statsMainTab) buttons.push(statsMainTab);
      if (statsSurvivalTab && SURVIVAL_MODE_ENABLED) buttons.push(statsSurvivalTab);
      
      // Include achievement slots and back button
      const slots = Array.from(document.querySelectorAll(".achievementSlot"));
      buttons.push(...slots);
      buttons.push(statsBackBtn);
      return buttons;
    },
    win: () => [submitNameBtn, winPlayAgainBtn, winShareBtn, winOrderStickersBtn],
    gameover: () => [gameOverSubmitNameBtn, gameOverPlayAgainBtn, gameOverShareBtn, gameOverOrderStickersBtn],
    survivalgameover: () => [survivalSubmitNameBtn, survivalShareBtn, survivalTryAgainBtn, survivalOrderStickersBtn, survivalMainMenuBtn],
    konami: () => [konamiBBtn, konamiABtn, konamiStartBtn],
    secretwin: () => [secretWinReturnBtn],
    secretgameover: () => [secretGameOverTryAgainBtn, secretGameOverReturnBtn]
  };

  function updateNavigableButtons(overlayName) {
    const getButtons = overlayButtonMaps[overlayName];
    if (!getButtons) {
      currentNavigableButtons = [];
      focusedButtonIndex = 0;
      return;
    }
    
    // Get buttons and filter out null/undefined ones
    currentNavigableButtons = getButtons().filter(btn => btn !== null && btn !== undefined);
    focusedButtonIndex = 0;
    
    // Apply focus to first button
    if (currentNavigableButtons.length > 0) {
      applyKeyboardFocus();
    }
  }
  
  // Helper to refresh navigation when tab content changes
  function refreshNavigableButtons() {
    // Determine which overlay is currently showing
    const overlays = [
      { name: 'title', element: titleOverlay },
      { name: 'menu', element: menuOverlay },
      { name: 'gamemode', element: gameModeOverlay },
      { name: 'howtoplay', element: howToPlayOverlay },
      { name: 'leaderboard', element: leaderboardOverlay },
      { name: 'stats', element: statsOverlay },
      { name: 'settings', element: settingsOverlay },
      { name: 'themecolor', element: themeColorOverlay },
      { name: 'pause', element: pauseOverlay },
      { name: 'win', element: winOverlay },
      { name: 'gameover', element: gameOverOverlay },
      { name: 'survivalgameover', element: survivalGameOverOverlay },
      { name: 'konami', element: konamiOverlay },
      { name: 'secretwin', element: secretWinOverlay },
      { name: 'secretgameover', element: secretGameOverOverlay }
    ];
    
    for (const overlay of overlays) {
      if (overlay.element && overlay.element.classList.contains('show')) {
        updateNavigableButtons(overlay.name);
        return;
      }
    }
  }

  function applyKeyboardFocus() {
    // Remove focus from all buttons
    currentNavigableButtons.forEach(btn => {
      if (btn) {
        btn.classList.remove('keyboard-focused');
      }
    });
    
    // Apply focus to current button
    if (currentNavigableButtons[focusedButtonIndex]) {
      currentNavigableButtons[focusedButtonIndex].classList.add('keyboard-focused');
    }
  }
  
  // Spatial navigation helper - finds the closest button in a given direction
  function findClosestInDirection(direction) {
    if (currentNavigableButtons.length === 0) return -1;
    
    const current = currentNavigableButtons[focusedButtonIndex];
    if (!current) return -1;
    
    const currentRect = current.getBoundingClientRect();
    const currentCenterX = currentRect.left + currentRect.width / 2;
    const currentCenterY = currentRect.top + currentRect.height / 2;
    
    let bestIndex = -1;
    let bestDistance = Infinity;
    
    for (let i = 0; i < currentNavigableButtons.length; i++) {
      if (i === focusedButtonIndex) continue;
      
      const btn = currentNavigableButtons[i];
      if (!btn) continue;
      
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = centerX - currentCenterX;
      const dy = centerY - currentCenterY;
      
      // Check if button is in the right direction
      let isInDirection = false;
      if (direction === 'up' && dy < -10) isInDirection = true;
      if (direction === 'down' && dy > 10) isInDirection = true;
      if (direction === 'left' && dx < -10) isInDirection = true;
      if (direction === 'right' && dx > 10) isInDirection = true;
      
      if (!isInDirection) continue;
      
      // Calculate distance (favor buttons more aligned with the direction)
      let distance;
      if (direction === 'up' || direction === 'down') {
        distance = Math.abs(dy) + Math.abs(dx) * 0.5; // Favor vertical alignment
      } else {
        distance = Math.abs(dx) + Math.abs(dy) * 0.5; // Favor horizontal alignment
      }
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    
    return bestIndex;
  }

  function navigateUp() {
    if (currentNavigableButtons.length === 0) return;
    
    // Try spatial navigation first
    const spatialIndex = findClosestInDirection('up');
    if (spatialIndex !== -1) {
      focusedButtonIndex = spatialIndex;
      playSfx(assets.menuCursor, performance.now(), 60);
    } else {
      // Fallback to cycling backwards
      focusedButtonIndex = (focusedButtonIndex - 1 + currentNavigableButtons.length) % currentNavigableButtons.length;
      playSfx(assets.menuCursor, performance.now(), 60);
    }
    
    applyKeyboardFocus();
  }

  function navigateDown() {
    if (currentNavigableButtons.length === 0) return;
    
    // Try spatial navigation first
    const spatialIndex = findClosestInDirection('down');
    if (spatialIndex !== -1) {
      focusedButtonIndex = spatialIndex;
      playSfx(assets.menuCursor, performance.now(), 60);
    } else {
      // Fallback to cycling forward
      focusedButtonIndex = (focusedButtonIndex + 1) % currentNavigableButtons.length;
      playSfx(assets.menuCursor, performance.now(), 60);
    }
    
    applyKeyboardFocus();
  }

  function navigateLeft() {
    if (currentNavigableButtons.length === 0) return;
    
    // Try spatial navigation first
    const spatialIndex = findClosestInDirection('left');
    if (spatialIndex !== -1) {
      focusedButtonIndex = spatialIndex;
      playSfx(assets.menuCursor, performance.now(), 60);
    } else {
      // Fallback to cycling backwards
      focusedButtonIndex = (focusedButtonIndex - 1 + currentNavigableButtons.length) % currentNavigableButtons.length;
      playSfx(assets.menuCursor, performance.now(), 60);
    }
    
    applyKeyboardFocus();
  }

  function navigateRight() {
    if (currentNavigableButtons.length === 0) return;
    
    // Try spatial navigation first
    const spatialIndex = findClosestInDirection('right');
    if (spatialIndex !== -1) {
      focusedButtonIndex = spatialIndex;
      playSfx(assets.menuCursor, performance.now(), 60);
    } else {
      // Fallback to cycling forward
      focusedButtonIndex = (focusedButtonIndex + 1) % currentNavigableButtons.length;
      playSfx(assets.menuCursor, performance.now(), 60);
    }
    
    applyKeyboardFocus();
  }

  function activateFocusedButton() {
    if (currentNavigableButtons.length === 0) return;
    const focusedBtn = currentNavigableButtons[focusedButtonIndex];
    if (!focusedBtn) return;
    
    // Special handling for achievement slots
    if (focusedBtn.classList && focusedBtn.classList.contains('achievementSlot')) {
      const achievementId = parseInt(focusedBtn.getAttribute("data-achievement-id"));
      const isUnlocked = focusedBtn.classList.contains("unlocked");
      showAchievementDetail(achievementId, isUnlocked);
      return;
    }
    
    // Special handling for sliders and toggle
    if (focusedBtn === musicSlider || focusedBtn === sfxSlider) {
      // For sliders, clicking them is handled by browser, but we can also handle left/right
      focusedBtn.focus();
    } else if (focusedBtn === hapticsToggle) {
      // Click the toggle
      focusedBtn.click();
    } else {
      // Regular button click
      focusedBtn.click();
    }
  }
  
  // Handle left/right arrow keys for sliders in settings
  function handleSliderNavigation(direction) {
    if (currentNavigableButtons.length === 0) return false;
    const focusedBtn = currentNavigableButtons[focusedButtonIndex];
    
    if (focusedBtn === musicSlider) {
      const currentValue = parseInt(musicSlider.value, 10);
      const step = 5;
      const newValue = clamp(currentValue + (direction * step), 0, 100);
      musicSlider.value = newValue;
      musicSlider.dispatchEvent(new Event('input'));
      return true;
    } else if (focusedBtn === sfxSlider) {
      const currentValue = parseInt(sfxSlider.value, 10);
      const step = 5;
      const newValue = clamp(currentValue + (direction * step), 0, 100);
      sfxSlider.value = newValue;
      sfxSlider.dispatchEvent(new Event('input'));
      return true;
    }
    
    return false;
  }
  // ===== END KEYBOARD NAVIGATION SYSTEM =====

  function loadImage(src) {
    // Handle null/missing assets gracefully (for optional easter eggs)
    if (!src) {
      return Promise.resolve(null);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function loadAudio(src, { loop=false, volume=1 } = {}) {
    const a = new Audio(src);
    a.loop = loop;
    a.volume = volume;
    a.preload = "auto";
    return a;
  }

  // ===== ASTEROID COLOR PALETTE SWAPPING =====
  
  // Original asteroid colors (from your .act palette)
  const ORIGINAL_ASTEROID_COLORS = {
    light: '#c7005a',  // Light pink
    mid: '#820d4f',    // Mid pink
    // dark: '#10102b' - NOT CHANGED (kept as-is)
  };
  
  // Level-specific color replacements for asteroid colors
  const ASTEROID_PALETTE_BY_LEVEL = {
    1: { light: '#00CCFF', mid: '#007a99' },  // Cyan tones
    2: { light: '#00FF00', mid: '#009900' },  // Green tones
    3: { light: '#FF0000', mid: '#990000' },  // Red tones
    // Level 4 (boss) uses random colors per asteroid
  };

  // Boss level random color palettes (randomly assigned per asteroid)
  const BOSS_COLOR_PALETTES = [
    { light: '#def30c', mid: '#85920a' },  // Yellow-green (boss level colors)
  ];

  // ===== SURVIVAL MODE COLOR PROGRESSION =====
  // Asteroids change color as survival mode progresses
  const SURVIVAL_COLOR_PALETTES = [
    { light: '#def30c', mid: '#85920a' },  // Tier 1 (1x): Yellow
    { light: '#00FF00', mid: '#009900' },  // Tier 2 (2x): Bright green
    { light: '#00FFCC', mid: '#00997a' },  // Tier 3 (3x): Teal
    { light: '#00CCFF', mid: '#007a99' },  // Tier 4 (4x): Light blue
    { light: '#0066FF', mid: '#003d99' },  // Tier 5 (5x): Blue
    { light: '#6600FF', mid: '#3d0099' },  // Tier 6 (6x): Purple
    { light: '#FF00FF', mid: '#990099' },  // Tier 7 (7x): Magenta
    { light: '#FF0066', mid: '#99003d' },  // Tier 8 (8x): Hot pink
    { light: '#FF0000', mid: '#990000' },  // Tier 9 (9x): Red
    { light: '#FFFFFF', mid: '#CCCCCC' },  // Tier 10+ (10x+): White
  ];
  // ===========================================
  
  // Convert hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  // Convert RGB to HSL
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }
  
  // Convert HSL to RGB
  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
  
  // Recolor an asteroid image with direct color replacement
  function recolorAsteroid(sourceImage, newLightColor, newMidColor) {
    // Create offscreen canvas for pixel manipulation
    const canvas = document.createElement('canvas');
    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(sourceImage, 0, 0);
    
    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert original and target colors to RGB
    const originalLightRgb = hexToRgb(ORIGINAL_ASTEROID_COLORS.light);
    const originalMidRgb = hexToRgb(ORIGINAL_ASTEROID_COLORS.mid);
    const targetLightRgb = hexToRgb(newLightColor);
    const targetMidRgb = hexToRgb(newMidColor);
    
    // Color matching tolerance (pixels within this distance are considered a match)
    const tolerance = 5;
    
    function colorMatches(r, g, b, target) {
      return Math.abs(r - target.r) <= tolerance &&
             Math.abs(g - target.g) <= tolerance &&
             Math.abs(b - target.b) <= tolerance;
    }
    
    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip transparent pixels
      if (a === 0) continue;
      
      let newColor = null;
      
      // Check if this pixel matches light or mid color
      if (colorMatches(r, g, b, originalLightRgb)) {
        // Replace light color
        newColor = targetLightRgb;
      } else if (colorMatches(r, g, b, originalMidRgb)) {
        // Replace mid color
        newColor = targetMidRgb;
      }
      
      // Apply new color if we found a match
      if (newColor) {
        data[i] = newColor.r;
        data[i + 1] = newColor.g;
        data[i + 2] = newColor.b;
        // Keep original alpha
      }
    }
    
    // Put modified pixels back
    ctx.putImageData(imageData, 0, 0);
    
    // Return new image from canvas
    const recoloredImage = new Image();
    recoloredImage.src = canvas.toDataURL();
    // Preserve original dimensions explicitly
    recoloredImage.width = sourceImage.width;
    recoloredImage.height = sourceImage.height;
    return recoloredImage;
  }
  
  // Cache for recolored asteroids by level
  let asteroidsByLevel = {};
  
  // Generate all recolored asteroid sets for each level
  function generateAsteroidPalettes(originalAsteroids) {
    asteroidsByLevel = {};
    
    // Level 0 = original colors (default)
    asteroidsByLevel[0] = originalAsteroids;
    
    // Generate for each defined level (main game)
    Object.keys(ASTEROID_PALETTE_BY_LEVEL).forEach(levelNum => {
      const palette = ASTEROID_PALETTE_BY_LEVEL[levelNum];
      asteroidsByLevel[levelNum] = {
        asteroidSmall: originalAsteroids.asteroidSmall.map(img => recolorAsteroid(img, palette.light, palette.mid)),
        asteroid1: recolorAsteroid(originalAsteroids.asteroid1, palette.light, palette.mid),
        asteroid1Hit: recolorAsteroid(originalAsteroids.asteroid1Hit, palette.light, palette.mid),
        asteroid2: recolorAsteroid(originalAsteroids.asteroid2, palette.light, palette.mid),
        asteroid2Hit: recolorAsteroid(originalAsteroids.asteroid2Hit, palette.light, palette.mid),
        asteroid3: recolorAsteroid(originalAsteroids.asteroid3, palette.light, palette.mid),
        asteroid3Hit: recolorAsteroid(originalAsteroids.asteroid3Hit, palette.light, palette.mid),
      };
    });
    
    // Generate boss level (level 4) color variations
    BOSS_COLOR_PALETTES.forEach((palette, index) => {
      asteroidsByLevel[`boss_${index}`] = {
        asteroidSmall: originalAsteroids.asteroidSmall.map(img => recolorAsteroid(img, palette.light, palette.mid)),
        asteroid1: recolorAsteroid(originalAsteroids.asteroid1, palette.light, palette.mid),
        asteroid1Hit: recolorAsteroid(originalAsteroids.asteroid1Hit, palette.light, palette.mid),
        asteroid2: recolorAsteroid(originalAsteroids.asteroid2, palette.light, palette.mid),
        asteroid2Hit: recolorAsteroid(originalAsteroids.asteroid2Hit, palette.light, palette.mid),
        asteroid3: recolorAsteroid(originalAsteroids.asteroid3, palette.light, palette.mid),
        asteroid3Hit: recolorAsteroid(originalAsteroids.asteroid3Hit, palette.light, palette.mid),
      };
    });
    
    // Generate survival mode color palettes
    if (SURVIVAL_MODE_ENABLED) {
      SURVIVAL_COLOR_PALETTES.forEach((palette, index) => {
        asteroidsByLevel[`survival_${index}`] = {
          asteroidSmall: originalAsteroids.asteroidSmall.map(img => recolorAsteroid(img, palette.light, palette.mid)),
          asteroid1: recolorAsteroid(originalAsteroids.asteroid1, palette.light, palette.mid),
          asteroid1Hit: recolorAsteroid(originalAsteroids.asteroid1Hit, palette.light, palette.mid),
          asteroid2: recolorAsteroid(originalAsteroids.asteroid2, palette.light, palette.mid),
          asteroid2Hit: recolorAsteroid(originalAsteroids.asteroid2Hit, palette.light, palette.mid),
          asteroid3: recolorAsteroid(originalAsteroids.asteroid3, palette.light, palette.mid),
          asteroid3Hit: recolorAsteroid(originalAsteroids.asteroid3Hit, palette.light, palette.mid),
        };
      });
    }
  }
  
  // Get asteroids for current level (returns original if level not defined)
  function getAsteroidsForLevel(level) {
    // In survival mode, use streak multiplier tier for colors
    if (gameMode === "SURVIVAL") {
      const paletteIndex = Math.min(streakMultiplier - 1, SURVIVAL_COLOR_PALETTES.length - 1);
      return asteroidsByLevel[`survival_${paletteIndex}`] || asteroidsByLevel[0];
    }
    return asteroidsByLevel[level] || asteroidsByLevel[0];
  }

  // Get the current particle color for asteroids based on level/state
  function getCurrentAsteroidParticleColor() {
    if (state === STATE.FINAL_LEVEL) {
      return BOSS_COLOR_PALETTES[0].light;
    } else if (gameMode === "SURVIVAL") {
      const paletteIndex = Math.min(streakMultiplier - 1, SURVIVAL_COLOR_PALETTES.length - 1);
      return SURVIVAL_COLOR_PALETTES[paletteIndex].light;
    } else if (ASTEROID_PALETTE_BY_LEVEL[currentLevel]) {
      return ASTEROID_PALETTE_BY_LEVEL[currentLevel].light;
    }
    return ORIGINAL_ASTEROID_COLORS.light;
  }
  
  // ===== END ASTEROID COLOR PALETTE SWAPPING =====

  function pick(arr, r) {
    return arr[Math.floor(r() * arr.length)];
  }

  function nextRange(r, min, max) {
    return min + r() * (max - min);
  }

  // ===== ANTI-CHEAT: Variable Name Obfuscation =====
  // Rename critical variables to non-obvious names to deter casual console cheating
  // Note: Determined cheaters can still find these, but server-side validation is the real protection
  // =================================================

  // WordPress API helpers
  async function startGameSession() {
    try {
      if (!window.STICKERSNATCH_API || !window.STICKERSNATCH_API.isWordPress) {
        return null;
      }
      
      const response = await fetch(`${window.STICKERSNATCH_API.url}/game/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.STICKERSNATCH_API.nonce
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.session_id;
    } catch (error) {
      return null;
    }
  }

  async function fetchLeaderboardFromAPI() {
    try {
      if (!window.STICKERSNATCH_API || !window.STICKERSNATCH_API.isWordPress) {
        return null;
      }
      
      const response = await fetch(`${window.STICKERSNATCH_API.url}/leaderboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      // Transform API response to match local format
      return data.map(entry => ({
        name: entry.name,
        points: entry.score,
        stickers: entry.stickers,
        date: entry.date
      }));
    } catch (error) {
      return null;
    }
  }

  async function fetchMonthlyLeaderboardFromAPI() {
    try {
      if (!window.STICKERSNATCH_API || !window.STICKERSNATCH_API.isWordPress) {
        return null;
      }
      
      const response = await fetch(`${window.STICKERSNATCH_API.url}/leaderboard/monthly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      // Transform API response to match local format
      return data.map(entry => ({
        name: entry.name,
        points: entry.score,
        stickers: entry.stickers,
        date: entry.date
      }));
    } catch (error) {
      return null;
    }
  }

  async function fetchWeeklyLeaderboardFromAPI() {
    try {
      if (!window.STICKERSNATCH_API || !window.STICKERSNATCH_API.isWordPress) {
        return null;
      }
      
      const response = await fetch(`${window.STICKERSNATCH_API.url}/leaderboard/weekly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      // Transform API response to match local format
      return data.map(entry => ({
        name: entry.name,
        points: entry.score,
        stickers: entry.stickers,
        date: entry.date
      }));
    } catch (error) {
      return null;
    }
  }

  async function submitScoreToAPI(name, email, points, stickers, level) {
    try {
      if (!window.STICKERSNATCH_API || !window.STICKERSNATCH_API.isWordPress) {
        return { success: false, message: 'Not in WordPress environment' };
      }
      
      const response = await fetch(`${window.STICKERSNATCH_API.url}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.STICKERSNATCH_API.nonce
        },
        body: JSON.stringify({
          name: name,
          email: email,
          score: points,
          stickers: stickers,
          level: level,
          session_id: gameSessionId // Anti-cheat: include session ID
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to submit score'
        };
      }
      
      return {
        success: true,
        message: result.message || 'Score submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred'
      };
    }
  }

  // Submit survival score to WordPress API
  async function submitSurvivalScoreToAPI(name, email, time, score) {
    try {
      if (!window.STICKERSNATCH_API || !window.STICKERSNATCH_API.isWordPress) {
        return { success: false, message: 'Not in WordPress environment' };
      }
      
      const response = await fetch(`${window.STICKERSNATCH_API.url}/survival/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.STICKERSNATCH_API.nonce
        },
        body: JSON.stringify({
          name: name,
          email: email,
          time: time,
          score: score
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to submit survival score'
        };
      }
      
      return {
        success: true,
        message: result.message || 'Survival score submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred'
      };
    }
  }

  // Fetch survival leaderboard from WordPress API
  async function fetchSurvivalLeaderboardFromAPI() {
    try {
      if (!window.STICKERSNATCH_API || !window.STICKERSNATCH_API.isWordPress) {
        return null;
      }
      
      const response = await fetch(`${window.STICKERSNATCH_API.url}/survival/leaderboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      // Transform API response to match local format
      return data.map(entry => ({
        name: entry.name,
        time: entry.time,
        points: entry.points,
        date: entry.date
      }));
    } catch (error) {
      return null;
    }
  }

  async function fetchSurvivalMonthlyLeaderboardFromAPI() {
    try {
      if (!window.STICKERSNATCH_API || !window.STICKERSNATCH_API.isWordPress) {
        return null;
      }
      
      const response = await fetch(`${window.STICKERSNATCH_API.url}/survival/leaderboard/monthly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      // Transform API response to match local format
      return data.map(entry => ({
        name: entry.name,
        time: entry.time,
        points: entry.points,
        date: entry.date
      }));
    } catch (error) {
      return null;
    }
  }

  async function fetchSurvivalWeeklyLeaderboardFromAPI() {
    try {
      if (!window.STICKERSNATCH_API || !window.STICKERSNATCH_API.isWordPress) {
        return null;
      }
      
      const response = await fetch(`${window.STICKERSNATCH_API.url}/survival/leaderboard/weekly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      // Transform API response to match local format
      return data.map(entry => ({
        name: entry.name,
        time: entry.time,
        points: entry.points,
        date: entry.date
      }));
    } catch (error) {
      return null;
    }
  }

  // Leaderboard helpers
  function getLeaderboard() {
    try {
      const data = localStorage.getItem(LS_LEADERBOARD);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveToLeaderboard(name, points, stickers = 0) {
    try {
      const leaderboard = getLeaderboard();
      const entry = {
        name: name.trim().substring(0, 20) || "Anonymous",
        points: points,
        stickers: stickers,
        date: new Date().toISOString()
      };
      leaderboard.push(entry);
      // Sort by points (descending), then by date (ascending)
      leaderboard.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return new Date(a.date) - new Date(b.date);
      });
      // Keep top 50 entries
      const trimmed = leaderboard.slice(0, 50);
      localStorage.setItem(LS_LEADERBOARD, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.warn("Failed to save to leaderboard:", e);
      return false;
    }
  }

  async function renderLeaderboard() {
    // Update tab UI to reflect active tab
    if (thisWeekTab && thisMonthTab && allTimeTab) {
      if (activeLeaderboardTab === "weekly") {
        thisWeekTab.classList.add("active");
        thisMonthTab.classList.remove("active");
        allTimeTab.classList.remove("active");
      } else if (activeLeaderboardTab === "monthly") {
        thisWeekTab.classList.remove("active");
        thisMonthTab.classList.add("active");
        allTimeTab.classList.remove("active");
      } else {
        thisWeekTab.classList.remove("active");
        thisMonthTab.classList.remove("active");
        allTimeTab.classList.add("active");
      }
    }
    
    if (!leaderboardList) return;
    
    // Show loading state
    leaderboardList.innerHTML = '<div class="leaderboardEmpty pixelText">Loading...</div>';
    
    // Get the appropriate leaderboard based on active tab
    let leaderboard;
    if (activeLeaderboardTab === "weekly") {
      // For weekly tab, try to fetch from WordPress API first
      if (window.STICKERSNATCH_API && window.STICKERSNATCH_API.isWordPress) {
        const apiLeaderboard = await fetchWeeklyLeaderboardFromAPI();
        if (apiLeaderboard !== null) {
          leaderboard = apiLeaderboard;
        } else {
          // Fallback to localStorage
          leaderboard = getWeeklyLeaderboard();
        }
      } else {
        // Local version uses localStorage
        leaderboard = getWeeklyLeaderboard();
      }
    } else if (activeLeaderboardTab === "monthly") {
      // For monthly tab, try to fetch from WordPress API first
      if (window.STICKERSNATCH_API && window.STICKERSNATCH_API.isWordPress) {
        const apiLeaderboard = await fetchMonthlyLeaderboardFromAPI();
        if (apiLeaderboard !== null) {
          leaderboard = apiLeaderboard;
        } else {
          // Fallback to localStorage
          leaderboard = getMonthlyLeaderboard();
        }
      } else {
        // Local version uses localStorage
        leaderboard = getMonthlyLeaderboard();
      }
    } else {
      // For all-time tab, try to fetch from WordPress API first
      if (window.STICKERSNATCH_API && window.STICKERSNATCH_API.isWordPress) {
        const apiLeaderboard = await fetchLeaderboardFromAPI();
        if (apiLeaderboard !== null) {
          leaderboard = apiLeaderboard;
        } else {
          // Fallback to localStorage
          leaderboard = getLeaderboard();
        }
      } else {
        // Local version uses localStorage
        leaderboard = getLeaderboard();
      }
    }

    if (leaderboard.length === 0) {
      leaderboardList.innerHTML = '<div class="leaderboardEmpty pixelText">No entries yet.<br>Be the first to win!</div>';
      return;
    }

    // Create table header
    const header = `
      <div class="leaderboardHeader" style="position: sticky; top: 0; z-index: 10; gap: 8px;">
        <span class="leaderboardHeaderRank pixelText" style="width: 50px; text-align: center;">RANK</span>
        <span class="leaderboardHeaderName pixelText" style="width: 70px; text-align: center;">NAME</span>
        <span class="leaderboardHeaderStickers pixelText" style="width: 20px; text-align: center;"><img src="${ASSETS.webp.sticker}" alt="" class="leaderboardStickerIcon" /></span>
        <span class="leaderboardHeaderPoints pixelText" style="width: 90px; text-align: center;">SCORE</span>
      </div>
    `;

    // Create table rows
    const rows = leaderboard.map((entry, index) => `
      <div class="leaderboardEntry" style="gap: 8px;">
        <span class="leaderboardRank pixelText" style="width: 50px; text-align: center;">${index + 1}</span>
        <span class="leaderboardName pixelText" style="width: 70px; text-align: center;">${entry.name}</span>
        <span class="leaderboardStickers pixelText">${entry.stickers || 0}</span>
        <span class="leaderboardScore pixelText" style="width: 90px; text-align: center;">${entry.points}</span>
      </div>
    `).join('');

    leaderboardList.innerHTML = header + rows;
  }

  // ===== SURVIVAL MODE LEADERBOARD =====
  
  // Get survival all-time leaderboard
  function getSurvivalLeaderboard() {
    try {
      const data = localStorage.getItem(LS_SURVIVAL_LEADERBOARD);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Save to survival all-time leaderboard
  function saveToSurvivalLeaderboard(name, time, points) {
    try {
      const leaderboard = getSurvivalLeaderboard();
      const entry = {
        name: name.trim().substring(0, 20) || "Anonymous",
        time: time,
        points: points,
        date: new Date().toISOString()
      };
      leaderboard.push(entry);
      // Sort by time (descending), then by points (descending)
      leaderboard.sort((a, b) => {
        if (b.time !== a.time) return b.time - a.time;
        return b.points - a.points;
      });
      // Keep top 50 entries
      const trimmed = leaderboard.slice(0, 50);
      localStorage.setItem(LS_SURVIVAL_LEADERBOARD, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.warn("Failed to save to survival leaderboard:", e);
      return false;
    }
  }

  // Get survival monthly leaderboard
  function getSurvivalMonthlyLeaderboard() {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const storedMonth = localStorage.getItem(LS_SURVIVAL_LEADERBOARD_MONTH);
      
      // Reset if it's a new month
      if (storedMonth !== currentMonth) {
        localStorage.setItem(LS_SURVIVAL_LEADERBOARD_MONTH, currentMonth);
        localStorage.removeItem(LS_SURVIVAL_MONTHLY_LEADERBOARD);
        return [];
      }
      
      const data = localStorage.getItem(LS_SURVIVAL_MONTHLY_LEADERBOARD);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Save to survival monthly leaderboard
  function saveToSurvivalMonthlyLeaderboard(name, time, points) {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7);
      localStorage.setItem(LS_SURVIVAL_LEADERBOARD_MONTH, currentMonth);
      
      const leaderboard = getSurvivalMonthlyLeaderboard();
      const entry = {
        name: name.trim().substring(0, 20) || "Anonymous",
        time: time,
        points: points,
        date: new Date().toISOString()
      };
      leaderboard.push(entry);
      leaderboard.sort((a, b) => {
        if (b.time !== a.time) return b.time - a.time;
        return b.points - a.points;
      });
      const trimmed = leaderboard.slice(0, 50);
      localStorage.setItem(LS_SURVIVAL_MONTHLY_LEADERBOARD, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.warn("Failed to save to survival monthly leaderboard:", e);
      return false;
    }
  }

  // Get survival weekly leaderboard
  function getSurvivalWeeklyLeaderboard() {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      const weekKey = startOfWeek.toISOString().substring(0, 10); // YYYY-MM-DD
      
      const storedWeek = localStorage.getItem(LS_SURVIVAL_LEADERBOARD_WEEK);
      
      // Reset if it's a new week
      if (storedWeek !== weekKey) {
        localStorage.setItem(LS_SURVIVAL_LEADERBOARD_WEEK, weekKey);
        localStorage.removeItem(LS_SURVIVAL_WEEKLY_LEADERBOARD);
        return [];
      }
      
      const data = localStorage.getItem(LS_SURVIVAL_WEEKLY_LEADERBOARD);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Save to survival weekly leaderboard
  function saveToSurvivalWeeklyLeaderboard(name, time, points) {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const weekKey = startOfWeek.toISOString().substring(0, 10);
      localStorage.setItem(LS_SURVIVAL_LEADERBOARD_WEEK, weekKey);
      
      const leaderboard = getSurvivalWeeklyLeaderboard();
      const entry = {
        name: name.trim().substring(0, 20) || "Anonymous",
        time: time,
        points: points,
        date: new Date().toISOString()
      };
      leaderboard.push(entry);
      leaderboard.sort((a, b) => {
        if (b.time !== a.time) return b.time - a.time;
        return b.points - a.points;
      });
      const trimmed = leaderboard.slice(0, 50);
      localStorage.setItem(LS_SURVIVAL_WEEKLY_LEADERBOARD, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.warn("Failed to save to survival weekly leaderboard:", e);
      return false;
    }
  }

  async function renderSurvivalLeaderboard() {
    // Update tab UI to reflect active tab
    if (survivalThisWeekTab && survivalThisMonthTab && survivalAllTimeTab) {
      if (activeSurvivalLeaderboardTab === "weekly") {
        survivalThisWeekTab.classList.add("active");
        survivalThisMonthTab.classList.remove("active");
        survivalAllTimeTab.classList.remove("active");
      } else if (activeSurvivalLeaderboardTab === "monthly") {
        survivalThisWeekTab.classList.remove("active");
        survivalThisMonthTab.classList.add("active");
        survivalAllTimeTab.classList.remove("active");
      } else {
        survivalThisWeekTab.classList.remove("active");
        survivalThisMonthTab.classList.remove("active");
        survivalAllTimeTab.classList.add("active");
      }
    }
    
    if (!survivalLeaderboardList) return;
    
    // Show loading state
    survivalLeaderboardList.innerHTML = '<div class="leaderboardEmpty pixelText">Loading...</div>';
    
    // Get the appropriate leaderboard based on active tab
    let leaderboard;
    if (activeSurvivalLeaderboardTab === "weekly") {
      // For weekly tab, try to fetch from WordPress API first
      if (window.STICKERSNATCH_API && window.STICKERSNATCH_API.isWordPress) {
        const apiLeaderboard = await fetchSurvivalWeeklyLeaderboardFromAPI();
        if (apiLeaderboard !== null) {
          leaderboard = apiLeaderboard;
        } else {
          // Fallback to localStorage
          leaderboard = getSurvivalWeeklyLeaderboard();
        }
      } else {
        // Local version uses localStorage
        leaderboard = getSurvivalWeeklyLeaderboard();
      }
    } else if (activeSurvivalLeaderboardTab === "monthly") {
      // For monthly tab, try to fetch from WordPress API first
      if (window.STICKERSNATCH_API && window.STICKERSNATCH_API.isWordPress) {
        const apiLeaderboard = await fetchSurvivalMonthlyLeaderboardFromAPI();
        if (apiLeaderboard !== null) {
          leaderboard = apiLeaderboard;
        } else {
          // Fallback to localStorage
          leaderboard = getSurvivalMonthlyLeaderboard();
        }
      } else {
        // Local version uses localStorage
        leaderboard = getSurvivalMonthlyLeaderboard();
      }
    } else {
      // For all-time tab, try to fetch from WordPress API first
      if (window.STICKERSNATCH_API && window.STICKERSNATCH_API.isWordPress) {
        const apiLeaderboard = await fetchSurvivalLeaderboardFromAPI();
        if (apiLeaderboard !== null) {
          leaderboard = apiLeaderboard;
        } else {
          // Fallback to localStorage
          leaderboard = getSurvivalLeaderboard();
        }
      } else {
        // Local version uses localStorage
        leaderboard = getSurvivalLeaderboard();
      }
    }

    if (leaderboard.length === 0) {
      survivalLeaderboardList.innerHTML = '<div class="leaderboardEmpty pixelText">No entries yet.<br>Be the first to survive!</div>';
      return;
    }

    // Format time helper
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    // Create table header
    const header = `
      <div class="leaderboardHeader">
        <span class="leaderboardHeaderRank pixelText">RANK</span>
        <span class="leaderboardHeaderName pixelText">NAME</span>
        <span class="leaderboardHeaderStickers pixelText">TIME</span>
        <span class="leaderboardHeaderPoints pixelText">POINTS</span>
      </div>
    `;

    // Create table rows
    const rows = leaderboard.map((entry, index) => `
      <div class="leaderboardEntry">
        <span class="leaderboardRank pixelText">${index + 1}</span>
        <span class="leaderboardName pixelText">${entry.name}</span>
        <span class="leaderboardStickers pixelText">${formatTime(entry.time)}</span>
        <span class="leaderboardScore pixelText">${entry.points}</span>
      </div>
    `).join('');

    survivalLeaderboardList.innerHTML = header + rows;
  }
  // ===================================

  // Monthly leaderboard functions
  function getCurrentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function getMonthlyLeaderboard() {
    try {
      const currentMonth = getCurrentMonthKey();
      const storedMonth = localStorage.getItem(LS_LEADERBOARD_MONTH);
      
      // If month changed, clear monthly leaderboard
      if (storedMonth !== currentMonth) {
        localStorage.setItem(LS_LEADERBOARD_MONTH, currentMonth);
        localStorage.setItem(LS_MONTHLY_LEADERBOARD, JSON.stringify([]));
        return [];
      }
      
      const data = localStorage.getItem(LS_MONTHLY_LEADERBOARD);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Failed to load monthly leaderboard:", e);
      return [];
    }
  }

  function saveToMonthlyLeaderboard(name, points, stickers = 0) {
    try {
      const currentMonth = getCurrentMonthKey();
      localStorage.setItem(LS_LEADERBOARD_MONTH, currentMonth);
      
      const leaderboard = getMonthlyLeaderboard();
      const entry = {
        name: name.trim().substring(0, 20) || "Anonymous",
        points: points,
        stickers: stickers,
        date: new Date().toISOString()
      };
      leaderboard.push(entry);
      // Sort by points (descending), then by date (ascending)
      leaderboard.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return new Date(a.date) - new Date(b.date);
      });
      // Keep top 50 entries
      const trimmed = leaderboard.slice(0, 50);
      localStorage.setItem(LS_MONTHLY_LEADERBOARD, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.warn("Failed to save to monthly leaderboard:", e);
      return false;
    }
  }

  // Weekly leaderboard functions
  function getCurrentWeekKey() {
    // Use ISO week (Monday start) - matches weekKey() function
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const daysSinceFirstDay = Math.floor((now - firstDayOfYear) / 86400000);
    const weekNumber = Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  }

  function getWeeklyLeaderboard() {
    try {
      const currentWeek = getCurrentWeekKey();
      const storedWeek = localStorage.getItem(LS_LEADERBOARD_WEEK);
      
      // If week changed, clear weekly leaderboard
      if (storedWeek !== currentWeek) {
        localStorage.setItem(LS_LEADERBOARD_WEEK, currentWeek);
        localStorage.setItem(LS_WEEKLY_LEADERBOARD, JSON.stringify([]));
        return [];
      }
      
      const data = localStorage.getItem(LS_WEEKLY_LEADERBOARD);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Failed to load weekly leaderboard:", e);
      return [];
    }
  }

  function saveToWeeklyLeaderboard(name, points, stickers = 0) {
    try {
      const currentWeek = getCurrentWeekKey();
      localStorage.setItem(LS_LEADERBOARD_WEEK, currentWeek);
      
      const leaderboard = getWeeklyLeaderboard();
      const entry = {
        name: name.trim().substring(0, 20) || "Anonymous",
        points: points,
        stickers: stickers,
        date: new Date().toISOString()
      };
      leaderboard.push(entry);
      // Sort by points (descending), then by date (ascending)
      leaderboard.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return new Date(a.date) - new Date(b.date);
      });
      // Keep top 50 entries
      const trimmed = leaderboard.slice(0, 50);
      localStorage.setItem(LS_WEEKLY_LEADERBOARD, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.warn("Failed to save to weekly leaderboard:", e);
      return false;
    }
  }

  function renderStats() {
    // Main game stats
    if (statPersonalBest) statPersonalBest.textContent = personalBest;
    if (statTotalGames) statTotalGames.textContent = totalGamesPlayed;
    if (statTotalStickers) statTotalStickers.textContent = totalStickersAllTime;
    if (statBestStickerCount) statBestStickerCount.textContent = bestStickerCount;
    
    // Survival mode stats - use the loaded variables
    const minutes = Math.floor(survivalLongestTime / 60);
    const seconds = survivalLongestTime % 60;
    const timeFormatted = `${minutes}:${String(seconds).padStart(2, '0')}`;
    
    if (statSurvivalLongestTime) statSurvivalLongestTime.textContent = timeFormatted;
    if (statSurvivalHighScore) statSurvivalHighScore.textContent = survivalHighScore;
    if (statSurvivalTotalRuns) statSurvivalTotalRuns.textContent = survivalTotalRuns;
    if (statSurvivalTotalStickers) statSurvivalTotalStickers.textContent = survivalTotalStickers;
    
    // Render achievement slots
    renderAchievements();
  }

  function renderAchievements() {
    const slots = document.querySelectorAll(".achievementSlot");
    slots.forEach((slot, index) => {
      const achievementId = index + 1;
      const achievement = ACHIEVEMENTS[achievementId];
      if (!achievement) return;
      
      // Check if achievement is unlocked from localStorage
      const isUnlocked = isAchievementUnlocked(achievementId);
      
      // Clear existing image
      slot.innerHTML = "";
      
      // Add image if available
      if (achievement.image) {
        const img = document.createElement("img");
        img.src = achievement.image;
        img.alt = achievement.name;
        
        // Apply greyscale filter if locked
        if (!isUnlocked) {
          img.style.filter = "grayscale(100%)";
        }
        
        slot.appendChild(img);
      }
      
      // Update border color
      if (isUnlocked) {
        slot.classList.add("unlocked");
      } else {
        slot.classList.remove("unlocked");
      }
    });
  }

  // Achievement system
  const ACHIEVEMENTS = {
    1: {
      name: "BREN'S REVENGE",
      description: "Defeat the ARCADE MODE boss without losing any lives",
      image: null // Achievements not used in arcade version
    },
    2: {
      name: "TURNT UP",
      description: "Snatch all powerup stickers (6 total) in a full ARCADE MODE completion",
      image: null // Achievements not used in arcade version
    },
    3: {
      name: "STICKER DIET",
      description: "Complete ARCADE MODE without snatching any stickers",
      image: null // Achievements not used in arcade version
    },
    4: {
      name: "STICKER HOARDER",
      description: "Snatch 100+ stickers in ARCADE MODE",
      image: null // Achievements not used in arcade version
    },
    5: {
      name: "STICKER GOAT",
      description: "Snatch 150+ stickers in ARCADE MODE",
      image: null // Achievements not used in arcade version
    },
    6: {
      name: "IRON GOAT",
      description: "Complete ARCADE MODE without losing a single life",
      image: null // Achievements not used in arcade version
    },
    7: {
      name: "GOAT STATUS",
      description: "Score 20,000+ points in ARCADE MODE",
      image: null // Achievements not used in arcade version
    },
    8: {
      name: "PYRAMID SCHEME",
      description: "Find and beat the secret level",
      image: null // Achievements not used in arcade version
    }
  };

  function showAchievementDetail(achievementId, isUnlocked) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;

    achievementDetailTitle.textContent = achievement.name;
    achievementDetailDesc.textContent = achievement.description;
    
    // Set the image
    const achievementDetailIcon = document.getElementById("achievementDetailIcon");
    if (achievementDetailIcon) {
      if (achievement.image) {
        achievementDetailIcon.src = achievement.image;
        achievementDetailIcon.style.display = "block";
        
        // Apply greyscale filter if locked
        if (!isUnlocked) {
          achievementDetailIcon.style.filter = "grayscale(100%)";
        } else {
          achievementDetailIcon.style.filter = "";
        }
      } else {
        achievementDetailIcon.style.display = "none";
      }
    }
    
    // Toggle unlocked class for color styling
    if (isUnlocked) {
      achievementDetail.classList.add("unlocked");
    } else {
      achievementDetail.classList.remove("unlocked");
    }

    achievementDetail.classList.add("show");
    achievementDetail.style.display = "flex";
    
    // Update navigation to focus the back button
    updateNavigableButtons('stats');
  }

  function hideAchievementDetail() {
    achievementDetail.classList.remove("show");
    achievementDetail.style.display = "none";
    // Update navigation to return to achievement slots
    updateNavigableButtons('stats');
  }

  // Achievement persistence functions
  function loadAchievements() {
    try {
      const saved = localStorage.getItem(LS_ACHIEVEMENTS);
      if (saved) {
        unlockedAchievements = JSON.parse(saved);
      } else {
        // Initialize all achievements as locked
        unlockedAchievements = {1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false};
      }
    } catch (err) {
      console.warn("Failed to load achievements:", err);
      unlockedAchievements = {1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false};
    }
  }

  function saveAchievements() {
    try {
      localStorage.setItem(LS_ACHIEVEMENTS, JSON.stringify(unlockedAchievements));
    } catch (err) {
      console.warn("Failed to save achievements:", err);
    }
  }

  function unlockAchievement(achievementId) {
    if (unlockedAchievements[achievementId]) {
      return; // Already unlocked
    }
    
    unlockedAchievements[achievementId] = true;
    saveAchievements();
    
    // Add to notification queue
    achievementQueue.push(achievementId);
    
    // Start displaying if not already showing
    if (!isShowingAchievement) {
      showNextAchievement();
    }
  }
  
  function showNextAchievement() {
    if (achievementQueue.length === 0) {
      isShowingAchievement = false;
      // Wait for fade-out transition to complete before showing high score banner
      setTimeout(() => {
        if (newHighScoreTimer > 0 && highScoreBanner) {
          highScoreBanner.classList.add("show");
        }
      }, 300); // Wait for achievement notification fade-out
      return;
    }
    
    isShowingAchievement = true;
    const achievementId = achievementQueue.shift();
    const achievement = ACHIEVEMENTS[achievementId];
    
    // ===== ARCADE: Skip achievement notifications if elements don't exist =====
    if (!achievementNotificationImage || !achievementNotificationName || !achievementNotification) {
      console.log('Achievement notification elements not found, skipping notification');
      // Process next achievement immediately
      setTimeout(() => showNextAchievement(), 0);
      return;
    }
    // ===== END ARCADE =====
    
    // Set notification content
    achievementNotificationImage.src = achievement.imageOn;
    achievementNotificationName.textContent = achievement.name;
    
    // Show notification
    achievementNotification.classList.add('show');
    
    // Play achievement unlock sound
    playSfx(assets.extraLife, performance.now(), 0);
    
    // Hide after 3 seconds and show next
    setTimeout(() => {
      achievementNotification.classList.remove('show');
      
      // Wait for fade out, then show next
      setTimeout(() => {
        showNextAchievement();
      }, 300); // Match CSS transition duration
    }, ACHIEVEMENT_DISPLAY_DURATION);
  }

  function isAchievementUnlocked(achievementId) {
    return unlockedAchievements[achievementId] === true;
  }

  // Share score to clipboard
  function shareScore() {
    // Open share preview overlay instead of copying to clipboard
    generateSharePreview();
  }

  // Generate share image preview
  async function generateSharePreview() {
    if (!shareCanvas || !sharePreviewOverlay) return;
    
    const ctx = shareCanvas.getContext('2d');
    const canvasWidth = 1080;
    const canvasHeight = 1080;
    
    // Set canvas size
    shareCanvas.width = canvasWidth;
    shareCanvas.height = canvasHeight;
    
    try {
      // ARCADE: Sharing not available in arcade version
      console.warn('Share feature not available in arcade version');
      return;
      
      // Load background image
      const bgImage = new Image();
      bgImage.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        bgImage.onload = resolve;
        bgImage.onerror = reject;
        bgImage.src = null; // Sharing assets removed for arcade version
      });
      
      // Draw background
      ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
      
      // Define content area (737×416px, centered, 350px from top)
      const contentX = (canvasWidth - 737) / 2;
      const contentY = 350;
      const contentWidth = 737;
      
      // Set font and color
      ctx.fillStyle = THEME_COLOR;
      ctx.textAlign = 'center';
      
      // Challenge text at top (smaller)
      ctx.font = '28px "Press Start 2P", monospace';
      ctx.fillText('CAN YOU BEAT MY SCORE?', canvasWidth / 2, contentY + 30);
      
      // Score (large and prominent - priority)
      ctx.font = '72px "Press Start 2P", monospace';
      ctx.fillText(points.toString(), canvasWidth / 2, contentY + 120);
      
      // "POINTS" label (smaller)
      ctx.font = '20px "Press Start 2P", monospace';
      ctx.fillText('POINTS', canvasWidth / 2, contentY + 150);
      
      // Show either stickers or survival time
      ctx.font = '18px "Press Start 2P", monospace';
      if (gameMode === "SURVIVAL") {
        const minutes = Math.floor(survivalTime / 60);
        const seconds = Math.floor(survivalTime % 60);
        const timeString = `${minutes}:${String(seconds).padStart(2, '0')}`;
        ctx.fillText(`SURVIVED ${timeString}`, canvasWidth / 2, contentY + 180);
      } else {
        ctx.fillText(`${stickersCollected} STICKERS`, canvasWidth / 2, contentY + 180);
      }
      
      // Generate QR code (priority)
      const qrContainer = document.createElement('div');
      qrContainer.style.position = 'absolute';
      qrContainer.style.left = '-9999px';
      document.body.appendChild(qrContainer);
      
      const gameURL = window.location.origin + window.location.pathname;
      const qrCode = new QRCode(qrContainer, {
        text: gameURL,
        width: 180,
        height: 180,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
      
      // Wait for QR code to generate (increased timeout for reliability)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get QR code - try canvas first (more reliable on mobile), then image
      let qrSource = qrContainer.querySelector('canvas');
      if (!qrSource) {
        qrSource = qrContainer.querySelector('img');
      }
      
      if (qrSource) {
        try {
          // Draw QR code centered
          const qrSize = 180;
          const qrX = (canvasWidth - qrSize) / 2;
          const qrY = contentY + 210;
          ctx.drawImage(qrSource, qrX, qrY, qrSize, qrSize);
          
          // "Scan to play!" text under QR (centered, smaller)
          ctx.font = '18px "Press Start 2P", monospace';
          ctx.fillText('SCAN TO PLAY!', canvasWidth / 2, qrY + qrSize + 30);
        } catch (err) {
          console.error('Error drawing QR code:', err);
        }
      }
      
      // Clean up QR container
      document.body.removeChild(qrContainer);
      
      // Check if Web Share API is available and show appropriate buttons
      if (shareToBtn) {
        if (navigator.share && navigator.canShare) {
          shareToBtn.style.display = 'block';
        } else {
          shareToBtn.style.display = 'none';
        }
      }
      
      // Show preview overlay
      showOnlyOverlay('sharePreview');
      
    } catch (error) {
      console.error('Error generating share preview:', error);
      // Fallback to old behavior
      const shareText = `I scored ${points} points in Sticker Snatch! 🐐`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText)
          .then(() => showShareFeedback("Copied to clipboard!"))
          .catch(err => console.warn("Failed to copy:", err));
      }
    }
  }

  // Show temporary feedback message for share action
  function showShareFeedback(message) {
    // Find the active overlay to show feedback in
    let feedbackContainer = null;
    if (winOverlay && winOverlay.classList.contains("show")) {
      feedbackContainer = statusMessage;
    } else if (gameOverOverlay && gameOverOverlay.classList.contains("show")) {
      feedbackContainer = gameOverStatusMessage;
    } else if (leaderboardOverlay && leaderboardOverlay.classList.contains("show")) {
      // Create temporary feedback for leaderboard if needed
      feedbackContainer = gameOverStatusMessage; // Reuse or create new element
    }
    
    if (feedbackContainer) {
      const originalText = feedbackContainer.textContent;
      const originalColor = feedbackContainer.style.color;
      
      feedbackContainer.textContent = message;
      feedbackContainer.style.color = message.includes("failed") ? "#ff6b6b" : "#4CAF50";
      
      // Reset after 2 seconds
      setTimeout(() => {
        feedbackContainer.textContent = originalText;
        feedbackContainer.style.color = originalColor;
      }, 2000);
    }
  }

  // ===== Settings State =====
  const MUSIC_MAX_GAIN = 0.5; // Maximum music volume (current default)
  let musicVolume = 50; // 0-100
  let sfxVolume = 100; // 0-100
  let hapticsEnabled = true;
  let sfxVolumeMultiplier = 1.0; // Derived from sfxVolume (0.0-1.0)

  function loadSettings() {
    try {
      const savedMusic = localStorage.getItem(LS_MUSIC_VOLUME);
      const savedSfx = localStorage.getItem(LS_SFX_VOLUME);
      const savedHaptics = localStorage.getItem(LS_HAPTICS_ENABLED);

      if (savedMusic !== null) {
        musicVolume = parseInt(savedMusic, 10);
      }
      if (savedSfx !== null) {
        sfxVolume = parseInt(savedSfx, 10);
      }
      if (savedHaptics !== null) {
        hapticsEnabled = savedHaptics === 'true';
      }

      // Update derived values
      sfxVolumeMultiplier = sfxVolume / 100;

      // Update music gain if audio context exists
      if (musicGain) {
        musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
      }
    } catch (err) {
      // Silent fail on localStorage errors
    }
  }

  function loadStats() {
    try {
      const savedBest = localStorage.getItem(LS_PERSONAL_BEST);
      const savedGames = localStorage.getItem(LS_TOTAL_GAMES);
      const savedStickers = localStorage.getItem(LS_TOTAL_STICKERS);
      const savedBestStickers = localStorage.getItem(LS_BEST_STICKER_COUNT);
      
      // Load survival mode stats
      const savedSurvivalTime = localStorage.getItem(LS_SURVIVAL_LONGEST_TIME);
      const savedSurvivalScore = localStorage.getItem(LS_SURVIVAL_HIGH_SCORE);
      const savedSurvivalRuns = localStorage.getItem(LS_SURVIVAL_TOTAL_RUNS);
      const savedSurvivalStickers = localStorage.getItem(LS_SURVIVAL_TOTAL_STICKERS);
      
      if (savedBest !== null) personalBest = parseInt(savedBest, 10);
      if (savedGames !== null) totalGamesPlayed = parseInt(savedGames, 10);
      if (savedStickers !== null) totalStickersAllTime = parseInt(savedStickers, 10);
      if (savedBestStickers !== null) bestStickerCount = parseInt(savedBestStickers, 10);
      
      if (savedSurvivalTime !== null) survivalLongestTime = parseInt(savedSurvivalTime, 10);
      if (savedSurvivalScore !== null) survivalHighScore = parseInt(savedSurvivalScore, 10);
      if (savedSurvivalRuns !== null) survivalTotalRuns = parseInt(savedSurvivalRuns, 10);
      if (savedSurvivalStickers !== null) survivalTotalStickers = parseInt(savedSurvivalStickers, 10);
    } catch (err) {
      // Silent fail
    }
  }

  function saveStats() {
    try {
      localStorage.setItem(LS_PERSONAL_BEST, String(personalBest));
      localStorage.setItem(LS_TOTAL_GAMES, String(totalGamesPlayed));
      localStorage.setItem(LS_TOTAL_STICKERS, String(totalStickersAllTime));
      localStorage.setItem(LS_BEST_STICKER_COUNT, String(bestStickerCount));
    } catch (err) {
      // Silent fail
    }
  }
  
  function saveSurvivalStats() {
    try {
      localStorage.setItem(LS_SURVIVAL_LONGEST_TIME, String(survivalLongestTime));
      localStorage.setItem(LS_SURVIVAL_HIGH_SCORE, String(survivalHighScore));
      localStorage.setItem(LS_SURVIVAL_TOTAL_RUNS, String(survivalTotalRuns));
      localStorage.setItem(LS_SURVIVAL_TOTAL_STICKERS, String(survivalTotalStickers));
    } catch (err) {
      // Silent fail
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(LS_MUSIC_VOLUME, String(musicVolume));
      localStorage.setItem(LS_SFX_VOLUME, String(sfxVolume));
      localStorage.setItem(LS_HAPTICS_ENABLED, String(hapticsEnabled));
    } catch (err) {
      // Silent fail on localStorage errors
    }
  }

  // ===== ARCADE CREDIT SYSTEM =====
  let arcadeCredits = 0;

  function loadCredits() {
    try {
      const saved = localStorage.getItem(LS_ARCADE_CREDITS);
      if (saved !== null) {
        arcadeCredits = parseInt(saved, 10);
        if (isNaN(arcadeCredits) || arcadeCredits < 0) arcadeCredits = 0;
      }
    } catch (err) {
      arcadeCredits = 0;
    }
    updateCreditDisplay();
  }

  function saveCredits() {
    try {
      localStorage.setItem(LS_ARCADE_CREDITS, String(arcadeCredits));
    } catch (err) {
      // Silent fail
    }
  }

  function addCredit() {
    arcadeCredits += CREDITS_PER_COIN;
    saveCredits();
    updateCreditDisplay();
    playSfx(assets.thickGrab, performance.now(), 0); // Play thick sticker sound for coin insertion
  }

  function deductCredit() {
    if (arcadeCredits > 0) {
      arcadeCredits--;
      saveCredits();
      updateCreditDisplay();
      return true;
    }
    return false;
  }

  function updateCreditDisplay() {
    if (!arcadeCreditDisplay || !insertCoinMessage || !creditCounter || !creditCount) return;
    
    // Update credit count text
    creditCount.textContent = arcadeCredits;
    
    // Show/hide based on credits
    if (arcadeCredits === 0) {
      insertCoinMessage.style.display = 'block';
      creditCounter.style.display = 'none';
    } else {
      insertCoinMessage.style.display = 'none';
      creditCounter.style.display = 'block';
    }
  }

  function showCreditDisplay() {
    if (arcadeCreditDisplay) {
      arcadeCreditDisplay.classList.remove('hideInGame');
    }
  }

  function hideCreditDisplay() {
    if (arcadeCreditDisplay) {
      arcadeCreditDisplay.classList.add('hideInGame');
    }
  }
  // ===== END ARCADE CREDIT SYSTEM =====

  // ===== ARCADE NAME ENTRY SYSTEM =====
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -!?$&'.split('');
  let arcadeEnteredName = '';
  let arcadeGridIndex = 0;
  let arcadeIsWin = false; // Track if this is a win or game over
  let arcadeLetterButtons = [];
  let arcadeControlButtons = [];
  let arcadeFromNameEntry = false; // Track if leaderboard was shown from name entry
  
  function initArcadeAlphabetGrid() {
    if (!arcadeAlphabetGrid) return;
    
    // Clear existing grid
    arcadeAlphabetGrid.innerHTML = '';
    arcadeLetterButtons = [];
    
    // Create letter buttons
    ALPHABET.forEach((letter, index) => {
      const btn = document.createElement('button');
      btn.className = 'arcadeLetterBtn';
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.dataset.index = index;
      btn.addEventListener('click', () => selectLetter(letter));
      arcadeAlphabetGrid.appendChild(btn);
      arcadeLetterButtons.push(btn);
    });
    
    // Set up control buttons array for navigation
    arcadeControlButtons = [arcadeBackspaceBtn, arcadeEnterBtn, arcadeCancelBtn];
  }
  
  function showArcadeNameEntry(isWin) {
    console.log('showArcadeNameEntry called, isWin:', isWin);
    arcadeIsWin = isWin;
    arcadeEnteredName = '';
    arcadeGridIndex = 0;
    
    // Set title based on win/loss
    if (arcadeEntryTitle) {
      arcadeEntryTitle.textContent = isWin ? 'CONGRATULATIONS!' : 'GAME OVER';
      console.log('Title set to:', arcadeEntryTitle.textContent);
    }
    
    // Initialize grid if needed
    if (arcadeLetterButtons.length === 0) {
      console.log('Initializing alphabet grid...');
      initArcadeAlphabetGrid();
    }
    
    // Update display
    updateArcadeNameDisplay();
    
    // Focus first letter
    updateArcadeGridFocus();
    
    // Show overlay
    if (arcadeNameEntryOverlay) {
      console.log('Calling showOnlyOverlay with arcadename');
      showOnlyOverlay('arcadename');
      console.log('arcadeNameEntryOverlay classes:', arcadeNameEntryOverlay.className);
    } else {
      console.error('arcadeNameEntryOverlay is null!');
    }
  }
  
  function updateArcadeNameDisplay() {
    if (!arcadeNameDisplay) return;
    
    // Show entered name with underscores for remaining characters (3 max)
    const display = arcadeEnteredName.padEnd(3, '_');
    arcadeNameDisplay.textContent = display;
  }
  
  function selectLetter(letter) {
    if (arcadeEnteredName.length < 3) {
      arcadeEnteredName += letter;
      updateArcadeNameDisplay();
      playSfx(assets.menuCursor, performance.now(), 60);
      
      // If name is now full (3 letters), auto-jump to OK button
      if (arcadeEnteredName.length === 3) {
        const totalLetters = arcadeLetterButtons.length;
        arcadeGridIndex = totalLetters + 1; // +1 to select OK button (BACK is 0, OK is 1)
        updateArcadeGridFocus();
      }
    }
  }
  
  function arcadeBackspace() {
    if (arcadeEnteredName.length > 0) {
      arcadeEnteredName = arcadeEnteredName.slice(0, -1);
      updateArcadeNameDisplay();
      playSfx(assets.menuCursor, performance.now(), 60);
    }
  }
  
  function arcadeSubmitName() {
    // Validate name entry
    if (arcadeEnteredName.length === 0) {
      // Show error message
      if (arcadeEntryTitle) {
        const originalTitle = arcadeEntryTitle.textContent;
        arcadeEntryTitle.textContent = 'ENTER A NAME';
        arcadeEntryTitle.style.color = '#ff0000';
        playSfx(assets.thud, performance.now(), 0);
        
        // Reset title after 1 second
        setTimeout(() => {
          arcadeEntryTitle.textContent = originalTitle;
          arcadeEntryTitle.style.color = '';
        }, 1000);
      }
      return;
    }
    
    playSfx(assets.menuSelect, performance.now(), 0);
    
    // Submit score to leaderboard using existing function
    saveToLeaderboard(arcadeEnteredName.trim(), points, stickerTotalCollected);
    
    // Mark that leaderboard is being shown from name entry
    arcadeFromNameEntry = true;
    
    // Show leaderboard with special RETURN TO MENU button
    showLeaderboardWithHighlight(arcadeEnteredName.trim(), points, stickerTotalCollected);
  }
  
  function arcadeCancelEntry() {
    // Refresh game to return to title screen
    playSfx(assets.menuSelect, performance.now(), 0);
    window.location.reload();
  }
  
  function showLeaderboardWithHighlight(playerName, playerPoints, playerStickers) {
    // Show leaderboard overlay
    showOnlyOverlay('leaderboard');
    
    // Change BACK button to RETURN TO MENU if shown from name entry
    if (arcadeFromNameEntry && leaderboardBackBtn) {
      leaderboardBackBtn.textContent = 'RETURN TO MENU';
    }
    
    // Render leaderboard and highlight player's entry
    setTimeout(() => {
      renderLeaderboard();
      
      // Find and scroll to player's entry
      if (leaderboardList) {
        const entries = leaderboardList.querySelectorAll('.leaderboardEntry');
        entries.forEach((entry, index) => {
          const nameEl = entry.querySelector('.leaderboardName');
          const scoreEl = entry.querySelector('.leaderboardScore');
          const stickersEl = entry.querySelector('.leaderboardStickers');
          
          // Match by name, points, AND sticker count to ensure unique entry
          if (nameEl && scoreEl && stickersEl && 
              nameEl.textContent === playerName && 
              parseInt(scoreEl.textContent) === playerPoints &&
              parseInt(stickersEl.textContent) === playerStickers) {
            // Highlight this entry with thick glowing neon green border
            entry.style.border = '4px solid #39ff14';
            entry.style.boxShadow = '0 0 10px #39ff14, 0 0 20px #39ff14';
            
            // Scroll into view
            entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    }, 100);
  }
  // ===== END ARCADE NAME ENTRY =====
  
  function updateArcadeGridFocus() {
    // Remove all focus
    arcadeLetterButtons.forEach(btn => btn.classList.remove('focused'));
    arcadeControlButtons.forEach(btn => btn.classList.remove('focused'));
    
    // Check if we're in grid or control buttons
    const totalLetters = arcadeLetterButtons.length;
    
    if (arcadeGridIndex < totalLetters) {
      // In letter grid
      arcadeLetterButtons[arcadeGridIndex].classList.add('focused');
    } else {
      // In control buttons
      const controlIndex = arcadeGridIndex - totalLetters;
      if (controlIndex >= 0 && controlIndex < arcadeControlButtons.length) {
        arcadeControlButtons[controlIndex].classList.add('focused');
      }
    }
  }
  
  function arcadeNavigateUp() {
    const cols = 7; // Grid has 7 columns
    const totalLetters = arcadeLetterButtons.length;
    
    // If currently on CANCEL button (index 2 in control buttons)
    const controlIndex = arcadeGridIndex - totalLetters;
    if (controlIndex === 2) {
      // Move from CANCEL to ENTER button
      arcadeGridIndex = totalLetters + 1;
      updateArcadeGridFocus();
      playSfx(assets.menuCursor, performance.now(), 60);
      return;
    }
    
    // If on BACK button (0), go to "-" character (index 37)
    if (controlIndex === 0) {
      arcadeGridIndex = 37;
      updateArcadeGridFocus();
      playSfx(assets.menuCursor, performance.now(), 60);
      return;
    }
    
    // If on ENTER button (1), go to "?" character (index 39)
    if (controlIndex === 1) {
      arcadeGridIndex = 39;
      updateArcadeGridFocus();
      playSfx(assets.menuCursor, performance.now(), 60);
      return;
    }
    
    // Otherwise, normal up navigation
    const newIndex = arcadeGridIndex - cols;
    
    if (newIndex >= 0) {
      arcadeGridIndex = newIndex;
      updateArcadeGridFocus();
      playSfx(assets.menuCursor, performance.now(), 60);
    }
  }
  
  function arcadeNavigateDown() {
    const cols = 7;
    const totalLetters = arcadeLetterButtons.length;
    const totalCells = totalLetters + arcadeControlButtons.length;
    
    // If currently in letter grid
    if (arcadeGridIndex < totalLetters) {
      const newIndex = arcadeGridIndex + cols;
      
      // If new index would still be in letter grid, move there
      if (newIndex < totalLetters) {
        arcadeGridIndex = newIndex;
        updateArcadeGridFocus();
        playSfx(assets.menuCursor, performance.now(), 60);
      } else {
        // We're in bottom row of letters, jump to BACK/ENTER row only (not CANCEL)
        // Columns 0-3 (9, space, -, !) go to BACK (0)
        // Columns 4-6 (?, $, &) go to ENTER (1)
        const currentCol = arcadeGridIndex % cols;
        const controlIndex = currentCol <= 3 ? 0 : 1;
        arcadeGridIndex = totalLetters + controlIndex;
        updateArcadeGridFocus();
        playSfx(assets.menuCursor, performance.now(), 60);
      }
    } else {
      // If in control buttons row
      const controlIndex = arcadeGridIndex - totalLetters;
      // If on BACK (0) or ENTER (1), move down to CANCEL (2)
      if (controlIndex < 2) {
        arcadeGridIndex = totalLetters + 2; // Move to CANCEL
        updateArcadeGridFocus();
        playSfx(assets.menuCursor, performance.now(), 60);
      }
      // If already on CANCEL (2), can't go down further
    }
  }
  
  function arcadeNavigateLeft() {
    const totalLetters = arcadeLetterButtons.length;
    const controlIndex = arcadeGridIndex - totalLetters;
    
    // If on CANCEL (2), go to BACK (0)
    if (controlIndex === 2) {
      arcadeGridIndex = totalLetters + 0;
      updateArcadeGridFocus();
      playSfx(assets.menuCursor, performance.now(), 60);
    } else if (arcadeGridIndex > 0) {
      arcadeGridIndex--;
      updateArcadeGridFocus();
      playSfx(assets.menuCursor, performance.now(), 60);
    }
  }
  
  function arcadeNavigateRight() {
    const totalLetters = arcadeLetterButtons.length;
    const totalCells = totalLetters + arcadeControlButtons.length;
    const controlIndex = arcadeGridIndex - totalLetters;
    
    // If on CANCEL (2), go to ENTER (1)
    if (controlIndex === 2) {
      arcadeGridIndex = totalLetters + 1;
      updateArcadeGridFocus();
      playSfx(assets.menuCursor, performance.now(), 60);
    } else if (arcadeGridIndex < totalCells - 1) {
      arcadeGridIndex++;
      updateArcadeGridFocus();
      playSfx(assets.menuCursor, performance.now(), 60);
    }
  }
  
  function arcadeActivateSelected() {
    const totalLetters = arcadeLetterButtons.length;
    
    if (arcadeGridIndex < totalLetters) {
      // Select letter
      const letter = ALPHABET[arcadeGridIndex];
      selectLetter(letter);
    } else {
      // Activate control button
      const controlIndex = arcadeGridIndex - totalLetters;
      if (controlIndex === 0) arcadeBackspace();
      else if (controlIndex === 1) arcadeSubmitName();
      else if (controlIndex === 2) arcadeCancelEntry();
    }
  }
  // ===== END ARCADE NAME ENTRY =====

  // ===== Theme Color System =====
  const LS_THEME_COLOR = 'ss_theme_color';
  
  // Load theme color from localStorage
  function loadThemeColor() {
    try {
      const savedColor = localStorage.getItem(LS_THEME_COLOR);
      if (savedColor) {
        applyThemeColor(savedColor);
      } else {
        // First time user - apply default STICKER GOAT theme
        applyThemeColor('#E0FF00');
      }
    } catch (err) {
      // Silent fail - apply default
      applyThemeColor('#E0FF00');
    }
  }
  
  // Apply theme color to both CSS and JavaScript
  function applyThemeColor(color) {
    // Update JavaScript variable
    THEME_COLOR = color;
    
    // Update CSS custom properties
    const rgb = hexToRgb(color);
    document.documentElement.style.setProperty('--theme-color', color);
    document.documentElement.style.setProperty('--theme-color-0', `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
    document.documentElement.style.setProperty('--theme-color-10', `rgba(${rgb.r},${rgb.g},${rgb.b},0.1)`);
    document.documentElement.style.setProperty('--theme-color-15', `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`);
    document.documentElement.style.setProperty('--theme-color-20', `rgba(${rgb.r},${rgb.g},${rgb.b},0.2)`);
    document.documentElement.style.setProperty('--theme-color-28', `rgba(${rgb.r},${rgb.g},${rgb.b},0.28)`);
    document.documentElement.style.setProperty('--theme-color-30', `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`);
    document.documentElement.style.setProperty('--theme-color-35', `rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`);
    document.documentElement.style.setProperty('--theme-color-40', `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`);
    document.documentElement.style.setProperty('--theme-color-60', `rgba(${rgb.r},${rgb.g},${rgb.b},0.6)`);
    document.documentElement.style.setProperty('--theme-color-70', `rgba(${rgb.r},${rgb.g},${rgb.b},0.7)`);
    document.documentElement.style.setProperty('--theme-color-80', `rgba(${rgb.r},${rgb.g},${rgb.b},0.8)`);
    document.documentElement.style.setProperty('--theme-color-90', `rgba(${rgb.r},${rgb.g},${rgb.b},0.9)`);
    
    // CRITICAL: WordPress compatibility - Update background gradient with !important to override theme styles
    // DO NOT REMOVE: This ensures the radial gradient background changes with theme color in WordPress
    // This fix is required because WordPress themes often set background styles that override CSS variables
    const gradientValue = `radial-gradient(1200px 800px at 50% 20%, ${color} 0%, #000000 60%)`;
    document.body.style.setProperty('background', gradientValue, 'important');
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Recolor theme-dependent images (title frames, banner, player)
    recolorThemeImages(color);
    
    // Save to localStorage
    try {
      localStorage.setItem(LS_THEME_COLOR, color);
    } catch (err) {
      // Silent fail
    }
  }
  // ==============================

  // ===== WebAudio Music (more reliable on mobile) =====
let audioCtx = null;
let musicGain = null;

// Music buffers for different tracks
let mainGameMusicBuffer = null;
let mainGameMusic2XBuffer = null;
let mainGameMusicTurntBuffer = null;
let bossMusicBuffer = null;
let winMusicBuffer = null;
let creditMusicBuffer = null;
let secretLevelMusicBuffer = null;
let survivalMusicBuffer = null;
let gameIntroMusicBuffer = null;

// ===== ARCADE: Game intro sequence =====
let introSequencePlaying = false;
let introMusicSource = null;
const INTRO_MUSIC_VOLUME = 0.7; // Game intro music volume
let introPlayerShaking = false; // Player shake during intro (not screen shake)
let introPlayerShakeAmount = 2; // Pixels to shake player
let introBeamActive = false; // Track if beam should be rendered on canvas
let introBeamHeight = 0; // Height of beam during descent/retract animation (0 to full height)
let introBossImage = 'bren1'; // Which boss image to show during intro (bren1, bren2, or bren3)
let introBossText = ''; // Boss taunt text during intro
let introStickers = []; // Array of stickers flying during intro {x, y, rotation, opacity, isThick, startTime, duration}
let introBossAscending = false; // Track if boss is ascending (stickers should move with it)
let introBossStartAscendY = 0; // Boss Y position when ascent starts
// ===== END ARCADE INTRO =====

// ===== ARCADE: Credits sequence =====
let creditsSequencePlaying = false;
let creditsMusicFinished = false; // Track when credits music has finished playing
let creditsStartTime = 0;
let creditsMusicSource = null;
const CREDITS_MUSIC_VOLUME = 1.0;
const CREDITS_DURATION = 191; // 3:11 in seconds (191 seconds)
const CREDITS_NAME_ENTRY_TIME = 161; // 30 seconds before end (show name entry at 2:41)

// Credits scrolling state
let creditsBgOffset = 0;
let creditsBgPattern = null;
let creditsBgScale = 1;
let creditsBgTileH = 0;
let creditsTextY = H; // Start credits text below screen
const CREDITS_SCROLL_SPEED = 20; // Pixels per second for credits text
const CREDITS_PLAYER_X_LIMIT = 190; // Player limited to left 190px

// Surf goat actual size (from surf-goat.png: 54x72)
const SURF_GOAT_W = 54;
const SURF_GOAT_H = 72;

// Credits phases
let creditsPhase = 0; // 0: earth/moon scroll, 1: fade to white, 2: playable credits, 3: name entry shown
let creditsFadeAlpha = 0; // For fade to white effect
let creditsEarthY = -300; // Start earth above screen
let creditsMoonY = -300; // Moon follows earth
let creditsShowSkipIndicator = true;
let creditsStickers = []; // Turnt stickers to collect during credits
let creditsLastStickerSpawn = 0; // Time of last sticker spawn

// Credits moon animation (same as title screen)
let creditsMoonTimer = 0;
let creditsMoonActive = false;
let creditsMoonBehindEarth = false;
let creditsMoonScale = 1.0;
let creditsMoonOffsetX = -500;
let creditsMoonOffsetY = -500;

// Credits text content
const CREDITS_TEXT = [
  "",
  "",
  "",
  "STICKER SNATCH",
  "a STICKERGOAT.COM game",
  "",
  "",
  "Created by",
  "MIKE LIGHTCAP",
  "",
  "",
  "MUSIC & SFX by",
  "MARSH SOUND",
  "",
  "",
  "Game Design",
  "& Production by",
  "MIKE LIGHTCAP",
  "MARSH SOUND",
  "BREN MARRA",
  "CONNOR PLANK",
  "",
  "",
  "Cabinet Design by",
  "CONNOR PLANK",
  "",
  "",
  "Special Thanks to:",
  "CLIFF KOETAS",
  "JOHN STORZ",
  "KATE NASH LIGHTCAP",
  "CRISSY",
  "ALL OTHER PLAYTESTERS",
  "",
  "",
  ""
];
// ===== END ARCADE CREDITS =====

// ===== ARCADE: Title screen music =====
let titleMusicSource = null;
let titleMusicPlaying = false;
const TITLE_MUSIC_VOLUME = 1.0; // Title screen music volume
// ===== END ARCADE =====

// Current music source and timing for seamless powerup switching
let musicSource = null;
let currentTrack = null; // Track which music is playing: 'main', 'main2X', 'mainTurnt', 'boss', 'win', 'secretLevel'
let musicStartTime = 0; // When current track started (in audioCtx.currentTime)
let musicStarted = false;

// ===== ARCADE: Title Screen Music Functions =====
function playTitleMusic() {
  if (!audioCtx || !survivalMusicBuffer || titleMusicPlaying) return;
  
  // CRITICAL: Only play title music if we're actually on the title screen
  if (!titleOverlay || !titleOverlay.classList.contains('show')) {
    return; // Don't play if not on title screen
  }
  
  try {
    // Stop any existing title music
    stopTitleMusic();
    
    titleMusicSource = audioCtx.createBufferSource();
    titleMusicSource.buffer = survivalMusicBuffer;
    titleMusicSource.loop = true;
    
    // Create a separate gain node for title music at lower volume
    const titleGain = audioCtx.createGain();
    titleGain.gain.value = TITLE_MUSIC_VOLUME * (musicVolume / 100) * MUSIC_MAX_GAIN;
    
    titleMusicSource.connect(titleGain);
    titleGain.connect(audioCtx.destination);
    titleMusicSource.start(0);
    titleMusicPlaying = true;
  } catch (err) {
    console.error("Failed to play title music:", err);
  }
}

function stopTitleMusic() {
  if (titleMusicSource) {
    try {
      titleMusicSource.stop();
    } catch (err) {
      // Already stopped
    }
    titleMusicSource = null;
  }
  titleMusicPlaying = false;
}
// ===== END ARCADE TITLE MUSIC =====

// ===== ARCADE GAME INTRO SEQUENCE =====
let introResolveFunction = null; // Store resolve function for skip
let introSkipIndicator = null; // Skip indicator element
let introTimeouts = []; // Store all setTimeout IDs
let introIntervals = []; // Store all setInterval IDs

function skipIntroSequence() {
  if (!introSequencePlaying || !introResolveFunction) return;
  
  console.log('Skipping intro sequence...');
  
  // Clear ALL timeouts and intervals from intro sequence
  console.log('Clearing', introTimeouts.length, 'timeouts and', introIntervals.length, 'intervals');
  introTimeouts.forEach(id => clearTimeout(id));
  introIntervals.forEach(id => clearInterval(id));
  introTimeouts = [];
  introIntervals = [];
  
  // Get DOM elements
  const introContainer = document.getElementById('gameIntroContainer');
  const stickersContainer = document.getElementById('introStickersContainer');
  
  // Hide intro container and clear stickers
  if (introContainer) introContainer.style.display = 'none';
  if (stickersContainer) stickersContainer.innerHTML = '';
  
  // Stop intro music
  stopIntroMusic();
  
  // Reset all intro state variables
  introSequencePlaying = false;
  introPlayerShaking = false;
  introBeamActive = false;
  introBeamHeight = 0;
  introStickers = [];
  introBossAscending = false;
  introBossStartAscendY = 0;
  introBossImage = 'bren1';
  introBossText = '';
  bossY = -200;
  playerHasEntered = true; // Mark player as entered
  
  // Hide skip indicator
  if (introSkipIndicator) introSkipIndicator.style.display = 'none';
  
  // Restore credits/insert coin display
  updateCreditDisplay();
  
  // Start game music immediately
  playMusic('main', { loop: true }).catch(err => {
    console.error('Failed to start game music after skip:', err);
  });
  
  // Resolve the promise to continue to countdown
  console.log('Intro skipped, starting countdown...');
  if (introResolveFunction) {
    introResolveFunction();
    introResolveFunction = null;
  }
}

function playIntroMusic() {
  if (!audioCtx || !gameIntroMusicBuffer || introMusicSource) return;
  
  try {
    introMusicSource = audioCtx.createBufferSource();
    introMusicSource.buffer = gameIntroMusicBuffer;
    introMusicSource.loop = false;
    
    const introGain = audioCtx.createGain();
    introGain.gain.value = INTRO_MUSIC_VOLUME * (musicVolume / 100) * MUSIC_MAX_GAIN;
    
    introMusicSource.connect(introGain);
    introGain.connect(audioCtx.destination);
    introMusicSource.start(0);
  } catch (err) {
    console.error("Failed to play intro music:", err);
  }
}

function stopIntroMusic() {
  if (introMusicSource) {
    try {
      introMusicSource.stop();
    } catch (err) {
      // Already stopped
    }
    introMusicSource = null;
  }
}

async function playGameIntroSequence() {
  return new Promise((resolve) => {
    introResolveFunction = resolve; // Store resolve for skip function
    introSequencePlaying = true;
    
    // Clear any existing timers from previous intro
    introTimeouts.forEach(id => clearTimeout(id));
    introIntervals.forEach(id => clearInterval(id));
    introTimeouts = [];
    introIntervals = [];
    
    // Get and show skip indicator
    introSkipIndicator = document.getElementById('introSkipIndicator');
    if (introSkipIndicator) introSkipIndicator.style.display = 'block';
    
    // Initialize player and boss positions
    playerX = W / 2;
    playerEntranceY = H + 100; // Start below screen for entrance animation
    bossY = -200; // Start well above screen (was -120)
    bossW = 178; // Normal boss width
    
    // Get DOM elements
    const introContainer = document.getElementById('gameIntroContainer');
    const introBeam = document.getElementById('introBeam');
    const stickersContainer = document.getElementById('introStickersContainer');
    
    if (!introContainer || !introBeam || !stickersContainer) {
      resolve();
      return;
    }
    
    // Show intro container
    introContainer.style.display = 'block';
    
    // Hide credits/insert coin text during intro
    const insertCoinMessage = document.getElementById('insertCoinMessage');
    const creditCounter = document.getElementById('creditCounter');
    if (insertCoinMessage) insertCoinMessage.style.display = 'none';
    if (creditCounter) creditCounter.style.display = 'none';
    
    // Stop menu music and play intro music
    stopMusic();
    playIntroMusic();
    
    // Get intro duration from buffer (should be ~26 seconds)
    const introDuration = gameIntroMusicBuffer ? gameIntroMusicBuffer.duration : 26;
    
    // Timeline (all timings in seconds from start)
    const timeline = {
      bossDescendStart: 1,
      bossDescendEnd: 3.5,
      tauntBlinkStart: 4,
      taunt1Start: 4.5,      // "GET ON THE MAP"
      taunt1End: 6,
      taunt2Start: 6,        // "LIL BITCH"
      taunt2End: 7.5,
      bossToBren3: 10,       // Switch to bren3 when beam starts
      beamDescendStart: 10,  // Beam starts descending
      beamDescendEnd: 11,    // Beam reaches player
      goatShakeStart: 11,    // Goat shake when beam touches
      stickersStart: 11,     // Stickers fly when beam touches
      stickersEnd: 18,       // Stickers stop (shortened from 22)
      beamRetractStart: 18,  // Beam starts retracting
      beamRetractEnd: 19,    // Beam fully retracted
      finalTauntBlinkStart: 19.5, // Boss starts blinking for final taunt
      finalTauntStart: 20,   // "HOLLER AT ME" taunt
      finalTauntEnd: 21.5,   // Final taunt ends
      switchBackToBren1: 21.5, // Switch back to bren1
      bossAscendStart: 22,   // Boss starts ascending
      bossAscendEnd: introDuration - 0.5 // Boss exits screen
    };
    
    // Phase 1: Boss descends (1s - 3.5s)
    introTimeouts.push(setTimeout(() => {
      // Animate boss descending on canvas (slower like boss level)
      bossY = -200; // Start above screen
      const bossDesc = setInterval(() => {
        bossY += 1.33; // Slower descent (~80 pixels per second like BOSS_ENTER_SPEED)
        if (bossY >= BOSS_Y_STOP) {
          bossY = BOSS_Y_STOP;
          clearInterval(bossDesc);
        }
      }, 16);
      introIntervals.push(bossDesc);
      
      // Animate player ascending at the same time
      const playerEntranceStart = Date.now();
      const playerEntranceDuration = 2500; // 2.5 seconds to reach position
      const playerStartY = H + 100;
      const playerTargetY = PLAYER_Y;
      
      const playerAscend = setInterval(() => {
        const elapsed = Date.now() - playerEntranceStart;
        const progress = Math.min(elapsed / playerEntranceDuration, 1);
        playerEntranceY = playerStartY - (progress * (playerStartY - playerTargetY));
        
        if (progress >= 1) {
          playerEntranceY = playerTargetY;
          playerHasEntered = true; // Mark as entered so level 1 doesn't animate again
          clearInterval(playerAscend);
        }
      }, 16);
      introIntervals.push(playerAscend);
    }, timeline.bossDescendStart * 1000));
    
    // Phase 1.5: Boss blinks (talking animation) while showing taunts (4s - 7.5s)
    let blinkInterval;
    introTimeouts.push(setTimeout(() => {
      blinkInterval = setInterval(() => {
        introBossImage = introBossImage === 'bren1' ? 'bren2' : 'bren1';
      }, 200); // Blink every 200ms
      introIntervals.push(blinkInterval);
    }, timeline.tauntBlinkStart * 1000));
    
    // Taunt 1: "GET ON THE MAP" (4.5s - 6s)
    introTimeouts.push(setTimeout(() => {
      introBossText = 'GET ON THE MAP';
      // Play map audio
      const mapAudio = new Audio(ASSETS.sounds.map);
      mapAudio.volume = (sfxVolume / 100) * 0.75;
      mapAudio.play().catch(err => console.log('Map audio play failed:', err));
    }, timeline.taunt1Start * 1000));
    
    // Taunt 2: "LIL BITCH" (6s - 7.5s)
    introTimeouts.push(setTimeout(() => {
      introBossText = 'LIL BITCH';
      // Play bitch audio
      const bitchAudio = new Audio(ASSETS.sounds.bitch);
      bitchAudio.volume = (sfxVolume / 100) * 0.75;
      bitchAudio.play().catch(err => console.log('Bitch audio play failed:', err));
    }, timeline.taunt2Start * 1000));
    
    // Clear taunts and stop blinking at end of taunt2 (7.5s)
    introTimeouts.push(setTimeout(() => {
      introBossText = '';
      introBossImage = 'bren1'; // Stop on bren1
      if (blinkInterval) clearInterval(blinkInterval);
    }, timeline.taunt2End * 1000));
    
    // Switch to bren3 when beam starts (10s)
    introTimeouts.push(setTimeout(() => {
      introBossImage = 'bren3';
    }, timeline.bossToBren3 * 1000));
    
    // Phase 2: Beam descends slowly (10s - 11s)
    introTimeouts.push(setTimeout(() => {
      introBeamActive = true;
      introBeamHeight = 0;
      const beamDescendDuration = (timeline.beamDescendEnd - timeline.beamDescendStart) * 1000;
      const beamDescendStart = Date.now();
      
      const beamDescendInterval = setInterval(() => {
        const elapsed = Date.now() - beamDescendStart;
        const progress = Math.min(elapsed / beamDescendDuration, 1);
        introBeamHeight = progress; // 0 to 1
        
        if (progress >= 1) {
          introBeamHeight = 1;
          clearInterval(beamDescendInterval);
        }
      }, 16); // ~60fps
      introIntervals.push(beamDescendInterval);
    }, timeline.beamDescendStart * 1000));
    
    // Phase 3: Goat shakes when beam touches (11s)
    introTimeouts.push(setTimeout(() => {
      introPlayerShaking = true; // Enable player shake (not screen shake)
      
      // Play collision sound
      const collisionAudio = new Audio(ASSETS.sounds.hit);
      collisionAudio.volume = (sfxVolume / 100) * 0.8;
      collisionAudio.play().catch(err => console.log('Collision audio play failed:', err));
    }, timeline.goatShakeStart * 1000));
    
    // Phase 4: Stickers fly out (canvas-based, finite number, don't fade)
    introTimeouts.push(setTimeout(() => {
      introStickers = []; // Clear any existing stickers
      const stickerDuration = (timeline.stickersEnd - timeline.stickersStart) * 1000;
      const stickerCount = 80;
      const stickerInterval = stickerDuration / stickerCount;
      
      // Play overlapping sticker sounds throughout the duration
      const stickerSoundCount = 25; // Number of sticker sounds to play
      const stickerSoundInterval = stickerDuration / stickerSoundCount;
      let stickerSoundsPlayed = 0;
      
      const stickerSoundLoop = setInterval(() => {
        if (stickerSoundsPlayed >= stickerSoundCount) {
          clearInterval(stickerSoundLoop);
          return;
        }
        
        const isThickSound = Math.random() < 0.3;
        const stickerAudio = new Audio(isThickSound ? ASSETS.sounds.thickGrab : ASSETS.sounds.grab);
        stickerAudio.volume = (sfxVolume / 100) * 0.4; // Lower volume for overlapping sounds
        stickerAudio.play().catch(err => console.log('Sticker audio play failed:', err));
        
        stickerSoundsPlayed++;
      }, stickerSoundInterval);
      introIntervals.push(stickerSoundLoop);
      
      let stickersSpawned = 0;
      const stickerSpawnInterval = setInterval(() => {
        if (stickersSpawned >= stickerCount) {
          clearInterval(stickerSpawnInterval);
          return;
        }
        
        // Create sticker object for canvas rendering
        const sticker = {
          x: (W / 2) + (Math.random() - 0.5) * 40, // Start from player X
          y: PLAYER_Y + (Math.random() - 0.5) * 20, // Start from player Y
          startX: (W / 2) + (Math.random() - 0.5) * 40,
          startY: PLAYER_Y + (Math.random() - 0.5) * 20,
          endX: W / 2, // End at boss center X
          endY: BOSS_Y_STOP + 40, // End at boss Y
          rotation: 0,
          targetRotation: Math.random() * 720, // Rotate during flight
          opacity: 1,
          isThick: Math.random() < 0.3,
          startTime: Date.now(),
          duration: 1200, // Fixed duration for all stickers
          completed: false // Track if sticker reached destination
        };
        
        introStickers.push(sticker);
        stickersSpawned++;
      }, stickerInterval);
      introIntervals.push(stickerSpawnInterval);
    }, timeline.stickersStart * 1000));
    
    // Phase 5: Stop goat shaking and play magnet-end sound
    introTimeouts.push(setTimeout(() => {
      introPlayerShaking = false;
      
      // Play magnet end sound
      const magnetEndAudio = new Audio(ASSETS.sounds.magnetEnd);
      magnetEndAudio.volume = (sfxVolume / 100) * 0.6;
      magnetEndAudio.play().catch(err => console.log('Magnet end audio play failed:', err));
    }, timeline.stickersEnd * 1000));
    
    // Phase 6: Beam retracts slowly (18s - 19s)
    introTimeouts.push(setTimeout(() => {
      const beamRetractDuration = (timeline.beamRetractEnd - timeline.beamRetractStart) * 1000;
      const beamRetractStart = Date.now();
      
      const beamRetractInterval = setInterval(() => {
        const elapsed = Date.now() - beamRetractStart;
        const progress = Math.min(elapsed / beamRetractDuration, 1);
        introBeamHeight = 1 - progress; // 1 to 0
        
        if (progress >= 1) {
          introBeamHeight = 0;
          introBeamActive = false;
          clearInterval(beamRetractInterval);
        }
      }, 16); // ~60fps
      introIntervals.push(beamRetractInterval);
    }, timeline.beamRetractStart * 1000));
    
    // Phase 6b: Final taunt - boss blinks and says "HOLLER AT ME" (19.5s - 21.5s)
    introTimeouts.push(setTimeout(() => {
      // Switch boss back to bren1 and start blinking
      introBossImage = 'bren1';
      
      const finalBlinkInterval = setInterval(() => {
        introBossImage = introBossImage === 'bren1' ? 'bren2' : 'bren1';
      }, 200);
      introIntervals.push(finalBlinkInterval);
      
      // Show "HOLLER AT ME" text and play audio at 20s
      introTimeouts.push(setTimeout(() => {
        introBossText = 'HOLLER AT ME';
        const hollerAudio = new Audio(ASSETS.sounds.holler);
        hollerAudio.volume = (sfxVolume / 100) * 0.75;
        hollerAudio.play().catch(err => console.log('Holler audio play failed:', err));
        
        // Clear text and stop blinking at 21.5s, stay on bren1
        introTimeouts.push(setTimeout(() => {
          introBossText = '';
          introBossImage = 'bren1';
          clearInterval(finalBlinkInterval);
        }, (timeline.finalTauntEnd - timeline.finalTauntStart) * 1000));
      }, (timeline.finalTauntStart - timeline.finalTauntBlinkStart) * 1000));
    }, timeline.finalTauntBlinkStart * 1000));
    
    // Phase 7: Boss ascends slowly (23s - 26s)
    introTimeouts.push(setTimeout(() => {
      introBossAscending = true;
      introBossStartAscendY = bossY; // Track starting Y position
      const bossAscendDuration = (timeline.bossAscendEnd - timeline.bossAscendStart) * 1000;
      const targetY = -200; // Ascend to above screen
      const startY = bossY;
      const bossAscendStart = Date.now();
      
      const bossAscInterval = setInterval(() => {
        const elapsed = Date.now() - bossAscendStart;
        const progress = Math.min(elapsed / bossAscendDuration, 1);
        bossY = startY + (targetY - startY) * progress;
        
        if (progress >= 1) {
          bossY = targetY;
          clearInterval(bossAscInterval);
        }
      }, 16); // ~60fps
      introIntervals.push(bossAscInterval);
    }, timeline.bossAscendStart * 1000));
    
    // Phase 8: Cleanup and resolve (end of intro)
    introTimeouts.push(setTimeout(() => {
      console.log('Intro cleanup phase starting...');
      introContainer.style.display = 'none';
      stickersContainer.innerHTML = '';
      stopIntroMusic();
      introSequencePlaying = false;
      introPlayerShaking = false;
      introBeamActive = false;
      introBeamHeight = 0;
      introStickers = []; // Clear stickers
      introBossAscending = false; // Reset
      introBossStartAscendY = 0;
      introBossImage = 'bren1';
      introBossText = '';
      bossY = -200; // Reset boss position
      
      // Hide skip indicator
      if (introSkipIndicator) introSkipIndicator.style.display = 'none';
      introResolveFunction = null; // Clear resolve function
      
      // Restore credits/insert coin display (updateCreditDisplay will handle it)
      updateCreditDisplay();
      
      // Start game music (og.mp3) for countdown/gameplay
      playMusic('main', { loop: true }).catch(err => {
        console.error('Failed to start game music after intro:', err);
      });
      
      console.log('Intro sequence resolving, countdown should start now...');
      resolve();
    }, introDuration * 1000));
  });
}
// ===== END ARCADE GAME INTRO SEQUENCE =====

// ===== ARCADE CREDITS SEQUENCE =====
function startCreditsSequence() {
  console.log('Starting credits sequence...');
  creditsSequencePlaying = true;
  creditsMusicFinished = false; // Reset music finished flag
  creditsStartTime = performance.now() / 1000;
  creditsPhase = 0; // Start with earth/moon scroll phase
  creditsEarthY = -earthDrawH; // Start earth above screen
  creditsMoonY = -moonH - 50; // Moon starts above earth
  creditsTextY = H; // Credits text starts below screen
  creditsFadeAlpha = 0;
  creditsShowSkipIndicator = true;
  creditsStickers = []; // Clear any existing stickers
  creditsLastStickerSpawn = 0;
  
  // Initialize moon animation
  creditsMoonTimer = 0;
  creditsMoonActive = true;
  creditsMoonBehindEarth = false;
  creditsMoonScale = 1.0;
  
  // DON'T initialize playerX here - let player continue from boss fight position
  // Player will be repositioned when phase 2 starts (surf scene)
  
  // DON'T change state yet - stay in FINAL_LEVEL so boss movement code continues to work!
  // State will change to CREDITS in phase 2 (surf scene)
  
  // Hide HUD during credits
  if (hud) hud.style.display = 'none';
  
  // Build surf background pattern for credits
  if (assets.surfBg) {
    creditsBgScale = W / assets.surfBg.width;
    creditsBgTileH = assets.surfBg.height * creditsBgScale;
    creditsBgPattern = ctx.createPattern(assets.surfBg, "repeat");
  }
  
  console.log('Credits sequence started, phase 0 (earth/moon scroll)');
}

function skipCreditsSequence() {
  if (!creditsSequencePlaying) return;
  
  console.log('Skipping to name entry...');
  
  // Change to CREDITS state so keyboard navigation works
  state = STATE.CREDITS;
  
  // DON'T stop credits or music - just advance to phase 3 (name entry shown)
  creditsPhase = 3;
  creditsShowSkipIndicator = false;
  
  // Show name entry overlay (keyboard now controls name entry, not player)
  showArcadeNameEntry(true);
}

function playCreditsMusic() {
  if (!audioCtx || !creditMusicBuffer || creditsMusicSource) return;
  
  try {
    creditsMusicSource = audioCtx.createBufferSource();
    creditsMusicSource.buffer = creditMusicBuffer;
    creditsMusicSource.loop = false;
    
    const creditsGain = audioCtx.createGain();
    creditsGain.gain.value = CREDITS_MUSIC_VOLUME * (musicVolume / 100) * MUSIC_MAX_GAIN;
    
    creditsMusicSource.connect(creditsGain);
    creditsGain.connect(audioCtx.destination);
    creditsMusicSource.start(0);
    
    // When music ends, set flag and clean up
    creditsMusicSource.onended = () => {
      creditsMusicSource = null;
      creditsMusicFinished = true;
      console.log('Credits music finished');
    };
  } catch (err) {
    console.error("Failed to play credits music:", err);
  }
}

function stopCreditsMusic() {
  if (creditsMusicSource) {
    try {
      creditsMusicSource.stop();
    } catch (err) {
      // Already stopped
    }
    creditsMusicSource = null;
  }
}

function updateCreditsSequence(dt) {
  if (!creditsSequencePlaying) return;
  
  const elapsed = (performance.now() / 1000) - creditsStartTime;
  
  // Phase 0: Earth and moon scroll down (matches win-music duration of 5.5 seconds)
  if (creditsPhase === 0) {
    // Win music is 5.5 seconds, earth needs to travel ~442px
    // Speed: 442 / 5.5 = 80.4 pixels/second
    const slowScrollSpeed = 80; // Matches win-music.mp3 duration exactly (5.5 seconds)
    creditsEarthY += slowScrollSpeed * dt;
    creditsMoonY += slowScrollSpeed * dt;
    
    // Update moon animation timer
    creditsMoonTimer += dt;
    if (creditsMoonTimer >= MOON_TOTAL_CYCLE) {
      creditsMoonTimer = 0; // Loop the moon animation
    }
    
    // Calculate moon animation (same as title screen)
    if (creditsMoonTimer <= MOON_PASS1_DURATION) {
      creditsMoonActive = true;
      creditsMoonBehindEarth = false;
      creditsMoonScale = 1.0;
      const progress = creditsMoonTimer / MOON_PASS1_DURATION;
      const startOffsetX = -moonW;
      const startOffsetY = earthDrawH * 0.1;
      const endOffsetX = W;
      const endOffsetY = earthDrawH * 0.6;
      creditsMoonOffsetX = Math.round(startOffsetX + (endOffsetX - startOffsetX) * progress);
      creditsMoonOffsetY = Math.round(startOffsetY + (endOffsetY - startOffsetY) * progress);
    } else if (creditsMoonTimer <= MOON_PASS1_DURATION + MOON_PASS1_PAUSE) {
      creditsMoonActive = false;
    } else if (creditsMoonTimer <= MOON_PASS1_DURATION + MOON_PASS1_PAUSE + MOON_PASS2_DURATION) {
      creditsMoonActive = true;
      creditsMoonBehindEarth = true;
      creditsMoonScale = MOON_PASS2_SCALE;
      const pass2Timer = creditsMoonTimer - (MOON_PASS1_DURATION + MOON_PASS1_PAUSE);
      const progress = pass2Timer / MOON_PASS2_DURATION;
      const startOffsetX = W;
      const startOffsetY = earthDrawH * 0.25;
      const endOffsetX = -moonW * MOON_PASS2_SCALE;
      const endOffsetY = earthDrawH * 0.02;
      creditsMoonOffsetX = Math.round(startOffsetX + (endOffsetX - startOffsetX) * progress);
      creditsMoonOffsetY = Math.round(startOffsetY + (endOffsetY - startOffsetY) * progress);
    } else {
      creditsMoonActive = false;
    }
    
    // When earth is about to center with player (around 20+ seconds), start fade to white
    const earthCenterY = H / 2 - earthDrawH / 2;
    if (creditsEarthY >= earthCenterY - 50) {
      creditsPhase = 1;
      console.log('Credits phase 1: Fade to white');
    }
  }
  
  // Phase 1: Fade to white (1 second fade)
  else if (creditsPhase === 1) {
    // Continue slow scroll during fade
    const slowScrollSpeed = 80; // Same speed as phase 0
    creditsEarthY += slowScrollSpeed * dt;
    creditsMoonY += slowScrollSpeed * dt;
    
    // Update moon animation timer
    creditsMoonTimer += dt;
    if (creditsMoonTimer >= MOON_TOTAL_CYCLE) {
      creditsMoonTimer = 0; // Loop the moon animation
    }
    
    // Calculate moon animation (same as title screen)
    if (creditsMoonTimer <= MOON_PASS1_DURATION) {
      creditsMoonActive = true;
      creditsMoonBehindEarth = false;
      creditsMoonScale = 1.0;
      const progress = creditsMoonTimer / MOON_PASS1_DURATION;
      const startOffsetX = -moonW;
      const startOffsetY = earthDrawH * 0.1;
      const endOffsetX = W;
      const endOffsetY = earthDrawH * 0.6;
      creditsMoonOffsetX = Math.round(startOffsetX + (endOffsetX - startOffsetX) * progress);
      creditsMoonOffsetY = Math.round(startOffsetY + (endOffsetY - startOffsetY) * progress);
    } else if (creditsMoonTimer <= MOON_PASS1_DURATION + MOON_PASS1_PAUSE) {
      creditsMoonActive = false;
    } else if (creditsMoonTimer <= MOON_PASS1_DURATION + MOON_PASS1_PAUSE + MOON_PASS2_DURATION) {
      creditsMoonActive = true;
      creditsMoonBehindEarth = true;
      creditsMoonScale = MOON_PASS2_SCALE;
      const pass2Timer = creditsMoonTimer - (MOON_PASS1_DURATION + MOON_PASS1_PAUSE);
      const progress = pass2Timer / MOON_PASS2_DURATION;
      const startOffsetX = W;
      const startOffsetY = earthDrawH * 0.25;
      const endOffsetX = -moonW * MOON_PASS2_SCALE;
      const endOffsetY = earthDrawH * 0.02;
      creditsMoonOffsetX = Math.round(startOffsetX + (endOffsetX - startOffsetX) * progress);
      creditsMoonOffsetY = Math.round(startOffsetY + (endOffsetY - startOffsetY) * progress);
    } else {
      creditsMoonActive = false;
    }
    
    // Fade to white over 1 second
    creditsFadeAlpha += dt / 1.0;
    if (creditsFadeAlpha >= 1.0) {
      creditsFadeAlpha = 1.0;
      creditsPhase = 2;
      
      // NOW change state to CREDITS (movement will use updatePlayerMovementDuringCredits)
      state = STATE.CREDITS;
      
      // Initialize player position for surf scene (center of left area)
      playerX = CREDITS_PLAYER_X_LIMIT / 2;
      playerRotation = PLAYER_ROT_NEUTRAL;
      playerTargetRotation = PLAYER_ROT_NEUTRAL;
      
      // Stop any music (win music should be done by now)
      stopMusic();
      
      // Start credits music NOW (after fade to white)
      playCreditsMusic();
      
      // Initialize sticker spawn timer
      creditsLastStickerSpawn = performance.now() / 1000;
      
      console.log('Credits phase 2: Playable credits scene');
    }
  }
  
  // Phase 2: Playable credits scene
  else if (creditsPhase === 2) {
    // Scroll background SLOWLY (much slower than normal game)
    const CREDITS_BG_SCROLL_SPEED = 100; // Faster surf vibe
    creditsBgOffset += CREDITS_BG_SCROLL_SPEED * dt;
    if (creditsBgOffset > creditsBgTileH) {
      creditsBgOffset -= creditsBgTileH;
    }
    
    // Spawn turnt stickers randomly (every 2-4 seconds)
    const now = performance.now() / 1000;
    if (now - creditsLastStickerSpawn > 3) { // Fixed 3 second interval
      creditsStickers.push({
        x: Math.random() * 170 + 10, // Random X within left 190px (10-180)
        y: -20, // Start above screen
        w: 38, // Original turnt.png width
        h: 48, // Original turnt.png height
        rotation: (Math.random() - 0.5) * (15 * Math.PI / 180) * 2 // Random ±15 degrees in radians
      });
      creditsLastStickerSpawn = now;
    }
    
    // Update sticker positions (scroll down at same speed as background)
    for (let i = creditsStickers.length - 1; i >= 0; i--) {
      const s = creditsStickers[i];
      s.y += CREDITS_BG_SCROLL_SPEED * dt;
      
      // Check collision with surf-goat
      const dx = s.x - playerX;
      const dy = s.y - PLAYER_Y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (s.w / 2 + SURF_GOAT_W / 2)) {
        // Collected! Play sound and remove
        playSfx(assets.getBeer, performance.now(), 0);
        creditsStickers.splice(i, 1);
        continue;
      }
      
      // Remove if off screen
      if (s.y > H + 50) {
        creditsStickers.splice(i, 1);
      }
    }
    
    // Update trail points (move them based on velocity)
    for (let i = playerTrail.length - 1; i >= 0; i--) {
      const t = playerTrail[i];
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) {
        playerTrail.splice(i, 1);
      }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
    
    // Scroll credits text up
    creditsTextY -= CREDITS_SCROLL_SPEED * dt;
    
    // Update player movement during credits
    updatePlayerMovementDuringCredits(dt);
  }
  
  // Phase 3: Name entry shown, continue credits in background
  else if (creditsPhase === 3) {
    // Keep scrolling background at same slow speed
    const CREDITS_BG_SCROLL_SPEED = 100;
    creditsBgOffset += CREDITS_BG_SCROLL_SPEED * dt;
    if (creditsBgOffset > creditsBgTileH) {
      creditsBgOffset -= creditsBgTileH;
    }
    
    // Keep scrolling credits text
    creditsTextY -= CREDITS_SCROLL_SPEED * dt;
  }
  
  // Check if credits music has finished - reload immediately
  if (creditsMusicFinished) {
    creditsSequencePlaying = false;
    creditsPhase = 0;
    creditsMusicFinished = false;
    console.log('Credits music ended, reloading page...');
    window.location.reload();
  }
}

function updatePlayerMovementDuringCredits(dt) {
  // EXACT same movement as boss fight - use holdDir for ALL phases
  
  // Phase 3: Name entry is showing, keyboard controls name entry NOT player
  if (creditsPhase >= 3) {
    // Don't move player, arrow keys control name entry
    return;
  }
  
  // Player movement
  if (holdDir !== 0) {
    // Phase 2 (surf scene): Use slower speed for surfing
    const moveSpeed = creditsPhase === 2 ? 100 : (activePowerupType === "DRUNK" ? DRUNK_MOVE_SPEED : HOLD_MOVE_SPEED);
    
    // Phase 0-1 (earth/fade): Full screen movement
    if (creditsPhase < 2) {
      playerX = clamp(playerX + holdDir * moveSpeed * dt, PLAYER_MARGIN, W - PLAYER_MARGIN);
    }
    // Phase 2-3 (surf scene): Limited to left 190px
    else {
      const halfW = SURF_GOAT_W / 2;
      const newX = playerX + holdDir * moveSpeed * dt;
      const clampedX = clamp(newX, halfW, CREDITS_PLAYER_X_LIMIT - halfW);
      playerX = clampedX;
      
      // Spawn white trail particles during surf scene (like normal game)
      if (creditsPhase === 2 && Math.random() < 0.3) { // 30% chance per frame
        playerTrail.push({
          x: playerX + Math.sin(playerRotation) * 15,
          y: PLAYER_Y + PLAYER_H / 2 - 25,
          vx: Math.cos(Math.PI / 2 - playerRotation * 1.5) * 150,
          vy: Math.sin(Math.PI / 2 - playerRotation * 1.5) * 150,
          life: TRAIL_LIFETIME,
          maxLife: TRAIL_LIFETIME
        });
        if (playerTrail.length > TRAIL_MAX_POINTS) {
          playerTrail.shift();
        }
        
        // Spawn white firework particles (EXACT same as 2X powerup but white)
        // Spawn 4 particles per trail interval for very dense firework effect
        for (let i = 0; i < 4; i++) {
          const particleSpawnY = SURF_GOAT_H / 2 - 30; // Just above trail spawn
          const spawnOffsetX = Math.sin(playerRotation) * 15;
          
          // Create wide firework spread - full 180 degree cone downward
          const spreadAngle = (Math.random() - 0.5) * Math.PI; // ±90 degrees (180° total)
          const explosionSpeed = 80 + Math.random() * 120; // 80-200 pixels/sec
          
          // Calculate velocity from polar coordinates
          const baseAngle = Math.PI / 2; // Downward base
          const finalAngle = baseAngle + spreadAngle;
          
          particles.push({
            x: playerX + spawnOffsetX,
            y: PLAYER_Y + particleSpawnY,
            vx: Math.cos(finalAngle) * explosionSpeed,
            vy: Math.sin(finalAngle) * explosionSpeed,
            life: 0.4 + Math.random() * 0.3, // 0.4-0.7 seconds
            maxLife: 0.7,
            size: 3 + Math.random() * 4, // 3-7px squares
            color: '#ffffff', // White for surf-goat
            ax: Math.cos(finalAngle) * 50, // Continue spreading outward
            ay: 30 // Slight downward gravity
          });
        }
      }
    }
  }
  
  // Update player rotation (visual only) - EXACT same as boss fight
  if (holdDir < 0) {
    playerTargetRotation = PLAYER_ROT_LEFT;
  } else if (holdDir > 0) {
    playerTargetRotation = PLAYER_ROT_RIGHT;
  } else {
    playerTargetRotation = PLAYER_ROT_NEUTRAL;
  }
  
  // Smooth lerp toward target
  playerRotation += (playerTargetRotation - playerRotation) * PLAYER_ROT_SNAP_SPEED;
  // Clamp near-zero to avoid jitter
  if (Math.abs(playerRotation) < 0.001) playerRotation = 0;
}

function drawCreditsSequence() {
  // Phase 0: Earth and moon scroll down
  if (creditsPhase === 0) {
    // Draw normal background
    if (bgPattern) {
      ctx.save();
      ctx.scale(bgScale, bgScale);
      const off = (bgOffset % bgTileH) / bgScale;
      ctx.translate(0, off);
      ctx.fillStyle = bgPattern;
      ctx.fillRect(0, -bgTileH / bgScale, W / bgScale, (H + bgTileH * 2) / bgScale);
      ctx.restore();
    }
    
    // Draw moon behind earth if active and behind
    if (creditsMoonActive && creditsMoonBehindEarth) {
      const moonX = creditsMoonOffsetX;
      const moonY = creditsEarthY + creditsMoonOffsetY;
      const scaledMoonW = Math.round(moonW * creditsMoonScale);
      const scaledMoonH = Math.round(moonH * creditsMoonScale);
      ctx.drawImage(assets.moon, moonX, moonY, scaledMoonW, scaledMoonH);
    }
    
    // Draw earth
    ctx.drawImage(assets.earth, 0, Math.round(creditsEarthY), W, earthDrawH);
    
    // Draw moon in front of earth if active and in front
    if (creditsMoonActive && !creditsMoonBehindEarth) {
      const moonX = creditsMoonOffsetX;
      const moonY = creditsEarthY + creditsMoonOffsetY;
      const scaledMoonW = Math.round(moonW * creditsMoonScale);
      const scaledMoonH = Math.round(moonH * creditsMoonScale);
      ctx.drawImage(assets.moon, moonX, moonY, scaledMoonW, scaledMoonH);
    }
    
    // Draw player
    ctx.save();
    ctx.translate(playerX, PLAYER_Y);
    ctx.rotate(playerRotation);
    ctx.drawImage(assets.player, -PLAYER_W/2, -PLAYER_H/2, PLAYER_W, PLAYER_H);
    ctx.restore();
    
    // Draw "YOU WIN!" text - large, centered, pulsing
    const pulseScale = 1 + 0.04 * Math.sin(performance.now() / 200); // Pulse between 1.0 and 1.04
    ctx.save();
    ctx.translate(W / 2, H / 2 - 50); // Center, slightly above middle
    ctx.scale(pulseScale, pulseScale);
    ctx.fillStyle = '#E0FF00'; // Theme yellow/green
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 40px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText('YOU WIN!', 0, 0);
    ctx.fillText('YOU WIN!', 0, 0);
    ctx.restore();
  }
  
  // Phase 1: Fade to white
  else if (creditsPhase === 1) {
    // Draw same as phase 0
    if (bgPattern) {
      ctx.save();
      ctx.scale(bgScale, bgScale);
      const off = (bgOffset % bgTileH) / bgScale;
      ctx.translate(0, off);
      ctx.fillStyle = bgPattern;
      ctx.fillRect(0, -bgTileH / bgScale, W / bgScale, (H + bgTileH * 2) / bgScale);
      ctx.restore();
    }
    
    // Draw moon behind earth if active and behind
    if (creditsMoonActive && creditsMoonBehindEarth) {
      const moonX = creditsMoonOffsetX;
      const moonY = creditsEarthY + creditsMoonOffsetY;
      const scaledMoonW = Math.round(moonW * creditsMoonScale);
      const scaledMoonH = Math.round(moonH * creditsMoonScale);
      ctx.drawImage(assets.moon, moonX, moonY, scaledMoonW, scaledMoonH);
    }
    
    // Draw earth
    ctx.drawImage(assets.earth, 0, Math.round(creditsEarthY), W, earthDrawH);
    
    // Draw moon in front of earth if active and in front
    if (creditsMoonActive && !creditsMoonBehindEarth) {
      const moonX = creditsMoonOffsetX;
      const moonY = creditsEarthY + creditsMoonOffsetY;
      const scaledMoonW = Math.round(moonW * creditsMoonScale);
      const scaledMoonH = Math.round(moonH * creditsMoonScale);
      ctx.drawImage(assets.moon, moonX, moonY, scaledMoonW, scaledMoonH);
    }
    
    ctx.save();
    ctx.translate(playerX, PLAYER_Y);
    ctx.rotate(playerRotation);
    ctx.drawImage(assets.player, -PLAYER_W/2, -PLAYER_H/2, PLAYER_W, PLAYER_H);
    ctx.restore();
    
    // Draw "YOU WIN!" text - large, centered, pulsing (will fade with white overlay)
    const pulseScale = 1 + 0.04 * Math.sin(performance.now() / 200); // Pulse between 1.0 and 1.04
    ctx.save();
    ctx.translate(W / 2, H / 2 - 50); // Center, slightly above middle
    ctx.scale(pulseScale, pulseScale);
    ctx.fillStyle = '#E0FF00'; // Theme yellow/green
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 40px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText('YOU WIN!', 0, 0);
    ctx.fillText('YOU WIN!', 0, 0);
    ctx.restore();
    
    // Fade to white overlay
    ctx.fillStyle = `rgba(255, 255, 255, ${creditsFadeAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }
  
  // Phase 2 & 3: Playable credits scene
  else if (creditsPhase === 2 || creditsPhase === 3) {
    // Draw surf background
    if (creditsBgPattern) {
      ctx.save();
      ctx.scale(creditsBgScale, creditsBgScale);
      const off = (creditsBgOffset % creditsBgTileH) / creditsBgScale;
      ctx.translate(0, off);
      ctx.fillStyle = creditsBgPattern;
      ctx.fillRect(0, -creditsBgTileH / creditsBgScale, W / creditsBgScale, (H + creditsBgTileH * 2) / creditsBgScale);
      ctx.restore();
    }
    
    // Draw white trail behind surf-goat (only phase 2 when player can move) - EXACT same as normal game
    if (creditsPhase === 2 && playerTrail.length > 0) {
      ctx.save();
      
      const trailColor = '#ffffff'; // White for credits
      
      // Draw trail as gradient segments - IDENTICAL to normal game
      for (let i = 0; i < playerTrail.length; i++) {
        const t = playerTrail[i];
        const lifeFactor = (t.life / t.maxLife); // 1.0 at spawn, 0.0 at end
        const positionFactor = (i / Math.max(1, playerTrail.length - 1)); // 0.0 at oldest, 1.0 at newest
        const alpha = lifeFactor * 0.8; // Higher base opacity (0.8 max)
        
        // Maintain larger size - trail stays thick, only fades based on life
        const width = TRAIL_WIDTH * (0.5 + 0.5 * positionFactor) * lifeFactor;
        
        // White color with alpha
        const finalColor = `rgba(255, 255, 255, ${alpha})`;
        
        // Draw trail point as circle with glow - EXACT same as normal game
        ctx.shadowColor = trailColor;
        ctx.shadowBlur = width * 1.5;
        ctx.fillStyle = finalColor;
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(width, 4), 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    
    // Draw white particles (same as normal game but only during credits phase 2)
    if (creditsPhase === 2) {
      for (const p of particles) {
        const alpha = p.life / p.maxLife;
        // Use particle's color with current alpha
        if (p.color.startsWith('#')) {
          // Hex color - convert to rgba with alpha
          const r = parseInt(p.color.slice(1, 3), 16);
          const g = parseInt(p.color.slice(3, 5), 16);
          const b = parseInt(p.color.slice(5, 7), 16);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
          // Already rgba format - update alpha
          ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha})`);
        }
        // Draw square particles for pixel art aesthetic
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    
    // Draw turnt stickers (only in phase 2)
    if (creditsPhase === 2) {
      for (const s of creditsStickers) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.drawImage(assets.powerupDrunk, -s.w/2, -s.h/2, s.w, s.h);
        ctx.restore();
      }
    }
    
    // Draw surf goat (player) at actual size (54x72)
    ctx.save();
    ctx.translate(playerX, PLAYER_Y);
    ctx.rotate(playerRotation);
    ctx.drawImage(assets.surfGoat, -SURF_GOAT_W/2, -SURF_GOAT_H/2, SURF_GOAT_W, SURF_GOAT_H);
    ctx.restore();
    
    // Draw credits text scrolling on right side
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const textX = 260; // Right side center with margin
    let textY = creditsTextY;
    const lineHeight = 24;
    
    for (let i = 0; i < CREDITS_TEXT.length; i++) {
      const line = CREDITS_TEXT[i];
      const lineY = textY + (i * lineHeight);
      
      // Only draw if visible on screen
      if (lineY > -lineHeight && lineY < H + lineHeight) {
        // Check if this is a subtitle (ends with 'by' or ':', or is 'Game Design')
        const isSubtitle = line.endsWith('by') || line.endsWith(':') || line === 'Game Design';
        
        // Use theme color for subtitles, white for names
        const textColor = isSubtitle ? '#E0FF00' : '#ffffff';
        
        ctx.fillStyle = textColor;
        
        // Stroke for outline effect
        ctx.strokeText(line, textX, lineY);
        // Fill for main text
        ctx.fillText(line, textX, lineY);
      }
    }
    
    ctx.restore();
    
    // Draw "START = SKIP" text (only in phase 2, not phase 3 when name entry is shown)
    if (creditsPhase === 2 && creditsShowSkipIndicator) {
      const pulseAlpha = 0.6 + 0.4 * Math.sin(performance.now() / 300);
      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.strokeText('START = SKIP (to Enter Name)', W / 2, H - 90); // Match intro position (90px from bottom)
      ctx.fillText('START = SKIP (to Enter Name)', W / 2, H - 90);
      ctx.restore();
    }
  }
}
// ===== END ARCADE CREDITS SEQUENCE =====

async function initWebAudioIfNeeded() {
  if (audioCtx) return;

  const Ctx = window.AudioContext || window.webkitAudioContext;
  audioCtx = new Ctx();

  musicGain = audioCtx.createGain();
  musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN; // Apply loaded music volume
  musicGain.connect(audioCtx.destination);

  // CRITICAL: Load main game music and variants FIRST to ensure they're ready before game starts
  try {
    const [mainRes, main2XRes, mainTurntRes] = await Promise.all([
      fetch(ASSETS.sounds.mainGameMusic, { cache: "force-cache" }),
      fetch(ASSETS.sounds.mainGameMusic2X, { cache: "force-cache" }),
      fetch(ASSETS.sounds.mainGameMusicTurnt, { cache: "force-cache" })
    ]);
    
    if (!mainRes.ok) throw new Error(`Failed to fetch main game music: ${mainRes.status}`);
    if (!main2XRes.ok) throw new Error(`Failed to fetch 2X music: ${main2XRes.status}`);
    if (!mainTurntRes.ok) throw new Error(`Failed to fetch TURNT music: ${mainTurntRes.status}`);
    
    const [mainArr, main2XArr, mainTurntArr] = await Promise.all([
      mainRes.arrayBuffer(),
      main2XRes.arrayBuffer(),
      mainTurntRes.arrayBuffer()
    ]);
    
    [mainGameMusicBuffer, mainGameMusic2XBuffer, mainGameMusicTurntBuffer] = await Promise.all([
      audioCtx.decodeAudioData(mainArr),
      audioCtx.decodeAudioData(main2XArr),
      audioCtx.decodeAudioData(mainTurntArr)
    ]);
    
    // Verify main game music buffer is valid
    if (!mainGameMusicBuffer || mainGameMusicBuffer.length === 0) {
      throw new Error("Main game music buffer is invalid");
    }
    
  } catch (err) {
    console.error("CRITICAL: Failed to load essential music:", err);
    throw err; // Re-throw to prevent game from starting without music
  }

  // Load other music files (non-critical for boot, but survival is needed for title screen)
  try {
    const [bossRes, winRes, creditRes, secretRes, survivalRes, introRes] = await Promise.all([
      fetch(ASSETS.sounds.bossMusic, { cache: "force-cache" }),
      fetch(ASSETS.sounds.winMusic, { cache: "force-cache" }),
      fetch(ASSETS.sounds.creditMusic, { cache: "force-cache" }),
      fetch(ASSETS.sounds.secretLevelMusic, { cache: "force-cache" }),
      fetch(ASSETS.sounds.survivalMusic, { cache: "force-cache" }), // Used for title screen
      fetch(ASSETS.sounds.gameIntroMusic, { cache: "force-cache" }) // Game intro sequence
    ]);

    const [bossArr, winArr, creditArr, secretArr, survivalArr, introArr] = await Promise.all([
      bossRes.arrayBuffer(),
      winRes.arrayBuffer(),
      creditRes.arrayBuffer(),
      secretRes.arrayBuffer(),
      survivalRes.arrayBuffer(),
      introRes.arrayBuffer()
    ]);

    [bossMusicBuffer, winMusicBuffer, creditMusicBuffer, secretLevelMusicBuffer, survivalMusicBuffer, gameIntroMusicBuffer] = await Promise.all([
      audioCtx.decodeAudioData(bossArr),
      audioCtx.decodeAudioData(winArr),
      audioCtx.decodeAudioData(creditArr),
      audioCtx.decodeAudioData(secretArr),
      audioCtx.decodeAudioData(survivalArr),
      audioCtx.decodeAudioData(introArr)
    ]);
    
  } catch (err) {
    console.warn("Non-critical: Some music files failed to load:", err);
    // Don't throw - menu music is loaded, game can continue
  }
}

async function playMusic(trackName, { loop = true, volume = 0.5, onEnded = null } = {}) {
  await initWebAudioIfNeeded();

  // Resume context (iOS often starts in "suspended")
  if (audioCtx.state !== "running") {
    await audioCtx.resume();
  }

  // Stop current music if playing
  if (musicSource) {
    musicSource.stop();
    musicSource.disconnect();
    musicSource = null;
  }

  // Select the appropriate buffer
  let buffer = null;
  switch (trackName) {
    case 'main':
      buffer = mainGameMusicBuffer;
      break;
    case 'main2X':
      buffer = mainGameMusic2XBuffer;
      break;
    case 'mainTurnt':
      buffer = mainGameMusicTurntBuffer;
      break;
    case 'boss':
      buffer = bossMusicBuffer;
      break;
    case 'credit':
      buffer = creditMusicBuffer;
      break;
    case 'win':
      buffer = winMusicBuffer;
      break;
    case 'secretLevel':
      buffer = secretLevelMusicBuffer;
      break;
    case 'survival':
      buffer = survivalMusicBuffer;
      break;
  }

  if (!buffer) {
    console.warn(`Music buffer not loaded for track: ${trackName}`);
    return;
  }

  // Create and start new source
  musicSource = audioCtx.createBufferSource();
  musicSource.buffer = buffer;
  musicSource.loop = loop;
  
  // Set loop points to avoid MP3 encoder padding gaps (if any)
  // loopStart = 0 and loopEnd = duration ensures we use the full buffer
  if (loop) {
    musicSource.loopStart = 0;
    musicSource.loopEnd = buffer.duration;
  }
  
  // Apply settings volume (ignore the volume parameter, use settings)
  musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
  
  musicSource.connect(musicGain);
  
  // Add onended callback if provided
  if (onEnded) {
    musicSource.onended = onEnded;
  }
  
  musicSource.start(0);
  musicStartTime = audioCtx.currentTime; // Record when track started for position tracking
  currentTrack = trackName;
  musicStarted = true;
}

// Switch music track while preserving playback position (for powerup music changes)
async function switchMusicTrack(newTrackName) {
  // Never switch music in SURVIVAL mode - keep survival.mp3 playing
  if (gameMode === "SURVIVAL") {
    return;
  }
  
  await initWebAudioIfNeeded();
  
  if (!musicSource || !currentTrack) {
    // No music playing, just start the new track
    await playMusic(newTrackName);
    return;
  }
  
  // Calculate current playback position
  const currentTime = audioCtx.currentTime;
  const elapsedTime = currentTime - musicStartTime;
  
  // Get the buffer for the new track
  let newBuffer = null;
  switch (newTrackName) {
    case 'main':
      newBuffer = mainGameMusicBuffer;
      break;
    case 'main2X':
      newBuffer = mainGameMusic2XBuffer;
      break;
    case 'mainTurnt':
      newBuffer = mainGameMusicTurntBuffer;
      break;
    default:
      console.warn(`switchMusicTrack called with unsupported track: ${newTrackName}`);
      return;
  }
  
  if (!newBuffer) {
    console.warn(`Music buffer not loaded for track: ${newTrackName}`);
    return;
  }
  
  // Calculate offset (handle looping)
  const offset = elapsedTime % newBuffer.duration;
  
  // Stop current music
  if (musicSource) {
    musicSource.stop();
    musicSource.disconnect();
    musicSource = null;
  }
  
  // Resume context if needed
  if (audioCtx.state !== "running") {
    await audioCtx.resume();
  }
  
  // Start new track from the same position
  musicSource = audioCtx.createBufferSource();
  musicSource.buffer = newBuffer;
  musicSource.loop = true;
  musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
  musicSource.connect(musicGain);
  musicSource.start(0, offset);
  
  // Update tracking (adjust start time to account for offset)
  musicStartTime = currentTime - offset;
  currentTrack = newTrackName;
}

function stopMusic() {
  if (musicSource) {
    musicSource.stop();
    musicSource.disconnect();
    musicSource = null;
    currentTrack = null;
  }
}

// Optional: pause/resume on tab hidden
function pauseMusicWebAudio() {
  if (!audioCtx || audioCtx.state !== "running") return;
  audioCtx.suspend().catch(() => {});
}

function resumeMusicWebAudio() {
  if (!audioCtx || !musicStarted) return;
  audioCtx.resume().catch(() => {});
}


  // State
  const STATE = {
    TITLE: "title",
    START: "start",
    COUNTDOWN: "countdown",
    PLAY: "play",
    FINAL_LEVEL: "final_level",
    WIN: "win",
    CREDITS: "credits",
    GAMEOVER: "gameover",
    OUT_OF_TIME: "out_of_time",
  };

  let state = STATE.TITLE;
  let gameMode = "MAIN"; // "MAIN" or "SURVIVAL"
  let hasPlayedGame = false; // Track if any game has been played (to keep player visible on title/menu after game over)
  let assets = null;
  let rand = null;
  let currentSeed = 0; // Current level seed for stickerRng
  let lastTs = 0;

  // Hit stop for collision
  const HITSTOP_DURATION = 0.08; // 80ms freeze on collision
  let inHitStop = false;
  let hitStopEndTime = 0;
  let playerIsCrashed = false;

  // Screen shake
  const SHAKE_DURATION = 0.3; // seconds
  const SHAKE_INTENSITY = 3; // pixels
  let shakeTimer = 0;
  let shakeOffsetX = 0;
  let shakeOffsetY = 0;

  // Pause
  let isPaused = false;
  const HUD_HEIGHT = 50; // Height of HUD area in pixels (approximate)

  // Track where leaderboard was opened from (for back button navigation)
  let leaderboardSource = "menu"; // Can be "menu", "win", or "gameover"

  // Track active leaderboard mode and tab
  let activeLeaderboardMode = "main"; // "main" or "survival"
  let activeLeaderboardTab = "alltime"; // Always "alltime" for arcade cabinet
  let activeSurvivalLeaderboardTab = "weekly"; // Separate state for survival tabs

  // ===== KONAMI CODE =====
  const KONAMI_SEQUENCE = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'space', 'enter'];
  let konamiProgress = [];
  let isKonamiLevel = false; // Flag to track if we're in secret level mode
  
  // Touch tracking for swipe detection
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 50; // minimum distance for a swipe

  // ===== TITLE LOGO ANIMATION =====
  let titleFrameImages = []; // Array of loaded title frame images
  let titleFrameIndex = 0;   // Current frame in animation
  let titleFrameTimer = 0;   // Timer for frame switching
  const TITLE_FRAME_DURATION = 0.2; // 200ms per frame
  
  // ===== SURVIVAL MODE STATE =====
  let survivalTime = 0;           // Elapsed time in survival mode
  let survivalTier = 1;           // Current difficulty tier
  let survivalNextTierTime = 30;  // Time when next tier begins
  let survivalNextPowerupTime = 30; // Time when next powerup spawns
  
  // Survival mode powerups
  let survivalShieldCount = 0;    // Number of shields held (0-3 max)
  let survivalShieldInvulnerable = false; // Player invulnerable after shield use
  let survivalShieldInvulnerableTimer = 0; // Timer for invulnerability (2 seconds)
  let survivalShieldHitFreeze = false; // World freeze after shield hit
  let survivalShieldHitFreezeTimer = 0; // Freeze duration (0.5 seconds)
  let survivalTimeWarpActive = false; // Time warp effect active
  let survivalTimeWarpTimer = 0;  // Time warp duration timer (12 seconds)
  let survivalTimeWarpBeepTimer = 0; // Timer for beep sound during time warp
  let survivalNextShieldSpawn = 105; // Next shield spawn time (~1.75 min)
  let survivalNextTimeSpawn = 60; // Next time warp spawn time (~1 min)
  
  // Streak-based multiplier system (replaces old time-based system)
  let streakTimer = 0;            // Countdown from 4 seconds
  let streakCount = 0;            // Total stickers in current streak
  let streakMultiplier = 1;       // Current multiplier (1x, 2x, 3x, etc.)
  const STREAK_WINDOW = 4;        // 4 seconds to maintain streak
  const STICKERS_PER_TIER = 25;   // 25 stickers needed per multiplier tier
  
  // Streak visual effects
  let flashOverlay = null;        // Tier up screen flash
  let progressBarPopScale = 1.0;  // Progress bar pop animation scale
  let progressBarPopTimer = 0;    // Progress bar pop animation timer
  let multiplierTextScale = 1.0;  // Multiplier text pulse scale
  let multiplierTextTimer = 0;    // Multiplier text pulse timer
  let streakBreakFlash = null;    // Streak break flash
  let progressBarDraining = false; // Progress bar drain animation flag
  let progressBarDrainTimer = 0;  // Progress bar drain animation timer
  
  // Sound effect configuration (easily swappable)
  const STREAK_SOUNDS = {
    tierUp: 'getMagnet',      // When reaching new multiplier tier
    streakBreak: 'magnetEnd'  // When streak timer runs out
  };
  
  // Multiplier tier colors
  const MULTIPLIER_COLORS = {
    1: '#def30c',  // Yellow (1x - default)
    2: '#00FF00',  // Bright green (2x)
    3: '#00FFCC',  // Teal/Cyan (3x)
    4: '#00CCFF',  // Light blue/Cyan (4x)
    5: '#0066FF',  // Blue (5x)
    6: '#6600FF',  // Purple (6x)
    7: '#FF00FF',  // Magenta (7x)
    8: '#FF0066',  // Hot pink (8x)
    9: '#FF0000'   // Red (9x)
  };
  
  // Rainbow colors for tier 10+ (cycles through)
  const RAINBOW_COLORS = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', 
    '#0000FF', '#4B0082', '#9400D3'
  ];
  
  function getMultiplierColor(multiplier) {
    if (multiplier >= 10) {
      // Rainbow effect - cycle through colors based on time
      const colorIndex = Math.floor(Date.now() / 200) % RAINBOW_COLORS.length;
      return RAINBOW_COLORS[colorIndex];
    }
    return MULTIPLIER_COLORS[multiplier] || '#def30c';
  }
  
  function triggerTierUpEffects() {
    // Screen flash effect
    flashOverlay = {
      color: getMultiplierColor(streakMultiplier),
      alpha: 0.3,
      duration: 0.4,
      elapsed: 0
    };
    
    // Progress bar pop animation
    progressBarPopScale = 1.2;
    progressBarPopTimer = 0.3;
    
    // Multiplier text pulse animation
    multiplierTextScale = 1.3;
    multiplierTextTimer = 0.3;
    
    // Play tier up sound
    const soundName = STREAK_SOUNDS.tierUp;
    if (assets[soundName]) {
      playSfx(assets[soundName], performance.now(), 1.0);
    }
  }
  
  function triggerStreakBreakEffects() {
    // Dark flash effect
    streakBreakFlash = {
      color: '#000000',
      alpha: 0.5,
      duration: 0.3,
      elapsed: 0
    };
    
    // Progress bar drain animation
    progressBarDraining = true;
    progressBarDrainTimer = 0.3;
    
    // Play streak break sound
    const soundName = STREAK_SOUNDS.streakBreak;
    if (assets[soundName]) {
      playSfx(assets[soundName], performance.now(), 1.0);
    }
  }
  // ===============================
  
  // Mobile pause instruction tracking
  let pauseInstructionShown = false;
  
  // Mobile detection function
  function isMobileDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }
  // =======================

  // Player
  let playerX = W / 2;
  const playerY = PLAYER_Y;
  // Player entrance animation (first time only)
  let playerHasEntered = false;
  let playerEntranceY = PLAYER_Y; // Actual Y position (animated on first level)
  // Hold direction: -1 = left, 0 = none, 1 = right
  let holdDir = 0;
  let leftPressed = false;  // For credits scene player movement
  let rightPressed = false; // For credits scene player movement
  // Track keyboard pressed state to avoid repeat keydown triggering
  let keysPressed = { left: false, right: false };
  // Player rotation (visual only)
  let playerRotation = 0;        // Current visual rotation
  let playerTargetRotation = 0;  // Target rotation based on input

  // Run tracking
  let lives = LIVES_START;
  let previousLives = LIVES_START; // Track previous lives for reaction animation
  let stickersCollected = 0;
  let stickersAtLevelStart = 0; // Track stickers at the start of current level
  let stickersThisLevel = 0; // Track stickers in current level only (for extra life rewards)
  let timeLeft = RUN_TIME;
  let currentLevel = 1;
  
  // Anti-cheat: Game session tracking
  let gameSessionId = null;
  
  // Points system
  let points = 0;
  let levelStartPoints = 0; // Points snapshot at level start for restore on collision
  let stickerTotalCollected = 0; // Total stickers across all levels for extra life tracking
  let stickerTotalAtLevelStart = 0; // Total stickers at level start for collision reset
  let lastSecondTick = 0; // Track last integer second for time survival points
  
  // Cache for HUD to avoid recalculating every frame
  let cachedTimeDisplay = RUN_TIME;
  let cachedPointsDisplay = 0;
  
  // Timer display visual effects
  let timerPulsePhase = 0; // For pulsing animation when <= 10 seconds
  let progressBarCompleteTime = 0; // Track when progress bar completes for pop animation

  // Boss level tracking
  let bossPhase = 0; // 0=entering, 1-4=attack phases, 5=victory
  let bossY = -200;  // boss vertical position
  let bossW = 178;   // boss width (matches new sprite dimensions: 178x139)
  let bossAngle = 0; // boss rotation angle for victory spin
  let bossBlinkTimer = 0;
  let bossShowBren2 = false;
  let bossArmedAsteroids = []; // {x, y, armed, thrown}
  let bossArmTimer = 0;
  let bossThrowTimer = 0;
  let bossAttackCount = 0; // how many attacks completed (0-3)
  let bossVictoryTimer = 0;
  let bossEnterTimer = 0;
  let bossHapticFired = false; // Track if boss start haptic was triggered
  
  // Title screen boss flyby animation (idle Easter egg)
  let titleIdleTimer = 0; // Counts time on title screen
  let titleBossAnimActive = false; // Whether animation is playing
  let titleBossPhase = 0; // 0=entry, 1=pause, 2=exit
  let titleBossTimer = 0; // Timer for current phase
  let titleBossX = 0; // Boss X position
  let titleBossScale = 0.3; // Boss scale (0.3-1.0)
  let titleBossShowBren3 = false; // Whether to show bren3 during pause
  let titleBossAnimPlayed = false; // Tracks if animation played this title screen visit
  const TITLE_IDLE_TRIGGER_TIME = 60; // 60 seconds before animation starts
  const TITLE_BOSS_ENTRY_DURATION = 1.0; // 1 second
  const TITLE_BOSS_PAUSE_DURATION = 5.0; // 5 seconds
  const TITLE_BOSS_EXIT_DURATION = 1.0; // 1 second
  let bossIntroActive = false; // Track if boss intro cutscene is playing (disables pause)
  
  // Boss text taunts
  const BOSS_TAUNTS = [
    "Holler at Me!",
    "Fcuk You!",
    "Get on the Map!",
    "Little ass jpeg",
    "Lil Bitch",
    "The Thick Sh!t"
  ];
  
  // Map taunts to their audio files
  const BOSS_TAUNT_AUDIO = {
    "Holler at Me!": "holler",
    "Fcuk You!": "fcuk",
    "Get on the Map!": "map",
    "Little ass jpeg": "jpeg",
    "Lil Bitch": "bitch",
    "The Thick Sh!t": "thick"
  };
  
  let bossText = "";
  let bossTextTimer = 0;
  const BOSS_TEXT_DURATION = 2.0; // seconds to show text
  let bossTauntCounter = 0; // Counter for playing audio every 3-4 taunts

  // Background pattern scroll
  let bgPattern = null;
  let sandBgPattern = null; // For secret level
  let bgOffset = 0;  // scroll offset in pattern space
  let bgScale = 1;   // scales background image to match canvas width
  let bgTileW = 1;
  let bgTileH = 1;
  let sandBgScale = 1; // For secret level
  let sandBgTileH = 1;

  // Earth intro
  let earthY = 0;
  let earthActive = true;
  let earthDrawH = 0;
  let earthFrameIndex = 0;
  let earthFrameTimer = 0;
  const earthFrameDuration = 0.5; // 0.5 seconds per frame

  // Moon animation - store OFFSETS from earth, not absolute positions
  let moonOffsetX = -500;
  let moonOffsetY = -500;
  let moonW = 0;
  let moonH = 0;
  let moonTimer = 0;
  let moonFrameTimer = 0;
  let moonActive = false; // Is moon currently crossing
  let moonScale = 1.0; // Current scale of moon (1.0 = normal, 0.65 = smaller for pass 2)
  let moonBehindEarth = false; // Is moon behind earth (for z-index)
  const MOON_PASS1_DURATION = 10; // Pass 1: Takes 10 seconds to cross (in front)
  const MOON_PASS1_PAUSE = 5; // Pause 5 seconds after pass 1
  const MOON_PASS2_DURATION = 12; // Pass 2: Takes 12 seconds to cross (behind, slightly slower)
  const MOON_PASS2_PAUSE = 8; // Pause 8 seconds after pass 2
  const MOON_TOTAL_CYCLE = MOON_PASS1_DURATION + MOON_PASS1_PAUSE + MOON_PASS2_DURATION + MOON_PASS2_PAUSE; // Total cycle: 35 seconds
  const MOON_FPS = 10; // Update position 10 times per second
  const MOON_PASS2_SCALE = 0.65; // Smaller moon on pass 2

  // Spawning
  let spawnTimer = 0;

  // Entities
  let obstacles = []; // {img,x,y,w,h,angle,spin,r}
  let stickers = [];  // {x,y,w,h,angle,collected}

  // Particle system for sticker collection
  let particles = []; // {x,y,vx,vy,life,maxLife,size}
  let playerTrail = []; // {x, y, life, maxLife} - trail behind player

  // Floating text for thick sticker feedback
  let floatingTexts = []; // {x,y,text,timer,maxTime}

  // Powerup sticker system
  let powerupStickers = []; // {type,img,x,y,w,h,collected,angle,pulsePhase}
  let powerupRng = null; // Daily-seeded RNG for powerups
  let stickerRng = null; // Separate RNG for stickers to prevent interference with asteroid spawning
  let scoreMultiplier = 1;
  let powerupEffectEndTime = 0;
  let controlsInverted = false;
  let activePowerupType = null; // "2X", "DRUNK", "SHIELD", or "TIME"
  let drunkWobblePhase = 0;
  let drunkGhostWobblePhase = 0; // Separate wobble for ghost images during DRUNK
  let firstPowerupSpawnTime = 0; // Random time in first 20 seconds
  let secondPowerupSpawnTime = 0; // Random time in last 35-50 seconds
  let shieldSpawnTime = 0; // Random time in first 5 seconds
  let powerupsSpawnedThisLevel = []; // Track which powerups spawned this level
  let shieldSpawnedThisLevel = false; // Track if guaranteed shield has spawned
  
  // Shield powerup state (main game)
  let mainGameShieldCount = 0; // Number of shields held (0-3 max)
  let mainGameShieldInvulnerable = false; // Player invulnerable after shield use
  let mainGameShieldInvulnerableTimer = 0; // Timer for invulnerability (2 seconds)
  let mainGameShieldHitFreeze = false; // World freeze after shield hit
  let mainGameShieldHitFreezeTimer = 0; // Freeze duration (0.5 seconds)
  
  // Time warp powerup state (main game)
  let mainGameTimeWarpActive = false; // Time warp effect active
  let mainGameTimeWarpTimer = 0; // Time warp duration timer (12 seconds)
  let mainGameTimeWarpBeepTimer = 0; // Timer for beep sound during time warp
  
  // Magnetism visual effect (for 2X powerup)
  let magnetismPulse = 0; // Pulse intensity (0 to 1)
  let magnetismStickersInRadius = new Set(); // Track which stickers are in radius

  // Countdown
  let countdownT = 0;
  let lastCountdownPhase = "";
  let countdownShowingLevel = false;

  // Out-of-time overlay timer
  let outOfTimeT = 0;

  // Final 10s beeps control
  let lastSecondCeil = RUN_TIME;

  // Audio
  let audioUnlocked = false;
  
  // High score notification
  let newHighScoreTimer = 0;
  const NEW_HIGH_SCORE_DURATION = 3.0; // seconds to show "NEW HIGH SCORE!" banner
  let personalBest = 0;
  let totalGamesPlayed = 0;
  let totalStickersAllTime = 0;
  let bestStickerCount = 0;
  
  // Survival mode stats (tracked separately)
  let survivalLongestTime = 0;
  let survivalHighScore = 0;
  let survivalTotalRuns = 0;
  let survivalTotalStickers = 0;

  // Achievement tracking
  let unlockedAchievements = {}; // {1: true, 2: false, ...}
  let currentRunTracking = {
    startLives: LIVES_START,
    bossLivesLost: 0,
    powerupsCollected: { twoX: 0, drunk: 0 },
    stickersCollected: 0,
    hitTaken: false
  };
  
  // Track powerups collected on current level attempt (only committed on level completion)
  let currentLevelPowerups = { twoX: 0, drunk: 0 };
  
  // Achievement notification queue
  let achievementQueue = []; // Queue of achievement IDs to display
  let isShowingAchievement = false;
  const ACHIEVEMENT_DISPLAY_DURATION = 3000; // 3 seconds

  function getWeeklySeed() {
    // Survival mode always uses static seed for consistent gameplay
    if (gameMode === "SURVIVAL") {
      return hashToSeed(SURVIVAL_STATIC_SEED);
    }
    
    // Main game: If weekly seed is disabled, return the fixed manual seed
    if (!USE_WEEKLY_SEED) {
      // Allow MANUAL_SEED to be a week key string (e.g., "2026-W03") for testing
      if (typeof MANUAL_SEED === 'string' && /^\d{4}-W\d{2}$/.test(MANUAL_SEED)) {
        return hashToSeed(`StickerSnatchV4:${MANUAL_SEED}`);
      }
      return MANUAL_SEED >>> 0;
    }

    // Otherwise use the weekly seed system
    const wKey = weekKey();
    const storedWeek = localStorage.getItem(LS_WEEKLY_DATE);
    const storedSeed = localStorage.getItem(LS_WEEKLY_SEED);
    if (storedWeek === wKey && storedSeed) return Number(storedSeed) >>> 0;

    const seed = hashToSeed(`StickerSnatchV4:${wKey}`);
    localStorage.setItem(LS_WEEKLY_DATE, wKey);
    localStorage.setItem(LS_WEEKLY_SEED, String(seed));
    return seed;
  }

  function updateHud() {
    if (gameMode === "SURVIVAL") {
      // Survival mode HUD layout:
      // - Left box (livesText): Display points
      // - Center box (pointsBox): Hidden
      // - Right box (stickersText): Display stickers collected
      
      livesText.textContent = String(points);
      
      // Hide center box in survival mode
      if (hudPointsBox) {
        hudPointsBox.style.display = 'none';
      }
      
      stickersText.textContent = String(stickersCollected);
    } else {
      // Main game HUD layout (normal)
      // Show center box again
      if (hudPointsBox) {
        hudPointsBox.style.display = 'flex';
      }
      
      livesText.textContent = String(lives);
      const newPointsDisplay = points;
      if (cachedPointsDisplay !== newPointsDisplay) {
        cachedPointsDisplay = newPointsDisplay;
        pointsText.textContent = String(newPointsDisplay);
      }
      stickersText.textContent = String(stickersCollected);
    }
  }

  function applyLevelDifficulty(level) {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
    WORLD_SCROLL_SPEED = config.scrollSpeed;
    SPAWN_MIN = config.spawnMin;
    SPAWN_MAX = config.spawnMax;
    DOUBLE_SPAWN_CHANCE = config.doubleSpawnChance;
    BIG_ASTEROID_CHANCE = config.bigAsteroidChance;
  }

  // ===== SURVIVAL MODE DIFFICULTY PROGRESSION =====
  function applySurvivalDifficulty(tier) {
    const cfg = SURVIVAL_CONFIG;
    
    // Calculate difficulty values based on tier with caps
    WORLD_SCROLL_SPEED = Math.min(
      cfg.maxScrollSpeed,
      cfg.startScrollSpeed + (tier - 1) * cfg.scrollSpeedIncrease
    );
    
    SPAWN_MIN = Math.max(
      cfg.minSpawnMin,
      cfg.startSpawnMin - (tier - 1) * cfg.spawnMinDecrease
    );
    
    SPAWN_MAX = Math.max(
      cfg.minSpawnMax,
      cfg.startSpawnMax - (tier - 1) * cfg.spawnMaxDecrease
    );
    
    DOUBLE_SPAWN_CHANCE = Math.min(
      cfg.maxDoubleSpawnChance,
      cfg.startDoubleSpawnChance + (tier - 1) * cfg.doubleSpawnChanceIncrease
    );
    
    BIG_ASTEROID_CHANCE = Math.min(
      cfg.maxBigAsteroidChance,
      cfg.startBigAsteroidChance + (tier - 1) * cfg.bigAsteroidChanceIncrease
    );
  }
  // ===============================================

async function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  // Initialize WebAudio context (don't start music yet)
  await initWebAudioIfNeeded().catch((err) => {
    console.warn("Audio init failed:", err);
  });
  
  // Explicitly resume AudioContext on iOS
  if (audioCtx && audioCtx.state === 'suspended') {
    await audioCtx.resume().catch(err => console.warn('AudioContext resume failed:', err));
  }
}


  function playSfx(audio, now, throttleMs = 60) {
    if (!audio) return;
    if (!audio._lastPlay) audio._lastPlay = 0;
    if (now - audio._lastPlay < throttleMs) return;
    audio._lastPlay = now;
    audio.currentTime = 0;
    audio.volume = sfxVolumeMultiplier; // Apply SFX volume setting
    audio.play().catch(() => {});
  }

  function showOnlyOverlay(which) {
    const map = {
      title: titleOverlay,
      menu: menuOverlay,
      gamemode: gameModeOverlay,
      start: startOverlay,
      countdown: countdownOverlay,
      bossIntro: bossIntroOverlay,
      win: winOverlay,
      gameover: gameOverOverlay,
      survivalgameover: survivalGameOverOverlay,
      outoftime: outOfTimeOverlay,
      howtoplay: howToPlayOverlay,
      leaderboard: leaderboardOverlay,
      settings: settingsOverlay,
      themecolor: themeColorOverlay,
      stats: statsOverlay,
      pause: pauseOverlay,
      secretwin: secretWinOverlay,
      secretgameover: secretGameOverOverlay,
      sharePreview: sharePreviewOverlay,
      arcadename: arcadeNameEntryOverlay
    };

    titleOverlay.classList.remove("show");
    menuOverlay.classList.remove("show");
    if (gameModeOverlay) gameModeOverlay.classList.remove("show");
    startOverlay.classList.remove("show");
    countdownOverlay.classList.remove("show");
    bossIntroOverlay.classList.remove("show");
    winOverlay.classList.remove("show");
    gameOverOverlay.classList.remove("show");
    if (survivalGameOverOverlay) survivalGameOverOverlay.classList.remove("show");
    outOfTimeOverlay.classList.remove("show");
    howToPlayOverlay.classList.remove("show");
    leaderboardOverlay.classList.remove("show");
    settingsOverlay.classList.remove("show");
    if (themeColorOverlay) themeColorOverlay.classList.remove("show");
    if (statsOverlay) statsOverlay.classList.remove("show");
    pauseOverlay.classList.remove("show");
    secretWinOverlay.classList.remove("show");
    secretGameOverOverlay.classList.remove("show");
    if (sharePreviewOverlay) sharePreviewOverlay.classList.remove("show");
    if (arcadeNameEntryOverlay) arcadeNameEntryOverlay.classList.remove("show");

    if (which && map[which]) map[which].classList.add("show");
    
    // ===== ARCADE: Show/hide credit display based on overlay =====
    const menuScreens = ["title", "menu", "gamemode", "howtoplay", "leaderboard", "settings", "themecolor"];
    const gameplayScreens = ["countdown", "start", "bossIntro"];
    const endScreens = ["win", "gameover", "survivalgameover", "outoftime", "secretwin", "secretgameover", "arcadename"];
    
    if (menuScreens.includes(which)) {
      showCreditDisplay();
    } else if (gameplayScreens.includes(which) || endScreens.includes(which)) {
      hideCreditDisplay();
    }
    // ===== END ARCADE =====
    
    // Reset leaderboardSource when returning to menu to fix settings back button bug
    if (which === "menu") {
      leaderboardSource = "menu";
    }
    
    // Manage logo visibility based on screen
    if (gameLogo) {
      if (which === "title") {
        // On title screen: show centered, not docked
        gameLogo.classList.remove("logo--docked", "logo--hidden");
        
        // ===== ARCADE: Stop main music and play title music =====
        stopMusic();
        playTitleMusic();
        // ===== END ARCADE =====
      } else if (which === "menu" || which === "gamemode") {
        // On menu screen or game mode selection: show docked at top
        gameLogo.classList.remove("logo--hidden");
        gameLogo.classList.add("logo--docked");
      } else {
        // On all other screens: hide logo
        gameLogo.classList.add("logo--hidden");
      }
    }
    
    // Update keyboard navigation for the new overlay
    if (which) {
      setTimeout(() => updateNavigableButtons(which), 50);
    } else {
      currentNavigableButtons = [];
      focusedButtonIndex = 0;
    }
    
    // ===== ATTRACT MODE: Reset idle timer when overlay changes =====
    if (typeof window.resetIdleTimer === 'function') {
      window.resetIdleTimer();
    }
    // ===== END ATTRACT MODE =====
  }

  function pauseGame() {
    if (isPaused) return; // Already paused
    if (state !== STATE.PLAY && state !== STATE.FINAL_LEVEL) return; // Only pause during gameplay
    if (bossIntroActive) return; // Don't allow pause during boss intro cutscene
    
    isPaused = true;
    holdDir = 0; // Stop player movement
    
    // Show main pause card, hide confirmation
    pauseMainCard.style.display = 'flex';
    pauseConfirmCard.style.display = 'none';
    
    showOnlyOverlay("pause");
    
    // Reinitialize keyboard navigation for pause menu
    setTimeout(() => updateNavigableButtons("pause"), 50);
  }

  function unpauseGame() {
    if (!isPaused) return; // Not paused
    
    isPaused = false;
    
    // Reset lastTs to prevent delta time jump
    lastTs = performance.now();
    
    showOnlyOverlay(null);
  }

  function resetRun() {
    const baseSeed = getWeeklySeed();
    // Make each level have unique patterns while staying deterministic
    const seed = baseSeed * 37 + currentLevel;
    currentSeed = seed; // Store for stickerRng
    rand = mulberry32(seed);

    // Don't reset stickersCollected - it persists across levels
    timeLeft = RUN_TIME;
    lastSecondCeil = RUN_TIME;
    lastSecondTick = 0; // Reset seconds tick for points tracking

    playerX = W / 2;
    playerIsCrashed = false; // Reset player crash state
    playerRotation = 0; // Reset visual rotation
    playerTargetRotation = 0;
    playerHasEntered = false; // Reset entrance animation flag for new game
    obstacles = [];
    stickers = [];
    powerupStickers = [];
    spawnTimer = 0;
    playerTrail = []; // Clear trail on level reset

    // Only show Earth on Level 1 (not in survival mode)
    earthActive = (gameMode === "MAIN" && currentLevel === 1);
    earthY = H - earthDrawH;

    // Clear powerup effects when starting any level
    scoreMultiplier = 1;
    powerupEffectEndTime = 0;
    activePowerupType = null;
    drunkWobblePhase = 0;
    drunkGhostWobblePhase = 0;
    // Keep mainGameShieldCount (shields persist across levels)
    mainGameShieldInvulnerable = false;
    mainGameShieldInvulnerableTimer = 0;
    mainGameShieldHitFreeze = false;
    mainGameShieldHitFreezeTimer = 0;
    mainGameTimeWarpActive = false;
    mainGameTimeWarpTimer = 0;
    mainGameTimeWarpBeepTimer = 0;
    // Reset music to main track if a powerup variant was playing
    if (currentTrack === 'main2X' || currentTrack === 'mainTurnt') {
      switchMusicTrack('main').catch(err => console.warn('Failed to reset music:', err));
    }
    // Restore music volume (in case TIME WARP lowered it)
    if (musicGain) {
      musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
    }
    
    // Reset current level powerup tracking for new level attempt
    currentLevelPowerups = { twoX: 0, drunk: 0 };

    // Apply difficulty based on game mode
    if (gameMode === "SURVIVAL") {
      applySurvivalDifficulty(survivalTier);
    } else {
      applyLevelDifficulty(currentLevel);
    }

    updateHud();
  }

  function beginCountdown(level) {
    currentLevel = level;
    // Save sticker count at the start of this level
    stickersAtLevelStart = stickersCollected;
    // Save points snapshot at the start of this level
    levelStartPoints = points;
    // Save total stickers for extra life tracking
    stickerTotalAtLevelStart = stickerTotalCollected;
    // Reset per-level sticker counter
    stickersThisLevel = 0;
    
    // ===== ARCADE: Hide credit display during gameplay =====
    hideCreditDisplay();
    // ===== END ARCADE =====
    
    // Refresh powerupRng - use static seed for survival, static powerup seed for main game
    if (gameMode === "SURVIVAL") {
      powerupRng = mulberry32(hashToSeed(SURVIVAL_STATIC_SEED + ":powerups"));
    } else {
      // Use static powerup seed instead of hourly seed
      powerupRng = mulberry32(hashToSeed(POWERUP_SEED + ":Level" + level));
    }
    // Initialize stickerRng with the same seed as main RNG for consistency
    stickerRng = mulberry32(currentSeed);
    powerupStickers = [];
    powerupsSpawnedThisLevel = []; // Reset powerup tracking for new level
    shieldSpawnedThisLevel = false; // Reset shield spawn tracking
    
    // Set guaranteed powerup spawn times using daily seed
    firstPowerupSpawnTime = 60 - (5 + powerupRng() * 15); // Between 40-55 seconds left (5-20 sec into level)
    secondPowerupSpawnTime = 10 + powerupRng() * 15; // Between 10-25 seconds left (35-50 sec into level)
    shieldSpawnTime = 60 - (powerupRng() * 5); // Between 55-60 seconds left (0-5 sec into level)
    
    // Player is already in position (entrance animation happened during intro)
    playerEntranceY = PLAYER_Y;
    
    state = STATE.COUNTDOWN;
    countdownT = COUNTDOWN_LEVEL_DURATION + COUNTDOWN_TOTAL;
    lastCountdownPhase = "";
    countdownShowingLevel = true;
    showOnlyOverlay("countdown");
    countdownText.textContent = gameMode === "SURVIVAL" ? "SURVIVE" : `LEVEL ${level}`;
    
    // Show gesture tutorial on first play during level 1 countdown
    const tutorialShown = localStorage.getItem(LS_TUTORIAL_SHOWN);
    if (!tutorialShown && level === 1) {
      showGestureTutorial();
    }
    
    // Play level display sound
    playSfx(assets.levelDisplay, performance.now(), 0);
    
    // Show HUD when game starts
    if (hud) hud.style.display = '';
    
    // Hide goat icon in survival mode (since left box shows points, not lives)
    if (gameMode === "SURVIVAL" && hudLifeIcon) {
      hudLifeIcon.style.display = 'none';
    }
    
    // Show mobile pause instruction (only once per game, only on mobile, only on level 1)
    if (level === 1 && !pauseInstructionShown && isMobileDevice()) {
      pauseInstructionShown = true;
      if (pauseInstruction) {
        pauseInstruction.style.display = 'block';
        // Trigger show animation
        setTimeout(() => {
          pauseInstruction.classList.add('show');
        }, 50);
        // Hide after 4 seconds
        setTimeout(() => {
          pauseInstruction.classList.remove('show');
          setTimeout(() => {
            pauseInstruction.style.display = 'none';
          }, 300); // Wait for fade transition
        }, 4000);
      }
    }
    
    // Don't restart music - let menu music continue playing
  }

  function startRunNow() {
    state = STATE.PLAY;
    hasPlayedGame = true; // Mark that a game has started
    showOnlyOverlay(null);
    // Base music continues playing - no switch needed
    
    // Initial powerup spawn removed for survival mode
    // Shield and Time powerups will spawn on their own timers
    
    // Hide gesture tutorial when transitioning to play
    hideGestureTutorial();
  }

  function showGestureTutorial() {
    // Only show on mobile devices
    // To test on desktop: comment out the line below and run localStorage.removeItem('ss_tutorial_shown')
    if (!isMobileDevice()) {
      return;
    }
    
    if (!gestureTutorial) {
      return;
    }
    
    gestureTutorial.style.display = 'flex';
    // Force opacity to 1 (CSS animation not triggering from display:none)
    gestureTutorial.style.opacity = '1';
    
    // Auto-hide after 5 seconds (enough for 2 full pulse cycles)
    setTimeout(() => {
      hideGestureTutorial();
    }, 5000);
    
    // Mark tutorial as shown
    localStorage.setItem(LS_TUTORIAL_SHOWN, 'true');
  }

  function hideGestureTutorial() {
    if (!gestureTutorial) return;
    gestureTutorial.classList.add('fadeOut');
    setTimeout(() => {
      gestureTutorial.style.display = 'none';
      gestureTutorial.classList.remove('fadeOut');
    }, 500);
  }

  // ===== SECRET LEVEL START =====
  function beginSecretLevel() {
    isKonamiLevel = true;
    currentLevel = 3; // Use level 3 difficulty settings
    lives = 1; // Doesn't really matter since we'll instant game over
    stickersCollected = 0;
    stickerTotalCollected = 0;
    stickersAtLevelStart = 0;
    points = 0;
    levelStartPoints = 0;
    lastSecondTick = 0;
    
    // Reset game state
    const baseSeed = getWeeklySeed();
    const seed = baseSeed * 37 + 999; // Unique seed for secret level
    currentSeed = seed; // Store for stickerRng
    rand = mulberry32(seed);
    
    timeLeft = 120; // 120 seconds for secret level
    lastSecondCeil = 120;
    
    playerX = W / 2;
    playerIsCrashed = false;
    playerRotation = 0;
    playerTargetRotation = 0;
    obstacles = [];
    stickers = [];
    powerupStickers = []; // Clear any powerup stickers
    spawnTimer = 0;
    
    earthActive = false; // No Earth in secret level
    
    // ===== CLEAR ALL POWERUP/MULTIPLIER EFFECTS =====
    // Secret level should be a completely clean slate with NO effects
    scoreMultiplier = 1;
    powerupEffectEndTime = 0;
    activePowerupType = null;
    controlsInverted = false;
    drunkWobblePhase = 0;
    drunkGhostWobblePhase = 0;
    magnetismPulse = 0;
    magnetismStickersInRadius.clear();
    
    // Clear main game powerup states
    mainGameShieldCount = 0;
    mainGameShieldInvulnerable = false;
    mainGameShieldInvulnerableTimer = 0;
    mainGameShieldHitFreeze = false;
    mainGameShieldHitFreezeTimer = 0;
    mainGameTimeWarpActive = false;
    mainGameTimeWarpTimer = 0;
    mainGameTimeWarpBeepTimer = 0;
    
    // Clear survival mode powerup states
    survivalShieldCount = 0;
    survivalShieldInvulnerable = false;
    survivalShieldInvulnerableTimer = 0;
    survivalShieldHitFreeze = false;
    survivalShieldHitFreezeTimer = 0;
    survivalTimeWarpActive = false;
    
    // Restore music volume (in case TIME WARP lowered it)
    if (musicGain) {
      musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
    }
    survivalTimeWarpTimer = 0;
    survivalTimeWarpBeepTimer = 0;
    
    // Clear survival multiplier/streak system
    streakTimer = 0;
    streakCount = 0;
    streakMultiplier = 1;
    survivalMultiplier = 1;
    
    // Apply level 3 difficulty
    applyLevelDifficulty(3);
    
  // === SECRET LEVEL CUSTOM DIFFICULTY OVERRIDES ===
  // You can manually adjust these values for the secret level only.
  // These override the globals that `applyLevelDifficulty` sets so they take
  // effect immediately and only while `isKonamiLevel` is true.
  // Example overrides (uncomment to apply):
  // WORLD_SCROLL_SPEED = 380;        // movement speed used for obstacles/boss
  // SPAWN_MIN = 0.20;               // minimum spawn interval
  // SPAWN_MAX = 0.40;               // maximum spawn interval
  // DOUBLE_SPAWN_CHANCE = 0.45;     // chance to spawn a second obstacle
  // BIG_ASTEROID_CHANCE = 0.35;     // chance an asteroid is large

  // Keep background pattern matching using `WORLD_SCROLL_SPEED` by default.
  // If you want the visible background to scroll faster independently, you
  // can set `bgOffset` logic elsewhere; for now, sync it to WORLD_SCROLL_SPEED.
  WORLD_SCROLL_SPEED = LEVEL_CONFIG[3].scrollSpeed; // ensure default sync

  // Optional: uncomment below to force specific secret-level values
  // WORLD_SCROLL_SPEED = 380;
  // SPAWN_MIN = 0.24;
  // SPAWN_MAX = 0.44;
  // DOUBLE_SPAWN_CHANCE = 0.40;
  // BIG_ASTEROID_CHANCE = 0.32;

  // Also set scrollSpeed variable (used for background pattern scrolling)
  scrollSpeed = WORLD_SCROLL_SPEED;

  // Apply any user-defined overrides from SECRET_LEVEL_OVERRIDES
  if (typeof SECRET_LEVEL_OVERRIDES !== 'undefined' && SECRET_LEVEL_OVERRIDES) {
    if (SECRET_LEVEL_OVERRIDES.WORLD_SCROLL_SPEED != null) WORLD_SCROLL_SPEED = SECRET_LEVEL_OVERRIDES.WORLD_SCROLL_SPEED;
    if (SECRET_LEVEL_OVERRIDES.SPAWN_MIN != null) SPAWN_MIN = SECRET_LEVEL_OVERRIDES.SPAWN_MIN;
    if (SECRET_LEVEL_OVERRIDES.SPAWN_MAX != null) SPAWN_MAX = SECRET_LEVEL_OVERRIDES.SPAWN_MAX;
    if (SECRET_LEVEL_OVERRIDES.DOUBLE_SPAWN_CHANCE != null) DOUBLE_SPAWN_CHANCE = SECRET_LEVEL_OVERRIDES.DOUBLE_SPAWN_CHANCE;
    if (SECRET_LEVEL_OVERRIDES.BIG_ASTEROID_CHANCE != null) BIG_ASTEROID_CHANCE = SECRET_LEVEL_OVERRIDES.BIG_ASTEROID_CHANCE;
    if (SECRET_LEVEL_OVERRIDES.TIME_LEFT != null) {
      timeLeft = SECRET_LEVEL_OVERRIDES.TIME_LEFT;
      lastSecondCeil = Math.ceil(SECRET_LEVEL_OVERRIDES.TIME_LEFT);
    }

    // Keep scrollSpeed synced to WORLD_SCROLL_SPEED after overrides
    scrollSpeed = WORLD_SCROLL_SPEED;
  }
    
    updateHud();
    
    // Start countdown
    state = STATE.COUNTDOWN;
    countdownT = COUNTDOWN_LEVEL_DURATION + COUNTDOWN_TOTAL;
    lastCountdownPhase = "";
    countdownShowingLevel = true;
    showOnlyOverlay("countdown");
    countdownText.textContent = `SECRET LEVEL`;
    countdownText.classList.add('secretLevel'); // Add class for smaller styling
    
    // Play level display sound
    playSfx(assets.levelDisplay, performance.now(), 0);
    
    // Stop title music and any currently playing music
    stopTitleMusic();
    stopMusic();
    
    // Start secret level music
    try {
      playMusic('secretLevel', { loop: true, volume: 0.4 });
    } catch (err) {
      console.warn("Failed to start secret level music:", err);
    }
    
    // Hide entire HUD for secret level
    if (hud) hud.style.display = 'none';
  }

  function returnToMainGame() {
    // Reset secret level flag
    isKonamiLevel = false;
    
    // Reset Konami Code progress
    resetKonamiCode();
    
    // Return to title screen
    state = STATE.TITLE;
    showOnlyOverlay("title");
    
    // Reset lives display
    if (hudLifeIcon) hudLifeIcon.style.display = '';
    if (livesText) livesText.style.display = '';
    
    // Hide HUD
    if (hud) hud.style.display = 'none';
    
    // Stop any music
    stopMusic();
  }
  // ===== END SECRET LEVEL START =====

  function updateCountdownTextAndSound() {
    // Check if we're still in LEVEL display phase
    if (countdownShowingLevel && countdownT > COUNTDOWN_TOTAL) {
      // Show appropriate text based on game mode
      if (gameMode === "SURVIVAL") {
        countdownText.textContent = "SURVIVE";
        countdownText.classList.add('survive');
      } else if (isKonamiLevel) {
        countdownText.textContent = "SECRET LEVEL";
        countdownText.classList.add('secretLevel');
      } else {
        countdownText.textContent = `LEVEL ${currentLevel}`;
        countdownText.classList.remove('secretLevel', 'survive');
      }
      return;
    }

    // Transition from LEVEL to numeric countdown
    if (countdownShowingLevel && countdownT <= COUNTDOWN_TOTAL) {
      countdownShowingLevel = false;
      lastCountdownPhase = ""; // Reset to trigger first numeric phase
      countdownText.classList.remove('secretLevel', 'survive'); // Remove special styling
    }

    let phase = "";
    if (countdownT > 1.7) { countdownText.textContent = "3"; phase = "3"; }
    else if (countdownT > 1.1) { countdownText.textContent = "2"; phase = "2"; }
    else if (countdownT > 0.5) { countdownText.textContent = "1"; phase = "1"; }
    else { countdownText.textContent = "GO!"; phase = "start"; }

    if (phase !== lastCountdownPhase) {
      const now = performance.now();
      if (phase === "3" || phase === "2" || phase === "1") playSfx(assets.c321, now, 0);
      if (phase === "start") playSfx(assets.start, now, 0);
      lastCountdownPhase = phase;
    }
  }

  function handleFailureCollision(obstacle) {
    // MAIN GAME: Check for shield protection
    if (gameMode !== "SURVIVAL" && mainGameShieldCount > 0) {
      // Consume one shield
      mainGameShieldCount--;
      
      // Mark this specific asteroid as crashed (will show hit image)
      obstacle.isCrashed = true;
      
      // Activate invulnerability for 2 seconds
      mainGameShieldInvulnerable = true;
      mainGameShieldInvulnerableTimer = 2.0;
      
      // Activate world freeze for 0.5 seconds
      mainGameShieldHitFreeze = true;
      mainGameShieldHitFreezeTimer = 0.5;
      
      // Trigger MORE INTENSE screen shake (3x normal intensity, longer duration)
      shakeTimer = SHAKE_DURATION * 2; // Double the shake duration for shield hits
      // Triple the shake intensity by setting it directly
      const tripleIntensity = SHAKE_INTENSITY * 3;
      shakeOffsetX = (Math.random() - 0.5) * 2 * tripleIntensity;
      shakeOffsetY = (Math.random() - 0.5) * 2 * tripleIntensity;
      
      // Spawn particles at collision point
      const particleColor = obstacle.particleColor || '#c7005a';
      for (let i = 0; i < 15; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = 100 + Math.random() * 200;
        particles.push({
          x: obstacle.x,
          y: obstacle.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.6,
          maxLife: 0.6,
          size: 3 + Math.random() * 5,
          color: particleColor
        });
      }
      
      // Play hit sound and haptic feedback
      playSfx(assets.hit, performance.now(), 0.5);
      triggerHaptic(60);
      
      // Don't lose a life - shield absorbed the hit!
      return;
    }
    
    // SURVIVAL MODE: Check for shield protection
    if (gameMode === "SURVIVAL" && survivalShieldCount > 0 && !survivalShieldInvulnerable) {
      // Consume one shield
      survivalShieldCount--;
      
      // Mark this specific asteroid as crashed (will show hit image)
      obstacle.isCrashed = true;
      
      // Activate invulnerability for 2 seconds
      survivalShieldInvulnerable = true;
      survivalShieldInvulnerableTimer = 2.0;
      
      // BREAK THE STREAK
      if (streakTimer > 0) {
        triggerStreakBreakEffects();
      }
      streakTimer = 0;
      streakCount = 0;
      streakMultiplier = 1;
      
      // Activate world freeze for 0.5 seconds
      survivalShieldHitFreeze = true;
      survivalShieldHitFreezeTimer = 0.5;
      
      // Trigger MORE INTENSE screen shake (3x normal intensity, longer duration)
      shakeTimer = SHAKE_DURATION * 2; // Double the shake duration for shield hits
      // Triple the shake intensity by setting it directly
      const tripleIntensity = SHAKE_INTENSITY * 3;
      shakeOffsetX = (Math.random() - 0.5) * 2 * tripleIntensity;
      shakeOffsetY = (Math.random() - 0.5) * 2 * tripleIntensity;
      
      // Spawn particles at collision point
      const particleColor = obstacle.particleColor || '#c7005a';
      for (let i = 0; i < 15; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = 100 + Math.random() * 200;
        particles.push({
          x: obstacle.x,
          y: obstacle.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.6,
          maxLife: 0.6,
          size: 3 + Math.random() * 5,
          color: particleColor
        });
      }
      
      // Play hit sound and haptic feedback
      playSfx(assets.hit, performance.now(), 0.5); // Quieter hit sound
      triggerHaptic(60); // Shorter haptic for shield hit
      
      // Don't lose a life - shield absorbed the hit!
      return;
    }
    
    // Mark this specific asteroid as crashed (will show hit image)
    obstacle.isCrashed = true;
    
    // Spawn explosive particles at asteroid position (more particles, bigger, faster)
    // Use the asteroid's specific color palette
    const particleColor = obstacle.particleColor || '#c7005a';
    for (let i = 0; i < 15; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 100 + Math.random() * 200; // Faster particles
      particles.push({
        x: obstacle.x,
        y: obstacle.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6,
        maxLife: 0.6,
        size: 3 + Math.random() * 5, // Bigger particles (3-8px)
        color: particleColor
      });
    }
    
    // Mark player as crashed
    playerIsCrashed = true;
    
    // In secret level: instant game over (no lives)
    if (isKonamiLevel) {
      playSfx(assets.hit, performance.now(), 0);
      triggerHaptic(120);
      
      // Show secret game over overlay immediately
      state = STATE.GAMEOVER;
      showOnlyOverlay('secretgameover');
      return;
    }
    
    // Trigger screen shake
    shakeTimer = SHAKE_DURATION;
    
    // Trigger hit stop
    inHitStop = true;
    hitStopEndTime = performance.now() + (HITSTOP_DURATION * 1000);
    
    playSfx(assets.hit, performance.now(), 0);
    triggerHaptic(120); // Short collision vibration

    lives -= 1;
    
    // Trigger life loss animation
    const hudLifeIcon = document.getElementById('hudLifeIcon');
    if (hudLifeIcon) {
      hudLifeIcon.classList.remove('life-loss', 'life-gain');
      void hudLifeIcon.offsetWidth; // Force reflow
      hudLifeIcon.classList.add('life-loss');
      setTimeout(() => hudLifeIcon.classList.remove('life-loss'), 500);
    }
    
    // Flash lives text red
    if (livesText) {
      livesText.classList.remove('life-text-loss', 'life-text-gain');
      void livesText.offsetWidth; // Force reflow
      livesText.classList.add('life-text-loss');
      setTimeout(() => livesText.classList.remove('life-text-loss'), 500);
    }
    
    // Track that player was hit for IRON GOAT achievement
    currentRunTracking.hitTaken = true;
    
    // Track boss fight lives lost for BREN'S REVENGE achievement
    if (state === STATE.FINAL_LEVEL) {
      currentRunTracking.bossLivesLost += 1;
    }

    if (lives <= 0) {
      // Game Over: keep current points and stickers for leaderboard
      updateHud();
      
      // Update stats based on game mode
      if (gameMode === "SURVIVAL") {
        // Track survival mode stats separately
        survivalTotalRuns += 1;
        survivalTotalStickers += stickersCollected;
        
        // Check for new longest survival time
        const survivalTimeSec = Math.floor(survivalTime);
        if (survivalTimeSec > survivalLongestTime) {
          survivalLongestTime = survivalTimeSec;
        }
        
        // Check for new high score
        if (points > survivalHighScore) {
          survivalHighScore = points;
        }
        
        saveSurvivalStats();
      } else {
        // Track main game stats
        
        // Check for new personal best (MAIN GAME only)
        if (points > personalBest) {
          personalBest = points;
          newHighScoreTimer = NEW_HIGH_SCORE_DURATION;
          // Show high score banner
          if (highScoreBanner) highScoreBanner.classList.add("show");
        }
        
        // Check for new best sticker count (MAIN GAME only)
        if (stickersCollected >= bestStickerCount) {
          bestStickerCount = stickersCollected;
        }
        
        totalGamesPlayed += 1;
        totalStickersAllTime += stickersCollected;
        saveStats();
      }
      
      state = STATE.GAMEOVER;
      
      // Restore music volume (in case TIME WARP lowered it)
      if (musicGain) {
        musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
      }
      
      // Survival mode: show custom overlay with time survived
      if (gameMode === "SURVIVAL") {
        // Update survival game over overlay with time
        const minutes = Math.floor(survivalTime / 60);
        const seconds = Math.floor(survivalTime % 60);
        const timeString = `${minutes}:${String(seconds).padStart(2, '0')}`;
        
        const survivalTimeText = document.getElementById('survivalTimeText');
        const survivalPointsText = document.getElementById('survivalPointsText');
        if (survivalTimeText) survivalTimeText.textContent = timeString;
        if (survivalPointsText) survivalPointsText.textContent = String(points);
        
        // Reset input fields and button state
        if (survivalNameInput) {
          survivalNameInput.value = '';
          survivalNameInput.disabled = false;
        }
        if (survivalEmailInput) {
          survivalEmailInput.value = '';
          survivalEmailInput.disabled = false;
        }
        if (survivalSubmitNameBtn) {
          survivalSubmitNameBtn.disabled = false;
        }
        if (survivalStatusMessage) {
          survivalStatusMessage.textContent = '';
        }
        
        showOnlyOverlay("survivalgameover");
      } else {
        // ===== ARCADE: Show arcade name entry instead of game over overlay =====
        showArcadeNameEntry(false); // false = game over (not win)
        // ===== END ARCADE =====
      }
      return;
    }

    // Still have lives: reset to level start values
    // Reset stickers to what we had at the start of this level
    stickersCollected = stickersAtLevelStart;
    // Reset points to what we had at the start of this level
    points = levelStartPoints;
    // Reset total stickers for extra life tracking
    stickerTotalCollected = stickerTotalAtLevelStart;
    // Reset per-level sticker counter
    stickersThisLevel = 0;
    
    // Reset current level powerup tracking (level not completed)
    currentLevelPowerups = { twoX: 0, drunk: 0 };
    
    // Reset powerup effects on collision
    scoreMultiplier = 1;
    powerupEffectEndTime = 0;
    activePowerupType = null;
    drunkWobblePhase = 0;
    drunkGhostWobblePhase = 0;
    // Reset music to main track if a powerup variant was playing
    if (currentTrack === 'main2X' || currentTrack === 'mainTurnt') {
      switchMusicTrack('main').catch(err => console.warn('Failed to reset music:', err));
    }
    
    updateHud();

    // NOTE: Don't restart immediately - wait for hit stop to end
    // The update loop will handle restarting after hit stop completes
  }

  function beginOutOfTimeSequence() {
    // In survival mode, time is not tracked (survival never calls this)
    // This function only runs in main game mode
    
    // In secret level: time completion = WIN!
    if (isKonamiLevel) {
      // Secret level victory!
      
      // Check for new high score
      if (points > personalBest) {
        personalBest = points;
        newHighScoreTimer = NEW_HIGH_SCORE_DURATION;
      }
      
      // Check for new best sticker count
      if (stickersCollected >= bestStickerCount) {
        bestStickerCount = stickersCollected;
      }
      
      // Update stats
      totalGamesPlayed += 1;
      totalStickersAllTime += stickersCollected;
      saveStats();
      
      state = STATE.WIN;
      
      // Restore music volume (in case TIME WARP lowered it)
      if (musicGain) {
        musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
      }
      
      showOnlyOverlay('secretwin');
      
      // PYRAMID SCHEME - Find and beat the secret level
      unlockAchievement(8);
      
      return;
    }
    
    // Time expiry: advance to next level or final boss level
    
    // Award level completion bonus based on level just completed
    if (currentLevel === 1) {
      points += 400;
    } else if (currentLevel === 2) {
      points += 600;
    } else if (currentLevel === 3) {
      points += 800;
    }
    
    // Commit powerups collected on this level to run tracking (level completed successfully)
    currentRunTracking.powerupsCollected.twoX += currentLevelPowerups.twoX;
    currentRunTracking.powerupsCollected.drunk += currentLevelPowerups.drunk;
    
    // Reset music to main track if a powerup variant was playing (level completed)
    if (currentTrack === 'main2X' || currentTrack === 'mainTurnt') {
      switchMusicTrack('main').catch(err => console.warn('Failed to reset music:', err));
    }
    
    if (currentLevel < MAX_LEVEL) {
      // Advance to next level
      currentLevel += 1;  // Update level BEFORE resetRun so correct difficulty is applied
      resetRun();
      beginCountdown(currentLevel);
    } else {
      // Completed all regular levels - start FINAL LEVEL (boss fight)
      // Reset boss lives counter only on first entry, not on restarts
      currentRunTracking.bossLivesLost = 0;
      beginFinalLevel();
    }
  }

  function handleWin() {
    // Award boss defeat points and completion bonuses
    points += 3250; // Boss defeated
    points += lives * 150; // Lives remaining bonus
    
    // Shields remaining bonus (with perfect bonus for all 3)
    if (mainGameShieldCount === 3) {
      points += 3000; // Perfect shield bonus
    } else {
      points += mainGameShieldCount * 750; // 750 per shield
    }
    
    // Check for new personal best
    if (points > personalBest) {
      personalBest = points;
      newHighScoreTimer = NEW_HIGH_SCORE_DURATION;
      // Don't show high score banner immediately - it will show after achievements
    }
    
    // Check for new best sticker count
    if (stickersCollected >= bestStickerCount) {
      bestStickerCount = stickersCollected;
    }
    
    // Update main game stats (win only happens in main game, not survival)
    totalGamesPlayed += 1;
    totalStickersAllTime += stickersCollected;
    saveStats();
    
    // Check achievements
    // BREN'S REVENGE - Defeat boss without losing a life during boss fight
    if (currentRunTracking.bossLivesLost === 0) {
      unlockAchievement(1);
    }
    
    // TURNT UP - Collect all powerups (2 per level × 3 levels = 6 total: 3 2X + 3 DRUNK)
    if (currentRunTracking.powerupsCollected.twoX >= 3 && currentRunTracking.powerupsCollected.drunk >= 3) {
      unlockAchievement(2);
    }
    
    // STICKER DIET - Complete game without collecting any stickers
    if (stickersCollected === 0) {
      unlockAchievement(3);
    }
    
    // STICKER HOARDER - Collect 100+ stickers in one playthrough
    if (stickersCollected >= 100) {
      unlockAchievement(4);
    }
    
    // STICKER GOAT - Collect 150+ stickers in one playthrough
    if (stickersCollected >= 150) {
      unlockAchievement(5);
    }
    
    // IRON GOAT - Complete game without losing a single life (never hit once)
    if (!currentRunTracking.hitTaken) {
      unlockAchievement(6);
    }
    
    // GOAT STATUS - Score 20,000+ points in one playthrough
    if (points >= 20000) {
      unlockAchievement(7);
    }
    
    // ===== ARCADE: DO NOT change state here - keep as FINAL_LEVEL so boss can fall =====
    // State will be changed to WIN then CREDITS when boss falls off screen
    // state = STATE.WIN; // MOVED to startCreditsSequence()
    
    // ===== ARCADE: DO NOT show name entry yet - credits sequence will handle this =====
    // The credits sequence will start when boss falls off screen
    // showArcadeNameEntry(true); // COMMENTED OUT - called from credits sequence instead
    // ===== END ARCADE =====
    
    // If no achievements were unlocked, show high score banner immediately
    if (achievementQueue.length === 0 && newHighScoreTimer > 0 && highScoreBanner) {
      highScoreBanner.classList.add("show");
    }
    
    // Reset name input form
    if (nameInput) {
      nameInput.value = "";
      nameInput.disabled = false;
      // Removed autofocus to prevent mobile keyboard from auto-opening
    }
    if (statusMessage) statusMessage.textContent = "";
    if (submitNameBtn) submitNameBtn.disabled = false;
  }

  function beginFinalLevel() {
    state = STATE.FINAL_LEVEL;
    bossIntroActive = true; // Intro sequence starting - disable pause
    // Save sticker count at the start of the boss level
    stickersAtLevelStart = stickersCollected;
    // Save points snapshot at the start of the boss level
    levelStartPoints = points;
    // Save total stickers for extra life tracking
    stickerTotalAtLevelStart = stickerTotalCollected;
    // Reset per-level sticker counter
    stickersThisLevel = 0;
    
    // Clear powerup effects when entering boss level
    scoreMultiplier = 1;
    powerupEffectEndTime = 0;
    activePowerupType = null;
    drunkWobblePhase = 0;
    drunkGhostWobblePhase = 0;
    powerupStickers = []; // Clear any remaining powerup stickers
    
    // Clear TIME WARP effect
    mainGameTimeWarpActive = false;
    mainGameTimeWarpTimer = 0;
    mainGameTimeWarpBeepTimer = 0;
    
    // Clear any shield invulnerability timers (keep shield count)
    mainGameShieldInvulnerable = false;
    mainGameShieldInvulnerableTimer = 0;
    mainGameShieldHitFreeze = false;
    mainGameShieldHitFreezeTimer = 0;
    
    // Reset music to main track if a powerup variant was playing
    if (currentTrack === 'main2X' || currentTrack === 'mainTurnt') {
      switchMusicTrack('main').catch(err => console.warn('Failed to reset music:', err));
    }
    // Restore music volume (in case TIME WARP lowered it)
    if (musicGain) {
      musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
    }
    
    // Reset player state
    playerX = W / 2;
    playerIsCrashed = false; // Reset player crash state
    playerRotation = 0; // Reset visual rotation
    playerTargetRotation = 0;
    holdDir = 0;
    keysPressed = { left: false, right: false };
    
    // Reset game objects
    obstacles = [];
    stickers = [];
    spawnTimer = 0;
    earthActive = false;
    
    // Reset ALL boss state variables
    bossPhase = 0; // 0 = entering
    bossY = -150;  // Start off-screen above
    bossAngle = 0;
    bossBlinkTimer = 0;
    bossShowBren2 = false;
    bossArmedAsteroids = [];
    bossArmTimer = 0;
    bossThrowTimer = 0;
    bossAttackCount = 0; // Reset attack counter to start from wave 1
    bossVictoryTimer = 0;
    bossEnterTimer = 0;
    bossHapticFired = false; // Reset haptic flag for new boss fight
    
    // Start boss music when first overlay appears
    playMusic('boss', { loop: true, volume: 0.5 }).catch(err => {
      console.warn("Failed to start boss music:", err);
    });
    
    // BOSS INTRO CUTSCENE SEQUENCE:
    // 1. Show warnings with boss descending on canvas: ALERT! -> DANGER! -> INCOMING!
    // 2. Show boss name card with shake effect (2s)
    // 3. Boss continues entrance
    
    // Step 1: Start boss descent during warnings (boss visible on canvas)
    // Boss starts high above screen and descends slowly during warnings
    bossY = -300; // Start higher for dramatic entrance
    state = STATE.FINAL_LEVEL; // Set state so boss renders
    
    const bossWarnings = ["ALERT!", "DANGER!", "INCOMING!"];
    let warningIndex = 0;
    
    const showNextWarning = () => {
      if (warningIndex < bossWarnings.length) {
        showOnlyOverlay("countdown");
        countdownText.textContent = bossWarnings[warningIndex];
        countdownText.classList.add("bossWarning");
        
        // Play level display sound for each warning
        playSfx(assets.levelDisplay, performance.now(), 0);
        
        warningIndex++;
        setTimeout(() => {
          showOnlyOverlay(null);
          countdownText.classList.remove("bossWarning");
          
          if (warningIndex < bossWarnings.length) {
            setTimeout(showNextWarning, 200); // Brief pause between warnings
          } else {
            // Step 2: After warnings, show boss name card
            setTimeout(() => {
              showOnlyOverlay("bossIntro");
              shakeTimer = 0.5; // Shake for 500ms
              triggerHaptic([200, 100, 200]); // Triple vibration burst
              playSfx(assets.hit, performance.now(), 0.7); // Dramatic impact sound
              
              // After boss name card, hide text
              setTimeout(() => {
                bossIntroOverlay.classList.remove("show"); // Direct removal (avoid 20 DOM ops)
                
                // End intro
                setTimeout(() => {
                  bossIntroActive = false; // Intro complete - re-enable pause
                  
                  // If boss has reached position but waiting for intro to end, start attack now
                  if (state === STATE.FINAL_LEVEL && bossPhase === 0 && bossY >= BOSS_Y_STOP) {
                    bossPhase = 1;
                    requestAnimationFrame(() => startBossAttack()); // Defer to next frame for smooth transition
                  }
                }, 800); // Increased to 800ms for mobile performance
              }, 2000);
            }, 500); // Brief pause before name card
          }
        }, 800); // Show each warning for 800ms
      }
    };
    
    showNextWarning();
  }

  function updateBoss(dt) {
    // Skip boss updates during shield hit freeze
    if (mainGameShieldHitFreeze) return;
    
    // Update boss text timer
    if (bossTextTimer > 0) {
      bossTextTimer -= dt;
      if (bossTextTimer < 0) {
        bossTextTimer = 0;
        bossText = "";
      }
    }
    
    // Phase 0: Boss entrance - descend from top
    if (bossPhase === 0) {
      if (bossY < BOSS_Y_STOP) {
        // Trigger boss start haptic once at the start of descent
        if (!bossHapticFired) {
          triggerHaptic([800, 200, 800, 200, 800]);
          bossHapticFired = true;
        }
        bossY += BOSS_ENTER_SPEED * dt;
        if (bossY >= BOSS_Y_STOP) {
          bossY = BOSS_Y_STOP;
          // Don't start attack phase until intro cutscene is complete
          if (!bossIntroActive) {
            bossPhase = 1; // Move to arming phase
            startBossAttack(); // Start arming sequence
          }
        }
      }
      return;
    }
    
    // Phase 1: Arming - asteroids descending and blinking
    if (bossPhase === 1) {
      // Check if this is a phase 4 or 5 attack (rain/checkerboard pattern)
      const isNoArmPattern = bossAttackCount >= 6;
      
      if (isNoArmPattern) {
        // Skip arming for rain/checkerboard patterns - go straight to throwing
        throwBossAsteroids();
        return;
      }
      
      // Blink animation (toggle between bren1 and bren2) while arming
      const isArming = bossArmedAsteroids.some(a => !a.armed);
      if (isArming) {
        bossBlinkTimer += dt;
        if (bossBlinkTimer >= BOSS_BLINK_INTERVAL) {
          bossBlinkTimer = 0;
          bossShowBren2 = !bossShowBren2;
          
          // Show random taunt when switching to bren2
          if (bossShowBren2) {
            const randomIndex = Math.floor(Math.random() * BOSS_TAUNTS.length);
            bossText = BOSS_TAUNTS[randomIndex];
            bossTextTimer = BOSS_TEXT_DURATION;
            
            // Play audio every 2-3 taunts
            bossTauntCounter++;
            const playAudioThreshold = 2 + Math.floor(Math.random() * 2); // Random 2 or 3
            if (bossTauntCounter >= playAudioThreshold) {
              bossTauntCounter = 0;
              const audioKey = BOSS_TAUNT_AUDIO[bossText];
              if (audioKey && assets[audioKey]) {
                playSfx(assets[audioKey], performance.now(), 0);
              }
            }
          }
        }
      } else {
        // All armed, stop blinking and show only bren1
        bossShowBren2 = false;
      }
      
      // Arm asteroids (descend to position)
      for (const ast of bossArmedAsteroids) {
        if (!ast.armed && ast.y < BOSS_ARM_Y) {
          ast.y += BOSS_ARM_SPEED * dt;
          if (ast.y >= BOSS_ARM_Y) {
            ast.y = BOSS_ARM_Y;
            ast.armed = true;
          }
        }
        
        // Update wiggle animation
        if (ast.wiggling) {
          ast.wiggleTimer += dt;
        }
      }
      
      // Check if all armed
      const allArmed = bossArmedAsteroids.length > 0 && bossArmedAsteroids.every(a => a.armed);
      if (allArmed && !bossArmedAsteroids.some(a => a.thrown)) {
        bossArmTimer += dt;
        if (bossArmTimer >= BOSS_ARM_DELAY) {
          // Ready to throw!
          throwBossAsteroids();
        }
      }
    }
    
    // Phase 2: Throwing - asteroids are being thrown
    if (bossPhase === 2) {
      // Update wiggle animation for wiggling asteroids
      for (const ast of bossArmedAsteroids) {
        if (ast.wiggling) {
          ast.wiggleTimer += dt;
        }
      }
      
      // Move thrown asteroids downward
      for (const ast of bossArmedAsteroids) {
        if (ast.thrown && ast.active) {
          ast.y += BOSS_THROW_SPEED * dt;
          ast.angle += ast.spin;
          
          // PERFORMANCE: Mark as inactive instead of filtering (reduces GC pressure)
          if (ast.y >= H + 200) {
            ast.active = false;
          }
        }
      }
      
      // Check if all thrown asteroids are gone (off-screen)
      // During arming: asteroids have thrown=false, so they won't trigger this
      // During/after throwing: only trigger when all thrown asteroids are inactive
      const thrownAsteroids = bossArmedAsteroids.filter(a => a.thrown);
      const activeThrownAsteroids = thrownAsteroids.filter(a => a.active);
      
      if (thrownAsteroids.length > 0 && activeThrownAsteroids.length === 0 && bossPhase === 2) {
        
        // Clear the array for next attack and set phase to 3
        bossArmedAsteroids = [];
        bossPhase = 3;
        
        // Award wave completion bonus
        points += 200;
        updateHud();
        
        // Check if we should run another attack
        bossAttackCount++;
        if (bossAttackCount < 10) {
          // Run another attack wave (2 phase 1, 2 phase 2, 2 phase 3, 2 phase 4, 2 phase 5 attacks)
          setTimeout(() => {
            bossPhase = 1;
            startBossAttack();
          }, 1500); // 1.5 second pause between attacks
        } else {
          // All waves complete - trigger victory sequence
          bossPhase = 4; // Victory phase (triggers bren3.webp)
          bossShowBren2 = false;
          
          // Process win immediately (achievements, stats, etc.)
          handleWin();
          
          // Stop boss music immediately
          stopMusic();
          
          // Play "NOOOOO!" sound when boss is defeated
          playSfx(assets.nooooo, performance.now(), 0);
          
          // Show "NOOOOOO!" text when boss is defeated
          bossText = "NOOOOOO!";
          bossTextTimer = BOSS_TEXT_DURATION;
          
          // Wait for nooooo sound to finish before starting win music (3 seconds)
          setTimeout(() => {
            playMusic('win', { 
              loop: false, 
              volume: 0.6
              // NO onEnded callback - credit music will play when fade to white starts
            }).catch(err => {
              console.warn("Failed to start win music:", err);
            });
          }, 3000); // Wait 3 seconds for nooooo sound to finish
        }
      }
    }
    
    // Phase 4: Victory - boss defeated!
    if (bossPhase === 4) {
      // Boss falls down and spins
      bossY += 200 * dt; // Fall speed
      bossAngle = (bossAngle || 0) + 3 * dt; // Spin
      
      // Check if boss has fallen off screen
      if (bossY > H + 150) {
        // Boss is gone - handleWin was already called, now start credits sequence
        // Start credits sequence instead of immediately showing name entry
        startCreditsSequence();
        bossPhase = 5; // Prevent this from running again
      }
    }
  }
  
  function startBossAttack() {
    bossArmTimer = 0;
    bossArmedAsteroids = [];
    
    // Create 5 evenly spaced asteroids with margins
    const leftEdge = 40;
    const rightEdge = 320;
    const totalSpan = rightEdge - leftEdge;
    const spacing = totalSpan / 4; // Divide into 4 segments for 5 positions
    
    for (let i = 0; i < 5; i++) {
      const x = leftEdge + spacing * i;
      bossArmedAsteroids.push({
        x,
        y: -100 - i * 20, // Stagger starting positions
        armed: false,
        thrown: false,
        active: false,
        isCrashed: false,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() < 0.5 ? -1 : 1) * 0.03,
        throwTimer: undefined,
        wiggling: false,
        wiggleTimer: 0
      });
    }
  }

  function throwBossAsteroids() {
    // Blink bren2 once and show taunt
    bossShowBren2 = true;
    const randomIndex = Math.floor(Math.random() * BOSS_TAUNTS.length);
    bossText = BOSS_TAUNTS[randomIndex];
    bossTextTimer = BOSS_TEXT_DURATION;
    
    // Play audio every 2-3 taunts
    bossTauntCounter++;
    const playAudioThreshold = 2 + Math.floor(Math.random() * 2); // Random 2 or 3
    if (bossTauntCounter >= playAudioThreshold) {
      bossTauntCounter = 0;
      const audioKey = BOSS_TAUNT_AUDIO[bossText];
      if (audioKey && assets[audioKey]) {
        playSfx(assets[audioKey], performance.now(), 0);
      }
    }
    
    setTimeout(() => {
      bossShowBren2 = false;
      
      // Select random asteroids to throw
      const available = bossArmedAsteroids.filter(a => !a.thrown);
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      
      // Determine how many to throw first based on attack count
      let firstBatchCount;
      if (bossAttackCount < 2) {
        firstBatchCount = 2; // Phase 1: throw 2 first
      } else if (bossAttackCount < 4) {
        firstBatchCount = 3; // Phase 2: throw 3 first
      } else if (bossAttackCount < 6) {
        firstBatchCount = 4; // Phase 3: throw 4 first
      } else {
        firstBatchCount = 0; // Phase 4: no wiggling, rain pattern
      }
      
      // Mark asteroids for wiggling (skip for phase 4)
      for (let i = 0; i < firstBatchCount; i++) {
        shuffled[i].wiggling = true;
        shuffled[i].wiggleTimer = 0;
      }
      
      // After wiggle (300ms), throw the first batch
      setTimeout(() => {
        // Different throw patterns based on attack count
        if (bossAttackCount < 2) {
          // Phase 1 attacks (waves 1-2): Throw 2, then 3
          for (let i = 0; i < 2; i++) {
            shuffled[i].wiggling = false;
            shuffled[i].thrown = true;
            shuffled[i].active = true;
          }
          
          // Throw remaining 3 after 1 second
          setTimeout(() => {
            for (let i = 2; i < shuffled.length; i++) {
              shuffled[i].thrown = true;
              shuffled[i].active = true;
            }
          }, 1000);
          
        } else if (bossAttackCount < 4) {
          // Phase 2 attacks (waves 3-4): Throw 3, then 2 (quicker)
          for (let i = 0; i < 3; i++) {
            shuffled[i].wiggling = false;
            shuffled[i].thrown = true;
            shuffled[i].active = true;
          }
          
          // Throw remaining 2 after 600ms (quicker than phase 1)
          setTimeout(() => {
            for (let i = 3; i < shuffled.length; i++) {
              shuffled[i].thrown = true;
              shuffled[i].active = true;
            }
          }, 600);
          
        } else if (bossAttackCount < 6) {
          // Phase 3 attacks (waves 5-6): Throw 4, then 1 (even faster!)
          for (let i = 0; i < 4; i++) {
            shuffled[i].wiggling = false;
            shuffled[i].thrown = true;
            shuffled[i].active = true;
          }
          
          // Throw remaining 1 after 400ms (even faster!)
          setTimeout(() => {
            for (let i = 4; i < shuffled.length; i++) {
              shuffled[i].thrown = true;
              shuffled[i].active = true;
            }
          }, 400);
          
        } else if (bossAttackCount < 8) {
          // Phase 4 attacks (waves 7-8): Rain pattern - sequential throws from top
          
          // Determine direction based on attack count
          const isLeftToRight = (bossAttackCount % 2 === 0); // Wave 7 left-to-right, wave 8 right-to-left
          const sortedByPosition = [...bossArmedAsteroids].sort((a, b) => 
            isLeftToRight ? a.x - b.x : b.x - a.x
          );
          
          // Reset asteroids to top and throw each with a staggered delay
          const rainDelay = 500; // ms between each asteroid (increased for better spacing)
          sortedByPosition.forEach((ast, index) => {
            setTimeout(() => {
              // Start from top of screen
              ast.y = -50;
              ast.thrown = true;
              ast.active = true;
            }, index * rainDelay);
          });
          
        } else {
          // Phase 5 attacks (waves 9-10): Checkerboard pattern (repeated twice)
          
          // Sort asteroids by position (left to right)
          const sortedByPosition = [...bossArmedAsteroids].sort((a, b) => a.x - b.x);
          
          // Determine which pattern based on attack count
          const isOddFirst = (bossAttackCount % 2 === 0); // Wave 9: 1,3,5 first. Wave 10: 2,4 first
          
          // We need to track when asteroids were thrown to create duplicates
          // Since we only have 5 asteroids, we'll reuse them by resetting after they fall
          
          // Pattern repeats twice: batch1 -> batch2 -> batch1 -> batch2
          const delays = [0, 500, 1000, 1500]; // Timing for each of the 4 drops
          
          // First cycle (0ms and 500ms)
          sortedByPosition.forEach((ast, index) => {
            const isOddIndex = (index % 2 === 1); // indices 1, 3 are odd (asteroids 2, 4)
            const isEvenIndex = (index % 2 === 0); // indices 0, 2, 4 are even (asteroids 1, 3, 5)
            
            if ((isOddFirst && isEvenIndex) || (!isOddFirst && isOddIndex)) {
              // First batch asteroids - drop at 0ms and 1000ms
              setTimeout(() => {
                ast.y = -50;
                ast.thrown = true;
                ast.active = true;
              }, 0);
              
            } else {
              // Second batch asteroids - drop at 500ms and 1500ms
              setTimeout(() => {
                ast.y = -50;
                ast.thrown = true;
                ast.active = true;
              }, 500);
            }
          });
          
          // Create NEW asteroid objects for the second cycle
          // We'll add them to the array after a delay
          setTimeout(() => {
            sortedByPosition.forEach((ast, index) => {
              const isOddIndex = (index % 2 === 1);
              const isEvenIndex = (index % 2 === 0);
              
              if ((isOddFirst && isEvenIndex) || (!isOddFirst && isOddIndex)) {
                // First batch - drop at 1000ms
                bossArmedAsteroids.push({
                  x: ast.x,
                  y: -50,
                  armed: false,
                  thrown: true,
                  active: true,
                  isCrashed: false,
                  angle: Math.random() * Math.PI * 2,
                  spin: (Math.random() < 0.5 ? -1 : 1) * 0.03,
                  wiggling: false,
                  wiggleTimer: 0
                });
              }
            });
          }, 1000);
          
          setTimeout(() => {
            sortedByPosition.forEach((ast, index) => {
              const isOddIndex = (index % 2 === 1);
              const isEvenIndex = (index % 2 === 0);
              
              if ((isOddFirst && isOddIndex) || (!isOddFirst && isEvenIndex)) {
                // Second batch - drop at 1500ms
                bossArmedAsteroids.push({
                  x: ast.x,
                  y: -50,
                  armed: false,
                  thrown: true,
                  active: true,
                  isCrashed: false,
                  angle: Math.random() * Math.PI * 2,
                  spin: (Math.random() < 0.5 ? -1 : 1) * 0.03,
                  wiggling: false,
                  wiggleTimer: 0
                });
              }
            });
          }, 1500);
        }
      }, 300); // Wiggle for 300ms before throwing
      
    }, 200); // Show bren2 for 200ms then switch back
    
    bossPhase = 2; // Move to throwing phase
  }

  function nextSpawnDelay() {
    return SPAWN_MIN + rand() * (SPAWN_MAX - SPAWN_MIN);
  }

  function scaledDimsPreserveAspect(img, targetLongSide) {
    const iw = img.width;
    const ih = img.height;
    const long = Math.max(iw, ih);
    const scale = targetLongSide / long;
    return { w: iw * scale, h: ih * scale };
  }

  function spawnAsteroidAt(x, y, isBig) {
    // Use konami assets if in secret level
    let img, hitImg, asteroidType;
    if (isKonamiLevel) {
      if (isBig) {
        // 95% pyramid, 5% sphinx (VERY rare)
        img = rand() < 0.95 ? assets.pyramid : assets.sphynx;
      } else {
        // Always boulder for small obstacles
        img = assets.boulder;
      }
      hitImg = null; // Konami assets don't have hit states
      asteroidType = null; // No type tracking for konami
    } else {
      // Get level-specific asteroid colors
      let levelAsteroids;
      if (state === STATE.FINAL_LEVEL) {
        // Boss level: randomly pick a color palette for each asteroid
        const bossColorIndex = Math.floor(rand() * BOSS_COLOR_PALETTES.length);
        levelAsteroids = asteroidsByLevel[`boss_${bossColorIndex}`] || asteroidsByLevel[0];
      } else {
        levelAsteroids = getAsteroidsForLevel(currentLevel);
      }
      
      // Normal game asteroids - randomly select type and assign hit state
      if (isBig) {
        const choice = Math.floor(rand() * 3);
        if (choice === 0) {
          img = levelAsteroids.asteroid1;
          hitImg = levelAsteroids.asteroid1Hit;
          asteroidType = 'ast1';
        } else if (choice === 1) {
          img = levelAsteroids.asteroid2;
          hitImg = levelAsteroids.asteroid2Hit;
          asteroidType = 'ast2';
        } else {
          img = levelAsteroids.asteroid3;
          hitImg = levelAsteroids.asteroid3Hit;
          asteroidType = 'ast3';
        }
      } else {
        // Randomly pick from the 3 small asteroid variants
        const smallChoice = Math.floor(rand() * levelAsteroids.asteroidSmall.length);
        img = levelAsteroids.asteroidSmall[smallChoice];
        hitImg = null; // No hit state for small asteroids
        asteroidType = 'small';
      }
    }

    // Use discrete sizes - ast3 gets special sizing to spawn mostly at full size
    let targetLongSide;
    if (isBig) {
      // For ast3 (the large cigar), use ASTEROID_LARGE_SIZES which heavily favors 192px
      // For ast1/ast2, use ASTEROID_MEDIUM_SIZES for more variety
      targetLongSide = (asteroidType === 'ast3') 
        ? pick(ASTEROID_LARGE_SIZES, rand)
        : pick(ASTEROID_MEDIUM_SIZES, rand);
    } else {
      targetLongSide = pick(ASTEROID_SMALL_SIZES, rand);
    }

    const { w, h } = scaledDimsPreserveAspect(img, targetLongSide);

    // No spinning for levels 1-3 to improve performance
    // Asteroids spawn with a random rotation but stay locked in position
    const spin = 0;

    // 140° rotation range (±70° from vertical) for consistent top-down lighting
    const angle = (rand() - 0.5) * 2.44; // 2.44 radians ≈ 140°

    // Elliptical hitbox - use separate radii for width and height
    const rx = w * (isBig ? 0.36 : 0.34);
    const ry = h * (isBig ? 0.36 : 0.34);

    // Get particle color for this asteroid
    const particleColor = isKonamiLevel ? '#c7005a' : getCurrentAsteroidParticleColor();

    obstacles.push({ img, hitImg, x, y, w, h, angle, spin, rx, ry, active: true, isCrashed: false, particleColor });
  }

  function spawnWave() {
    const y = -170;
    const isBig1 = rand() < BIG_ASTEROID_CHANCE;
    const x1 = clamp(PLAYER_MARGIN + rand() * (W - PLAYER_MARGIN*2), PLAYER_MARGIN, W - PLAYER_MARGIN);
    spawnAsteroidAt(x1, y, isBig1);

    if (rand() < DOUBLE_SPAWN_CHANCE) {
      const isBig2 = rand() < BIG_ASTEROID_CHANCE * 0.9;
      const offset = (rand() < 0.5 ? -1 : 1) * (60 + rand() * 90);
      const x2 = clamp(x1 + offset, PLAYER_MARGIN, W - PLAYER_MARGIN);
      spawnAsteroidAt(x2, y - 70, isBig2);
    }

    // Sticker spawn chance - higher in survival mode
    const stickerChance = gameMode === "SURVIVAL" ? 0.75 : STICKER_SPAWN_CHANCE;
    if (stickerRng() < stickerChance) {
      // Determine if this is a thick sticker (rare)
      const isThick = stickerRng() < THICK_STICKER_CHANCE;
      
      // Position: thick stickers spawn near edges (harder to reach)
      let sx;
      if (isThick) {
        // Spawn in outer 25% of screen (left or right edge)
        sx = stickerRng() < 0.5 
          ? PLAYER_MARGIN + stickerRng() * (W * 0.25)           // Left edge
          : W - PLAYER_MARGIN - stickerRng() * (W * 0.25);      // Right edge
      } else {
        // Normal stickers spawn anywhere
        sx = clamp(PLAYER_MARGIN + stickerRng() * (W - PLAYER_MARGIN*2), PLAYER_MARGIN, W - PLAYER_MARGIN);
      }
      const sy = -(70 + stickerRng() * 180);

      const stickerImg = isThick ? assets.thickSticker : assets.sticker;
      
      const iw = stickerImg.width;
      const ih = stickerImg.height;
      const scale = STICKER_TARGET_W / iw;
      const w = iw * scale;
      const h = ih * scale;

      stickers.push({
        x: sx, y: sy, w, h,
        angle: (stickerRng() - 0.5) * STICKER_ROT_RANGE,
        collected: false,
        active: true,
        isThick: isThick
      });
    }
  }

  function attemptSpawnPowerupSticker() {
    // Get the configured powerups for this level
    const levelPowerups = LEVEL_POWERUPS[currentLevel] || ["2X", "DRUNK"]; // Fallback to default
    
    // Determine which powerup to spawn based on spawn order
    let powerupType;
    if (powerupsSpawnedThisLevel.length === 0) {
      // First powerup: use first configured powerup
      powerupType = levelPowerups[0];
    } else if (powerupsSpawnedThisLevel.length === 1) {
      // Second powerup: use second configured powerup
      powerupType = levelPowerups[1];
    } else {
      // Safety: should never spawn more than 2, but fallback to random if somehow triggered
      powerupType = levelPowerups[powerupsSpawnedThisLevel.length % levelPowerups.length];
    }
    powerupsSpawnedThisLevel.push(powerupType);

    // Random horizontal position
    const px = clamp(PLAYER_MARGIN + powerupRng() * (W - PLAYER_MARGIN*2), PLAYER_MARGIN, W - PLAYER_MARGIN);
    const py = -(70 + powerupRng() * 180);

    // Select image based on type
    let powerupImg;
    if (powerupType === "2X") {
      powerupImg = assets.powerupTwoX;
    } else if (powerupType === "DRUNK") {
      powerupImg = assets.powerupDrunk;
    } else if (powerupType === "SHIELD") {
      powerupImg = assets.powerupShield;
    } else if (powerupType === "TIME") {
      powerupImg = assets.powerupTime;
    }

    const iw = powerupImg.width;
    const ih = powerupImg.height;
    const scale = STICKER_TARGET_W / iw;
    const w = iw * scale;
    const h = ih * scale;

    powerupStickers.push({
      type: powerupType,
      img: powerupImg,
      x: px,
      y: py,
      w,
      h,
      collected: false,
      angle: (powerupRng() - 0.5) * Math.PI * 2, // Random rotation
      pulsePhase: 0
    });
  }
  
  function spawnShieldPowerup() {
    // Guaranteed SHIELD spawn in first 5 seconds of each level
    const powerupType = "SHIELD";
    
    // Random horizontal position
    const px = clamp(PLAYER_MARGIN + powerupRng() * (W - PLAYER_MARGIN*2), PLAYER_MARGIN, W - PLAYER_MARGIN);
    const py = -(70 + powerupRng() * 180);
    
    const powerupImg = assets.powerupShield;
    
    const iw = powerupImg.width;
    const ih = powerupImg.height;
    const scale = STICKER_TARGET_W / iw;
    const w = iw * scale;
    const h = ih * scale;
    
    powerupStickers.push({
      type: powerupType,
      img: powerupImg,
      x: px,
      y: py,
      w,
      h,
      collected: false,
      angle: (powerupRng() - 0.5) * Math.PI * 2, // Random rotation
      pulsePhase: 0
    });
  }
  
  function spawnSurvivalPowerup() {
    // Survival mode only spawns magnet powerups (2X type)
    const powerupType = "2X";
    
    // Spawn at center X position (consistent every time)
    const px = W / 2;
    const py = -(70 + powerupRng() * 180);
    
    const powerupImg = assets.powerupTwoX;
    
    const iw = powerupImg.width;
    const ih = powerupImg.height;
    const scale = STICKER_TARGET_W / iw;
    const w = iw * scale;
    const h = ih * scale;
    
    powerupStickers.push({
      type: powerupType,
      img: powerupImg,
      x: px,
      y: py,
      w,
      h,
      collected: false,
      angle: (powerupRng() - 0.5) * Math.PI * 2,
      pulsePhase: 0
    });
  }

  function spawnSurvivalShield() {
    // Spawn shield powerup in survival mode
    const powerupType = "SHIELD";
    
    // Random X position within center 120px (120-240)
    const px = 120 + (powerupRng() * 120);
    const py = -(70 + powerupRng() * 180);
    
    const powerupImg = assets.powerupShield;
    
    const iw = powerupImg.width;
    const ih = powerupImg.height;
    const scale = STICKER_TARGET_W / iw;
    const w = iw * scale;
    const h = ih * scale;
    
    powerupStickers.push({
      type: powerupType,
      img: powerupImg,
      x: px,
      y: py,
      w,
      h,
      collected: false,
      angle: (powerupRng() - 0.5) * Math.PI * 2,
      pulsePhase: 0
    });
  }

  function spawnSurvivalTime() {
    // Spawn time warp powerup in survival mode
    const powerupType = "TIME";
    
    // Random X position within center 120px (120-240)
    const px = 120 + (powerupRng() * 120);
    const py = -(70 + powerupRng() * 180);
    
    const powerupImg = assets.powerupTime;
    
    const iw = powerupImg.width;
    const ih = powerupImg.height;
    const scale = STICKER_TARGET_W / iw;
    const w = iw * scale;
    const h = ih * scale;
    
    powerupStickers.push({
      type: powerupType,
      img: powerupImg,
      x: px,
      y: py,
      w,
      h,
      collected: false,
      angle: (powerupRng() - 0.5) * Math.PI * 2,
      pulsePhase: 0
    });
  }

  function moveLeft() {
    playerX = clamp(playerX - PLAYER_STEP, PLAYER_MARGIN, W - PLAYER_MARGIN);
    playSfx(assets.move, performance.now(), 60);
  }

  function moveRight() {
    playerX = clamp(playerX + PLAYER_STEP, PLAYER_MARGIN, W - PLAYER_MARGIN);
    playSfx(assets.move, performance.now(), 60);
  }

  // ===== KONAMI CODE DETECTION =====
  function checkKonamiInput(key) {
    // Only track on title screen (when title overlay is showing)
    const onTitleScreen = titleOverlay && titleOverlay.classList.contains('show');
    if (!onTitleScreen) return;
    
    const expectedKey = KONAMI_SEQUENCE[konamiProgress.length];
    
    if (key === expectedKey) {
      konamiProgress.push(key);
      
      // Check if sequence is complete
      if (konamiProgress.length === KONAMI_SEQUENCE.length) {
        // Play success sound and start secret level directly
        playSfx(assets.hit, performance.now(), 100);
        konamiProgress = []; // Reset for next time
        
        // Start secret level immediately (no overlay)
        unlockAudio();
        beginSecretLevel();
      }
    } else {
      // Wrong input - reset progress
      konamiProgress = [];
    }
  }

  function onTouchStart(e) {
    if (state !== STATE.TITLE) return;
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function onTouchEnd(e) {
    if (state !== STATE.TITLE) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Determine swipe direction
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Check if swipe meets threshold
    if (absDeltaX < SWIPE_THRESHOLD && absDeltaY < SWIPE_THRESHOLD) {
      return; // Not a swipe, just a tap
    }
    
    // Determine primary direction
    let direction = null;
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    if (direction) {
      checkKonamiInput(direction);
    }
  }

  // Konami overlay functions removed - now starts directly

  function resetKonamiCode() {
    konamiProgress = [];
  }
  // ===== END KONAMI CODE DETECTION =====

  function onPointerDown(e) {
    // Allow input fields and buttons to work normally
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') {
      return; // Don't prevent default for inputs and buttons
    }
    
    e.preventDefault();

    const rect = shell.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const half = rect.width / 2;

    if (state === STATE.TITLE) {
      // Title screen handled by button click, not pointer down
      return;
    }

    if (state === STATE.START) {
      lives = LIVES_START;
      stickersCollected = 0;  // Reset stickers only when starting new game
      stickerTotalCollected = 0; // Reset total sticker tracker
      stickersThisLevel = 0; // Reset per-level sticker counter
      stickersAtLevelStart = 0; // Reset level start tracker
      points = 0; // Reset points
      levelStartPoints = 0; // Reset level start points
      lastSecondTick = 0; // Reset time tracking
      currentLevel = 1;  // Start from level 1
      
      // Reset achievement tracking for new run
      currentRunTracking = {
        startLives: LIVES_START,
        bossLivesLost: 0,
        powerupsCollected: { twoX: 0, drunk: 0 },
        stickersCollected: 0,
        hitTaken: false
      };
      currentLevelPowerups = { twoX: 0, drunk: 0 };
      resetRun();
      beginCountdown(1);
      return;
    }

    if (state === STATE.COUNTDOWN || state === STATE.OUT_OF_TIME) return;

    if (state === STATE.PLAY || state === STATE.FINAL_LEVEL) {
      // Hide gesture tutorial on first interaction
      if (gestureTutorial && gestureTutorial.style.display !== 'none') {
        hideGestureTutorial();
      }
      
      // Check if tap is in HUD area (top region)
      const hudHeightScaled = (HUD_HEIGHT / H) * rect.height;
      if (localY <= hudHeightScaled) {
        // Tapped in HUD area - pause disabled for arcade cabinet
        // if (!bossIntroActive) {
        //   pauseGame();
        // }
        return;
      }

      // Determine direction and start holding
      const dir = (localX < half) ? -1 : 1;
      // If this is a new press in that direction, trigger the move sound
      if (holdDir !== dir) {
        if (dir === -1) playSfx(assets.move, performance.now(), 60);
        else playSfx(assets.move, performance.now(), 60);
      }
      holdDir = dir;
    }
  }

  function onPointerUp(e) {
    // Stop holding on pointer up/cancel
    holdDir = 0;
  }

  function onKeyDown(e) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
    
    // ===== DEBUG: Press 'A' to immediately activate attract mode =====
    if (e.key === 'a' || e.key === 'A') {
      console.log('[DEBUG] Activating attract mode immediately...');
      startAttractMode();
      return;
    }
    // ===== END DEBUG =====
    
    // ===== DEBUG: Press '9' to jump to credits for testing =====
    if (e.key === '9') {
      console.log('[DEBUG] Jumping to credits sequence...');
      state = STATE.FINAL_LEVEL;
      startCreditsSequence();
      return;
    }
    // ===== END DEBUG =====
    
    // ===== INTRO SKIP: Press Enter to skip intro sequence =====
    if (e.key === "Enter" && introSequencePlaying) {
      e.preventDefault();
      skipIntroSequence();
      return;
    }
    // ===== END INTRO SKIP =====
    
    // ===== CREDITS: Press Enter to show name entry during credits =====
    if (e.key === "Enter" && creditsSequencePlaying && creditsPhase === 2) {
      e.preventDefault();
      skipCreditsSequence();
      return;
    }
    // ===== END CREDITS NAME ENTRY =====
    
    // ===== ARCADE: "S" key opens settings from menu only =====
    if ((e.key === 's' || e.key === 'S') && menuOverlay && menuOverlay.classList.contains('show')) {
      e.preventDefault();
      if (settingsOverlay) {
        showOnlyOverlay("settings");
        // Update keyboard navigation for settings overlay
        setTimeout(() => updateNavigableButtons('settings'), 50);
      }
      return;
    }
    // ===== END ARCADE =====
    
    // ========== KEYBOARD MENU NAVIGATION ==========
    // Only handle navigation keys when not in gameplay OR when paused
    // Exception: Allow during CREDITS if name entry or leaderboard overlay is showing
    const nameEntryShowing = arcadeNameEntryOverlay && arcadeNameEntryOverlay.classList.contains('show');
    const leaderboardShowing = leaderboardOverlay && leaderboardOverlay.classList.contains('show');
    if ((state !== STATE.PLAY && state !== STATE.FINAL_LEVEL && state !== STATE.COUNTDOWN && state !== STATE.CREDITS) || isPaused || (state === STATE.CREDITS && (nameEntryShowing || leaderboardShowing))) {
      // ===== ARCADE: Handle arcade name entry navigation =====
      if (arcadeNameEntryOverlay && arcadeNameEntryOverlay.classList.contains('show')) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          arcadeNavigateUp();
          return;
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          arcadeNavigateDown();
          return;
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          arcadeNavigateLeft();
          return;
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          arcadeNavigateRight();
          return;
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          arcadeActivateSelected();
          return;
        }
      }
      // ===== END ARCADE NAME ENTRY NAV =====
      
      // ===== ARCADE: Handle leaderboard scrolling with arrow keys =====
      if (leaderboardOverlay && leaderboardOverlay.classList.contains('show')) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (leaderboardList) {
            leaderboardList.scrollBy({ top: -50, behavior: 'smooth' });
          }
          return;
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (leaderboardList) {
            leaderboardList.scrollBy({ top: 50, behavior: 'smooth' });
          }
          return;
        }
      }
      // ===== END LEADERBOARD SCROLLING =====
      
      // Check if we're on title screen for Konami code (title overlay showing, not menu)
      const onTitleScreen = titleOverlay && titleOverlay.classList.contains('show');
      const onMenuOrOtherOverlay = !onTitleScreen;
      
      if (e.key === "ArrowUp") {
        e.preventDefault();
        // Only trigger Konami on actual title screen, not menu
        if (onTitleScreen) {
          checkKonamiInput('up');
        } else {
          navigateUp();
        }
        return;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        // Only trigger Konami on actual title screen, not menu
        if (onTitleScreen) {
          checkKonamiInput('down');
        } else {
          navigateDown();
        }
        return;
      } else if (e.key === "ArrowLeft") {
        // Try to handle slider navigation first
        if (handleSliderNavigation(-1)) {
          e.preventDefault();
          return;
        }
        // Otherwise check for konami code on title screen only
        if (onTitleScreen) {
          checkKonamiInput('left');
          return;
        }
        // Otherwise navigate left
        e.preventDefault();
        navigateLeft();
        return;
      } else if (e.key === "ArrowRight") {
        // Try to handle slider navigation first
        if (handleSliderNavigation(1)) {
          e.preventDefault();
          return;
        }
        // Otherwise check for konami code on title screen only
        if (onTitleScreen) {
          checkKonamiInput('right');
          return;
        }
        // Otherwise navigate right
        e.preventDefault();
        navigateRight();
        return;
      } else if (e.key === " " || e.key === "Enter") {
        // Check for Konami code spacebar/enter on title screen ONLY if we're in the sequence
        if (onTitleScreen) {
          // Only intercept spacebar if we've completed the first 8 arrow keys
          if (e.key === " " && konamiProgress.length === 8) {
            checkKonamiInput('space');
            return;
          }
          // Only intercept enter if we've completed spacebar (9 inputs)
          if (e.key === "Enter" && konamiProgress.length === 9) {
            checkKonamiInput('enter');
            return;
          }
          // On title screen, only Enter activates buttons (not spacebar)
          if (e.key === "Enter") {
            e.preventDefault();
            activateFocusedButton();
            return;
          }
          // Spacebar does nothing on title screen (unless part of Konami code above)
          return;
        }
        // On all other screens (menus, overlays), both spacebar and enter work
        e.preventDefault();
        activateFocusedButton();
        return;
      }
    }
    // ========== END KEYBOARD MENU NAVIGATION ==========
    
    // Escape key toggles pause during gameplay - DISABLED for arcade cabinet
    // if (e.key === "Escape") {
    //   e.preventDefault();
    //   if (state === STATE.PLAY || state === STATE.FINAL_LEVEL) {
    //     if (isPaused) {
    //       unpauseGame();
    //     } else {
    //       pauseGame();
    //     }
    //   }
    //   return;
    // }
    
    // DEBUG: Log all arrow key presses
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      console.log(`[ARROW KEY] key=${e.key}, state=${state}, creditsPhase=${creditsPhase}`);
    }
    
    // Allow movement during gameplay, boss fight, and credits
    if (state !== STATE.PLAY && state !== STATE.FINAL_LEVEL && state !== STATE.CREDITS) return;
    unlockAudio();
    if (e.key === "ArrowLeft") {
      console.log(`[KEYDOWN LEFT] state=${state}, creditsPhase=${creditsPhase}, setting holdDir=-1`);
      // only trigger once when first pressed
      if (!keysPressed.left) {
        playSfx(assets.move, performance.now(), 60);
        keysPressed.left = true;
      }
      holdDir = -1;
      leftPressed = true;
    }
    if (e.key === "ArrowRight") {
      console.log(`[KEYDOWN RIGHT] state=${state}, creditsPhase=${creditsPhase}, setting holdDir=1`);
      if (!keysPressed.right) {
        playSfx(assets.move, performance.now(), 60);
        keysPressed.right = true;
      }
      holdDir = 1;
      rightPressed = true;
    }
  }

  function onKeyUp(e) {
    if (e.key === "ArrowLeft") {
      keysPressed.left = false;
      leftPressed = false;
      // if right is still held, switch direction, otherwise stop
      holdDir = keysPressed.right ? 1 : 0;
    }
    if (e.key === "ArrowRight") {
      keysPressed.right = false;
      rightPressed = false;
      holdDir = keysPressed.left ? -1 : 0;
    }
  }

  // PLAY AGAIN on win overlay: only this button closes the Win overlay
  if (winPlayAgainBtn) {
    winPlayAgainBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      state = STATE.TITLE;
      
      // Reset keyboard navigation to prevent immediate activation
      currentNavigableButtons = [];
      focusedButtonIndex = 0;
      
      showOnlyOverlay("title");
      
      // Hide HUD when returning to title
      if (hud) hud.style.display = 'none';
      
      // Stop any playing music when returning to title
      stopMusic();
      
      // Reset name input for next game
      if (nameInput) {
        nameInput.value = "";
        nameInput.disabled = false;
      }
      if (emailInput) {
        emailInput.value = "";
        emailInput.disabled = false;
      }
      if (statusMessage) statusMessage.textContent = "";
      if (submitNameBtn) submitNameBtn.disabled = false;
    });
  }

  // Submit name to leaderboard
  if (submitNameBtn) {
    submitNameBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      const name = nameInput.value.trim();
      if (!name) {
        statusMessage.textContent = "Please enter a name!";
        statusMessage.style.color = "#ff6b6b";
        return;
      }
      
      // Check email if in WordPress environment
      if (window.STICKERSNATCH_API && window.STICKERSNATCH_API.isWordPress) {
        const email = emailInput ? emailInput.value.trim() : '';
        if (!email) {
          statusMessage.textContent = "Please enter an email!";
          statusMessage.style.color = "#ff6b6b";
          return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          statusMessage.textContent = "Please enter a valid email!";
          statusMessage.style.color = "#ff6b6b";
          return;
        }
        
        // Show submitting status
        statusMessage.textContent = "Submitting...";
        statusMessage.style.color = THEME_COLOR;
        submitNameBtn.disabled = true;
        
        // Submit to WordPress API
        const result = await submitScoreToAPI(name, email, points, stickersCollected, currentLevel);
        
        if (result.success) {
          // Also save to monthly and weekly leaderboards (local only)
          saveToMonthlyLeaderboard(name, points, stickersCollected);
          saveToWeeklyLeaderboard(name, points, stickersCollected);
          
          statusMessage.textContent = "SUCCESS! Added to leaderboard!";
          statusMessage.style.color = "#4CAF50";
          nameInput.disabled = true;
          if (emailInput) emailInput.disabled = true;
          
          // Show leaderboard overlay with ARCADE MODE and player's position
          // Small delay to ensure API has processed the submission
          await new Promise(resolve => setTimeout(resolve, 300));
          leaderboardSource = "win";
          await showLeaderboardForMode("main", name, { score: points });
        } else {
          statusMessage.textContent = result.message || "Failed to save. Try again!";
          statusMessage.style.color = "#ff6b6b";
          submitNameBtn.disabled = false;
        }
      } else {
        // Local version - use localStorage
        const success = saveToLeaderboard(name, points, stickersCollected);
        saveToMonthlyLeaderboard(name, points, stickersCollected);
        saveToWeeklyLeaderboard(name, points, stickersCollected);
        
        if (success) {
          statusMessage.textContent = "SUCCESS! Added to leaderboard!";
          statusMessage.style.color = "#4CAF50";
          nameInput.disabled = true;
          submitNameBtn.disabled = true;
          
          // Show leaderboard overlay with ARCADE MODE and player's position
          leaderboardSource = "win";
          await showLeaderboardForMode("main", name);
        } else {
          statusMessage.textContent = "Failed to save. Try again!";
          statusMessage.style.color = "#ff6b6b";
        }
      }
    });
  }

  // Allow Enter key to submit name
  if (nameInput) {
    nameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && submitNameBtn && !submitNameBtn.disabled) {
        submitNameBtn.click();
      }
    });
  }

  // ORDER STICKERS NOW button on win overlay
  if (winOrderStickersBtn) {
    winOrderStickersBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open("https://stickergoat.com/", "_blank");
    });
  }

  // SHARE SCORE button on win overlay
  if (winShareBtn) {
    winShareBtn.addEventListener("click", (e) => {
      e.preventDefault();
      shareScore();
    });
  }

  // Game Over overlay handlers
  // PLAY AGAIN on game over overlay
  if (gameOverPlayAgainBtn) {
    gameOverPlayAgainBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      state = STATE.TITLE;
      
      // Reset keyboard navigation to prevent immediate activation
      currentNavigableButtons = [];
      focusedButtonIndex = 0;
      
      showOnlyOverlay("title");
      
      // Hide HUD when returning to title
      if (hud) hud.style.display = 'none';
      
      // Stop any playing music when returning to title
      stopMusic();
      
      // Reset name input for next game
      if (gameOverNameInput) {
        gameOverNameInput.value = "";
        gameOverNameInput.disabled = false;
      }
      if (gameOverEmailInput) {
        gameOverEmailInput.value = "";
        gameOverEmailInput.disabled = false;
      }
      if (gameOverStatusMessage) gameOverStatusMessage.textContent = "";
      if (gameOverSubmitNameBtn) gameOverSubmitNameBtn.disabled = false;
    });
  }

  // ===== ARCADE NAME ENTRY BUTTON LISTENERS =====
  if (arcadeBackspaceBtn) {
    arcadeBackspaceBtn.addEventListener("click", (e) => {
      e.preventDefault();
      arcadeBackspace();
    });
  }
  
  if (arcadeEnterBtn) {
    arcadeEnterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      arcadeSubmitName();
    });
  }
  
  if (arcadeCancelBtn) {
    arcadeCancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      arcadeCancelEntry();
    });
  }
  // ===== END ARCADE NAME ENTRY LISTENERS =====

  // ===== SURVIVAL MODE GAME OVER BUTTONS =====
  
  // Survival name submit button
  if (survivalSubmitNameBtn) {
    survivalSubmitNameBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      const name = survivalNameInput.value.trim();
      
      if (!name) {
        survivalStatusMessage.textContent = "Please enter a name!";
        survivalStatusMessage.style.color = "#ff6b6b";
        return;
      }
      
      // Check email if in WordPress environment
      if (window.STICKERSNATCH_API && window.STICKERSNATCH_API.isWordPress) {
        const email = survivalEmailInput ? survivalEmailInput.value.trim() : '';
        if (!email) {
          survivalStatusMessage.textContent = "Please enter an email!";
          survivalStatusMessage.style.color = "#ff6b6b";
          return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          survivalStatusMessage.textContent = "Please enter a valid email!";
          survivalStatusMessage.style.color = "#ff6b6b";
          return;
        }
        
        // Show submitting status
        survivalStatusMessage.textContent = "Submitting...";
        survivalStatusMessage.style.color = THEME_COLOR;
        survivalSubmitNameBtn.disabled = true;
        
        // Submit to WordPress API
        const result = await submitSurvivalScoreToAPI(name, email, survivalTime, points);
        
        if (result.success) {
          // Also save to monthly and weekly leaderboards (local only for immediate display)
          saveToSurvivalMonthlyLeaderboard(name, survivalTime, points);
          saveToSurvivalWeeklyLeaderboard(name, survivalTime, points);
          
          survivalStatusMessage.textContent = "SUCCESS! Added to leaderboard!";
          survivalStatusMessage.style.color = "#4CAF50";
          survivalNameInput.disabled = true;
          if (survivalEmailInput) survivalEmailInput.disabled = true;
          
          // Show leaderboard overlay with SURVIVAL mode and player's position
          // Small delay to ensure API has processed the submission
          await new Promise(resolve => setTimeout(resolve, 300));
          leaderboardSource = "survivalgameover";
          await showLeaderboardForMode("survival", name, { score: points, time: survivalTime });
        } else {
          survivalStatusMessage.textContent = result.message || "Failed to save. Try again!";
          survivalStatusMessage.style.color = "#ff6b6b";
          survivalSubmitNameBtn.disabled = false;
        }
      } else {
        // Local version - use localStorage
        const success = saveToSurvivalLeaderboard(name, survivalTime, points);
        saveToSurvivalMonthlyLeaderboard(name, survivalTime, points);
        saveToSurvivalWeeklyLeaderboard(name, survivalTime, points);
        
        if (success) {
          survivalStatusMessage.textContent = "SUCCESS! Added to leaderboard!";
          survivalStatusMessage.style.color = "#4CAF50";
          survivalNameInput.disabled = true;
          survivalSubmitNameBtn.disabled = true;
          
          // Show leaderboard overlay with SURVIVAL mode and player's position
          leaderboardSource = "survivalgameover";
          await showLeaderboardForMode("survival", name);
        } else {
          survivalStatusMessage.textContent = "Failed to save. Try again!";
          survivalStatusMessage.style.color = "#ff6b6b";
        }
      }
    });
  }
  
  // Allow Enter key to submit name from survival game over
  if (survivalNameInput) {
    survivalNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && survivalSubmitNameBtn && !survivalSubmitNameBtn.disabled) {
        survivalSubmitNameBtn.click();
      }
    });
  }
  
  // TRY AGAIN button - restart survival mode
  if (survivalTryAgainBtn) {
    survivalTryAgainBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Restart survival mode directly
      gameMode = "SURVIVAL";
      gameSessionId = await startGameSession();
      
      lives = 1; // Survival mode: 1 life only
      stickersCollected = 0;
      stickerTotalCollected = 0;
      stickersAtLevelStart = 0;
      points = 0;
      levelStartPoints = 0;
      lastSecondTick = 0;
      pauseInstructionShown = false;
      
      // Reset survival-specific state
      survivalTime = 0;
      survivalTier = 1;
      survivalNextTierTime = SURVIVAL_CONFIG.tierInterval;
      survivalNextPowerupTime = SURVIVAL_CONFIG.powerupInterval;
      
      // Initialize streak system
      streakTimer = 0;
      streakCount = 0;
      streakMultiplier = 1;
      
      // Reset new survival powerup timers
      survivalShieldCount = 0;
      survivalShieldInvulnerable = false;
      survivalShieldInvulnerableTimer = 0;
      survivalTimeWarpActive = false;
      survivalTimeWarpTimer = 0;
      // Add random offset to spawn times for variety (shields: ±15s, time: ±10s)
      survivalNextShieldSpawn = 105 + (Math.random() * 30 - 15); // ~90-120 seconds
      survivalNextTimeSpawn = 60 + (Math.random() * 20 - 10); // ~50-70 seconds
      
      // Stop any playing music and start survival music
      if (musicSource) {
        musicSource.stop();
        musicSource.disconnect();
        musicSource = null;
      }
      currentTrack = null; // Reset track so switchMusicTrack doesn't interfere
      // ARCADE: Disabled survival music to prevent conflicts with title music
      // await playMusic('survival', { loop: true, volume: 0.3 });
      
      currentRunTracking = {
        startLives: 1,
        bossLivesLost: 0,
        powerupsCollected: { twoX: 0, drunk: 0 },
        stickersCollected: 0,
        hitTaken: false
      };
      currentLevelPowerups = { twoX: 0, drunk: 0 };
      resetRun();
      beginCountdown(1);
    });
  }

  // SHARE SCORE button for survival
  if (survivalShareBtn) {
    survivalShareBtn.addEventListener("click", (e) => {
      e.preventDefault();
      shareScore(); // Use the same sharing function
    });
  }

  // ORDER STICKERS button for survival
  if (survivalOrderStickersBtn) {
    survivalOrderStickersBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open("https://stickergoat.com/", "_blank");
    });
  }

  // MAIN MENU button - return to menu
  if (survivalMainMenuBtn) {
    survivalMainMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      state = STATE.TITLE;
      
      currentNavigableButtons = [];
      focusedButtonIndex = 0;
      
      showOnlyOverlay("title");
      
      if (hud) hud.style.display = 'none';
      stopMusic();
    });
  }
  
  // ===== END SURVIVAL MODE GAME OVER BUTTONS =====

  // Submit name to leaderboard from game over
  if (gameOverSubmitNameBtn) {
    gameOverSubmitNameBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      const name = gameOverNameInput.value.trim();
      if (!name) {
        gameOverStatusMessage.textContent = "Please enter a name!";
        gameOverStatusMessage.style.color = "#ff6b6b";
        return;
      }
      
      // Check email if in WordPress environment
      if (window.STICKERSNATCH_API && window.STICKERSNATCH_API.isWordPress) {
        const email = gameOverEmailInput ? gameOverEmailInput.value.trim() : '';
        if (!email) {
          gameOverStatusMessage.textContent = "Please enter an email!";
          gameOverStatusMessage.style.color = "#ff6b6b";
          return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          gameOverStatusMessage.textContent = "Please enter a valid email!";
          gameOverStatusMessage.style.color = "#ff6b6b";
          return;
        }
        
        // Show submitting status
        gameOverStatusMessage.textContent = "Submitting...";
        gameOverStatusMessage.style.color = THEME_COLOR;
        gameOverSubmitNameBtn.disabled = true;
        
        // Submit to WordPress API
        const result = await submitScoreToAPI(name, email, points, stickersCollected, currentLevel);
        
        if (result.success) {
          // Also save to monthly and weekly leaderboards (local only)
          saveToMonthlyLeaderboard(name, points, stickersCollected);
          saveToWeeklyLeaderboard(name, points, stickersCollected);
          
          gameOverStatusMessage.textContent = "SUCCESS! Added to leaderboard!";
          gameOverStatusMessage.style.color = "#4CAF50";
          gameOverNameInput.disabled = true;
          if (gameOverEmailInput) gameOverEmailInput.disabled = true;
          
          // Show leaderboard overlay after successful submission
          // Small delay to ensure API has processed the submission
          await new Promise(resolve => setTimeout(resolve, 300));
          leaderboardSource = "gameover";
          await showLeaderboardForMode("main", name, { score: points });
        } else {
          gameOverStatusMessage.textContent = result.message || "Failed to save. Try again!";
          gameOverStatusMessage.style.color = "#ff6b6b";
          gameOverSubmitNameBtn.disabled = false;
        }
      } else {
        // Local version - use localStorage
        const success = saveToLeaderboard(name, points, stickersCollected);
        saveToMonthlyLeaderboard(name, points, stickersCollected);
        saveToWeeklyLeaderboard(name, points, stickersCollected);
        
        if (success) {
          gameOverStatusMessage.textContent = "SUCCESS! Added to leaderboard!";
          gameOverStatusMessage.style.color = "#4CAF50";
          gameOverNameInput.disabled = true;
          gameOverSubmitNameBtn.disabled = true;
          
          // Show leaderboard overlay after successful submission
          leaderboardSource = "gameover";
          await renderLeaderboard();
          showOnlyOverlay("leaderboard");
        } else {
          gameOverStatusMessage.textContent = "Failed to save. Try again!";
          gameOverStatusMessage.style.color = "#ff6b6b";
        }
      }
    });
  }

  // Allow Enter key to submit name from game over
  if (gameOverNameInput) {
    gameOverNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && gameOverSubmitNameBtn && !gameOverSubmitNameBtn.disabled) {
        gameOverSubmitNameBtn.click();
      }
    });
  }

  // ORDER STICKERS NOW button on game over overlay
  if (gameOverOrderStickersBtn) {
    gameOverOrderStickersBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open("https://stickergoat.com/", "_blank");
    });
  }

  // SHARE SCORE button on game over overlay
  if (gameOverShareBtn) {
    gameOverShareBtn.addEventListener("click", (e) => {
      e.preventDefault();
      shareScore();
    });
  }

  // Download share image button
  if (downloadShareBtn) {
    downloadShareBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!shareCanvas) return;
      
      shareCanvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `StickerSnatch-${points}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    });
  }

  // Share to... button (Web Share API)
  if (shareToBtn) {
    shareToBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!shareCanvas) return;
      
      try {
        const blob = await new Promise((resolve) => {
          shareCanvas.toBlob(resolve, 'image/png');
        });
        
        if (!blob) return;
        
        const file = new File([blob], `StickerSnatch-${points}.png`, { type: 'image/png' });
        const shareText = `I just scored ${points} points in STICKER SNATCH! Think you can beat me?\n\nClick here to play now and order custom stickers!\n\nhttps://stickergoat.com/stickersnatch/`;
        const shareData = {
          files: [file],
          title: 'Sticker Snatch Score',
          text: shareText
        };
        
        // Check if we can share this data
        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else if (navigator.share) {
          // Fallback without files if not supported
          await navigator.share({
            title: 'Sticker Snatch Score',
            text: shareText
          });
        }
      } catch (err) {
        // User cancelled or share failed
        if (err.name !== 'AbortError') {
          console.warn('Share failed:', err);
        }
      }
    });
  }

  // Back button on share preview
  if (sharePreviewBackBtn) {
    sharePreviewBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Return to previous overlay based on game mode and state
      if (gameMode === "SURVIVAL" && state === STATE.GAMEOVER) {
        showOnlyOverlay("survivalgameover");
      } else if (state === STATE.WIN || state === STATE.FINAL_WIN) {
        showOnlyOverlay("win");
      } else {
        showOnlyOverlay("gameover");
      }
    });
  }

  // START GAME button on title screen - goes to menu
  if (startGameBtn) {
    startGameBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      // ===== ARCADE: Unlock audio =====
      await unlockAudio();
      // ===== END ARCADE =====
      
      // Verify menu music is loaded before proceeding
      if (!mainGameMusicBuffer) {
        console.error("Main game music buffer not loaded!");
        alert("Audio failed to load. Please refresh the page.");
        return;
      }
      
      // ===== ARCADE: Stop title music before transitioning =====
      stopTitleMusic();
      // ===== END ARCADE =====
      
      showOnlyOverlay("menu");
      
      // Start main game music at lower volume
      try {
        await playMusic('main', { loop: true, volume: 0.3 });
      } catch (err) {
        console.error("Failed to start main game music:", err);
      }
      
      // Reset Konami Code when leaving title screen
      resetKonamiCode();
    });
  }

  // ===== KONAMI CODE BUTTON HANDLERS =====
  if (konamiBBtn) {
    konamiBBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleKonamiButton('b');
    });
  }

  if (konamiABtn) {
    konamiABtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleKonamiButton('a');
    });
  }

  if (konamiStartBtn) {
    konamiStartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleKonamiButton('start');
    });
  }
  // ===== END KONAMI CODE BUTTON HANDLERS =====

  // ===== SECRET LEVEL BUTTON HANDLERS =====
  if (secretWinReturnBtn) {
    secretWinReturnBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Reload the entire page for a fresh start
      window.location.reload();
    });
  }

  if (secretGameOverTryAgainBtn) {
    secretGameOverTryAgainBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Restart the secret level
      beginSecretLevel();
    });
  }

  if (secretGameOverReturnBtn) {
    secretGameOverReturnBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Reload the entire page for a fresh start
      window.location.reload();
    });
  }
  // ===== END SECRET LEVEL BUTTON HANDLERS =====

  // PLAY NOW button on menu screen - directly starts arcade mode
  if (playNowBtn) {
    playNowBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      // ===== ARCADE CREDIT CHECK =====
      if (arcadeCredits === 0) {
        // No credits - show visual feedback
        const originalText = playNowBtn.textContent;
        
        // Add shake and flash animations
        playNowBtn.classList.add('noCreditsShake', 'noCreditsText');
        playNowBtn.textContent = 'NO CREDITS';
        
        // Play collision sound instead of normal button sound
        playSfx(assets.hit, performance.now(), 0);
        
        // Make sure INSERT COIN is visible
        updateCreditDisplay();
        
        // Reset after animation completes
        setTimeout(() => {
          playNowBtn.classList.remove('noCreditsShake', 'noCreditsText');
          playNowBtn.textContent = originalText;
        }, 600);
        
        return; // Don't start game
      }
      
      // Play menu select sound when starting game with credits
      playSfx(assets.menuSelect, performance.now(), 0);
      
      // Deduct a credit to start the game
      deductCredit();
      // ===== END CREDIT CHECK =====
      
      // Set game mode to MAIN (Arcade Mode)
      gameMode = "MAIN";
      
      // Anti-cheat: Start game session
      gameSessionId = await startGameSession();
      
      lives = LIVES_START;
      stickersCollected = 0;
      stickerTotalCollected = 0;
      stickersAtLevelStart = 0;
      points = 0;
      levelStartPoints = 0;
      lastSecondTick = 0;
      currentLevel = 1;
      pauseInstructionShown = false;
      
      // Reset achievement tracking for new run
      currentRunTracking = {
        startLives: LIVES_START,
        bossLivesLost: 0,
        powerupsCollected: { twoX: 0, drunk: 0 },
        stickersCollected: 0,
        hitTaken: false
      };
      currentLevelPowerups = { twoX: 0, drunk: 0 };
      resetRun();
      
      // ===== ARCADE: Play intro sequence before level 1 =====
      // Hide menu and show game canvas
      showOnlyOverlay(null);
      
      // Play intro sequence
      console.log('Starting intro sequence...');
      await playGameIntroSequence();
      console.log('Intro sequence completed, calling beginCountdown(1)...');
      
      // After intro, start level 1
      beginCountdown(1);
      console.log('beginCountdown(1) called');
      // ===== END ARCADE INTRO =====
    });
  }

  // ===== GAME MODE SELECTION BUTTONS =====
  
  // MAIN GAME button - starts main game mode
  if (mainGameBtn) {
    mainGameBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      // Set game mode to MAIN
      gameMode = "MAIN";
      
      // Anti-cheat: Start game session
      gameSessionId = await startGameSession();
      
      lives = LIVES_START;
      stickersCollected = 0;
      stickerTotalCollected = 0;
      stickersAtLevelStart = 0;
      points = 0;
      levelStartPoints = 0;
      lastSecondTick = 0;
      currentLevel = 1;
      pauseInstructionShown = false;
      
      // Reset achievement tracking for new run
      currentRunTracking = {
        startLives: LIVES_START,
        bossLivesLost: 0,
        powerupsCollected: { twoX: 0, drunk: 0 },
        stickersCollected: 0,
        hitTaken: false
      };
      currentLevelPowerups = { twoX: 0, drunk: 0 };
      resetRun();
      beginCountdown(1);
    });
  }

  // SURVIVAL button - starts survival mode
  if (survivalGameBtn) {
    survivalGameBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      if (!SURVIVAL_MODE_ENABLED) return; // Safety check
      
      // Set game mode to SURVIVAL
      gameMode = "SURVIVAL";
      
      // Anti-cheat: Start game session
      gameSessionId = await startGameSession();
      
      lives = 1; // Survival mode: 1 life only!
      stickersCollected = 0;
      stickerTotalCollected = 0;
      stickersAtLevelStart = 0;
      points = 0;
      levelStartPoints = 0;
      lastSecondTick = 0;
      pauseInstructionShown = false;
      
      // Reset survival-specific state
      survivalTime = 0;
      survivalTier = 1;
      survivalNextTierTime = SURVIVAL_CONFIG.tierInterval;
      survivalNextPowerupTime = SURVIVAL_CONFIG.powerupInterval;
      
      // Initialize streak system
      streakTimer = 0;
      streakCount = 0;
      streakMultiplier = 1;
      
      // Reset new survival powerup timers
      survivalShieldCount = 0;
      survivalShieldInvulnerable = false;
      survivalShieldInvulnerableTimer = 0;
      survivalTimeWarpActive = false;
      survivalTimeWarpTimer = 0;
      // Add random offset to spawn times for variety (shields: ±15s, time: ±10s)
      survivalNextShieldSpawn = 105 + (Math.random() * 30 - 15); // ~90-120 seconds
      survivalNextTimeSpawn = 60 + (Math.random() * 20 - 10); // ~50-70 seconds
      survivalMultiplier = 1;
      
      // Stop main menu music and start survival music
      if (musicSource) {
        musicSource.stop();
        musicSource.disconnect();
        musicSource = null;
      }
      currentTrack = null; // Reset track so switchMusicTrack doesn't interfere
      // ARCADE: Disabled survival music to prevent conflicts with title music
      // await playMusic('survival', { loop: true, volume: 0.3 });
      
      // Reset achievement tracking (survival will have its own)
      currentRunTracking = {
        startLives: LIVES_START,
        bossLivesLost: 0,
        powerupsCollected: { twoX: 0, drunk: 0 },
        stickersCollected: 0,
        hitTaken: false
      };
      currentLevelPowerups = { twoX: 0, drunk: 0 };
      resetRun();
      beginCountdown(1);
    });
  }

  // How to Play Main Game Tab
  if (howToPlayMainTab) {
    howToPlayMainTab.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Show main game content, hide survival content
      if (mainHowToPlayContent) mainHowToPlayContent.style.display = "block";
      if (survivalHowToPlayContent) survivalHowToPlayContent.style.display = "none";
      
      // Update tab active states
      howToPlayMainTab.classList.add("active");
      if (howToPlaySurvivalTab) howToPlaySurvivalTab.classList.remove("active");
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  // How to Play Survival Tab
  if (howToPlaySurvivalTab) {
    howToPlaySurvivalTab.addEventListener("click", (e) => {
      e.preventDefault();
      
      if (!SURVIVAL_MODE_ENABLED) return;
      
      // Show survival content, hide main game content
      if (mainHowToPlayContent) mainHowToPlayContent.style.display = "none";
      if (survivalHowToPlayContent) survivalHowToPlayContent.style.display = "block";
      
      // Update tab active states
      howToPlaySurvivalTab.classList.add("active");
      if (howToPlayMainTab) howToPlayMainTab.classList.remove("active");
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  // Stats Main Game Tab
  if (statsMainTab) {
    statsMainTab.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Show main game stats, hide survival stats
      if (mainGameStats) mainGameStats.style.display = "block";
      if (survivalStats) survivalStats.style.display = "none";
      
      // Update tab active states
      statsMainTab.classList.add("active");
      if (statsSurvivalTab) statsSurvivalTab.classList.remove("active");
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  // Stats Survival Tab
  if (statsSurvivalTab) {
    statsSurvivalTab.addEventListener("click", (e) => {
      e.preventDefault();
      
      if (!SURVIVAL_MODE_ENABLED) return;
      
      // Show survival stats, hide main game stats
      if (mainGameStats) mainGameStats.style.display = "none";
      if (survivalStats) survivalStats.style.display = "block";
      
      // Update tab active states
      statsSurvivalTab.classList.add("active");
      if (statsMainTab) statsMainTab.classList.remove("active");
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  // Game Mode BACK button - returns to menu
  if (gameModeBackBtn) {
    gameModeBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showOnlyOverlay("menu");
    });
  }
  
  // ===== END GAME MODE SELECTION BUTTONS =====

  // HOW TO PLAY button on menu screen (REMOVED - now in game mode selection)
  if (howToPlayBtn) {
    howToPlayBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Play menu select sound
      playSfx(assets.menuSelect, performance.now(), 0);
      // Default to main game how to play
      if (mainHowToPlayContent) mainHowToPlayContent.style.display = "block";
      if (survivalHowToPlayContent) survivalHowToPlayContent.style.display = "none";
      if (howToPlayMainTab) howToPlayMainTab.classList.add("active");
      if (howToPlaySurvivalTab) howToPlaySurvivalTab.classList.remove("active");
      showOnlyOverlay("howtoplay");
    });
  }

  // ORDER STICKERS button on menu screen - opens Sticker Goat website
  if (orderStickersBtn) {
    orderStickersBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open("https://stickergoat.com/", "_blank");
    });
  }

  // HOW TO PLAY back button - returns to game mode selection
  if (howToPlayBackBtn) {
    howToPlayBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Play menu select sound
      playSfx(assets.menuSelect, performance.now(), 0);
      howToPlayOverlay.classList.remove("show");
      showOnlyOverlay("menu");
    });
  }

  // LEADERBOARD button on menu screen
  if (leaderboardBtn) {
    leaderboardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Play menu select sound
      playSfx(assets.menuSelect, performance.now(), 0);
      leaderboardSource = "menu"; // Track that leaderboard was opened from menu
      renderLeaderboard(); // Render leaderboard before showing
      showOnlyOverlay("leaderboard");
    });
  }

  // LEADERBOARD back button - returns to the correct overlay
  if (leaderboardBackBtn) {
    leaderboardBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Play menu select sound
      playSfx(assets.menuSelect, performance.now(), 0);
      
      // If from arcade name entry, refresh game to return to title
      if (arcadeFromNameEntry) {
        arcadeFromNameEntry = false; // Reset flag
        window.location.reload();
        return;
      }
      
      // Reset button text for normal menu access
      leaderboardBackBtn.textContent = 'BACK';
      
      leaderboardOverlay.classList.remove("show");
      
      // Return to the overlay where leaderboard was opened from
      if (leaderboardSource === "win") {
        showOnlyOverlay("win");
      } else if (leaderboardSource === "gameover") {
        showOnlyOverlay("gameover");
      } else if (leaderboardSource === "survivalgameover") {
        showOnlyOverlay("survivalgameover");
      } else if (leaderboardSource === "pause") {
        showOnlyOverlay("pause");
      } else {
        showOnlyOverlay("menu");
      }
    });
  }

  // Smart leaderboard display - shows correct mode and scrolls to player
  async function showLeaderboardForMode(mode, playerName = null, scoreData = null) {
    // Set the mode
    activeLeaderboardMode = mode;
    
    // Switch to the correct mode tab
    if (mode === "survival") {
      if (leaderboardMainTab) leaderboardMainTab.classList.remove("active");
      if (leaderboardSurvivalTab) leaderboardSurvivalTab.classList.add("active");
      if (mainLeaderboardContent) mainLeaderboardContent.style.display = "none";
      if (survivalLeaderboardContent) survivalLeaderboardContent.style.display = "block";
      
      // Default to ALL TIME tab for survival
      activeSurvivalLeaderboardTab = "alltime";
      
      // Render the survival leaderboard
      await renderSurvivalLeaderboard();
    } else {
      // ARCADE MODE
      if (leaderboardMainTab) leaderboardMainTab.classList.add("active");
      if (leaderboardSurvivalTab) leaderboardSurvivalTab.classList.remove("active");
      if (mainLeaderboardContent) mainLeaderboardContent.style.display = "block";
      if (survivalLeaderboardContent) survivalLeaderboardContent.style.display = "none";
      
      // Default to ALL TIME tab for main game
      activeLeaderboardTab = "alltime";
      
      // Render the main leaderboard
      await renderLeaderboard();
    }
    
    // Show the leaderboard overlay
    showOnlyOverlay("leaderboard");
    
    // If we have a player name, try to scroll to and highlight their entry
    if (playerName && scoreData) {
      // Wait longer for API data to load and render (especially important for WordPress)
      setTimeout(() => {
        const entries = document.querySelectorAll('.leaderboardEntry');
        let foundEntry = false;
        
        for (let entry of entries) {
          const nameSpan = entry.querySelector('.leaderboardName');
          const scoreSpan = entry.querySelector('.leaderboardScore');
          
          if (!nameSpan || !scoreSpan) continue;
          
          const displayedName = nameSpan.textContent.trim();
          const displayedScore = parseInt(scoreSpan.textContent.replace(/,/g, '') || '0');
          
          // Match by name AND exact score
          const targetScore = scoreData.score || scoreData;
          
          if (displayedName === playerName.trim() && displayedScore === targetScore) {
            // Found the exact entry!
            foundEntry = true;
            
            // Highlight the entry
            entry.style.backgroundColor = getThemeColor(0.2);
            entry.style.transition = 'background-color 0.3s';
            
            // Scroll into view
            entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
              entry.style.backgroundColor = '';
            }, 3000);
            
            break;
          }
        }
        
        // If not found, try again after another delay (API might be slow)
        if (!foundEntry) {
          setTimeout(() => {
            const retriedEntries = document.querySelectorAll('.leaderboardEntry');
            for (let entry of retriedEntries) {
              const nameSpan = entry.querySelector('.leaderboardName');
              const scoreSpan = entry.querySelector('.leaderboardScore');
              
              if (!nameSpan || !scoreSpan) continue;
              
              const displayedName = nameSpan.textContent.trim();
              const displayedScore = parseInt(scoreSpan.textContent.replace(/,/g, '') || '0');
              const targetScore = scoreData.score || scoreData;
              
              if (displayedName === playerName.trim() && displayedScore === targetScore) {
                entry.style.backgroundColor = getThemeColor(0.2);
                entry.style.transition = 'background-color 0.3s';
                entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                setTimeout(() => {
                  entry.style.backgroundColor = '';
                }, 3000);
                
                break;
              }
            }
          }, 800); // Second attempt after 800ms more
        }
      }, 500); // Initial delay increased to 500ms to let API data load
    }
  }

  // Leaderboard main mode tabs
  if (leaderboardMainTab) {
    leaderboardMainTab.addEventListener("click", (e) => {
      e.preventDefault();
      activeLeaderboardMode = "main";
      leaderboardMainTab.classList.add("active");
      leaderboardSurvivalTab.classList.remove("active");
      mainLeaderboardContent.style.display = "block";
      survivalLeaderboardContent.style.display = "none";
      renderLeaderboard();
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  if (leaderboardSurvivalTab) {
    leaderboardSurvivalTab.addEventListener("click", (e) => {
      e.preventDefault();
      activeLeaderboardMode = "survival";
      leaderboardMainTab.classList.remove("active");
      leaderboardSurvivalTab.classList.add("active");
      mainLeaderboardContent.style.display = "none";
      survivalLeaderboardContent.style.display = "block";
      renderSurvivalLeaderboard();
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  // Main game leaderboard time period tabs
  if (thisWeekTab) {
    thisWeekTab.addEventListener("click", (e) => {
      e.preventDefault();
      activeLeaderboardTab = "weekly";
      thisWeekTab.classList.add("active");
      thisMonthTab.classList.remove("active");
      allTimeTab.classList.remove("active");
      renderLeaderboard();
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  if (thisMonthTab) {
    thisMonthTab.addEventListener("click", (e) => {
      e.preventDefault();
      activeLeaderboardTab = "monthly";
      thisWeekTab.classList.remove("active");
      thisMonthTab.classList.add("active");
      allTimeTab.classList.remove("active");
      renderLeaderboard();
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  if (allTimeTab) {
    allTimeTab.addEventListener("click", (e) => {
      e.preventDefault();
      activeLeaderboardTab = "alltime";
      thisWeekTab.classList.remove("active");
      thisMonthTab.classList.remove("active");
      allTimeTab.classList.add("active");
      renderLeaderboard();
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  // Survival leaderboard time period tabs
  if (survivalThisWeekTab) {
    survivalThisWeekTab.addEventListener("click", (e) => {
      e.preventDefault();
      activeSurvivalLeaderboardTab = "weekly";
      survivalThisWeekTab.classList.add("active");
      survivalThisMonthTab.classList.remove("active");
      survivalAllTimeTab.classList.remove("active");
      renderSurvivalLeaderboard();
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  if (survivalThisMonthTab) {
    survivalThisMonthTab.addEventListener("click", (e) => {
      e.preventDefault();
      activeSurvivalLeaderboardTab = "monthly";
      survivalThisWeekTab.classList.remove("active");
      survivalThisMonthTab.classList.add("active");
      survivalAllTimeTab.classList.remove("active");
      renderSurvivalLeaderboard();
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  if (survivalAllTimeTab) {
    survivalAllTimeTab.addEventListener("click", (e) => {
      e.preventDefault();
      activeSurvivalLeaderboardTab = "alltime";
      survivalThisWeekTab.classList.remove("active");
      survivalThisMonthTab.classList.remove("active");
      survivalAllTimeTab.classList.add("active");
      renderSurvivalLeaderboard();
      
      // Refresh keyboard navigation
      refreshNavigableButtons();
    });
  }

  // SETTINGS button on menu screen
  if (settingsBtn) {
    settingsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showOnlyOverlay("settings");
    });
  }

  // STATS button on menu screen (REMOVED - now in game mode selection)
  // Kept for backward compatibility if needed
  if (statsBtn) {
    statsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      renderStats();
      // Default to main game stats tab
      if (statsMainTab) statsMainTab.classList.add("active");
      if (statsSurvivalTab) statsSurvivalTab.classList.remove("active");
      if (mainGameStats) mainGameStats.style.display = "block";
      if (survivalStats) survivalStats.style.display = "none";
      showOnlyOverlay("stats");
    });
  }

  // STATS back button - returns to menu
  if (statsBackBtn) {
    statsBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (statsOverlay) statsOverlay.classList.remove("show");
      showOnlyOverlay("menu");
    });
  }

  // Achievement detail back button
  if (achievementDetailBackBtn) {
    achievementDetailBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      hideAchievementDetail();
    });
  }

  // Achievement slot click handlers
  document.querySelectorAll(".achievementSlot").forEach(slot => {
    slot.addEventListener("click", (e) => {
      const achievementId = parseInt(slot.getAttribute("data-achievement-id"));
      const isUnlocked = slot.classList.contains("unlocked");
      showAchievementDetail(achievementId, isUnlocked);
    });
  });

  // SETTINGS back button - returns to menu (or pause if opened from pause)
  if (settingsBackBtn) {
    settingsBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (leaderboardSource === "pause") {
        showOnlyOverlay("pause");
      } else {
        showOnlyOverlay("menu");
      }
    });
  }

  // PAUSE overlay buttons
  if (pauseContinueBtn) {
    pauseContinueBtn.addEventListener("click", (e) => {
      e.preventDefault();
      unpauseGame();
    });
  }

  if (pauseCloseBtn) {
    pauseCloseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      unpauseGame();
    });
  }

  if (pauseSettingsBtn) {
    pauseSettingsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Keep game paused, show settings
      showOnlyOverlay("settings");
      // Store that we came from pause for back navigation
      leaderboardSource = "pause";
    });
  }

  if (pauseOrderStickersBtn) {
    pauseOrderStickersBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open("https://stickergoat.com/", "_blank");
      // Game stays paused
    });
  }

  if (pauseLeaderboardBtn) {
    pauseLeaderboardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Keep game paused, show leaderboard
      leaderboardSource = "pause";
      renderLeaderboard(); // Render leaderboard before showing
      showOnlyOverlay("leaderboard");
    });
  }

  if (pauseMainMenuBtn) {
    pauseMainMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Show confirmation prompt
      pauseMainCard.style.display = 'none';
      pauseConfirmCard.style.display = 'flex';
      pauseConfirmCard.classList.add('show');
      // Update keyboard navigation for confirmation dialog
      setTimeout(() => updateNavigableButtons("pause"), 50);
    });
  }

  if (pauseConfirmYes) {
    pauseConfirmYes.addEventListener("click", (e) => {
      e.preventDefault();
      
      // In secret level, reload the page for a clean restart
      if (isKonamiLevel) {
        window.location.reload();
        return;
      }
      
      // End the run and return to main menu
      isPaused = false;
      state = STATE.TITLE;
      stopMusic();
      showOnlyOverlay("title");
      if (hud) hud.style.display = 'none';
    });
  }

  if (pauseConfirmNo) {
    pauseConfirmNo.addEventListener("click", (e) => {
      e.preventDefault();
      // Go back to main pause menu
      pauseConfirmCard.style.display = 'none';
      pauseConfirmCard.classList.remove('show');
      pauseMainCard.style.display = 'flex';
      // Update keyboard navigation back to main pause menu
      setTimeout(() => updateNavigableButtons("pause"), 50);
    });
  }

  // Music slider
  if (musicSlider) {
    musicSlider.addEventListener("input", (e) => {
      musicVolume = parseInt(e.target.value, 10);
      musicValue.textContent = musicVolume;
      
      // Apply immediately to music gain
      if (musicGain) {
        musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
      }
      
      saveSettings();
    });
  }

  // SFX slider
  if (sfxSlider) {
    sfxSlider.addEventListener("input", (e) => {
      sfxVolume = parseInt(e.target.value, 10);
      sfxValue.textContent = sfxVolume;
      
      // Update multiplier
      sfxVolumeMultiplier = sfxVolume / 100;
      
      saveSettings();
    });
  }

  // Haptics toggle
  if (hapticsToggle) {
    hapticsToggle.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Only toggle if haptics are supported
      if (!navigator.vibrate) return;
      
      hapticsEnabled = !hapticsEnabled;
      hapticsToggle.textContent = hapticsEnabled ? "ON" : "OFF";
      hapticsToggle.classList.toggle("off", !hapticsEnabled);
      
      saveSettings();
      
      // Give feedback if enabled
      if (hapticsEnabled) {
        triggerHaptic(50);
      }
    });
  }

  // Theme Color button - open theme color picker
  if (themeColorBtn) {
    themeColorBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof playSFX === 'function') playSFX('confirm');
      if (typeof triggerHaptic === 'function') triggerHaptic(50);
      
      // Hide settings, show theme color picker
      if (settingsOverlay) settingsOverlay.classList.remove("show");
      if (themeColorOverlay) themeColorOverlay.classList.add("show");
      
      // Update keyboard navigation for theme color overlay
      setTimeout(() => updateNavigableButtons('themecolor'), 50);
    });
  }

  // Theme Color back button - return to settings
  if (themeColorBackBtn) {
    themeColorBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof playSFX === 'function') playSFX('confirm');
      if (typeof triggerHaptic === 'function') triggerHaptic(50);
      
      // Hide theme color picker, show settings
      if (themeColorOverlay) themeColorOverlay.classList.remove("show");
      if (settingsOverlay) settingsOverlay.classList.add("show");
      
      // Restore keyboard navigation for settings
      setTimeout(() => updateNavigableButtons('settings'), 50);
    });
  }

  // Color choice buttons
  const colorChoiceBtns = document.querySelectorAll(".colorChoiceBtn");
  colorChoiceBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const color = btn.getAttribute("data-color");
      if (typeof playSFX === 'function') playSFX('confirm');
      if (typeof triggerHaptic === 'function') triggerHaptic(100);
      
      // Apply the theme color
      applyThemeColor(color);
      
      // Visual feedback - briefly highlight selected button
      btn.style.transform = "scale(0.95)";
      setTimeout(() => {
        btn.style.transform = "scale(1)";
      }, 100);
    });
  });

  function update(dt) {
    // Update credits sequence if active
    if (creditsSequencePlaying) {
      updateCreditsSequence(dt);
      
      // Phase 2+ (surf scene): Use special credits movement and skip normal updates
      if (creditsPhase >= 2) {
        updatePlayerMovementDuringCredits(dt);
        return; // Skip normal game updates during surf scene
      }
      // Phase 0-1 (earth/fade): Let normal boss movement code run below
    }
    
    // Update title logo animation (when visible on title or menu screens)
    const gameLogo = document.getElementById('gameLogo');
    if (gameLogo && !gameLogo.classList.contains('logo--hidden') && titleFrameImages.length > 0) {
      titleFrameTimer += dt;
      if (titleFrameTimer >= TITLE_FRAME_DURATION) {
        titleFrameTimer = 0;
        titleFrameIndex = (titleFrameIndex + 1) % titleFrameImages.length;
        gameLogo.src = titleFrameImages[titleFrameIndex].src;
      }
    }
    
    // Update title screen idle animation
    const titleOverlay = document.getElementById('titleOverlay');
    const onTitleScreen = titleOverlay && titleOverlay.classList.contains('show');
    
    if (onTitleScreen && !titleBossAnimPlayed && !titleBossAnimActive) {
      // Count idle time on title screen
      titleIdleTimer += dt;
      if (titleIdleTimer >= TITLE_IDLE_TRIGGER_TIME) {
        // Trigger boss flyby animation
        titleBossAnimActive = true;
        titleBossPhase = 0;
        titleBossTimer = 0;
        titleBossX = W + 100; // Start off-screen right
        titleBossScale = 0.3;
        titleBossShowBren3 = false;
        titleBossAnimPlayed = true; // Mark as played for this visit
      }
    } else if (!onTitleScreen) {
      // Reset idle timer when leaving title screen
      titleIdleTimer = 0;
      titleBossAnimPlayed = false;
      titleBossAnimActive = false;
    }
    
    // Update boss flyby animation
    if (titleBossAnimActive) {
      titleBossTimer += dt;
      
      if (titleBossPhase === 0) {
        // Entry phase: fly in from right, scale up
        const progress = Math.min(titleBossTimer / TITLE_BOSS_ENTRY_DURATION, 1.0);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
        titleBossX = W + 100 - (W + 100 - W/2 + 89) * eased;
        titleBossScale = 0.3 + (1.0 - 0.3) * eased;
        
        if (titleBossTimer >= TITLE_BOSS_ENTRY_DURATION) {
          titleBossPhase = 1;
          titleBossTimer = 0;
          titleBossX = W/2 - 89; // Center (178/2 = 89)
          titleBossScale = 1.0;
        }
      } else if (titleBossPhase === 1) {
        // Pause phase: stay centered, blink to bren3
        if (titleBossTimer >= 1.0 && titleBossTimer < 2.0) {
          titleBossShowBren3 = true;
        } else {
          titleBossShowBren3 = false;
        }
        
        if (titleBossTimer >= TITLE_BOSS_PAUSE_DURATION) {
          titleBossPhase = 2;
          titleBossTimer = 0;
        }
      } else if (titleBossPhase === 2) {
        // Exit phase: fly off to left
        const progress = Math.min(titleBossTimer / TITLE_BOSS_EXIT_DURATION, 1.0);
        const eased = Math.pow(progress, 3); // Ease-in cubic
        titleBossX = W/2 - 89 - (W/2 + 89 + 100) * eased;
        
        // Shrink from 1.0 back to 0.3 (opposite of entry)
        titleBossScale = 1.0 - (0.7 * eased);
        
        if (titleBossTimer >= TITLE_BOSS_EXIT_DURATION) {
          // Animation complete
          titleBossAnimActive = false;
          titleBossPhase = 0;
          titleBossTimer = 0;
        }
      }
    }
    
    // Early return if paused - freeze all gameplay
    if (isPaused) return;

    // Check for hit stop
    if (inHitStop) {
      const now = performance.now();
      if (now >= hitStopEndTime) {
        // Hit stop finished - resume game
        inHitStop = false;
        
        // Reset timestamp to prevent delta time spike
        lastTs = now;
        
        // Now restart from current level/state
        if (lives <= 0) {
          // Already handled in handleFailureCollision (game over state set)
          return;
        }
        
        if (state === STATE.FINAL_LEVEL) {
          // Restart boss fight
          beginFinalLevel();
        } else {
          // Restart regular level
          resetRun();
          beginCountdown(currentLevel);
        }
      }
      // During hit stop, skip all other updates but allow draw to continue
      return;
    }

    // Background pattern scroll - sync with obstacle scroll speed
    // In secret level, match the scrollSpeed (380), otherwise use the normal slow scroll
    // Stop scrolling in secret level when game ends (WIN or GAMEOVER)
    if (!isKonamiLevel || (state !== STATE.WIN && state !== STATE.GAMEOVER)) {
      const currentBgScrollSpeed = isKonamiLevel ? scrollSpeed : BG_SCROLL_SPEED;
      bgOffset += currentBgScrollSpeed * dt;
    }
    
    // Update screen shake
    if (shakeTimer > 0) {
      shakeTimer -= dt;
      const intensity = (shakeTimer / SHAKE_DURATION) * SHAKE_INTENSITY;
      shakeOffsetX = (Math.random() - 0.5) * 2 * intensity;
      shakeOffsetY = (Math.random() - 0.5) * 2 * intensity;
    } else {
      shakeOffsetX = 0;
      shakeOffsetY = 0;
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      // Apply acceleration if present (for spreading particles)
      if (p.ax !== undefined) p.vx += p.ax * dt;
      if (p.ay !== undefined) p.vy += p.ay * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
    
    // Update trail points
    for (let i = playerTrail.length - 1; i >= 0; i--) {
      const t = playerTrail[i];
      // Move trail point based on velocity
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) {
        playerTrail.splice(i, 1);
      }
    }
    
    // Spawn trail points (only during active gameplay)
    if ((state === STATE.PLAY || state === STATE.FINAL_LEVEL) && !isPaused) {
      trailSpawnTimer += dt;
      if (trailSpawnTimer >= TRAIL_SPAWN_INTERVAL) {
        trailSpawnTimer = 0;
        
        // Calculate spawn position from bottom of player
        // Offset based on player rotation to spawn from "exhaust" point
        const spawnOffsetY = PLAYER_H / 2 - 25; // Higher up to hide thick part under player
        const spawnOffsetX = Math.sin(playerRotation) * 15; // Offset left/right based on rotation
        
        // Calculate velocity based on player rotation
        // Trail flows downward and angles opposite to movement direction
        const angle = Math.PI / 2; // Base downward direction (90 degrees)
        const angleOffset = -playerRotation * 1.5; // Angle opposite to player tilt
        const finalAngle = angle + angleOffset;
        
        const speed = 150; // Trail flow speed (pixels/second)
        const vx = Math.cos(finalAngle) * speed;
        const vy = Math.sin(finalAngle) * speed;
        
        // Add trail point at current player position with velocity
        playerTrail.push({
          x: playerX + spawnOffsetX,
          y: playerEntranceY + spawnOffsetY,
          vx: vx,
          vy: vy,
          life: TRAIL_LIFETIME,
          maxLife: TRAIL_LIFETIME
        });
        // Keep trail array at max size
        if (playerTrail.length > TRAIL_MAX_POINTS) {
          playerTrail.shift();
        }
        
        // Spawn green square particles during 2X powerup
        if (activePowerupType === "2X") {
          // Spawn 4 particles per trail interval for very dense firework effect
          for (let i = 0; i < 4; i++) {
            // Spawn particles just below player, above trail spawn point
            const particleSpawnY = PLAYER_H / 2 - 30; // Just above trail spawn
            
            // Create wide firework spread - full 180 degree cone downward
            const spreadAngle = (Math.random() - 0.5) * Math.PI; // ±90 degrees (180° total)
            const explosionSpeed = 80 + Math.random() * 120; // 80-200 pixels/sec
            
            // Calculate velocity from polar coordinates
            const baseAngle = Math.PI / 2; // Downward base
            const finalAngle = baseAngle + spreadAngle;
            
            particles.push({
              x: playerX + spawnOffsetX,
              y: playerY + particleSpawnY,
              vx: Math.cos(finalAngle) * explosionSpeed,
              vy: Math.sin(finalAngle) * explosionSpeed,
              life: 0.4 + Math.random() * 0.3, // 0.4-0.7 seconds (longer to see spread)
              maxLife: 0.7,
              size: 3 + Math.random() * 4, // 3-7px squares
              color: '#43a0e6', // Blue to match 2X powerup
              ax: Math.cos(finalAngle) * 50, // Continue spreading outward
              ay: 30 // Slight downward gravity
            });
          }
        }
      }
    }
    
    // Update floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.timer -= dt;
      ft.y -= 30 * dt; // drift upward slowly
      if (ft.timer <= 0) {
        floatingTexts.splice(i, 1);
      }
    }
    
    // Update high score notification timer
    if (newHighScoreTimer > 0) {
      newHighScoreTimer -= dt;
      if (newHighScoreTimer < 0) {
        newHighScoreTimer = 0;
        // Hide banner when timer expires
        if (highScoreBanner) highScoreBanner.classList.remove("show");
      }
    }

    if (state === STATE.COUNTDOWN) {
      countdownT -= dt;
      updateCountdownTextAndSound();
      
      // Player entrance animation already happened during intro
      // No need to animate during countdown
      
      if (countdownT <= 0) startRunNow();
      return;
    }

    if (state === STATE.OUT_OF_TIME) {
      outOfTimeT -= dt;
      if (outOfTimeT <= 0) finishOutOfTimeSequence();
      return;
    }

    // Handle FINAL_LEVEL (boss fight)
    if (state === STATE.FINAL_LEVEL) {
      // Player movement (skip if world is frozen from shield hit)
      if (holdDir !== 0 && !mainGameShieldHitFreeze) {
        // Use reduced speed during DRUNK powerup
        const moveSpeed = activePowerupType === "DRUNK" ? DRUNK_MOVE_SPEED : HOLD_MOVE_SPEED;
        playerX = clamp(playerX + holdDir * moveSpeed * dt, PLAYER_MARGIN, W - PLAYER_MARGIN);
      }

      // Update player rotation (visual only)
      // Set target rotation based on input
      if (holdDir < 0) {
        playerTargetRotation = PLAYER_ROT_LEFT;
      } else if (holdDir > 0) {
        playerTargetRotation = PLAYER_ROT_RIGHT;
      } else {
        playerTargetRotation = PLAYER_ROT_NEUTRAL;
      }
      // Smooth lerp toward target
      playerRotation += (playerTargetRotation - playerRotation) * PLAYER_ROT_SNAP_SPEED;
      // Clamp near-zero to avoid jitter
      if (Math.abs(playerRotation) < 0.001) playerRotation = 0;

      // Update boss
      updateBoss(dt);

      // Spawn stickers during boss fight (skip during shield freeze)
      if (!mainGameShieldHitFreeze) {
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          if (stickerRng() < 0.4) { // 40% chance to spawn sticker
            // Determine if this is a thick sticker (rare)
            const isThick = stickerRng() < THICK_STICKER_CHANCE;
            
            // Position: thick stickers spawn near edges (harder to reach)
            let sx;
            if (isThick) {
              // Spawn in outer 25% of screen (left or right edge)
              sx = stickerRng() < 0.5 
                ? PLAYER_MARGIN + stickerRng() * (W * 0.20)           // Left edge
                : W - PLAYER_MARGIN - stickerRng() * (W * 0.20);      // Right edge
            } else {
              // Normal stickers spawn anywhere
              sx = clamp(PLAYER_MARGIN + stickerRng() * (W - PLAYER_MARGIN*2), PLAYER_MARGIN, W - PLAYER_MARGIN);
            }
            const sy = -(70 + stickerRng() * 180);
            
            const stickerImg = isThick ? assets.thickSticker : assets.sticker;
            
            const iw = stickerImg.width;
            const ih = stickerImg.height;
            const scale = STICKER_TARGET_W / iw;
            const w = iw * scale;
            const h = ih * scale;
            stickers.push({
              x: sx, y: sy, w, h,
              angle: (stickerRng() - 0.5) * STICKER_ROT_RANGE,
              collected: false,
              active: true,
              isThick: isThick
            });
          }
          spawnTimer = 1.0; // Check every second
        }
      }

      // Move stickers (skip during shield freeze)
      if (!mainGameShieldHitFreeze) {
        for (const s of stickers) s.y += 100 * dt;
      }

      // Move powerup stickers (update pulse but movement is with stickers)
      if (!mainGameShieldHitFreeze) {
        for (const p of powerupStickers) {
          if (p.collected) continue; // Skip collected stickers
          
          p.y += 100 * dt; // Same speed as regular stickers
          p.pulsePhase += dt * 3; // 3 rad/s pulse speed
          
          // Magnetism: Strong drift toward player when close
          const dx = playerX - p.x;
          const dy = playerEntranceY - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const magnetRadius = 200; // Start pulling when within 200px
          
          if (distance < magnetRadius && distance > 0) {
            // Very strong pull that overcomes downward scroll
            const pullStrength = 1 - (distance / magnetRadius);
            const magnetForce = pullStrength * pullStrength * 500; // Max 500px/s pull
            
            // Normalize direction and apply force
            const dirX = dx / distance;
            const dirY = dy / distance;
            p.x += dirX * magnetForce * dt;
            p.y += dirY * magnetForce * dt; // This can overcome the 100px/s downward scroll
          }
        }
      }

      // Boss asteroid collision detection
      const pr = PLAYER_COLLISION_RADIUS;
      for (const ast of bossArmedAsteroids) {
        if (!ast.thrown || !ast.active) continue;
        // Skip collision if invulnerable from shield consumption
        if (gameMode !== "SURVIVAL" && mainGameShieldInvulnerable) continue;
        const ar = BOSS_ASTEROID_SIZE / 2;
        if (circleHit(playerX, playerEntranceY, pr, ast.x, ast.y, ar)) {
          handleFailureCollision(ast);
          return;
        }
      }

      // Sticker collection
      for (const s of stickers) {
        if (s.collected || !s.active) continue;
        const sr = Math.min(s.w, s.h) * 0.89;
        if (circleHit(playerX, playerY, PLAYER_COLLISION_RADIUS, s.x, s.y, sr)) {
          s.collected = true;
          stickersCollected += 1;
          stickerTotalCollected += 1;
          stickersThisLevel += 1;
          
          // Award points (thick stickers worth +100, normal worth +25)
          const basePoints = s.isThick ? 100 : 25;
          const earnedPoints = basePoints * scoreMultiplier;
          points += earnedPoints;
          
          // Show floating text with multiplier if active
          if (s.isThick || scoreMultiplier > 1) {
            const textColor = scoreMultiplier > 1 ? (activePowerupType === "2X" ? '#4CAF50' : '#FF9800') : THEME_COLOR;
            floatingTexts.push({
              x: s.x,
              y: s.y,
              text: `+${earnedPoints}`,
              timer: 0.5,
              maxTime: 0.5,
              color: textColor
            });
          }
          
          // Spawn particles at sticker position
          spawnParticles(s.x, s.y, 5);
          
          // Check for extra life every 20 stickers in current level - NOT in survival mode
          if (gameMode !== "SURVIVAL" && stickersThisLevel % EXTRA_LIFE_STICKER_THRESHOLD === 0 && lives < LIVES_MAX) {
            lives += 1;
            points += 69; // +69 bonus for extra life trigger
            playSfx(assets.extraLife, performance.now(), 0); // Play extra life sound
            
            // Trigger life gain animation
            const hudLifeIcon = document.getElementById('hudLifeIcon');
            if (hudLifeIcon) {
              hudLifeIcon.classList.remove('life-loss', 'life-gain');
              void hudLifeIcon.offsetWidth; // Force reflow
              hudLifeIcon.classList.add('life-gain');
              setTimeout(() => hudLifeIcon.classList.remove('life-gain'), 600);
            }
            
            // Flash lives text green
            if (livesText) {
              livesText.classList.remove('life-text-loss', 'life-text-gain');
              void livesText.offsetWidth; // Force reflow
              livesText.classList.add('life-text-gain');
              setTimeout(() => livesText.classList.remove('life-text-gain'), 600);
            }
          }
          
          // Play appropriate sound (thick stickers have special sound)
          playSfx(s.isThick ? assets.thickGrab : assets.grab, performance.now(), 0);
          updateHud();
        }
      }

      // Powerup sticker collection
      for (const p of powerupStickers) {
        if (p.collected) continue;
        const pr = Math.min(p.w, p.h) * 0.89;
        if (circleHit(playerX, playerY, PLAYER_COLLISION_RADIUS, p.x, p.y, pr)) {
          p.collected = true;
          
          // Award points based on powerup type
          let powerupPoints = 0;
          let textColor = '#FFD700';
          
          // Activate powerup effects
          if (p.type === "2X") {
            powerupPoints = 200;
            textColor = '#43a0e6'; // Blue
            scoreMultiplier = 2;
            powerupEffectEndTime = performance.now() + 12000; // 12 seconds
            activePowerupType = "2X";
            playSfx(assets.getMagnet, performance.now(), 1.0);
            // Switch to 2X music (only in main game, not survival)
            if (gameMode !== "SURVIVAL") {
              switchMusicTrack('main2X').catch(err => console.warn('Failed to switch to 2X music:', err));
            }
            // Track for TURNT UP achievement (current level only, committed on level completion)
            currentLevelPowerups.twoX += 1;
          } else if (p.type === "DRUNK") {
            powerupPoints = 420;
            textColor = '#FF9800'; // Orange
            scoreMultiplier = 3;
            powerupEffectEndTime = performance.now() + 10000; // 10 seconds
            activePowerupType = "DRUNK";
            playSfx(assets.getBeer, performance.now(), 1.0);
            // Switch to TURNT music (only in main game, not survival)
            if (gameMode !== "SURVIVAL") {
              switchMusicTrack('mainTurnt').catch(err => console.warn('Failed to switch to TURNT music:', err));
            }
            // Track for TURNT UP achievement (current level only, committed on level completion)
            currentLevelPowerups.drunk += 1;
          } else if (p.type === "SHIELD") {
            powerupPoints = 250;
            textColor = '#ff0055'; // Red shield color (matches invulnerability bars)
            
            // MAIN GAME: Activate shield protection (one-time use)
            if (gameMode !== "SURVIVAL") {
              if (mainGameShieldCount < 3) {
                mainGameShieldCount++;
              }
              playSfx(assets.shieldGet, performance.now(), 0.8); // SHIELD collection sound
            } else {
              // SURVIVAL MODE: Add shield to inventory (max 3)
              if (survivalShieldCount < 3) {
                survivalShieldCount++;
              }
            }
          } else if (p.type === "TIME") {
            powerupPoints = 300;
            textColor = '#c600ff'; // Purple time warp color
            
            // MAIN GAME: Activate time warp effect
            if (gameMode !== "SURVIVAL") {
              mainGameTimeWarpActive = true;
              mainGameTimeWarpTimer = 12; // 12 seconds duration
              mainGameTimeWarpBeepTimer = 0; // Start beep timer
              
              // Lower music volume during time warp
              if (musicGain) {
                musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN * 0.3; // Reduce to 30%
              }
              
              playSfx(assets.clockGet, performance.now(), 0.8); // TIME WARP collection sound
            } else {
              // SURVIVAL MODE: Activate time warp effect
              survivalTimeWarpActive = true;
              survivalTimeWarpTimer = 12; // 12 seconds duration
              survivalTimeWarpBeepTimer = 0; // Start beep timer
              
              // Lower music volume during time warp
              if (musicGain) {
                musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN * 0.3; // Reduce to 30%
              }
              
              playSfx(assets.clockGet, performance.now(), 0.8); // TIME WARP collection sound
            }
          }
          
          // Add points
          points += powerupPoints;
          
          // Show floating text
          floatingTexts.push({
            x: p.x,
            y: p.y,
            text: `+${powerupPoints}`,
            timer: 0.5,
            maxTime: 0.5,
            color: textColor
          });
          
          // Spawn particles at powerup position
          spawnParticles(p.x, p.y, 5);
        }
      }

      // Remove off-screen powerup stickers
      powerupStickers = powerupStickers.filter(p => !p.collected && p.y < H + 180);

      // Mark off-screen stickers as inactive (reduce GC pressure)
      for (const s of stickers) {
        if (s.y >= H + 180) s.active = false;
      }
      
      // Boss level: Decrement shield invulnerability timer
      if (mainGameShieldInvulnerable) {
        mainGameShieldInvulnerableTimer -= dt;
        if (mainGameShieldInvulnerableTimer <= 0) {
          mainGameShieldInvulnerable = false;
          mainGameShieldInvulnerableTimer = 0;
        }
      }
      
      // Boss level: Decrement shield hit freeze timer
      if (mainGameShieldHitFreeze) {
        mainGameShieldHitFreezeTimer -= dt;
        if (mainGameShieldHitFreezeTimer <= 0) {
          mainGameShieldHitFreeze = false;
          mainGameShieldHitFreezeTimer = 0;
        }
      }
      
      updateHud();
      return;
    }

    if (state !== STATE.PLAY) return;

    // Timer - different logic for survival vs main game
    if (gameMode === "SURVIVAL") {
      // Count UP in survival mode
      survivalTime += dt;
      
      // Powerup spawning removed - no magnet in survival mode
      // Shield and Time powerups will be handled separately
      
      // Shield powerup spawn (every ~1.75 minutes with ±15s variation)
      if (survivalTime >= survivalNextShieldSpawn) {
        spawnSurvivalShield();
        survivalNextShieldSpawn += 105 + (Math.random() * 30 - 15); // ~90-120 seconds
      }
      
      // Time warp powerup spawn (every ~60 seconds with ±10s variation)
      if (survivalTime >= survivalNextTimeSpawn) {
        spawnSurvivalTime();
        survivalNextTimeSpawn += 60 + (Math.random() * 20 - 10); // ~50-70 seconds
      }
      
      // Check for tier progression (every 30 seconds)
      if (survivalTime >= survivalNextTierTime) {
        survivalTier++;
        survivalNextTierTime += SURVIVAL_CONFIG.tierInterval;
        
        // Apply new difficulty
        applySurvivalDifficulty(survivalTier);
      }
      
      // Streak timer countdown
      if (streakTimer > 0) {
        streakTimer -= dt;
        
        if (streakTimer <= 0) {
          // STREAK BROKEN!
          triggerStreakBreakEffects();
          
          // Reset streak system
          streakTimer = 0;
          streakCount = 0;
          streakMultiplier = 1;
        }
      }
      
      // Update streak visual effect animations
      if (flashOverlay && flashOverlay.elapsed < flashOverlay.duration) {
        flashOverlay.elapsed += dt;
        if (flashOverlay.elapsed >= flashOverlay.duration) {
          flashOverlay = null;
        }
      }
      
      if (streakBreakFlash && streakBreakFlash.elapsed < streakBreakFlash.duration) {
        streakBreakFlash.elapsed += dt;
        if (streakBreakFlash.elapsed >= streakBreakFlash.duration) {
          streakBreakFlash = null;
        }
      }
      
      if (progressBarPopTimer > 0) {
        progressBarPopTimer -= dt;
        const popProgress = 1 - (progressBarPopTimer / 0.3);
        progressBarPopScale = 1.2 - (0.2 * popProgress);
        if (progressBarPopTimer < 0) {
          progressBarPopTimer = 0;
          progressBarPopScale = 1.0;
        }
      }
      
      if (multiplierTextTimer > 0) {
        multiplierTextTimer -= dt;
        const pulseProgress = 1 - (multiplierTextTimer / 0.3);
        multiplierTextScale = 1.3 - (0.3 * pulseProgress);
        if (multiplierTextTimer < 0) {
          multiplierTextTimer = 0;
          multiplierTextScale = 1.0;
        }
      }
      
      if (progressBarDraining && progressBarDrainTimer > 0) {
        progressBarDrainTimer -= dt;
        if (progressBarDrainTimer <= 0) {
          progressBarDraining = false;
          progressBarDrainTimer = 0;
        }
      }
      
      // Award points for time survived (every second)
      const currentSecondTick = Math.floor(survivalTime);
      if (currentSecondTick > lastSecondTick) {
        points += 5;
        lastSecondTick = currentSecondTick;
      }
      
      // Decrement shield invulnerability timer
      if (survivalShieldInvulnerable) {
        survivalShieldInvulnerableTimer -= dt;
        if (survivalShieldInvulnerableTimer <= 0) {
          survivalShieldInvulnerable = false;
          survivalShieldInvulnerableTimer = 0;
        }
      }
      
      // Decrement shield hit freeze timer
      if (survivalShieldHitFreeze) {
        survivalShieldHitFreezeTimer -= dt;
        if (survivalShieldHitFreezeTimer <= 0) {
          survivalShieldHitFreeze = false;
          survivalShieldHitFreezeTimer = 0;
        }
      }
      
      // Decrement time warp timer and restore scroll speed when done
      if (survivalTimeWarpActive) {
        survivalTimeWarpTimer -= dt;
        
        // Beep every 1 second (12 beeps total over 12 seconds)
        survivalTimeWarpBeepTimer += dt;
        if (survivalTimeWarpBeepTimer >= 1.0) {
          // Use different sound for last 3 seconds
          const timeSound = survivalTimeWarpTimer <= 3 ? assets.timerMenu : assets.clockTick;
          playSfx(timeSound, performance.now(), 0);
          survivalTimeWarpBeepTimer -= 1.0; // Reset for next beep
        }
        
        if (survivalTimeWarpTimer <= 0) {
          survivalTimeWarpActive = false;
          survivalTimeWarpTimer = 0;
          survivalTimeWarpBeepTimer = 0;
          
          // Play TIME WARP end sound
          playSfx(assets.clockEnd, performance.now(), 0.8);
          
          // Restore music volume
          if (musicGain) {
            musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
          }
          
          // Recalculate scroll speed based on current tier
          applySurvivalDifficulty(survivalTier);
        }
      }
      
      // Multiplier is now streak-based, no longer time-based
      // (Streak logic handled in sticker collection)
      
    } else {
      // Count DOWN in main game
      timeLeft -= dt;
      
      // Update timer pulse animation when <= 10 seconds
      if (timeLeft <= 10) {
        timerPulsePhase += dt * 4; // Pulse speed (4 Hz)
      }
      
      // Award +5 points per second survived (using integer seconds tick)
      const currentSecondTick = Math.floor(RUN_TIME - timeLeft);
      if (currentSecondTick > lastSecondTick) {
        points += 5;
        lastSecondTick = currentSecondTick;
      }

      // Final 10 seconds beep each second
      const sec = Math.ceil(timeLeft);
      if (sec !== lastSecondCeil) {
        lastSecondCeil = sec;
        if (sec <= 10 && sec > 0) {
          playSfx(assets.finalSeconds, performance.now(), 0);
        }
      }

      if (timeLeft <= 0) {
        timeLeft = 0;
        updateHud();
        beginOutOfTimeSequence();
        return;
      }
      
      // Main game: Decrement shield invulnerability timer
      if (mainGameShieldInvulnerable) {
        mainGameShieldInvulnerableTimer -= dt;
        if (mainGameShieldInvulnerableTimer <= 0) {
          mainGameShieldInvulnerable = false;
          mainGameShieldInvulnerableTimer = 0;
        }
      }
      
      // Main game: Decrement shield hit freeze timer
      if (mainGameShieldHitFreeze) {
        mainGameShieldHitFreezeTimer -= dt;
        if (mainGameShieldHitFreezeTimer <= 0) {
          mainGameShieldHitFreeze = false;
          mainGameShieldHitFreezeTimer = 0;
        }
      }
    }

    // Continuous movement when holding left/right
    if (holdDir !== 0 && !(gameMode === "SURVIVAL" && survivalShieldHitFreeze) && !(gameMode !== "SURVIVAL" && mainGameShieldHitFreeze)) {
      // Use reduced speed during DRUNK powerup
      const moveSpeed = activePowerupType === "DRUNK" ? DRUNK_MOVE_SPEED : HOLD_MOVE_SPEED;
      playerX = clamp(playerX + holdDir * moveSpeed * dt, PLAYER_MARGIN, W - PLAYER_MARGIN);
    }

    // Update player rotation (visual only)
    // Set target rotation based on input
    if (holdDir < 0) {
      playerTargetRotation = PLAYER_ROT_LEFT;
    } else if (holdDir > 0) {
      playerTargetRotation = PLAYER_ROT_RIGHT;
    } else {
      playerTargetRotation = PLAYER_ROT_NEUTRAL;
    }
    // Smooth lerp toward target
    playerRotation += (playerTargetRotation - playerRotation) * PLAYER_ROT_SNAP_SPEED;
    // Clamp near-zero to avoid jitter
    if (Math.abs(playerRotation) < 0.001) playerRotation = 0;

      
      // Main game: Decrement time warp timer
      if (mainGameTimeWarpActive) {
        mainGameTimeWarpTimer -= dt;
        
        // Beep every 1 second (12 beeps total over 12 seconds)
        mainGameTimeWarpBeepTimer += dt;
        if (mainGameTimeWarpBeepTimer >= 1.0) {
          // Use different sound for last 3 seconds
          const timeSound = mainGameTimeWarpTimer <= 3 ? assets.timerMenu : assets.clockTick;
          playSfx(timeSound, performance.now(), 0);
          mainGameTimeWarpBeepTimer -= 1.0; // Reset for next beep
        }
        
        if (mainGameTimeWarpTimer <= 0) {
          mainGameTimeWarpActive = false;
          mainGameTimeWarpTimer = 0;
          mainGameTimeWarpBeepTimer = 0;
          
          // Play TIME WARP end sound
          playSfx(assets.clockEnd, performance.now(), 0.8);
          
          // Restore music volume
          if (musicGain) {
            musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
          }
        }
      }
    
    // Apply time warp slow-down in survival mode, or freeze during shield hit
    let effectiveScrollSpeed = WORLD_SCROLL_SPEED;
    if (gameMode === "SURVIVAL") {
      if (survivalShieldHitFreeze) {
        effectiveScrollSpeed = 0; // Complete freeze during shield hit
      } else if (survivalTimeWarpActive) {
        effectiveScrollSpeed = 200; // Slow down during time warp (was 250)
      }
    } else {
      if (mainGameShieldHitFreeze) {
        effectiveScrollSpeed = 0; // Complete freeze during shield hit
      } else if (mainGameTimeWarpActive) {
        effectiveScrollSpeed = 200; // Slow down during time warp in main game
      }
    }
    const dy = effectiveScrollSpeed * dt;
    
    // Spawn (scale timer with TIME WARP speed to prevent clustering)
    const spawnTimerScale = effectiveScrollSpeed / WORLD_SCROLL_SPEED;
    spawnTimer -= dt * spawnTimerScale;
    if (spawnTimer <= 0) {
      spawnWave();
      spawnTimer = nextSpawnDelay();
    }

    // Update powerup effects
    if (scoreMultiplier > 1 && performance.now() >= powerupEffectEndTime) {
      // Powerup expired - play expiration sound and switch back to main music
      if (activePowerupType === "2X") {
        playSfx(assets.magnetEnd, performance.now(), 0.75);
      } else if (activePowerupType === "DRUNK") {
        playSfx(assets.belch, performance.now(), 0.75);
      }
      scoreMultiplier = 1;
      activePowerupType = null;
      drunkWobblePhase = 0;
      drunkGhostWobblePhase = 0;
      // Switch back to main game music (only in main game, not survival)
      if (gameMode !== "SURVIVAL") {
        switchMusicTrack('main').catch(err => console.warn('Failed to switch back to main music:', err));
      }
    }

    // Update DRUNK wobble phase
    if (activePowerupType === "DRUNK") {
      drunkWobblePhase += dt * 4; // 4 rad/s wobble speed
      drunkGhostWobblePhase += dt * 6.5; // 6.5 rad/s for ghost images (different rate)
    }

    // Guaranteed powerup spawns at specific times (but NOT in boss level or secret level)
    if (!isKonamiLevel && state !== STATE.FINAL_LEVEL) {
      // SHIELD spawns in first 5 seconds of every level (random time per level)
      if (!shieldSpawnedThisLevel && timeLeft <= shieldSpawnTime) {
        spawnShieldPowerup();
        shieldSpawnedThisLevel = true;
      }
      
      // Random powerups (2X, DRUNK, TIME) spawn at predetermined times
      if (powerupsSpawnedThisLevel.length === 0 && timeLeft <= firstPowerupSpawnTime) {
        attemptSpawnPowerupSticker();
      } else if (powerupsSpawnedThisLevel.length === 1 && timeLeft <= secondPowerupSpawnTime) {
        attemptSpawnPowerupSticker();
      }
    }

    // Earth intro
    if (earthActive) {
      earthY += dy;
      if (earthY > H + 260) earthActive = false;
    }

    // Move entities
    for (const o of obstacles) {
      o.y += dy;
      // Asteroids don't spin in levels 1-3 (spin is always 0)
    }

    for (const s of stickers) s.y += dy;

    // Apply magnetism to regular stickers when 2X powerup is active
    if (activePowerupType === "2X") {
      const newStickersInRadius = new Set();
      
      for (const s of stickers) {
        if (s.collected || !s.active) continue; // Skip collected or inactive stickers
        
        // Magnetism: 200px radius pull effect
        const dx = playerX - s.x;
        const dyMag = playerEntranceY - s.y;
        const distance = Math.sqrt(dx * dx + dyMag * dyMag);
        const magnetRadius = 200;
        
        if (distance < magnetRadius && distance > 0) {
          // Track this sticker
          newStickersInRadius.add(s);
          
          // Pulse when sticker enters radius for first time
          if (!magnetismStickersInRadius.has(s)) {
            magnetismPulse = Math.min(magnetismPulse + 0.5, 1.0); // Add pulse intensity
          }
          
          // Very strong pull that overcomes downward scroll
          const pullStrength = 1 - (distance / magnetRadius);
          const magnetForce = pullStrength * pullStrength * 500; // Max 500px/s pull
          
          // Normalize direction and apply force
          const dirX = dx / distance;
          const dirY = dyMag / distance;
          s.x += dirX * magnetForce * dt;
          s.y += dirY * magnetForce * dt; // This can overcome scroll
        }
      }
      
      // Update tracking set
      magnetismStickersInRadius = newStickersInRadius;
      
      // Decay pulse over time
      magnetismPulse = Math.max(magnetismPulse - dt * 3, 0);
    } else {
      // Clear tracking when 2X powerup ends
      magnetismStickersInRadius.clear();
      magnetismPulse = 0;
    }

    // Move powerup stickers (update pulse but movement is with world)
    for (const p of powerupStickers) {
      if (p.collected) continue; // Skip collected stickers
      
      p.y += dy; // Same speed as world scroll
      p.pulsePhase += dt * 3; // 3 rad/s pulse speed
      
      // Magnetism: Strong drift toward player when close
      const dx = playerX - p.x;
      const dyMag = playerEntranceY - p.y;
      const distance = Math.sqrt(dx * dx + dyMag * dyMag);
      const magnetRadius = 100; // Start pulling when within 100px
      
      if (distance < magnetRadius && distance > 0) {
        // Very strong pull that overcomes downward scroll
        const pullStrength = 1 - (distance / magnetRadius);
        const magnetForce = pullStrength * pullStrength * 500; // Max 500px/s pull
        
        // Normalize direction and apply force
        const dirX = dx / distance;
        const dirY = dyMag / distance;
        p.x += dirX * magnetForce * dt;
        p.y += dirY * magnetForce * dt; // This can overcome scroll
      }
    }

    // Mark off-screen entities as inactive (reduce GC pressure vs filter)
    for (const o of obstacles) {
      if (o.y >= H + 260) o.active = false;
    }
    for (const s of stickers) {
      if (s.y >= H + 180) s.active = false;
    }

    // Collisions
    const px = playerX;
    const py = playerEntranceY;
    const pr = PLAYER_COLLISION_RADIUS;

    for (const o of obstacles) {
      if (!o.active) continue;
      // Skip collision if invulnerable from shield consumption
      if (gameMode === "SURVIVAL" && survivalShieldInvulnerable) continue;
      if (gameMode !== "SURVIVAL" && mainGameShieldInvulnerable) continue;
      if (ellipseHit(px, py, pr, o.x, o.y, o.rx, o.ry, o.angle)) {
        handleFailureCollision(o);
        return;
      }
    }

    for (const s of stickers) {
      if (s.collected || !s.active) continue;
      const sr = Math.min(s.w, s.h) * 0.89;
      if (circleHit(px, py, pr, s.x, s.y, sr)) {
        s.collected = true;
        stickersCollected += 1;
        stickerTotalCollected += 1;
        stickersThisLevel += 1;
        
        // Award points (thick stickers worth +100, normal worth +25)
        const basePoints = s.isThick ? 100 : 25;
        
        // SURVIVAL MODE: Streak-based multiplier system
        if (gameMode === "SURVIVAL") {
          // Determine streak contribution (thick = 2, normal = 1)
          const streakIncrement = s.isThick ? 2 : 1;
          
          // Reset/start the streak timer
          streakTimer = STREAK_WINDOW; // 3 seconds
          
          // Increment streak count
          streakCount += streakIncrement;
          
          // Check if we've reached a new multiplier tier
          const newMultiplier = Math.floor(streakCount / STICKERS_PER_TIER) + 1;
          
          if (newMultiplier > streakMultiplier) {
            // TIER UP!
            streakMultiplier = newMultiplier;
            triggerTierUpEffects();
          }
          
          // Calculate points with current multiplier
          const earnedPoints = basePoints * streakMultiplier;
          points += earnedPoints;
          
          // Always show floating text with tier color
          const textColor = getMultiplierColor(streakMultiplier);
          
          floatingTexts.push({
            x: s.x,
            y: s.y,
            text: `+${earnedPoints}`,
            timer: 0.5,
            maxTime: 0.5,
            color: textColor
          });
        } else {
          // MAIN GAME MODE: Use normal powerup multiplier
          const effectiveMultiplier = scoreMultiplier;
          const earnedPoints = basePoints * effectiveMultiplier;
          points += earnedPoints;
          
          // Show floating text for thick stickers or when multiplier active
          const shouldShowText = s.isThick || scoreMultiplier > 1;
          if (shouldShowText) {
            let textColor = THEME_COLOR; // Default to theme color
            if (scoreMultiplier > 1) {
              textColor = activePowerupType === "2X" ? '#43a0e6' : '#FF9800';
            }
          
            floatingTexts.push({
              x: s.x,
              y: s.y,
              text: `+${earnedPoints}`,
              timer: 0.5,
              maxTime: 0.5,
              color: textColor
            });
          }
        }
        
        // Spawn particles at sticker position
        spawnParticles(s.x, s.y, 5);
        
        // Check for extra life every 20 stickers in current level - NOT in survival mode
        if (gameMode !== "SURVIVAL" && stickersThisLevel % EXTRA_LIFE_STICKER_THRESHOLD === 0 && lives < LIVES_MAX) {
          lives += 1;
          points += 69; // +69 bonus for extra life trigger
          playSfx(assets.extraLife, performance.now(), 0); // Play extra life sound
          
          // Trigger life gain animation
          const hudLifeIcon = document.getElementById('hudLifeIcon');
          if (hudLifeIcon) {
            hudLifeIcon.classList.remove('life-loss', 'life-gain');
            void hudLifeIcon.offsetWidth; // Force reflow
            hudLifeIcon.classList.add('life-gain');
            setTimeout(() => hudLifeIcon.classList.remove('life-gain'), 600);
          }
          
          // Flash lives text green
          if (livesText) {
            livesText.classList.remove('life-text-loss', 'life-text-gain');
            void livesText.offsetWidth; // Force reflow
            livesText.classList.add('life-text-gain');
            setTimeout(() => livesText.classList.remove('life-text-gain'), 600);
          }
        }
        
        // Play appropriate sound (thick stickers have special sound)
        playSfx(s.isThick ? assets.thickGrab : assets.grab, performance.now(), 0);
        updateHud();
        // Stickers are now bonus only, no win condition
      }
    }

    // Powerup sticker collection
    for (const p of powerupStickers) {
      if (p.collected) continue;
      const pr = Math.min(p.w, p.h) * 0.89;
      if (circleHit(px, py, PLAYER_COLLISION_RADIUS, p.x, p.y, pr)) {
        p.collected = true;
        
        // Award points based on powerup type
        let powerupPoints = 0;
        let textColor = '#FFD700';
        
        // Activate powerup effects
        if (p.type === "2X") {
          powerupPoints = 200;
          textColor = '#43a0e6'; // Blue
          scoreMultiplier = 2;
          powerupEffectEndTime = performance.now() + 12000; // 12 seconds
          activePowerupType = "2X";
          playSfx(assets.getMagnet, performance.now(), 1.0);
          // Switch to 2X music
          switchMusicTrack('main2X').catch(err => console.warn('Failed to switch to 2X music:', err));
          // Track for TURNT UP achievement (current level only, committed on level completion)
          currentLevelPowerups.twoX += 1;
        } else if (p.type === "DRUNK") {
          powerupPoints = 420;
          textColor = '#FF9800'; // Orange
          scoreMultiplier = 3;
          powerupEffectEndTime = performance.now() + 10000; // 10 seconds
          activePowerupType = "DRUNK";
          playSfx(assets.getBeer, performance.now(), 1.0);
          // Switch to TURNT music
          switchMusicTrack('mainTurnt').catch(err => console.warn('Failed to switch to TURNT music:', err));
          // Track for TURNT UP achievement (current level only, committed on level completion)
          currentLevelPowerups.drunk += 1;
        } else if (p.type === "SHIELD") {
          powerupPoints = 250;
          textColor = '#ff0055'; // Red shield color (matches invulnerability bars)
          
          // MAIN GAME: Activate shield protection (one-time use)
          if (gameMode !== "SURVIVAL") {
            if (mainGameShieldCount < 3) {
              mainGameShieldCount++;
            }
            playSfx(assets.shieldGet, performance.now(), 0.8); // SHIELD collection sound
          } else {
            // SURVIVAL MODE: Add shield to inventory (max 3)
            if (survivalShieldCount < 3) {
              survivalShieldCount++;
            }
            playSfx(assets.oneUp, performance.now(), 1.0);
          }
        } else if (p.type === "TIME") {
          powerupPoints = 300;
          textColor = '#c600ff'; // Purple time warp color
          
          // MAIN GAME: Activate time warp effect
          if (gameMode !== "SURVIVAL") {
            mainGameTimeWarpActive = true;
            mainGameTimeWarpTimer = 12; // 12 seconds duration
            mainGameTimeWarpBeepTimer = 0; // Start beep timer
            
            // Lower music volume during time warp
            if (musicGain) {
              musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN * 0.3; // Reduce to 30%
            }
            
            playSfx(assets.clockGet, performance.now(), 0.8); // TIME WARP collection sound
          } else {
            // SURVIVAL MODE: Activate time warp effect
            survivalTimeWarpActive = true;
            survivalTimeWarpTimer = 12; // 12 seconds duration
            survivalTimeWarpBeepTimer = 0; // Start beep timer
            
            // Lower music volume during time warp
            if (musicGain) {
              musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN * 0.3; // Reduce to 30%
            }
            
            playSfx(assets.clockGet, performance.now(), 0.8); // TIME WARP collection sound
          }
        }
        
        // Add points
        points += powerupPoints;
        
        // Show floating text
        floatingTexts.push({
          x: p.x,
          y: p.y,
          text: `+${powerupPoints}`,
          timer: 0.5,
          maxTime: 0.5,
          color: textColor
        });
        
        // Spawn particles at powerup position
        spawnParticles(p.x, p.y, 5);
      }
    }

    // Remove off-screen powerup stickers
    powerupStickers = powerupStickers.filter(p => !p.collected && p.y < H + 180);

    updateHud();
  }

  function draw() {
    // Ghost trail effect during TIME warp - instead of clearing, fade previous frame
    if ((gameMode === "SURVIVAL" && survivalTimeWarpActive) || (gameMode !== "SURVIVAL" && mainGameTimeWarpActive)) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Semi-transparent black (lower = longer trails)
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    } else {
      // Normal clear for non-TIME warp
      ctx.clearRect(0, 0, W, H);
    }
    
    // ===== CREDITS SEQUENCE RENDERING =====
    if (creditsSequencePlaying) {
      drawCreditsSequence();
      return; // Don't draw normal game elements during credits
    }
    // ===== END CREDITS RENDERING =====
    
    // Apply screen shake
    ctx.save();
    ctx.translate(shakeOffsetX, shakeOffsetY);
    
    // Apply world wobble during DRUNK powerup (separate transform so we can restore before side bars)
    if (activePowerupType === "DRUNK") {
      ctx.save();
      const wobbleRadius = 8;
      const wobbleX = Math.cos(drunkWobblePhase) * wobbleRadius;
      const wobbleY = Math.sin(drunkWobblePhase) * wobbleRadius;
      ctx.translate(wobbleX, wobbleY);
    }

    // Background pattern fill (always covers)
    // Use sand background for secret level, normal background otherwise
    // Skip background during TIME warp to preserve ghost trails
    const currentBgPattern = isKonamiLevel ? sandBgPattern : bgPattern;
    const currentBgScale = isKonamiLevel ? sandBgScale : bgScale;
    const currentBgTileH = isKonamiLevel ? sandBgTileH : bgTileH;
    
    if (currentBgPattern && !((gameMode === "SURVIVAL" && survivalTimeWarpActive) || (gameMode !== "SURVIVAL" && mainGameTimeWarpActive))) {
      ctx.save();
      // Scale the pattern to match canvas width, then apply scroll offset
      ctx.scale(currentBgScale, currentBgScale);
      const off = (bgOffset % currentBgTileH) / currentBgScale;
      ctx.translate(0, off);
      ctx.fillStyle = currentBgPattern;
      // Fill extra to cover translation shift
      ctx.fillRect(0, -currentBgTileH / currentBgScale, W / currentBgScale, (H + currentBgTileH * 2) / currentBgScale);
      ctx.restore();
    }
    
    // Restore DRUNK wobble transform before drawing side bars (so bars stay stationary)
    if (activePowerupType === "DRUNK") {
      ctx.restore();
    }
    
    // Side bars during powerup effects (drawn above background, under everything else)
    // Combined rendering for better performance (single save/restore)
    if (scoreMultiplier > 1 || (gameMode === "SURVIVAL" && (survivalTimeWarpActive || survivalShieldInvulnerable)) || (gameMode !== "SURVIVAL" && (mainGameShieldInvulnerable || mainGameTimeWarpActive))) {
      ctx.save();
      
      // Powerup bars (2X or BEER)
      if (scoreMultiplier > 1) {
        // Flash at 320 bpm for 2X powerup (5.333 Hz), alternating between full and 30% opacity
        if (activePowerupType === "2X") {
          ctx.globalAlpha = Math.floor((performance.now() / 1000) * 5.333) % 2 === 0 ? 1.0 : 0.3;
        }
        const barColor = activePowerupType === "2X" ? '#43a0e6' : '#FF9800'; // Blue or Orange
        ctx.fillStyle = barColor;
        ctx.fillRect(0, 0, 10, H);
        ctx.fillRect(W - 10, 0, 10, H);
      }
      
      // Purple bars during time warp (drawn BEFORE red so red has priority)
      if ((gameMode === "SURVIVAL" && survivalTimeWarpActive) || (gameMode !== "SURVIVAL" && mainGameTimeWarpActive)) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#c600ff';
        ctx.fillRect(0, 0, 10, H);
        ctx.fillRect(W - 10, 0, 10, H);
      }
      
      // Red bars during shield invulnerability (drawn AFTER cyan to have priority)
      if ((gameMode === "SURVIVAL" && survivalShieldInvulnerable) || (gameMode !== "SURVIVAL" && mainGameShieldInvulnerable)) {
        ctx.globalAlpha = Math.floor((performance.now() / 1000) * 6) % 2 === 0 ? 0.8 : 0.4;
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(0, 0, 10, H);
        ctx.fillRect(W - 10, 0, 10, H);
      }
      
      ctx.restore();
    }
    
    // Re-apply DRUNK wobble for game objects
    if (activePowerupType === "DRUNK") {
      ctx.save();
      const wobbleRadius = 8;
      const wobbleX = Math.cos(drunkWobblePhase) * wobbleRadius;
      const wobbleY = Math.sin(drunkWobblePhase) * wobbleRadius;
      ctx.translate(wobbleX, wobbleY);
    }

    // Moon behind earth (pass 2) - render BEFORE earth
    if (moonActive && moonBehindEarth && (earthActive || state === STATE.START) && state !== STATE.FINAL_LEVEL && !isKonamiLevel) {
      const currentEarthY = (state === STATE.START) ? (H - earthDrawH) : earthY;
      const moonX = moonOffsetX;
      const moonY = currentEarthY + moonOffsetY;
      const scaledMoonW = Math.round(moonW * moonScale);
      const scaledMoonH = Math.round(moonH * moonScale);
      ctx.drawImage(assets.moon, moonX, moonY, scaledMoonW, scaledMoonH);
    }

    // Earth at bottom on start, otherwise scrolls (but NOT during final level or secret level)
    if ((earthActive || state === STATE.START) && state !== STATE.FINAL_LEVEL && !isKonamiLevel) {
      const y = (state === STATE.START) ? (H - earthDrawH) : earthY;
      // Round to even pixel for crisp rendering
      ctx.drawImage(assets.earth, 0, Math.round(y), W, earthDrawH);
    }

    // Moon in front of earth (pass 1) - render AFTER earth
    if (moonActive && !moonBehindEarth && (earthActive || state === STATE.START) && state !== STATE.FINAL_LEVEL && !isKonamiLevel) {
      const currentEarthY = (state === STATE.START) ? (H - earthDrawH) : earthY;
      const moonX = moonOffsetX;
      const moonY = currentEarthY + moonOffsetY;
      const scaledMoonW = Math.round(moonW * moonScale);
      const scaledMoonH = Math.round(moonH * moonScale);
      ctx.drawImage(assets.moon, moonX, moonY, scaledMoonW, scaledMoonH);
    }

    // Stickers
    for (const s of stickers) {
      if (s.collected || !s.active) continue;
      const stickerImg = s.isThick ? assets.thickSticker : assets.sticker;
      drawRotated(stickerImg, s.x, s.y, s.w, s.h, s.angle);
    }

    // Powerup stickers
    for (const p of powerupStickers) {
      if (p.collected) continue;
      // Pulse effect: 5% scale oscillation
      const pulseFactor = 1 + 0.05 * Math.sin(p.pulsePhase * Math.PI * 2);
      const drawW = p.w * pulseFactor;
      const drawH = p.h * pulseFactor;
      drawRotated(p.img, p.x, p.y, drawW, drawH, p.angle);
    }

    // Asteroids
    for (const o of obstacles) {
      if (!o.active) continue;
      // Use hit state image when crashed (if available)
      const img = (o.isCrashed && o.hitImg) ? o.hitImg : o.img;
      
      // Double vision effect for DRUNK - draw asteroid twice
      if (activePowerupType === "DRUNK") {
        ctx.save();
        ctx.globalAlpha = 0.30;
        const ghostWobbleRadius = 6;
        const ghostWobbleX = Math.cos(drunkGhostWobblePhase) * ghostWobbleRadius;
        const ghostWobbleY = Math.sin(drunkGhostWobblePhase) * ghostWobbleRadius;
        // Draw both ghost images with same alpha
        drawRotated(img, o.x + 30 + ghostWobbleX, o.y + ghostWobbleY, o.w, o.h, o.angle);
        drawRotated(img, o.x - 30 + ghostWobbleX, o.y + ghostWobbleY, o.w, o.h, o.angle);
        ctx.restore();
      }
      
      // Draw normal asteroid
      drawRotated(img, o.x, o.y, o.w, o.h, o.angle);
    }

    // Draw title screen boss flyby animation (after asteroids/stickers so it appears on top)
    if (titleBossAnimActive) {
      const bossImg = titleBossShowBren3 ? assets.bren3 : assets.bren1;
      if (bossImg) {
        const drawW = Math.round(178 * titleBossScale);
        const drawH = Math.round(139 * titleBossScale);
        const drawX = Math.round(titleBossX);
        const drawY = Math.round(H * 0.07); // Position near top (boss level height)
        
        // No transforms - draw directly on canvas
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transforms
        ctx.globalAlpha = 1.0;
        ctx.drawImage(bossImg, drawX, drawY, drawW, drawH);
        ctx.restore();
      }
    }

    // BOSS (FINAL_LEVEL or during intro sequence)
    if (state === STATE.FINAL_LEVEL || introSequencePlaying) {
      // Draw intro beam FIRST (before boss) so it appears behind
      if (introSequencePlaying && introBeamActive) {
        const bossH = (assets.bren1.height / assets.bren1.width) * bossW;
        const beamTop = BOSS_Y_STOP + (bossH * 0.6); // Start higher - 60% down the boss
        const beamBottom = PLAYER_Y; // End at top of player
        const fullBeamHeight = beamBottom - beamTop;
        const currentBeamHeight = fullBeamHeight * introBeamHeight; // Animate from 0 to full
        const beamCenterX = W / 2;
        const beamWidth = 80;
        
        // Draw glowing beam with multiple layers for better effect
        ctx.save();
        
        // Main beam gradient (more transparent)
        const gradient = ctx.createLinearGradient(0, beamTop, 0, beamTop + currentBeamHeight);
        gradient.addColorStop(0, 'rgba(224, 255, 0, 0.6)');
        gradient.addColorStop(0.3, 'rgba(224, 255, 0, 0.5)');
        gradient.addColorStop(0.7, 'rgba(224, 255, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(224, 255, 0, 0.3)');
        
        // Draw outer glow first
        ctx.shadowColor = 'rgba(224, 255, 0, 0.6)';
        ctx.shadowBlur = 40;
        ctx.fillStyle = gradient;
        ctx.fillRect(beamCenterX - beamWidth/2, beamTop, beamWidth, currentBeamHeight);
        
        // Draw inner highlight with stronger glow
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 20;
        const innerGradient = ctx.createLinearGradient(0, beamTop, 0, beamTop + currentBeamHeight);
        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        innerGradient.addColorStop(0.5, 'rgba(224, 255, 0, 0.2)');
        innerGradient.addColorStop(1, 'rgba(224, 255, 0, 0.1)');
        ctx.fillStyle = innerGradient;
        ctx.fillRect(beamCenterX - beamWidth/4, beamTop, beamWidth/2, currentBeamHeight);
        
        ctx.restore();
      }
      
      // Draw intro stickers flying through beam
      if (introStickers.length > 0) {
        ctx.save();
        const now = Date.now();
        
        // Calculate boss ascent offset for stickers
        const bossAscentOffset = introBossAscending ? (bossY - introBossStartAscendY) : 0;
        
        // Update and draw each sticker
        for (let i = introStickers.length - 1; i >= 0; i--) {
          const sticker = introStickers[i];
          
          // Skip if already completed (reached destination)
          if (sticker.completed) {
            // Draw at final position, adjusted for boss ascent
            const stickerImg = sticker.isThick ? assets.thickSticker : assets.sticker;
            if (stickerImg) {
              ctx.save();
              ctx.globalAlpha = 1; // Stay fully visible
              ctx.translate(sticker.x, sticker.y + bossAscentOffset); // Move with boss
              ctx.rotate(sticker.rotation * Math.PI / 180);
              ctx.drawImage(stickerImg, -15, -15, 30, 30);
              ctx.restore();
            }
            continue;
          }
          
          const elapsed = now - sticker.startTime;
          const progress = Math.min(elapsed / sticker.duration, 1);
          
          // Mark as completed when reached destination
          if (progress >= 1) {
            sticker.completed = true;
            sticker.x = sticker.endX;
            sticker.y = sticker.endY;
            sticker.rotation = sticker.targetRotation;
            continue;
          }
          
          // Ease-in interpolation
          const easeProgress = progress * progress;
          
          // Update position
          sticker.x = sticker.startX + (sticker.endX - sticker.startX) * easeProgress;
          sticker.y = sticker.startY + (sticker.endY - sticker.startY) * easeProgress;
          sticker.rotation = sticker.targetRotation * easeProgress;
          
          // Draw sticker (no fade)
          const stickerImg = sticker.isThick ? assets.thickSticker : assets.sticker;
          if (stickerImg) {
            ctx.save();
            ctx.globalAlpha = 1; // Stay fully visible
            ctx.translate(sticker.x, sticker.y);
            ctx.rotate(sticker.rotation * Math.PI / 180);
            ctx.drawImage(stickerImg, -15, -15, 30, 30); // 30x30 sticker centered
            ctx.restore();
          }
        }
        
        ctx.restore();
      }
      
      // Draw boss asteroids BEHIND boss
      for (const ast of bossArmedAsteroids) {
        // Only skip asteroids that have been thrown and went off-screen (marked inactive)
        // During arming phase: thrown=false, active=false -> DRAW
        // During throwing: thrown=true, active=true -> DRAW
        // Off-screen: thrown=true, active=false -> SKIP
        if (ast.thrown && !ast.active) continue;
        
        let drawX = ast.x;
        let drawY = ast.y;
        
        // Add wiggle effect if wiggling
        if (ast.wiggling) {
          const wiggleSpeed = 20; // Hz (oscillations per second)
          const wiggleAmount = 5; // pixels
          const offset = Math.sin(ast.wiggleTimer * wiggleSpeed * Math.PI * 2) * wiggleAmount;
          drawX += offset;
        }
        
        // Use boss-colored asteroids
        const bossAsteroids = asteroidsByLevel['boss_0'] || asteroidsByLevel[0];
        const astImg = ast.isCrashed ? bossAsteroids.asteroid1Hit : bossAsteroids.asteroid1;
        drawRotated(astImg, drawX, drawY, BOSS_ASTEROID_SIZE, BOSS_ASTEROID_SIZE, ast.angle);
      }
      
      // Draw boss with correct image based on phase or intro state
      let bossImg;
      if (introSequencePlaying) {
        // During intro, use intro-specific boss image
        if (introBossImage === 'bren3') {
          bossImg = assets.bren3;
        } else if (introBossImage === 'bren2') {
          bossImg = assets.bren2;
        } else {
          bossImg = assets.bren1;
        }
      } else if (bossPhase === 4 || bossPhase === 5) {
        bossImg = assets.bren3; // Victory image
      } else if (bossShowBren2) {
        bossImg = assets.bren2; // Blinking
      } else {
        bossImg = assets.bren1; // Normal
      }
      
      const bossH = (bossImg.height / bossImg.width) * bossW;
      const bossX = Math.round(W/2 - bossW/2);
      const bossDrawW = Math.round(bossW);
      const bossDrawH = Math.round(bossH);
      
      // Apply rotation if in victory phase
      if (bossPhase === 4 && bossAngle) {
        ctx.save();
        ctx.translate(Math.round(bossX + bossDrawW/2), Math.round(bossY + bossDrawH/2));
        ctx.rotate(bossAngle);
        ctx.drawImage(bossImg, -bossDrawW/2, -bossDrawH/2, bossDrawW, bossDrawH);
        ctx.restore();
      } else {
        ctx.drawImage(bossImg, bossX, Math.round(bossY), bossDrawW, bossDrawH);
      }
      
      // Draw boss taunt text if active (boss level or intro)
      const displayText = introSequencePlaying ? introBossText : bossText;
      if ((bossTextTimer > 0 && bossText) || (introSequencePlaying && introBossText)) {
        ctx.save();
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.fillStyle = THEME_COLOR; // Theme color
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Position text to the right of the boss
        const textX = bossX + bossW + 4;
        const textY = bossY + bossH/2;
        const maxWidth = W - textX - 15; // Leave 15px margin on right
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Word wrap the text
        const words = displayText.toUpperCase().split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        
        // Draw each line
        const lineHeight = 16;
        const startY = textY - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((line, index) => {
          ctx.fillText(line, textX, startY + (index * lineHeight));
        });
        
        ctx.restore();
      }
    }

    // Draw particles (before player so they appear behind)
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      // Use particle's color with current alpha
      if (p.color.startsWith('#')) {
        // Hex color - convert to rgba with alpha
        const r = parseInt(p.color.slice(1, 3), 16);
        const g = parseInt(p.color.slice(3, 5), 16);
        const b = parseInt(p.color.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } else {
        // Already rgba format - update alpha
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha})`);
      }
      // Draw square particles for pixel art aesthetic
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    // Draw magnetism circle (before player trail so it's behind everything)
    if (activePowerupType === "2X") {
      const visualRadius = 90; // Visual circle size (smaller than actual 200px effect radius)
      const baseAlpha = 0.2;
      const pulseAlpha = magnetismPulse * 0.3; // Extra brightness during pulse
      const totalAlpha = baseAlpha + pulseAlpha;
      
      ctx.save();
      
      // Draw outer glow
      const gradient = ctx.createRadialGradient(playerX, playerY, visualRadius * 0.7, playerX, playerY, visualRadius);
      gradient.addColorStop(0, `rgba(67, 160, 230, ${totalAlpha})`);
      gradient.addColorStop(1, 'rgba(67, 160, 230, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(playerX, playerY, visualRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw bright circle edge
      ctx.strokeStyle = `rgba(67, 160, 230, ${0.4 + pulseAlpha})`;
      ctx.lineWidth = 5 + magnetismPulse * 3;
      ctx.shadowColor = '#43a0e6';
      ctx.shadowBlur = 10 + magnetismPulse * 10;
      ctx.beginPath();
      ctx.arc(playerX, playerY, visualRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
    }
    
    // Draw player trail (before player so it appears behind)
    if (playerTrail.length > 0) {
      ctx.save();
      
      // Determine trail color based on powerup state
      let trailColor = THEME_COLOR; // Default to theme color
      if (activePowerupType === "2X") {
        trailColor = '#aa23de'; // Purple for 2X
      } else if (activePowerupType === "DRUNK") {
        trailColor = '#FF9800'; // Orange for DRUNK (matches powerup color)
      }
      
      // Draw trail as gradient segments
      for (let i = 0; i < playerTrail.length; i++) {
        const t = playerTrail[i];
        const lifeFactor = (t.life / t.maxLife); // 1.0 at spawn, 0.0 at end
        const positionFactor = (i / Math.max(1, playerTrail.length - 1)); // 0.0 at oldest, 1.0 at newest
        const alpha = lifeFactor * 0.8; // Higher base opacity (0.8 max)
        
        // Add puttering effect for DRUNK powerup (varying size)
        let sizeVariation = 1.0;
        if (activePowerupType === "DRUNK") {
          // Random size variation using time and position for chaotic puttering
          const putter = Math.sin(Date.now() * 0.01 + i * 0.5) * 0.3 + 0.7; // Range: 0.7 to 1.0
          sizeVariation = putter;
        }
        
        // Maintain larger size - trail stays thick, only fades based on life
        const width = TRAIL_WIDTH * (0.5 + 0.5 * positionFactor) * lifeFactor * sizeVariation;
        
        // Parse color and add alpha
        let finalColor;
        if (trailColor.startsWith('hsl')) {
          // HSL color - convert to hsla
          finalColor = trailColor.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
        } else if (trailColor.startsWith('#')) {
          // Hex color - convert to rgba
          const r = parseInt(trailColor.slice(1, 3), 16);
          const g = parseInt(trailColor.slice(3, 5), 16);
          const b = parseInt(trailColor.slice(5, 7), 16);
          finalColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
          const rgb = getThemeRgb();
          finalColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        }
        
        // Draw trail point as circle with glow
        ctx.shadowColor = trailColor;
        ctx.shadowBlur = width * 1.5;
        ctx.fillStyle = finalColor;
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(width, 4), 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Player - only draw when in gameplay states (not on title or menu), UNLESS a game has been played (keep frozen state visible), OR during intro sequence
    if ((state !== STATE.TITLE && state !== STATE.START) || hasPlayedGame || introSequencePlaying) {
      const playerImg = playerIsCrashed ? assets.playerCrash : assets.player;
      // Apply rotation (visual only, does not affect gameplay)
    
    // Apply DRUNK wobble effect if active
    let wobbleX = Math.round(playerX);
    let wobbleY = Math.round(playerEntranceY);
    
    // Apply intro shake effect (player only, not screen)
    if (introPlayerShaking) {
      const shakeX = (Math.random() - 0.5) * introPlayerShakeAmount * 2;
      const shakeY = (Math.random() - 0.5) * introPlayerShakeAmount * 2;
      wobbleX += shakeX;
      wobbleY += shakeY;
    }
    
    if (activePowerupType === "DRUNK") {
      const wobbleRadius = 8; // pixels
      wobbleX = Math.round(playerX + Math.cos(drunkWobblePhase) * wobbleRadius);
      wobbleY = Math.round(playerEntranceY + Math.sin(drunkWobblePhase) * wobbleRadius);
    }
    
    // Double vision effect for DRUNK - draw player twice
    if (activePowerupType === "DRUNK") {
      ctx.save();
      ctx.globalAlpha = 0.30;
      const ghostWobbleRadius = 6;
      const ghostWobbleX = Math.cos(drunkGhostWobblePhase) * ghostWobbleRadius;
      const ghostWobbleY = Math.sin(drunkGhostWobblePhase) * ghostWobbleRadius;
      // Draw right ghost
      ctx.translate(wobbleX + 30 + ghostWobbleX, wobbleY + ghostWobbleY);
      ctx.rotate(playerRotation);
      ctx.drawImage(playerImg, -PLAYER_W/2, -PLAYER_H/2, PLAYER_W, PLAYER_H);
      // Reset and draw left ghost
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      ctx.globalAlpha = 0.30; // Maintain alpha
      ctx.translate(wobbleX - 30 + ghostWobbleX, wobbleY + ghostWobbleY);
      ctx.rotate(playerRotation);
      ctx.drawImage(playerImg, -PLAYER_W/2, -PLAYER_H/2, PLAYER_W, PLAYER_H);
      ctx.restore();
    }
    
    // Draw normal player
    ctx.save();
    
    // Apply strong red tint during shield invulnerability (flashes like side bars)
    if ((gameMode === "SURVIVAL" && survivalShieldInvulnerable) || (gameMode !== "SURVIVAL" && mainGameShieldInvulnerable)) {
      const isFlashOn = Math.floor((performance.now() / 1000) * 6) % 2 === 0;
      if (isFlashOn) {
        // Strong red color matrix filter
        ctx.filter = 'saturate(0%) brightness(1.5) sepia(100%) hue-rotate(320deg) saturate(400%)';
      }
    }
    
    ctx.translate(wobbleX, wobbleY);
    ctx.rotate(playerRotation);
    ctx.drawImage(playerImg, -PLAYER_W/2, -PLAYER_H/2, PLAYER_W, PLAYER_H);
    ctx.restore();
    } // End player drawing conditional

    // Draw floating texts (thick sticker +100 feedback)
    if (floatingTexts.length > 0) {
      ctx.save();
      ctx.font = "bold 20px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      for (const ft of floatingTexts) {
        const lifeFactor = ft.timer / ft.maxTime; // 1.0 at start, 0.0 at end
        
        // Scale animation: pop up quickly, then shrink slightly as it fades
        let scale;
        if (lifeFactor > 0.8) {
          // First 20% of life: scale from 0 to 1.3 (pop effect)
          const popProgress = (lifeFactor - 0.8) / 0.2; // 0 to 1
          scale = popProgress * 1.3;
        } else if (lifeFactor > 0.6) {
          // Next 20%: settle from 1.3 to 1.0 (bounce)
          const settleProgress = (lifeFactor - 0.6) / 0.2;
          scale = 1.3 - (settleProgress * 0.3);
        } else {
          // Final 60%: stay at 1.0 then shrink slightly
          scale = 1.0 - ((1.0 - lifeFactor / 0.6) * 0.2);
        }
        
        // Alpha: fade out in last 40% of life
        const alpha = lifeFactor > 0.6 ? 1.0 : (lifeFactor / 0.6);
        
        // Use text color (green/orange for powerups, yellow otherwise)
        const baseColor = ft.color || '#FFD700';
        // Convert hex to rgba with alpha
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        
        // Apply scale transform efficiently
        ctx.translate(ft.x, ft.y);
        ctx.scale(scale, scale);
        ctx.fillText(ft.text, 0, 0);
        // Reset transform for next text
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      
      ctx.restore();
    }
    
    // Progress Breadcrumbs (Level Indicators) - only during gameplay states (NOT on secret level, NOT in survival mode)
    if ((state === STATE.PLAY || state === STATE.FINAL_LEVEL || state === STATE.COUNTDOWN) && !isKonamiLevel && gameMode === "MAIN") {
      // Sticker Progress Bar (left side)
      const progressBarWidth = 90; // Match hudBox width (approximately 1/3 of 360px minus gaps)
      const progressBarHeight = 7;
      const progressBarX = 90 - (progressBarWidth / 2); // Centered between left edge and timer
      const progressBarY = 62 - (progressBarHeight / 2); // Same Y as dots, adjusted for height
      
      // Calculate progress (0-20 stickers, then resets)
      const progressStickers = stickersThisLevel % EXTRA_LIFE_STICKER_THRESHOLD;
      const progressRatio = progressStickers / EXTRA_LIFE_STICKER_THRESHOLD;
      const isComplete = progressStickers === 0 && stickersThisLevel > 0;
      
      // Color interpolation from yellow to green (always yellow regardless of theme)
      const yellowColor = { r: 243, g: 226, b: 0 }; // #f3e200 (original yellow)
      const greenColor = { r: 76, g: 175, b: 80 }; // #4CAF50
      const r = Math.round(yellowColor.r + (greenColor.r - yellowColor.r) * progressRatio);
      const g = Math.round(yellowColor.g + (greenColor.g - yellowColor.g) * progressRatio);
      const b = Math.round(yellowColor.b + (greenColor.b - yellowColor.b) * progressRatio);
      const barColor = `rgb(${r}, ${g}, ${b})`;
      
      ctx.save();
      ctx.lineWidth = 1.5;
      
      // Draw background stroke (empty bar)
      ctx.strokeStyle = THEME_COLOR;
      ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
      
      // Draw filled progress
      if (progressRatio > 0 || isComplete) {
        const fillWidth = isComplete ? progressBarWidth : progressBarWidth * progressRatio;
        const fillColor = isComplete ? '#4CAF50' : barColor;
        
        // Quick pop effect when just completed
        let pulseScale = 1.0;
        if (isComplete) {
          // Trigger pop animation on completion
          if (progressBarCompleteTime === 0 || Date.now() - progressBarCompleteTime > 500) {
            progressBarCompleteTime = Date.now();
          }
          
          const timeSinceComplete = Date.now() - progressBarCompleteTime;
          if (timeSinceComplete < 150) {
            // Quick pop: 0-150ms, scale up then back down
            const popProgress = timeSinceComplete / 150; // 0 to 1
            pulseScale = 1.0 + (Math.sin(popProgress * Math.PI) * 0.2); // Pop to 1.2 and back
          }
        } else {
          progressBarCompleteTime = 0; // Reset when not complete
        }
        
        ctx.fillStyle = fillColor;
        ctx.save();
        if (pulseScale !== 1.0) {
          ctx.translate(progressBarX + progressBarWidth / 2, progressBarY + progressBarHeight / 2);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-(progressBarX + progressBarWidth / 2), -(progressBarY + progressBarHeight / 2));
        }
        ctx.fillRect(progressBarX, progressBarY, fillWidth, progressBarHeight);
        ctx.restore();
        
        // Draw stroke on filled portion in matching color
        ctx.strokeStyle = fillColor;
        ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
      }
      
      ctx.restore();
      
      // Level Progress Dots (center) - only show in main game mode
      if (gameMode === "MAIN") {
        const dotRadius = 3.5;
        const dotSpacing = 16;
        const totalWidth = (dotSpacing * 3); // 3 gaps between 4 dots
        const startX = (W / 2) - (totalWidth / 2);
        const dotY = 62; // Positioned with padding between HUD bottom and timer
        
        ctx.save();
        ctx.lineWidth = 1.5;
        
        for (let i = 0; i < 4; i++) {
          const dotX = startX + (i * dotSpacing);
          const isBossLevel = (i === 3);
          // For boss level dot (i=3), check if we're in STATE.FINAL_LEVEL
          // For regular levels (i=0,1,2), check if currentLevel matches AND we're NOT in boss fight
          const isActive = isBossLevel 
            ? (state === STATE.FINAL_LEVEL) 
            : (state !== STATE.FINAL_LEVEL && currentLevel === i + 1);
          
          // Set colors
          const strokeColor = isBossLevel ? '#ff0000' : THEME_COLOR; // Red for boss, theme color for others
          const fillColor = strokeColor;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
          
          // Fill if this is the current level
          if (isActive) {
            ctx.fillStyle = fillColor;
            ctx.fill();
          }
          
          // Always draw stroke
          ctx.strokeStyle = strokeColor;
          ctx.stroke();
        }
        
        ctx.restore();
      }
    }
    
    // Timer display (centered below HUD, only during PLAY state)
    if (state === STATE.PLAY) {
      let displayTime;
      let isLowTime = false;
      
      if (gameMode === "SURVIVAL") {
        // Survival mode: show elapsed time (count up)
        displayTime = Math.floor(survivalTime);
        isLowTime = false; // No "low time" in survival
      } else {
        // Main game: show time left (count down)
        displayTime = Math.ceil(timeLeft);
        isLowTime = displayTime <= 10;
      }
      
      ctx.save();
      ctx.font = 'bold 16px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Color: yellow normally, red when <= 10 seconds (main game only)
      if (isLowTime) {
        // Pulse effect: oscillate between brighter and normal red
        const pulseFactor = 0.5 + 0.5 * Math.sin(timerPulsePhase * Math.PI * 2);
        const brightness = 200 + Math.floor(55 * pulseFactor); // 200-255
        ctx.fillStyle = `rgb(${brightness}, 0, 0)`;
        
        // Scale pulse: slightly larger when pulsing
        const scale = 1.0 + 0.1 * pulseFactor;
        ctx.translate(W / 2, 75);
        ctx.scale(scale, scale);
        ctx.translate(-W / 2, -75);
      } else {
        ctx.fillStyle = THEME_COLOR; // Theme color
      }
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // Format timer text based on game mode
      let timerText;
      if (gameMode === "SURVIVAL") {
        // MM:SS format for survival mode
        const minutes = Math.floor(displayTime / 60);
        const seconds = displayTime % 60;
        timerText = `${minutes}:${String(seconds).padStart(2, '0')}`;
      } else {
        // Simple seconds for main game
        timerText = String(displayTime);
      }
      
      ctx.fillText(timerText, W / 2, 75);
      ctx.restore();
    }
    
    // TIME warp countdown display (below main timer)
    if (state === STATE.PLAY && ((gameMode === "SURVIVAL" && survivalTimeWarpActive) || (gameMode !== "SURVIVAL" && mainGameTimeWarpActive))) {
      const timeRemaining = gameMode === "SURVIVAL" ? Math.ceil(survivalTimeWarpTimer) : Math.ceil(mainGameTimeWarpTimer);
      
      ctx.save();
      ctx.font = 'bold 20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#c600ff'; // Purple to match TIME side bars
      
      // Add text shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(String(timeRemaining), W / 2, 98); // Below main timer
      ctx.restore();
    }
    
    // Survival mode: Shield inventory display (centered between timer and left wall)
    if ((state === STATE.PLAY || state === STATE.COUNTDOWN) && gameMode === "SURVIVAL" && !isKonamiLevel && assets.powerupShield) {
      const shieldSize = 20; // Size of each shield icon
      const shieldSpacing = 4; // Space between shields
      const totalWidth = (shieldSize * 3) + (shieldSpacing * 2); // 3 shields with 2 gaps
      
      // Center between left wall (0) and timer (W/2)
      const centerX = (0 + W / 2) / 2; // = W/4
      const shieldY = 59; // Align with top of sticker progress bar
      const startX = centerX - (totalWidth / 2);
      
      ctx.save();
      
      // Debug: Log shield count occasionally
      if (Math.random() < 0.01) {
      }
      
      // Draw 3 shield slots
      for (let i = 0; i < 3; i++) {
        const x = startX + (i * (shieldSize + shieldSpacing));
        
        if (i < survivalShieldCount) {
          // Filled shield (full color)
          ctx.globalAlpha = 1.0;
          ctx.drawImage(assets.powerupShield, x, shieldY, shieldSize, shieldSize);
        } else {
          // Empty shield slot (greyed out)
          ctx.globalAlpha = 0.3;
          ctx.filter = 'grayscale(100%)';
          ctx.drawImage(assets.powerupShield, x, shieldY, shieldSize, shieldSize);
          ctx.filter = 'none';
        }
      }
      
      ctx.restore();
    }
    
    // Main game: Shield inventory display (centered between timer and right wall)
    if ((state === STATE.PLAY || state === STATE.FINAL_LEVEL || state === STATE.COUNTDOWN) && gameMode !== "SURVIVAL" && !isKonamiLevel && assets.powerupShield) {
      const shieldSize = 20; // Size of each shield icon
      const shieldSpacing = 4; // Space between shields
      const totalWidth = (shieldSize * 3) + (shieldSpacing * 2); // 3 shields with 2 gaps
      
      // Center between timer (W/2) and right wall (W)
      const centerX = (W / 2 + W) / 2; // = 3W/4
      const shieldY = 59; // Align with top of sticker progress bar
      const startX = centerX - (totalWidth / 2);
      
      ctx.save();
      
      // Draw 3 shield slots
      for (let i = 0; i < 3; i++) {
        const x = startX + (i * (shieldSize + shieldSpacing));
        
        if (i < mainGameShieldCount) {
          // Filled shield (full color)
          ctx.globalAlpha = 1.0;
          ctx.drawImage(assets.powerupShield, x, shieldY, shieldSize, shieldSize);
        } else {
          // Empty shield slot (greyed out)
          ctx.globalAlpha = 0.3;
          ctx.filter = 'grayscale(100%)';
          ctx.drawImage(assets.powerupShield, x, shieldY, shieldSize, shieldSize);
          ctx.filter = 'none';
        }
      }
      
      ctx.restore();
    }
    
    // SURVIVAL MODE: Draw streak multiplier progress bar and indicator
    if (gameMode === "SURVIVAL" && state === STATE.PLAY) {
      // Position centered between timer (W/2) and right wall (W)
      const centerX = (W / 2 + W) / 2; // = 3W/4
      const barY = 75; // Align with timer
      
      const barWidth = 80;
      const barHeight = 10;
      const barX = centerX - barWidth / 2;
      
      ctx.save();
      
      // Get current tier color
      const tierColor = getMultiplierColor(streakMultiplier);
      
      // Calculate progress within current tier
      const progressInTier = streakCount % STICKERS_PER_TIER;
      let fillPercent = progressInTier / STICKERS_PER_TIER;
      
      // Handle drain animation
      if (progressBarDraining && progressBarDrainTimer > 0) {
        const drainProgress = progressBarDrainTimer / 0.3;
        fillPercent = fillPercent * drainProgress;
      }
      
      // Draw flash effects (timers updated in update() function)
      if (flashOverlay && flashOverlay.elapsed < flashOverlay.duration) {
        const fadeProgress = flashOverlay.elapsed / flashOverlay.duration;
        const alpha = flashOverlay.alpha * (1 - fadeProgress);
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = flashOverlay.color;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1.0;
      }
      
      if (streakBreakFlash && streakBreakFlash.elapsed < streakBreakFlash.duration) {
        const fadeProgress = streakBreakFlash.elapsed / streakBreakFlash.duration;
        const alpha = streakBreakFlash.alpha * (1 - fadeProgress);
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = streakBreakFlash.color;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1.0;
      }
      
      // Apply pop scale (timer updated in update() function)
      if (progressBarPopScale !== 1.0) {
        ctx.translate(centerX, barY + barHeight / 2);
        ctx.scale(progressBarPopScale, progressBarPopScale);
        ctx.translate(-centerX, -(barY + barHeight / 2));
      }
      
      // Draw progress bar background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Draw progress bar fill
      const fillWidth = barWidth * fillPercent;
      ctx.fillStyle = tierColor;
      ctx.fillRect(barX, barY, fillWidth, barHeight);
      
      // Draw progress bar border
      ctx.strokeStyle = tierColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      ctx.restore();
      
      // Draw multiplier text (e.g., "2x", "3x") with pulse animation
      ctx.save();
      
      if (multiplierTextScale !== 1.0) {
        const textX = barX + barWidth + 8;
        const textY = barY + barHeight / 2;
        ctx.translate(textX, textY);
        ctx.scale(multiplierTextScale, multiplierTextScale);
        ctx.translate(-textX, -textY);
      }
      
      ctx.font = 'bold 14px "Press Start 2P"';
      ctx.fillStyle = tierColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      // Add shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(`${streakMultiplier}x`, barX + barWidth + 8, barY + barHeight / 2);
      
      ctx.restore();
    }
    
    // Powerup effect countdown (centered between main timer and right edge)
    // Restore DRUNK wobble transform (if active)
    if (activePowerupType === "DRUNK") {
      ctx.restore();
    }
    
    // Restore screen shake transform
    ctx.restore();
  }

  function drawRotated(img, cx, cy, w, h, angle) {
    // Round positions and dimensions to whole pixels for crisp rendering
    const x = Math.round(cx);
    const y = Math.round(cy);
    const width = Math.round(w);
    const height = Math.round(h);
    
    // Fast path: skip expensive save/restore/rotate for non-rotated images
    if (angle === 0 || angle === undefined) {
      ctx.drawImage(img, x - width/2, y - height/2, width, height);
      return;
    }
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(img, -width/2, -height/2, width, height);
    ctx.restore();
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.033, (ts - lastTs) / 1000);
    lastTs = ts;

    // Moon animation (only when earth is active)
    if (earthActive) {
      moonTimer += dt;
      moonFrameTimer += dt;

      if (moonTimer >= MOON_TOTAL_CYCLE) {
        moonTimer = 0; // Reset for next full cycle
      }

      // Update moon OFFSET at 10 FPS (not absolute position)
      if (moonFrameTimer >= 1 / MOON_FPS) {
        moonFrameTimer = 0;

        // PASS 1: Normal size, in front of earth, left → bottom-right
        if (moonTimer <= MOON_PASS1_DURATION) {
          moonActive = true;
          moonBehindEarth = false;
          moonScale = 1.0;
          const progress = moonTimer / MOON_PASS1_DURATION;
          
          // Start offset: off-screen left, higher up on earth
          const startOffsetX = -moonW;
          const startOffsetY = earthDrawH * 0.1; // Start at 10% down from earth top
          
          // End offset: off-screen right, middle-lower area
          const endOffsetX = W;
          const endOffsetY = earthDrawH * 0.6; // End at 60% down
          
          // Store the OFFSET (not absolute position)
          moonOffsetX = Math.round(startOffsetX + (endOffsetX - startOffsetX) * progress);
          moonOffsetY = Math.round(startOffsetY + (endOffsetY - startOffsetY) * progress);
        }
        // PAUSE 1: Off-screen after pass 1
        else if (moonTimer <= MOON_PASS1_DURATION + MOON_PASS1_PAUSE) {
          moonActive = false;
        }
        // PASS 2: Smaller, behind earth, bottom-right → left (reverse path, much higher)
        else if (moonTimer <= MOON_PASS1_DURATION + MOON_PASS1_PAUSE + MOON_PASS2_DURATION) {
          moonActive = true;
          moonBehindEarth = true;
          moonScale = MOON_PASS2_SCALE;
          const pass2Timer = moonTimer - (MOON_PASS1_DURATION + MOON_PASS1_PAUSE);
          const progress = pass2Timer / MOON_PASS2_DURATION;
          
          // Start offset: off-screen right, upper area (much higher path)
          const startOffsetX = W;
          const startOffsetY = earthDrawH * 0.25; // Start at 25% down
          
          // End offset: off-screen left, very top area
          const endOffsetX = -moonW * MOON_PASS2_SCALE;
          const endOffsetY = earthDrawH * 0.02; // End at 2% down (very top)
          
          // Store the OFFSET (not absolute position)
          moonOffsetX = Math.round(startOffsetX + (endOffsetX - startOffsetX) * progress);
          moonOffsetY = Math.round(startOffsetY + (endOffsetY - startOffsetY) * progress);
        }
        // PAUSE 2: Off-screen after pass 2
        else {
          moonActive = false;
        }
      }
    } else {
      // Earth not active - reset moon
      moonActive = false;
      moonTimer = 0;
      moonFrameTimer = 0;
    }

    if (!document.hidden) {
      update(dt);
      draw();
    }

    requestAnimationFrame(tick);
  }

  async function boot() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingBarFill = document.getElementById('loadingBarFill');
    
    // Update loading progress
    function updateProgress(percent) {
      if (loadingBarFill) {
        loadingBarFill.style.width = percent + '%';
      }
    }
    
    updateProgress(10);
    
    const [
      bgImg,
      player,
      playerCrash,
      sticker,
      thickSticker,
      earth,
      moon,
      banner,
      goatIcon,
      asteroidSmall,
      asteroidSmall2,
      asteroidSmall3,
      asteroid1,
      asteroid1Hit,
      asteroid2,
      asteroid2Hit,
      asteroid3,
      asteroid3Hit,
      bren1,
      bren2,
      bren3,
      surfGoat,
      surfBg,
      sandBg,
      boulder,
      pyramid,
      sphynx,
      powerupTwoX,
      powerupDrunk,
      powerupShield,
      powerupTime,
      titleFrame1_3,
      titleFrame2,
      titleFrame4
    ] = await Promise.all([
      loadImage(ASSETS.background),
      loadImage(ASSETS.webp.player),
      loadImage(ASSETS.webp.playerCrash),
      loadImage(ASSETS.webp.sticker),
      loadImage(ASSETS.webp.thickSticker),
      loadImage(ASSETS.webp.earth),
      loadImage(ASSETS.webp.moon),
      loadImage(ASSETS.webp.banner),
      loadImage(ASSETS.webp.goatIcon),
      loadImage(ASSETS.webp.asteroidSmall),
      loadImage(ASSETS.webp.asteroidSmall2),
      loadImage(ASSETS.webp.asteroidSmall3),
      loadImage(ASSETS.webp.asteroid1),
      loadImage(ASSETS.webp.asteroid1Hit),
      loadImage(ASSETS.webp.asteroid2),
      loadImage(ASSETS.webp.asteroid2Hit),
      loadImage(ASSETS.webp.asteroid3),
      loadImage(ASSETS.webp.asteroid3Hit),
      loadImage(ASSETS.webp.bren1),
      loadImage(ASSETS.webp.bren2),
      loadImage(ASSETS.webp.bren3),
      loadImage(ASSETS.webp.surfGoat),
      loadImage(ASSETS.credits.surfBg),
      loadImage(ASSETS.konami.sandBackground),
      loadImage(ASSETS.konami.boulder),
      loadImage(ASSETS.konami.pyramid),
      loadImage(ASSETS.konami.sphynx),
      loadImage(ASSETS.powerups.twoX),
      loadImage(ASSETS.powerups.drunk),
      loadImage(ASSETS.powerups.shield),
      loadImage(ASSETS.powerups.time),
      loadImage(ASSETS.titleFrames.frame1_3),
      loadImage(ASSETS.titleFrames.frame2),
      loadImage(ASSETS.titleFrames.frame4),
    ]);

    updateProgress(50);

    // HUD icons + banner
    hudLifeIcon.src = ASSETS.webp.goatIcon;
    hudStickerIcon.src = ASSETS.webp.sticker;
    
    // Store original banner after it loads for theme recoloring (only once)
    let bannerOriginalStored = false;
    bannerImg.onload = function() {
      if (!bannerOriginalStored) {
        bannerOriginalStored = true;
        // Create a copy of the original banner
        const bannerCopy = new Image();
        bannerCopy.src = ASSETS.webp.banner; // Use the original source, not this.src
        bannerCopy.onload = function() {
          originalBannerImg = bannerCopy;
          // Always recolor to match current theme (even if default)
          recolorThemeImages(THEME_COLOR);
        };
      }
    };
    bannerImg.src = ASSETS.webp.banner;

    // Audio
    const move = loadAudio(ASSETS.sounds.move, { loop: false, volume: 0.55 });
    const grab = loadAudio(ASSETS.sounds.grab, { loop: false, volume: 0.65 });
    const thickGrab = loadAudio(ASSETS.sounds.thickGrab, { loop: false, volume: 0.75 });
    const menuCursor = loadAudio(ASSETS.sounds.menuCursor, { loop: false, volume: 0.55 });
    const menuSelect = loadAudio(ASSETS.sounds.menuSelect, { loop: false, volume: 0.65 });
    const getMagnet = loadAudio(ASSETS.sounds.getMagnet, { loop: false, volume: 0.75 });
    const magnetEnd = loadAudio(ASSETS.sounds.magnetEnd, { loop: false, volume: 0.75 });
    const getBeer = loadAudio(ASSETS.sounds.getBeer, { loop: false, volume: 0.75 });
    const belch = loadAudio(ASSETS.sounds.belch, { loop: false, volume: 0.75 });
    const hit = loadAudio(ASSETS.sounds.hit, { loop: false, volume: 0.70 });
    const c321 = loadAudio(ASSETS.sounds.c321, { loop: false, volume: 0.75 });
    const start = loadAudio(ASSETS.sounds.start, { loop: false, volume: 0.85 });
    const levelDisplay = loadAudio(ASSETS.sounds.levelDisplay, { loop: false, volume: 0.80 });
    const finalSeconds = loadAudio(ASSETS.sounds.finalSeconds, { loop: false, volume: 0.75 });
    const extraLife = loadAudio(ASSETS.sounds.extraLife, { loop: false, volume: 0.75 });
    const oneUp = loadAudio(ASSETS.sounds.oneUp, { loop: false, volume: 0.75 });
    
    // TIME WARP powerup sounds
    const clockGet = loadAudio(ASSETS.sounds.clockGet, { loop: false, volume: 0.75 });
    const clockTick = loadAudio(ASSETS.sounds.clockTick, { loop: false, volume: 0.65 });
    const timerMenu = loadAudio(ASSETS.sounds.timerMenu, { loop: false, volume: 0.75 });
    const clockEnd = loadAudio(ASSETS.sounds.clockEnd, { loop: false, volume: 0.75 });
    
    // SHIELD powerup sound
    const shieldGet = loadAudio(ASSETS.sounds.shieldGet, { loop: false, volume: 0.75 });
    
    // Boss taunt audio
    const holler = loadAudio(ASSETS.sounds.holler, { loop: false, volume: 0.75 });
    const fcuk = loadAudio(ASSETS.sounds.fcuk, { loop: false, volume: 0.75 });
    const map = loadAudio(ASSETS.sounds.map, { loop: false, volume: 0.75 });
    const jpeg = loadAudio(ASSETS.sounds.jpeg, { loop: false, volume: 0.75 });
    const bitch = loadAudio(ASSETS.sounds.bitch, { loop: false, volume: 0.75 });
    const thick = loadAudio(ASSETS.sounds.thick, { loop: false, volume: 0.75 });
    const nooooo = loadAudio(ASSETS.sounds.nooooo, { loop: false, volume: 0.85 });

    assets = {
      bgImg,
      player,
      playerCrash,
      sticker,
      thickSticker,
      earth,
      moon,
      banner,
      goatIcon,
      asteroidSmall,
      asteroidSmall2,
      asteroidSmall3,
      asteroid1,
      asteroid1Hit,
      asteroid2,
      asteroid2Hit,
      asteroid3,
      asteroid3Hit,
      bren1,
      bren2,
      bren3,
      surfGoat,
      surfBg,
      sandBg,
      boulder,
      pyramid,
      sphynx,
      powerupTwoX,
      powerupDrunk,
      powerupShield,
      powerupTime,
      move,
      grab,
      thickGrab,
      menuCursor,
      menuSelect,
      getMagnet,
      magnetEnd,
      getBeer,
      belch,
      hit,
      c321,
      start,
      levelDisplay,
      finalSeconds,
      extraLife,
      oneUp,
      clockGet,
      clockTick,
      timerMenu,
      clockEnd,
      shieldGet,
      holler,
      fcuk,
      map,
      jpeg,
      bitch,
      thick,
      nooooo,
      titleFrame1_3,
      titleFrame2,
      titleFrame4
    };
    
    // Initialize title frame animation sequence [frame1, frame2, frame3 (same as 1), frame4]
    titleFrameImages = [titleFrame1_3, titleFrame2, titleFrame1_3, titleFrame4];
    
    // Store original title frames for recoloring
    originalTitleFrames = [titleFrame1_3, titleFrame2, titleFrame4];
    
    // Store original player sprites for recoloring
    originalPlayerImg = player;
    originalPlayerCrashImg = playerCrash;
    
    // Apply theme color to images immediately
    if (THEME_COLOR !== '#E0FF00') {
      recolorThemeImages(THEME_COLOR);
    }

    // Generate recolored asteroid palettes for each level
    generateAsteroidPalettes({
      asteroidSmall: [asteroidSmall, asteroidSmall2, asteroidSmall3],
      asteroid1,
      asteroid1Hit,
      asteroid2,
      asteroid2Hit,
      asteroid3,
      asteroid3Hit,
    });

    // Build pattern background scaled to canvas width (seamless, no gaps)
    bgScale = W / bgImg.width;
    bgTileW = W;                   // after scaling, width becomes W
    bgTileH = bgImg.height * bgScale;

    // Create a repeating pattern from the raw image
    bgPattern = ctx.createPattern(bgImg, "repeat");
    
    // Build sand background pattern for secret level
    sandBgScale = W / sandBg.width;
    sandBgTileH = sandBg.height * sandBgScale;
    sandBgPattern = ctx.createPattern(sandBg, "repeat");
    
    // Initialize powerup RNG - use static seed for survival, static powerup seed for main game
    if (gameMode === "SURVIVAL") {
      powerupRng = mulberry32(hashToSeed(SURVIVAL_STATIC_SEED + ":powerups"));
    } else {
      // Use static powerup seed instead of hourly seed
      powerupRng = mulberry32(hashToSeed(POWERUP_SEED + ":Level1"));
    }
    // Initialize stickerRng with the main seed for consistency
    const baseSeed = getWeeklySeed();
    currentSeed = baseSeed * 37 + 1; // Seed for level 1
    stickerRng = mulberry32(currentSeed);
    
    updateProgress(70);

    // Earth full-width height (360px wide, scale height proportionally)
    const earthScale = W / earth.width;
    earthDrawH = Math.round(earth.height * earthScale);

    // Moon size (15% of canvas width)
    const moonScale = (W * 0.15) / moon.width;
    moonW = Math.round(moon.width * moonScale);
    moonH = Math.round(moon.height * moonScale);

    // Load settings from localStorage
    loadSettings();
    
    // Load theme color from localStorage
    loadThemeColor();
    
    // Load stats from localStorage
    loadStats();
    
    // Load achievements from localStorage
    loadAchievements();
    
    // ===== ARCADE: Load credits =====
    loadCredits();
    // ===== END ARCADE =====

    // Initialize settings UI
    musicSlider.value = musicVolume;
    musicValue.textContent = musicVolume;
    sfxSlider.value = sfxVolume;
    sfxValue.textContent = sfxVolume;
    hapticsToggle.textContent = hapticsEnabled ? "ON" : "OFF";
    hapticsToggle.classList.toggle("off", !hapticsEnabled);
    
    // Check haptics support and disable toggle if unsupported
    if (!navigator.vibrate) {
      hapticsToggle.disabled = true;
      hapticsToggle.classList.add("disabled");
      hapticsToggle.textContent = "UNSUPPORTED";
    }

    updateProgress(90);

    // Init
    state = STATE.TITLE;
    showOnlyOverlay("title");
    lives = LIVES_START;
    resetRun();
    updateHud();

    // Hide HUD initially until game starts
    if (hud) hud.style.display = 'none';

    // CRITICAL: Preload music files BEFORE hiding loading screen
    // This MUST complete successfully or the game won't start properly
    try {
      await initWebAudioIfNeeded();
      
      // Double-check main game music buffer is loaded
      if (!mainGameMusicBuffer) {
        throw new Error("Main game music buffer failed to load");
      }
      
      updateProgress(95);
    } catch (err) {
      console.error("FATAL: Failed to load main game music:", err);
      alert("Failed to load game audio. Please refresh the page. If the problem persists, try clearing your browser cache.");
      throw err; // Stop boot process
    }

    // Input
    shell.addEventListener("pointerdown", onPointerDown, { passive: false });
    shell.addEventListener("pointerup", onPointerUp, { passive: true });
    shell.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp, { passive: true });
    
    // ===== ARCADE CONTROL TEST SYSTEM =====
    // Access control test overlay with 'T' key during development/setup
    const controlTestOverlay = document.getElementById('controlTestOverlay');
    const joystickTest = document.getElementById('joystickTest');
    const button1Test = document.getElementById('button1Test');
    const button2Test = document.getElementById('button2Test');
    const coinTest = document.getElementById('coinTest');
    let controlTestActive = false;
    
    // Track last key presses for visual feedback
    let lastJoystickKey = '';
    let lastButton1Time = 0;
    let lastButton2Time = 0;
    let lastCoinTime = 0;
    
    window.addEventListener('keydown', (e) => {
      // ===== ARCADE COIN INSERTION =====
      // "5" key inserts a coin (works anytime, even during test overlay)
      if (e.key === '5') {
        addCredit();
      }
      // ===== END COIN INSERTION =====
      
      // ===== ARCADE: TEMP - "C" key clears all credits (for testing) =====
      if (e.key === 'c' || e.key === 'C') {
        arcadeCredits = 0;
        saveCredits();
        updateCreditDisplay();
        console.log('Credits cleared for testing');
      }
      // ===== END TEMP =====
      
      // Toggle control test with 'T' key (only when not in gameplay)
      if (e.key === 't' || e.key === 'T') {
        if (state !== STATE.PLAY && state !== STATE.FINAL_LEVEL) {
          controlTestActive = !controlTestActive;
          if (controlTestOverlay) {
            controlTestOverlay.style.display = controlTestActive ? 'flex' : 'none';
            if (controlTestActive) {
              controlTestOverlay.classList.add('show');
            } else {
              controlTestOverlay.classList.remove('show');
            }
          }
        }
      }
      
      // Test controls when overlay is active
      if (controlTestActive) {
        // Joystick directions
        if (e.key === 'ArrowUp') {
          lastJoystickKey = 'UP';
          if (joystickTest) joystickTest.textContent = '↑ UP - Working!';
        } else if (e.key === 'ArrowDown') {
          lastJoystickKey = 'DOWN';
          if (joystickTest) joystickTest.textContent = '↓ DOWN - Working!';
        } else if (e.key === 'ArrowLeft') {
          lastJoystickKey = 'LEFT';
          if (joystickTest) joystickTest.textContent = '← LEFT - Working!';
        } else if (e.key === 'ArrowRight') {
          lastJoystickKey = 'RIGHT';
          if (joystickTest) joystickTest.textContent = '→ RIGHT - Working!';
        }
        
        // Buttons
        if (e.key === 'Enter') {
          lastButton1Time = Date.now();
          if (button1Test) button1Test.textContent = 'Button 1 (Enter): ✓ PRESSED!';
          setTimeout(() => {
            if (button1Test && Date.now() - lastButton1Time > 400) {
              button1Test.textContent = 'Button 1 (Enter): Ready';
            }
          }, 500);
        }
        
        if (e.key === ' ') {
          lastButton2Time = Date.now();
          if (button2Test) button2Test.textContent = 'Button 2 (Space): ✓ PRESSED!';
          setTimeout(() => {
            if (button2Test && Date.now() - lastButton2Time > 400) {
              button2Test.textContent = 'Button 2 (Space): Ready';
            }
          }, 500);
        }
        
        // Coin acceptor
        if (e.key === '5') {
          lastCoinTime = Date.now();
          if (coinTest) coinTest.textContent = '💰 COIN INSERTED! (5 key)';
          setTimeout(() => {
            if (coinTest && Date.now() - lastCoinTime > 1400) {
              coinTest.textContent = 'Waiting for coin (5 key)...';
            }
          }, 1500);
        }
      }
    });
    // ===== END ARCADE CONTROL TEST =====
    
    // Konami Code touch listeners
    shell.addEventListener("touchstart", onTouchStart, { passive: true });
    shell.addEventListener("touchend", onTouchEnd, { passive: true });

    // Pause/resume music
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseMusicWebAudio();
  } else {
    // only resumes if music was started by a gesture already
    resumeMusicWebAudio();
  }
});

    updateProgress(100);
    
    // Hide loading screen with fade animation
    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 500); // Match CSS transition duration
      }
      
      // ===== ARCADE: Start title music after a short delay =====
      // Note: Music may not play until user clicks START GAME due to browser autoplay policies
      setTimeout(() => {
        playTitleMusic();
      }, 800);
      // ===== END ARCADE =====
    }, 300); // Small delay to show 100%

    requestAnimationFrame(tick);
  }

  boot().catch(err => {
    console.error("Boot failed:", err);
    alert("Failed to load game assets. Check your file paths and run from a local server.");
  });

  // ===== ATTRACT MODE - IDLE DETECTION SYSTEM =====
  // After 5 minutes of inactivity on ANY screen (except during active gameplay), redirect to attract mode
  const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
  let idleTimer = null;
  let lastActivityTime = Date.now();
  let attractModeActive = false;
  let attractModeSection = 1; // 1 = first clip, 2 = second clip with leaderboard
  let attractModeStartTime = 0; // Track when attract mode started
  let attractModeSafetyTimer = null; // 4-minute safety timer
  let leaderboardScrollInterval = null;
  let leaderboardScrollPosition = 0;
  let leaderboardScrollDirection = 1; // 1 = down, -1 = up
  
  const attractModeContainer = document.getElementById('attractModeContainer');
  const attractModeVideo = document.getElementById('attractModeVideo');
  
  function startLeaderboardAutoScroll() {
    leaderboardScrollPosition = 0;
    leaderboardScrollDirection = 1;
    
    // Find the scrollable leaderboard list (this is the actual scrolling element)
    const leaderboardListElement = document.getElementById('leaderboardList');
    if (!leaderboardListElement) {
      console.error('leaderboardList not found for auto-scroll');
      return;
    }
    
    // Hide scrollbar during attract mode
    leaderboardListElement.style.scrollbarWidth = 'none'; // Firefox
    leaderboardListElement.style.msOverflowStyle = 'none'; // IE/Edge
    // Add webkit scrollbar hiding
    const style = document.createElement('style');
    style.id = 'attractModeScrollbarHide';
    style.textContent = '#leaderboardList::-webkit-scrollbar { display: none; }';
    document.head.appendChild(style);
    
    console.log('🔄 Starting leaderboard auto-scroll...');
    console.log('ScrollHeight:', leaderboardListElement.scrollHeight, 'ClientHeight:', leaderboardListElement.clientHeight);
    
    leaderboardScrollInterval = setInterval(() => {
      const maxScroll = leaderboardListElement.scrollHeight - leaderboardListElement.clientHeight;
      
      if (maxScroll <= 0) {
        console.log('⚠️ Not enough content to scroll (maxScroll:', maxScroll, ')');
        return; // Not enough content to scroll
      }
      
      // Smooth scroll (1 pixel per frame = slow)
      leaderboardScrollPosition += leaderboardScrollDirection * 1;
      
      // Reverse direction at boundaries
      if (leaderboardScrollPosition >= maxScroll) {
        leaderboardScrollDirection = -1;
      } else if (leaderboardScrollPosition <= 0) {
        leaderboardScrollDirection = 1;
      }
      
      leaderboardListElement.scrollTop = leaderboardScrollPosition;
    }, 50); // Run every 50ms
  }
  
  function stopLeaderboardAutoScroll() {
    if (leaderboardScrollInterval) {
      clearInterval(leaderboardScrollInterval);
      leaderboardScrollInterval = null;
    }
    
    // Restore scrollbar visibility
    const leaderboardListElement = document.getElementById('leaderboardList');
    if (leaderboardListElement) {
      leaderboardListElement.scrollTop = 0;
      leaderboardListElement.style.scrollbarWidth = '';
      leaderboardListElement.style.msOverflowStyle = '';
    }
    
    // Remove webkit scrollbar hiding style
    const styleElement = document.getElementById('attractModeScrollbarHide');
    if (styleElement) {
      styleElement.remove();
    }
  }
  
  const ATTRACT_VIDEO = 'assets/clips/attract-main-1.mp4';
  const LEADERBOARD_SHOW_TIME = 98; // Show leaderboard at 1 minute 38 seconds
  
  function startAttractMode() {
    console.log('🎮 Starting attract mode...');
    attractModeActive = true;
    attractModeSection = 1;
    attractModeStartTime = Date.now();
    
    // Stop all music
    stopMusic();
    stopTitleMusic();
    
    // Hide scrollbars
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // Hide all game elements, show video container
    if (attractModeContainer) {
      attractModeContainer.style.display = 'block';
    }
    
    // Set 5-minute safety timer to reload page (in case video doesn't end properly)
    console.log('⏰ Setting 5-minute safety timer...');
    attractModeSafetyTimer = setTimeout(() => {
      console.log('⏰ 5-minute safety timer expired - reloading page...');
      window.location.reload();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Play attract video
    playAttractClip();
  }
  
  function playAttractClip() {
    if (!attractModeVideo) {
      console.log('❌ No video element, ending attract mode');
      endAttractMode();
      return;
    }
    
    console.log(`🎬 Playing attract video: ${ATTRACT_VIDEO}`);
    
    attractModeVideo.src = ATTRACT_VIDEO;
    attractModeVideo.load();
    
    let leaderboardShown = false;
    
    // Log when video is ready to play
    attractModeVideo.onloadedmetadata = () => {
      console.log(`📹 Video loaded. Duration: ${attractModeVideo.duration} seconds`);
    };
    
    // Monitor video time to show leaderboard at 1:38
    attractModeVideo.ontimeupdate = () => {
      if (!leaderboardShown && attractModeVideo.currentTime >= LEADERBOARD_SHOW_TIME) {
        leaderboardShown = true;
        console.log(`⏰ Video reached ${LEADERBOARD_SHOW_TIME}s - showing leaderboard`);
        attractModeSection = 2;
        
        // Show leaderboard overlay on top of video
        if (leaderboardOverlay) {
          console.log('📊 Showing leaderboard overlay...');
          leaderboardOverlay.style.zIndex = '200'; // Above video (100) within same stacking context
          leaderboardOverlay.classList.add('show');
          
          // Hide title and back button during attract mode
          const leaderboardTitle = leaderboardOverlay.querySelector('.title');
          const leaderboardBackBtn = document.getElementById('leaderboardBackBtn');
          if (leaderboardTitle) leaderboardTitle.style.display = 'none';
          if (leaderboardBackBtn) leaderboardBackBtn.style.display = 'none';
        } else {
          console.error('❌ leaderboardOverlay not found!');
        }
        
        console.log('📊 Rendering leaderboard data...');
        renderLeaderboard();
        
        // Start auto-scrolling the leaderboard
        startLeaderboardAutoScroll();
      }
    };
    
    // Handle video end
    attractModeVideo.onended = () => {
      console.log('✅ Video finished playing, ending attract mode');
      endAttractMode();
    };
    
    // Handle errors
    attractModeVideo.onerror = (e) => {
      console.error('❌ Video error:', e);
      console.error('Error code:', attractModeVideo.error?.code);
      console.error('Error message:', attractModeVideo.error?.message);
      endAttractMode();
    };
    
    attractModeVideo.play().catch(err => {
      console.error('❌ Error playing attract video:', err);
      endAttractMode();
    });
  }
  
  function endAttractMode() {
    console.log('🏁 Ending attract mode, returning to title...');
    attractModeActive = false;
    attractModeSection = 1;
    
    // Clear safety timer
    if (attractModeSafetyTimer) {
      clearTimeout(attractModeSafetyTimer);
      attractModeSafetyTimer = null;
    }
    
    // Stop auto-scroll
    stopLeaderboardAutoScroll();
    
    // Restore scrollbars
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    
    // Stop video (don't clear src - causes error loop)
    if (attractModeVideo) {
      attractModeVideo.pause();
      attractModeVideo.onended = null;
      attractModeVideo.ontimeupdate = null;
      attractModeVideo.onerror = null;
    }
    
    // Hide video container
    if (attractModeContainer) {
      attractModeContainer.style.display = 'none';
    }
    
    // Reset leaderboard z-index and hide it, restore hidden elements
    if (leaderboardOverlay) {
      leaderboardOverlay.style.zIndex = '';
      leaderboardOverlay.classList.remove('show');
      
      // Restore title and back button
      const leaderboardTitle = leaderboardOverlay.querySelector('.title');
      const leaderboardBackBtn = document.getElementById('leaderboardBackBtn');
      if (leaderboardTitle) leaderboardTitle.style.display = '';
      if (leaderboardBackBtn) leaderboardBackBtn.style.display = '';
    }
    
    // Return to title screen
    showOnlyOverlay('title');
    playTitleMusic();
    
    // Reset idle timer
    resetIdleTimer();
  }
  
  function resetIdleTimer() {
    // If attract mode is active, any input ends it (but wait 1 second grace period)
    if (attractModeActive) {
      const timeSinceStart = Date.now() - attractModeStartTime;
      if (timeSinceStart > 1000) { // 1 second grace period
        endAttractMode();
      }
      return;
    }
    
    lastActivityTime = Date.now();
    
    // Don't start idle timer during active gameplay
    const isPlaying = state === STATE.PLAY || state === STATE.FINAL_LEVEL || state === STATE.COUNTDOWN;
    
    if (!isPlaying) {
      // Clear existing timer
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      
      // Set new timer for any non-gameplay screen
      idleTimer = setTimeout(() => {
        // Don't start if player started playing in the meantime
        const stillNotPlaying = state !== STATE.PLAY && state !== STATE.FINAL_LEVEL && state !== STATE.COUNTDOWN;
        if (stillNotPlaying) {
          console.log('🎮 Idle timeout - Starting attract mode from:', state);
          startAttractMode();
        }
      }, IDLE_TIMEOUT);
    }
  }
  
  // Listen for any user activity to reset timer
  document.addEventListener('keydown', resetIdleTimer);
  document.addEventListener('keyup', resetIdleTimer);
  document.addEventListener('mousedown', resetIdleTimer);
  document.addEventListener('mousemove', resetIdleTimer);
  document.addEventListener('touchstart', resetIdleTimer);
  document.addEventListener('touchmove', resetIdleTimer);
  document.addEventListener('click', resetIdleTimer);
  
  // Start idle timer when game boots
  window.addEventListener('load', () => {
    resetIdleTimer();
  });
  
  // Also reset timer when overlays change (called from showOnlyOverlay)
  window.resetIdleTimer = resetIdleTimer;
  // ===== END ATTRACT MODE =====

  // Expose theme color functions to window for external use (e.g., test pages)
  window.getThemeColor = getThemeColor;
  window.getThemeRgb = getThemeRgb;
  window.applyThemeColor = applyThemeColor;
  window.hexToRgb = hexToRgb;
  Object.defineProperty(window, 'THEME_COLOR', {
    get: () => THEME_COLOR,
    set: (val) => { THEME_COLOR = val; }
  });
})();
