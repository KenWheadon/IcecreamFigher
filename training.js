// Enhanced Training Module with Multiple Bubbles
class Training {
  constructor(game) {
    this.game = game;
    this.activeBubbles = [];
    this.bubbleIdCounter = 0;
    this.sessionTrainingTypes = new Set(); // Track what was trained this session
  }

  /**
   * Set up training event listeners
   */
  setupEventListeners() {
    // Training rewards
    document.querySelectorAll("[data-training]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const rewardType = e.currentTarget.dataset.training;
        this.game.playSound("buttonClick");
        this.applyTraining(rewardType);
      });

      btn.addEventListener("mouseenter", () => {
        this.game.playSound("buttonHover");
      });
    });

    // Slot machine
    const spinBtn = document.getElementById("spin-btn");
    if (spinBtn) {
      spinBtn.addEventListener("click", () => {
        this.game.playSound("buttonClick");
        this.spinSlots();
      });
    }

    // Continue buttons
    const continueTraining = document.getElementById("continue-training");
    if (continueTraining) {
      continueTraining.addEventListener("click", () => {
        this.game.playSound("buttonClick");
        this.game.startNextBattle();
      });
    }

    // Enhanced training target for bubble clicking
    const trainingTarget = document.getElementById("training-target");
    if (trainingTarget) {
      // Click on bubbles
      trainingTarget.addEventListener("click", (e) => {
        const bubbleElement = e.target.closest(".moving-bubble");
        if (bubbleElement) {
          const bubbleId = parseInt(bubbleElement.dataset.bubbleId);
          const bubble = this.activeBubbles.find((b) => b.id === bubbleId);
          if (bubble) {
            this.collectBubble(bubbleElement, bubble);
          }
        } else {
          // Clicked on background - reset combo
          this.resetCombo();
        }
      });

      // Prevent context menu on right click
      trainingTarget.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
    }
  }

  /**
   * Start training phase with enhanced bubble system
   */
  startTraining() {
    try {
      this.game.gameState.trainingScore = 0;
      this.game.gameState.trainingCombo = 0;
      this.game.gameState.trainingActive = true;
      this.game.gameState.slotSpins = 0;
      this.game.gameState.trainingPurchases = 0;
      this.sessionTrainingTypes.clear();
      this.activeBubbles = [];
      this.bubbleIdCounter = 0;

      // Reset UI
      this.game.updateElement("training-score", "0");
      this.game.updateElement("combo-counter", "0");
      this.game.updateElement(
        "training-timer",
        GAME_CONFIG.TRAINING_TIME.toString()
      );
      this.game.updateElement("slot-cost", "1");
      this.game.updateElement("spin-cost", "1");

      // Show training game elements
      const trainingCombo = document.getElementById("training-combo");
      const trainingScoreTime = document.getElementById("training-score-time");
      if (trainingCombo) trainingCombo.classList.add("active");
      if (trainingScoreTime) trainingScoreTime.classList.add("active");

      // Hide training choices and slot machine initially
      const trainingChoices = document.getElementById("training-choices");
      if (trainingChoices) {
        trainingChoices.classList.remove("active");
      }

      const slotMachine = document.getElementById("slot-machine");
      if (slotMachine) {
        slotMachine.style.display = "none";
      }

      // Hide paytable initially
      const slotPaytable = document.getElementById("slot-paytable");
      if (slotPaytable) {
        slotPaytable.classList.remove("active");
      }

      const bonusReward = document.getElementById("bonus-reward");
      if (bonusReward) {
        bonusReward.classList.remove("available");
      }

      const target = document.getElementById("training-target");
      if (target) {
        target.innerHTML = "";
        target.style.display = "block";
        target.classList.remove("combo-lost");
      }

      // Hide continue button initially
      const continueBtn = document.getElementById("continue-training");
      if (continueBtn) {
        continueBtn.style.display = "none";
      }

      // Show mini-game instructions
      this.showTrainingPhaseUI("mini-game");

      this.game.playSound("trainingStart");
      this.startBubbleSpawning();
      this.startTrainingTimer();
    } catch (error) {
      console.error("Failed to start training:", error);
    }
  }

  /**
   * Show appropriate UI for training phase
   */
  showTrainingPhaseUI(phase) {
    const instructions = document.getElementById("training-instructions");
    if (!instructions) return;

    switch (phase) {
      case "mini-game":
        instructions.textContent =
          "Click the floating bubbles for points! Different sizes = different points! Don't click the background!";
        break;
      case "rewards":
        instructions.textContent =
          "Choose your training rewards and try the risky slots!";
        break;
    }
  }

  /**
   * Start training timer
   */
  startTrainingTimer() {
    let timeLeft = GAME_CONFIG.TRAINING_TIME;

    this.game.timers.training = setInterval(() => {
      timeLeft--;
      this.game.updateElement("training-timer", timeLeft.toString());

      if (timeLeft <= 0) {
        this.endTraining();
      }
    }, 1000);
  }

  /**
   * Start bubble spawning system
   */
  startBubbleSpawning() {
    if (!this.game.gameState.trainingActive) return;

    this.spawnBubble();

    // Schedule next spawn
    const spawnDelay = Math.max(
      GAME_CONFIG.TRAINING_SPAWN_MIN_DELAY,
      GAME_CONFIG.TRAINING_SPAWN_BASE_DELAY -
        this.game.gameState.trainingScore * 2
    );

    setTimeout(() => this.startBubbleSpawning(), spawnDelay);
  }

  /**
   * Spawn a single bubble
   */
  spawnBubble() {
    if (!this.game.gameState.trainingActive) return;
    if (this.activeBubbles.length >= GAME_CONFIG.MAX_SIMULTANEOUS_BUBBLES)
      return;

    try {
      const target = document.getElementById("training-target");
      if (!target) return;

      const bubbleType = CONFIG_UTILS.getWeightedBubbleType();
      const bubble = document.createElement("div");

      const bubbleId = this.bubbleIdCounter++;
      bubble.className = `moving-bubble size-${bubbleType.size} type-${bubbleType.type}`;
      bubble.dataset.bubbleId = bubbleId;
      bubble.dataset.points = bubbleType.basePoints.toString();
      bubble.dataset.type = bubbleType.type;

      // Set bubble content
      bubble.textContent = bubbleType.emoji;

      // Set bubble style based on type
      bubble.style.background = `radial-gradient(circle, ${
        bubbleType.color
      }, ${bubbleType.color.replace("0.8", "0.4")})`;
      bubble.style.borderColor = bubbleType.color;
      bubble.style.boxShadow = `0 0 15px ${bubbleType.color.replace(
        "0.8",
        "0.5"
      )}`;

      // Position bubble randomly
      const maxX = target.offsetWidth - 80;
      const maxY = target.offsetHeight - 80;
      const x = Math.random() * maxX;
      const y = Math.random() * maxY;

      bubble.style.left = x + "px";
      bubble.style.top = y + "px";

      // Add to active bubbles tracking
      const bubbleData = {
        id: bubbleId,
        element: bubble,
        type: bubbleType.type,
        points: bubbleType.basePoints,
        spawnTime: Date.now(),
      };
      this.activeBubbles.push(bubbleData);

      target.appendChild(bubble);

      // Remove bubble after lifetime expires
      setTimeout(() => {
        this.removeBubble(bubbleId);
      }, GAME_CONFIG.TRAINING_BUBBLE_LIFETIME);
    } catch (error) {
      console.error("Failed to spawn bubble:", error);
    }
  }

  /**
   * Remove a bubble from the game
   */
  removeBubble(bubbleId) {
    const bubbleIndex = this.activeBubbles.findIndex((b) => b.id === bubbleId);
    if (bubbleIndex !== -1) {
      const bubble = this.activeBubbles[bubbleIndex];
      if (bubble.element && bubble.element.parentNode) {
        bubble.element.remove();
      }
      this.activeBubbles.splice(bubbleIndex, 1);
    }
  }

  /**
   * Collect a bubble when clicked
   */
  collectBubble(bubbleElement, bubbleData) {
    try {
      // Increase combo
      this.game.gameState.trainingCombo++;
      const comboMultiplier = Math.min(
        this.game.gameState.trainingCombo,
        GAME_CONFIG.MAX_COMBO_MULTIPLIER
      );
      const totalPoints = bubbleData.points * comboMultiplier;
      this.game.gameState.trainingScore += totalPoints;

      // Play sound effects
      this.game.playSound("bubbleClick");
      if (this.game.gameState.trainingCombo > 1) {
        this.game.playSound("comboIncrease");
      }

      // Add bubble pop animation
      bubbleElement.classList.add("bubble-pop");

      // Show score popup
      const target = document.getElementById("training-target");
      if (target) {
        const scoreFloat = document.createElement("div");
        scoreFloat.className = "bubble-score";
        scoreFloat.textContent = "+" + totalPoints;
        scoreFloat.style.left = bubbleElement.style.left;
        scoreFloat.style.top = bubbleElement.style.top;
        target.appendChild(scoreFloat);

        setTimeout(() => {
          if (scoreFloat.parentNode) {
            scoreFloat.remove();
          }
        }, 1000);
      }

      // Update UI
      this.game.updateElement(
        "training-score",
        this.game.gameState.trainingScore.toString()
      );
      this.game.updateElement(
        "combo-counter",
        this.game.gameState.trainingCombo.toString()
      );

      // Add combo flash animation
      const comboElement = document.getElementById("combo-counter");
      if (comboElement && this.game.gameState.trainingCombo > 1) {
        comboElement.parentElement.classList.add("combo-flash");
        setTimeout(() => {
          comboElement.parentElement.classList.remove("combo-flash");
        }, 500);
      }

      // Remove bubble from active list and DOM
      this.removeBubble(bubbleData.id);
    } catch (error) {
      console.error("Failed to collect bubble:", error);
    }
  }

  /**
   * Reset combo when background is clicked
   */
  resetCombo() {
    if (this.game.gameState.trainingCombo > 0) {
      this.game.gameState.trainingCombo = 0;
      this.game.updateElement("combo-counter", "0");

      // Show visual feedback
      const target = document.getElementById("training-target");
      if (target) {
        target.classList.add("combo-lost");
        setTimeout(() => {
          target.classList.remove("combo-lost");
        }, 500);
      }
    }
  }

  /**
   * End training mini-game and show rewards
   */
  endTraining() {
    this.game.gameState.trainingActive = false;

    if (this.game.timers.training) {
      clearInterval(this.game.timers.training);
      this.game.timers.training = null;
    }

    // Clear all active bubbles
    this.activeBubbles.forEach((bubble) => {
      if (bubble.element && bubble.element.parentNode) {
        bubble.element.remove();
      }
    });
    this.activeBubbles = [];

    // Hide the mini-game elements
    const target = document.getElementById("training-target");
    if (target) {
      target.innerHTML = "";
      target.style.display = "none";
    }

    // Hide training game UI elements
    const trainingCombo = document.getElementById("training-combo");
    const trainingScoreTime = document.getElementById("training-score-time");
    if (trainingCombo) trainingCombo.classList.remove("active");
    if (trainingScoreTime) trainingScoreTime.classList.remove("active");

    // Show training rewards and slot machine
    const trainingChoices = document.getElementById("training-choices");
    if (trainingChoices) {
      trainingChoices.classList.add("active");
    }

    const slotMachine = document.getElementById("slot-machine");
    if (slotMachine) {
      slotMachine.style.display = "block";
    }

    // Show paytable when slot machine is shown
    const slotPaytable = document.getElementById("slot-paytable");
    if (slotPaytable) {
      slotPaytable.classList.add("active");
    }

    // Show final score and update UI
    this.game.updateElement(
      "final-score",
      this.game.gameState.trainingScore.toString()
    );
    this.updateTrainingButtonCosts();
    this.updateSlotButtonState();
    this.showTrainingPhaseUI("rewards");
    this.game.playSound("trainingComplete");

    // Show continue button
    const continueBtn = document.getElementById("continue-training");
    if (continueBtn) {
      continueBtn.style.display = "block";
    }

    // Check for bonus reward
    if (
      this.game.gameState.trainingScore >= GAME_CONFIG.TRAINING_BONUS_THRESHOLD
    ) {
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
      const canAfford = this.game.gameState.trainingScore >= cost;

      const reward = TRAINING_REWARDS[rewardType];
      if (reward) {
        if (rewardType === "health") {
          const bonusReward = document.getElementById("bonus-reward");
          if (bonusReward) {
            if (
              this.game.gameState.trainingScore >=
              GAME_CONFIG.TRAINING_BONUS_THRESHOLD
            ) {
              bonusReward.classList.add("available");
            }
            bonusReward.innerHTML = `
              <div style="font-size: 32px;">${reward.icon}</div>
              <div class="btn-text">${reward.name} (${cost} pts)</div>
            `;
            bonusReward.disabled = !canAfford;
          }
        } else {
          btn.innerHTML = `
            <div style="font-size: 32px;">${reward.icon}</div>
            <div class="btn-text">${reward.name} (${cost} pts)</div>
          `;
          btn.disabled = !canAfford;
        }
      }
    });
  }

  /**
   * Get cost for training reward (progressive pricing)
   */
  getTrainingCost(rewardType) {
    const baseCost = 25; // Increased base cost
    return baseCost + this.game.gameState.trainingPurchases * 15;
  }

  /**
   * Apply training reward
   */
  applyTraining(rewardType) {
    const reward = TRAINING_REWARDS[rewardType];
    if (!reward) {
      console.error(`Invalid training reward: ${rewardType}`);
      return;
    }

    const cost = this.getTrainingCost(rewardType);

    if (this.game.gameState.trainingScore < cost) {
      this.game.updateElement(
        "final-score",
        `${this.game.gameState.trainingScore} (Need ${cost} points!)`
      );
      return;
    }

    try {
      this.game.gameState.trainingScore -= cost;
      this.game.gameState.trainingPurchases++;
      this.sessionTrainingTypes.add(rewardType);

      // Store pre-upgrade stats for achievement checking
      const preUpgradeStats = {
        attack: this.game.gameState.player.attack,
        defense: this.game.gameState.player.defense,
        sanity: this.game.gameState.player.maxSanity,
        hp: this.game.gameState.player.maxHp,
      };

      reward.apply(this.game.gameState.player);
      this.game.addBattleLog(
        `Training complete! ${reward.name}! (Cost: ${cost} points)`
      );
      this.game.playSound("upgradeApply");

      // Check for achievement unlocks
      this.checkTrainingAchievements(rewardType, preUpgradeStats);

      this.game.updateElement(
        "final-score",
        this.game.gameState.trainingScore.toString()
      );
      this.updateTrainingButtonCosts();
      this.updateSlotButtonState();

      const continueBtn = document.getElementById("continue-training");
      if (continueBtn) {
        continueBtn.style.display = "block";
      }
    } catch (error) {
      console.error("Failed to apply training reward:", error);
    }
  }

  /**
   * Check for training-related achievements
   */
  checkTrainingAchievements(rewardType, preUpgradeStats) {
    const player = this.game.gameState.player;

    // Check stat milestone achievements
    if (
      rewardType === "attack" &&
      player.attack > 100 &&
      preUpgradeStats.attack <= 100
    ) {
      this.game.unlockAchievement("attack_100");
    }
    if (
      rewardType === "defense" &&
      player.defense > 100 &&
      preUpgradeStats.defense <= 100
    ) {
      this.game.unlockAchievement("defense_100");
    }
    if (
      rewardType === "sanity" &&
      player.maxSanity > 100 &&
      preUpgradeStats.sanity <= 100
    ) {
      this.game.unlockAchievement("sanity_100");
    }
    if (
      rewardType === "health" &&
      player.maxHp > 300 &&
      preUpgradeStats.hp <= 300
    ) {
      this.game.unlockAchievement("hp_300");
    }
  }

  /**
   * Check for focused training achievements (called when starting next battle)
   */
  checkFocusedTrainingAchievements() {
    if (this.sessionTrainingTypes.size === 1) {
      const trainedType = Array.from(this.sessionTrainingTypes)[0];
      switch (trainedType) {
        case "attack":
          this.game.unlockAchievement("attack_only");
          break;
        case "defense":
          this.game.unlockAchievement("defense_only");
          break;
        case "sanity":
          this.game.unlockAchievement("sanity_only");
          break;
        case "health":
          this.game.unlockAchievement("health_only");
          break;
      }
    }
  }

  /**
   * Update slot button state
   */
  updateSlotButtonState() {
    const nextCost = 1 + this.game.gameState.slotSpins;
    const spinBtn = document.getElementById("spin-btn");
    if (spinBtn) {
      spinBtn.disabled = this.game.gameState.trainingScore < nextCost;
    }
  }

  /**
   * Clear slot reel feedback classes
   */
  clearSlotFeedback() {
    const reels = ["reel1", "reel2", "reel3"];
    reels.forEach((reelId) => {
      const reel = document.getElementById(reelId);
      if (reel) {
        reel.classList.remove("winner", "loser");
      }
    });
  }

  /**
   * Add visual feedback to slot reels
   */
  addSlotFeedback(results, isWin) {
    const reels = ["reel1", "reel2", "reel3"];

    if (isWin) {
      reels.forEach((reelId) => {
        const reel = document.getElementById(reelId);
        if (reel) {
          reel.classList.add("winner");
        }
      });
    }

    setTimeout(() => {
      this.clearSlotFeedback();
    }, 2000);
  }

  /**
   * Highlight paytable row for winning combination
   */
  highlightPaytableWin(symbolName) {
    const paytableRows = document.querySelectorAll(".paytable-row");
    paytableRows.forEach((row) => {
      row.classList.remove("paytable-winner");
    });

    paytableRows.forEach((row) => {
      const symbols = row.querySelector(".paytable-symbols");
      if (
        symbols &&
        symbols.textContent.includes(
          SLOT_CONFIG.symbols.find((s) => s.name === symbolName)?.emoji
        )
      ) {
        row.classList.add("paytable-winner");
      }
    });

    setTimeout(() => {
      paytableRows.forEach((row) => {
        row.classList.remove("paytable-winner");
      });
    }, 3000);
  }

  /**
   * Spin slot machine with enhanced rewards and feedback
   */
  spinSlots() {
    const cost = 1 + this.game.gameState.slotSpins;

    if (this.game.gameState.trainingScore < cost) {
      this.game.updateElement(
        "slot-result",
        `<span style="color: #ff6b6b;">Not enough points! Need ${cost}</span>`
      );
      return;
    }

    try {
      this.game.gameState.trainingScore -= cost;
      this.game.gameState.slotSpins++;

      this.game.updateElement(
        "final-score",
        this.game.gameState.trainingScore.toString()
      );
      this.game.updateElement(
        "slot-cost",
        (1 + this.game.gameState.slotSpins).toString()
      );
      this.game.updateElement(
        "spin-cost",
        (1 + this.game.gameState.slotSpins).toString()
      );

      this.game.playSound("spin", 0.5);
      this.clearSlotFeedback();

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
        if (!reel) return;

        reel.classList.add("spinning");

        let spins = 0;
        const spinInterval = setInterval(() => {
          const randomSymbol = CONFIG_UTILS.getRandomElement(
            SLOT_CONFIG.symbols
          );
          const reelContent = reel.querySelector("div");
          if (reelContent && randomSymbol) {
            reelContent.textContent = randomSymbol.emoji;
          }
          spins++;

          if (spins > GAME_CONFIG.SLOT_SPIN_COUNT_BASE + index * 5) {
            clearInterval(spinInterval);
            reel.classList.remove("spinning");
            if (reelContent && results[index]) {
              reelContent.textContent = results[index].emoji;
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
   */
  checkSlotResults(results) {
    const resultElement = document.getElementById("slot-result");
    if (!resultElement) return;

    try {
      const isWin =
        results[0].name === results[1].name &&
        results[1].name === results[2].name;

      // Track consecutive losses for achievement
      if (!isWin) {
        this.game.gameState.slotConsecutiveLosses =
          (this.game.gameState.slotConsecutiveLosses || 0) + 1;
        if (this.game.gameState.slotConsecutiveLosses >= 3) {
          this.game.unlockAchievement("slot_unlucky");
        }
      } else {
        this.game.gameState.slotConsecutiveLosses = 0;
      }

      let slotMessage = document.getElementById("slot-win-message");
      if (!slotMessage) {
        slotMessage = document.createElement("div");
        slotMessage.id = "slot-win-message";
        slotMessage.style.cssText = `
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 10px 0;
          min-height: 25px;
          animation: fadeIn 0.5s ease-in;
        `;

        const slotReels = document.querySelector(".slot-reels");
        if (slotReels) {
          slotReels.parentNode.insertBefore(slotMessage, slotReels.nextSibling);
        }
      }

      if (isWin) {
        const symbolName = results[0].name;
        const reward = SLOT_CONFIG.rewards.triple[symbolName];

        if (reward) {
          // Unlock slot achievement
          this.game.unlockAchievement(`slot_${symbolName}`);

          // Track for focused training achievements
          if (reward.attack) this.sessionTrainingTypes.add("attack");
          if (reward.defense) this.sessionTrainingTypes.add("defense");
          if (reward.sanity) this.sessionTrainingTypes.add("sanity");
          if (reward.hp) this.sessionTrainingTypes.add("health");

          slotMessage.innerHTML = `<span style="color: ${reward.color}; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🎉 YOU WON! 🎉</span>`;

          // Apply the reward
          if (reward.attack) this.game.gameState.player.attack += reward.attack;
          if (reward.defense)
            this.game.gameState.player.defense += reward.defense;
          if (reward.hp) {
            this.game.gameState.player.maxHp += reward.hp;
            this.game.gameState.player.hp = Math.min(
              this.game.gameState.player.hp + reward.hp,
              this.game.gameState.player.maxHp
            );
          }
          if (reward.sanity) {
            this.game.gameState.player.maxSanity += reward.sanity;
            this.game.gameState.player.sanity = Math.min(
              this.game.gameState.player.sanity + reward.sanity,
              this.game.gameState.player.maxSanity
            );
          }
          if (reward.points) {
            this.game.gameState.trainingScore += reward.points;
            this.game.updateElement(
              "final-score",
              this.game.gameState.trainingScore.toString()
            );
          }

          resultElement.innerHTML = `<span style="color: ${reward.color};">🎉 ${reward.name}</span>`;
          this.game.playSound(symbolName === "ice" ? "jackpot" : "win");
          this.highlightPaytableWin(symbolName);
        }
      } else {
        slotMessage.innerHTML = `<span style="color: #95a5a6;">YOU LOSE</span>`;
        resultElement.innerHTML = `<span style="color: #95a5a6;">No match - try again!</span>`;
      }

      setTimeout(() => {
        if (slotMessage) {
          slotMessage.innerHTML = "";
        }
      }, 3000);

      this.addSlotFeedback(results, isWin);
      this.updateSlotButtonState();
      this.updateTrainingButtonCosts();
    } catch (error) {
      console.error("Failed to check slot results:", error);
    }
  }
}
