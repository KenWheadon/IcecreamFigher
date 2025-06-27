// Game Configuration and Constants
const GAME_CONFIG = {
  TOTAL_BATTLES: 5,
  TRAINING_TIME: 15,
  ANIMATION_DURATION: 1000,
  ENEMY_MOVE_DELAY: 1000,
  DAMAGE_NUMBER_DURATION: 1000,
  TRAINING_SPAWN_BASE_DELAY: 1500,
  TRAINING_SPAWN_MIN_DELAY: 500,
  TRAINING_CONE_LIFETIME: 3000,
  SLOT_SPIN_DURATION: 100,
  SLOT_SPIN_COUNT_BASE: 10,
  BOOST_MULTIPLIER: 1.6,
  SANITY_RECOVERY_PER_TURN: 1,
  SANITY_RECOVERY_BETWEEN_BATTLES: 2,
  MALFUNCTION_SANITY_RECOVERY: 0.5,
  TRAINING_BONUS_THRESHOLD: 50,
  MAX_COMBO_MULTIPLIER: 5,
};

// Fighter Templates with image references
const FIGHTER_TEMPLATES = {
  vanilla: {
    name: "Vanilla",
    sprite: "🍦",
    image: "images/vanilla_fighter.png",
    hp: 100,
    maxHp: 100,
    attack: 15,
    defense: 10,
    sanity: 12,
    maxSanity: 12,
  },
  chocolate: {
    name: "Chocolate",
    sprite: "🍫",
    image: "images/chocolate_fighter.png",
    hp: 90,
    maxHp: 90,
    attack: 20,
    defense: 8,
    sanity: 10,
    maxSanity: 10,
  },
  strawberry: {
    name: "Strawberry",
    sprite: "🍓",
    image: "images/strawberry_fighter.png",
    hp: 110,
    maxHp: 110,
    attack: 12,
    defense: 15,
    sanity: 14,
    maxSanity: 14,
  },
};

// Enemy Templates with different attack patterns and image references
const ENEMY_TEMPLATES = [
  {
    name: "Melty Mike",
    sprite: "🌊",
    image: "images/enemy_1.png",
    hp: 60,
    maxHp: 60,
    attack: 12,
    defense: 5,
    sanity: 8,
    maxSanity: 8,
    pattern: ["light", "light", "defend", "heavy"],
  },
  {
    name: "Freezer Burn Fred",
    sprite: "❄️",
    image: "images/enemy_2.png",
    hp: 80,
    maxHp: 80,
    attack: 15,
    defense: 8,
    sanity: 10,
    maxSanity: 10,
    pattern: ["heavy", "defend", "light", "defend", "boost"],
  },
  {
    name: "Sour Sam",
    sprite: "🍋",
    image: "images/enemy_3.png",
    hp: 90,
    maxHp: 90,
    attack: 18,
    defense: 10,
    sanity: 12,
    maxSanity: 12,
    pattern: ["boost", "heavy", "light", "light", "defend"],
  },
  {
    name: "Rocky Road Roger",
    sprite: "🗿",
    image: "images/enemy_4.png",
    hp: 110,
    maxHp: 110,
    attack: 20,
    defense: 12,
    sanity: 15,
    maxSanity: 15,
    pattern: ["defend", "boost", "heavy", "defend", "light", "defend"],
  },
  {
    name: "Brain Freeze Boss",
    sprite: "🧠",
    image: "images/enemy_5.png",
    hp: 130,
    maxHp: 130,
    attack: 22,
    defense: 15,
    sanity: 20,
    maxSanity: 20,
    pattern: ["light", "boost", "heavy", "heavy", "defend", "light", "boost"],
  },
];

// Move definitions with dynamic sanity costs and audio references
const MOVE_DEFINITIONS = {
  light: {
    name: "Scoop Slam",
    damage: 20,
    baseCost: 2,
    description: "Reliable damage, predictable cost",
    sanityCosts: {
      vsLight: 2,
      vsHeavy: 3,
      vsDefend: 1,
      vsBoost: 2,
    },
    sound: "audio/attack_light.mp3",
    icon: "images/attack_light_icon.png",
  },
  heavy: {
    name: "Sprinkle Blast",
    damage: 40,
    baseCost: 4,
    description: "Big damage, risky if countered",
    sanityCosts: {
      vsLight: 2,
      vsHeavy: 3,
      vsDefend: 6,
      vsBoost: 0,
    },
    sound: "audio/attack_heavy.mp3",
    icon: "images/attack_heavy_icon.png",
  },
  defend: {
    name: "Ice Shield",
    damage: 0,
    baseCost: 1,
    description: "FREE if they attack, costly if not",
    sanityCosts: {
      vsLight: 0,
      vsHeavy: 0,
      vsDefend: 2,
      vsBoost: 3,
    },
    sound: "audio/defend.mp3",
    icon: "images/defend_icon.png",
  },
  boost: {
    name: "Sugar Rush",
    damage: 0,
    baseCost: 3,
    description: "+60% damage next turn",
    sanityCosts: {
      vsLight: 3,
      vsHeavy: 5,
      vsDefend: 1,
      vsBoost: 1,
    },
    sound: "audio/boost.mp3",
    icon: "images/boost_icon.png",
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

// Training cone images and data
const TRAINING_CONES = [
  { emoji: "🍦", image: "images/cone_vanilla.png" },
  { emoji: "🍨", image: "images/cone_soft.png" },
  { emoji: "🍧", image: "images/cone_shaved.png" },
];

// Enhanced Slot machine configuration with MUCH higher win rates (targeting ~75%)
const SLOT_CONFIG = {
  symbols: [
    { emoji: "🍦", image: "images/slot_vanilla.png", name: "vanilla" },
    { emoji: "🍫", image: "images/slot_chocolate.png", name: "chocolate" },
    { emoji: "🍓", image: "images/slot_strawberry.png", name: "strawberry" },
    { emoji: "🍨", image: "images/slot_soft.png", name: "soft" },
    { emoji: "🧊", image: "images/slot_ice.png", name: "ice" },
    { emoji: "🪙", image: "images/slot_coin.png", name: "coin" },
  ],
  // Adjusted weights to give approximately 75% win rate
  // With 6 symbols, to get ~75% win rate for triple matches, we need heavily weighted distribution
  weights: [90, 70, 50, 30, 10, 5], // This should give roughly 75% win chance
  rewards: {
    triple: {
      vanilla: {
        name: "VANILLA VICTORY!",
        attack: 2,
        color: "#f5e6d3",
      },
      chocolate: {
        name: "CHOCOLATE CHAMPION!",
        defense: 2,
        color: "#8b4513",
      },
      strawberry: {
        name: "STRAWBERRY SUPREME!",
        hp: 15,
        color: "#ff6b6b",
      },
      soft: {
        name: "SOFT SERVE SUCCESS!",
        sanity: 2,
        color: "#ffeaa7",
      },
      ice: {
        name: "ICE COLD JACKPOT!",
        attack: 1,
        defense: 1,
        sanity: 1,
        hp: 10,
        color: "#48dbfb",
      },
      coin: {
        name: "COIN JACKPOT!",
        points: 15,
        color: "#fdcb6e",
      },
    },
  },
  // Paytable for display
  paytable: [
    { symbol: "🍦", name: "Vanilla", reward: "+2 Attack" },
    { symbol: "🍫", name: "Chocolate", reward: "+2 Defense" },
    { symbol: "🍓", name: "Strawberry", reward: "+15 HP" },
    { symbol: "🍨", name: "Soft Serve", reward: "+2 Max Sanity" },
    { symbol: "🧊", name: "Ice", reward: "+1 All Stats & +10 HP" },
    { symbol: "🪙", name: "Coin", reward: "+15 Training Points" },
  ],
  sounds: {
    spin: "audio/slot_spin.mp3",
    win: "audio/slot_win.mp3",
    jackpot: "audio/slot_jackpot.mp3",
  },
};

// Training rewards with image references
const TRAINING_REWARDS = {
  attack: {
    name: "+3 Attack",
    description: "Increase your attack power",
    icon: "images/upgrade_attack.png",
    apply: (player) => {
      player.attack += 3;
    },
  },
  defense: {
    name: "+3 Defense",
    description: "Increase your defense power",
    icon: "images/upgrade_defense.png",
    apply: (player) => {
      player.defense += 3;
    },
  },
  sanity: {
    name: "+1 Max Sanity",
    description: "Increase your maximum sanity",
    icon: "images/upgrade_sanity.png",
    apply: (player) => {
      player.maxSanity += 1;
      player.sanity = Math.min(player.sanity + 1, player.maxSanity);
    },
  },
  health: {
    name: "+10 Max HP",
    description: "Increase your maximum health",
    icon: "images/upgrade_health.png",
    apply: (player) => {
      player.maxHp += 10;
      player.hp = Math.min(player.hp + 10, player.maxHp);
    },
  },
};

// Audio configuration
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

    // Move sounds (mapping the move types to actual sound files)
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
    coneClick: "audio/cone_click.mp3",
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
  },
};

// Utility functions for configuration
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
   * Get a random training cone
   */
  getRandomTrainingCone() {
    return this.getRandomElement(TRAINING_CONES);
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
    TRAINING_CONES,
    SLOT_CONFIG,
    TRAINING_REWARDS,
    AUDIO_CONFIG,
    CONFIG_UTILS,
  };
}
