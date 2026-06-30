import Phaser from "phaser";
import { archer_constants } from "../../constants";
import { MainScene } from "../../scenes/main-scene.class";

const ARCHER = archer_constants;

const OFFSCREEN_MARGIN = 200;

export class Archer extends Phaser.GameObjects.Sprite {
  public scene: Phaser.Scene;
  public archer?: Phaser.GameObjects.Sprite;
  public arrow?: Phaser.GameObjects.Sprite;
  public canIdle: boolean = true;
  public dead: boolean = false;
  public isFullyDead: boolean = false;
  public spawnPoint: number = 0;
  public arrowReload: boolean = false;
  public isAttacking: boolean = false;
  public spawnOrientation: "left" | "right" = "right";

  public hitbox?: Phaser.GameObjects.Rectangle;
  public range?: Phaser.GameObjects.Rectangle;
  public arrowHitbox?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "");
    this.scene = scene;
  }

  init() {
    this.spawnPoint = Math.random() < 0.5 ? 0 : this.scene.cameras.main.width;
    this.spawnOrientation = this.spawnPoint === 0 ? "right" : "left";

    this.archer = this.scene.add.sprite(
      this.spawnPoint,
      480,
      ARCHER[0].spriteKey
    );

    this.archer.scale = 3;
    this.archer.setFlipX(this.spawnOrientation === "left");

    this.addHitboxes();
    this.animations();

    this.archer.on(
      "animationupdate",
      (
        anim: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
      ) => {
        if (this.archer && anim.key === "archer_attack" && frame.index === 9) {
          this.spawnArrow(this.archer.flipX);
        }
      }
    );

    this.archer.on("animationcomplete", (anim: Phaser.Animations.Animation) => {
      if (anim.key === "archer_attack") {
        this.canIdle = true;
        this.isAttacking = false;
        this.arrowReload = true;

        this.scene.time.delayedCall(4000, () => {
          this.arrowReload = false;
        });
      }

      if (anim.key === "archer_death") {
        this.scene.tweens.add({
          targets: this.archer,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.archer?.destroy();
            this.archer = undefined;
            this.isFullyDead = true;
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
  }

  animations() {
    ARCHER.forEach((element) => {
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

  spawnArrow(direction: boolean) {
    if (!this.archer || this.arrow) return;

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

  updateArrowPosition(worldSpeed: number = 0) {
    if (!this.arrow) return;
    this.arrow.x += this.arrow.getData("velocity");
    this.arrow.x += worldSpeed;
    this.arrowHitbox?.setPosition(this.arrow.x, this.arrow.y);

    const screenWidth = this.scene.cameras.main.width;
    if (this.arrow.x < -100 || this.arrow.x > screenWidth + 100) {
      this.destroyArrow();
    }
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
    if (!this.archer || this.arrowReload) return;
    this.isAttacking = true;
    this.canIdle = false;
    this.playAnimation("archer_attack", true);
  }

  death() {
    if (!this.archer || this.dead) return;
    this.canIdle = false;
    this.dead = true;

    const popupX = this.archer.x;
    const popupY = this.archer.y;

    this.hitbox?.destroy();
    this.hitbox = undefined;
    this.range?.destroy();
    this.range = undefined;

    if (this.scene instanceof MainScene) {
      this.scene.increaseScore(2, popupX, popupY);
    }

    this.archer.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      this.archer?.clearTint();
      this.playAnimation("archer_death", true);
    });
  }

  walk(speed: number = 0) {
    if (!this.archer || this.isAttacking) return;
    this.canIdle = false;
    this.playAnimation("archer_walk", true);
    this.archer.x += speed;
  }

  cleanup() {
    this.destroyArrow();
    this.hitbox?.destroy();
    this.hitbox = undefined;
    this.range?.destroy();
    this.range = undefined;
    this.archer?.destroy();
    this.archer = undefined;
    this.isFullyDead = true;
  }

  updateHitboxePositions() {
    if (!this.archer) return;

    this.hitbox?.setPosition(
      this.archer.flipX ? this.archer.x + 20 : this.archer.x - 20,
      this.archer.y
    );
    this.range?.setPosition(this.archer.x, this.archer.y);
  }

  knightInteractions() {
    const knight = (this.scene as MainScene).knight;

    if (!knight.knight) this.idle();
    if (!this.archer || !knight.knight) return;

    if (
      this.range &&
      knight.range &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.range.getBounds(),
        knight.range.getBounds()
      )
    ) {
      const directionToMove = knight.knight.x - this.archer.x;
      if (directionToMove < 0) {
        this.archer.setFlipX(true);
      } else if (directionToMove > 0) {
        this.archer.setFlipX(false);
      }
      this.canIdle = true;
      this.attack();
    } else {
      this.walk(this.archer.flipX ? -3 : 3);
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

    if (
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
      this.arrow &&
      this.arrowHitbox &&
      knight.hitbox &&
      !knight.isInvincible &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.arrowHitbox.getBounds(),
        knight.hitbox.getBounds()
      )
    ) {
      this.destroyArrow();
      knight.takeDamage();
    }
  }

  update(worldSpeed: number = 0) {
    if (!this.archer) return;
    this.archer.x += worldSpeed;
    this.updateHitboxePositions();
    this.updateArrowPosition(worldSpeed);

    if (this.dead) return;

    const screenWidth = this.scene.cameras.main.width;
    if (
      this.archer.x < -OFFSCREEN_MARGIN ||
      this.archer.x > screenWidth + OFFSCREEN_MARGIN
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
