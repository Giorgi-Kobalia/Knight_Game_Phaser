import Phaser from "phaser";
import { necromancer_constants } from "../../constants";

const NECROMANCER = necromancer_constants;

export class Necromancer {
  private scene: Phaser.Scene;
  private necromancer?: Phaser.GameObjects.Sprite;

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
    this.necromancer = this.scene.add.sprite(
      500,
      466,
      NECROMANCER[0].spriteKey
    );
    this.necromancer.scale = 3;

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
    NECROMANCER.forEach((element) => {
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
    if (!this.necromancer || !this.keys) return;

    if (this.keys.A.isDown) {
      this.necromancer.setFlipX(true);
      this.necromancer.play("necromancer_walk", true);
    } else if (this.keys.D.isDown) {
      this.necromancer.setFlipX(false);
      this.necromancer.play("necromancer_walk", true);
    } else if (this.keys.SHIFT.isDown) {
      this.necromancer.play("necromancer_special", true);
    } else if (this.keys.SPACE.isDown) {
      this.necromancer.play("necromancer_attack", true);
    } else if (this.keys.W.isDown) {
      this.necromancer.play("necromancer_death", true);
    } else {
      this.necromancer.play("necromancer_idle", true);
    }
  }
}
