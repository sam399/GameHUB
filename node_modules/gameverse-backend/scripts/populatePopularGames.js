require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('../models/Game');

// 50 Most Popular Games with Complete Information
const popularGames = [
  {
    title: "The Witcher 3: Wild Hunt",
    description: "An open-world action RPG set in a visually stunning fantasy universe, full of meaningful choices and impactful consequences. As witcher Geralt of Rivia, you take on the greatest contract of your life - tracking down the Child of Prophecy, a living weapon that can alter the shape of the world.",
    genre: ["RPG", "Action", "Open World"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: new Date("2015-05-19"),
    rating: { average: 4.8, count: 12500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
      screenshots: []
    },
    price: 39.99,
    isFree: false,
    tags: ["Fantasy", "Open World", "Story Rich", "Magic", "Witcher"],
    featured: true,
    active: true
  },
  {
    title: "Red Dead Redemption 2",
    description: "America, 1899. The end of the Wild West era has begun. After a robbery goes badly wrong, Arthur Morgan and the Van der Linde gang are forced to flee. With federal agents and the best bounty hunters in the nation massing on their heels, the gang must rob, steal and fight their way across America.",
    genre: ["Action", "Adventure", "Open World"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Rockstar Studios",
    publisher: "Rockstar Games",
    releaseDate: new Date("2018-10-26"),
    rating: { average: 4.9, count: 15000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg",
      screenshots: []
    },
    price: 59.99,
    isFree: false,
    tags: ["Western", "Open World", "Story Rich", "Third Person"],
    featured: true,
    active: true
  },
  {
    title: "Elden Ring",
    description: "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. A vast world where open fields with a variety of situations and huge dungeons with complex and three-dimensional designs are seamlessly connected.",
    genre: ["RPG", "Action", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    releaseDate: new Date("2022-02-25"),
    rating: { average: 4.7, count: 18000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
      screenshots: []
    },
    price: 59.99,
    isFree: false,
    tags: ["Souls-like", "Open World", "Fantasy", "Difficult"],
    featured: true,
    active: true
  },
  {
    title: "Grand Theft Auto V",
    description: "When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the criminal underworld, they must pull off a series of dangerous heists to survive in a ruthless city.",
    genre: ["Action", "Adventure", "Open World"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Rockstar North",
    publisher: "Rockstar Games",
    releaseDate: new Date("2013-09-17"),
    rating: { average: 4.7, count: 25000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg",
      screenshots: []
    },
    price: 29.99,
    isFree: false,
    tags: ["Open World", "Crime", "Multiplayer", "Third Person"],
    featured: true,
    active: true
  },
  {
    title: "Cyberpunk 2077",
    description: "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification. You play as V, a mercenary outlaw going after a one-of-a-kind implant that is the key to immortality.",
    genre: ["RPG", "Action", "Open World"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: new Date("2020-12-10"),
    rating: { average: 4.2, count: 11000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2ld0.jpg",
      screenshots: []
    },
    price: 49.99,
    isFree: false,
    tags: ["Cyberpunk", "Sci-Fi", "Open World", "FPS"],
    featured: true,
    active: true
  },
  {
    title: "Baldur's Gate 3",
    description: "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power. Mysterious abilities are awakening inside you, drawn from a Mind Flayer parasite planted in your brain.",
    genre: ["RPG", "Strategy", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Larian Studios",
    publisher: "Larian Studios",
    releaseDate: new Date("2023-08-03"),
    rating: { average: 4.9, count: 14500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg",
      screenshots: []
    },
    price: 59.99,
    isFree: false,
    tags: ["D&D", "Turn-Based", "Story Rich", "Fantasy"],
    featured: true,
    active: true
  },
  {
    title: "The Last of Us Part I",
    description: "Experience the emotional storytelling and unforgettable characters in The Last of Us, winner of over 200 Game of the Year awards. In a ravaged civilization, where infected and hardened survivors run rampant, Joel, a weary protagonist, is hired to smuggle Ellie out of a hostile quarantine zone.",
    genre: ["Action", "Adventure", "Survival"],
    platforms: ["PC", "PlayStation"],
    developer: "Naughty Dog",
    publisher: "Sony Interactive Entertainment",
    releaseDate: new Date("2022-09-02"),
    rating: { average: 4.8, count: 9500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
      screenshots: []
    },
    price: 59.99,
    isFree: false,
    tags: ["Story Rich", "Zombies", "Post-Apocalyptic", "Third Person"],
    featured: true,
    active: true
  },
  {
    title: "God of War",
    description: "His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters. It is in this harsh, unforgiving world that he must fight to survive... and teach his son to do the same.",
    genre: ["Action", "Adventure"],
    platforms: ["PC", "PlayStation"],
    developer: "Santa Monica Studio",
    publisher: "Sony Interactive Entertainment",
    releaseDate: new Date("2018-04-20"),
    rating: { average: 4.9, count: 13000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg",
      screenshots: []
    },
    price: 49.99,
    isFree: false,
    tags: ["Norse Mythology", "Story Rich", "Third Person", "Action"],
    featured: true,
    active: true
  },
  {
    title: "Horizon Zero Dawn",
    description: "Experience Aloy's legendary quest to unravel the mysteries of a future Earth ruled by Machines. Use devastating tactical attacks against your prey and explore a majestic open world in this award-winning action RPG.",
    genre: ["Action", "RPG", "Adventure"],
    platforms: ["PC", "PlayStation"],
    developer: "Guerrilla Games",
    publisher: "Sony Interactive Entertainment",
    releaseDate: new Date("2017-02-28"),
    rating: { average: 4.6, count: 10500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2135.jpg",
      screenshots: []
    },
    price: 49.99,
    isFree: false,
    tags: ["Open World", "Post-Apocalyptic", "Robots", "Female Protagonist"],
    featured: true,
    active: true
  },
  {
    title: "Minecraft",
    description: "Explore randomly generated worlds and build amazing things from the simplest of homes to the grandest of castles. Play in creative mode with unlimited resources or mine deep into the world in survival mode, crafting weapons and armor to fend off dangerous mobs.",
    genre: ["Sandbox", "Survival", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    developer: "Mojang Studios",
    publisher: "Microsoft",
    releaseDate: new Date("2011-11-18"),
    rating: { average: 4.5, count: 30000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg",
      screenshots: []
    },
    price: 26.95,
    isFree: false,
    tags: ["Sandbox", "Crafting", "Building", "Multiplayer"],
    featured: true,
    active: true
  },
  {
    title: "Counter-Strike 2",
    description: "For over two decades, Counter-Strike has offered an elite competitive experience, one shaped by millions of players from across the globe. And now the next chapter in the CS story is about to begin. This is Counter-Strike 2.",
    genre: ["FPS", "Action", "Multiplayer"],
    platforms: ["PC"],
    developer: "Valve",
    publisher: "Valve",
    releaseDate: new Date("2023-09-27"),
    rating: { average: 4.4, count: 22000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6yks.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["Competitive", "FPS", "Tactical", "Team-Based"],
    featured: true,
    active: true
  },
  {
    title: "Valorant",
    description: "Blend your style and experience on a global, competitive stage. You have 13 rounds to attack and defend your side using sharp gunplay and tactical abilities. With one life per round, you'll need to think faster than your opponent if you want to survive.",
    genre: ["FPS", "Action", "Multiplayer"],
    platforms: ["PC"],
    developer: "Riot Games",
    publisher: "Riot Games",
    releaseDate: new Date("2020-06-02"),
    rating: { average: 4.3, count: 18500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["Competitive", "FPS", "Tactical", "Hero Shooter"],
    featured: true,
    active: true
  },
  {
    title: "League of Legends",
    description: "Join forces with your friends and take on the world in the ultimate team strategy game. Choose your champion from over 160 unique characters, master your role, and dominate the enemy team.",
    genre: ["MOBA", "Strategy", "Multiplayer"],
    platforms: ["PC"],
    developer: "Riot Games",
    publisher: "Riot Games",
    releaseDate: new Date("2009-10-27"),
    rating: { average: 4.2, count: 28000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49wl.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["MOBA", "Competitive", "Team-Based", "Strategy"],
    featured: true,
    active: true
  },
  {
    title: "Dota 2",
    description: "Every day, millions of players worldwide enter battle as one of over a hundred Dota heroes. And no matter if it's their 10th hour of play or 1,000th, there's always something new to discover.",
    genre: ["MOBA", "Strategy", "Multiplayer"],
    platforms: ["PC"],
    developer: "Valve",
    publisher: "Valve",
    releaseDate: new Date("2013-07-09"),
    rating: { average: 4.3, count: 19000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyv.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["MOBA", "Competitive", "Strategy", "Team-Based"],
    featured: true,
    active: true
  },
  {
    title: "Fortnite",
    description: "Create, play, and battle with friends for free in Fortnite. Be the last player standing in Battle Royale and Zero Build, experience a concert or live event, or discover over a million creator made games.",
    genre: ["Battle Royale", "Action", "Multiplayer"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    developer: "Epic Games",
    publisher: "Epic Games",
    releaseDate: new Date("2017-07-25"),
    rating: { average: 4.0, count: 24000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5q7d.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["Battle Royale", "Building", "Third Person", "Multiplayer"],
    featured: true,
    active: true
  },
  {
    title: "Apex Legends",
    description: "Conquer with character in Apex Legends, a free-to-play battle royale game where legendary challengers fight for glory, fame, and fortune on the fringes of the Frontier.",
    genre: ["Battle Royale", "FPS", "Action"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "Respawn Entertainment",
    publisher: "Electronic Arts",
    releaseDate: new Date("2019-02-04"),
    rating: { average: 4.3, count: 16000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3935.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["Battle Royale", "FPS", "Hero Shooter", "Team-Based"],
    featured: true,
    active: true
  },
  {
    title: "Overwatch 2",
    description: "Overwatch 2 is a free-to-play, team-based action game set in the optimistic future, where every match is the ultimate 5v5 battlefield brawl. Play as a time-jumping freedom fighter, a beat-dropping battlefield DJ, or one of over 30 other unique heroes.",
    genre: ["FPS", "Action", "Multiplayer"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "Blizzard Entertainment",
    publisher: "Blizzard Entertainment",
    releaseDate: new Date("2022-10-04"),
    rating: { average: 3.9, count: 12000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5lmb.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["Hero Shooter", "FPS", "Team-Based", "Competitive"],
    featured: true,
    active: true
  },
  {
    title: "Dark Souls III",
    description: "Dark Souls continues to push the boundaries with the latest, ambitious chapter in the critically-acclaimed and genre-defining series. As fires fade and the world falls into ruin, journey into a universe filled with more colossal enemies and environments.",
    genre: ["RPG", "Action", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    releaseDate: new Date("2016-04-12"),
    rating: { average: 4.7, count: 14000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wz4.jpg",
      screenshots: []
    },
    price: 59.99,
    isFree: false,
    tags: ["Souls-like", "Dark Fantasy", "Difficult", "Third Person"],
    featured: true,
    active: true
  },
  {
    title: "Sekiro: Shadows Die Twice",
    description: "Carve your own clever path to vengeance in this critically-acclaimed adventure from developer FromSoftware. Take revenge. Restore your honor. Kill ingeniously.",
    genre: ["Action", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "FromSoftware",
    publisher: "Activision",
    releaseDate: new Date("2019-03-22"),
    rating: { average: 4.8, count: 11500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1ibi.jpg",
      screenshots: []
    },
    price: 59.99,
    isFree: false,
    tags: ["Souls-like", "Samurai", "Difficult", "Third Person"],
    featured: true,
    active: true
  },
  {
    title: "Stardew Valley",
    description: "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life. Can you learn to live off the land and turn these overgrown fields into a thriving home?",
    genre: ["Simulation", "RPG", "Indie"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    developer: "ConcernedApe",
    publisher: "ConcernedApe",
    releaseDate: new Date("2016-02-26"),
    rating: { average: 4.8, count: 22000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5p.jpg",
      screenshots: []
    },
    price: 14.99,
    isFree: false,
    tags: ["Farming", "Relaxing", "Pixel Art", "Indie"],
    featured: true,
    active: true
  },
  {
    title: "Hades",
    description: "Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion, Transistor, and Pyre.",
    genre: ["Action", "RPG", "Indie"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "Supergiant Games",
    publisher: "Supergiant Games",
    releaseDate: new Date("2020-09-17"),
    rating: { average: 4.9, count: 18500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2i7u.jpg",
      screenshots: []
    },
    price: 24.99,
    isFree: false,
    tags: ["Roguelike", "Greek Mythology", "Indie", "Action"],
    featured: true,
    active: true
  },
  {
    title: "Terraria",
    description: "Dig, fight, explore, build! Nothing is impossible in this action-packed adventure game. The world is your canvas and the ground itself is your paint.",
    genre: ["Sandbox", "Action", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    developer: "Re-Logic",
    publisher: "Re-Logic",
    releaseDate: new Date("2011-05-16"),
    rating: { average: 4.7, count: 26000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3pb5.jpg",
      screenshots: []
    },
    price: 9.99,
    isFree: false,
    tags: ["Sandbox", "2D", "Building", "Multiplayer"],
    featured: true,
    active: true
  },
  {
    title: "Hollow Knight",
    description: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a classic, hand-drawn 2D style.",
    genre: ["Action", "Adventure", "Indie"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "Team Cherry",
    publisher: "Team Cherry",
    releaseDate: new Date("2017-02-24"),
    rating: { average: 4.8, count: 19500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg",
      screenshots: []
    },
    price: 14.99,
    isFree: false,
    tags: ["Metroidvania", "2D", "Indie", "Difficult"],
    featured: true,
    active: true
  },
  {
    title: "Celeste",
    description: "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight, hand-crafted platformer from the creators of TowerFall.",
    genre: ["Platformer", "Indie", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "Maddy Makes Games",
    publisher: "Maddy Makes Games",
    releaseDate: new Date("2018-01-25"),
    rating: { average: 4.8, count: 15500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tu8.jpg",
      screenshots: []
    },
    price: 19.99,
    isFree: false,
    tags: ["Platformer", "Pixel Art", "Story Rich", "Difficult"],
    featured: true,
    active: true
  },
  {
    title: "Portal 2",
    description: "The sequel to the acclaimed Portal, Portal 2 pits the player against more intricate test chambers and introduces a new cast of dynamic characters. This game is the follow-up to the title named 'Game of the Year' 2007 by over 30 publications.",
    genre: ["Puzzle", "Action", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Valve",
    publisher: "Valve",
    releaseDate: new Date("2011-04-19"),
    rating: { average: 4.9, count: 20000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rs4.jpg",
      screenshots: []
    },
    price: 9.99,
    isFree: false,
    tags: ["Puzzle", "Sci-Fi", "Co-op", "First Person"],
    featured: true,
    active: true
  },
  {
    title: "Half-Life: Alyx",
    description: "Half-Life: Alyx is Valve's VR return to the Half-Life series. It's the story of an impossible fight against a vicious alien race known as the Combine, set between the events of Half-Life and Half-Life 2.",
    genre: ["Action", "Adventure", "VR"],
    platforms: ["PC"],
    developer: "Valve",
    publisher: "Valve",
    releaseDate: new Date("2020-03-23"),
    rating: { average: 4.9, count: 8500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1u7j.jpg",
      screenshots: []
    },
    price: 59.99,
    isFree: false,
    tags: ["VR", "FPS", "Sci-Fi", "Story Rich"],
    featured: true,
    active: true
  },
  {
    title: "Destiny 2",
    description: "Dive into the world of Destiny 2 to experience responsive first-person shooter combat, explore the mysteries of our solar system, and unleash elemental abilities against powerful enemies.",
    genre: ["FPS", "Action", "MMO"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Bungie",
    publisher: "Bungie",
    releaseDate: new Date("2017-09-06"),
    rating: { average: 4.1, count: 17000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5w09.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["Looter Shooter", "MMO", "Co-op", "Sci-Fi"],
    featured: true,
    active: true
  },
  {
    title: "Warframe",
    description: "Awaken as an unstoppable warrior and battle alongside your friends in this story-driven free-to-play online action game. Confront overwhelming odds with powerful weapons and devastating melee attacks.",
    genre: ["Action", "FPS", "MMO"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "Digital Extremes",
    publisher: "Digital Extremes",
    releaseDate: new Date("2013-03-25"),
    rating: { average: 4.3, count: 14500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5w3w.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["Looter Shooter", "Co-op", "Sci-Fi", "Third Person"],
    featured: true,
    active: true
  },
  {
    title: "Monster Hunter: World",
    description: "Welcome to a new world! Take on the role of a hunter and slay ferocious monsters in a living, breathing ecosystem where you can use the landscape and its diverse inhabitants to get the upper hand.",
    genre: ["Action", "RPG", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Capcom",
    publisher: "Capcom",
    releaseDate: new Date("2018-01-26"),
    rating: { average: 4.6, count: 13500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1uyb.jpg",
      screenshots: []
    },
    price: 29.99,
    isFree: false,
    tags: ["Co-op", "Hunting", "Third Person", "Multiplayer"],
    featured: true,
    active: true
  },
  {
    title: "Final Fantasy XIV Online",
    description: "Take part in an epic and ever-changing FINAL FANTASY adventure as you explore and discover a vast world. Join up with friends from around the world to tackle challenging dungeons and trials.",
    genre: ["MMORPG", "RPG", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Square Enix",
    publisher: "Square Enix",
    releaseDate: new Date("2013-08-27"),
    rating: { average: 4.7, count: 16500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3w5k.jpg",
      screenshots: []
    },
    price: 19.99,
    isFree: false,
    tags: ["MMORPG", "Fantasy", "Story Rich", "Co-op"],
    featured: true,
    active: true
  },
  {
    title: "World of Warcraft",
    description: "Experience the epic adventure of the world's most popular MMORPG. Join millions of players and embark on a journey through a vast, magical world full of endless adventure and excitement.",
    genre: ["MMORPG", "RPG", "Adventure"],
    platforms: ["PC"],
    developer: "Blizzard Entertainment",
    publisher: "Blizzard Entertainment",
    releaseDate: new Date("2004-11-23"),
    rating: { average: 4.5, count: 28000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6wq4.jpg",
      screenshots: []
    },
    price: 14.99,
    isFree: false,
    tags: ["MMORPG", "Fantasy", "PvP", "PvE"],
    featured: true,
    active: true
  },
  {
    title: "Rocket League",
    description: "Rocket League is a high-powered hybrid of arcade-style soccer and vehicular mayhem with easy-to-understand controls and fluid, physics-driven competition.",
    genre: ["Sports", "Racing", "Multiplayer"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "Psyonix",
    publisher: "Psyonix",
    releaseDate: new Date("2015-07-07"),
    rating: { average: 4.4, count: 19500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5w35.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["Sports", "Soccer", "Competitive", "Multiplayer"],
    featured: true,
    active: true
  },
  {
    title: "Fall Guys",
    description: "Stumble through a series of hilarious challenges! Dive into a colorful chaos-filled online competition where you'll face bizarre obstacles, push through unruly competitors, and overcome the laws of physics.",
    genre: ["Battle Royale", "Platformer", "Multiplayer"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "Mediatonic",
    publisher: "Epic Games",
    releaseDate: new Date("2020-08-04"),
    rating: { average: 4.0, count: 12500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2n3u.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["Battle Royale", "Party Game", "Casual", "Funny"],
    featured: true,
    active: true
  },
  {
    title: "Among Us",
    description: "Play online or over local WiFi with 4-15 players as you attempt to prep your spaceship for departure, but beware as one will be an impostor bent on killing everyone!",
    genre: ["Social Deduction", "Multiplayer", "Casual"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    developer: "InnerSloth",
    publisher: "InnerSloth",
    releaseDate: new Date("2018-11-16"),
    rating: { average: 3.9, count: 15500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2fch.jpg",
      screenshots: []
    },
    price: 4.99,
    isFree: false,
    tags: ["Social Deduction", "Party Game", "Online", "Casual"],
    featured: true,
    active: true
  },
  {
    title: "Path of Exile",
    description: "You are an Exile, struggling to survive on the dark continent of Wraeclast, as you fight to earn power that will allow you to exact your revenge against those who wronged you. Path of Exile is an online Action RPG.",
    genre: ["Action", "RPG", "Multiplayer"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Grinding Gear Games",
    publisher: "Grinding Gear Games",
    releaseDate: new Date("2013-10-23"),
    rating: { average: 4.4, count: 11000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x26.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["ARPG", "Looter", "Dark Fantasy", "Online"],
    featured: true,
    active: true
  },
  {
    title: "Genshin Impact",
    description: "Step into Teyvat, a vast world teeming with life and flowing with elemental energy. You and your sibling arrived here from another world. Separated by an unknown god, stripped of your powers, and cast into a deep slumber, you now awake to a world very different.",
    genre: ["Action", "RPG", "Adventure"],
    platforms: ["PC", "PlayStation", "Mobile"],
    developer: "miHoYo",
    publisher: "miHoYo",
    releaseDate: new Date("2020-09-28"),
    rating: { average: 4.2, count: 21000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2neb.jpg",
      screenshots: []
    },
    price: 0,
    isFree: true,
    tags: ["Open World", "Gacha", "Anime", "Co-op"],
    featured: true,
    active: true
  },
  {
    title: "Resident Evil Village",
    description: "Experience survival horror like never before in the eighth major installment in the Resident Evil franchise - Resident Evil Village. With detailed graphics, intense first-person action and masterful storytelling.",
    genre: ["Horror", "Action", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Capcom",
    publisher: "Capcom",
    releaseDate: new Date("2021-05-07"),
    rating: { average: 4.6, count: 12500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lc7.jpg",
      screenshots: []
    },
    price: 39.99,
    isFree: false,
    tags: ["Horror", "Survival", "First Person", "Vampires"],
    featured: true,
    active: true
  },
  {
    title: "Death Stranding",
    description: "From legendary game creator Hideo Kojima comes an all-new, genre-defying experience. Sam Bridges must brave a world utterly transformed by the Death Stranding. Carrying the disconnected remnants of our future in his hands, he embarks on a journey to reconnect the shattered world.",
    genre: ["Action", "Adventure", "Open World"],
    platforms: ["PC", "PlayStation"],
    developer: "Kojima Productions",
    publisher: "505 Games",
    releaseDate: new Date("2019-11-08"),
    rating: { average: 4.3, count: 9500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1w8y.jpg",
      screenshots: []
    },
    price: 39.99,
    isFree: false,
    tags: ["Story Rich", "Open World", "Kojima", "Sci-Fi"],
    featured: true,
    active: true
  },
  {
    title: "Dishonored 2",
    description: "Reprise your role as a supernatural assassin in Dishonored 2. Play your way in a world where mysticism and industry collide. Will you choose to play as Empress Emily Kaldwin or the royal protector, Corvo Attano?",
    genre: ["Action", "Stealth", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Arkane Studios",
    publisher: "Bethesda Softworks",
    releaseDate: new Date("2016-11-11"),
    rating: { average: 4.6, count: 10500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wso.jpg",
      screenshots: []
    },
    price: 39.99,
    isFree: false,
    tags: ["Stealth", "First Person", "Story Rich", "Steampunk"],
    featured: true,
    active: true
  },
  {
    title: "Control",
    description: "After a secretive agency in New York is invaded by an otherworldly threat, you become the new Director struggling to regain Control. This supernatural 3rd person action-adventure will challenge you to master the combination of supernatural abilities, modifiable loadouts and reactive environments.",
    genre: ["Action", "Adventure", "Sci-Fi"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Remedy Entertainment",
    publisher: "505 Games",
    releaseDate: new Date("2019-08-27"),
    rating: { average: 4.5, count: 11500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1ioj.jpg",
      screenshots: []
    },
    price: 39.99,
    isFree: false,
    tags: ["Supernatural", "Third Person", "Story Rich", "Sci-Fi"],
    featured: true,
    active: true
  },
  {
    title: "Mass Effect Legendary Edition",
    description: "One person is all that stands between humanity and the greatest threat it's ever faced. Relive the legend of Commander Shepard in the highly acclaimed Mass Effect trilogy with the Mass Effect Legendary Edition.",
    genre: ["RPG", "Action", "Sci-Fi"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "BioWare",
    publisher: "Electronic Arts",
    releaseDate: new Date("2021-05-14"),
    rating: { average: 4.8, count: 14500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2ock.jpg",
      screenshots: []
    },
    price: 59.99,
    isFree: false,
    tags: ["Story Rich", "Sci-Fi", "RPG", "Space"],
    featured: true,
    active: true
  },
  {
    title: "Spider-Man Remastered",
    description: "In this new Spider-Man universe, iconic characters from Peter and Miles' lives have been reimagined, placing familiar characters in unique roles. The game features the acrobatic abilities, improvisation and web-slinging that the wall-crawler is famous for.",
    genre: ["Action", "Adventure", "Open World"],
    platforms: ["PC", "PlayStation"],
    developer: "Insomniac Games",
    publisher: "Sony Interactive Entertainment",
    releaseDate: new Date("2022-08-12"),
    rating: { average: 4.8, count: 16500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmf.jpg",
      screenshots: []
    },
    price: 59.99,
    isFree: false,
    tags: ["Superhero", "Open World", "Story Rich", "Third Person"],
    featured: true,
    active: true
  },
  {
    title: "It Takes Two",
    description: "Embark on the craziest journey of your life in It Takes Two, a genre-bending platform adventure created purely for co-op. Invite a friend to join for free with Friend's Pass and work together across a huge variety of gleefully disruptive gameplay challenges.",
    genre: ["Adventure", "Platformer", "Co-op"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "Hazelight Studios",
    publisher: "Electronic Arts",
    releaseDate: new Date("2021-03-26"),
    rating: { average: 4.9, count: 13500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2n1p.jpg",
      screenshots: []
    },
    price: 39.99,
    isFree: false,
    tags: ["Co-op", "Platformer", "Story Rich", "Puzzle"],
    featured: true,
    active: true
  },
  {
    title: "Halo: The Master Chief Collection",
    description: "Halo: The Master Chief Collection includes the complete story of the Master Chief on one console for the first time ever - Halo: Combat Evolved Anniversary, Halo 2: Anniversary, Halo 3, and Halo 4.",
    genre: ["FPS", "Action", "Sci-Fi"],
    platforms: ["PC", "Xbox"],
    developer: "343 Industries",
    publisher: "Xbox Game Studios",
    releaseDate: new Date("2014-11-11"),
    rating: { average: 4.7, count: 18000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wkr.jpg",
      screenshots: []
    },
    price: 39.99,
    isFree: false,
    tags: ["FPS", "Sci-Fi", "Multiplayer", "Story Rich"],
    featured: true,
    active: true
  },
  {
    title: "Doom Eternal",
    description: "Hell's armies have invaded Earth. Become the Slayer in an epic single-player campaign to conquer demons across dimensions and stop the final destruction of humanity. Experience the ultimate combination of speed and power in DOOM Eternal.",
    genre: ["FPS", "Action"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "id Software",
    publisher: "Bethesda Softworks",
    releaseDate: new Date("2020-03-20"),
    rating: { average: 4.7, count: 15500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1va8.jpg",
      screenshots: []
    },
    price: 39.99,
    isFree: false,
    tags: ["FPS", "Fast-Paced", "Demons", "Gore"],
    featured: true,
    active: true
  },
  {
    title: "Sea of Thieves",
    description: "Sea of Thieves offers the essential pirate experience, from sailing and fighting to exploring and looting – everything you need to live the pirate life and become a legend in your own right.",
    genre: ["Adventure", "Action", "Multiplayer"],
    platforms: ["PC", "Xbox"],
    developer: "Rare",
    publisher: "Xbox Game Studios",
    releaseDate: new Date("2018-03-20"),
    rating: { average: 4.3, count: 13000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co20a4.jpg",
      screenshots: []
    },
    price: 39.99,
    isFree: false,
    tags: ["Pirates", "Co-op", "Open World", "Multiplayer"],
    featured: true,
    active: true
  },
  {
    title: "No Man's Sky",
    description: "Inspired by the adventure and imagination that we love from classic science-fiction, No Man's Sky presents you with a galaxy to explore, filled with unique planets and lifeforms, and constant danger and action.",
    genre: ["Adventure", "Survival", "Open World"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "Hello Games",
    publisher: "Hello Games",
    releaseDate: new Date("2016-08-09"),
    rating: { average: 4.2, count: 12500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3vg7.jpg",
      screenshots: []
    },
    price: 29.99,
    isFree: false,
    tags: ["Space", "Exploration", "Procedural", "Survival"],
    featured: true,
    active: true
  },
  {
    title: "Subnautica",
    description: "Descend into the depths of an alien underwater world filled with wonder and peril. Craft equipment, pilot submarines and out-smart wildlife to explore lush coral reefs, volcanoes, cave systems, and more - all while trying to survive.",
    genre: ["Survival", "Adventure", "Open World"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    developer: "Unknown Worlds Entertainment",
    publisher: "Unknown Worlds Entertainment",
    releaseDate: new Date("2018-01-23"),
    rating: { average: 4.7, count: 17500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1icp.jpg",
      screenshots: []
    },
    price: 29.99,
    isFree: false,
    tags: ["Underwater", "Survival", "Exploration", "Crafting"],
    featured: true,
    active: true
  },
  {
    title: "Dead by Daylight",
    description: "Dead by Daylight is a multiplayer action horror game where one player takes on the role of a brutal Killer and the other four play as Survivors. As a Killer, your goal is to sacrifice as many Survivors as possible. As a Survivor, your goal is to escape and avoid being caught.",
    genre: ["Horror", "Multiplayer", "Survival"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    developer: "Behaviour Interactive",
    publisher: "Behaviour Interactive",
    releaseDate: new Date("2016-06-14"),
    rating: { average: 4.1, count: 16500 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2jcb.jpg",
      screenshots: []
    },
    price: 19.99,
    isFree: false,
    tags: ["Horror", "Asymmetric", "Multiplayer", "Survival"],
    featured: true,
    active: true
  }
];

async function populateGames() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    console.log('🗑️  Clearing existing games...');
    
    // Clear existing games
    const deleteResult = await Game.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing games`);
    
    console.log('📝 Inserting 50 popular games...');
    
    // Insert new games
    const insertedGames = await Game.insertMany(popularGames);
    
    console.log(`✅ Successfully inserted ${insertedGames.length} games!`);
    
    // Display some statistics
    const totalGames = await Game.countDocuments();
    const freeGames = await Game.countDocuments({ isFree: true });
    const paidGames = await Game.countDocuments({ isFree: false });
    const featuredGames = await Game.countDocuments({ featured: true });
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Total Games: ${totalGames}`);
    console.log(`   Free Games: ${freeGames}`);
    console.log(`   Paid Games: ${paidGames}`);
    console.log(`   Featured Games: ${featuredGames}`);
    
    // Display genre distribution
    const genres = {};
    insertedGames.forEach(game => {
      game.genre.forEach(g => {
        genres[g] = (genres[g] || 0) + 1;
      });
    });
    
    console.log('\n🎮 Genre Distribution:');
    Object.entries(genres)
      .sort((a, b) => b[1] - a[1])
      .forEach(([genre, count]) => {
        console.log(`   ${genre}: ${count} games`);
      });
    
    console.log('\n🎉 Game library populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating games:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
populateGames();
