import Phaser from "phaser";
import "./style.css";
import { MainScene } from "./scenes/main-scene.class";

const gameBody = document.getElementById("app");

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1800,
  height: 580,
  title: "Phaser RPG",
  scene: MainScene,
  url: import.meta.env.URL || "",
  version: import.meta.env.VERSION || "0.0.1",
  backgroundColor: "#fff",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
});

gameBody?.appendChild(game.canvas);
