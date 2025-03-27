import Phaser from "phaser";
import { knight_constants } from "../../constants";

const KNIGHT = knight_constants;

export class Knight {
  private scene: Phaser.Scene;
  private knight?: Phaser.GameObjects.Sprite;
  private background: any;
  private canIdle: boolean = true;
  private dead: boolean = false;

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
    this.knight = this.scene.add.sprite(830, 480, KNIGHT[0].spriteKey);
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
    if (!this.knight || !this.keys || this.dead) return;

    const { A, D, SHIFT, SPACE, W } = this.keys;

    // Handle movement

    if (A.isDown) {
      this.knight.setFlipX(true);
      this.canIdle = true;
      this.knight.play("knight_walk", true);
      this.background.update(-0.2);
    } else if (D.isDown) {
      this.knight.setFlipX(false);
      this.canIdle = true;
      this.knight.play("knight_walk", true);
      this.background.update(0.2);
    }

    // Handle shield
    else if (SHIFT.isDown) {
      if (this.knight.anims.currentAnim?.key !== "knight_shield") {
        this.canIdle = false;
        this.knight.play("knight_shield", true);
      }
    }
    // Handle attack
    else if (SPACE.isDown) {
      this.canIdle = false;
      this.knight?.setOrigin(0.5, 0.5);
      this.knight.play("knight_attack", true);

      this.knight.on(
        "animationcomplete",
        (animation: Phaser.Animations.Animation) => {
          if (animation.key === "knight_attack") {
            this.knight?.setOrigin(0.5, 0.5);
            this.canIdle = true;
          }
        }
      );
    }
    // Handle death
    else if (W.isDown) {
      if (this.knight.anims.currentAnim?.key !== "knight_death") {
        this.canIdle = false;
        this.dead = true;
        this.knight.play("knight_death", true);
      }
    }

    // Handle idle state
    else if (this.canIdle) {
      if (this.knight.anims.currentAnim?.key !== "knight_idle") {
        this.knight.play("knight_idle", true);
      }
    }
  }
}
