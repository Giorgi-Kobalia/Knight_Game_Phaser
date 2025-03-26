import { Background, Knight } from "../classes";
import { knight_constants } from "../constants";
import { bg_manifest } from "../manifests";

export class MainScene extends Phaser.Scene {
  private background!: Background;
  private knight!: Knight;

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
  }

  create() {
    this.background = new Background(this);
    this.background.init();
    this.knight = new Knight(this, this.background);
    this.knight.init();
  }

  update() {
    this.knight.update();
  }
}
