import Phaser from "phaser";
import { archer_constants } from "../../constants";
import { Knight } from "./knight.entity";

const ARCHER = archer_constants;

export class Archer {
  private scene: Phaser.Scene;
  private archer?: Phaser.GameObjects.Sprite;
  private arrow?: Phaser.GameObjects.Sprite;
  private canIdle: boolean = true;
  private dead: boolean = false;
  private spawnPoint: number = 0;
  private velocityX: number = 3;
  private arrowReload: boolean = false;
  private millyReload: boolean = false;
  private isAttacking: boolean = false;
  private spawnOrientation: "left" | "right" = "right";

  public hitbox?: Phaser.GameObjects.Rectangle;
  public range?: Phaser.GameObjects.Rectangle;
  public millyRange?: Phaser.GameObjects.Rectangle;
  public attackHitbox?: Phaser.GameObjects.Rectangle;
  public arrowHitbox?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init() {
    // Determine spawn point and orientation based on it
    this.spawnPoint = Math.random() < 0.5 ? 0 : this.scene.cameras.main.width;
    this.spawnOrientation = this.spawnPoint === 0 ? "right" : "left";

    // Create archer sprite
    this.archer = this.scene.add.sprite(
      this.spawnPoint,
      480,
      ARCHER[0].spriteKey
    );
    this.archer.scale = 3;

    // Flip the sprite based on spawn orientation
    this.archer.setFlipX(this.spawnOrientation === "left");

    // Set velocity direction based on spawn orientation
    this.velocityX = this.spawnOrientation === "left" ? -3 : 3;

    this.addHitboxes();
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

    this.archer.on("animationupdate", (anim: Phaser.Animations.Animation) => {
      if (anim.key !== "archer_special") {
        if (this.attackHitbox) {
          this.attackHitbox.destroy();
          this.attackHitbox = undefined;
        }
      }
    });

    this.archer.on("animationcomplete", (anim: Phaser.Animations.Animation) => {
      if (["archer_attack", "archer_special"].includes(anim.key)) {
        this.canIdle = true;
        this.isAttacking = false;
        this.arrowReload = true;
        this.millyReload = true;

        setTimeout(() => {
          this.arrowReload = false;
        }, 4000);
        setTimeout(() => {
          this.millyReload = false;
        }, 2000);
      }

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

  addHitboxes() {
    if (!this.archer) return;

    this.hitbox = this.scene.add.rectangle(
      this.archer.x,
      this.archer.y,
      40,
      120,
      0xff0000,
      0
    );

    this.scene.physics.add.existing(this.hitbox);

    this.range = this.scene.add.rectangle(
      this.archer.x,
      this.archer.y,
      800,
      10,
      0x00ff00,
      0
    );

    this.scene.physics.add.existing(this.range);

    this.millyRange = this.scene.add.rectangle(
      this.archer.x,
      this.archer.y,
      120,
      10,
      0x00ff00,
      1
    );

    this.scene.physics.add.existing(this.millyRange);
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

    this.arrowHitbox = this.scene.add.rectangle(
      this.arrow.x,
      this.arrow.y,
      this.arrow.width * 3,
      this.arrow.height * 3,
      0xff0000,
      0
    );

    this.scene.physics.add.existing(this.arrowHitbox);
  }

  updateArrowPosition() {
    if (!this.arrow) return;
    this.arrow.x += this.arrow.getData("velocity");
    this.arrowHitbox?.setPosition(this.arrow.x, this.arrow.y);
  }

  destroyArrow() {
    if (!this.arrow) return;

    this.arrow.destroy();
    this.arrow = undefined;

    if (this.arrowHitbox) {
      this.arrowHitbox.destroy();
      this.arrowHitbox = undefined;
    }
  }

  playAnimation(key: string, loop: boolean = true) {
    if (!this.archer) return;
    this.archer.play(key, loop);
  }

  idle() {
    this.playAnimation("archer_idle", true);
  }

  special() {
    if (!this.archer || this.millyReload) return; // Prevent special if already attacking
    this.isAttacking = true;
    this.canIdle = false;
    this.playAnimation("archer_special", true);

    if (!this.attackHitbox) {
      this.attackHitbox = this.scene.add.rectangle(
        this.archer.x,
        this.archer.y,
        60,
        100,
        0xffff00,
        1
      );
      this.scene.physics.add.existing(this.attackHitbox);
    }
  }

  attack() {
    if (!this.archer || this.arrowReload) return; // Prevent attack if already attacking
    this.isAttacking = true;
    this.canIdle = false;
    this.playAnimation("archer_attack", true);
  }

  death() {
    if (!this.archer || this.dead) return;
    this.canIdle = false;
    this.dead = true;
    this.playAnimation("archer_death", true);
    this.hitbox?.destroy();
    this.millyRange?.destroy();
    this.range?.destroy();
  }

  walk() {
    if (!this.archer || this.isAttacking) return;

    this.canIdle = false;

    const knight = (this.scene as any).characters["knight"] as Knight;

    if (!knight || !knight.knight) return;

    const directionToMove = knight.knight.x - this.archer.x;

    if (directionToMove < 0) {
      this.velocityX = -3;
    } else if (directionToMove > 0) {
      this.velocityX = 3;
    }

    this.playAnimation("archer_walk", true);
    this.archer.x += this.velocityX;
  }

  update() {
    this.updateArrowPosition();

    if (!this.archer || this.dead) return;

    if (this.attackHitbox) {
      this.attackHitbox.setPosition(
        this.archer.flipX ? this.archer.x - 60 : this.archer.x + 60,
        this.archer.y
      );
    }

    this.hitbox?.setPosition(
      this.archer.flipX ? this.archer.x + 20 : this.archer.x - 20,
      this.archer.y
    );

    this.range?.setPosition(this.archer.x, this.archer.y);
    this.millyRange?.setPosition(this.archer.x, this.archer.y);

    if (this.canIdle) {
      this.idle();
    }

    // Check if Archer collides with Knight
    const knight = (this.scene as any).characters["knight"] as Knight;

    if (knight) {
      // First check if the Knight is in military range (prioritize this for special attack)
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.millyRange!.getBounds(),
          knight.range!.getBounds()
        )
      ) {
        // Knight is within military range (special attack)
        const directionToMove = knight.knight!.x - this.archer.x;
        if (directionToMove < 0) {
          this.archer.setFlipX(true);
        } else if (directionToMove > 0) {
          this.archer.setFlipX(false);
        }
        this.velocityX = 0; // Stop moving
        this.canIdle = true; // Allow idle animation or other logic

        this.special(); // Perform special attack
      }
      // If not in military range, check if within standard range (perform arrow attack)
      else if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.range!.getBounds(),
          knight.range!.getBounds()
        )
      ) {
        // Knight is within standard range (arrow attack)
        const directionToMove = knight.knight!.x - this.archer.x;
        if (directionToMove < 0) {
          this.archer.setFlipX(true);
        } else if (directionToMove > 0) {
          this.archer.setFlipX(false);
        }
        this.velocityX = 0; // Stop moving
        this.canIdle = true; // Allow idle animation or other logic

        this.attack(); // Perform arrow attack
      } else {
        // If outside both ranges, move towards the Knight
        this.walk();
      }
    }

    // Death condition: collision with knight's attack hitbox
    if (
      knight &&
      knight.attackHitbox &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.hitbox!.getBounds(),
        knight.attackHitbox.getBounds()
      )
    ) {
      this.death();
    }

    // Arrow colliding with shield (destroy the arrow, do NOT cause knight's death)
    if (
      knight &&
      this.arrow &&
      this.arrowHitbox &&
      knight.shieldHitbox &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.arrowHitbox.getBounds(),
        knight.shieldHitbox.getBounds()
      )
    ) {
      this.destroyArrow();
    }

    if (
      knight &&
      this.arrow &&
      this.arrowHitbox &&
      knight.hitbox &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.arrowHitbox.getBounds(),
        knight.hitbox.getBounds()
      )
    ) {
      this.destroyArrow();
      // knight.death()
    }

    if (
      knight &&
      this.attackHitbox &&
      knight.hitbox &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.attackHitbox.getBounds(),
        knight.hitbox.getBounds()
      )
    ) {
      knight.death()
    }
  }
}
