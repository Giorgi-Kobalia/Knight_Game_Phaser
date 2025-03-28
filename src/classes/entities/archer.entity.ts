import Phaser from "phaser";
import { archer_constants } from "../../constants";
import { Knight } from "./knight.entity";

const ARCHER = archer_constants;

export class Archer {
  private scene: Phaser.Scene;
  private archer?: Phaser.GameObjects.Sprite;
  private arrows: Phaser.GameObjects.Sprite[] = [];
  private canIdle: boolean = true;
  private dead: boolean = false;
  private spawnPoint: number = 0;
  private velocityX: number = 2;
  private spawnOrientation: "left" | "right" = "right";

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
    this.velocityX = this.spawnOrientation === "left" ? -2 : 2;

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

    this.attack();
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

    const arrow = this.scene.add.sprite(
      this.archer.x,
      this.archer.y - 30,
      "Arrow"
    );
    arrow.scale = 3;
    arrow.setFlipX(direction);
    arrow.setData("velocity", direction ? -5 : 5);

    this.arrows.push(arrow);
  }

  updateArrows() {
    this.arrows.forEach((arrow) => {
      arrow.x += arrow.getData("velocity");
      if (arrow.x < 0 || arrow.x > this.scene.scale.width) {
        arrow.destroy();
      }
    });
  }

  playAnimation(key: string, loop: boolean = true) {
    if (!this.archer) return;
    this.archer.play(key, loop);
  }

  idle() {
    this.playAnimation("archer_idle");
  }

  special() {
    if (!this.archer) return;
    this.canIdle = false;
    this.playAnimation("archer_special");
  }

  attack() {
    if (!this.archer) return;
    this.canIdle = false;
    this.playAnimation("archer_attack");
  }

  death() {
    if (!this.archer || this.dead) return;
    this.canIdle = false;
    this.dead = true;
    this.playAnimation("archer_death");
  }

  walk() {
    if (!this.archer) return;

    this.canIdle = false;

    // Get the Knight object
    const knight = (this.scene as any).characters["knight"] as Knight;

    if (!knight || !knight.knight) return; // Ensure knight is valid

    // Check the position of the Knight relative to the Archer
    const directionToMove = knight.knight.x - this.archer.x;

    if (directionToMove < 0) {
      this.velocityX = -2;
      this.archer.setFlipX(true);
    } else if (directionToMove > 0) {
      this.velocityX = 2;
      this.archer.setFlipX(false);
    }

    this.playAnimation("archer_walk");
    this.archer.x += this.velocityX;
  }

  update() {
    this.updateArrows();

    if (!this.archer || this.dead) return;

    if (this.canIdle) {
      this.idle();
    }

    // Check if Archer collides with Knight
    const knight = (this.scene as any).characters["knight"] as Knight;

    if (
      knight &&
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.archer.getBounds(),
        knight.knight!.getBounds()
      )
    ) {
      // Collision detected
      this.velocityX = 0; // Stop moving
      this.canIdle = true; // Allow idle animation or other logic
    } else {
      // Continue moving towards the Knight based on its position
      this.walk(); // Move the Archer towards the Knight's position
    }
  }
}
