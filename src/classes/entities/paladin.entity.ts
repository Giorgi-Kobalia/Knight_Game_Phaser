import Phaser from "phaser";
import { paladin_constants } from "../../constants";
import { Knight } from "./knight.entity";

const PALADIN = paladin_constants;

export class Paladin {
  public scene: Phaser.Scene;
  public paladin?: Phaser.GameObjects.Sprite;
  public canIdle: boolean = true;
  public dead: boolean = false;
  public spawnPoint: number = 0;
  public attackReload: boolean = false;
  public isAttacking: boolean = false;
  public spawnOrientation: "left" | "right" = "right";

  public hitbox?: Phaser.GameObjects.Rectangle;
  public range?: Phaser.GameObjects.Rectangle;
  public attackHitbox?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
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

          setTimeout(() => {
            this.attackReload = false;
          }, 3000);
        }

        if (anim.key === "paladin_hit") {
          this.canIdle = true;
        }

        if (anim.key === "paladin_death") {
          this.scene.tweens.add({
            targets: this.paladin,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              this.paladin?.destroy();
              this.paladin = undefined;
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

  playAnimation(key: string, loop: boolean = true) {
    if (!this.paladin) return;
    this.paladin.play(key, loop);
  }

  idle() {
    this.playAnimation("paladin_idle", true);
  }

  attack() {
    if (!this.paladin || this.attackReload) return;

    this.isAttacking = true;
    this.canIdle = false;
    this.paladin.play("paladin_attack", true);
  }

  death() {
    if (!this.paladin || this.dead) return;
    this.canIdle = false;
    this.dead = true;
    this.playAnimation("paladin_death", true);
    this.hitbox?.destroy();
    this.range?.destroy();

    if (this.attackHitbox) {
      this.attackHitbox.destroy();
      this.attackHitbox = undefined;
    }
  }

  walk(speed: number = 0) {
    if (!this.paladin || this.isAttacking) return;
    this.canIdle = false;
    this.playAnimation("paladin_walk", true);
    this.paladin.x += speed;
  }

  hit() {
    if (!this.paladin) return;
    this.canIdle = false;
    this.paladin.play("paladin_hit", true);
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
    const knight = (this.scene as any).characters["knight"] as Knight;

    if (!knight.knight) this.idle();

    if (!this.paladin || !knight.knight) return;

    if (
      knight &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.range!.getBounds(),
        knight.range!.getBounds()
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
      knight &&
      this.hitbox &&
      knight.attackHitbox &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.hitbox.getBounds(),
        knight.attackHitbox.getBounds()
      )
    ) {
      this.death();
    }

    if (knight && this.attackHitbox) {
      const attackBounds = this.attackHitbox.getBounds();

      // Проверяем, попал ли удар в щит
      const hitShield =
        knight.shieldHitbox &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          attackBounds,
          knight.shieldHitbox.getBounds()
        );

      // Если удар НЕ попал в щит, проверяем урон по телу рыцаря
      if (!hitShield && knight.hitbox) {
        const hitKnight = Phaser.Geom.Intersects.RectangleToRectangle(
          attackBounds,
          knight.hitbox.getBounds()
        );

        if (hitKnight) {
          knight.death();
        }
      }
    }
  }

  update(worldSpeed: number = 0) {
    if (!this.paladin) return;
    this.paladin.x += worldSpeed;
    this.updateHitboxePositions();

    if (this.dead) return;
    this.knightInteractions();

    if (this.canIdle) {
      this.idle();
    }
  }
}
