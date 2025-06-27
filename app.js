// Enhanced Ice Cream Fighter - Main Application Controller with Achievements
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
      slotConsecutiveLosses: 0,
      currentScreen: "fighter-select-screen",
      selectedFighterType: null,
    };

    this.timers = {
      training: null,
      animations: [],
    };

    this.audioEnabled = false;
    this.currentMusic = null;
    this.audioInitialized = false;

    // Achievement system
    this.achievements = CONFIG_UTILS.loadAchievements();

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
      this.setupAchievementSystem();
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
   * Set up achievement system
   */
  setupAchievementSystem() {
    this.renderAchievements();

    // Set up achievement drawer toggle
    window.toggleAchievements = () => {
      const drawer = document.getElementById("achievement-drawer");
      if (drawer) {
        drawer.classList.toggle("open");
      }
    };
  }

  /**
   * Render achievements in the drawer
   */
  renderAchievements() {
    const grid = document.getElementById("achievement-grid");
    if (!grid) return;

    grid.innerHTML = "";

    Object.entries(this.achievements).forEach(([key, achievement]) => {
      const item = document.createElement("div");
      item.className = `achievement-item ${
        achievement.unlocked ? "unlocked" : "locked"
      }`;

      item.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-tooltip">${achievement.description}</div>
      `;

      grid.appendChild(item);
    });
  }

  /**
   * Unlock an achievement
   */
  unlockAchievement(achievementKey) {
    if (!this.achievements[achievementKey]) {
      console.warn(`Achievement not found: ${achievementKey}`);
      return;
    }

    if (this.achievements[achievementKey].unlocked) {
      return; // Already unlocked
    }

    this.achievements[achievementKey].unlocked = true;
    CONFIG_UTILS.saveAchievements(this.achievements);

    // Play achievement sound
    this.playSound("achievementUnlock");

    // Show achievement notification
    this.showAchievementNotification(this.achievements[achievementKey]);

    // Re-render achievements
    this.renderAchievements();

    console.log(
      `Achievement unlocked: ${this.achievements[achievementKey].name}`
    );
  }

  /**
   * Show achievement notification
   */
  showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #48dbfb 0%, #0abde3 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 10000;
      font-family: "Comic Sans MS", cursive, sans-serif;
      font-size: 14px;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.5s ease;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="font-size: 24px;">${achievement.icon}</div>
        <div>
          <div style="font-weight: bold;">Achievement Unlocked!</div>
          <div>${achievement.name}</div>
          <div style="font-size: 12px; opacity: 0.8;">${achievement.description}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 500);
    }, 3000);
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
    // Check for focused training achievements before starting next battle
    if (this.training && this.training.checkFocusedTrainingAchievements) {
      this.training.checkFocusedTrainingAchievements();
    }

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
   * Update fighter-specific move names in UI
   */
  updateFighterMoveNames() {
    if (!this.gameState.player || !this.gameState.selectedFighterType) return;

    const fighter = FIGHTER_TEMPLATES[this.gameState.selectedFighterType];
    if (!fighter || !fighter.moves) return;

    // Update move button names
    const lightName = document.getElementById("light-move-name");
    const heavyName = document.getElementById("heavy-move-name");
    const defendName = document.getElementById("defend-move-name");
    const boostName = document.getElementById("boost-move-name");

    if (lightName) lightName.textContent = fighter.moves.light.name;
    if (heavyName) heavyName.textContent = fighter.moves.heavy.name;
    if (defendName) defendName.textContent = fighter.moves.defend.name;
    if (boostName) boostName.textContent = fighter.moves.boost.name;

    // Update move button icons/emojis
    const lightBtn = document.getElementById("btn-light");
    const heavyBtn = document.getElementById("btn-heavy");
    const defendBtn = document.getElementById("btn-defend");
    const boostBtn = document.getElementById("btn-boost");

    if (lightBtn) {
      const icon =
        lightBtn.querySelector("img") || lightBtn.querySelector("div");
      if (icon && icon.tagName === "DIV") {
        icon.textContent = fighter.moves.light.icon;
      }
    }
    if (heavyBtn) {
      const icon =
        heavyBtn.querySelector("img") || heavyBtn.querySelector("div");
      if (icon && icon.tagName === "DIV") {
        icon.textContent = fighter.moves.heavy.icon;
      }
    }
    if (defendBtn) {
      const icon =
        defendBtn.querySelector("img") || defendBtn.querySelector("div");
      if (icon && icon.tagName === "DIV") {
        icon.textContent = fighter.moves.defend.icon;
      }
    }
    if (boostBtn) {
      const icon =
        boostBtn.querySelector("img") || boostBtn.querySelector("div");
      if (icon && icon.tagName === "DIV") {
        icon.textContent = fighter.moves.boost.icon;
      }
    }
  }

  /**
   * Handle enemy defeat and unlock achievement
   */
  onEnemyDefeated(battleNumber) {
    const achievementKey = `enemy_${battleNumber}`;
    this.unlockAchievement(achievementKey);
  }

  /**
   * Handle game victory and unlock character achievement
   */
  onGameVictory() {
    if (this.gameState.selectedFighterType) {
      const achievementKey = `${this.gameState.selectedFighterType}_victory`;
      this.unlockAchievement(achievementKey);
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
    const statusEl = document.getElementById("audio-status");
    if (statusEl) {
      statusEl.textContent = game.audioEnabled ? "Enabled" : "Disabled";
    }
  };

  window.testMusic = () => {
    game.initializeAudio();
    game.playMusic("menu");
    const statusEl = document.getElementById("audio-status");
    if (statusEl) {
      statusEl.textContent = game.audioEnabled ? "Enabled" : "Disabled";
    }
  };

  // Debug achievement unlock function
  window.testAchievement = (key) => {
    game.unlockAchievement(key);
  };

  // Debug function to unlock all achievements
  window.unlockAllAchievements = () => {
    Object.keys(game.achievements).forEach((key) => {
      game.unlockAchievement(key);
    });
  };

  // Debug function to reset achievements
  window.resetAchievements = () => {
    localStorage.removeItem("iceCreamFighterAchievements");
    game.achievements = CONFIG_UTILS.loadAchievements();
    game.renderAchievements();
    console.log("Achievements reset");
  };

  setInterval(() => {
    const statusEl = document.getElementById("audio-status");
    if (statusEl) {
      statusEl.textContent = game.audioEnabled ? "Enabled" : "Disabled";
    }
  }, 1000);
});
