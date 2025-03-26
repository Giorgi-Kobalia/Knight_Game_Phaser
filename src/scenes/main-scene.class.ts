import { Archer, Background, Knight } from "../classes";
import { archer_constants, knight_constants } from "../constants";
import { bg_manifest } from "../manifests";

export class MainScene extends Phaser.Scene {
  private background!: Background;
  private knight!: Knight;
  private archer!: Archer;

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
  }

  create() {
    this.background = new Background(this);
    this.background.init();
    this.knight = new Knight(this, this.background);
    this.knight.init();
    this.archer = new Archer(this);
    this.archer.init();
  }

  update() {
    this.knight.update();
    this.archer.update();
  }
}
