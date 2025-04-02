import Phaser from "phaser";
import { necromancer_constants } from "../../constants";
import { Knight } from "./knight.entity";

const NECROMANCER = necromancer_constants;

export class Necromancer {
  private scene: Phaser.Scene;
  private necromancer?: Phaser.GameObjects.Sprite;
  private skull?: Phaser.GameObjects.Sprite;
  private canIdle: boolean = true;
  private dead: boolean = false;
  public spawnPoint: number = 0;
  public skullReload: boolean = false;
  public isAttacking: boolean = false;
  public spawnOrientation: "left" | "right" = "right";

  public hitbox?: Phaser.GameObjects.Rectangle;
  public range?: Phaser.GameObjects.Rectangle;
  public skullHitbox?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init() {
    this.spawnPoint = Math.random() < 0.5 ? 0 : this.scene.cameras.main.width;
    this.spawnOrientation = this.spawnPoint === 0 ? "right" : "left";

    this.necromancer = this.scene.add.sprite(
      this.spawnPoint,
      470,
      NECROMANCER[0].spriteKey
    );

    this.necromancer.scale = 3;

    this.necromancer.setFlipX(this.spawnOrientation === "left");

    this.addHitboxes();
    this.animations();

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
        if (["necromancer_attack"].includes(anim.key)) {
          this.canIdle = true;
          this.isAttacking = false;
          this.skullReload = true;

          setTimeout(() => {
            this.skullReload = false;
          }, 4000);
        }

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

  getAllBounds() {
    const bounds: { [key: string]: Phaser.Geom.Rectangle | null } = {};

    const hitboxes = [
      { key: "hitbox", hitbox: this.hitbox },
      { key: "skullHitbox", hitbox: this.skullHitbox },
      { key: "range", hitbox: this.range },
    ];

    hitboxes.forEach(({ key, hitbox }) => {
      bounds[key] = hitbox ? hitbox.getBounds() : null;
    });

    return bounds;
  }

  addHitboxes() {
    if (!this.necromancer) return;

    this.hitbox = this.scene.add.rectangle(
      this.necromancer.x,
      this.necromancer.y,
      40,
      120,
      0xff0000,
      0
    );

    this.scene.physics.add.existing(this.hitbox);

    this.range = this.scene.add.rectangle(
      this.necromancer.x,
      this.necromancer.y,
      1100,
      10,
      0x00ff00,
      0
    );

    this.scene.physics.add.existing(this.range);
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
    this.skull.setData("velocity", direction ? -5 : 5);

    this.skullHitbox = this.scene.add.rectangle(
      this.skull.x,
      this.skull.y,
      this.skull.width * 0.15,
      this.skull.height * 0.15,
      0xff0000,
      0
    );

    this.scene.physics.add.existing(this.skullHitbox);
  }

  updateSkullPosition() {
    if (!this.skull) return;
    this.skull.x += this.skull.getData("velocity");
    this.skullHitbox?.setPosition(this.skull.x, this.skull.y);
  }

  destroySkull() {
    if (!this.skull) return;

    this.skull.destroy();
    this.skull = undefined;

    if (this.skullHitbox) {
      this.skullHitbox.destroy();
      this.skullHitbox = undefined;
    }
  }

  playAnimation(key: string, loop: boolean = true) {
    if (!this.necromancer) return;
    this.necromancer.play(key, loop);
  }

  idle() {
    this.playAnimation("necromancer_idle", true);
  }

  attack() {
    if (!this.necromancer || this.skullReload) return;
    this.isAttacking = true;
    this.canIdle = false;
    this.playAnimation("necromancer_attack", true);
  }

  death() {
    if (!this.necromancer || this.dead) return;
    this.canIdle = false;
    this.dead = true;
    this.playAnimation("necromancer_death", true);
    this.hitbox?.destroy();
    this.range?.destroy();
  }

  walk(speed: number = 0) {
    if (!this.necromancer || this.isAttacking) return;
    this.canIdle = false;
    this.playAnimation("necromancer_walk", true);
    this.necromancer.x += speed;
  }

  updateHitboxePositions() {
    if (!this.necromancer) return;

    this.hitbox?.setPosition(
      this.necromancer.flipX
        ? this.necromancer.x + 20
        : this.necromancer.x - 20,
      this.necromancer.y
    );

    this.range?.setPosition(this.necromancer.x, this.necromancer.y);
  }

  knightInteractions() {
    const knight = (this.scene as any).characters["knight"] as Knight;

    if (
      knight &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.range!.getBounds(),
        knight.range!.getBounds()
      )
    ) {
      const directionToMove = knight.knight!.x - this.necromancer!.x;
      if (directionToMove < 0) {
        this.necromancer!.setFlipX(true);
      } else if (directionToMove > 0) {
        this.necromancer!.setFlipX(false);
      }
      this.canIdle = true;
      this.attack();
    } else {
      this.walk(this.necromancer!.flipX ? -3 : 3);
    }

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

    if (
      knight &&
      this.skull &&
      this.skullHitbox &&
      knight.shieldHitbox &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.skullHitbox.getBounds(),
        knight.shieldHitbox.getBounds()
      )
    ) {
      this.destroySkull();
    }

    if (
      knight &&
      this.skull &&
      this.skullHitbox &&
      knight.hitbox &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.skullHitbox.getBounds(),
        knight.hitbox.getBounds()
      )
    ) {
      this.destroySkull();
      knight.death();
    }
  }

  update() {
    if (!this.necromancer || this.dead) return;

    this.updateHitboxePositions();
    this.updateSkullPosition();
    this.knightInteractions();

    if (this.canIdle) {
      this.idle();
    }
  }
}
