import Phaser from "phaser";
import { archer_constants } from "../../constants";

const ARCHER = archer_constants;

export class Archer {
  private scene: Phaser.Scene;
  private archer?: Phaser.GameObjects.Sprite;
  private arrows: Phaser.GameObjects.Sprite[] = [];
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

    // Fire arrow when custom frame of the attack animation plays
    this.archer.on(
      "animationupdate",
      (
        anim: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
      ) => {
        if (anim.key === "archer_attack" && frame.index === 9) {
          this.spawnArrow(this.archer!.flipX);
        }
      }
    );

    this.archer.on("animationcomplete", (anim: Phaser.Animations.Animation) => {
      // Go to iddle after playing athis animations
      if (["archer_attack", "archer_special"].includes(anim.key)) {
        this.canIdle = true;
      }

      // Handle death fade-out and destroy
      if (anim.key === "archer_death") {
        this.scene.tweens.add({
          targets: this.archer,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.archer?.destroy();
            this.archer = undefined;
          },
        });
      }
    });
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

  spawnArrow(direction: boolean) {
    if (!this.archer) return;

    const arrow = this.scene.add.sprite(
      this.archer.x,
      this.archer.y - 30,
      "Arrow"
    );
    arrow.scale = 3;
    arrow.setFlipX(direction);
    arrow.setData("velocity", direction ? -5 : 5);

    this.arrows.push(arrow);
  }

  updateArrows() {
    this.arrows = this.arrows.filter((arrow) => {
      arrow.x += arrow.getData("velocity");

      const outOfBounds = arrow.x < 0 || arrow.x > this.scene.scale.width;
      if (outOfBounds) {
        arrow.destroy();
        return false;
      }

      return true;
    });
  }

  update() {
    this.updateArrows();

    if (!this.archer || !this.keys || this.dead) return;

    const { A, D, SHIFT, SPACE, W } = this.keys;

    if (A.isDown) {
      this.archer.setFlipX(true);
      this.canIdle = true;
      this.archer.play("archer_walk", true);
    } else if (D.isDown) {
      this.archer.setFlipX(false);
      this.canIdle = true;
      this.archer.play("archer_walk", true);
    }

    // Special melee attack
    else if (SHIFT.isDown) {
      this.canIdle = false;
      this.archer.play("archer_special", true);
    }

    // Ranged attack
    else if (SPACE.isDown) {
      this.canIdle = false;
      this.archer.play("archer_attack", true);
    }

    // Death
    else if (W.isDown && !this.dead) {
      this.canIdle = false;
      this.dead = true;
      this.archer.play("archer_death", true);
    }

    // Idle
    else if (this.canIdle) {
      this.archer.play("archer_idle", true);
    }
  }
}
