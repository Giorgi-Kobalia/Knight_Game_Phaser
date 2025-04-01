import Phaser from "phaser";
import "./style.css";
import { MainScene } from "./scenes/main-scene.class";

const gameBody = document.getElementById("app");

const game = new Phaser.Game({
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
      debug: true, // Enable debug mode}
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
  },
});

gameBody?.appendChild(game.canvas);
