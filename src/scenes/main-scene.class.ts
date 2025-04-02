import {
  Archer,
  Background,
  Knight,
  Necromancer,
  Paladin,
  Ronin,
} from "../classes";
import {
  archer_constants,
  bullets_constants,
  knight_constants,
  necromancer_constants,
  paladin_constants,
  ronin_constants,
} from "../constants";
import { bg_manifest } from "../manifests";

interface CharacterConfig {
  name: string;
  classRef:
    | typeof Knight
    | typeof Archer
    | typeof Necromancer
    | typeof Paladin
    | typeof Ronin;
}

export class MainScene extends Phaser.Scene {
  private background!: Background;

  private characters: {
    [key: string]: Knight | Archer | Necromancer | Paladin | Ronin;
  } = {};

  constructor() {
    super("MainScene");
  }

  preload() {
    const loadSpritesheets = (
      constants: {
        spriteKey: string;
        spritePath: string;
        spriteConfiguration: Phaser.Types.Textures.SpriteSheetConfig;
      }[]
    ) => {
      constants.forEach((element) => {
        this.load.spritesheet(
          element.spriteKey,
          element.spritePath,
          element.spriteConfiguration
        );
      });
    };

    bullets_constants.forEach(
      (element: { spriteKey: string; spritePath: string }) => {
        this.load.image(element.spriteKey, element.spritePath);
      }
    );
    bg_manifest.forEach((element: { key: string; path: string }) => {
      this.load.image(element.key, element.path);
    });

    // Preload all character spritesheets
    loadSpritesheets(archer_constants);
    loadSpritesheets(necromancer_constants);
    loadSpritesheets(paladin_constants);
    loadSpritesheets(ronin_constants);
    loadSpritesheets(knight_constants);
  }

  create() {
    this.background = new Background(this);

    const characters: CharacterConfig[] = [
      // { name: "necromancer", classRef: Necromancer },
      // { name: "paladin", classRef: Paladin },
      // { name: "ronin", classRef: Ronin },
      { name: "archer", classRef: Archer },
      { name: "knight", classRef: Knight },
    ];

    this.background.init();

    characters.forEach((character) => {
      const characterInstance = new character.classRef(this);
      characterInstance.init();
      this.characters[character.name] = characterInstance;
    });
  }

  update() {
    Object.values(this.characters).forEach((character) => {
      character.update();
    });
  }
}
