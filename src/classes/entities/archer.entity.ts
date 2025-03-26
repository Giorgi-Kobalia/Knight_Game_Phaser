import Phaser from "phaser";
import { archer_constants } from "../../constants";

const ARCHER = archer_constants;

export class Archer {
  private scene: Phaser.Scene;
  private archer?: Phaser.GameObjects.Sprite;

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
    this.archer = this.scene.add.sprite(640, 480, ARCHER[0].spriteKey);
    this.archer.scale = 3;

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
    ARCHER.forEach((element) => {
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
    if (!this.archer || !this.keys) return;

    if (this.keys.A.isDown) {
      this.archer.setFlipX(true);
      this.archer.play("archer_walk", true);
    } else if (this.keys.D.isDown) {
      this.archer.setFlipX(false);
      this.archer.play("archer_walk", true);
    } else if (this.keys.SHIFT.isDown) {
      this.archer.play("archer_special", true);
    } else if (this.keys.SPACE.isDown) {
      this.archer.play("archer_attack", true);
    } else if (this.keys.W.isDown) {
      this.archer.play("archer_death", true);
    } else {
      this.archer.play("archer_idle", true);
    }
  }
}
