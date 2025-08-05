# Internal Audit Management System

A comprehensive Internal Audit Management System built for the University of Louisiana Monroe, designed according to the ULM Department of Internal Audit Manual (April 2025 revision) and aligned with the 2024 Global Internal Audit Standards (GIAS).

## Features

### ✅ Implemented Core Modules

1. **Dashboard & Overview**
   - Executive dashboard with key metrics and KPIs
   - Audit status tracking and progress monitoring
   - Risk assessment overview
   - Performance indicators dashboard

2. **Authentication & Security**
   - JWT-based authentication system
   - Role-based access control (Director, Senior Auditor, Auditor, Management, Board)
   - Secure API endpoints with rate limiting
   - Password hashing and session management

3. **Audit Planning & Management**
   - Annual audit plan creation and management
   - Risk-based audit planning interface
   - Engagement planning and resource allocation
   - Audit calendar and scheduling

4. **Database Schema**
   - Complete audit lifecycle management
   - Working papers with WP indexing system (WP1, WP2, etc.)
   - Risk assessments with scoring framework
   - Audit findings with CCCE structure (Condition, Criteria, Cause, Effect)
   - Action plans and corrective measures tracking

### 🔜 Additional Modules (Ready for Implementation)

- Risk Management with heat maps
- Engagement Management workflows
- Findings & Recommendations tracking
- Reporting System with templates
- Quality Assurance & Improvement Program (QAIP)
- Compliance & Ethics tracking
- Resource Management
- Communication & Coordination tools

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: SQLite with Knex.js ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icons

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Internal-Audit-App
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Initialize Database**
   ```bash
   cd ../backend
   npm run init-db
   ```

5. **Start Backend Server**
   ```bash
   npm run dev
   ```
   Backend will be available at `http://localhost:3001`

6. **Start Frontend Application** (in a new terminal)
   ```bash
   cd ../frontend
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

### Demo Credentials

- **Email**: `admin@audit.system`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login in production environments.

## Project Structure

```
Internal-Audit-App/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # API controllers
│   │   ├── middleware/        # Authentication & security middleware
│   │   ├── models/           # Data models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── server.ts         # Main server file
│   ├── database/
│   │   ├── migrations/       # Database schema migrations
│   │   └── seeds/           # Sample data
│   └── scripts/             # Database initialization
├── frontend/                  # Next.js React application
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts (auth, etc.)
│   │   └── lib/              # Utilities and API client
│   └── public/              # Static assets
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Dashboard
- `GET /api/dashboard/overview` - Dashboard metrics and statistics
- `GET /api/dashboard/my-tasks` - User-specific tasks and assignments

### Audit Management
- `GET /api/audits/plans` - Get audit plans
- `POST /api/audits/plans` - Create new audit plan
- `GET /api/audits/engagements` - Get audit engagements
- `POST /api/audits/engagements` - Create new engagement
- `GET /api/audits/engagements/:id/working-papers` - Get working papers
- `GET /api/audits/engagements/:id/findings` - Get audit findings

### Risk Management
- `GET /api/risks` - Get risk assessments
- `POST /api/risks` - Create risk assessment
- `GET /api/risks/heatmap` - Get risk heat map data

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permission levels for different user roles
- **Password Security**: Bcrypt hashing with salt rounds
- **API Security**: Helmet.js for security headers, CORS protection
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation on all endpoints

## Database Schema

The system includes comprehensive tables for:

- **Users**: Role-based user management
- **Audit Plans**: Annual planning and management
- **Audit Engagements**: Individual audit projects
- **Working Papers**: Document management with indexing
- **Risk Assessments**: Risk evaluation and scoring
- **Audit Findings**: CCCE framework implementation
- **Action Plans**: Corrective action tracking
- **Audit Reports**: Standardized reporting system

## Compliance & Standards

This system is designed to meet:

- **2024 Global Internal Audit Standards (GIAS)**
- **ULM Department of Internal Audit Manual (April 2025)**
- **IIA Professional Standards**
- **Working Paper Management Standards**
- **Risk-Based Audit Planning Requirements**

## Development

### Backend Development
```bash
cd backend
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
```

### Frontend Development
```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
```

### Database Management
```bash
cd backend
npm run init-db    # Initialize database with schema and sample data
npx knex migrate:latest  # Run latest migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure code quality
5. Submit a pull request

## License

This project is proprietary software developed for the University of Louisiana Monroe Department of Internal Audit.

---

For questions or support, please contact the Internal Audit Department at the University of Louisiana Monroe.
