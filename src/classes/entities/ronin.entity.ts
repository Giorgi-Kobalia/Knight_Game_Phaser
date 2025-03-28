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
    if (!this.ronin || !this.keys || this.dead) return;

    const { A, D, SHIFT, SPACE, W } = this.keys;

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
      this.ronin.on("animationcomplete", () => {
        this.canIdle = true;
      });
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
