import Phaser from "phaser";
import { ronin_constants } from "../../constants";

const RONIN = ronin_constants;

export class Ronin {
  private scene: Phaser.Scene;
  private ronin?: Phaser.GameObjects.Sprite;

  private keys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SHIFT: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init() {
    this.ronin = this.scene.add.sprite(1310, 476, RONIN[0].spriteKey);
    this.ronin.scale = 3;

    this.keys = {
      W: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      D: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SHIFT: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.SHIFT
      ),
      SPACE: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      ),
    };

    this.animations();
  }

  animations() {
    RONIN.forEach((element) => {
      this.scene.anims.create({
        key: element.animationKey,
        frames: this.scene.anims.generateFrameNumbers(
          element.spriteKey,
          element.animConfiguration
        ),
        frameRate: element.frameRate,
        repeat: element.repeat,
      });
    });
  }

  update() {
    if (!this.ronin || !this.keys) return;

    if (this.keys.A.isDown) {
      this.ronin.setFlipX(true);
      this.ronin.play("ronin_walk", true);
    } else if (this.keys.D.isDown) {
      this.ronin.setFlipX(false);
      this.ronin.play("ronin_walk", true);
    } else if (this.keys.SPACE.isDown) {
      this.ronin.play("ronin_attack", true);
    } else if (this.keys.W.isDown) {
      this.ronin.play("ronin_death", true);
    } else {
      this.ronin.play("ronin_idle", true);
    }
  }
}
