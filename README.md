# Appomania - Modern Appointment Management System 📅

## Demo
🌐 **Production URL:** [https://appomania.vercel.app/](https://appomania.vercel.app/)

## About
Appomania is a modern appointment scheduling system built with Next.js 14, featuring a robust authentication system and intuitive appointment management interface. Perfect for businesses that need to manage their appointments efficiently.

## Current Features

### Appointment Management
- ✨ Drag & drop appointment scheduling
- 📏 Resizable appointments for duration adjustment
- 📅 Monthly/Weekly/Daily calendar views
- 🔄 Real-time updates
- 🕒 Working hours management
- ⏰ Break time settings
- 🚫 Conflict prevention for overlapping appointments

### Authentication & Security
- 🔐 Secure email/password authentication
- 📧 Email verification
- 🔑 Password reset functionality
- 🛡️ Protected routes
- 🔒 Secure session management
- 👥 Two-factor authentication (2FA)

### User Interface
- 📱 Responsive design
- 🎨 Modern and clean interface
- 🌗 Light/Dark mode support (via Tailwind darkMode)
- 🔍 Search functionality for appointments
- 📊 Interactive calendar view
- ⚡ Real-time updates and notifications

### Business Features
- 👥 Customer management
- 💼 Service management
- ⏱️ Working hours configuration
- ☕ Break time management
- 📋 Appointment history tracking
- 👥 Staff management
- 🔔 Notification preferences settings

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI
- DnD Kit (Drag & Drop)
- React Hook Form
- Zod
- TanStack Query

### Backend
- Next.js API Routes
- NextAuth.js
- Prisma ORM
- PostgreSQL
- Resend (Email service)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd appomania
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   DATABASE_URL=
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=
   RESEND_API_KEY=
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Project Structure
```
├── app/
│   ├── (auth)/        # Authentication pages
│   ├── (protected)/   # Protected routes
│   │   ├── appointments/  # Appointment management
│   │   ├── settings/      # Working hours, staff, notifications
│   │   └── dashboard/     # Main dashboard
│   ├── api/          # API endpoints
│   └── components/   # Shared components
├── components/       # Global components
├── lib/             # Utilities
├── prisma/          # Database schema
└── types/           # TypeScript types
```

## Environment Variables
- `DATABASE_URL`: PostgreSQL database URL
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `GITHUB_CLIENT_ID`: Github Client ID
- `GITHUB_CLIENT_SECRET`: Github Client Secret
- `GOOGLE_CLIENT_ID`: Google Client Id
- `GOOGLE_CLIENT_SECRET`: Google Client Secret
- `RESEND_API_KEY`: Resend API key for email services

## License
MIT License - feel free to use this project for your own purposes.
