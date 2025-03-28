import Phaser from "phaser";
import { necromancer_constants } from "../../constants";

const NECROMANCER = necromancer_constants;

export class Necromancer {
  private scene: Phaser.Scene;
  private necromancer?: Phaser.GameObjects.Sprite;
  private skull?: Phaser.GameObjects.Sprite;
  private skulls: Phaser.GameObjects.Sprite[] = [];
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
    this.necromancer = this.scene.add.sprite(
      370,
      470,
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

    // Fire Skull when custom frame of the attack animation plays

    this.necromancer.on(
      "animationupdate",
      (
        anim: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
      ) => {
        if (anim.key === "necromancer_attack" && frame.index === 31) {
          this.spawnSkull(this.necromancer!.flipX);
        }
      }
    );

    this.necromancer.on(
      "animationcomplete",
      (anim: Phaser.Animations.Animation) => {
        // Go to iddle after playing athis animations
        if (["necromancer_attack", "necromancer_special"].includes(anim.key)) {
          this.canIdle = true;
        }

        // Handle death fade-out and destroy
        if (anim.key === "necromancer_death") {
          this.scene.tweens.add({
            targets: this.necromancer,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              this.necromancer?.destroy();
              this.necromancer = undefined;
            },
          });
        }
      }
    );
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

  spawnSkull(direction: boolean) {
    if (!this.necromancer) return;

    this.skull = this.scene.add.sprite(
      direction ? this.necromancer.x + 46 : this.necromancer.x - 46,
      this.necromancer.y - 10,
      "Skull"
    );

    this.skull.scale = 0.15;
    this.skull.setFlipX(direction);

    this.skull.setData("velocity", direction ? -4 : 4);

    this.skulls.push(this.skull);
  }

  updateSkulls() {
    this.skulls = this.skulls.filter((skull) => {
      skull.x += skull.getData("velocity");

      const outOfBounds = skull.x < 0 || skull.x > this.scene.scale.width;
      if (outOfBounds) {
        skull.destroy();
        return false;
      }

      return true;
    });
  }

  update() {
    this.updateSkulls();

    if (!this.necromancer || !this.keys || this.dead) return;

    const { A, D, SHIFT, SPACE, W } = this.keys;

    if (A.isDown) {
      this.necromancer.setFlipX(true);
      this.canIdle = true;
      this.necromancer.play("necromancer_walk", true);
    } else if (D.isDown) {
      this.necromancer.setFlipX(false);
      this.canIdle = true;
      this.necromancer.play("necromancer_walk", true);
    }

    // Handle Milly Attack
    else if (SHIFT.isDown) {
      this.canIdle = false;
      this.necromancer.play("necromancer_special", true);
    }

    // Handle attack
    else if (SPACE.isDown) {
      this.canIdle = false;
      this.necromancer.play("necromancer_attack", true);
    }

    // Handle death
    else if (W.isDown && !this.dead) {
      this.canIdle = false;
      this.dead = true;
      this.necromancer.play("necromancer_death", true);
    }

    // Handle idle state
    else if (this.canIdle) {
      this.necromancer.play("necromancer_idle", true);
    }
  }
}
