import { Archer, Background, Knight, Necromancer, Paladin } from "../classes";
import {
  archer_constants,
  knight_constants,
  necromancer_constants,
  paladin_constants,
} from "../constants";
import { bg_manifest } from "../manifests";

export class MainScene extends Phaser.Scene {
  private background!: Background;
  private knight!: Knight;
  private archer!: Archer;
  private necromancer!: Necromancer;
  private paladin!: Paladin;

  constructor() {
    super("MainScene");
  }

  preload() {
    // preload Background manifest
    bg_manifest.forEach((element: { key: string; path: string }) => {
      this.load.image(element.key, element.path);
    });
    // preload Knight manifest
    knight_constants.forEach(
      (element: {
        spriteKey: string;
        spritePath: string;
        spriteConfiguration: Phaser.Types.Textures.SpriteSheetConfig;
      }) => {
        this.load.spritesheet(
          element.spriteKey,
          element.spritePath,
          element.spriteConfiguration
        );
      }
    );
    // preload Archer manifest
    archer_constants.forEach(
      (element: {
        spriteKey: string;
        spritePath: string;
        spriteConfiguration: Phaser.Types.Textures.SpriteSheetConfig;
      }) => {
        this.load.spritesheet(
          element.spriteKey,
          element.spritePath,
          element.spriteConfiguration
        );
      }
    );
    // preload Necromancer manifest
    necromancer_constants.forEach(
      (element: {
        spriteKey: string;
        spritePath: string;
        spriteConfiguration: Phaser.Types.Textures.SpriteSheetConfig;
      }) => {
        this.load.spritesheet(
          element.spriteKey,
          element.spritePath,
          element.spriteConfiguration
        );
      }
    );
    // preload Paladin manifest
    paladin_constants.forEach(
      (element: {
        spriteKey: string;
        spritePath: string;
        spriteConfiguration: Phaser.Types.Textures.SpriteSheetConfig;
      }) => {
        this.load.spritesheet(
          element.spriteKey,
          element.spritePath,
          element.spriteConfiguration
        );
      }
    );
  }

  create() {
    this.background = new Background(this);
    this.background.init();

    this.knight = new Knight(this, this.background);
    this.knight.init();

    this.archer = new Archer(this);
    this.archer.init();

    this.necromancer = new Necromancer(this);
    this.necromancer.init();

    this.paladin = new Paladin(this);
    this.paladin.init();
  }

  update() {
    this.knight.update();

    this.archer.update();

    this.necromancer.update();

    this.paladin.update();
  }
}
