import Phaser from "phaser";
import { ronin_constants } from "../../constants";
import { MainScene } from "../../scenes/main-scene.class";

const RONIN = ronin_constants;

const OFFSCREEN_MARGIN = 200;

export class Ronin extends Phaser.GameObjects.Sprite {
  public scene: Phaser.Scene;
  public ronin?: Phaser.GameObjects.Sprite;
  public canIdle: boolean = true;
  public dead: boolean = false;
  public isFullyDead: boolean = false;
  public spawnPoint: number = 0;
  public attackReload: boolean = false;
  public isAttacking: boolean = false;
  public spawnOrientation: "left" | "right" = "right";

  public hitbox?: Phaser.GameObjects.Rectangle;
  public range?: Phaser.GameObjects.Rectangle;
  public attackHitbox?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "");
    this.scene = scene;
  }

  init() {
    this.spawnPoint = Math.random() < 0.5 ? 0 : this.scene.cameras.main.width;
    this.spawnOrientation = this.spawnPoint === 0 ? "right" : "left";

    this.ronin = this.scene.add.sprite(
      this.spawnPoint,
      480,
      RONIN[0].spriteKey
    );

    this.ronin.scale = 3;
    this.ronin.setFlipX(this.spawnOrientation === "left");

    this.animations();
    this.addHitboxes();

    this.ronin.on("animationcomplete", (anim: Phaser.Animations.Animation) => {
      if (anim.key === "ronin_attack") {
        this.canIdle = true;
        this.isAttacking = false;
        this.attackReload = true;

        if (this.attackHitbox) {
          this.attackHitbox.destroy();
          this.attackHitbox = undefined;
        }

        this.scene.time.delayedCall(3000, () => {
          this.attackReload = false;
        });
      }

      if (anim.key === "ronin_death") {
        this.scene.tweens.add({
          targets: this.ronin,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.ronin?.destroy();
            this.ronin = undefined;
            this.isFullyDead = true;
          },
        });
      }
    });

    this.ronin.on(
      "animationupdate",
      (
        anim: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
      ) => {
        if (this.ronin && anim.key === "ronin_attack" && frame.index === 3) {
          if (!this.attackHitbox) {
            this.attackHitbox = this.scene.add.rectangle(
              this.ronin.x,
              this.ronin.y,
              60,
              100,
              0xffff00,
              0
            );
            this.scene.physics.add.existing(this.attackHitbox);
          }
        }

        if (this.ronin && anim.key === "ronin_attack" && frame.index === 18) {
          if (this.attackHitbox) {
            this.attackHitbox.destroy();
            this.attackHitbox = undefined;
          }
        }
      }
    );
  }

  addHitboxes() {
    if (!this.ronin) return;

    this.hitbox = this.scene.add.rectangle(
      this.ronin.x,
      this.ronin.y,
      40,
      120,
      0xff0000,
      0
    );
    this.scene.physics.add.existing(this.hitbox);

    this.range = this.scene.add.rectangle(
      this.ronin.x,
      this.ronin.y,
      80,
      10,
      0x00ff00,
      0
    );
    this.scene.physics.add.existing(this.range);
  }

  animations() {
    RONIN.forEach((element) => {
      if (!this.scene.anims.exists(element.animationKey)) {
        this.scene.anims.create({
          key: element.animationKey,
          frames: this.scene.anims.generateFrameNumbers(
            element.spriteKey,
            element.animConfiguration
          ),
          frameRate: element.frameRate,
          repeat: element.repeat,
        });
      }
    });
  }

  playAnimation(key: string, loop: boolean = true) {
    if (!this.ronin) return;
    this.ronin.play(key, loop);
  }

  idle() {
    this.playAnimation("ronin_idle", true);
  }

  attack() {
    if (!this.ronin || this.attackReload) return;
    this.isAttacking = true;
    this.canIdle = false;
    this.ronin.play("ronin_attack", true);
  }

  death() {
    if (!this.ronin || this.dead) return;
    this.canIdle = false;
    this.dead = true;

    const popupX = this.ronin.x;
    const popupY = this.ronin.y;

    this.hitbox?.destroy();
    this.hitbox = undefined;
    this.range?.destroy();
    this.range = undefined;

    if (this.attackHitbox) {
      this.attackHitbox.destroy();
      this.attackHitbox = undefined;
    }

    if (this.scene instanceof MainScene) {
      this.scene.increaseScore(1, popupX, popupY);
    }

    this.ronin.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      this.ronin?.clearTint();
      this.playAnimation("ronin_death", true);
    });
  }

  walk(speed: number = 0) {
    if (!this.ronin || this.isAttacking) return;
    this.canIdle = false;
    this.playAnimation("ronin_walk", true);
    this.ronin.x += speed;
  }

  cleanup() {
    this.attackHitbox?.destroy();
    this.attackHitbox = undefined;
    this.hitbox?.destroy();
    this.hitbox = undefined;
    this.range?.destroy();
    this.range = undefined;
    this.ronin?.destroy();
    this.ronin = undefined;
    this.isFullyDead = true;
  }

  updateHitboxePositions() {
    if (!this.ronin) return;

    this.hitbox?.setPosition(this.ronin.x, this.ronin.y);
    this.range?.setPosition(this.ronin.x, this.ronin.y);

    if (this.attackHitbox) {
      this.attackHitbox.setPosition(
        this.ronin.flipX ? this.ronin.x - 60 : this.ronin.x + 60,
        this.ronin.y
      );
    }
  }

  knightInteractions() {
    const knight = (this.scene as MainScene).knight;

    if (!knight.knight) this.idle();
    if (!this.ronin || !knight.knight) return;

    if (
      this.range &&
      knight.range &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.range.getBounds(),
        knight.range.getBounds()
      )
    ) {
      const directionToMove = knight.knight.x - this.ronin.x;
      if (directionToMove < 0) {
        this.ronin.setFlipX(true);
      } else if (directionToMove > 0) {
        this.ronin.setFlipX(false);
      }
      this.canIdle = true;
      this.attack();
    } else {
      this.walk(this.ronin.flipX ? -4 : 4);
    }

    if (
      this.hitbox &&
      knight.attackHitbox &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.hitbox.getBounds(),
        knight.attackHitbox.getBounds()
      )
    ) {
      this.death();
    }

    if (this.attackHitbox) {
      const attackBounds = this.attackHitbox.getBounds();

      const hitShield =
        knight.shieldHitbox &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          attackBounds,
          knight.shieldHitbox.getBounds()
        );

      if (!hitShield && knight.hitbox && !knight.isInvincible) {
        const hitKnight = Phaser.Geom.Intersects.RectangleToRectangle(
          attackBounds,
          knight.hitbox.getBounds()
        );

        if (hitKnight) {
          knight.takeDamage();
        }
      }
    }
  }

  update(worldSpeed: number = 0) {
    if (!this.ronin) return;
    this.ronin.x += worldSpeed;
    this.updateHitboxePositions();

    if (this.dead) return;

    const screenWidth = this.scene.cameras.main.width;
    if (
      this.ronin.x < -OFFSCREEN_MARGIN ||
      this.ronin.x > screenWidth + OFFSCREEN_MARGIN
    ) {
      this.cleanup();
      return;
    }

    this.knightInteractions();

    if (this.canIdle) {
      this.idle();
    }
  }
}
