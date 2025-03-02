# Appomania 🗓️

# Project title and emoji

## About
Appomania is a modern appointment scheduling system built with Next.js 14 and secure authentication. This application provides a comprehensive solution for managing appointments and bookings while ensuring secure access control and user authentication.

## Features
- **Advanced Appointment System**
  - Easy appointment scheduling with drag-and-drop interface
  - Real-time availability checking
  - Appointment resizing and rescheduling
  - Calendar integration
  - Multi-service booking support
  - Working hours and break time management

- **Authentication & Security**
  - Secure email/password authentication
  - OAuth support for social logins
  - Two-factor authentication (2FA)
  - Session management
  - Protected routes and API endpoints
  
- **Next.js 14 Features**
  - Built with App Router architecture
  - Server Components for optimal performance
  - Server Actions for form handling
  - API routes for backend functionality
  
- **User Interface**
  - Interactive calendar view
  - User-friendly booking flow
  - Responsive dashboard
  - Real-time updates
  - Booking confirmation notifications

- **Business Features**
  - Service management
  - Staff scheduling
  - Working hours setup
  - Customer management
  - Analytics and reporting
  - Multi-location support
  - Resource allocation

- **Security Features**
  - CSRF protection
  - HTTP-only cookies
  - Rate limiting
  - Input sanitization
  - Secure password hashing
  - Role-based access control

## Prerequisites
- Node.js 18.17 or later
- npm, yarn, or pnpm package manager
- Basic understanding of Next.js and React

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
   # or
   pnpm install
   ```

3. **Environment Setup**
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
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## User Guide

### Authentication
1. **Sign up**: Create a new account by visiting the sign-up page and entering your details
2. **Sign in**: Log in with your credentials or use social login options if enabled
3. **Account settings**: Manage your profile and security settings through the dashboard

### Appointment Management
1. **View Calendar**: The main appointments page displays a calendar view with time slots
2. **Create Appointment**: 
   - Click the "Create Appointment" button in the top-right corner
   - Fill in customer details, select services, and choose date/time
   - Save the appointment

3. **Modify Appointments**:
   - **Drag and Drop**: Click and drag appointments to reschedule them to new time slots
   - **Resize**: Use the resize handle at the bottom of an appointment to adjust its duration
   - **Edit Details**: Click on an appointment to open its details for editing
   - **Cancel**: Delete appointments through the appointment details modal

4. **Filter and Search**:
   - Use the search icon to find appointments by customer name, service, or phone number
   - Click on search results to navigate directly to that appointment's date

### Working Hours Configuration
1. **Access Settings**: Use the settings gear icon in the calendar view
2. **Configure Hours**: Set opening hours, closing hours, and break times for each day
3. **Set Closed Days**: Mark specific days as closed for appointments

### Navigation
1. **Date Navigation**:
   - Use the arrows next to the month to navigate days
   - Click on the month name to open a date picker for quick navigation
   - Use the "Today" button to jump to the current date
   - Use the left and right scroll arrows to navigate through the week view

## Recent Updates
- **Appointment Resizing**: Fixed issues with the resize functionality to prevent modal opening during resizing
- **Calendar Display**: Improved calendar view to correctly display the current date on page load
- **Localization**: Updated all date formatting to use English locale
- **Code Cleanup**: Removed debug console logging for improved performance
- **Visual Improvements**: Enhanced the resize handle UI for better usability
- **Event Handling**: Fixed event propagation issues during appointment interactions

## Project Structure
```
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   ├── appointments/  # Appointment pages
│   ├── dashboard/     # Admin dashboard
│   ├── components/    # Reusable components
│   └── layout.tsx     # Root layout
├── lib/               # Utility functions
├── types/             # TypeScript types
└── public/            # Static assets
```

## Tech Stack
- **Frontend**
  - Next.js 14 (React framework)
  - TypeScript (Type safety)
  - Tailwind CSS (Styling)
  - React Hook Form (Form handling)
  - date-fns (Date formatting)
  - Lucide React (Icons)
  - DND Kit (Drag and drop functionality)
  - Zod (Schema validation)

- **Backend & Database**
  - NextAuth.js (Authentication)
  - Bcrypt (Password hashing)
  - JWT (Token handling)
  - Prisma (Database ORM)
  - PostgreSQL (Database)
  - React Query (Data fetching and caching)

- **Development Tools**
  - ESLint (Code linting)
  - Prettier (Code formatting)
  - Husky (Git hooks)

## API Routes
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

- **Settings**
  - `GET /api/settings/working-hours` - Retrieve working hours configuration
  - `POST /api/settings/working-hours` - Update working hours configuration

## Troubleshooting

### Common Issues
1. **Appointments not showing**: Ensure you've configured working hours for the respective days
2. **Calendar shows wrong dates**: Refresh the page or click the "Today" button to reset the view
3. **Appointment drag fails**: Check for overlapping appointments or closed time slots
4. **Cannot resize appointments**: Ensure the appointment has sufficient space in the schedule
5. **Login issues**: Verify your database connection and authentication settings

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment
The project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

For other platforms, check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DND Kit Documentation](https://docs.dndkit.com)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
