// Fighter Selection Module
class FighterSelection {
  constructor(game) {
    this.game = game;
  }

  /**
   * Set up event listeners for fighter selection
   */
  setupEventListeners() {
    document.querySelectorAll(".fighter-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        this.game.initializeAudio();
        const fighterType = e.currentTarget.dataset.fighter;
        this.game.playSound("fighterSelect");
        this.selectFighter(fighterType);
      });

      option.addEventListener("mouseenter", () => {
        this.game.playSound("buttonHover");
      });
    });
  }

  /**
   * Select a fighter and start the game
   */
  selectFighter(fighterType) {
    if (!CONFIG_UTILS.isValidFighterType(fighterType)) {
      console.error(`Invalid fighter type: ${fighterType}`);
      this.game.showError("Invalid fighter selection");
      return;
    }

    try {
      this.game.gameState.player = { ...FIGHTER_TEMPLATES[fighterType] };
      this.game.showScreen("battle-screen");
      this.game.playMusic("battle");
      this.game.combat.startBattle();
    } catch (error) {
      console.error("Failed to select fighter:", error);
      this.game.showError("Failed to select fighter");
    }
  }
}
