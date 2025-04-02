import Phaser from "phaser";
import { archer_constants } from "../../constants";

const ARCHER = archer_constants;

export class Archer {
  public scene: Phaser.Scene;
  public archer?: Phaser.GameObjects.Sprite;
  public arrow?: Phaser.GameObjects.Sprite;
  public canIdle: boolean = true;
  public dead: boolean = false;
  public spawnPoint: number = 0;
  public arrowReload: boolean = false;
  public isAttacking: boolean = false;
  public spawnOrientation: "left" | "right" = "right";

  public hitbox?: Phaser.GameObjects.Rectangle;
  public range?: Phaser.GameObjects.Rectangle;
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

    this.archer.on("animationcomplete", (anim: Phaser.Animations.Animation) => {
      if (["archer_attack", "archer_special"].includes(anim.key)) {
        this.canIdle = true;
        this.isAttacking = false;
        this.arrowReload = true;

        setTimeout(() => {
          this.arrowReload = false;
        }, 4000);
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

  getAllBounds() {
    const bounds: { [key: string]: Phaser.Geom.Rectangle | null } = {};

    const hitboxes = [
      { key: "hitbox", hitbox: this.hitbox },
      { key: "arrowHitbox", hitbox: this.arrowHitbox },
      { key: "range", hitbox: this.range },
    ];

    hitboxes.forEach(({ key, hitbox }) => {
      bounds[key] = hitbox ? hitbox.getBounds() : null;
    });

    return bounds;
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
    this.range?.destroy();
  }

  walk() {
    if (!this.archer || this.isAttacking) return;
    this.canIdle = false;
    this.playAnimation("archer_walk", true);
  }

  updateHitboxePositions() {
    if (!this.archer) return;

    this.hitbox?.setPosition(
      this.archer.flipX ? this.archer.x + 20 : this.archer.x - 20,
      this.archer.y
    );

    this.range?.setPosition(this.archer.x, this.archer.y);
  }

  update() {
    if (!this.archer || this.dead) return;

    this.updateHitboxePositions();
    this.updateArrowPosition();

    if (this.canIdle) {
      this.idle();
    }
  }
}
