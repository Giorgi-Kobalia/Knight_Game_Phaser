import Phaser from "phaser";
import { ronin_constants } from "../../constants";

const RONIN = ronin_constants;

export class Ronin {
  private scene: Phaser.Scene;
  private ronin?: Phaser.GameObjects.Sprite;
  private canIdle: boolean = true;
  private dead: boolean = false;

  private keys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
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

      SPACE: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      ),
    };

    this.animations();

    this.ronin.on("animationcomplete", (anim: Phaser.Animations.Animation) => {
      // Go to iddle after playing athis animations
      if (["ronin_attack"].includes(anim.key)) {
        this.canIdle = true;
      }

      // Handle death fade-out and destroy
      if (anim.key === "ronin_death") {
        this.scene.tweens.add({
          targets: this.ronin,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.ronin?.destroy();
            this.ronin = undefined;
          },
        });
      }
    });
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
    if (!this.ronin || !this.keys || this.dead) return;

    const { A, D, SPACE, W } = this.keys;

    if (A.isDown) {
      this.ronin.setFlipX(true);
      this.canIdle = true;
      this.ronin.play("ronin_walk", true);
    } else if (D.isDown) {
      this.ronin.setFlipX(false);
      this.canIdle = true;
      this.ronin.play("ronin_walk", true);
    }

    // Handle attack
    else if (SPACE.isDown) {
      this.canIdle = false;
      this.ronin.play("ronin_attack", true);
    }

    // Handle death
    else if (W.isDown) {
      this.canIdle = false;
      this.dead = true;
      this.ronin.play("ronin_death", true);
    }

    // Handle idle state
    else if (this.canIdle) {
      this.ronin.play("ronin_idle", true);
    }
  }
}
