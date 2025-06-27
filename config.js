// Enhanced Game Configuration and Constants
const GAME_CONFIG = {
  TOTAL_BATTLES: 5,
  TRAINING_TIME: 20, // Increased from 15 for better scoring
  ANIMATION_DURATION: 1000,
  ENEMY_MOVE_DELAY: 1000,
  DAMAGE_NUMBER_DURATION: 1000,
  TRAINING_SPAWN_BASE_DELAY: 600, // Reduced for more frequent spawns
  TRAINING_SPAWN_MIN_DELAY: 200, // Much faster minimum spawn
  TRAINING_BUBBLE_LIFETIME: 4000, // Increased bubble lifetime
  SLOT_SPIN_DURATION: 100,
  SLOT_SPIN_COUNT_BASE: 10,
  BOOST_MULTIPLIER: 1.5, // Slightly reduced for balance
  SANITY_RECOVERY_PER_TURN: 1,
  SANITY_RECOVERY_BETWEEN_BATTLES: 3, // Increased recovery
  MALFUNCTION_SANITY_RECOVERY: 0.5,
  TRAINING_BONUS_THRESHOLD: 200, // Reduced threshold for bonus reward
  MAX_COMBO_MULTIPLIER: 10, // Increased max combo
  MAX_SIMULTANEOUS_BUBBLES: 6, // New: max bubbles on screen at once
  BUBBLE_BASE_POINTS: [1, 2, 3, 5, 8], // Points for different bubble sizes/types
};

// Fighter Templates with themed abilities and better balance
const FIGHTER_TEMPLATES = {
  vanilla: {
    name: "Vanilla",
    sprite: "🍦",
    hp: 100,
    maxHp: 100,
    attack: 15,
    defense: 10,
    sanity: 12,
    maxSanity: 12,
    moves: {
      light: {
        name: "Scoop Slam",
        icon: "🥄",
        description: "A classic vanilla strike",
      },
      heavy: {
        name: "Sprinkle Blast",
        icon: "✨",
        description: "Overwhelm with sprinkles",
      },
      defend: {
        name: "Ice Shield",
        icon: "🧊",
        description: "Freeze solid for protection",
      },
      boost: {
        name: "Sugar Rush",
        icon: "🍬",
        description: "Pure vanilla energy boost",
      },
    },
  },
  chocolate: {
    name: "Chocolate",
    sprite: "🍫",
    hp: 90,
    maxHp: 90,
    attack: 22, // Higher attack for glass cannon
    defense: 8,
    sanity: 10,
    maxSanity: 10,
    moves: {
      light: {
        name: "Cocoa Strike",
        icon: "🍫",
        description: "Quick chocolate chop",
      },
      heavy: {
        name: "Dark Eruption",
        icon: "🌋",
        description: "Explosive cocoa power",
      },
      defend: {
        name: "Bitter Block",
        icon: "🛡️",
        description: "Bitter chocolate armor",
      },
      boost: {
        name: "Mocha Fury",
        icon: "☕",
        description: "Caffeine-powered rage",
      },
    },
  },
  strawberry: {
    name: "Strawberry",
    sprite: "🍓",
    hp: 120, // Higher HP for tank
    maxHp: 120,
    attack: 12,
    defense: 18, // Higher defense
    sanity: 14,
    maxSanity: 14,
    moves: {
      light: { name: "Berry Bonk", icon: "🍓", description: "Sweet berry tap" },
      heavy: {
        name: "Jam Explosion",
        icon: "💥",
        description: "Sticky strawberry blast",
      },
      defend: {
        name: "Sweet Barrier",
        icon: "🌸",
        description: "Protective fruit shield",
      },
      boost: {
        name: "Berry Blitz",
        icon: "⚡",
        description: "Natural sugar rush",
      },
    },
  },
};

// Rebalanced Enemy Templates for proper difficulty curve
const ENEMY_TEMPLATES = [
  {
    name: "Melty Mike",
    sprite: "🌊",
    hp: 80, // Increased for balance
    maxHp: 80,
    attack: 14, // Slightly increased
    defense: 6, // Slightly increased
    sanity: 10, // Increased
    maxSanity: 10,
    pattern: ["light", "light", "defend", "heavy"],
  },
  {
    name: "Freezer Burn Fred",
    sprite: "❄️",
    hp: 110, // Increased
    maxHp: 110,
    attack: 18, // Increased
    defense: 12, // Increased
    sanity: 14, // Increased
    maxSanity: 14,
    pattern: ["heavy", "defend", "light", "defend", "boost"],
  },
  {
    name: "Sour Sam",
    sprite: "🍋",
    hp: 140, // Increased
    maxHp: 140,
    attack: 22, // Increased
    defense: 15, // Increased
    sanity: 18, // Increased
    maxSanity: 18,
    pattern: ["boost", "heavy", "light", "light", "defend"],
  },
  {
    name: "Rocky Road Roger",
    sprite: "🗿",
    hp: 180, // Increased
    maxHp: 180,
    attack: 26, // Increased
    defense: 20, // Increased
    sanity: 22, // Increased
    maxSanity: 22,
    pattern: ["defend", "boost", "heavy", "defend", "light", "defend"],
  },
  {
    name: "Brain Freeze Boss",
    sprite: "🧠",
    hp: 250, // Significantly increased for final boss
    maxHp: 250,
    attack: 32, // Increased
    defense: 25, // Increased
    sanity: 30, // Increased
    maxSanity: 30,
    pattern: ["light", "boost", "heavy", "heavy", "defend", "light", "boost"],
  },
];

// Enhanced Move definitions with better balance
const MOVE_DEFINITIONS = {
  light: {
    name: "Quick Strike",
    damage: 25, // Increased base damage
    baseCost: 2,
    description: "Reliable damage, predictable cost",
    sanityCosts: {
      vsLight: 2,
      vsHeavy: 3,
      vsDefend: 1,
      vsBoost: 2,
    },
  },
  heavy: {
    name: "Power Blast",
    damage: 50, // Increased base damage
    baseCost: 4,
    description: "Big damage, risky if countered",
    sanityCosts: {
      vsLight: 2,
      vsHeavy: 3,
      vsDefend: 6,
      vsBoost: 0,
    },
  },
  defend: {
    name: "Shield",
    damage: 0,
    baseCost: 1,
    description: "FREE if they attack, costly if not",
    sanityCosts: {
      vsLight: 0,
      vsHeavy: 0,
      vsDefend: 2,
      vsBoost: 3,
    },
  },
  boost: {
    name: "Power Up",
    damage: 0,
    baseCost: 3,
    description: "+50% damage next turn",
    sanityCosts: {
      vsLight: 3,
      vsHeavy: 5,
      vsDefend: 1,
      vsBoost: 1,
    },
  },
};

// Fighter dialogue for talk mechanic
const FIGHTER_STATEMENTS = {
  vanilla: [
    "I'm feeling a bit vanilla right now...",
    "Sometimes I wonder if I'm too plain.",
    "I need to keep my cool!",
    "Classic never goes out of style, right?",
  ],
  chocolate: [
    "I'm melting under the pressure!",
    "Dark thoughts are creeping in...",
    "I feel bitter about this battle.",
    "My strength is fading like cocoa in the sun!",
  ],
  strawberry: [
    "I'm not feeling so sweet anymore...",
    "Everything's getting berry difficult!",
    "My defenses are crumbling like shortcake!",
    "I need to preserve my strength!",
  ],
};

// Talk responses for sanity restoration
const TALK_RESPONSES = [
  { text: "You're the coolest fighter I know!", success: true, sanity: 3 },
  { text: "Stay strong, we're winning this!", success: true, sanity: 4 },
  { text: "Don't melt down on me now!", success: false, sanity: 1 },
  { text: "Remember why we're fighting!", success: true, sanity: 3 },
  {
    text: "You're making me hungry... wait, that's not helping!",
    success: false,
    sanity: 0,
  },
  { text: "Channel your inner freeze!", success: true, sanity: 2 },
  { text: "Think of happy sundaes!", success: true, sanity: 3 },
  { text: "Just chill out! Get it? Chill?", success: false, sanity: 1 },
];

// Malfunction messages for sanity crisis
const MALFUNCTION_MESSAGES = [
  "I'm just a puddle now!",
  "The sprinkles are whispering secrets!",
  "I can see through time!",
  "Everything tastes like purple!",
  "I am become dairy, destroyer of cones!",
];

// Talk-down dialogue options
const TALKDOWN_OPTIONS = [
  { text: "You're still solid! Feel your cone!", success: true },
  { text: "The sprinkles aren't real, focus on my voice!", success: true },
  { text: "SNAP OUT OF IT!", success: false },
  {
    text: "Just calm down and breathe... wait, can ice cream breathe?",
    success: false,
  },
  { text: "Remember your training! You're stronger than this!", success: true },
  { text: "Think of all the happy customers you've served!", success: true },
];

// Enhanced Slot machine configuration with better rewards
const SLOT_CONFIG = {
  symbols: [
    { emoji: "🍦", name: "vanilla" },
    { emoji: "🍫", name: "chocolate" },
    { emoji: "🍓", name: "strawberry" },
    { emoji: "🍨", name: "soft" },
    { emoji: "🧊", name: "ice" },
    { emoji: "🪙", name: "coin" },
  ],
  // Adjusted weights for better win rate (~65%)
  weights: [120, 100, 80, 60, 20, 10],
  rewards: {
    triple: {
      vanilla: { name: "VANILLA VICTORY!", attack: 3, color: "#f5e6d3" },
      chocolate: { name: "CHOCOLATE CHAMPION!", defense: 3, color: "#8b4513" },
      strawberry: { name: "STRAWBERRY SUPREME!", hp: 25, color: "#ff6b6b" },
      soft: { name: "SOFT SERVE SUCCESS!", sanity: 3, color: "#ffeaa7" },
      ice: {
        name: "ICE COLD JACKPOT!",
        attack: 2,
        defense: 2,
        sanity: 2,
        hp: 20,
        color: "#48dbfb",
      },
      coin: { name: "COIN JACKPOT!", points: 50, color: "#fdcb6e" },
    },
  },
};

// Enhanced training rewards with better balance
const TRAINING_REWARDS = {
  attack: {
    name: "+5 Attack",
    description: "Increase your attack power significantly",
    icon: "⚔️",
    apply: (player) => {
      player.attack += 5; // Increased from 3
    },
  },
  defense: {
    name: "+5 Defense",
    description: "Increase your defense power significantly",
    icon: "🛡️",
    apply: (player) => {
      player.defense += 5; // Increased from 3
    },
  },
  sanity: {
    name: "+2 Max Sanity",
    description: "Increase your maximum sanity",
    icon: "🧠",
    apply: (player) => {
      player.maxSanity += 2; // Increased from 1
      player.sanity = Math.min(player.sanity + 2, player.maxSanity);
    },
  },
  health: {
    name: "+25 Max HP",
    description: "Increase your maximum health significantly",
    icon: "❤️",
    apply: (player) => {
      player.maxHp += 25; // Increased from 10
      player.hp = Math.min(player.hp + 25, player.maxHp);
    },
  },
};

// Enhanced Bubble Types for training mini-game
const BUBBLE_TYPES = [
  {
    type: "vanilla",
    emoji: "🍦",
    basePoints: 1,
    size: "small",
    color: "rgba(255,248,220,0.8)",
    weight: 40, // Most common
  },
  {
    type: "chocolate",
    emoji: "🍫",
    basePoints: 2,
    size: "medium",
    color: "rgba(139,69,19,0.8)",
    weight: 30,
  },
  {
    type: "strawberry",
    emoji: "🍓",
    basePoints: 3,
    size: "medium",
    color: "rgba(255,105,180,0.8)",
    weight: 20,
  },
  {
    type: "special",
    emoji: "🌟",
    basePoints: 5,
    size: "large",
    color: "rgba(255,215,0,0.8)",
    weight: 8, // Rare
  },
  {
    type: "bonus",
    emoji: "💎",
    basePoints: 10,
    size: "large",
    color: "rgba(72,219,251,0.8)",
    weight: 2, // Very rare
  },
];

// Achievement system configuration
const ACHIEVEMENTS = {
  // Enemy defeat achievements
  enemy_1: {
    icon: "🌊",
    name: "Wave Rider",
    description: "Defeat Melty Mike",
    unlocked: false,
  },
  enemy_2: {
    icon: "❄️",
    name: "Ice Breaker",
    description: "Defeat Freezer Burn Fred",
    unlocked: false,
  },
  enemy_3: {
    icon: "🍋",
    name: "Sour Power",
    description: "Defeat Sour Sam",
    unlocked: false,
  },
  enemy_4: {
    icon: "🗿",
    name: "Rock Crusher",
    description: "Defeat Rocky Road Roger",
    unlocked: false,
  },
  enemy_5: {
    icon: "🧠",
    name: "Mind Over Matter",
    description: "Defeat Brain Freeze Boss",
    unlocked: false,
  },

  // Character victory achievements
  vanilla_victory: {
    icon: "🍦",
    name: "Vanilla Champion",
    description: "Beat the game with Vanilla",
    unlocked: false,
  },
  chocolate_victory: {
    icon: "🍫",
    name: "Chocolate Champion",
    description: "Beat the game with Chocolate",
    unlocked: false,
  },
  strawberry_victory: {
    icon: "🍓",
    name: "Strawberry Champion",
    description: "Beat the game with Strawberry",
    unlocked: false,
  },

  // Stat milestone achievements
  attack_100: {
    icon: "⚔️",
    name: "Power House",
    description: "Train Attack above 100",
    unlocked: false,
  },
  defense_100: {
    icon: "🛡️",
    name: "Immovable",
    description: "Train Defense above 100",
    unlocked: false,
  },
  sanity_100: {
    icon: "🧠",
    name: "Zen Master",
    description: "Train Sanity above 100",
    unlocked: false,
  },
  hp_300: {
    icon: "❤️",
    name: "Tank Mode",
    description: "Train HP above 300",
    unlocked: false,
  },

  // Focused training achievements
  attack_only: {
    icon: "🎯",
    name: "Attack Focus",
    description: "Only train Attack in a session",
    unlocked: false,
  },
  defense_only: {
    icon: "🎯",
    name: "Defense Focus",
    description: "Only train Defense in a session",
    unlocked: false,
  },
  sanity_only: {
    icon: "🎯",
    name: "Sanity Focus",
    description: "Only train Sanity in a session",
    unlocked: false,
  },
  health_only: {
    icon: "🎯",
    name: "Health Focus",
    description: "Only train Health in a session",
    unlocked: false,
  },

  // Slot machine achievements
  slot_vanilla: {
    icon: "🍦",
    name: "Vanilla Slots",
    description: "Win Vanilla jackpot",
    unlocked: false,
  },
  slot_chocolate: {
    icon: "🍫",
    name: "Chocolate Slots",
    description: "Win Chocolate jackpot",
    unlocked: false,
  },
  slot_strawberry: {
    icon: "🍓",
    name: "Strawberry Slots",
    description: "Win Strawberry jackpot",
    unlocked: false,
  },
  slot_soft: {
    icon: "🍨",
    name: "Soft Serve Slots",
    description: "Win Soft Serve jackpot",
    unlocked: false,
  },
  slot_ice: {
    icon: "🧊",
    name: "Ice Slots",
    description: "Win Ice jackpot",
    unlocked: false,
  },
  slot_coin: {
    icon: "🪙",
    name: "Coin Slots",
    description: "Win Coin jackpot",
    unlocked: false,
  },
  slot_unlucky: {
    icon: "💸",
    name: "Unlucky Streak",
    description: "Lose 3 slot spins in a row",
    unlocked: false,
  },
};

// Audio configuration (keeping original)
const AUDIO_CONFIG = {
  music: {
    menu: "audio/music_menu.mp3",
    battle: "audio/music_battle.mp3",
    training: "audio/music_training.mp3",
    victory: "audio/music_victory.mp3",
    gameOver: "audio/music_game_over.mp3",
  },
  sounds: {
    // UI Sounds
    buttonClick: "audio/ui_button_click.mp3",
    buttonHover: "audio/ui_button_hover.mp3",
    screenTransition: "audio/ui_screen_transition.mp3",

    // Fighter Selection
    fighterSelect: "audio/fighter_select.mp3",

    // Battle Sounds
    battleStart: "audio/battle_start.mp3",
    battleWin: "audio/battle_win.mp3",
    takeDamage: "audio/take_damage.mp3",
    dealDamage: "audio/deal_damage.mp3",
    heal: "audio/heal.mp3",

    // Move sounds
    light: "audio/attack_light.mp3",
    heavy: "audio/attack_heavy.mp3",
    defend: "audio/defend.mp3",
    boost: "audio/boost.mp3",

    // Talk System
    talkStart: "audio/talk_start.mp3",
    talkSuccess: "audio/talk_success.mp3",
    talkFail: "audio/talk_fail.mp3",

    // Malfunction
    malfunction: "audio/malfunction.mp3",
    malfunctionRecover: "audio/malfunction_recover.mp3",

    // Training
    trainingStart: "audio/training_start.mp3",
    bubbleClick: "audio/cone_click.mp3", // Renamed from coneClick
    comboIncrease: "audio/combo_increase.mp3",
    trainingComplete: "audio/training_complete.mp3",

    // Slot machine sounds
    spin: "audio/slot_spin.mp3",
    win: "audio/slot_win.mp3",
    jackpot: "audio/slot_jackpot.mp3",

    // Upgrades
    upgradeApply: "audio/upgrade_apply.mp3",

    // Game End
    gameOverSound: "audio/game_over_sound.mp3",
    victorySound: "audio/victory_sound.mp3",

    // Achievement sound
    achievementUnlock: "audio/achievement_unlock.mp3",
  },
};

// Enhanced utility functions
const CONFIG_UTILS = {
  /**
   * Get a random element from an array
   */
  getRandomElement(array) {
    if (!Array.isArray(array) || array.length === 0) {
      console.warn("getRandomElement called with invalid array:", array);
      return null;
    }
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * Get a weighted random symbol for slot machine
   */
  getWeightedSlotSymbol() {
    const { symbols, weights } = SLOT_CONFIG;
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    if (totalWeight <= 0) {
      console.error("Invalid total weight in slot configuration");
      return symbols[0];
    }

    let random = Math.random() * totalWeight;

    for (let i = 0; i < symbols.length; i++) {
      random -= weights[i];
      if (random <= 0) return symbols[i];
    }

    return symbols[0];
  },

  /**
   * Get a weighted random bubble type for training
   */
  getWeightedBubbleType() {
    const totalWeight = BUBBLE_TYPES.reduce(
      (sum, bubble) => sum + bubble.weight,
      0
    );
    let random = Math.random() * totalWeight;

    for (let i = 0; i < BUBBLE_TYPES.length; i++) {
      random -= BUBBLE_TYPES[i].weight;
      if (random <= 0) return BUBBLE_TYPES[i];
    }

    return BUBBLE_TYPES[0];
  },

  /**
   * Validate fighter type
   */
  isValidFighterType(fighterType) {
    return fighterType && FIGHTER_TEMPLATES.hasOwnProperty(fighterType);
  },

  /**
   * Validate move type
   */
  isValidMoveType(moveType) {
    return moveType && MOVE_DEFINITIONS.hasOwnProperty(moveType);
  },

  /**
   * Get enemy template for battle number
   */
  getEnemyTemplate(battleNumber) {
    if (battleNumber < 1 || battleNumber > ENEMY_TEMPLATES.length) {
      console.error(`Invalid battle number: ${battleNumber}`);
      return null;
    }
    return ENEMY_TEMPLATES[battleNumber - 1];
  },

  /**
   * Clamp a value between min and max
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Calculate damage with defense reduction
   */
  calculateDamage(baseDamage, defense = 0) {
    return Math.max(1, baseDamage - defense);
  },

  /**
   * Calculate total attack damage including player's attack stat
   */
  calculateTotalDamage(moveType, playerAttack) {
    const move = MOVE_DEFINITIONS[moveType];
    if (!move || move.damage === 0) return 0;
    return move.damage + playerAttack;
  },

  /**
   * Play audio file with error handling
   */
  playAudio(audioPath, volume = 1) {
    try {
      const audio = new Audio(audioPath);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch((error) => {
        console.warn(`Could not play audio: ${audioPath}`, error);
      });
    } catch (error) {
      console.warn(`Error creating audio: ${audioPath}`, error);
    }
  },

  /**
   * Update image source with error handling
   */
  updateImage(imgElement, imagePath, altText = "") {
    if (!imgElement) return;

    imgElement.onerror = () => {
      console.warn(`Could not load image: ${imagePath}`);
    };

    imgElement.src = imagePath;
    if (altText) {
      imgElement.alt = altText;
    }
  },

  /**
   * Save achievements to localStorage
   */
  saveAchievements(achievements) {
    try {
      localStorage.setItem(
        "iceCreamFighterAchievements",
        JSON.stringify(achievements)
      );
    } catch (error) {
      console.warn("Could not save achievements:", error);
    }
  },

  /**
   * Load achievements from localStorage
   */
  loadAchievements() {
    try {
      const saved = localStorage.getItem("iceCreamFighterAchievements");
      if (saved) {
        const loadedAchievements = JSON.parse(saved);
        // Merge with default achievements to add any new ones
        return { ...ACHIEVEMENTS, ...loadedAchievements };
      }
    } catch (error) {
      console.warn("Could not load achievements:", error);
    }
    return { ...ACHIEVEMENTS };
  },
};

// Export for use in other files (if using modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GAME_CONFIG,
    FIGHTER_TEMPLATES,
    ENEMY_TEMPLATES,
    MOVE_DEFINITIONS,
    FIGHTER_STATEMENTS,
    TALK_RESPONSES,
    MALFUNCTION_MESSAGES,
    TALKDOWN_OPTIONS,
    BUBBLE_TYPES,
    SLOT_CONFIG,
    TRAINING_REWARDS,
    ACHIEVEMENTS,
    AUDIO_CONFIG,
    CONFIG_UTILS,
  };
}
