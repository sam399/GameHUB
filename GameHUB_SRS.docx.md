# Software Requirements Specification (SRS)

Project Title: GameVerse 🎮 (formerly GameHUB)

Author(s): \[Mahruz Ahmed, Bandhan Mondal\]

Document Version: 4.0

Last Updated: January 13, 2026

Status: Production Ready

# **1\. Introduction**

## **1.1 Type of Project**

GameVerse is a comprehensive full-stack gaming community platform built with modern web technologies (MERN stack). It combines social networking, content management, competitive gaming, and real-time interactions into a single, feature-rich application. The platform features **The Nexus Interface** - an immersive, cyber-fantasy design system that makes users feel like they're logging into a futuristic game lobby. The system follows a database-first architecture with MongoDB Atlas hosting 49 curated games.

## **1.2 Purpose**

The purpose of GameVerse is to provide gamers with a unified platform that combines:
- **Community Features**: Social networking, forums, real-time chat, and activity feeds
- **Gaming Content**: Curated game library with 49+ games, reviews, ratings, and recommendations
- **Competitive Features**: Leaderboards, achievements, events, and tournaments
- **Immersive Experience**: The Nexus Interface with cyber-fantasy design, WebGL animations, and procedural sound system
- **AI-Driven Personalization**: AI-powered game recommendations based on user preferences
- **Security & Moderation**: Two-factor authentication, comprehensive content moderation, and reporting system

The platform aims to make the gaming experience more social, intelligent, secure, and visually immersive.

## **1.3 Target Users**

- **Casual Gamers**: Users looking to discover new games, track their library, and connect with friends
- **Hardcore Gamers**: Players seeking competitive features like leaderboards, achievements, and events
- **Professional eSports Players**: Users interested in tournaments and competitive gaming community
- **Game Reviewers**: Users who want to share detailed reviews and ratings
- **Community Members**: Users who engage in forums, discussions, and social features
- **Content Moderators**: Administrators and moderators managing community safety
- **Streamers & Influencers**: Users who want to engage with their gaming community

# **2\. Functional Requirements (30+ Features)**

**✅ 1\. User Authentication System with 2FA**  
Status: Fully Implemented  
\- Secure JWT-based registration and login  
\- Password encryption with bcrypt  
\- Two-Factor Authentication (TOTP) with QR code generation  
\- Protected routes and API endpoints  
\- Session management (7-day JWT expiration)  
\- Role-based access control (Guest, User, Moderator, Admin)

**✅ 2\. User Profile Management**  
Status: Fully Implemented  
\- User profile creation and editing  
\- Avatar upload and management  
\- Bio and personal information  
\- Gaming preferences tracking  
\- Connected gaming accounts (Steam, Epic, Xbox, PlayStation)  
\- Friend count and social statistics

**✅ 3\. Game Library & Discovery**  
Status: Fully Implemented  
\- Curated database with 49 games pre-populated  
\- Pagination system (12 games per page, 5 pages)  
\- Advanced filtering (genre, platform, rating, release date)  
\- Real-time search functionality  
\- Game details pages with video previews and rich media  
\- Community ratings and review aggregation  
\- Responsive game grid with 3D tilt effects and video-on-hover

**✅ 4\. Game Reviews & Ratings System**  
Status: Fully Implemented  
\- User reviews with star ratings  
\- Review editing and deletion  
\- Like/dislike system for reviews  
\- Helpfulness tracking  
\- Review statistics and aggregation  
\- User review history

**✅ 5\. Community Forum System**  
Status: Fully Implemented  
\- Category-based discussion boards  
\- Thread creation and management  
\- Post replies and nested discussions  
\- Forum search functionality  
\- Pinned and locked threads  
\- User participation tracking

**✅ 6\. Real-Time Chat System**  
Status: Fully Implemented  
\- One-to-one private messaging  
\- Group chat creation  
\- Real-time message delivery via Socket.io  
\- Typing indicators  
\- Message read receipts  
\- Online status tracking  
\- Chat history persistence

**✅ 7\. Friend System & Social Features**  
Status: Fully Implemented  
\- Friend request management  
\- Friend search and discovery  
\- Friend suggestion algorithm  
\- Social network integration  
\- Friend activity tracking  
\- Profile friend lists

**✅ 8\. Advanced Notification System**  
Status: Fully Implemented  
\- Real-time notification delivery via Socket.IO  
\- Persistent storage in MongoDB  
\- Multiple notification types (achievements, reviews, forum posts, friend requests, events)  
\- Granular notification preferences (per activity type)  
\- Email notification settings (in-app, email, daily/weekly digest)  
\- Quiet hours configuration  
\- Bulk notification management (mark all as read, delete)  
\- Notification statistics dashboard  
\- Unread notification counter

**✅ 9\. Wishlist System**  
Status: Fully Implemented  
\- Game wishlist management  
\- Priority levels (low, medium, high)  
\- Price alert functionality  
\- Wishlist notes  
\- Public/private wishlist sharing  
\- Wishlist statistics

**✅ 10\. Game Tracking & Library Management**  
Status: Fully Implemented  
\- Personal game library  
\- Game status tracking (playing, completed, planning, etc.)  
\- Progress tracking with percentages  
\- Play session logging  
\- Hours played tracking  
\- Achievement tracking  
\- Gaming statistics and analytics

**✅ 11\. Admin Dashboard & Content Moderation**  
Status: Fully Implemented (Enhanced January 2026)  
\- Comprehensive admin dashboard with real-time statistics  
\- Analytics dashboard with interactive charts (Recharts)  
\- User management with search, filtering, and role assignment  
\- Bulk moderation actions (ban, activate, promote, demote)  
\- Content reporting system (users, reviews, forum posts, games, messages)  
\- Moderation queue with severity levels (Low, Medium, High, Critical)  
\- Report assignment to moderators  
\- Comprehensive audit logging with advanced filtering  
\- Professional Nexus theme styling across admin pages  
\- Real-time updates via Socket.IO

**✅ 12\. Leaderboard System**  
**Status:** Fully Implemented

\- Global and game-specific leaderboards  
\- Achievement-based rankings  
\- Time-based competitions  
\- Badge and reward system

**✅ 13\. Achievement Tracker**  
**Status:** Fully Implemented

\- Cross-game achievement tracking  
\- Achievement progress visualization  
\- Badge display system  
\- Achievement sharing

**✅ 14\. News Feed & Content Aggregation**  
**Status:** Fully Implemented

\- Personalized gaming news  
\- API integration (RAWG, IGDB)  
\- Content curation algorithms  
\- Social activity feed

**✅ 15\. Event Management System**  
**Status:** Fully Implemented

\- Tournament creation and management  
\- Event registration  
\- Participant management  
\- LAN party organization tools

**✅ 16\. Content Moderation Tools**  
**Status:** Fully Implemented

\- Advanced moderation queue  
\- Automated content filtering  
\- User behavior analysis  
\- Moderation workflow optimization

**✅ 17\. Dark/Light Mode Toggle**  
**Status:** Fully Implemented

\- Theme preference storage  
\- System theme detection  
\- Consistent theming across components

**✅ 18\. Responsive Design**  
**Status:** Fully Implemented

\- Mobile-first optimization  
\- Cross-browser compatibility  
\- Progressive Web App (PWA) features

**✅ 19\. Data Visualization Dashboard**  
**Status:** Fully Implemented

\- User statistics charts (Recharts)  
\- Gaming habit analytics  
\- Social interaction metrics  
\- Progress visualization

**✅ 20\. AI Game Recommendation System**  
**Status:** Fully Implemented

\- Genre-based preference learning from user reviews  
\- Personalized game suggestions based on review history  
\- Compatibility scoring algorithm  
\- Excludes already owned/reviewed games  
\- Minimum 3 reviews required for recommendations  
\- Weighted genre scoring system

**✅ 21\. The Nexus Interface - Immersive UI/UX**  
Status: Fully Implemented

\- **Drone Cursor**: Custom animated cursor with glowing trails, velocity-based sparks, and energy pulse ripples  
\- **Living Background**: WebGL-powered hexagonal grid with mouse-reactive ripples and floating particles  
\- **Sound System**: Procedurally generated UI sounds (hover chirps, click lock-ins, transition whooshes)  
\- **Parallax Hero**: 2.5D multi-layer parallax with character tracking and holographic buttons  
\- **Enhanced Game Cards**: Video-on-hover, 3D tilt effects, holographic scanlines, brand-specific glows  
\- **Glassmorphism Navigation**: Frosted glass effects, animated scanlines, rotating avatar rings  
\- **Theme System**: Electric cyan + plasma magenta color palette, light/dark mode support

**✅ 22\. Advanced Search & Filtering**  
Status: Fully Implemented

\- Cross-platform search (games, users, content)  
\- Genre and platform filtering  
\- Rating and date range filters  
\- Activity feed filtering  
\- Report and moderation filtering

**✅ 23\. Email Notification System**  
Status: Implemented (Optional SMTP Configuration)

\- Email notifications for key events  
\- Daily/weekly email digests  
\- Customizable email preferences  
\- Optional SMTP configuration

**✅ 24\. Caching System**  
Status: Implemented (Optional Redis)

\- Redis integration for performance optimization  
\- In-memory cache fallback  
\- Session storage  
\- Frequently accessed data caching

**✅ 25\. Real-time Features via Socket.IO**  
Status: Fully Implemented

\- Real-time notifications  
\- Live chat messaging  
\- Typing indicators  
\- Online status tracking  
\- Friend request updates  
\- Admin room for report notifications  
\- Activity feed updates

# **3\. Non-Functional Requirements**

**3.1 Implemented Requirements**

**1\. Security**  
\- JWT authentication with token expiration  
\- Password hashing using bcrypt  
\- Input validation and sanitization  
\- XSS prevention measures  
\- Role-based access control  
\- CORS configuration

**2 . Maintainability**  
\- MVC architecture pattern  
\- Modular code structure  
\- Comprehensive code documentation  
\- Consistent coding standards  
\- Separation of concerns

**3 . Usability**  
\- Intuitive user interface design  
\- Consistent navigation patterns  
\- Responsive design principles  
\- User-friendly error messages  
\- Accessibility considerations

### **4\.  Performance**

* **Target Load Time:** Homepage loads in under 3 seconds on standard broadband  
* **API Response Time:** 95% of requests complete in under 500ms  
* **Real-time Updates:** Socket.IO events delivered within 100ms  
* **GPU Acceleration:** Three.js and WebGL for 60fps animations with minimal CPU overhead  
* **Frontend Optimization:** Vite for fast HMR and optimized production builds  
* **Database Optimization:** Indexed collections for query performance  
* **Pagination:** Efficient data loading (12 games/page, 20 admin items/page)  
* **Caching:** Optional Redis integration with in-memory fallback  
* **Concurrent Users:** Supports 1000+ concurrent users

### **5\.  Security**

* **Authentication:** JWT token-based with 7-day expiration  
* **2FA:** TOTP standard (RFC 6238) implementation with QR code generation  
* **Password Security:** Bcrypt hashing with 10+ salt rounds, no plaintext storage  
* **Data Protection:** 2FA secrets stored with `select: false` in Mongoose schema  
* **Authorization:** Role-based access control (Guest, User, Moderator, Admin)  
* **Input Validation:** Comprehensive sanitization middleware on all write operations  
* **Content Filtering:** Automatic banned word filtering  
* **HTTPS:** SSL/TLS in production (Netlify & Render)  
* **XSS Prevention:** Input sanitization and output encoding  
* **CSRF Protection:** Token validation  
* **Rate Limiting:** API endpoint protection

### **6\.  Reliability**

* **Uptime Target:** 99.5% availability  
* **Health Monitoring:** Health check endpoints (`/api/health`) for deployment monitoring  
* **Error Handling:** Comprehensive error messages and graceful degradation  
* **Database Backup:** Automated daily backups via MongoDB Atlas  
* **Point-in-time Recovery:** 30-day backup retention  
* **Fallback Mechanisms:** Redis to in-memory cache fallback  
* **Connection Pooling:** Efficient database connection management

# **4\. Class Diagram**

![][image1]

# **5\. Tools and Technologies**

### **Frontend**

* **Core Framework:** React 18 with TypeScript  
* **Build Tool:** Vite (fast HMR and optimized production builds)  
* **Styling:** Tailwind CSS with dark mode support and custom Nexus theme  
* **3D Graphics/Animation:** Three.js, @react-three/fiber, @react-three/drei  
* **Animation Library:** GSAP (GreenSock Animation Platform)  
* **State Management:** React hooks and context  
* **HTTP Client:** Axios with interceptors  
* **Routing:** React Router v6  
* **Charts:** Recharts for admin analytics  
* **Real-time:** Socket.IO Client  
* **Testing:** Playwright for E2E testing  
* **Sound:** Web Audio API for procedural sound generation

### **Backend**

* **Runtime:** Node.js 16+ with Express.js  
* **Database:** MongoDB Atlas (cloud) with Mongoose ODM  
* **Real-time Communication:** Socket.IO  
* **Authentication:** JWT (JSON Web Tokens)  
* **2FA:** Speakeasy (TOTP standard RFC 6238)  
* **QR Code Generation:** QRCode library  
* **Password Hashing:** Bcrypt with salt rounds  
* **Caching:** Redis (optional, with in-memory fallback)  
* **Environment Config:** dotenv  
* **Email:** Nodemailer (optional SMTP configuration)

### **Deployment & Infrastructure**

* **Frontend Hosting:** Netlify (static site with CDN)  
* **Backend Hosting:** Render (Docker containers)  
* **Database:** MongoDB Atlas (cloud-hosted cluster)  
* **CI/CD:** GitHub integration with Netlify and Render  
* **Configuration Files:** netlify.toml, render.yaml

# **6\. Compatibility with System Environment**

### **Browser Compatibility**

* **Chrome:** Version 90+ (recommended for full Nexus experience)  
* **Firefox:** Version 88+  
* **Edge:** Version 90+  
* **Safari:** Version 14+  
* **WebGL Support:** Required for The Nexus Interface animations  
* **JavaScript:** ES6+ support required

### **Device Compatibility**

* **Desktop:** Windows, macOS, Linux (optimized for Nexus UI)  
* **Tablet:** iPad, Android tablets (responsive design)  
* **Mobile:** iOS, Android (touch-friendly, simplified Nexus effects)  
* **Minimum Screen Width:** 320px  
* **GPU:** Modern GPU recommended for full visual experience

### **Production Deployment**

* **Frontend:** Deployed via Netlify (CDN distribution, automatic HTTPS)  
* **Backend:** Deployed via Render (Docker containers, auto-scaling)  
* **Database:** MongoDB Atlas (cloud-hosted with automatic backups)  
* **CI/CD:** GitHub integration for automatic deployments  
* **Configuration:** `netlify.toml`, `render.yaml` ready for production

# **7\. Implementation (Feature Screenshots)**

## **Current Implementation Status (January 2026)**

### **Completed Features**

1. **Backend API**: Running on port 5000 with MongoDB Atlas  
2. **Frontend Application**: Running on port 5173 with Vite hot-reload  
3. **Database**: MongoDB Atlas with 49 games fully populated and indexed  
4. **Game Library**: Pagination (12/page), filtering, and search fully functional  
5. **Theme System**: Light/dark mode with CSS variables across all pages  
6. **The Nexus Interface**: WebGL animations, drone cursor, procedural sound system  
7. **2FA**: Two-Factor Authentication fully functional with QR code generation  
8. **Socket.IO**: Real-time features operational  
9. **Profile System**: Click-based dropdown menu working properly  
10. **Admin Features**: Enhanced with audit logs, moderation, and report management  
11. **Bug Fixes**: My Library null reference handling for production consistency

### **Code Quality & Optimization (January 2026)**

**Removed Legacy Files:**  
\- Deleted 13+ migration guides and documentation files  
\- Removed `vercel.json` configuration  
\- Cleaned up redundant quick reference files

**Code Cleanup:**  
\- Removed debug `console.log` statements from frontend components  
\- Cleaned verbose socket connection logs in backend  
\- Kept essential error logging and server startup messages

**Dependencies Optimization:**  
\- Removed duplicate dependencies from root `package.json`  
\- Consolidated dependencies to appropriate workspace packages  
\- Removed frontend-only packages from backend dependencies

**Production Fixes:**  
\- Fixed My Library null reference error on Netlify  
\- Added `.filter(item => item.game)` for orphaned game references  
\- Improved database consistency handling

### **Space Nova Font Integration**

\- Globally applied OTF font loading  
\- Normalized sizing and letter-spacing  
\- Consistent typography across all UI elements

# **8\. Challenges**

## **Technical Challenges Overcome**

### **1\. Real-time Communication**
\- **Challenge**: Implementing reliable Socket.IO connections across different deployment environments  
\- **Solution**: Proper CORS configuration, connection string management, and fallback mechanisms  
\- **Result**: Stable real-time notifications, chat, and admin updates

### **2\. Two-Factor Authentication**
\- **Challenge**: Secure implementation of TOTP with QR code generation  
\- **Solution**: Used Speakeasy and QRCode libraries with proper secret protection  
\- **Result**: RFC 6238-compliant 2FA with seamless user experience

### **3\. WebGL Performance**
\- **Challenge**: Maintaining 60 FPS animations while ensuring compatibility  
\- **Solution**: GPU acceleration with Three.js, optimized particle systems, graceful degradation  
\- **Result**: Smooth Nexus Interface experience across devices

### **4\. Database Architecture**
\- **Challenge**: Transitioning from external APIs to database-first approach  
\- **Solution**: Curated 49-game database, indexed collections, efficient queries  
\- **Result**: Faster load times, no external API dependencies

### **5\. Admin Features Enhancement**
\- **Challenge**: Creating comprehensive moderation and audit systems  
\- **Solution**: Advanced filtering, pagination, severity levels, real-time updates  
\- **Result**: Professional admin dashboard with full control

### **6\. Production Deployment**
\- **Challenge**: Coordinating Netlify (frontend) + Render (backend) deployment  
\- **Solution**: Proper environment variable configuration, health checks, CI/CD setup  
\- **Result**: Successful production deployment with automated workflows

### **7\. Null Reference Handling**
\- **Challenge**: My Library page crashes due to orphaned game references  
\- **Solution**: Added filtering to handle missing game data gracefully  
\- **Result**: Stable production environment

### **8\. Performance Optimization**
\- **Challenge**: Large codebase with potential performance issues  
\- **Solution**: Removed console.log statements, optimized dependencies, cleanup legacy code  
\- **Result**: Faster builds, reduced bundle size, improved maintainability

# **9\. Conclusion**

## **Project Summary**

GameVerse successfully delivers a comprehensive gaming community platform that exceeds initial requirements. The platform combines social networking, content management, competitive gaming, and an immersive user experience into a cohesive application.

## **Key Achievements**

### **Technical Excellence**
\- **Modern Stack**: React 18, TypeScript, Node.js, MongoDB Atlas  
\- **Security**: JWT authentication with 2FA, comprehensive input validation  
\- **Performance**: 60 FPS animations, sub-500ms API responses  
\- **Real-time**: Socket.IO integration for live updates  
\- **Scalability**: Database-first architecture supporting 1000+ concurrent users

### **Feature Completeness**
\- **30+ Features**: All core and advanced features fully implemented  
\- **The Nexus Interface**: Unique cyber-fantasy design system  
\- **Admin Tools**: Comprehensive moderation and analytics  
\- **AI Recommendations**: Personalized game suggestions  
\- **Social Features**: Friends, chat, forums, events

### **Production Readiness**
\- **Deployment**: Successfully deployed on Netlify + Render  
\- **Code Quality**: Clean codebase with removed legacy code  
\- **Testing**: Playwright E2E tests, manual testing completed  
\- **Documentation**: Comprehensive README and API documentation  
\- **Optimization**: Minimal dependencies, efficient builds

## **Future Enhancements**

While the platform is production-ready, potential future enhancements include:

1. **Mobile Native Apps**: iOS and Android applications  
2. **OAuth Integration**: Google, Discord, Steam login  
3. **Voice Chat**: Real-time voice communication for events  
4. **Streaming Integration**: Twitch and YouTube integration  
5. **Advanced Analytics**: Enhanced charts and user insights  
6. **Machine Learning**: Improved recommendation algorithms  
7. **Blockchain Features**: NFT-based achievements (optional)  
8. **Multi-language Support**: Internationalization

## **Success Metrics**

\- **99.5% Uptime**: Reliable and stable platform  
\- **Sub-3s Load Times**: Fast initial page loads  
\- **60 FPS**: Smooth animations and interactions  
\- **1000+ Users**: Concurrent user support  
\- **49+ Games**: Curated game library  
\- **Zero External APIs**: Complete independence from third-party gaming APIs

## **Final Notes**

GameVerse represents a fully functional, production-ready gaming community platform that successfully combines modern web technologies with an immersive user experience. The platform's database-first architecture, comprehensive security features, and unique Nexus Interface set it apart from traditional gaming platforms.

The codebase is clean, well-documented, and optimized for maintainability and future enhancements. All core requirements have been met and exceeded, with additional features (2FA, AI recommendations, The Nexus Interface) adding significant value beyond the original scope.

# **10\. References**
## **Documentation**

1. **README.md**: Comprehensive project documentation with setup instructions  
2. **API Documentation**: Complete endpoint reference in README  
3. **Socket.IO Events**: Real-time event specifications  
4. **Nexus Interface Guide**: `NEXUS_VISUAL_GUIDE.md` in gameverse folder  
5. **Quick Start Guide**: `NEXUS_QUICK_START.md`

## **Configuration Files**

1. **netlify.toml**: Netlify deployment configuration  
2. **render.yaml**: Render backend service configuration  
3. **vite.config.ts**: Vite build configuration  
4. **tailwind.config.js**: Tailwind CSS customization  
5. **jest.config.js**: Jest testing framework configuration  
6. **playwright.config.ts**: Playwright E2E test configuration

## **Scripts**

1. **populatePopularGames.js**: Database population script (49 games)  
2. **createAdmin.js**: Admin user creation/promotion script  
3. **socketSmokeTest.js**: Socket.IO connection testing  
4. **test-2fa.js**: Two-factor authentication testing

## **Testing Reports**

1. **2FA_TEST_REPORT.md**: Comprehensive 2FA testing documentation  
2. **Playwright Tests**: E2E test suite results  
3. **Manual Testing**: User acceptance testing completed

## **Technical Standards**

1. **RFC 6238**: TOTP standard for 2FA implementation  
2. **JWT**: JSON Web Token standard for authentication  
3. **WebGL**: Web Graphics Library for 3D rendering  
4. **Socket.IO Protocol**: Real-time bidirectional communication  
5. **REST API**: RESTful API design principles

## **Libraries & Frameworks**

1. **React 18**: Frontend framework  
2. **Three.js**: 3D graphics library  
3. **GSAP**: Animation library  
4. **Socket.IO**: Real-time communication  
5. **Mongoose**: MongoDB ODM  
6. **Speakeasy**: 2FA library  
7. **Bcrypt**: Password hashing  
8. **Tailwind CSS**: Utility-first CSS framework

## **Deployment Platforms**

1. **Netlify**: Frontend hosting and CDN  
2. **Render**: Backend hosting with Docker  
3. **MongoDB Atlas**: Cloud database hosting

## **External Resources**

1. **GitHub Repository**: Source code version control  
2. **MongoDB Atlas Documentation**: Database management  
3. **Netlify Documentation**: Frontend deployment  
4. **Render Documentation**: Backend deployment  
5. **Socket.IO Documentation**: Real-time features

## **Refactoring Documentation**

1. **REFACTOR_SUMMARY.md**: Complete list of removed files and changes  
2. **Code Cleanup**: January 2026 optimization details

---

**Document Version History:**

- **Version 1.0**: Initial SRS creation  
- **Version 2.0**: Added core features and basic implementation  
- **Version 3.0**: Added advanced features and deployment details  
- **Version 4.0** (January 13, 2026): Complete update reflecting current production state, The Nexus Interface, enhanced admin features, code cleanup, and all 30+ implemented features
[image1]: <data:image/png;base64,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>