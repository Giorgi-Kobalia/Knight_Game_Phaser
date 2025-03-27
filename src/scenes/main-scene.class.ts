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
  private archer!: Archer;
  private necromancer!: Necromancer;
  private paladin!: Paladin;
  private ronin!: Ronin;

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

    // preload Ronin manifest
    ronin_constants.forEach(
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

    // preload bullets manifest
    bullets_constants.forEach(
      (element: { spriteKey: string; spritePath: string }) => {
        this.load.image(element.spriteKey, element.spritePath);
      }
    );
  }

  create() {
    this.background = new Background(this);

    this.knight = new Knight(this, this.background);

    this.archer = new Archer(this);

    this.necromancer = new Necromancer(this);

    this.paladin = new Paladin(this);

    this.ronin = new Ronin(this);

    this.background.init();

    this.knight.init();

    this.archer.init();

    this.necromancer.init();

    this.paladin.init();

    this.ronin.init();
  }

  update() {
    this.knight.update();

    this.archer.update();

    this.necromancer.update();

    this.paladin.update();

    this.ronin.update();
  }
}
