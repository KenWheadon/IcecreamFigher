// Game Over Screen Module
class GameOverScreen {
  constructor(game) {
    this.game = game;
  }

  /**
   * Set up game over screen event listeners
   */
  setupEventListeners() {
    const restartGame = document.getElementById("restart-game");
    if (restartGame) {
      restartGame.addEventListener("click", () => {
        this.game.playSound("buttonClick");
        location.reload();
      });
    }
  }

  /**
   * Handle game over
   */
  gameOver(reason) {
    this.game.updateElement(
      "final-battle",
      this.game.gameState.currentBattle.toString()
    );
    this.game.updateElement("game-over-reason", reason);

    this.game.cleanupTimers();
    this.game.playMusic("gameOver");
    this.game.playSound("gameOverSound");

    setTimeout(() => {
      this.game.showScreen("game-over-screen");
    }, 1500);
  }
}
