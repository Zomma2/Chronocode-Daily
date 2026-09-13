# Chronocode Daily

A modern, interactive platform for daily coding challenges and programming tips. Sharpen your coding skills with daily challenges, track your progress, and learn new concepts every day.

![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)
![React](https://img.shields.io/badge/React-18.0-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.0+-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0+-blue?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-38B2AC?logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)

## Features

- 🎯 **Daily Challenges** - Solve new coding challenges every day across multiple programming languages
- 💡 **Programming Tips** - Learn daily tips and best practices from experienced developers
- 📊 **Progress Tracking** - Maintain a streak and track your learning journey
- 📝 **Solution Export** - Export solutions as Markdown or PNG for sharing
- 📚 **Blog Integration** - Read detailed blog posts on various programming topics
- 💬 **Feedback System** - Submit feedback and suggestions for improvement
- 🎨 **Responsive Design** - Beautiful, responsive UI built with Tailwind CSS and React components
- 🐳 **Docker Support** - Easy deployment with containerization

## Tech Stack

### Frontend
- **Next.js 14** - React framework for production
- **React 18** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (ES6+)** - Modern JavaScript

### Backend
- **Node.js** - JavaScript runtime
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Relational database

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** v18.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0 or higher (comes with Node.js)
- **PostgreSQL** v15.0 or higher (optional, if not using Docker)
- **Docker** and **Docker Compose** (optional, for containerized deployment)

## Installation

### Option 1: Local Development Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:Zomma2/Chronocode-Daily.git
   cd Chronocode-Daily
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your configuration:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/codebits"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Option 2: Docker Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:Zomma2/Chronocode-Daily.git
   cd Chronocode-Daily
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

3. **Stop the containers**
   ```bash
   docker-compose down
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
Runs the Next.js development server with hot-reloading enabled.

### Production Build
```bash
npm run build
npm run start
```
Creates an optimized production build and starts the server.

### Database Seeding
```bash
npm run seed
```
Populates the database with initial data (daily challenges, tips, etc.).

## Project Structure

```
codebits/
├── components/           # Reusable React components
│   ├── CodeBitsDaily.js # Daily challenge component
│   ├── CodeBlock.js     # Syntax-highlighted code display
│   ├── ProgressBar.js   # Progress visualization
│   └── TipsFeed.js      # Tips feed component
├── pages/               # Next.js pages and API routes
│   ├── _app.js          # App wrapper and global configuration
│   ├── index.js         # Home page
│   ├── history.js       # Challenge history page
│   ├── blog/            # Blog pages
│   └── api/             # API endpoints
│       ├── daily-challenge.js
│       ├── daily-tip.js
│       ├── history.js
│       ├── tips-feed.js
│       ├── verify-answer.js
│       └── blog/
├── lib/                 # Utility functions and helpers
│   ├── db.js            # Database operations
│   ├── exportMarkdown.js # Markdown export functionality
│   ├── exportPng.js     # PNG export functionality
│   ├── feedback.js      # Feedback handling
│   ├── highlight.js     # Syntax highlighting
│   ├── markdown.js      # Markdown parsing
│   └── streak.js        # Streak tracking logic
├── scripts/             # Utility scripts
│   └── seed.js          # Database seeding script
├── styles/              # Global styles
│   └── globals.css      # Global CSS with Tailwind
├── data/                # Data storage (if applicable)
├── Dockerfile           # Container configuration
├── docker-compose.yml   # Multi-container setup
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Project dependencies
```

## API Endpoints

### Daily Challenge
- **GET** `/api/daily-challenge` - Get today's challenge
- **POST** `/api/verify-answer` - Verify user's answer

### Daily Tips
- **GET** `/api/daily-tip` - Get today's tip
- **GET** `/api/tips-feed` - Get tips feed

### History
- **GET** `/api/history` - Get user's challenge history

### Blog
- **GET** `/api/blog/posts` - Get all blog posts
- **GET** `/api/blog/[slug]` - Get specific blog post

### Feedback
- **POST** `/api/feedback` - Submit feedback

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/codebits

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Chronocode Daily

# Optional: Third-party services
# ANALYTICS_ID=your_analytics_id
```

## Scripts

Available npm scripts:

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run seed     # Seed database with initial data
npm run lint     # Run code linting
```

## Docker Deployment

### Building the Image
```bash
docker build -t chronocode-daily:latest .
```

### Running the Container
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@db:5432/codebits" \
  chronocode-daily:latest
```

### Using Docker Compose
```bash
docker-compose up -d
docker-compose down
docker-compose logs -f
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with clear messages (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Convention
We follow the Conventional Commits specification:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Build, dependency, or tooling changes

## Performance Optimization

- **Code Splitting** - Next.js automatically splits code at page boundaries
- **Image Optimization** - Next.js Image component for optimized images
- **CSS Optimization** - Tailwind CSS purges unused styles in production
- **Syntax Highlighting** - Efficient highlighting with highlight.js

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env.local`
- Check database credentials

### Port Already in Use
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# For Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Docker Issues
- Ensure Docker daemon is running
- Clear Docker cache: `docker system prune`
- Rebuild containers: `docker-compose up --build`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub Issues](https://github.com/Zomma2/Chronocode-Daily/issues)
- Contact us at omarhazem6@gmail.com

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React](https://react.dev)
- [PostgreSQL](https://www.postgresql.org/)
- [Highlight.js](https://highlightjs.org/)

---

**Happy Coding!** 🚀

Made with ❤️ by [Omar Hazem](https://github.com/Zomma2)
