// Training Module with Enhanced Flow
class Training {
  constructor(game) {
    this.game = game;
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

    // Training target for cone clicking
    const trainingTarget = document.getElementById("training-target");
    if (trainingTarget) {
      trainingTarget.addEventListener("click", (e) => {
        const coneElement = e.target.closest(".moving-cone");
        if (coneElement) {
          const points = parseInt(coneElement.dataset.points) || 1;
          this.game.playSound("coneClick");
          this.collectCone(coneElement, points);
        }
      });
    }
  }

  /**
   * Start training phase with new flow
   */
  startTraining() {
    try {
      this.game.gameState.trainingScore = 0;
      this.game.gameState.trainingCombo = 0;
      this.game.gameState.trainingActive = true;
      this.game.gameState.slotSpins = 0;
      this.game.gameState.trainingPurchases = 0;

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
        target.style.display = "block"; // Show the click game
      }

      // Hide continue button initially
      const continueBtn = document.getElementById("continue-training");
      if (continueBtn) {
        continueBtn.style.display = "none";
      }

      // Show mini-game instructions
      this.showTrainingPhaseUI("mini-game");

      this.game.playSound("trainingStart");
      this.spawnTrainingCones();
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
          "Click the ice cream cones for points! Higher = more points!";
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
   * Spawn training cones
   */
  spawnTrainingCones() {
    if (!this.game.gameState.trainingActive) return;

    try {
      const target = document.getElementById("training-target");
      if (!target) return;

      const cone = document.createElement("div");
      cone.className = "moving-cone";

      const coneData = CONFIG_UTILS.getRandomTrainingCone();
      if (coneData.image) {
        const img = document.createElement("img");
        img.src = coneData.image;
        img.alt = "Training Cone";
        img.className = "cone-image";
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
          if (this.game.gameState.trainingCombo > 0) {
            this.game.gameState.trainingCombo = 0;
            this.game.updateElement("combo-counter", "0");
          }
        }
      }, GAME_CONFIG.TRAINING_CONE_LIFETIME);

      // Schedule next cone
      const spawnDelay = Math.max(
        GAME_CONFIG.TRAINING_SPAWN_MIN_DELAY,
        GAME_CONFIG.TRAINING_SPAWN_BASE_DELAY -
          this.game.gameState.trainingScore * 10
      );
      setTimeout(() => this.spawnTrainingCones(), spawnDelay);
    } catch (error) {
      console.error("Failed to spawn training cone:", error);
    }
  }

  /**
   * Collect a training cone
   */
  collectCone(cone, points) {
    try {
      this.game.gameState.trainingCombo++;
      const comboMultiplier = Math.min(
        this.game.gameState.trainingCombo,
        GAME_CONFIG.MAX_COMBO_MULTIPLIER
      );
      const totalPoints = points * comboMultiplier;
      this.game.gameState.trainingScore += totalPoints;

      if (this.game.gameState.trainingCombo > 1) {
        this.game.playSound("comboIncrease");
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

      this.game.updateElement(
        "training-score",
        this.game.gameState.trainingScore.toString()
      );
      this.game.updateElement(
        "combo-counter",
        this.game.gameState.trainingCombo.toString()
      );

      cone.remove();
    } catch (error) {
      console.error("Failed to collect cone:", error);
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
          if (
            bonusReward &&
            this.game.gameState.trainingScore >=
              GAME_CONFIG.TRAINING_BONUS_THRESHOLD
          ) {
            bonusReward.classList.add("available");
            bonusReward.innerHTML = `
              <img src="${reward.icon}" alt="Health Upgrade" class="upgrade-icon" />
              <div class="btn-text">${reward.name} (${cost} pts)</div>
            `;
            bonusReward.disabled = !canAfford;
          }
        } else {
          btn.innerHTML = `
            <img src="${reward.icon}" alt="${reward.name}" class="upgrade-icon" />
            <div class="btn-text">${reward.name} (${cost} pts)</div>
          `;
          btn.disabled = !canAfford;
        }
      }
    });
  }

  /**
   * Get cost for training reward based on purchases made
   */
  getTrainingCost(rewardType) {
    const baseCost = 5;
    return baseCost + this.game.gameState.trainingPurchases * 5;
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

      reward.apply(this.game.gameState.player);
      this.game.addBattleLog(
        `Training complete! ${reward.name}! (Cost: ${cost} points)`
      );
      this.game.playSound("upgradeApply");

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
      // All reels are winners
      reels.forEach((reelId) => {
        const reel = document.getElementById(reelId);
        if (reel) {
          reel.classList.add("winner");
        }
      });
    } else {
      // Show which reels match and which don't
      reels.forEach((reelId, index) => {
        const reel = document.getElementById(reelId);
        if (reel) {
          // Check if this reel matches any other reel
          const currentSymbol = results[index].name;
          const hasMatch = results.some(
            (result, i) => i !== index && result.name === currentSymbol
          );

          if (hasMatch) {
            reel.classList.add("winner");
          } else {
            reel.classList.add("loser");
          }
        }
      });
    }

    // Clear feedback after a delay
    setTimeout(() => {
      this.clearSlotFeedback();
    }, 2000);
  }

  /**
   * Spin slot machine with enhanced rewards
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

      // Clear previous feedback
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
   * Check slot machine results and apply rewards (only for 3 matching symbols)
   */
  checkSlotResults(results) {
    const resultElement = document.getElementById("slot-result");
    if (!resultElement) return;

    try {
      // Only give rewards for exactly 3 matching symbols
      const isWin =
        results[0].name === results[1].name &&
        results[1].name === results[2].name;

      if (isWin) {
        const symbolName = results[0].name;
        const reward = SLOT_CONFIG.rewards.triple[symbolName];

        if (reward) {
          // Apply the reward
          if (reward.attack) this.game.gameState.player.attack += reward.attack;
          if (reward.defense)
            this.game.gameState.player.defense += reward.defense;
          if (reward.hp) {
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
        }
      } else {
        // No reward for non-matching symbols
        resultElement.innerHTML = `<span style="color: #95a5a6;">No match - try again!</span>`;
      }

      // Add visual feedback to reels
      this.addSlotFeedback(results, isWin);

      this.updateSlotButtonState();
      this.updateTrainingButtonCosts(); // Update in case we got bonus points
    } catch (error) {
      console.error("Failed to check slot results:", error);
    }
  }
}
