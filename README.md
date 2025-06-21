🔗 [Live Demo](https://disaster-managment-project.vercel.app/)

# 🚨 DisasterTrack - Global Response Hub

A real-time disaster monitoring and emergency response coordination platform built with modern web technologies. DisasterTrack provides comprehensive tools for tracking disasters, managing resources, and coordinating emergency responses across India with special focus on earthquake risk zones.

![DisasterTrack Dashboard](https://img.shields.io/badge/Status-Active-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## 🌟 Features

### 📊 Real-time Disaster Dashboard
- **Live disaster monitoring** with status tracking (Active, Monitoring, Resolved)
- **Interactive disaster reports** with location-based mapping
- **Social media feed integration** for real-time updates
- **Priority-based alert system** with color-coded indicators

### 🗺️ Interactive India Earthquake Risk Map
- **Color-coded earthquake zones** (Red: Very High Risk, Orange: High Risk, Yellow: Moderate Risk)
- **Google Maps integration** with custom markers and overlays
- **Real-time disaster plotting** with geographical coordinates
- **Optimized map loading** with lazy loading and batch processing

### 🏥 Resource Management System
- **Resource tracking** for shelters, food banks, medical centers, and transport
- **Capacity monitoring** with real-time occupancy data
- **Contact information** and direct calling capabilities
- **Advanced filtering** by type, status, and location
- **Interactive resource mapping** with navigation support

### 📱 Disaster Reporting
- **User-generated disaster reports** with location tagging
- **Image upload support** for visual documentation
- **Priority classification** system (Low, Normal, High, Urgent)
- **Verification workflow** for report validation

### 👤 User Management
- **Secure authentication** powered by Supabase Auth
- **User profiles** with role-based permissions
- **Session management** with automatic token refresh
- **Protected routes** with authentication guards

### 🎨 Modern UI/UX
- **Dark/Light theme support** with system preference detection
- **Responsive design** optimized for all devices
- **Shadcn/ui components** for consistent design language
- **Toast notifications** for user feedback
- **Loading states** and error handling

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful and accessible UI components

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication and user management
  - File storage capabilities

### External Integrations
- **Google Maps API** - Interactive mapping and geolocation
- **Lucide React** - Beautiful icon library
- **React Query** - Data fetching and caching

### State Management
- **React Query (@tanstack/react-query)** - Server state management
- **React Context** - Theme and authentication state
- **React Router** - Client-side routing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google Maps API key
- Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd disastertrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the provided SQL migrations to set up the database schema
   - Update the Supabase configuration in `src/integrations/supabase/client.ts`

4. **Configure Google Maps API**
   - Get an API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Enable Maps JavaScript API and Places API
   - Enter the API key in the application when prompted

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Create an account or sign in to start using DisasterTrack

## 🗄️ Database Schema

### Core Tables

#### `disasters`
- Stores disaster information with geographical coordinates
- Includes title, location, description, tags, and status
- Supports real-time updates

#### `resources`
- Manages emergency resources (shelters, food, medical, transport)
- Tracks capacity, occupancy, and availability status
- Includes contact information and amenities

#### `reports`
- User-generated disaster reports
- Supports image uploads and priority classification
- Verification workflow for content moderation

#### `social_media_posts`
- Aggregated social media content related to disasters
- Priority-based filtering and engagement metrics

#### `profiles`
- Extended user information beyond Supabase Auth
- Automatic profile creation on user registration

### Security
- **Row Level Security (RLS)** enabled on all tables
- **User-based access control** for data isolation
- **Authenticated-only policies** for sensitive operations

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui components
│   ├── AuthGuard.tsx    # Route protection
│   ├── Header.tsx       # Navigation header
│   ├── ThemeToggle.tsx  # Dark/light mode toggle
│   ├── GlobalDisasterMap.tsx    # Main disaster map
│   ├── InteractiveMap.tsx       # Google Maps wrapper
│   ├── LazyInteractiveMap.tsx   # Optimized map loading
│   ├── ResourceMap.tsx          # Resource visualization
│   ├── DisasterForm.tsx         # Disaster creation form
│   ├── DisasterList.tsx         # Disaster display
│   ├── ReportForm.tsx           # Report submission
│   └── SocialMediaFeed.tsx      # Social media integration
├── contexts/            # React contexts
│   └── ThemeContext.tsx # Theme management
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase configuration
├── pages/               # Route components
│   ├── Index.tsx        # Dashboard homepage
│   ├── Map.tsx          # Earthquake risk map
│   ├── Auth.tsx         # Authentication page
│   └── NotFound.tsx     # 404 error page
└── lib/                 # Utility functions
```

## 🎯 Usage Guide

### For Emergency Responders
1. **Monitor Active Disasters**: View real-time disaster updates on the dashboard
2. **Track Resources**: Check availability of shelters, medical facilities, and supplies
3. **Coordinate Response**: Use the mapping features to plan resource deployment
4. **Update Status**: Mark disasters as resolved or under monitoring

### For Citizens
1. **Report Disasters**: Submit reports with photos and location data
2. **Find Resources**: Locate nearby shelters, food banks, and medical facilities
3. **Stay Informed**: Follow social media feeds for real-time updates
4. **Get Directions**: Use integrated navigation to reach safe locations

### For Administrators
1. **Manage Users**: Monitor user activity and manage permissions
2. **Verify Reports**: Review and validate user-submitted content
3. **Update Resources**: Maintain accurate resource information
4. **Monitor System**: Track platform usage and performance

## 🔧 Configuration

### Environment Setup
- The project uses Supabase for backend services
- Google Maps API key is required for mapping functionality
- All configuration is handled through the UI - no environment files needed

### Authentication
- Email/password authentication via Supabase Auth
- Automatic user profile creation
- Session persistence with automatic refresh
- Protected route system

### Real-time Features
- Live disaster updates
- Resource availability changes
- Social media feed updates
- Map marker updates

## 🚦 API Integration

### Google Maps API
- **Required APIs**: Maps JavaScript API, Places API
- **Features Used**: Interactive maps, geocoding, directions
- **Rate Limits**: Managed through API key quotas

### Supabase API
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: Built-in user management
- **Storage**: File uploads for disaster reports
- **Security**: Row Level Security policies

## 🤝 Contributing

We welcome contributions to DisasterTrack! Here's how you can help:

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests as needed
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add comments for complex logic
- Ensure responsive design

### Bug Reports
- Use the GitHub issue tracker
- Include steps to reproduce
- Provide browser and device information
- Include screenshots if applicable

## 📊 Performance Optimizations

- **Lazy loading** for map components
- **Batch processing** for map markers
- **Optimized re-renders** with React.memo
- **Efficient state management** with React Query
- **Image optimization** for user uploads
- **Code splitting** for reduced bundle size

## 🔒 Security Features

- **Row Level Security** on all database tables
- **Input validation** and sanitization
- **Secure authentication** with Supabase Auth
- **HTTPS enforcement** in production
- **CSRF protection** built into Supabase
- **SQL injection prevention** through parameterized queries

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for providing an excellent backend platform
- **Google Maps** for mapping and geolocation services
- **Shadcn/ui** for beautiful UI components
- **Tailwind CSS** for the styling framework
- **React Team** for the amazing framework

---

**DisasterTrack** - Saving lives through technology 🌍💙

Built with ❤️ for emergency response and disaster management
