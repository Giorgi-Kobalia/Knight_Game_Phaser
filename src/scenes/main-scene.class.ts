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

export class MainScene extends Phaser.Scene {
  private background!: Background;
  private knight!: Knight;
  private scoreText!: Phaser.GameObjects.Text;
  private restart!: Phaser.GameObjects.Text;
  private intro!: Phaser.GameObjects.Text;
  private score: number = 0;

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

    this.scoreText = this.add.text(850, 20, `SCORE : 0`, {
      font: "normal 40px custom",
      color: "#fff",
      resolution: 2,
    });

    this.scoreText.setOrigin(0.5, 0);

    this.creatreRestartBtn();
    this.createIntro();

    this.time.addEvent({
      delay: 5000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });
  }

  creatreRestartBtn() {
    this.restart = this.add.text(850, 320, `RESTART`, {
      font: "normal 100px custom",
      color: "#fff",
      resolution: 2,
    });

    this.restart.setOrigin(0.5, 0);

    this.restart.setInteractive();
    this.restart.alpha = 0;

    this.restart.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });

    this.restart.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    this.restart.on("pointerdown", () => {
      location.reload();
    });
  }

  createIntro() {
    this.intro = this.add.text(
      850,
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

  spawnEnemy() {
    if (this.intro.alpha) this.intro.alpha = 0;

    if (this.score >= 5 && !this.enemyPool.includes(Archer)) {
      this.enemyPool.push(Archer);
    }

    if (this.score >= 10 && !this.enemyPool.includes(Necromancer)) {
      this.enemyPool.push(Necromancer);
    }

    if (this.score >= 15 && !this.enemyPool.includes(Paladin)) {
      this.enemyPool.push(Paladin);
    }

    if (this.knight.knight && this.knight.dead) return;

    const EnemyClass = Phaser.Utils.Array.GetRandom(this.enemyPool);
    const enemy = new EnemyClass(this);
    enemy.init();

    this.characters[`enemy_${this.enemyCounter++}`] = enemy;
  }

  increaseScore(amount: number) {
    this.score += amount;
  }

  update() {
    if (this.scoreText) {
      this.scoreText.setText(`SCORE : ${this.score}`);
    }

    let worldSpeed = 0;

    if (this.knight.knight && !this.knight.dead && !this.knight.isAttacking) {
      if (this.input.keyboard?.addKey("A").isDown) {
        worldSpeed = 6;
      } else if (this.input.keyboard?.addKey("D").isDown) {
        worldSpeed = -6;
      }
    }

    if (this.knight.dead === true) {
      this.restart.alpha = 1;
    }

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
