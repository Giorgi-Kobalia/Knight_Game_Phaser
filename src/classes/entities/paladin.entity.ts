import Phaser from "phaser";
import { paladin_constants } from "../../constants";
import { MainScene } from "../../scenes/main-scene.class";

const PALADIN = paladin_constants;

const OFFSCREEN_MARGIN = 200;

export class Paladin extends Phaser.GameObjects.Sprite {
  public scene: Phaser.Scene;
  public paladin?: Phaser.GameObjects.Sprite;
  public canIdle: boolean = true;
  public dead: boolean = false;
  public isFullyDead: boolean = false;
  public spawnPoint: number = 0;
  public attackReload: boolean = false;
  public isAttacking: boolean = false;
  public spawnOrientation: "left" | "right" = "right";

  private hp: number = 2;
  private hitCooldown: boolean = false;

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

    this.paladin = this.scene.add.sprite(
      this.spawnPoint,
      514,
      PALADIN[0].spriteKey
    );

    this.paladin.scale = 3;
    this.paladin.setFlipX(this.spawnOrientation === "left");

    this.animations();
    this.addHitboxes();

    this.paladin.on(
      "animationcomplete",
      (anim: Phaser.Animations.Animation) => {
        if (anim.key === "paladin_attack") {
          this.canIdle = true;
          this.isAttacking = false;
          this.attackReload = true;

          this.scene.time.delayedCall(3000, () => {
            this.attackReload = false;
          });
        }

        if (anim.key === "paladin_hit") {
          this.canIdle = true;
          this.isAttacking = false;
        }

        if (anim.key === "paladin_death") {
          this.scene.tweens.add({
            targets: this.paladin,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              this.paladin?.destroy();
              this.paladin = undefined;
              this.isFullyDead = true;
            },
          });
        }
      }
    );

    this.paladin.on(
      "animationupdate",
      (
        anim: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
      ) => {
        if (
          this.paladin &&
          anim.key === "paladin_attack" &&
          frame.index === 24
        ) {
          if (!this.attackHitbox) {
            this.attackHitbox = this.scene.add.rectangle(
              this.paladin.x,
              this.paladin.y,
              60,
              100,
              0xffff00,
              0
            );
            this.scene.physics.add.existing(this.attackHitbox);
          }
        }

        if (
          this.paladin &&
          anim.key === "paladin_attack" &&
          frame.index === 26
        ) {
          if (this.attackHitbox) {
            this.attackHitbox.destroy();
            this.attackHitbox = undefined;
          }
        }
      }
    );
  }

  addHitboxes() {
    if (!this.paladin) return;

    this.hitbox = this.scene.add.rectangle(
      this.paladin.x,
      this.paladin.y,
      40,
      120,
      0xff0000,
      0
    );
    this.scene.physics.add.existing(this.hitbox);

    this.range = this.scene.add.rectangle(
      this.paladin.x,
      this.paladin.y,
      95,
      10,
      0x00ff00,
      0
    );
    this.scene.physics.add.existing(this.range);
  }

  animations() {
    PALADIN.forEach((element) => {
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
    if (!this.paladin) return;
    this.paladin.play(key, loop);
  }

  idle() {
    this.playAnimation("paladin_idle", true);
  }

  attack() {
    if (!this.paladin || this.attackReload || this.hitCooldown) return;
    this.isAttacking = true;
    this.canIdle = false;
    this.paladin.play("paladin_attack", true);
  }

  receiveDamage() {
    if (!this.paladin || this.dead || this.hitCooldown) return;
    this.hitCooldown = true;
    this.hp--;

    if (this.hp <= 0) {
      this.death();
      return;
    }

    // First hit: red flash + hit animation
    this.isAttacking = true;
    this.canIdle = false;

    if (this.attackHitbox) {
      this.attackHitbox.destroy();
      this.attackHitbox = undefined;
    }

    this.paladin.setTint(0xff6666);
    this.scene.time.delayedCall(80, () => {
      this.paladin?.clearTint();
      if (!this.dead) this.playAnimation("paladin_hit", true);
    });

    this.scene.time.delayedCall(700, () => {
      this.hitCooldown = false;
    });
  }

  death() {
    if (!this.paladin || this.dead) return;
    this.canIdle = false;
    this.dead = true;

    const popupX = this.paladin.x;
    const popupY = this.paladin.y;

    this.hitbox?.destroy();
    this.hitbox = undefined;
    this.range?.destroy();
    this.range = undefined;

    if (this.attackHitbox) {
      this.attackHitbox.destroy();
      this.attackHitbox = undefined;
    }

    if (this.scene instanceof MainScene) {
      this.scene.increaseScore(4, popupX, popupY);
    }

    this.paladin.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      this.paladin?.clearTint();
      this.playAnimation("paladin_death", true);
    });
  }

  walk(speed: number = 0) {
    if (!this.paladin || this.isAttacking || this.hitCooldown) return;
    this.canIdle = false;
    this.playAnimation("paladin_walk", true);
    this.paladin.x += speed;
  }

  cleanup() {
    this.attackHitbox?.destroy();
    this.attackHitbox = undefined;
    this.hitbox?.destroy();
    this.hitbox = undefined;
    this.range?.destroy();
    this.range = undefined;
    this.paladin?.destroy();
    this.paladin = undefined;
    this.isFullyDead = true;
  }

  updateHitboxePositions() {
    if (!this.paladin) return;

    this.hitbox?.setPosition(this.paladin.x, 480);
    this.range?.setPosition(this.paladin.x, 480);

    if (this.attackHitbox) {
      this.attackHitbox.setPosition(
        this.paladin.flipX ? this.paladin.x - 80 : this.paladin.x + 80,
        480
      );
    }
  }

  knightInteractions() {
    const knight = (this.scene as MainScene).knight;

    if (!knight.knight) this.idle();
    if (!this.paladin || !knight.knight) return;

    if (
      this.range &&
      knight.range &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.range.getBounds(),
        knight.range.getBounds()
      )
    ) {
      const directionToMove = knight.knight.x - this.paladin.x;
      if (directionToMove < 0) {
        this.paladin.setFlipX(true);
      } else if (directionToMove > 0) {
        this.paladin.setFlipX(false);
      }
      this.canIdle = true;
      this.attack();
    } else {
      this.walk(this.paladin.flipX ? -3 : 3);
    }

    if (
      this.hitbox &&
      knight.attackHitbox &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.hitbox.getBounds(),
        knight.attackHitbox.getBounds()
      )
    ) {
      this.receiveDamage();
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
    if (!this.paladin) return;
    this.paladin.x += worldSpeed;
    this.updateHitboxePositions();

    if (this.dead) return;

    const screenWidth = this.scene.cameras.main.width;
    if (
      this.paladin.x < -OFFSCREEN_MARGIN ||
      this.paladin.x > screenWidth + OFFSCREEN_MARGIN
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
