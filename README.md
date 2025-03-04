# Appomania 🔐

# Project title and emoji

## About
# General project description
Appomania is a modern appointment scheduling system built with Next.js 14 and secure authentication. This application provides a comprehensive solution for managing appointments and bookings while ensuring secure access control and user authentication.

## Features
# List of main features
- **Advanced Appointment System**
  # Core appointment features
  - Easy appointment scheduling
  - Real-time availability checking
  - Automated reminders and notifications
  - Calendar integration
  - Multi-service booking support

- **Authentication & Security**
  # Authentication features
  - Secure email/password authentication
  - OAuth support for social logins
  - Two-factor authentication (2FA)
  - Session management
  - Protected routes and API endpoints
  
- **Next.js 14 Features**
  # Next.js 14 features used
  - Built with App Router architecture
  - Server Components for optimal performance
  - Server Actions for form handling
  - API routes for backend functionality
  
- **User Interface**
  # User interface features
  - Interactive calendar view
  - User-friendly booking flow
  - Responsive dashboard
  - Real-time updates
  - Booking confirmation notifications

- **Business Features**
  # Business management features
  - Service management
  - Staff scheduling
  - Working hours setup
  - Customer management
  - Analytics and reporting
  - Multi-location support
  - Resource allocation

- **Security Features**
  # Security features
  - CSRF protection
  - HTTP-only cookies
  - Rate limiting
  - Input sanitization
  - Secure password hashing
  - Role-based access control

## Prerequisites
# Required prerequisites to run the project
- Node.js 18.17 or later
- npm, yarn, or pnpm package manager
- Basic understanding of Next.js and React

## Getting Started
# Steps to start the project

1. **Clone the repository**
   # Clone commands
   ```bash
   git clone <repository-url>
   cd appomania
   ```

2. **Install dependencies**
   # Install dependency commands
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   # Environment variables setup
   Create a `.env.local` file in the root directory:
   ```env
   # Required
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key

   # Database (if using)
   DATABASE_URL=your-database-url

   # OAuth Providers (if using)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret

   # Calendar Integration
   GOOGLE_CALENDAR_API_KEY=your-calendar-api-key
   OUTLOOK_CLIENT_ID=your-outlook-client-id
   ```

4. **Run the development server**
   # Development server commands
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser
   # Browser access link

## Project Structure
# Project directory structure explanation
```
├── app/
│   ├── api/           # API routes
│   ├── auth/         # Authentication pages
│   ├── appointments/ # Appointment pages
│   ├── dashboard/    # Admin dashboard
│   ├── components/   # Reusable components
│   └── layout.tsx    # Root layout
├── lib/              # Utility functions
├── types/            # TypeScript types
└── public/           # Static assets
```

## Tech Stack
# Technologies used
- **Frontend**
  # Frontend technologies
  - Next.js 14 (React framework)
  - TypeScript (Type safety)
  - Tailwind CSS (Styling)
  - React Hook Form (Form handling)
  - Full Calendar (Calendar UI)
  - Zod (Schema validation)

- **Backend & Database**
  # Backend technologies
  - NextAuth.js (Authentication)
  - Bcrypt (Password hashing)
  - JWT (Token handling)
  - Prisma (Database ORM)
  - PostgreSQL (Database)
  - Redis (Caching)

- **Development Tools**
  # Development tools
  - ESLint (Code linting)
  - Prettier (Code formatting)
  - Husky (Git hooks)

## API Routes
# API endpoints and descriptions
- **Authentication**
  - `POST /api/auth/signup` - User registration
  - `POST /api/auth/signin` - User login
  - `GET /api/auth/session` - Get current session
  - `POST /api/auth/signout` - User logout

- **Appointments**
  - `POST /api/appointments/create` - Create new appointment
  - `GET /api/appointments/list` - Get appointments list
  - `PUT /api/appointments/update` - Update appointment
  - `DELETE /api/appointments/cancel` - Cancel appointment

## Contributing
# Steps for contributing to the project
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment
# Deployment information and steps
The project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

For other platforms, check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Learn More
# Useful links for more information
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Full Calendar Documentation](https://fullcalendar.io/docs)

## License
# License information
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
