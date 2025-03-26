import Phaser from "phaser";
import { paladin_constants } from "../../constants";

const PALADIN = paladin_constants;

export class Paladin {
  private scene: Phaser.Scene;
  private paladin?: Phaser.GameObjects.Sprite;

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
    this.paladin = this.scene.add.sprite(1300, 480, PALADIN[0].spriteKey);
    this.paladin.scale = 3;

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
    PALADIN.forEach((element) => {
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
    if (!this.paladin || !this.keys) return;

    if (this.keys.A.isDown) {
      this.paladin.setFlipX(true);
      this.paladin.play("archer_walk", true);
    } else if (this.keys.D.isDown) {
      this.paladin.setFlipX(false);
      this.paladin.play("archer_walk", true);
    } else if (this.keys.SHIFT.isDown) {
      this.paladin.play("archer_special", true);
    } else if (this.keys.SPACE.isDown) {
      this.paladin.play("archer_attack", true);
    } else if (this.keys.W.isDown) {
      this.paladin.play("archer_death", true);
    } else {
      this.paladin.play("archer_idle", true);
    }
  }
}
