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
    MAX_COMBO_MULTIPLIER: 5
};

// Fighter Templates
const FIGHTER_TEMPLATES = {
    vanilla: {
        name: 'Vanilla',
        sprite: '🍦',
        hp: 100,
        maxHp: 100,
        attack: 15,
        defense: 10,
        sanity: 12,
        maxSanity: 12
    },
    chocolate: {
        name: 'Chocolate',
        sprite: '🍫',
        hp: 90,
        maxHp: 90,
        attack: 20,
        defense: 8,
        sanity: 10,
        maxSanity: 10
    },
    strawberry: {
        name: 'Strawberry',
        sprite: '🍓',
        hp: 110,
        maxHp: 110,
        attack: 12,
        defense: 15,
        sanity: 14,
        maxSanity: 14
    }
};

// Enemy Templates with different attack patterns
const ENEMY_TEMPLATES = [
    {
        name: 'Melty Mike',
        sprite: '🌊',
        hp: 60,
        maxHp: 60,
        attack: 12,
        defense: 5,
        sanity: 8,
        maxSanity: 8,
        pattern: ['light', 'light', 'defend', 'heavy']
    },
    {
        name: 'Freezer Burn Fred',
        sprite: '❄️',
        hp: 80,
        maxHp: 80,
        attack: 15,
        defense: 8,
        sanity: 10,
        maxSanity: 10,
        pattern: ['heavy', 'defend', 'light', 'defend', 'boost']
    },
    {
        name: 'Sour Sam',
        sprite: '🍋',
        hp: 90,
        maxHp: 90,
        attack: 18,
        defense: 10,
        sanity: 12,
        maxSanity: 12,
        pattern: ['boost', 'heavy', 'light', 'light', 'defend']
    },
    {
        name: 'Rocky Road Roger',
        sprite: '🗿',
        hp: 110,
        maxHp: 110,
        attack: 20,
        defense: 12,
        sanity: 15,
        maxSanity: 15,
        pattern: ['defend', 'boost', 'heavy', 'defend', 'light', 'defend']
    },
    {
        name: 'Brain Freeze Boss',
        sprite: '🧠',
        hp: 130,
        maxHp: 130,
        attack: 22,
        defense: 15,
        sanity: 20,
        maxSanity: 20,
        pattern: ['light', 'boost', 'heavy', 'heavy', 'defend', 'light', 'boost']
    }
];

// Move definitions with dynamic sanity costs
const MOVE_DEFINITIONS = {
    light: { 
        name: 'Scoop Slam', 
        damage: 20,
        baseCost: 2,
        description: 'Reliable damage, predictable cost',
        sanityCosts: {
            vsLight: 2,
            vsHeavy: 3,
            vsDefend: 1,
            vsBoost: 2
        }
    },
    heavy: { 
        name: 'Sprinkle Blast', 
        damage: 40,
        baseCost: 4,
        description: 'Big damage, risky if countered',
        sanityCosts: {
            vsLight: 3,
            vsHeavy: 6,
            vsDefend: 2,
            vsBoost: 4
        }
    },
    defend: { 
        name: 'Ice Shield', 
        damage: 0,
        baseCost: 1,
        description: 'FREE if they attack, costly if not',
        sanityCosts: {
            vsLight: 0,
            vsHeavy: 0,
            vsDefend: 2,
            vsBoost: 3
        }
    },
    boost: { 
        name: 'Sugar Rush', 
        damage: 0,
        baseCost: 3,
        description: '+60% damage next turn',
        sanityCosts: {
            vsLight: 3,
            vsHeavy: 5,
            vsDefend: 1,
            vsBoost: 2
        }
    }
};

// Fighter dialogue for talk mechanic
const FIGHTER_STATEMENTS = {
    vanilla: [
        "I'm feeling a bit vanilla right now...",
        "Sometimes I wonder if I'm too plain.",
        "I need to keep my cool!",
        "Classic never goes out of style, right?"
    ],
    chocolate: [
        "I'm melting under the pressure!",
        "Dark thoughts are creeping in...",
        "I feel bitter about this battle.",
        "My strength is fading like cocoa in the sun!"
    ],
    strawberry: [
        "I'm not feeling so sweet anymore...",
        "Everything's getting berry difficult!",
        "My defenses are crumbling like shortcake!",
        "I need to preserve my strength!"
    ]
};

// Talk responses for sanity restoration
const TALK_RESPONSES = [
    { text: "You're the coolest fighter I know!", success: true, sanity: 3 },
    { text: "Stay strong, we're winning this!", success: true, sanity: 4 },
    { text: "Don't melt down on me now!", success: false, sanity: 1 },
    { text: "Remember why we're fighting!", success: true, sanity: 3 },
    { text: "You're making me hungry... wait, that's not helping!", success: false, sanity: 0 },
    { text: "Channel your inner freeze!", success: true, sanity: 2 },
    { text: "Think of happy sundaes!", success: true, sanity: 3 },
    { text: "Just chill out! Get it? Chill?", success: false, sanity: 1 }
];

// Malfunction messages for sanity crisis
const MALFUNCTION_MESSAGES = [
    "I'm just a puddle now!",
    "The sprinkles are whispering secrets!",
    "I can see through time!",
    "Everything tastes like purple!",
    "I am become dairy, destroyer of cones!"
];

// Talk-down dialogue options
const TALKDOWN_OPTIONS = [
    { text: "You're still solid! Feel your cone!", success: true },
    { text: "The sprinkles aren't real, focus on my voice!", success: true },
    { text: "SNAP OUT OF IT!", success: false },
    { text: "Just calm down and breathe... wait, can ice cream breathe?", success: false },
    { text: "Remember your training! You're stronger than this!", success: true },
    { text: "Think of all the happy customers you've served!", success: true }
];

// Training cone emojis
const TRAINING_CONES = ['🍦', '🍨', '🍧'];

// Slot machine configuration
const SLOT_CONFIG = {
    symbols: ['🍦', '🍫', '🍓', '🍨', '🧊'],
    weights: [30, 25, 25, 15, 5],
    rewards: {
        triple: {
            '🧊': {
                name: 'SUPER JACKPOT!',
                attack: 5,
                defense: 5,
                maxSanity: 2,
                restoreSanity: true,
                color: '#48dbfb'
            },
            default: {
                name: 'JACKPOT!',
                attack: 2,
                defense: 2,
                hp: 15,
                color: '#f5576c'
            }
        },
        double: {
            attack: { name: 'Nice! +1 Attack!', attack: 1 },
            defense: { name: 'Nice! +1 Defense!', defense: 1 },
            hp: { name: 'Nice! +8 HP!', hp: 8 }
        },
        consolation: {
            name: 'No match, but +3 HP as consolation!',
            hp: 3,
            color: '#95a5a6'
        }
    }
};

// Training rewards
const TRAINING_REWARDS = {
    attack: {
        name: '+3 Attack Power',
        description: 'Increase your attack power',
        apply: (player) => { player.attack += 3; }
    },
    defense: {
        name: '+3 Defense Power',
        description: 'Increase your defense power',
        apply: (player) => { player.defense += 3; }
    },
    sanity: {
        name: '+1 Max Sanity',
        description: 'Increase your maximum sanity',
        apply: (player) => { 
            player.maxSanity += 1; 
            player.sanity = Math.min(player.sanity + 1, player.maxSanity);
        }
    },
    health: {
        name: '+10 Max HP (Score 50+)',
        description: 'Increase your maximum health',
        apply: (player) => { 
            player.maxHp += 10; 
            player.hp = Math.min(player.hp + 10, player.maxHp);
        }
    }
};

// Utility functions for configuration
const CONFIG_UTILS = {
    /**
     * Get a random element from an array
     * @param {Array} array - The array to pick from
     * @returns {*} Random element from the array
     */
    getRandomElement(array) {
        if (!Array.isArray(array) || array.length === 0) {
            console.warn('getRandomElement called with invalid array:', array);
            return null;
        }
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Get a weighted random symbol for slot machine
     * @returns {string} Random symbol based on weights
     */
    getWeightedSlotSymbol() {
        const { symbols, weights } = SLOT_CONFIG;
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        if (totalWeight <= 0) {
            console.error('Invalid total weight in slot configuration');
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
     * Validate fighter type
     * @param {string} fighterType - The fighter type to validate
     * @returns {boolean} True if valid fighter type
     */
    isValidFighterType(fighterType) {
        return fighterType && FIGHTER_TEMPLATES.hasOwnProperty(fighterType);
    },

    /**
     * Validate move type
     * @param {string} moveType - The move type to validate
     * @returns {boolean} True if valid move type
     */
    isValidMoveType(moveType) {
        return moveType && MOVE_DEFINITIONS.hasOwnProperty(moveType);
    },

    /**
     * Get enemy template for battle number
     * @param {number} battleNumber - The battle number (1-based)
     * @returns {Object|null} Enemy template or null if invalid
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
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Calculate damage with defense reduction
     * @param {number} baseDamage - Base damage amount
     * @param {number} defense - Defense value
     * @returns {number} Final damage (minimum 1)
     */
    calculateDamage(baseDamage, defense = 0) {
        return Math.max(1, baseDamage - defense);
    }
};

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
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
        CONFIG_UTILS
    };
}