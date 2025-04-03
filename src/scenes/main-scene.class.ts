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

interface CharacterConfig {
  name: string;
  classRef:
    | typeof Knight
    | typeof Archer
    | typeof Necromancer
    | typeof Paladin
    | typeof Ronin;
}

export class MainScene extends Phaser.Scene {
  private background!: Background;
  private scoreText!: Phaser.GameObjects.Text;
  private restart!: Phaser.GameObjects.Text;
  private score: number = 0;

  private characters: {
    [key: string]: Knight | Archer | Necromancer | Paladin | Ronin;
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

    const characters: CharacterConfig[] = [
      { name: "knight", classRef: Knight },
    ];

    this.background.init();

    characters.forEach((character) => {
      const characterInstance = new character.classRef(this);
      characterInstance.init();
      this.characters[character.name] = characterInstance;
    });

    this.scoreText = this.add.text(850, 20, `SCORE : 0`, {
      font: "normal 40px custom",
      color: "#fff",
      resolution: 2,
    });

    this.scoreText.setOrigin(0.5, 0);

    this.creatreRestartBtn();

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

  spawnEnemy() {
    if (this.score >= 5 && !this.enemyPool.includes(Archer)) {
      this.enemyPool.push(Archer);
    }

    if (this.score >= 10 && !this.enemyPool.includes(Necromancer)) {
      this.enemyPool.push(Necromancer);
    }

    if (this.score >= 15 && !this.enemyPool.includes(Paladin)) {
      this.enemyPool.push(Paladin);
    }

    const knight = this.characters["knight"] as Knight;

    if (knight && knight.dead) return;

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

    const knight = this.characters["knight"] as Knight;

    if (knight.knight && !knight.dead && !knight.isAttacking) {
      if (this.input.keyboard?.addKey("A").isDown) {
        worldSpeed = 6;
      } else if (this.input.keyboard?.addKey("D").isDown) {
        worldSpeed = -6;
      }
    }

    if (knight.dead === true) {
      this.restart.alpha = 1;
    }

    Object.values(this.characters).forEach((character) => {
      if (
        character instanceof Ronin ||
        character instanceof Archer ||
        character instanceof Necromancer ||
        character instanceof Paladin
      ) {
        character.update(worldSpeed);
      } else {
        character.update();
      }
    });

    this.background.update(worldSpeed * -0.085);
  }
}
