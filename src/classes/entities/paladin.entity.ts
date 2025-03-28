import Phaser from "phaser";
import { paladin_constants } from "../../constants";

const PALADIN = paladin_constants;

export class Paladin {
  private scene: Phaser.Scene;
  private paladin?: Phaser.GameObjects.Sprite;
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
    this.paladin = this.scene.add.sprite(1090, 514, PALADIN[0].spriteKey);
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
    if (!this.paladin || !this.keys || this.dead) return;

    if (this.keys.A.isDown) {
      this.paladin.setFlipX(true);
      this.canIdle = true;
      this.paladin.play("paladin_walk", true);
    } else if (this.keys.D.isDown) {
      this.paladin.setFlipX(false);
      this.canIdle = true;
      this.paladin.play("paladin_walk", true);
    }

    // Handle Hit
    else if (this.keys.SHIFT.isDown) {
      this.canIdle = false;
      this.paladin.play("paladin_hit", true);
      this.paladin.on("animationcomplete", () => {
        this.canIdle = true;
      });
    }

    // Handle attack
    else if (this.keys.SPACE.isDown) {
      this.canIdle = false;
      this.paladin.play("paladin_attack", true);
      this.paladin.on("animationcomplete", () => {
        this.canIdle = true;
      });
    }

    // Handle death
    else if (this.keys.W.isDown) {
      this.canIdle = false;
      this.dead = true;
      this.paladin.play("paladin_death", true);
    }

    // Handle idle state
    else if (this.canIdle) {
      this.paladin.play("paladin_idle", true);
    }
  }
}
