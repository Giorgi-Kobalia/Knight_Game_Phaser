import Phaser from "phaser";
import { knight_constants } from "../../constants";

const KNIGHT = knight_constants;

export class Knight {
  private scene: Phaser.Scene;
  private knight?: Phaser.GameObjects.Sprite;
  private background: any;

  private keys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SHIFT: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, background: any) {
    this.scene = scene;
    this.background = background;
  }

  init() {
    this.knight = this.scene.add.sprite(900, 480, KNIGHT[0].spriteKey);
    this.knight.scale = 3;

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
    KNIGHT.forEach((element) => {
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
    if (!this.knight || !this.keys) return;

    if (this.keys.A.isDown) {
      this.knight.setFlipX(true);
      this.knight.play("walk", true);
      this.background.update(-0.2);
    } else if (this.keys.D.isDown) {
      this.knight.setFlipX(false);
      this.knight.play("walk", true);
      this.background.update(0.2);
    } else if (this.keys.SHIFT.isDown) {
      this.knight.play("shield", true);
    } else if (this.keys.SPACE.isDown) {
      this.knight.play("attack", true);
    } else if (this.keys.W.isDown) {
      this.knight.play("death", true);
    } else {
      this.knight.play("idle", true);
    }
  }
}
