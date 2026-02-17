# Service Platform Application

A full-stack web application with user authentication, social media signup, and payment processing.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm (for both frontend and backend)
- **MongoDB** running on localhost:27017 (or MongoDB Atlas)

### Option 1: Start Everything at Once
```bash
bash start-app.sh
```
This will automatically:
- Install dependencies if missing
- Create `.env` files if needed
- Start both backend and frontend services

### Option 2: Start Services Individually
```bash
# Start Backend (Node.js/Express)
bash start-backend.sh

# Start Frontend (React) - in a new terminal
bash start-frontend.sh
```

## 📱 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

## ✨ Features

### 🔐 Authentication
- **User Registration**: Sign up with email/password
- **User Login**: Secure authentication with cookies
- **Social Media Signup**: Google, Facebook, Instagram (OAuth ready)
- **Password Visibility Toggle**: Eye icon to show/hide password
- **Duplicate Email Prevention**: Cannot register with same email twice
- **Protected Routes**: Profile and payment pages require authentication

### 🍪 Cookie Management
- Automatic session management
- Secure cookie storage
- Automatic logout functionality

### 🎨 User Interface
- Modern Material-UI design
- Responsive layout
- Navigation header with user info
- Success/error message handling

## 🛠️ Technical Stack

### Frontend
- React 18+
- Material-UI / Tailwind CSS
- React Router
- Axios for API calls

### Backend
- Node.js 18+ (Express.js)
- MongoDB (Mongoose ODM)
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

### Database
- MongoDB (local instance or MongoDB Atlas)
- Database: `service_platform`
- Collections: `users`, `payments`, `ratings`, `plans`, `addresses`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory for social authentication:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
REACT_APP_INSTAGRAM_CLIENT_ID=your-instagram-client-id
```

### MongoDB Setup
Ensure MongoDB is running locally on port 27017:
```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Or start manually
mongod
```

## 📁 Project Structure

```
NEWAPP/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   └── package.json
├── backend/                 # Node.js/Express application
│   ├── routes/             # API routes
│   ├── models/             # Mongoose models
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration files
│   ├── server.js           # Main application file
│   ├── package.json        # Node.js dependencies
│   └── .env                # Environment variables
├── start-app.sh            # Master startup script
├── start-backend.sh        # Backend startup script
├── start-frontend.sh       # Frontend startup script
└── README.md
```

## 🔍 Troubleshooting

### Backend Not Starting
1. Check if MongoDB is running
2. Check if Node.js 18+ is installed: `node -v`
3. Install dependencies: `cd backend && npm install`
4. Check `backend.log` for errors
5. Ensure port 8080 is available
6. Verify `.env` file exists in `backend/` directory

### Frontend Not Starting
1. Check if Node.js is installed
2. Run `npm install` in frontend directory
3. Check `frontend.log` for errors

### CORS Issues
- Backend has CORS configured for development
- If issues persist, check browser console for errors

### Database Issues
- Ensure MongoDB is running on localhost:27017
- Check MongoDB connection in `backend/.env`
- Verify MongoDB credentials in `backend/.env`

## 🚀 Deployment

### Production Setup
1. Set up MongoDB Atlas or production MongoDB
2. Configure environment variables
3. Set up OAuth apps for social authentication
4. Deploy backend to cloud platform
5. Deploy frontend to static hosting

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/facebook` - Facebook OAuth
- `POST /api/auth/instagram` - Instagram OAuth

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
