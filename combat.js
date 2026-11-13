// Enhanced Combat System Module with Achievement Integration, Fixed Power-ups, and Attack Malfunction
class Combat {
  constructor(game) {
    this.game = game;
  }

  /**
   * Set up combat event listeners
   */
  setupEventListeners() {
    // Move buttons
    document.querySelectorAll(".move-btn[data-move]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const moveType = e.currentTarget.dataset.move;
        this.game.playSound("buttonClick");
        this.playerMove(moveType);
      });

      btn.addEventListener("mouseenter", (e) => {
        const moveType = e.currentTarget.dataset.move;
        this.game.playSound("buttonHover", 0.25);
        this.updateTooltip(moveType);
      });
    });

    // Pep Talk button (spend your turn to restore sanity)
    const talkBtn = document.getElementById("btn-talk");
    if (talkBtn) {
      talkBtn.addEventListener("click", () => {
        this.game.playSound("buttonClick");
        this.startTalk();
      });
    }

    // Tooltip toggle buttons
    document.querySelectorAll(".tooltip-toggle").forEach((toggleBtn) => {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent triggering move button click
        const tooltipId = e.currentTarget.dataset.target;
        const tooltip = document.getElementById(tooltipId);

        if (tooltip) {
          // Close all other tooltips first
          document.querySelectorAll(".move-tooltip").forEach((tip) => {
            if (tip !== tooltip) {
              tip.classList.remove("tooltip-open");
            }
          });

          // Toggle current tooltip
          tooltip.classList.toggle("tooltip-open");

          // Update tooltip content if opening
          if (tooltip.classList.contains("tooltip-open")) {
            const moveType = tooltipId.replace("tooltip-", "");
            this.updateTooltip(moveType);
          }
        }
      });
    });
  }

  /**
   * Start a battle
   */
  startBattle() {
    try {
      const enemyTemplate = CONFIG_UTILS.getEnemyTemplate(
        this.game.gameState.currentBattle
      );
      if (!enemyTemplate) {
        this.game.gameOverScreen.gameOver("No more enemies to fight!");
        return;
      }

      this.game.gameState.enemy = { ...enemyTemplate };
      this.game.environment?.setStage(this.game.gameState.currentBattle);
      this.game.gameState.turnCount = 0;
      this.game.gameState.isPlayerTurn = true;
      this.game.gameState.playerBoost = false;
      this.game.gameState.enemyBoost = false;
      this.game.gameState.playerDefending = false;
      this.game.gameState.enemyDefending = false;
      // Add boost turn counter
      this.game.gameState.playerBoostTurns = 0;
      this.game.gameState.enemyBoostTurns = 0;
      // Add malfunction tracking
      this.game.gameState.malfunctionedMove = null;

      // Fresh log for each battle
      const log = document.getElementById("battle-log");
      if (log) log.innerHTML = "";

      this.game.addBattleLog(
        `Battle ${this.game.gameState.currentBattle} begins! ${this.game.gameState.enemy.name} appears!`
      );

      // Restore some sanity and HP between battles
      const player = this.game.gameState.player;
      player.sanity = Math.min(
        player.sanity + GAME_CONFIG.SANITY_RECOVERY_BETWEEN_BATTLES,
        player.maxSanity
      );
      if (this.game.gameState.currentBattle > 1) {
        const oldHp = player.hp;
        player.hp = Math.min(
          player.maxHp,
          player.hp +
            Math.floor(player.maxHp * GAME_CONFIG.HP_RECOVERY_BETWEEN_BATTLES)
        );
        if (player.hp > oldHp) {
          this.game.addBattleLog(
            `💚 You rested between fights and recovered ${player.hp - oldHp} HP.`
          );
        }
      }

      // No jam on the first turn of a battle
      this.resetMalfunction();

      this.updateBattleUI();
      this.updateMoveButtonDamage();
      this.game.playSound("battleStart");
    } catch (error) {
      console.error("Failed to start battle:", error);
      this.game.gameOverScreen.gameOver(
        "An error occurred starting the battle!"
      );
    }
  }

  /**
   * Apply malfunction to one random attack move for the turn
   */
  applyTurnMalfunction() {
    // "Jammed": occasionally one attack move can't be used this turn
    this.game.gameState.malfunctionedMove = null;
    if (Math.random() < GAME_CONFIG.JAM_CHANCE) {
      const attackMoves = ["light", "heavy"];
      const jammed = CONFIG_UTILS.getRandomElement(attackMoves);
      this.game.gameState.malfunctionedMove = jammed;
      this.game.addBattleLog(
        `🔧 ${this.getPlayerMoveName(jammed)} is jammed this turn!`
      );
    }

    // Update button visual
    this.updateMalfunctionUI();
  }

  /**
   * Update UI to show malfunction status - FIXED: Complete icon restoration
   */
  updateMalfunctionUI() {
    // STEP 1: Reset all buttons first - ensure complete cleanup
    document.querySelectorAll(".move-btn[data-move]").forEach((btn) => {
      const icon = btn.querySelector(".move-icon");
      if (icon) {
        // Clear any malfunction styling
        icon.style.filter = "none";

        // Restore original icon if it was changed
        if (icon.dataset.originalSrc) {
          icon.src = icon.dataset.originalSrc;
          delete icon.dataset.originalSrc;
        }
      }

      // Clear jam styling; enabled state follows whose turn it is
      btn.classList.remove("malfunctioning");
      btn.disabled =
        !this.game.gameState.isPlayerTurn ||
        this.game.gameState.isMalfunctioning;
    });

    // STEP 2: Apply malfunction to the selected move
    if (this.game.gameState.malfunctionedMove) {
      const btnId = `btn-${this.game.gameState.malfunctionedMove}`;
      const malfunctionBtn = document.getElementById(btnId);

      if (malfunctionBtn) {
        const icon = malfunctionBtn.querySelector(".move-icon");

        if (icon) {
          // Store original icon source BEFORE changing it
          if (!icon.dataset.originalSrc) {
            icon.dataset.originalSrc = icon.src;
          }

          // Apply malfunction icon and styling
          icon.src = "images/malfunction_effect.png";
          icon.style.filter = "hue-rotate(45deg) saturate(2)";
        }

        // Apply malfunction class and disable button
        malfunctionBtn.classList.add("malfunctioning");
        malfunctionBtn.disabled = true;
      }
    }
  }

  /**
   * Reset malfunction at start of player turn - FIXED: Ensure complete restoration
   */
  resetMalfunction() {
    // Clear malfunction state
    this.game.gameState.malfunctionedMove = null;

    // Restore all buttons to normal state
    document.querySelectorAll(".move-btn[data-move]").forEach((btn) => {
      const icon = btn.querySelector(".move-icon");

      if (icon) {
        // Restore original icon if it was stored
        if (icon.dataset.originalSrc) {
          icon.src = icon.dataset.originalSrc;
          delete icon.dataset.originalSrc;
        }

        // Clear all malfunction styling
        icon.style.filter = "none";
      }

      // Remove jam styling; enabled state follows whose turn it is
      btn.classList.remove("malfunctioning");
      btn.disabled =
        !this.game.gameState.isPlayerTurn ||
        this.game.gameState.isMalfunctioning;
    });
  }

  /**
   * Update move button damage display based on current player stats and enemy defense
   */
  updateMoveButtonDamage() {
    if (!this.game.gameState.player || !this.game.gameState.enemy) return;

    const lightBaseDamage =
      MOVE_DEFINITIONS.light.damage + this.game.gameState.player.attack;
    const heavyBaseDamage =
      MOVE_DEFINITIONS.heavy.damage + this.game.gameState.player.attack;

    // Apply boost if active
    const lightBoostedDamage = this.game.gameState.playerBoost
      ? Math.floor(lightBaseDamage * GAME_CONFIG.BOOST_MULTIPLIER)
      : lightBaseDamage;
    const heavyBoostedDamage = this.game.gameState.playerBoost
      ? Math.floor(heavyBaseDamage * GAME_CONFIG.BOOST_MULTIPLIER)
      : heavyBaseDamage;

    // Calculate final damage after enemy defense
    const lightFinalDamage = CONFIG_UTILS.calculateDamage(
      lightBoostedDamage,
      this.game.gameState.enemy.defense
    );
    const heavyFinalDamage = CONFIG_UTILS.calculateDamage(
      heavyBoostedDamage,
      this.game.gameState.enemy.defense
    );

    const lightDisplay = document.getElementById("light-damage-display");
    const heavyDisplay = document.getElementById("heavy-damage-display");

    if (lightDisplay) {
      let lightText = `Cost: ${MOVE_DEFINITIONS.light.baseCost} | DMG: ${lightFinalDamage}`;
      if (this.game.gameState.playerBoost) {
        lightText += ` (BOOSTED!)`;
      }
      lightDisplay.textContent = lightText;
    }

    if (heavyDisplay) {
      let heavyText = `Cost: ${MOVE_DEFINITIONS.heavy.baseCost} | DMG: ${heavyFinalDamage}`;
      if (this.game.gameState.playerBoost) {
        heavyText += ` (BOOSTED!)`;
      }
      heavyDisplay.textContent = heavyText;
    }

    // Keep the other buttons' cost text in sync with config
    const otherCosts = {
      defend: "Block next hit",
      heal: "Restore 30% HP",
      boost: `${this.boostPercentText()} dmg, 3 attacks`,
    };
    Object.entries(otherCosts).forEach(([moveType, effect]) => {
      const el = document.querySelector(`#btn-${moveType} .move-cost`);
      if (el) {
        el.textContent = `Cost: ${MOVE_DEFINITIONS[moveType].baseCost} | ${effect}`;
      }
    });

    // Pre-fill tooltips so they have content on hover, focus or touch
    ["light", "heavy", "defend", "heal", "boost"].forEach((moveType) =>
      this.updateTooltip(moveType)
    );
  }

  /**
   * Boost multiplier as player-facing text, e.g. 2.0 -> "+100%"
   */
  boostPercentText() {
    return `+${Math.round((GAME_CONFIG.BOOST_MULTIPLIER - 1) * 100)}%`;
  }

  /**
   * Update the battle UI
   */
  updateBattleUI() {
    try {
      const battleNumber = document.getElementById("battle-number");
      if (battleNumber) {
        battleNumber.textContent = this.game.gameState.currentBattle;
      }

      this.updateFighterUI("player", this.game.gameState.player);
      this.updateFighterUI("enemy", this.game.gameState.enemy);

      const buttons = document.querySelectorAll(".move-btn");
      buttons.forEach((btn) => {
        const moveType = btn.dataset.move;
        const isMalfunctioned =
          moveType === this.game.gameState.malfunctionedMove;

        btn.disabled =
          !this.game.gameState.isPlayerTurn ||
          this.game.gameState.isMalfunctioning ||
          isMalfunctioned;
      });

      // Update malfunction UI
      this.updateMalfunctionUI();

      // Warn on moves that would drop you to 0 sanity (meltdown)
      const sanity = this.game.gameState.player.sanity;
      document.querySelectorAll(".move-btn[data-move]").forEach((btn) => {
        const def = MOVE_DEFINITIONS[btn.dataset.move];
        btn.classList.toggle(
          "will-meltdown",
          Boolean(def) && sanity - def.baseCost <= 0
        );
      });

      // Pep Talk: only useful when sanity isn't (nearly) full
      const talkBtn = document.getElementById("btn-talk");
      if (talkBtn) {
        talkBtn.disabled =
          !this.game.gameState.isPlayerTurn ||
          this.game.gameState.isMalfunctioning ||
          sanity >= this.game.gameState.player.maxSanity - 1;
      }

      this.updateEnemyIntent();

      // Update damage display whenever UI updates
      this.updateMoveButtonDamage();
    } catch (error) {
      console.error("Failed to update battle UI:", error);
    }
  }

  /**
   * Update UI for a specific fighter (enhanced with battle stats)
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

    // Update battle stats display
    this.updateBattleStats(type, fighter);
  }

  /**
   * Update battle stats display for a fighter
   */
  updateBattleStats(type, fighter) {
    const statsContainer = document.querySelector(
      `#${
        type === "player" ? "battle-screen" : "battle-screen"
      } .fighter-card:${
        type === "player" ? "first-child" : "last-child"
      } .stats`
    );

    if (statsContainer) {
      // Check if battle stats already exist
      let battleStatsDiv = statsContainer.querySelector(".battle-stats");
      if (!battleStatsDiv) {
        battleStatsDiv = document.createElement("div");
        battleStatsDiv.className = "battle-stats";
        battleStatsDiv.style.marginTop = "10px";
        battleStatsDiv.style.fontSize = "14px";
        battleStatsDiv.style.color = "#ddd";
        statsContainer.appendChild(battleStatsDiv);
      }

      let statsText = `Attack: ${fighter.attack} | Defense: ${fighter.defense}`;

      // Show boost / shield status
      if (type === "player" && this.game.gameState.playerBoost) {
        statsText += ` | BOOSTED (${this.game.gameState.playerBoostTurns} attacks left)`;
      }
      if (type === "enemy" && this.game.gameState.enemyBoost) {
        statsText += ` | BOOSTED (${this.game.gameState.enemyBoostTurns} attacks left)`;
      }
      if (type === "enemy" && this.game.gameState.enemyDefending) {
        statsText += ` | 🛡️ SHIELDED`;
      }

      battleStatsDiv.innerHTML = `<div>${statsText}</div>`;
    }
  }

  /**
   * Show what the enemy will do next (its pattern is fixed, so telegraph it)
   */
  updateEnemyIntent() {
    const el = document.getElementById("enemy-intent");
    const state = this.game.gameState;
    if (!el || !state.enemy || !state.player) return;

    const pattern = state.enemy.pattern;
    const nextType = pattern[state.turnCount % pattern.length];
    const next = MOVE_DEFINITIONS[nextType];
    if (!next) {
      el.textContent = "";
      return;
    }

    let text;
    let danger = false;
    if (state.enemy.sanity - next.baseCost <= 0) {
      text = `🌀 Next: ${next.name}, but they're about to melt down!`;
    } else if (nextType === "light" || nextType === "heavy") {
      let dmg = next.damage + state.enemy.attack;
      if (state.enemyBoost) dmg = Math.floor(dmg * GAME_CONFIG.BOOST_MULTIPLIER);
      const final = CONFIG_UTILS.calculateDamage(dmg, state.player.defense);
      text = `⚔️ Next: ${next.name}${state.enemyBoost ? " (BOOSTED)" : ""} ~${final} dmg`;
      danger = final >= state.player.hp;
      if (danger) text += " ☠️ LETHAL";
    } else if (nextType === "defend") {
      text = `🛡️ Next: ${next.name} (blocks your next attack)`;
    } else if (nextType === "boost") {
      text = `⚡ Next: ${next.name} (their attacks get ${this.boostPercentText()})`;
    } else {
      text = `Next: ${next.name}`;
    }

    el.textContent = text;
    el.classList.toggle("danger", danger);
  }

  /**
   * Handle player move
   */
  playerMove(moveType) {
    if (
      !this.game.gameState.isPlayerTurn ||
      this.game.gameState.isMalfunctioning ||
      moveType === this.game.gameState.malfunctionedMove
    ) {
      if (moveType === this.game.gameState.malfunctionedMove) {
        this.game.addBattleLog("⚡ That attack is malfunctioning this turn!");
      }
      return;
    }

    if (!CONFIG_UTILS.isValidMoveType(moveType)) {
      console.error(`Invalid move type: ${moveType}`);
      return;
    }

    try {
      const move = MOVE_DEFINITIONS[moveType];
      this.game.gameState.isPlayerTurn = false;

      const sanityCost = move.baseCost;
      this.game.gameState.player.sanity = Math.max(
        0,
        this.game.gameState.player.sanity - sanityCost
      );
      this.game.addBattleLog(
        `${this.game.gameState.player.name} uses ${this.getPlayerMoveName(
          moveType
        )}, costing ${sanityCost} sanity!`
      );

      if (this.game.gameState.player.sanity <= 0) {
        this.game.gameState.player.sanity = 0;
        this.updateBattleUI();
        setTimeout(() => this.triggerMalfunction(), 500);
        return;
      }

      this.executePlayerMove(moveType);
    } catch (error) {
      console.error("Failed to execute player move:", error);
      this.game.gameState.isPlayerTurn = true;
    }
  }

  /**
   * Get player's move name based on selected fighter
   */
  getPlayerMoveName(moveType) {
    if (this.game.gameState.selectedFighterType) {
      const fighter =
        FIGHTER_TEMPLATES[this.game.gameState.selectedFighterType];
      if (fighter && fighter.moves && fighter.moves[moveType]) {
        return fighter.moves[moveType].name;
      }
    }
    return MOVE_DEFINITIONS[moveType].name;
  }

  /**
   * Execute player move effects
   */
  executePlayerMove(moveType) {
    const move = MOVE_DEFINITIONS[moveType];
    const playerSprite = document.getElementById("player-sprite");
    const enemySprite = document.getElementById("enemy-sprite");

    this.game.playSound(moveType);

    switch (moveType) {
      case "defend":
        this.game.addAnimationClass(playerSprite, "defend-animation");
        this.game.gameState.playerDefending = true;
        break;

      case "boost":
        this.game.gameState.playerBoost = true;
        this.game.gameState.playerBoostTurns = 3; // Set to 3 turns
        this.game.addAnimationClass(playerSprite, "boost-animation");
        this.game.addBattleLog(
          `Next 3 attacks deal ${this.boostPercentText()} damage!`
        );
        break;

      case "heal":
        // NEW: Heal implementation - restores 30% of max HP
        const healAmount = Math.floor(this.game.gameState.player.maxHp * 0.3);
        const oldHp = this.game.gameState.player.hp;
        this.game.gameState.player.hp = Math.min(
          this.game.gameState.player.hp + healAmount,
          this.game.gameState.player.maxHp
        );
        const actualHealed = this.game.gameState.player.hp - oldHp;

        this.game.addAnimationClass(playerSprite, "boost-animation"); // Reuse boost animation for healing glow
        this.game.addBattleLog(`Restored ${actualHealed} HP!`);
        this.game.showDamageNumber(playerSprite, actualHealed, true); // Show as heal number (green)
        break;

      case "light":
      case "heavy":
        this.game.addAnimationClass(playerSprite, "attack-animation");
        let damage = move.damage + this.game.gameState.player.attack;

        // Check if boost is active BEFORE applying damage
        const wasBoostActive = this.game.gameState.playerBoost;

        if (wasBoostActive) {
          damage = Math.floor(damage * GAME_CONFIG.BOOST_MULTIPLIER);
          this.game.addBattleLog(
            `${
              this.game.gameState.player.name
            } uses boosted ${this.getPlayerMoveName(moveType)}!`
          );

          // Decrease boost turns AFTER calculating damage
          this.game.gameState.playerBoostTurns--;
          if (this.game.gameState.playerBoostTurns <= 0) {
            this.game.gameState.playerBoost = false;
            this.game.addBattleLog("Power up expired!");
          } else {
            this.game.addBattleLog(
              `Power up turns remaining: ${this.game.gameState.playerBoostTurns}`
            );
          }
        }

        if (!this.game.gameState.enemyDefending) {
          const finalDamage = CONFIG_UTILS.calculateDamage(
            damage,
            this.game.gameState.enemy.defense
          );
          this.game.gameState.enemy.hp = Math.max(
            0,
            this.game.gameState.enemy.hp - finalDamage
          );
          this.game.addAnimationClass(enemySprite, "hit-animation");
          this.game.environment?.impact(moveType === "heavy");
          this.game.showDamageNumber(enemySprite, finalDamage);
          this.game.addBattleLog(
            `Dealt ${finalDamage} damage to ${this.game.gameState.enemy.name}!`
          );
          this.game.playSound("dealDamage");
        } else {
          this.game.addBattleLog(
            `${this.game.gameState.enemy.name}'s defense blocked the attack!`
          );
        }
        break;
    }

    setTimeout(() => this.finishPlayerTurn(), GAME_CONFIG.ANIMATION_DURATION);
  }

  /**
   * Finish player turn and check for battle end
   */
  finishPlayerTurn() {
    this.game.clearAnimations();
    // The enemy's shield only lasts through the player's next move
    this.game.gameState.enemyDefending = false;
    this.updateBattleUI();

    if (this.game.gameState.enemy.hp <= 0) {
      this.winBattle();
      return;
    }
    if (this.game.gameState.player.hp <= 0) {
      this.game.gameOverScreen.gameOver("Your fighter melted!");
      return;
    }

    setTimeout(() => this.executeEnemyMove(), GAME_CONFIG.ENEMY_MOVE_DELAY);
  }

  /**
   * Execute enemy move
   */
  executeEnemyMove() {
    try {
      const patternIndex =
        this.game.gameState.turnCount %
        this.game.gameState.enemy.pattern.length;
      const enemyMoveType = this.game.gameState.enemy.pattern[patternIndex];
      const enemyMove = MOVE_DEFINITIONS[enemyMoveType];

      if (!enemyMove) {
        console.error(`Invalid enemy move: ${enemyMoveType}`);
        this.finishEnemyTurn();
        return;
      }

      const playerSprite = document.getElementById("player-sprite");
      const enemySprite = document.getElementById("enemy-sprite");

      const sanityCost = enemyMove.baseCost;
      this.game.gameState.enemy.sanity = Math.max(
        0,
        this.game.gameState.enemy.sanity - sanityCost
      );
      // Enemy pushed itself to 0 sanity: same rule as the player, the move is lost
      if (this.game.gameState.enemy.sanity <= 0) {
        this.game.addBattleLog(
          `🌀 ${this.game.gameState.enemy.name} tried to use ${enemyMove.name} but had a meltdown! Their turn is wasted.`
        );
        this.game.gameState.enemy.sanity = Math.floor(
          this.game.gameState.enemy.maxSanity *
            GAME_CONFIG.MALFUNCTION_SANITY_RECOVERY
        );
        this.game.addAnimationClass(enemySprite, "hit-animation");
        setTimeout(
          () => this.finishEnemyTurn(),
          GAME_CONFIG.ANIMATION_DURATION
        );
        return;
      }

      this.game.addBattleLog(
        `${this.game.gameState.enemy.name} uses ${enemyMove.name}, costing ${sanityCost} sanity!`
      );

      switch (enemyMoveType) {
        case "defend":
          this.game.addAnimationClass(enemySprite, "defend-animation");
          this.game.addBattleLog(
            `${this.game.gameState.enemy.name} takes a defensive stance! Your next attack will be blocked.`
          );
          this.game.gameState.enemyDefending = true;
          break;

        case "boost":
          this.game.gameState.enemyBoost = true;
          this.game.gameState.enemyBoostTurns = 3; // Set to 3 turns
          this.game.addAnimationClass(enemySprite, "boost-animation");
          this.game.addBattleLog(
            `${this.game.gameState.enemy.name} is powering up!`
          );
          break;

        case "light":
        case "heavy":
          this.game.addAnimationClass(enemySprite, "attack-animation");
          let damage = enemyMove.damage + this.game.gameState.enemy.attack;

          // Check if enemy boost is active BEFORE applying damage
          const wasEnemyBoostActive = this.game.gameState.enemyBoost;

          if (wasEnemyBoostActive) {
            damage = Math.floor(damage * GAME_CONFIG.BOOST_MULTIPLIER);
            this.game.addBattleLog(
              `${this.game.gameState.enemy.name} uses boosted ${enemyMove.name}!`
            );

            // Decrease boost turns AFTER calculating damage
            this.game.gameState.enemyBoostTurns--;
            if (this.game.gameState.enemyBoostTurns <= 0) {
              this.game.gameState.enemyBoost = false;
              this.game.addBattleLog(
                `${this.game.gameState.enemy.name}'s power up expired!`
              );
            }
          }

          if (!this.game.gameState.playerDefending) {
            const finalDamage = CONFIG_UTILS.calculateDamage(
              damage,
              this.game.gameState.player.defense
            );
            this.game.gameState.player.hp = Math.max(
              0,
              this.game.gameState.player.hp - finalDamage
            );
            this.game.addAnimationClass(playerSprite, "hit-animation");
            this.game.environment?.impact(enemyMoveType === "heavy");
            this.game.showDamageNumber(playerSprite, finalDamage);
            this.game.addBattleLog(`You took ${finalDamage} damage!`);
            this.game.playSound("takeDamage");

            // REMOVED: Boost interruption - powerup should last full 3 turns regardless of taking damage
          } else {
            this.game.addBattleLog("Your defense blocked the attack!");
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
    this.game.clearAnimations();

    // Player's shield only lasts through the enemy's move.
    // enemyDefending is cleared in finishPlayerTurn so it can block the player's next attack.
    this.game.gameState.playerDefending = false;

    if (this.game.gameState.player.hp <= 0) {
      this.game.gameOverScreen.gameOver("Your fighter melted!");
      return;
    }
    if (this.game.gameState.enemy.hp <= 0) {
      this.winBattle();
      return;
    }

    this.game.gameState.turnCount++;
    this.game.gameState.isPlayerTurn = true;

    this.game.gameState.player.sanity = Math.min(
      this.game.gameState.player.sanity + GAME_CONFIG.SANITY_RECOVERY_PER_TURN,
      this.game.gameState.player.maxSanity
    );
    this.game.gameState.enemy.sanity = Math.min(
      this.game.gameState.enemy.sanity + GAME_CONFIG.SANITY_RECOVERY_PER_TURN,
      this.game.gameState.enemy.maxSanity
    );

    // Reset malfunction and apply new one for next turn
    this.resetMalfunction();
    this.applyTurnMalfunction();

    this.updateBattleUI();
  }

  /**
   * Win current battle
   */
  winBattle() {
    this.game.addBattleLog(`${this.game.gameState.enemy.name} defeated!`);
    this.game.playSound("battleWin");

    // Unlock enemy defeat achievement
    this.game.onEnemyDefeated(this.game.gameState.currentBattle);

    if (this.game.gameState.currentBattle >= GAME_CONFIG.TOTAL_BATTLES) {
      // Game completed - unlock character victory achievement
      this.game.onGameVictory();

      setTimeout(() => {
        this.game.playMusic("victory");
        this.game.playSound("victorySound");
        this.game.showVictoryPopup();
      }, 1500);
    } else {
      setTimeout(() => {
        this.game.playMusic("training");
        this.game.showScreen("training-screen");
        this.game.training.startTraining();
      }, 1500);
    }
  }

  /**
   * Update tooltip for move button (enhanced with damage calculation)
   */
  updateTooltip(moveType) {
    if (!CONFIG_UTILS.isValidMoveType(moveType)) return;

    const move = MOVE_DEFINITIONS[moveType];
    const tooltip = document.getElementById(`tooltip-${moveType}`);

    if (!tooltip) return;

    const moveName = this.getPlayerMoveName(moveType);
    let html = `<div><strong>${moveName}</strong></div>`;
    html += `<div>${move.description}</div>`;

    // Show damage calculation for attack moves
    if (
      (moveType === "light" || moveType === "heavy") &&
      this.game.gameState.player &&
      this.game.gameState.enemy
    ) {
      const baseDamage = move.damage;
      const playerAttack = this.game.gameState.player.attack;
      const enemyDefense = this.game.gameState.enemy.defense;
      const totalDamage = baseDamage + playerAttack;

      // Apply boost if active
      const boostedDamage = this.game.gameState.playerBoost
        ? Math.floor(totalDamage * GAME_CONFIG.BOOST_MULTIPLIER)
        : totalDamage;

      const finalDamage = CONFIG_UTILS.calculateDamage(
        boostedDamage,
        enemyDefense
      );

      html += `<div style="margin-top: 8px;"><strong>Damage Calculation:</strong></div>`;
      if (this.game.gameState.playerBoost) {
        html += `<div>(${baseDamage} (base) + ${playerAttack} (attack)) × ${GAME_CONFIG.BOOST_MULTIPLIER} (boost) - ${enemyDefense} (enemy def) = ${finalDamage}</div>`;
        html += `<div style="color: #f5576c; font-weight: bold;">BOOSTED: ${finalDamage} damage! (${this.game.gameState.playerBoostTurns} boosted attacks left)</div>`;
      } else {
        html += `<div>${baseDamage} (base) + ${playerAttack} (attack) - ${enemyDefense} (enemy def) = ${finalDamage}</div>`;
      }
    }

    // Show heal calculation for heal moves
    if (moveType === "heal" && this.game.gameState.player) {
      const healAmount = Math.floor(this.game.gameState.player.maxHp * 0.3);
      const currentHp = this.game.gameState.player.hp;
      const maxHp = this.game.gameState.player.maxHp;
      const actualHeal = Math.min(healAmount, maxHp - currentHp);

      html += `<div style="margin-top: 8px;"><strong>Healing Calculation:</strong></div>`;
      html += `<div>30% of ${maxHp} Max HP = ${healAmount} HP restored</div>`;
      if (actualHeal < healAmount) {
        html += `<div style="color: #48dbfb; font-weight: bold;">Will heal ${actualHeal} HP (limited by current HP)</div>`;
      } else {
        html += `<div style="color: #48dbfb; font-weight: bold;">Will heal ${actualHeal} HP</div>`;
      }
    }

    html += `<div class="tooltip-row" style="margin-top: 8px;">Sanity cost: <span class="sanity-preview">-${move.baseCost}</span></div>`;
    if (
      this.game.gameState.player &&
      this.game.gameState.player.sanity - move.baseCost <= 0
    ) {
      html += `<div style="color: #ff6b6b; font-weight: bold;">⚠ This will drop you to 0 sanity and cause a meltdown!</div>`;
    }

    tooltip.innerHTML = html;
  }

  /**
   * Start talk mechanic
   */
  startTalk() {
    if (
      !this.game.gameState.isPlayerTurn ||
      this.game.gameState.player.sanity >=
        this.game.gameState.player.maxSanity - 1
    ) {
      return;
    }

    try {
      this.game.gameState.isPlayerTurn = false;
      this.updateBattleUI();
      this.game.playSound("talkStart");

      const fighterType = this.game.gameState.selectedFighterType || "vanilla";
      const statements =
        FIGHTER_STATEMENTS[fighterType] || FIGHTER_STATEMENTS.vanilla;
      const statement = CONFIG_UTILS.getRandomElement(statements);

      const fighterStatementEl = document.getElementById("fighter-statement");
      if (fighterStatementEl) {
        fighterStatementEl.textContent = `"${statement}"`;
      }

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
      this.game.gameState.isPlayerTurn = true;
    }
  }

  /**
   * Handle talk response
   */
  handleTalkResponse(success, sanityGain) {
    const talkDialog = document.getElementById("talk-dialog");
    if (talkDialog) {
      talkDialog.classList.remove("active");
    }

    if (success) {
      const actualGain = Math.min(
        sanityGain,
        this.game.gameState.player.maxSanity - this.game.gameState.player.sanity
      );
      this.game.gameState.player.sanity += actualGain;
      this.game.addBattleLog(
        `Your encouraging words restored ${actualGain} sanity!`
      );
      this.game.playSound("talkSuccess");

      const playerSprite = document.getElementById("player-sprite");
      this.game.showDamageNumber(playerSprite, actualGain, true);
    } else {
      this.game.playSound("talkFail");
      if (sanityGain > 0) {
        this.game.gameState.player.sanity = Math.min(
          this.game.gameState.player.sanity + 1,
          this.game.gameState.player.maxSanity
        );
        this.game.addBattleLog("Your words helped a little... (+1 sanity)");
      } else {
        this.game.addBattleLog("Your words didn't help at all!");
      }
    }

    // Talking used up the player's turn, so the enemy's shield expires
    this.game.gameState.enemyDefending = false;
    this.updateBattleUI();

    setTimeout(() => {
      if (this.game.gameState.player.hp <= 0) {
        this.game.gameOverScreen.gameOver("Your fighter melted!");
        return;
      }
      this.executeEnemyMove();
    }, 1000);
  }

  /**
   * Trigger malfunction state
   */
  triggerMalfunction() {
    this.game.gameState.isMalfunctioning = true;
    // The player's turn is spent, so the enemy's shield from last turn expires
    this.game.gameState.enemyDefending = false;
    this.game.addBattleLog(
      `${this.game.gameState.player.name} is having a meltdown!`
    );
    this.game.playSound("malfunction");

    setTimeout(() => {
      this.game.showScreen("talkdown-screen");
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
   */
  handleDialogue(success) {
    if (success) {
      this.game.gameState.player.sanity = Math.floor(
        this.game.gameState.player.maxSanity * 0.5
      );
      this.game.gameState.isMalfunctioning = false;
      this.game.addBattleLog(
        `${this.game.gameState.player.name} calmed down! Sanity restored to ${this.game.gameState.player.sanity}.`
      );
      this.game.playSound("malfunctionRecover");
      this.game.showScreen("battle-screen");
      this.updateBattleUI();

      setTimeout(() => {
        if (this.game.gameState.player.hp <= 0) {
          this.game.gameOverScreen.gameOver("Your fighter melted!");
          return;
        }
        this.executeEnemyMove();
      }, 1000);
    } else {
      // Wrong words make the meltdown worse: lose some HP, then try again
      const player = this.game.gameState.player;
      const penalty = Math.max(
        1,
        Math.floor(player.maxHp * GAME_CONFIG.TALKDOWN_FAIL_HP_PENALTY)
      );
      player.hp = Math.max(0, player.hp - penalty);
      this.game.playSound("talkFail");
      this.game.addBattleLog(
        `Your words made it worse! ${player.name} melted a little (-${penalty} HP).`
      );

      if (player.hp <= 0) {
        this.game.gameState.isMalfunctioning = false;
        this.game.gameOverScreen.gameOver(
          "Your fighter melted down completely!"
        );
        return;
      }

      this.startTalkDown();
      const malfunctionText = document.getElementById("malfunction-text");
      if (malfunctionText) {
        malfunctionText.textContent = `That made it worse! (-${penalty} HP, ${player.hp}/${player.maxHp} left) ${malfunctionText.textContent}`;
      }
    }
  }
}
