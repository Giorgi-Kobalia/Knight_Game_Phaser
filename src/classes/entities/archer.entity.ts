import Phaser from "phaser";
import { archer_constants } from "../../constants";

const ARCHER = archer_constants;

export class Archer {
  private scene: Phaser.Scene;
  private archer?: Phaser.GameObjects.Sprite;
  private arrow?: Phaser.GameObjects.Sprite;
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

    this.arrow = this.scene.add.sprite(
      this.archer.x,
      this.archer.y - 30,
      "Arrow"
    );
    this.arrow.scale = 3;
    this.arrow.setFlipX(direction);

    this.arrow.setData("velocity", direction ? -5 : 5);
  }

  destroyArrow() {
    if (!this.arrow) return;
    if (this.arrow.x < 0 || this.arrow.x > this.scene.scale.width) {
      this.arrow.destroy();
      this.arrow = undefined;
    }
  }

  update() {
    if (this.arrow) {
      this.arrow.x += this.arrow.getData("velocity");

      this.destroyArrow();
    }

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

    // Handle Milly Attack
    else if (SHIFT.isDown) {
      this.canIdle = false;
      this.archer.play("archer_special", true);
      this.archer.on("animationcomplete", () => {
        this.canIdle = true;
      });
    }

    // Handle attack
    else if (SPACE.isDown) {
      if (this.arrow) return;
      this.canIdle = false;
      this.archer.play("archer_attack", true);
      this.archer.on("animationcomplete", () => {
        this.canIdle = true;
      });
    }

    // Handle death
    else if (W.isDown) {
      this.canIdle = false;
      this.dead = true;
      this.archer.play("archer_death", true);
    }

    // Handle idle state
    else if (this.canIdle) {
      this.archer.play("archer_idle", true);
    }
  }
}
