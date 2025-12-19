# 🎮 GameVerse Game Library

## Overview

GameVerse now uses a **curated MongoDB database** instead of external APIs for the game library. This provides better control, faster performance, and ensures all games have complete information.

## Database Population

### Quick Setup

Run this command to populate your database with 50 popular games:

```powershell
cd "H:\My Website\GameHUB\gameverse\backend"
node scripts/populatePopularGames.js
```

### What Gets Added

The script adds **50 hand-picked popular games** including:

#### AAA Titles
- The Witcher 3: Wild Hunt
- Red Dead Redemption 2
- Elden Ring
- Grand Theft Auto V
- Cyberpunk 2077
- Baldur's Gate 3
- The Last of Us Part I
- God of War
- Horizon Zero Dawn

#### Free-to-Play Games
- Counter-Strike 2
- Valorant
- League of Legends
- Dota 2
- Fortnite
- Apex Legends
- Overwatch 2
- Destiny 2
- Warframe
- Rocket League
- Fall Guys

#### Beloved Indies
- Stardew Valley
- Hades
- Terraria
- Hollow Knight
- Celeste
- Among Us

#### And Many More!
- Dark Souls III, Sekiro, Monster Hunter: World
- Portal 2, Half-Life: Alyx
- Final Fantasy XIV, World of Warcraft
- Spider-Man Remastered, It Takes Two
- Doom Eternal, Halo: The Master Chief Collection
- Sea of Thieves, No Man's Sky, Subnautica
- And 15+ more popular titles!

## Game Information Included

Each game in the database contains:

- **Title** — Official game name
- **Description** — Detailed game description (up to 2000 characters)
- **Genres** — Multiple genre tags (RPG, Action, FPS, etc.)
- **Platforms** — Supported platforms (PC, PlayStation, Xbox, Nintendo Switch, Mobile)
- **Developer & Publisher** — Game creators
- **Release Date** — Official launch date
- **Rating** — Average rating (0-5) and review count
- **Images** — Cover art URL
- **Price** — Game price (or 0 for free-to-play)
- **isFree** — Boolean flag for free games
- **Tags** — Additional descriptive tags
- **Featured** — Flag for featured games
- **Active** — Flag for active/inactive games

## Database Statistics

After running the population script, you'll have:

- **Total Games**: 49-50
- **Free Games**: ~13
- **Paid Games**: ~36
- **Featured Games**: All marked as featured

### Genre Distribution

The library includes diverse genres:
- Action (34 games)
- Adventure (28 games)
- RPG (14 games)
- Multiplayer (12 games)
- Open World (8 games)
- FPS (8 games)
- Survival (5 games)
- Indie (4 games)
- And many more!

## API Endpoints

### Get All Games
```
GET /api/games?page=1&limit=12&genre=Action&platform=PC&search=witcher&sortBy=rating&sortOrder=desc
```

### Get Featured Games
```
GET /api/games/featured?limit=6
```

### Get Games by Genre
```
GET /api/games/genre/RPG?page=1&limit=12
```

### Get Game Details
```
GET /api/games/:gameId
```

### Get Metadata
```
GET /api/games/meta/genres      # All unique genres
GET /api/games/meta/platforms   # All unique platforms
GET /api/games/meta/stats       # Library statistics
```

### Admin Operations
```
POST /api/games                 # Create game (admin only)
PUT /api/games/:gameId          # Update game (admin only)
DELETE /api/games/:gameId       # Delete game (admin only)
```

## Benefits of Database Approach

✅ **Faster Performance** — No external API calls, instant response
✅ **Complete Control** — Curate exactly which games to include
✅ **Rich Data** — Every game has full information (ratings, platforms, etc.)
✅ **Better UX** — Consistent data format, no API failures
✅ **Popular Games** — Focus on AAA and beloved titles, not obscure free games
✅ **Extensible** — Easy to add new games via admin panel
✅ **Reliable** — No dependency on third-party API uptime

## Adding More Games

### Manual Addition (Admin Panel)
Once logged in as admin, you can add games through the admin interface.

### Programmatic Addition
Edit `scripts/populatePopularGames.js` to add more games to the `popularGames` array, then re-run the script.

### Game Schema
```javascript
{
  title: String (required, max 100 chars),
  description: String (required, max 2000 chars),
  genre: [String] (required, at least one),
  platforms: [String] (required, at least one),
  developer: String (required),
  publisher: String (required),
  releaseDate: Date (required),
  rating: { average: Number (0-5), count: Number },
  images: { cover: String, screenshots: [String] },
  price: Number (default: 0),
  isFree: Boolean (default: false),
  tags: [String],
  featured: Boolean (default: false),
  active: Boolean (default: true)
}
```

## Migration Notes

### Removed Dependencies
- ❌ FreeToGame API integration removed
- ❌ `USE_FREETOGAME` environment variable no longer needed
- ❌ `FREETOGAME_API_URL` environment variable no longer needed
- ❌ RapidAPI integration removed

### New Requirements
- ✅ MongoDB must be populated with games
- ✅ Run `populatePopularGames.js` on initial setup
- ✅ Game images use IGDB URLs (reliable and free)

## Troubleshooting

**No games showing up?**
```powershell
node scripts/populatePopularGames.js
```

**Want to reset the library?**
The script automatically clears existing games before inserting new ones.

**Need different games?**
Edit `scripts/populatePopularGames.js` and customize the `popularGames` array.

---

**Built with ❤️ for the gaming community**
