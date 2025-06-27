// Ice Cream Fighter - Main Application Logic
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
      trainingPurchases: 0, // Track stat purchases during current training
      currentScreen: "fighter-select-screen",
    };

    this.timers = {
      training: null,
      animations: [],
    };

    this.audioEnabled = false; // Start disabled due to autoplay policies
    this.currentMusic = null;
    this.audioInitialized = false;

    this.init();
  }

  /**
   * Initialize the game
   */
  init() {
    try {
      this.setupEventListeners();
      this.showScreen("fighter-select-screen");
      // Don't play music immediately due to autoplay policies
      console.log("Ice Cream Fighter initialized successfully");
      console.log("Audio will be enabled after first user interaction");
    } catch (error) {
      console.error("Failed to initialize game:", error);
      this.showError("Failed to initialize game. Please refresh the page.");
    }
  }

  /**
   * Initialize audio after user interaction (required by modern browsers)
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
    // Fighter selection
    document.querySelectorAll(".fighter-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        this.initializeAudio(); // Initialize audio on first interaction
        const fighterType = e.currentTarget.dataset.fighter;
        this.playSound("fighterSelect");
        this.selectFighter(fighterType);
      });

      option.addEventListener("mouseenter", () => {
        this.playSound("buttonHover");
      });
    });

    // Move buttons
    document.querySelectorAll(".move-btn[data-move]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const moveType = e.currentTarget.dataset.move;
        this.playSound("buttonClick");
        this.playerMove(moveType);
      });

      btn.addEventListener("mouseenter", (e) => {
        const moveType = e.currentTarget.dataset.move;
        this.playSound("buttonHover");
        this.updateTooltip(moveType);
      });
    });

    // Talk button
    const talkBtn = document.getElementById("talk-btn");
    if (talkBtn) {
      talkBtn.addEventListener("click", () => {
        this.playSound("buttonClick");
        this.startTalk();
      });
    }

    // Training rewards
    document.querySelectorAll("[data-training]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const rewardType = e.currentTarget.dataset.training;
        this.playSound("buttonClick");
        this.applyTraining(rewardType);
      });

      btn.addEventListener("mouseenter", () => {
        this.playSound("buttonHover");
      });
    });

    // Slot machine
    const spinBtn = document.getElementById("spin-btn");
    if (spinBtn) {
      spinBtn.addEventListener("click", () => {
        this.playSound("buttonClick");
        this.spinSlots();
      });
    }

    // Continue buttons
    const continueTraining = document.getElementById("continue-training");
    if (continueTraining) {
      continueTraining.addEventListener("click", () => {
        this.playSound("buttonClick");
        this.startNextBattle();
      });
    }

    const restartGame = document.getElementById("restart-game");
    if (restartGame) {
      restartGame.addEventListener("click", () => {
        this.playSound("buttonClick");
        location.reload();
      });
    }

    const playAgain = document.getElementById("play-again");
    if (playAgain) {
      playAgain.addEventListener("click", () => {
        this.playSound("buttonClick");
        location.reload();
      });
    }

    // Training target for cone clicking
    const trainingTarget = document.getElementById("training-target");
    if (trainingTarget) {
      trainingTarget.addEventListener("click", (e) => {
        // Check if clicked element or its parent has moving-cone class
        const coneElement = e.target.closest(".moving-cone");
        if (coneElement) {
          const points = parseInt(coneElement.dataset.points) || 1;
          this.playSound("coneClick");
          this.collectCone(coneElement, points);
        }
      });
    }
  }

  /**
   * Play background music
   * @param {string} musicType - Type of music to play
   */
  playMusic(musicType) {
    if (!this.audioEnabled || !AUDIO_CONFIG.music[musicType]) return;

    try {
      // Stop current music
      if (this.currentMusic) {
        this.currentMusic.pause();
        this.currentMusic.currentTime = 0;
      }

      // Start new music
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
   * @param {string} soundType - Type of sound to play
   * @param {number} volume - Volume level (0-1)
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
   * Select a fighter and start the game
   * @param {string} fighterType - The type of fighter to select
   */
  selectFighter(fighterType) {
    if (!CONFIG_UTILS.isValidFighterType(fighterType)) {
      console.error(`Invalid fighter type: ${fighterType}`);
      this.showError("Invalid fighter selection");
      return;
    }

    try {
      this.gameState.player = { ...FIGHTER_TEMPLATES[fighterType] };
      this.showScreen("battle-screen");
      this.playMusic("battle");
      this.startBattle();
    } catch (error) {
      console.error("Failed to select fighter:", error);
      this.showError("Failed to select fighter");
    }
  }

  /**
   * Show a specific game screen
   * @param {string} screenId - The ID of the screen to show
   */
  showScreen(screenId) {
    try {
      // Hide all screens
      document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.remove("active");
      });

      // Show target screen
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
   * Start a battle
   */
  startBattle() {
    try {
      const enemyTemplate = CONFIG_UTILS.getEnemyTemplate(
        this.gameState.currentBattle
      );
      if (!enemyTemplate) {
        this.gameOver("No more enemies to fight!");
        return;
      }

      this.gameState.enemy = { ...enemyTemplate };
      this.gameState.turnCount = 0;
      this.gameState.isPlayerTurn = true;
      this.gameState.playerBoost = false;
      this.gameState.enemyBoost = false;
      this.gameState.playerDefending = false;
      this.gameState.enemyDefending = false;

      // Restore some sanity between battles
      this.gameState.player.sanity = Math.min(
        this.gameState.player.sanity +
          GAME_CONFIG.SANITY_RECOVERY_BETWEEN_BATTLES,
        this.gameState.player.maxSanity
      );

      this.updateBattleUI();
      this.addBattleLog(`Battle ${this.gameState.currentBattle} begins!`);
      this.addBattleLog(`${this.gameState.enemy.name} appears!`);
      this.updateSlotButtonState();
      this.playSound("battleStart");
    } catch (error) {
      console.error("Failed to start battle:", error);
      this.gameOver("An error occurred starting the battle!");
    }
  }

  /**
   * Update the battle UI
   */
  updateBattleUI() {
    try {
      const battleNumber = document.getElementById("battle-number");
      if (battleNumber) {
        battleNumber.textContent = this.gameState.currentBattle;
      }

      // Update player stats and image
      this.updateFighterUI("player", this.gameState.player);

      // Update enemy stats and image
      this.updateFighterUI("enemy", this.gameState.enemy);

      // Update button states
      const buttons = document.querySelectorAll(".move-btn");
      buttons.forEach((btn) => {
        btn.disabled =
          !this.gameState.isPlayerTurn || this.gameState.isMalfunctioning;
      });

      // Special handling for talk button
      const talkBtn = document.getElementById("talk-btn");
      if (talkBtn) {
        talkBtn.disabled =
          !this.gameState.isPlayerTurn ||
          this.gameState.player.sanity >= this.gameState.player.maxSanity - 1;
      }

      // Update dialogue portrait if visible
      const dialoguePortrait = document.getElementById("dialogue-portrait");
      if (dialoguePortrait && this.gameState.player) {
        CONFIG_UTILS.updateImage(
          dialoguePortrait,
          this.gameState.player.image,
          `${this.gameState.player.name} Portrait`
        );
      }
    } catch (error) {
      console.error("Failed to update battle UI:", error);
    }
  }

  /**
   * Update UI for a specific fighter
   * @param {string} type - 'player' or 'enemy'
   * @param {Object} fighter - Fighter data
   */
  updateFighterUI(type, fighter) {
    const elements = {
      name: document.getElementById(`${type}-name`),
      image: document.getElementById(`${type}-image`),
      hp: document.getElementById(`${type}-hp`),
      maxHp: document.getElementById(`${type}-max-hp`),
      sanity: document.getElementById(`${type}-sanity`),
      maxSanity: document.getElementById(`${type}-max-sanity`),
      hpBar: document.getElementById(`${type}-hp-bar`),
      sanityBar: document.getElementById(`${type}-sanity-bar`),
    };

    if (elements.name) elements.name.textContent = fighter.name;
    if (elements.image && fighter.image) {
      CONFIG_UTILS.updateImage(elements.image, fighter.image, fighter.name);
    }
    if (elements.hp) elements.hp.textContent = Math.max(0, fighter.hp);
    if (elements.maxHp) elements.maxHp.textContent = fighter.maxHp;
    if (elements.sanity) elements.sanity.textContent = fighter.sanity;
    if (elements.maxSanity) elements.maxSanity.textContent = fighter.maxSanity;

    if (elements.hpBar) {
      const hpPercent = (fighter.hp / fighter.maxHp) * 100;
      elements.hpBar.style.width = `${Math.max(0, hpPercent)}%`;
    }

    if (elements.sanityBar) {
      const sanityPercent = (fighter.sanity / fighter.maxSanity) * 100;
      elements.sanityBar.style.width = `${Math.max(0, sanityPercent)}%`;
    }
  }

  /**
   * Handle player move
   * @param {string} moveType - The type of move to execute
   */
  playerMove(moveType) {
    if (!this.gameState.isPlayerTurn || this.gameState.isMalfunctioning) {
      return;
    }

    if (!CONFIG_UTILS.isValidMoveType(moveType)) {
      console.error(`Invalid move type: ${moveType}`);
      return;
    }

    try {
      const move = MOVE_DEFINITIONS[moveType];
      this.gameState.isPlayerTurn = false;

      // Calculate and apply sanity cost
      const sanityCost = move.baseCost;
      this.gameState.player.sanity = Math.max(
        0,
        this.gameState.player.sanity - sanityCost
      );
      this.addBattleLog(
        `${this.gameState.player.name} uses ${move.name}, costing ${sanityCost} sanity!`
      );

      // Check for malfunction
      if (this.gameState.player.sanity <= 0) {
        this.gameState.player.sanity = 0;
        this.updateBattleUI();
        setTimeout(() => this.triggerMalfunction(), 500);
        return;
      }

      // Execute the move
      this.executePlayerMove(moveType);
    } catch (error) {
      console.error("Failed to execute player move:", error);
      this.gameState.isPlayerTurn = true;
    }
  }

  /**
   * Execute player move effects
   * @param {string} moveType - The type of move to execute
   */
  executePlayerMove(moveType) {
    const move = MOVE_DEFINITIONS[moveType];
    const playerSprite = document.getElementById("player-sprite");
    const enemySprite = document.getElementById("enemy-sprite");

    // Play move sound
    if (move.sound) {
      this.playSound(moveType); // Use the moveType directly since we mapped them in AUDIO_CONFIG
    }

    // Handle different move types
    switch (moveType) {
      case "defend":
        this.addAnimationClass(playerSprite, "defend-animation");
        this.addBattleLog(
          `${this.gameState.player.name} raises an Ice Shield!`
        );
        this.gameState.playerDefending = true;
        break;

      case "boost":
        this.gameState.playerBoost = true;
        this.addAnimationClass(playerSprite, "boost-animation");
        this.addBattleLog(
          `${this.gameState.player.name} activates Sugar Rush!`
        );
        break;

      case "light":
      case "heavy":
        this.addAnimationClass(playerSprite, "attack-animation");
        let damage = move.damage + this.gameState.player.attack;

        if (this.gameState.playerBoost) {
          damage = Math.floor(damage * GAME_CONFIG.BOOST_MULTIPLIER);
          this.gameState.playerBoost = false;
          this.addBattleLog(
            `${this.gameState.player.name} uses boosted ${move.name}!`
          );
        } else {
          this.addBattleLog(`${this.gameState.player.name} uses ${move.name}!`);
        }

        if (!this.gameState.enemyDefending) {
          const finalDamage = CONFIG_UTILS.calculateDamage(
            damage,
            this.gameState.enemy.defense
          );
          this.gameState.enemy.hp = Math.max(
            0,
            this.gameState.enemy.hp - finalDamage
          );
          this.addAnimationClass(enemySprite, "hit-animation");
          this.showDamageNumber(enemySprite, finalDamage);
          this.addBattleLog(
            `Dealt ${finalDamage} damage to ${this.gameState.enemy.name}!`
          );
          this.playSound("dealDamage");
        } else {
          this.addBattleLog(
            `${this.gameState.enemy.name}'s defense blocked the attack!`
          );
        }
        break;
    }

    // Continue to next phase after animation
    setTimeout(() => this.finishPlayerTurn(), GAME_CONFIG.ANIMATION_DURATION);
  }

  /**
   * Finish player turn and check for battle end
   */
  finishPlayerTurn() {
    // Clear animations
    this.clearAnimations();
    this.updateBattleUI();

    // Check for battle end
    if (this.gameState.enemy.hp <= 0) {
      this.winBattle();
      return;
    }
    if (this.gameState.player.hp <= 0) {
      this.gameOver("Your fighter melted!");
      return;
    }

    // Enemy's turn
    setTimeout(() => this.executeEnemyMove(), GAME_CONFIG.ENEMY_MOVE_DELAY);
  }

  /**
   * Execute enemy move
   */
  executeEnemyMove() {
    // Skip enemy turn if they have no sanity
    if (this.gameState.enemy.sanity <= 0) {
      this.addBattleLog(
        `${this.gameState.enemy.name} is having a meltdown and skips their turn!`
      );
      this.gameState.enemy.sanity = Math.floor(
        this.gameState.enemy.maxSanity * GAME_CONFIG.MALFUNCTION_SANITY_RECOVERY
      );
      this.finishEnemyTurn();
      return;
    }

    try {
      const patternIndex =
        this.gameState.turnCount % this.gameState.enemy.pattern.length;
      const enemyMoveType = this.gameState.enemy.pattern[patternIndex];
      const enemyMove = MOVE_DEFINITIONS[enemyMoveType];

      if (!enemyMove) {
        console.error(`Invalid enemy move: ${enemyMoveType}`);
        this.finishEnemyTurn();
        return;
      }

      const playerSprite = document.getElementById("player-sprite");
      const enemySprite = document.getElementById("enemy-sprite");

      // Apply sanity cost
      const sanityCost = enemyMove.baseCost;
      this.gameState.enemy.sanity = Math.max(
        0,
        this.gameState.enemy.sanity - sanityCost
      );
      this.addBattleLog(
        `${this.gameState.enemy.name} uses ${enemyMove.name}, costing ${sanityCost} sanity!`
      );

      // Execute enemy move
      switch (enemyMoveType) {
        case "defend":
          this.addAnimationClass(enemySprite, "defend-animation");
          this.addBattleLog(
            `${this.gameState.enemy.name} takes a defensive stance!`
          );
          this.gameState.enemyDefending = true;
          break;

        case "boost":
          this.gameState.enemyBoost = true;
          this.addAnimationClass(enemySprite, "boost-animation");
          this.addBattleLog(`${this.gameState.enemy.name} is powering up!`);
          break;

        case "light":
        case "heavy":
          this.addAnimationClass(enemySprite, "attack-animation");
          let damage = enemyMove.damage + this.gameState.enemy.attack;

          if (this.gameState.enemyBoost) {
            damage = Math.floor(damage * GAME_CONFIG.BOOST_MULTIPLIER);
            this.gameState.enemyBoost = false;
            this.addBattleLog(
              `${this.gameState.enemy.name} uses boosted ${enemyMove.name}!`
            );
          } else {
            this.addBattleLog(
              `${this.gameState.enemy.name} uses ${enemyMove.name}!`
            );
          }

          if (!this.gameState.playerDefending) {
            const finalDamage = CONFIG_UTILS.calculateDamage(
              damage,
              this.gameState.player.defense
            );
            this.gameState.player.hp = Math.max(
              0,
              this.gameState.player.hp - finalDamage
            );
            this.addAnimationClass(playerSprite, "hit-animation");
            this.showDamageNumber(playerSprite, finalDamage);
            this.addBattleLog(`You took ${finalDamage} damage!`);
            this.playSound("takeDamage");

            // Interrupt player boost if hit
            if (this.gameState.playerBoost) {
              this.gameState.playerBoost = false;
              this.addBattleLog("Your Sugar Rush was interrupted!");
            }
          } else {
            this.addBattleLog("Your Ice Shield blocked the attack!");
          }
          break;
      }

      setTimeout(() => this.finishEnemyTurn(), GAME_CONFIG.ANIMATION_DURATION);
    } catch (error) {
      console.error("Failed to execute enemy move:", error);
      this.finishEnemyTurn();
    }
  }

  /**
   * Finish enemy turn and prepare for next turn
   */
  finishEnemyTurn() {
    // Clear animations
    this.clearAnimations();

    // Clear defend states
    this.gameState.playerDefending = false;
    this.gameState.enemyDefending = false;

    // Check for battle end
    if (this.gameState.player.hp <= 0) {
      this.gameOver("Your fighter melted!");
      return;
    }
    if (this.gameState.enemy.hp <= 0) {
      this.winBattle();
      return;
    }

    // Next turn
    this.gameState.turnCount++;
    this.gameState.isPlayerTurn = true;

    // Restore sanity
    this.gameState.player.sanity = Math.min(
      this.gameState.player.sanity + GAME_CONFIG.SANITY_RECOVERY_PER_TURN,
      this.gameState.player.maxSanity
    );
    this.gameState.enemy.sanity = Math.min(
      this.gameState.enemy.sanity + GAME_CONFIG.SANITY_RECOVERY_PER_TURN,
      this.gameState.enemy.maxSanity
    );

    this.updateBattleUI();
  }

  /**
   * Add animation class and track for cleanup
   * @param {HTMLElement} element - Element to animate
   * @param {string} animationClass - CSS class for animation
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
   * @param {HTMLElement} element - Element to show damage near
   * @param {number} damage - Damage amount
   * @param {boolean} isHeal - Whether this is healing (optional)
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
   * Update tooltip for move button
   * @param {string} moveType - Type of move
   */
  updateTooltip(moveType) {
    if (!CONFIG_UTILS.isValidMoveType(moveType)) return;

    const move = MOVE_DEFINITIONS[moveType];
    const tooltip = document.getElementById(`tooltip-${moveType}`);

    if (!tooltip) return;

    let html = `<div><strong>${move.description}</strong></div>`;
    html +=
      '<div style="margin-top: 8px;">Sanity cost depends on enemy action:</div>';
    html += `<div class="tooltip-row">vs Light Attack: <span class="sanity-preview">-${move.sanityCosts.vsLight}</span></div>`;
    html += `<div class="tooltip-row">vs Heavy Attack: <span class="sanity-preview">-${move.sanityCosts.vsHeavy}</span></div>`;
    html += `<div class="tooltip-row">vs Defend: <span class="sanity-preview">-${move.sanityCosts.vsDefend}</span></div>`;
    html += `<div class="tooltip-row">vs Boost: <span class="sanity-preview">-${move.sanityCosts.vsBoost}</span></div>`;

    if (moveType === "light" || moveType === "heavy") {
      const damage = move.damage + this.gameState.player.attack;
      const boostedDamage = Math.floor(damage * GAME_CONFIG.BOOST_MULTIPLIER);
      html += `<div style="margin-top: 8px;">Damage: ${damage}`;
      if (this.gameState.playerBoost) {
        html += ` → <span style="color: #f5576c">${boostedDamage} (boosted!)</span>`;
      }
      html += "</div>";
    }

    tooltip.innerHTML = html;
  }

  /**
   * Start talk mechanic
   */
  startTalk() {
    if (
      !this.gameState.isPlayerTurn ||
      this.gameState.player.sanity >= this.gameState.player.maxSanity - 1
    ) {
      return;
    }

    try {
      this.gameState.isPlayerTurn = false;
      this.playSound("talkStart");

      const fighterType = this.gameState.player.name.toLowerCase();
      const statements =
        FIGHTER_STATEMENTS[fighterType] || FIGHTER_STATEMENTS.vanilla;
      const statement = CONFIG_UTILS.getRandomElement(statements);

      const fighterStatementEl = document.getElementById("fighter-statement");
      if (fighterStatementEl) {
        fighterStatementEl.textContent = `"${statement}"`;
      }

      // Get random talk options
      const shuffled = [...TALK_RESPONSES]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const optionsContainer = document.getElementById("talk-options");
      if (optionsContainer) {
        optionsContainer.innerHTML = "";

        shuffled.forEach((option) => {
          const btn = document.createElement("button");
          btn.className = "dialogue-btn";
          btn.textContent = option.text;
          btn.addEventListener("click", () =>
            this.handleTalkResponse(option.success, option.sanity)
          );
          optionsContainer.appendChild(btn);
        });
      }

      const talkDialog = document.getElementById("talk-dialog");
      if (talkDialog) {
        talkDialog.classList.add("active");
      }
    } catch (error) {
      console.error("Failed to start talk:", error);
      this.gameState.isPlayerTurn = true;
    }
  }

  /**
   * Handle talk response
   * @param {boolean} success - Whether the response was successful
   * @param {number} sanityGain - Amount of sanity to gain
   */
  handleTalkResponse(success, sanityGain) {
    const talkDialog = document.getElementById("talk-dialog");
    if (talkDialog) {
      talkDialog.classList.remove("active");
    }

    if (success) {
      const actualGain = Math.min(
        sanityGain,
        this.gameState.player.maxSanity - this.gameState.player.sanity
      );
      this.gameState.player.sanity += actualGain;
      this.addBattleLog(
        `Your encouraging words restored ${actualGain} sanity!`
      );
      this.playSound("talkSuccess");

      const playerSprite = document.getElementById("player-sprite");
      this.showDamageNumber(playerSprite, actualGain, true);
    } else {
      this.playSound("talkFail");
      if (sanityGain > 0) {
        this.gameState.player.sanity = Math.min(
          this.gameState.player.sanity + 1,
          this.gameState.player.maxSanity
        );
        this.addBattleLog("Your words helped a little... (+1 sanity)");
      } else {
        this.addBattleLog("Your words didn't help at all!");
      }
    }

    this.updateBattleUI();
    this.updateSlotButtonState();

    // Enemy gets a turn after talk
    setTimeout(() => {
      if (this.gameState.player.hp <= 0) {
        this.gameOver("Your fighter melted!");
        return;
      }
      this.executeEnemyMove();
    }, 1000);
  }

  /**
   * Trigger malfunction state
   */
  triggerMalfunction() {
    this.gameState.isMalfunctioning = true;
    this.addBattleLog(`${this.gameState.player.name} is having a meltdown!`);
    this.playSound("malfunction");

    setTimeout(() => {
      this.showScreen("talkdown-screen");
      this.startTalkDown();
    }, 1500);
  }

  /**
   * Start talk-down sequence
   */
  startTalkDown() {
    try {
      const message = CONFIG_UTILS.getRandomElement(MALFUNCTION_MESSAGES);
      const malfunctionText = document.getElementById("malfunction-text");
      if (malfunctionText) {
        malfunctionText.textContent = message;
      }

      const shuffled = [...TALKDOWN_OPTIONS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const optionsContainer = document.getElementById("dialogue-options");
      if (optionsContainer) {
        optionsContainer.innerHTML = "";

        shuffled.forEach((option) => {
          const btn = document.createElement("button");
          btn.className = "dialogue-btn";
          btn.textContent = option.text;
          btn.addEventListener("click", () =>
            this.handleDialogue(option.success)
          );
          optionsContainer.appendChild(btn);
        });
      }
    } catch (error) {
      console.error("Failed to start talk-down:", error);
    }
  }

  /**
   * Handle dialogue choice in talk-down
   * @param {boolean} success - Whether the dialogue was successful
   */
  handleDialogue(success) {
    if (success) {
      this.gameState.player.sanity = Math.floor(
        this.gameState.player.maxSanity * 0.5
      );
      this.gameState.isMalfunctioning = false;
      this.addBattleLog(
        `${this.gameState.player.name} calmed down! Sanity restored to ${this.gameState.player.sanity}.`
      );
      this.playSound("malfunctionRecover");
      this.showScreen("battle-screen");
      this.updateBattleUI();
      this.updateSlotButtonState();

      setTimeout(() => {
        if (this.gameState.player.hp <= 0) {
          this.gameOver("Your fighter melted!");
          return;
        }
        this.executeEnemyMove();
      }, 1000);
    } else {
      this.addBattleLog("Your words didn't help!");
      this.startTalkDown();
    }
  }

  /**
   * Win current battle
   */
  winBattle() {
    this.addBattleLog(`${this.gameState.enemy.name} defeated!`);
    this.playSound("battleWin");

    if (this.gameState.currentBattle >= GAME_CONFIG.TOTAL_BATTLES) {
      setTimeout(() => {
        this.playMusic("victory");
        this.playSound("victorySound");
        this.showScreen("victory-screen");
      }, 1500);
    } else {
      setTimeout(() => {
        this.playMusic("training");
        this.showScreen("training-screen");
        this.startTraining();
      }, 1500);
    }
  }

  /**
   * Start training phase
   */
  startTraining() {
    try {
      this.gameState.trainingScore = 0;
      this.gameState.trainingCombo = 0;
      this.gameState.trainingActive = true;
      this.gameState.slotSpins = 0;
      this.gameState.trainingPurchases = 0; // Reset purchases for new training session

      // Reset UI
      this.updateElement("training-score", "0");
      this.updateElement("combo-counter", "0");
      this.updateElement(
        "training-timer",
        GAME_CONFIG.TRAINING_TIME.toString()
      );
      this.updateElement("slot-cost", "1");
      this.updateElement("spin-cost", "1");

      const trainingChoices = document.getElementById("training-choices");
      if (trainingChoices) {
        trainingChoices.classList.remove("active");
      }

      const bonusReward = document.getElementById("bonus-reward");
      if (bonusReward) {
        bonusReward.classList.remove("available");
      }

      const target = document.getElementById("training-target");
      if (target) {
        target.innerHTML = "";
      }

      // Hide continue button initially
      const continueBtn = document.getElementById("continue-training");
      if (continueBtn) {
        continueBtn.style.display = "none";
      }

      this.playSound("trainingStart");
      this.spawnTrainingCones();
      this.startTrainingTimer();
    } catch (error) {
      console.error("Failed to start training:", error);
    }
  }

  /**
   * Start training timer
   */
  startTrainingTimer() {
    let timeLeft = GAME_CONFIG.TRAINING_TIME;

    this.timers.training = setInterval(() => {
      timeLeft--;
      this.updateElement("training-timer", timeLeft.toString());

      if (timeLeft <= 0) {
        this.endTraining();
      }
    }, 1000);
  }

  /**
   * Spawn training cones
   */
  spawnTrainingCones() {
    if (!this.gameState.trainingActive) return;

    try {
      const target = document.getElementById("training-target");
      if (!target) return;

      const cone = document.createElement("div");
      cone.className = "moving-cone";

      // Get random cone data
      const coneData = CONFIG_UTILS.getRandomTrainingCone();
      if (coneData.image) {
        const img = document.createElement("img");
        img.src = coneData.image;
        img.alt = "Training Cone";
        img.className = "cone-image";
        // Make sure the image doesn't interfere with clicking
        img.style.pointerEvents = "none";
        cone.appendChild(img);
      } else {
        cone.textContent = coneData.emoji;
      }

      const x = Math.random() * (target.offsetWidth - 60);
      cone.style.left = x + "px";
      cone.style.bottom = "0px";

      const maxHeight = target.offsetHeight - 60;
      const targetHeight = Math.random() * maxHeight;
      const points = Math.floor((targetHeight / maxHeight) * 5) + 1;

      cone.dataset.points = points.toString();
      cone.dataset.height = targetHeight.toString();

      target.appendChild(cone);

      // Animate cone upward
      setTimeout(() => {
        cone.style.bottom = targetHeight + "px";
      }, 50);

      // Remove cone after timeout
      setTimeout(() => {
        if (cone.parentNode) {
          cone.remove();
          if (this.gameState.trainingCombo > 0) {
            this.gameState.trainingCombo = 0;
            this.updateElement("combo-counter", "0");
          }
        }
      }, GAME_CONFIG.TRAINING_CONE_LIFETIME);

      // Schedule next cone
      const spawnDelay = Math.max(
        GAME_CONFIG.TRAINING_SPAWN_MIN_DELAY,
        GAME_CONFIG.TRAINING_SPAWN_BASE_DELAY -
          this.gameState.trainingScore * 10
      );
      setTimeout(() => this.spawnTrainingCones(), spawnDelay);
    } catch (error) {
      console.error("Failed to spawn training cone:", error);
    }
  }

  /**
   * Collect a training cone
   * @param {HTMLElement} cone - The cone element
   * @param {number} points - Base points for the cone
   */
  collectCone(cone, points) {
    try {
      this.gameState.trainingCombo++;
      const comboMultiplier = Math.min(
        this.gameState.trainingCombo,
        GAME_CONFIG.MAX_COMBO_MULTIPLIER
      );
      const totalPoints = points * comboMultiplier;
      this.gameState.trainingScore += totalPoints;

      // Play combo sound if appropriate
      if (this.gameState.trainingCombo > 1) {
        this.playSound("comboIncrease");
      }

      // Show score popup
      const target = document.getElementById("training-target");
      if (target) {
        const scoreFloat = document.createElement("div");
        scoreFloat.className = "cone-score";
        scoreFloat.textContent = "+" + totalPoints;
        scoreFloat.style.left = cone.style.left;
        scoreFloat.style.bottom = cone.dataset.height + "px";
        target.appendChild(scoreFloat);

        setTimeout(() => {
          if (scoreFloat.parentNode) {
            scoreFloat.remove();
          }
        }, 1000);
      }

      this.updateElement(
        "training-score",
        this.gameState.trainingScore.toString()
      );
      this.updateElement(
        "combo-counter",
        this.gameState.trainingCombo.toString()
      );

      cone.remove();
    } catch (error) {
      console.error("Failed to collect cone:", error);
    }
  }

  /**
   * End training phase
   */
  endTraining() {
    this.gameState.trainingActive = false;

    if (this.timers.training) {
      clearInterval(this.timers.training);
      this.timers.training = null;
    }

    const target = document.getElementById("training-target");
    if (target) {
      target.innerHTML = "";
    }

    const trainingChoices = document.getElementById("training-choices");
    if (trainingChoices) {
      trainingChoices.classList.add("active");
    }

    this.updateElement("final-score", this.gameState.trainingScore.toString());
    this.updateTrainingButtonCosts(); // Update button costs based on purchases
    this.playSound("trainingComplete");

    // Always show continue button after training ends
    const continueBtn = document.getElementById("continue-training");
    if (continueBtn) {
      continueBtn.style.display = "block";
    }

    if (this.gameState.trainingScore >= GAME_CONFIG.TRAINING_BONUS_THRESHOLD) {
      const bonusReward = document.getElementById("bonus-reward");
      if (bonusReward) {
        bonusReward.classList.add("available");
      }
    }
  }

  /**
   * Update training button costs and availability
   */
  updateTrainingButtonCosts() {
    const buttons = document.querySelectorAll("[data-training]");
    buttons.forEach((btn) => {
      const rewardType = btn.dataset.training;
      const cost = this.getTrainingCost(rewardType);
      const canAfford = this.gameState.trainingScore >= cost;

      // Update button text to show cost
      const reward = TRAINING_REWARDS[rewardType];
      if (reward) {
        if (rewardType === "health") {
          // Special handling for bonus reward
          const bonusReward = document.getElementById("bonus-reward");
          if (
            bonusReward &&
            this.gameState.trainingScore >= GAME_CONFIG.TRAINING_BONUS_THRESHOLD
          ) {
            bonusReward.classList.add("available");
            bonusReward.innerHTML = `
              <img src="${reward.icon}" alt="Health Upgrade" class="upgrade-icon" />
              ${reward.name} (${cost} pts)
            `;
            bonusReward.disabled = !canAfford;
          }
        } else {
          btn.innerHTML = `
            <img src="${reward.icon}" alt="${reward.name}" class="upgrade-icon" />
            ${reward.name} (${cost} pts)
          `;
          btn.disabled = !canAfford;
        }
      }
    });
  }

  /**
   * Get cost for training reward based on purchases made
   * @param {string} rewardType - Type of reward
   * @returns {number} Cost in points
   */
  getTrainingCost(rewardType) {
    const baseCost = 5;
    return baseCost + this.gameState.trainingPurchases * 5;
  }

  /**
   * Apply training reward
   * @param {string} rewardType - Type of reward to apply
   */
  applyTraining(rewardType) {
    const reward = TRAINING_REWARDS[rewardType];
    if (!reward) {
      console.error(`Invalid training reward: ${rewardType}`);
      return;
    }

    const cost = this.getTrainingCost(rewardType);

    // Check if player has enough points
    if (this.gameState.trainingScore < cost) {
      this.updateElement(
        "final-score",
        `${this.gameState.trainingScore} (Need ${cost} points!)`
      );
      return;
    }

    try {
      // Deduct points and increment purchases
      this.gameState.trainingScore -= cost;
      this.gameState.trainingPurchases++;

      // Apply the reward
      reward.apply(this.gameState.player);
      this.addBattleLog(
        `Training complete! ${reward.name}! (Cost: ${cost} points)`
      );
      this.playSound("upgradeApply");

      // Update UI
      this.updateElement(
        "final-score",
        this.gameState.trainingScore.toString()
      );
      this.updateTrainingButtonCosts(); // Update costs for remaining purchases
      this.updateSlotButtonState(); // Update slot button since score changed

      // Show continue button after first purchase
      const continueBtn = document.getElementById("continue-training");
      if (continueBtn) {
        continueBtn.style.display = "block";
      }
    } catch (error) {
      console.error("Failed to apply training reward:", error);
    }
  }

  /**
   * Update slot button state
   */
  updateSlotButtonState() {
    const nextCost = 1 + this.gameState.slotSpins;
    const spinBtn = document.getElementById("spin-btn");
    if (spinBtn) {
      spinBtn.disabled = this.gameState.trainingScore < nextCost;
    }
  }

  /**
   * Spin slot machine
   */
  spinSlots() {
    const cost = 1 + this.gameState.slotSpins;

    if (this.gameState.trainingScore < cost) {
      this.updateElement(
        "slot-result",
        `<span style="color: #ff6b6b;">Not enough points! Need ${cost}</span>`
      );
      return;
    }

    try {
      this.gameState.trainingScore -= cost;
      this.gameState.slotSpins++;

      // Update UI to show current score and next cost
      this.updateElement(
        "training-score",
        this.gameState.trainingScore.toString()
      );
      this.updateElement(
        "slot-cost",
        (1 + this.gameState.slotSpins).toString()
      );
      this.updateElement(
        "spin-cost",
        (1 + this.gameState.slotSpins).toString()
      );

      this.playSound("spin", 0.5);

      // Generate results
      const results = [
        CONFIG_UTILS.getWeightedSlotSymbol(),
        CONFIG_UTILS.getWeightedSlotSymbol(),
        CONFIG_UTILS.getWeightedSlotSymbol(),
      ];

      // Animate reels
      const reels = ["reel1", "reel2", "reel3"];
      reels.forEach((reelId, index) => {
        const reel = document.getElementById(reelId);
        const img = reel?.querySelector(".slot-symbol");
        if (!reel || !img) return;

        reel.classList.add("spinning");

        let spins = 0;
        const spinInterval = setInterval(() => {
          const randomSymbol = CONFIG_UTILS.getRandomElement(
            SLOT_CONFIG.symbols
          );
          if (randomSymbol.image) {
            CONFIG_UTILS.updateImage(
              img,
              randomSymbol.image,
              randomSymbol.name
            );
          }
          spins++;

          if (spins > GAME_CONFIG.SLOT_SPIN_COUNT_BASE + index * 5) {
            clearInterval(spinInterval);
            reel.classList.remove("spinning");
            if (results[index].image) {
              CONFIG_UTILS.updateImage(
                img,
                results[index].image,
                results[index].name
              );
            }

            if (index === 2) {
              this.checkSlotResults(results);
            }
          }
        }, GAME_CONFIG.SLOT_SPIN_DURATION);
      });

      this.updateSlotButtonState();
    } catch (error) {
      console.error("Failed to spin slots:", error);
    }
  }

  /**
   * Check slot machine results and apply rewards
   * @param {Array} results - Array of slot symbol objects
   */
  checkSlotResults(results) {
    const resultElement = document.getElementById("slot-result");
    if (!resultElement) return;

    try {
      // Check for triple match
      if (
        results[0].name === results[1].name &&
        results[1].name === results[2].name
      ) {
        const symbolName = results[0].name;
        const reward =
          SLOT_CONFIG.rewards.triple[symbolName] ||
          SLOT_CONFIG.rewards.triple.default;

        if (reward.attack) this.gameState.player.attack += reward.attack;
        if (reward.defense) this.gameState.player.defense += reward.defense;
        if (reward.maxSanity) {
          this.gameState.player.maxSanity += reward.maxSanity;
          if (reward.restoreSanity) {
            this.gameState.player.sanity = this.gameState.player.maxSanity;
          }
        }
        if (reward.hp) {
          this.gameState.player.hp = Math.min(
            this.gameState.player.hp + reward.hp,
            this.gameState.player.maxHp
          );
        }

        resultElement.innerHTML = `<span style="color: ${reward.color};">💎 ${reward.name}</span>`;
        this.playSound(symbolName === "ice" ? "jackpot" : "win");
      }
      // Check for double match
      else if (
        results[0].name === results[1].name ||
        results[1].name === results[2].name ||
        results[0].name === results[2].name
      ) {
        const rewardType = ["attack", "defense", "hp"][
          Math.floor(Math.random() * 3)
        ];
        const reward = SLOT_CONFIG.rewards.double[rewardType];

        if (reward.attack) this.gameState.player.attack += reward.attack;
        if (reward.defense) this.gameState.player.defense += reward.defense;
        if (reward.hp) {
          this.gameState.player.hp = Math.min(
            this.gameState.player.hp + reward.hp,
            this.gameState.player.maxHp
          );
        }

        resultElement.innerHTML = `<span style="color: #667eea;">${reward.name}</span>`;
        this.playSound("win");
      }
      // Consolation prize
      else {
        const reward = SLOT_CONFIG.rewards.consolation;
        this.gameState.player.hp = Math.min(
          this.gameState.player.hp + reward.hp,
          this.gameState.player.maxHp
        );
        resultElement.innerHTML = `<span style="color: ${reward.color};">${reward.name}</span>`;
      }

      this.updateSlotButtonState();
    } catch (error) {
      console.error("Failed to check slot results:", error);
    }
  }

  /**
   * Start next battle
   */
  startNextBattle() {
    this.gameState.currentBattle++;
    this.playMusic("battle");
    this.showScreen("battle-screen");
    this.startBattle();
  }

  /**
   * Game over
   * @param {string} reason - Reason for game over
   */
  gameOver(reason) {
    this.updateElement("final-battle", this.gameState.currentBattle.toString());
    this.updateElement("game-over-reason", reason);

    // Clean up timers
    this.cleanupTimers();

    this.playMusic("gameOver");
    this.playSound("gameOverSound");

    setTimeout(() => {
      this.showScreen("game-over-screen");
    }, 1500);
  }

  /**
   * Add message to battle log
   * @param {string} message - Message to add
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
   * @param {string} elementId - ID of element to update
   * @param {string} content - Content to set
   */
  updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = content;
    }
  }

  /**
   * Show error message to user
   * @param {string} message - Error message
   */
  showError(message) {
    // Could be enhanced with a proper error modal
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

    // Stop music
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }
}

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const game = new IceCreamFighter();

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    game.destroy();
  });

  // Debug functions for testing audio (remove after testing)
  window.testAudio = () => {
    game.initializeAudio();
    game.playSound("buttonClick");
    document.getElementById("audio-status").textContent = game.audioEnabled
      ? "Enabled"
      : "Disabled";
    console.log("Testing button click sound...");
  };

  window.testMusic = () => {
    game.initializeAudio();
    game.playMusic("menu");
    document.getElementById("audio-status").textContent = game.audioEnabled
      ? "Enabled"
      : "Disabled";
    console.log("Testing menu music...");
  };

  // Update audio status display
  setInterval(() => {
    const statusEl = document.getElementById("audio-status");
    if (statusEl) {
      statusEl.textContent = game.audioEnabled ? "Enabled" : "Disabled";
    }
  }, 1000);
});
