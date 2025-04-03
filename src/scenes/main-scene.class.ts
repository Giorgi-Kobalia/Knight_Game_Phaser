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
  private score: number = 0;

  private characters: {
    [key: string]: Knight | Archer | Necromancer | Paladin | Ronin;
  } = {};

  private enemyPool: (
    | typeof Archer
    | typeof Necromancer
    | typeof Paladin
    | typeof Ronin
  )[] = [Archer];

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

    this.scoreText = this.add.text(850, 50, `Score: 0`, {
      fontSize: "32px",
      color: "#fff",
      fontFamily: "Arial",
      resolution: 2,
    });
    
    this.scoreText.setOrigin(0.5, 0);

    this.time.addEvent({
      delay: 5000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });
  }

  spawnEnemy() {
    const knight = this.characters["knight"] as Knight;

    if (knight && knight.dead) return;

    const EnemyClass = Phaser.Utils.Array.GetRandom(this.enemyPool);
    const enemy = new EnemyClass(this);
    enemy.init();

    this.characters[`enemy_${this.enemyCounter++}`] = enemy;
  }

  increaseScore(amount: number) {
    this.score += amount;
    console.log("Current Score:", this.score);
  }

  update() {
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);
    }

    let worldSpeed = 0;

    const knight = this.characters["knight"] as Knight;

    if (knight.knight && knight.dead === false) {
      if (this.input.keyboard?.addKey("A").isDown) {
        worldSpeed = 6;
      } else if (this.input.keyboard?.addKey("D").isDown) {
        worldSpeed = -6;
      }
    }

    // Update enemies with worldSpeed
    Object.values(this.characters).forEach((character) => {
      if (
        character instanceof Ronin ||
        character instanceof Archer ||
        character instanceof Necromancer ||
        character instanceof Paladin
      ) {
        character.update(worldSpeed);
      } else {
        character.update(); // Default update for non-enemies
      }
    });

    // Move background
    this.background.update(worldSpeed * -0.085);
  }
}
