import Phaser from "phaser";
import { bg_manifest } from "../manifests";

export class Background {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  public layers: Phaser.GameObjects.TileSprite[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init() {
    this.container = this.scene.add.container(0, 0);

    bg_manifest.reverse().forEach((element) => {
      const layer = this.scene.add
        .tileSprite(
          0,
          0,
          this.scene.cameras.main.width,
          this.scene.cameras.main.height,
          element.key
        )
        .setOrigin(0, 0);

      this.layers.push(layer);
      this.container.add(layer);
    });
  }

  update(speed: number) {
    this.layers.forEach((layer, index) => {
      layer.tilePositionX += speed * (index + 1);
    });
  }
}
