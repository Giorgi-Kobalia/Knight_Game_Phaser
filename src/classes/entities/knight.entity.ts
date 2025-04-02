import Phaser from "phaser";
import { knight_constants } from "../../constants";

const KNIGHT = knight_constants;

export class Knight {
  private scene: Phaser.Scene;
  public knight?: Phaser.GameObjects.Sprite; // Make this public so it's accessible
  private canIdle: boolean = true;
  private isShieldActevated: boolean = false;
  private dead: boolean = false;
  public hitbox?: Phaser.GameObjects.Rectangle;
  public attackHitbox?: Phaser.GameObjects.Rectangle;
  public shieldHitbox?: Phaser.GameObjects.Rectangle;
  public isAttacking: boolean = false;
  public range?: Phaser.GameObjects.Rectangle;

  private keys?: {
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
      // Go to idle after playing this animation
      if (["knight_attack"].includes(anim.key)) {
        this.canIdle = true;
        this.isAttacking = false;

        // Remove the attack hitbox immediately after the attack animation completes
        if (this.attackHitbox) {
          this.attackHitbox.destroy();
          this.attackHitbox = undefined;
        }
      }

      // Handle death fade-out and destroy
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
      180,
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

  death() {
    if (!this.knight) return;
    this.canIdle = false;
    this.dead = true;
    this.knight.play("knight_death", true);
  }

  update() {
    if (!this.knight || !this.keys || this.dead) return;

    const { A, D, SHIFT, SPACE } = this.keys;

    if (!this.isShieldActevated && this.shieldHitbox) {
      if (!this.shieldHitbox) return;
      this.shieldHitbox.destroy();
      this.shieldHitbox = undefined;
    }

    if (this.isShieldActevated && !this.shieldHitbox) {
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

    // Regular hitbox and range position updates
    this.hitbox?.setPosition(this.knight.x, this.knight.y);
    this.range?.setPosition(this.knight.x, this.knight.y);

    // Attack hitbox appears only during the attack animation
    if (this.attackHitbox) {
      this.attackHitbox.setPosition(
        this.knight.flipX ? this.knight.x - 60 : this.knight.x + 60,
        this.knight.y
      );
    }

    // Handle movement
    if (A.isDown && !this.isAttacking) {
      this.knight.setFlipX(true);
      this.canIdle = true; // Allow idle after walking
      this.isShieldActevated = false; // Disable shield while walking

      this.knight.play("knight_walk", true);
      this.knight.x -= 5;
    } else if (D.isDown && !this.isAttacking) {
      this.knight.setFlipX(false);
      this.canIdle = true; // Allow idle after walking
      this.isShieldActevated = false; // Disable shield while walking

      this.knight.play("knight_walk", true);
      this.knight.x += 5;
    }

    // Handle shield
    else if (SHIFT.isDown && !this.isShieldActevated && !this.isAttacking) {
      this.canIdle = false;
      this.knight.play("knight_shield", true);
      this.isShieldActevated = true;
    }

    // Handle attack
    else if (SPACE.isDown) {
      this.isAttacking = true;
      this.canIdle = false;
      this.isShieldActevated = false;
      this.knight.play("knight_attack", true);

      // Create and show the attack hitbox when the attack starts
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

    // Handle idle state
    else if (this.canIdle && !this.isAttacking) {
      this.knight.play("knight_idle", true);
    }
  }
}
