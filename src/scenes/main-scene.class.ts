import { Background } from "../classes/bacground.class";
import { bg_manifest } from "../manifests";

export class MainScene extends Phaser.Scene {
  private background!: Background;

  constructor() {
    super("MainScene");
  }

  preload() {
    // preload Background manifest
    bg_manifest.forEach((element: { key: string; path: string }) => {
      this.load.image(element.key, element.path);
    });
  }

  create() {
    this.background = new Background(this);
    this.background.init();
  }

  update() {
    // this.background.update(0.2)
  }
}
