// Ice Cream Fighter - Main Application Controller
class IceCreamFighter {
  constructor() {
    this.gameState = {
      currentBattle: 1,
      player: null,
      enemy: null,
      playerBoost: false,
      enemyBoost: false,
      playerDefending: false,
      enemyDefending: false,
      turnCount: 0,
      isPlayerTurn: true,
      isMalfunctioning: false,
      trainingScore: 0,
      trainingCombo: 0,
      trainingActive: false,
      slotSpins: 0,
      trainingPurchases: 0,
      currentScreen: "fighter-select-screen",
    };

    this.timers = {
      training: null,
      animations: [],
    };

    this.audioEnabled = false;
    this.currentMusic = null;
    this.audioInitialized = false;

    // Initialize module instances
    this.fighterSelection = new FighterSelection(this);
    this.training = new Training(this);
    this.combat = new Combat(this);
    this.victoryScreen = new VictoryScreen(this);
    this.gameOverScreen = new GameOverScreen(this);

    this.init();
  }

  /**
   * Initialize the game
   */
  init() {
    try {
      this.setupEventListeners();
      this.showScreen("fighter-select-screen");
      console.log("Ice Cream Fighter initialized successfully");
      console.log("Audio will be enabled after first user interaction");
    } catch (error) {
      console.error("Failed to initialize game:", error);
      this.showError("Failed to initialize game. Please refresh the page.");
    }
  }

  /**
   * Initialize audio after user interaction
   */
  initializeAudio() {
    if (this.audioInitialized) return;

    this.audioEnabled = true;
    this.audioInitialized = true;
    this.playMusic("menu");
    console.log("Audio system initialized");
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Initialize module event listeners
    this.fighterSelection.setupEventListeners();
    this.training.setupEventListeners();
    this.combat.setupEventListeners();
    this.victoryScreen.setupEventListeners();
    this.gameOverScreen.setupEventListeners();
  }

  /**
   * Play background music
   */
  playMusic(musicType) {
    if (!this.audioEnabled || !AUDIO_CONFIG.music[musicType]) return;

    try {
      if (this.currentMusic) {
        this.currentMusic.pause();
        this.currentMusic.currentTime = 0;
      }

      this.currentMusic = new Audio(AUDIO_CONFIG.music[musicType]);
      this.currentMusic.loop = true;
      this.currentMusic.volume = 0.3;
      this.currentMusic.play().catch((error) => {
        console.warn(`Could not play music: ${musicType}`, error);
      });
    } catch (error) {
      console.warn(`Error playing music: ${musicType}`, error);
    }
  }

  /**
   * Play sound effect
   */
  playSound(soundType, volume = 0.7) {
    if (!this.audioEnabled || !AUDIO_CONFIG.sounds[soundType]) {
      if (!AUDIO_CONFIG.sounds[soundType]) {
        console.warn(`Sound not found: ${soundType}`);
      }
      return;
    }
    CONFIG_UTILS.playAudio(AUDIO_CONFIG.sounds[soundType], volume);
  }

  /**
   * Show a specific game screen
   */
  showScreen(screenId) {
    try {
      document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.remove("active");
      });

      const targetScreen = document.getElementById(screenId);
      if (targetScreen) {
        targetScreen.classList.add("active");
        this.gameState.currentScreen = screenId;
        this.playSound("screenTransition");
      } else {
        throw new Error(`Screen not found: ${screenId}`);
      }
    } catch (error) {
      console.error("Failed to show screen:", error);
    }
  }

  /**
   * Start next battle
   */
  startNextBattle() {
    this.gameState.currentBattle++;
    this.playMusic("battle");
    this.showScreen("battle-screen");
    this.combat.startBattle();
  }

  /**
   * Update move button damage display when player stats change
   */
  updateMoveButtonDamage() {
    if (this.combat && this.combat.updateMoveButtonDamage) {
      this.combat.updateMoveButtonDamage();
    }
  }

  /**
   * Add animation class and track for cleanup
   */
  addAnimationClass(element, animationClass) {
    if (!element) return;

    element.classList.add(animationClass);
    this.timers.animations.push({
      element,
      class: animationClass,
      timeout: setTimeout(() => {
        element.classList.remove(animationClass);
      }, GAME_CONFIG.ANIMATION_DURATION),
    });
  }

  /**
   * Clear all animations
   */
  clearAnimations() {
    this.timers.animations.forEach(
      ({ element, class: animationClass, timeout }) => {
        clearTimeout(timeout);
        if (element) {
          element.classList.remove(animationClass);
        }
      }
    );
    this.timers.animations = [];
  }

  /**
   * Show damage number animation
   */
  showDamageNumber(element, damage, isHeal = false) {
    if (!element) return;

    try {
      const rect = element.getBoundingClientRect();
      const gameContainer = document.querySelector(".game-container");
      const containerRect = gameContainer.getBoundingClientRect();

      const dmgNum = document.createElement("div");
      dmgNum.className = `damage-number ${isHeal ? "heal-number" : ""}`;
      dmgNum.textContent = `${isHeal ? "+" : "-"}${damage}`;
      dmgNum.style.left =
        rect.left - containerRect.left + rect.width / 2 + "px";
      dmgNum.style.top = rect.top - containerRect.top + "px";

      gameContainer.appendChild(dmgNum);

      setTimeout(() => {
        if (dmgNum.parentNode) {
          dmgNum.remove();
        }
      }, GAME_CONFIG.DAMAGE_NUMBER_DURATION);
    } catch (error) {
      console.error("Failed to show damage number:", error);
    }
  }

  /**
   * Add message to battle log
   */
  addBattleLog(message) {
    const log = document.getElementById("battle-log");
    if (!log) return;

    const entry = document.createElement("div");
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }

  /**
   * Update element text content safely
   */
  updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = content;
    }
  }

  /**
   * Show error message to user
   */
  showError(message) {
    alert(message);
  }

  /**
   * Clean up all timers and intervals
   */
  cleanupTimers() {
    if (this.timers.training) {
      clearInterval(this.timers.training);
      this.timers.training = null;
    }
    this.clearAnimations();
  }

  /**
   * Cleanup when page unloads
   */
  destroy() {
    this.cleanupTimers();
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }
}

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const game = new IceCreamFighter();

  window.addEventListener("beforeunload", () => {
    game.destroy();
  });

  // Debug functions
  window.testAudio = () => {
    game.initializeAudio();
    game.playSound("buttonClick");
    document.getElementById("audio-status").textContent = game.audioEnabled
      ? "Enabled"
      : "Disabled";
  };

  window.testMusic = () => {
    game.initializeAudio();
    game.playMusic("menu");
    document.getElementById("audio-status").textContent = game.audioEnabled
      ? "Enabled"
      : "Disabled";
  };

  setInterval(() => {
    const statusEl = document.getElementById("audio-status");
    if (statusEl) {
      statusEl.textContent = game.audioEnabled ? "Enabled" : "Disabled";
    }
  }, 1000);
});
