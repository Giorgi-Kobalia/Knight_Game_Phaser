import {
  Archer,
  Background,
  Knight,
  Necromancer,
  Paladin,
  Ronin,
} from "../classes";
import {
  archer_constants,
  bullets_constants,
  knight_constants,
  necromancer_constants,
  paladin_constants,
  ronin_constants,
} from "../constants";
import { bg_manifest } from "../manifests";

const HIGH_SCORE_KEY = "knight_game_hs";

export class MainScene extends Phaser.Scene {
  private background!: Background;
  public knight!: Knight;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private gameOverText!: Phaser.GameObjects.Text;
  private restart!: Phaser.GameObjects.Text;
  private intro!: Phaser.GameObjects.Text;
  private score: number = 0;
  private highScore: number = 0;
  private gameOverShown: boolean = false;

  private characters: {
    [key: string]: Archer | Necromancer | Paladin | Ronin;
  } = {};

  private enemyPool: (
    | typeof Archer
    | typeof Necromancer
    | typeof Paladin
    | typeof Ronin
  )[] = [Ronin];

  private enemyCounter: number = 0;
  private spawnEvent!: Phaser.Time.TimerEvent;
  private currentSpawnDelay: number = 4000;

  constructor() {
    super("MainScene");
  }

  preload() {
    const loadSpritesheets = (
      constants: {
        spriteKey: string;
        spritePath: string;
        spriteConfiguration: Phaser.Types.Textures.SpriteSheetConfig;
      }[]
    ) => {
      constants.forEach((element) => {
        this.load.spritesheet(
          element.spriteKey,
          element.spritePath,
          element.spriteConfiguration
        );
      });
    };

    bullets_constants.forEach(
      (element: { spriteKey: string; spritePath: string }) => {
        this.load.image(element.spriteKey, element.spritePath);
      }
    );
    bg_manifest.forEach((element: { key: string; path: string }) => {
      this.load.image(element.key, element.path);
    });

    loadSpritesheets(archer_constants);
    loadSpritesheets(necromancer_constants);
    loadSpritesheets(paladin_constants);
    loadSpritesheets(ronin_constants);
    loadSpritesheets(knight_constants);

    this.load.font("custom", "./fonts/font.ttf");
  }

  create() {
    this.background = new Background(this);
    this.background.init();

    this.knight = new Knight(this);
    this.knight.init();

    this.highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0");

    const cx = this.cameras.main.centerX;

    this.scoreText = this.add.text(cx, 20, `SCORE : 0`, {
      font: "normal 40px custom",
      color: "#fff",
      resolution: 2,
    });
    this.scoreText.setOrigin(0.5, 0);

    this.highScoreText = this.add.text(cx, 65, `BEST: ${this.highScore}`, {
      font: "normal 28px custom",
      color: "#aaaaaa",
      resolution: 2,
    });
    this.highScoreText.setOrigin(0.5, 0);

    this.livesText = this.add.text(20, 20, `HP: 3`, {
      font: "normal 40px custom",
      color: "#ff4444",
      resolution: 2,
    });

    this.gameOverText = this.add.text(cx, 210, `GAME OVER`, {
      font: "normal 75px custom",
      color: "#ff4444",
      resolution: 2,
      align: "center",
    });
    this.gameOverText.setOrigin(0.5, 0);
    this.gameOverText.alpha = 0;

    this.creatreRestartBtn();
    this.createIntro();

    // Fade intro on first keypress instead of waiting for first enemy spawn
    this.input.keyboard?.once("keydown", () => {
      this.tweens.add({
        targets: this.intro,
        alpha: 0,
        duration: 400,
      });
    });

    this.spawnEvent = this.time.addEvent({
      delay: 4000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });
  }

  creatreRestartBtn() {
    const cx = this.cameras.main.centerX;
    this.restart = this.add.text(cx, 320, `RESTART`, {
      font: "normal 80px custom",
      color: "#fff",
      resolution: 2,
    });

    this.restart.setOrigin(0.5, 0);
    this.restart.setInteractive();
    this.restart.alpha = 0;

    this.restart.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      this.restart.setColor("#ffff00");
    });

    this.restart.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      this.restart.setColor("#ffffff");
    });

    this.restart.on("pointerdown", () => {
      location.reload();
    });
  }

  createIntro() {
    const cx = this.cameras.main.centerX;
    this.intro = this.add.text(
      cx,
      150,
      "Use A and D for move! Use SHIFT for shield! Use SPACE for attack!",
      {
        font: "normal 50px custom",
        resolution: 2,
        wordWrap: { width: 600 },
        lineSpacing: 20,
      }
    );

    this.intro.setOrigin(0.5, 0);
  }

  private showUnlockBanner(text: string) {
    const banner = this.add.text(this.cameras.main.centerX, 130, text, {
      font: "normal 42px custom",
      color: "#ff8800",
      resolution: 2,
    });
    banner.setOrigin(0.5, 0.5);
    banner.setDepth(100);
    banner.alpha = 0;

    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 250,
      yoyo: true,
      hold: 1400,
      onComplete: () => banner.destroy(),
    });
  }

  showScorePopup(x: number, y: number, amount: number) {
    const popup = this.add.text(x, y - 20, `+${amount}`, {
      font: "normal 38px custom",
      color: "#ffff00",
      resolution: 2,
    });
    popup.setOrigin(0.5, 0.5);
    popup.setDepth(100);

    this.tweens.add({
      targets: popup,
      y: y - 100,
      alpha: 0,
      duration: 900,
      ease: "Power2",
      onComplete: () => popup.destroy(),
    });
  }

  spawnEnemy() {
    if (this.intro.alpha > 0) this.intro.alpha = 0;

    if (this.score >= 5 && !this.enemyPool.includes(Archer)) {
      this.enemyPool.push(Archer);
      this.showUnlockBanner("ARCHER UNLEASHED!");
    }

    if (this.score >= 10 && !this.enemyPool.includes(Necromancer)) {
      this.enemyPool.push(Necromancer);
      this.showUnlockBanner("NECROMANCER UNLEASHED!");
    }

    if (this.score >= 20 && !this.enemyPool.includes(Paladin)) {
      this.enemyPool.push(Paladin);
      this.showUnlockBanner("PALADIN UNLEASHED!");
    }

    if (this.knight.dead) return;

    const EnemyClass = Phaser.Utils.Array.GetRandom(this.enemyPool);
    const enemy = new EnemyClass(this);
    enemy.init();

    this.characters[`enemy_${this.enemyCounter++}`] = enemy;
  }

  increaseScore(amount: number, x?: number, y?: number) {
    this.score += amount;

    if (x !== undefined && y !== undefined) {
      this.showScorePopup(x, y, amount);
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem(HIGH_SCORE_KEY, this.highScore.toString());
      this.highScoreText.setText(`BEST: ${this.highScore}`);
    }
  }

  // Prevent knight from walking into living enemy hitboxes
  private getAdjustedWorldSpeed(requestedSpeed: number): number {
    if (requestedSpeed === 0 || !this.knight.hitbox) return requestedSpeed;

    const knightBounds = this.knight.hitbox.getBounds();

    for (const character of Object.values(this.characters)) {
      if (character.dead || !character.hitbox) continue;

      try {
        const enemyBounds = character.hitbox.getBounds();

        if (
          Phaser.Geom.Intersects.RectangleToRectangle(knightBounds, enemyBounds)
        ) {
          const enemyIsLeft = enemyBounds.centerX < knightBounds.centerX;
          // requestedSpeed > 0 = moving left (enemies shift right toward left-side enemy)
          if (requestedSpeed > 0 && enemyIsLeft) return 0;
          // requestedSpeed < 0 = moving right (enemies shift left toward right-side enemy)
          if (requestedSpeed < 0 && !enemyIsLeft) return 0;
        }
      } catch (_) {
        // skip destroyed hitbox objects that weren't nulled in time
      }
    }

    return requestedSpeed;
  }

  private updateSpawnRate() {
    let desired = 4000;
    if (this.score >= 40) desired = 2000;
    else if (this.score >= 25) desired = 2500;
    else if (this.score >= 12) desired = 3000;
    else if (this.score >= 5) desired = 3500;

    if (desired !== this.currentSpawnDelay) {
      this.currentSpawnDelay = desired;
      this.spawnEvent.remove(false);
      this.spawnEvent = this.time.addEvent({
        delay: desired,
        callback: this.spawnEnemy,
        callbackScope: this,
        loop: true,
      });
    }
  }

  update() {
    if (this.scoreText) {
      this.scoreText.setText(`SCORE : ${this.score}`);
    }

    if (this.livesText && this.knight) {
      this.livesText.setText(`HP: ${this.knight.lives}`);
    }

    if (this.knight.dead && !this.gameOverShown) {
      this.gameOverShown = true;
      this.gameOverText.alpha = 1;
      this.restart.alpha = 1;
      // Highlight the score text in gold so it doubles as the final score display
      this.scoreText.setColor("#ffdd00");
    }

    // Remove fully dead enemies from the map
    for (const key of Object.keys(this.characters)) {
      if (this.characters[key].isFullyDead) {
        delete this.characters[key];
      }
    }

    this.updateSpawnRate();

    let worldSpeed = 0;

    if (this.knight.knight && !this.knight.dead && !this.knight.isAttacking) {
      if (this.input.keyboard?.addKey("A").isDown) {
        worldSpeed = 6;
      } else if (this.input.keyboard?.addKey("D").isDown) {
        worldSpeed = -6;
      }
    }

    worldSpeed = this.getAdjustedWorldSpeed(worldSpeed);

    this.knight.update();

    Object.values(this.characters).forEach((character) => {
      if (
        character instanceof Ronin ||
        character instanceof Archer ||
        character instanceof Necromancer ||
        character instanceof Paladin
      ) {
        character.update(worldSpeed);
      }
    });

    this.background.update(worldSpeed * -0.085);
  }
}
