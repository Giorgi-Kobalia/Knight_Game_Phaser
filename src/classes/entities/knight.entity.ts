import Phaser from "phaser";
import { knight_constants } from "../../constants";

const KNIGHT = knight_constants;

export class Knight {
  public scene: Phaser.Scene;
  public knight?: Phaser.GameObjects.Sprite;
  public canIdle: boolean = true;
  public isShieldActevated: boolean = false;
  public dead: boolean = false;
  public hitbox?: Phaser.GameObjects.Rectangle;
  public attackHitbox?: Phaser.GameObjects.Rectangle;
  public shieldHitbox?: Phaser.GameObjects.Rectangle;
  public isAttacking: boolean = false;
  public range?: Phaser.GameObjects.Rectangle;

  public keys?: {
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SHIFT: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init() {
    this.knight = this.scene.add.sprite(830, 480, KNIGHT[0].spriteKey);
    this.knight.scale = 3;

    this.keys = {
      A: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      D: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SHIFT: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.SHIFT
      ),
      SPACE: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      ),
    };

    this.addHitboxes();
    this.animations();

    this.knight.on("animationcomplete", (anim: Phaser.Animations.Animation) => {
      if (anim.key === "knight_attack") {
        this.canIdle = true;
        this.isAttacking = false;

        // Remove the attack hitbox after the attack animation completes
        if (this.attackHitbox) {
          this.attackHitbox.destroy();
          this.attackHitbox = undefined;
        }
      }

      if (anim.key === "knight_death") {
        this.scene.tweens.add({
          targets: this.knight,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.knight?.destroy();
            this.knight = undefined;
          },
        });
      }
    });
  }

  getAllBounds() {
    const bounds: { [key: string]: Phaser.Geom.Rectangle | null } = {};

    const hitboxes = [
      { key: "hitbox", hitbox: this.hitbox },
      { key: "attackHitbox", hitbox: this.attackHitbox },
      { key: "shieldHitbox", hitbox: this.shieldHitbox },
      { key: "range", hitbox: this.range },
    ];

    hitboxes.forEach(({ key, hitbox }) => {
      bounds[key] = hitbox ? hitbox.getBounds() : null;
    });

    return bounds;
  }

  addHitboxes() {
    // Create the regular hitbox for the knight.
    this.hitbox = this.scene.add.rectangle(
      this.knight?.x,
      this.knight?.y,
      60,
      100,
      0xff0000,
      0
    );
    this.scene.physics.add.existing(this.hitbox);

    // Create a range hitbox for attacks.
    this.range = this.scene.add.rectangle(
      this.knight?.x,
      this.knight?.y,
      150,
      10,
      0x00ff00,
      0
    );
    this.scene.physics.add.existing(this.range);
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

  idle() {
    if (!this.knight) return;
    this.knight.play("knight_idle", true);
  }

  walk() {
    if (!this.knight || this.isAttacking) return;

    this.canIdle = true; // Allow idle after walking
    this.isShieldActevated = false; // Disable shield while walking
    this.knight.play("knight_walk", true);
  }

  shield() {
    if (!this.knight || this.isShieldActevated || this.isAttacking) return;
    this.canIdle = false;
    this.knight.play("knight_shield", true);
    this.isShieldActevated = true;

    if (!this.shieldHitbox) {
      this.shieldHitbox = this.scene.add.rectangle(
        this.knight.flipX ? this.knight.x - 20 : this.knight.x + 20,
        this.knight.y,
        40,
        120,
        0xffff00,
        0
      );
      this.scene.physics.add.existing(this.shieldHitbox);
    }
  }

  destroyShieldIfDontUse() {
    if (!this.isShieldActevated && this.shieldHitbox) {
      this.shieldHitbox.destroy();
      this.shieldHitbox = undefined;
    }
  }

  attack() {
    if (!this.knight) return;

    this.isAttacking = true;
    this.canIdle = false;
    this.isShieldActevated = false;
    this.knight.play("knight_attack", true);

    if (!this.attackHitbox) {
      this.attackHitbox = this.scene.add.rectangle(
        this.knight.x,
        this.knight.y,
        60,
        100,
        0xffff00,
        0
      );
      this.scene.physics.add.existing(this.attackHitbox);
    }
  }

  death() {
    if (!this.knight) return;
    this.canIdle = false;
    this.dead = true;
    this.knight.play("knight_death", true);

    if (this.attackHitbox) {
      this.attackHitbox.destroy();
      this.attackHitbox = undefined;
    }
  }

  changeHitboxPosition() {
    if (!this.knight) return;

    this.hitbox?.setPosition(this.knight.x, this.knight.y);
    this.range?.setPosition(this.knight.x, this.knight.y);

    if (this.attackHitbox) {
      this.attackHitbox.setPosition(
        this.knight.flipX ? this.knight.x - 60 : this.knight.x + 60,
        this.knight.y
      );
    }
  }

  update() {
    if (!this.knight || !this.keys || this.dead) return;

    const { A, D, SHIFT, SPACE } = this.keys;

    this.changeHitboxPosition();
    this.destroyShieldIfDontUse();

    switch (true) {
      case A.isDown:
        this.knight.setFlipX(true);
        this.walk();
        this.knight.x -= 5;
        break;

      case D.isDown:
        this.knight.setFlipX(false);
        this.walk();
        this.knight.x += 5;
        break;

      case SHIFT.isDown:
        this.shield();
        break;

      case SPACE.isDown:
        this.attack();
        break;

      case this.canIdle && !this.isAttacking:
        this.idle();
        break;
    }
  }
}
