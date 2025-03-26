export const knight_constants = [
  {
    spriteKey: "Knight_Idle",
    spritePath: "./img/Knight/Knight_Idle.png",
    spriteConfiguration: {
      frameWidth: 64,
      frameHeight: 64,
    },
    animationKey: "idle",
    animConfiguration: {
      start: 0,
      end: 12,
    },
    frameRate: 12,
    repeat: -1,
  },
  {
    spriteKey: "Knight_Walk",
    spritePath: "./img/Knight/Knight_Walk.png",
    spriteConfiguration: {
      frameWidth: 96,
      frameHeight: 64,
    },
    animationKey: "walk",
    animConfiguration: {
      start: 0,
      end: 7,
    },
    frameRate: 7,
    repeat: -1,
  },
  {
    spriteKey: "Knight_Attack",
    spritePath: "./img/Knight/Knight_Attack.png",
    spriteConfiguration: {
      frameWidth: 144,
      frameHeight: 64,
    },
    animationKey: "attack",
    animConfiguration: {
      start: 0,
      end: 21,
    },
    frameRate: 21,
    repeat: 1,
  },
  {
    spriteKey: "Knight_Death",
    spritePath: "./img/Knight/Knight_Death.png",
    spriteConfiguration: {
      frameWidth: 96,
      frameHeight: 64,
    },
    animationKey: "death",
    animConfiguration: {
      start: 0,
      end: 14,
    },
    frameRate: 14,
    repeat: 1,
  },
  {
    spriteKey: "Knight_Shield",
    spritePath: "./img/Knight/Knight_Shield.png",
    spriteConfiguration: {
      frameWidth: 96,
      frameHeight: 64,
    },
    animationKey: "shield",
    animConfiguration: {
      start: 0,
      end: 6,
    },
    frameRate: 12,
    repeat: 1,
  },
];
