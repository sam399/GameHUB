require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Game = require('../models/Game');
const Activity = require('../models/Activity');
const Review = require('../models/Review');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const sampleGames = [
  {
    title: "The Legend of Zelda: Breath of the Wild",
    description: "Step into a world of discovery, exploration, and adventure in The Legend of Zelda: Breath of the Wild. Travel across vast fields, through forests, and to mountain peaks as you discover what has become of the kingdom of Hyrule.",
    genre: ["Action", "Adventure", "RPG"],
    platforms: ["Nintendo Switch", "Wii U"],
    developer: "Nintendo EPD",
    publisher: "Nintendo",
    releaseDate: new Date("2017-03-03"),
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7v.jpg",
      screenshots: ["https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc3zg1.jpg"]
    },
    tags: ["Open World", "Fantasy", "Exploration"]
  },
  {
    title: "Elden Ring",
    description: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
    genre: ["Action", "RPG", "Adventure"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X|S", "Xbox One"],
    developer: "FromSoftware",
    publisher: "Bandai Namco Entertainment",
    releaseDate: new Date("2022-02-25"),
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
      screenshots: ["https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8xk1.jpg"]
    },
    tags: ["Souls-like", "Dark Fantasy", "Challenging"]
  },
  {
    title: "God of War Ragnarök",
    description: "Kratos and Atreus embark on a mythic journey for answers before Ragnarök arrives – all while hostile Asgardian forces assemble.",
    genre: ["Action", "Adventure"],
    platforms: ["PlayStation 5", "PlayStation 4"],
    developer: "Santa Monica Studio",
    publisher: "Sony Interactive Entertainment",
    releaseDate: new Date("2022-11-09"),
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg",
      screenshots: ["https://images.igdb.com/igdb/image/upload/t_screenshot_big/scfhbq.jpg"]
    },
    tags: ["Norse Mythology", "Story Rich", "Combat"]
  },
  {
    title: "Cyberpunk 2077",
    description: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City — a dangerous megalopolis obsessed with power, glamor, and ceaseless body modification.",
    genre: ["RPG", "Action", "Adventure"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X|S", "Xbox One"],
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: new Date("2020-12-10"),
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1w7a.jpg",
      screenshots: ["https://images.igdb.com/igdb/image/upload/t_screenshot_big/scmhfj.jpg"]
    },
    tags: ["Cyberpunk", "Open World", "Futuristic"]
  },
  {
    title: "Red Dead Redemption 2",
    description: "America, 1899. The end of the Wild West era has begun. After a robbery goes badly wrong, Arthur Morgan and the Van der Linde gang are forced to flee.",
    genre: ["Action", "Adventure"],
    platforms: ["PC", "PlayStation 4", "Xbox One"],
    developer: "Rockstar Studios",
    publisher: "Rockstar Games",
    releaseDate: new Date("2018-10-26"),
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg",
      screenshots: ["https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6zvy.jpg"]
    },
    tags: ["Western", "Story Rich", "Open World"]
  },
  {
    title: "The Witcher 3: Wild Hunt",
    description: "As war rages on throughout the Northern Realms, you take on the greatest contract of your life — tracking down the Child of Prophecy, a living weapon that can alter the shape of the world.",
    genre: ["RPG", "Action", "Adventure"],
    platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X|S", "Xbox One", "Nintendo Switch"],
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: new Date("2015-05-19"),
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
      screenshots: ["https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6zve.jpg"]
    },
    tags: ["Fantasy", "Open World", "Story Rich"]
  },
  {
    title: "Baldur's Gate 3",
    description: "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.",
    genre: ["RPG", "Strategy", "Adventure"],
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
    developer: "Larian Studios",
    publisher: "Larian Studios",
    releaseDate: new Date("2023-08-03"),
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5w2p.jpg",
      screenshots: ["https://images.igdb.com/igdb/image/upload/t_screenshot_big/sckbxh.jpg"]
    },
    tags: ["D&D", "Turn-Based", "Party-Based"]
  },
  {
    title: "Hollow Knight",
    description: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs.",
    genre: ["Action", "Adventure", "Platformer"],
    platforms: ["PC", "PlayStation 4", "Xbox One", "Nintendo Switch"],
    developer: "Team Cherry",
    publisher: "Team Cherry",
    releaseDate: new Date("2017-02-24"),
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg",
      screenshots: ["https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6z94.jpg"]
    },
    tags: ["Metroidvania", "Indie", "Challenging"]
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔄 Starting database seeding...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Activity.deleteMany({});
    await Review.deleteMany({});
    await Game.deleteMany({});
    
    // Find or create test users
    let users = await User.find().limit(5);
    
    if (users.length === 0) {
      console.log('👤 Creating sample users...');
      const sampleUsers = [
        {
          username: 'gamer1',
          email: 'gamer1@example.com',
          password: 'password123',
          profile: {
            bio: 'Love RPGs and adventure games!',
            avatar: 'https://i.pravatar.cc/150?img=1'
          }
        },
        {
          username: 'gamer2',
          email: 'gamer2@example.com',
          password: 'password123',
          profile: {
            bio: 'Competitive FPS player',
            avatar: 'https://i.pravatar.cc/150?img=2'
          }
        },
        {
          username: 'gamer3',
          email: 'gamer3@example.com',
          password: 'password123',
          profile: {
            bio: 'Indie game enthusiast',
            avatar: 'https://i.pravatar.cc/150?img=3'
          }
        },
        {
          username: 'gamer4',
          email: 'gamer4@example.com',
          password: 'password123',
          profile: {
            bio: 'Retro gaming collector',
            avatar: 'https://i.pravatar.cc/150?img=4'
          }
        },
        {
          username: 'gamer5',
          email: 'gamer5@example.com',
          password: 'password123',
          profile: {
            bio: 'Strategy game master',
            avatar: 'https://i.pravatar.cc/150?img=5'
          }
        }
      ];

      users = await User.create(sampleUsers);
      console.log(`✅ Created ${users.length} users`);
    } else {
      console.log(`✅ Using ${users.length} existing users`);
    }

    // Create games
    console.log('🎮 Creating games...');
    const games = await Game.create(sampleGames);
    console.log(`✅ Created ${games.length} games`);

    // Create reviews
    console.log('⭐ Creating reviews...');
    const reviews = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const numReviews = Math.floor(Math.random() * 3) + 1; // 1-3 reviews per game

      for (let j = 0; j < numReviews && j < users.length; j++) {
        const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
        const reviewTitles = [
          "Absolutely Amazing!",
          "A Masterpiece",
          "Highly Recommended",
          "Incredible Experience",
          "Must Play Game"
        ];
        const reviewContents = [
          "This game exceeded all my expectations. The story is engaging and the gameplay is smooth.",
          "One of the best games I've played in years. The graphics are stunning and the mechanics are perfect.",
          "I couldn't put this game down! Every moment was exciting and memorable.",
          "A true gem that every gamer should experience. The attention to detail is remarkable.",
          "From start to finish, this game delivers an unforgettable adventure."
        ];

        const review = await Review.create({
          user: users[j]._id,
          game: game._id,
          rating: rating,
          title: reviewTitles[Math.floor(Math.random() * reviewTitles.length)],
          content: reviewContents[Math.floor(Math.random() * reviewContents.length)]
        });
        reviews.push(review);

        // Update game rating
        const allReviews = await Review.find({ game: game._id });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await Game.findByIdAndUpdate(game._id, {
          'rating.average': avgRating,
          'rating.count': allReviews.length
        });
      }
    }
    console.log(`✅ Created ${reviews.length} reviews`);

    // Create activities
    console.log('📊 Creating activities...');
    const activities = [];

    // Achievement activities
    for (let i = 0; i < 5; i++) {
      const user = users[i % users.length];
      const game = games[i % games.length];
      const achievements = ['First Steps', 'Master Explorer', 'Legend', 'Completionist', 'Speed Runner'];
      
      activities.push({
        user: user._id,
        type: 'ACHIEVEMENT_UNLOCKED',
        data: {
          gameId: game._id,
          gameName: game.title,
          achievementName: achievements[i]
        },
        visibility: 'PUBLIC'
      });
    }

    // Game reviewed activities (from actual reviews)
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      const game = games.find(g => g._id.equals(review.game));
      
      activities.push({
        user: review.user,
        type: 'GAME_REVIEWED',
        data: {
          gameId: game._id,
          gameName: game.title,
          reviewRating: review.rating
        },
        visibility: 'PUBLIC'
      });
    }

    // Highscore activities
    for (let i = 0; i < 4; i++) {
      const user = users[i % users.length];
      const game = games[i % games.length];
      
      activities.push({
        user: user._id,
        type: 'NEW_HIGHSCORE',
        data: {
          gameId: game._id,
          gameName: game.title,
          score: Math.floor(Math.random() * 100000) + 10000
        },
        visibility: 'PUBLIC'
      });
    }

    // Game added activities
    for (let i = 0; i < 3; i++) {
      const user = users[i % users.length];
      const game = games[i % games.length];
      
      activities.push({
        user: user._id,
        type: 'GAME_ADDED',
        data: {
          gameId: game._id,
          gameName: game.title
        },
        visibility: 'PUBLIC'
      });
    }

    const createdActivities = await Activity.create(activities);
    console.log(`✅ Created ${createdActivities.length} activities`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Games: ${games.length}`);
    console.log(`   Reviews: ${reviews.length}`);
    console.log(`   Activities: ${createdActivities.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
connectDB().then(() => seedDatabase());
