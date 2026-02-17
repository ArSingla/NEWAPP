# Service Platform - File Editing Guide

This guide explains exactly which files to edit for different types of changes in your Service Platform application.

## 📁 Project Structure Overview

```
NEWAPP/
├── frontend/                 # React Frontend Application
│   ├── public/              # Static files (HTML, images)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context providers
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration files
│   │   ├── App.js          # Main app component
│   │   ├── index.js        # App entry point
│   │   └── theme.js        # Material-UI theme
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js/Express Backend
│   ├── routes/             # API route handlers
│   │   ├── auth.js        # Authentication routes
│   │   ├── profile.js     # User profile routes
│   │   ├── payment.js     # Payment routes
│   │   └── ...            # Other routes
│   ├── models/             # Mongoose data models
│   │   ├── User.js        # User model
│   │   ├── Payment.js     # Payment model
│   │   └── ...            # Other models
│   ├── services/           # Business logic services
│   │   ├── emailService.js
│   │   └── paymentService.js
│   ├── middleware/         # Express middleware
│   │   └── auth.js        # JWT authentication
│   ├── config/             # Configuration
│   │   └── database.js    # MongoDB connection
│   ├── server.js           # Main Express application
│   ├── package.json        # Node.js dependencies
│   └── .env                # Environment variables
└── README.md               # Main project documentation
```

## 🎨 Frontend File Editing Guide

### **CSS/Styling Changes**

#### **Component-Specific Styling**
- **File to Edit**: `frontend/src/components/[ComponentName].css`
- **Examples**:
  - `frontend/src/components/ServiceOptions.css` - Service cards styling
  - `frontend/src/components/AuthForm.css` - Login/signup form styling
- **What to Edit**: CSS classes, animations, responsive design
- **Don't Edit**: Component logic (JSX/JavaScript)

#### **Global Styling**
- **File to Edit**: `frontend/src/index.css`
- **What to Edit**: Global CSS variables, body styles, common classes
- **Don't Edit**: Component-specific styles

#### **Theme Changes**
- **File to Edit**: `frontend/src/theme.js`
- **What to Edit**: Material-UI theme configuration, colors, typography
- **Don't Edit**: Component-specific styling

#### **Dark/Light Mode Styling**
- **File to Edit**: `frontend/src/context/ThemeContext.js`
- **What to Edit**: CSS variables for theme colors
- **Don't Edit**: Component-specific CSS files

### **JavaScript/React Logic Changes**

#### **Page Components**
- **Files to Edit**: `frontend/src/pages/[PageName].js`
- **Examples**:
  - `frontend/src/pages/LoginPage.js` - Login functionality
  - `frontend/src/pages/SignupPage.js` - Registration functionality
  - `frontend/src/pages/AccountPage.js` - Account management
  - `frontend/src/pages/CustomerDashboard.js` - Service browsing
- **What to Edit**: Page logic, state management, API calls
- **Don't Edit**: CSS styling (use separate CSS files)

#### **Reusable Components**
- **Files to Edit**: `frontend/src/components/[ComponentName].js`
- **Examples**:
  - `frontend/src/components/AuthForm.js` - Authentication forms
  - `frontend/src/components/ServiceOptions.js` - Service cards
  - `frontend/src/components/NavigationHeader.js` - Top navigation
- **What to Edit**: Component logic, props, event handlers
- **Don't Edit**: Page-level logic

#### **App Configuration**
- **File to Edit**: `frontend/src/App.js`
- **What to Edit**: Routing, global providers, app structure
- **Don't Edit**: Individual page/component logic

#### **Utility Functions**
- **File to Edit**: `frontend/src/utils/[UtilityName].js`
- **Examples**:
  - `frontend/src/utils/cookieUtils.js` - Cookie management
- **What to Edit**: Helper functions, utilities
- **Don't Edit**: Component logic

#### **Context Providers**
- **File to Edit**: `frontend/src/context/[ContextName].js`
- **Examples**:
  - `frontend/src/context/ThemeContext.js` - Theme management
- **What to Edit**: Context logic, state management
- **Don't Edit**: Component-specific logic

### **Configuration Changes**

#### **Environment Variables**
- **File to Edit**: `frontend/.env` (create if doesn't exist)
- **What to Edit**: API URLs, external service keys
- **Don't Edit**: Hardcoded values in components

#### **Package Dependencies**
- **File to Edit**: `frontend/package.json`
- **What to Edit**: Dependencies, scripts
- **Don't Edit**: Import statements in components

## 🔧 Backend File Editing Guide

### **API Endpoints**

#### **Express Routes**
- **Files to Edit**: `backend/routes/[RouteName].js`
- **Examples**:
  - `backend/routes/auth.js` - Authentication endpoints
  - `backend/routes/profile.js` - User profile endpoints
  - `backend/routes/payment.js` - Payment endpoints
  - `backend/routes/serviceRoutes.js` - Service/booking endpoints
  - `backend/routes/provider.js` - Provider stats endpoints
  - `backend/routes/admin.js` - Admin endpoints
- **What to Edit**: API endpoints, request/response handling, route definitions
- **Don't Edit**: Business logic (move to Service layer)

#### **Data Models (Mongoose Schemas)**
- **Files to Edit**: `backend/models/[ModelName].js`
- **Examples**:
  - `backend/models/User.js` - User schema
  - `backend/models/Payment.js` - Payment schema
  - `backend/models/Rating.js` - Rating schema
  - `backend/models/Plan.js` - Plan schema
  - `backend/models/Address.js` - Address schema
- **What to Edit**: Mongoose schema definitions, validations, methods
- **Don't Edit**: Business logic

### **Business Logic**

#### **Service Layer**
- **Files to Edit**: `backend/services/[ServiceName].js`
- **Examples**:
  - `backend/services/paymentService.js` - Payment processing (Stripe integration)
  - `backend/services/emailService.js` - Email sending (verification codes)
- **What to Edit**: Business logic, external API integrations, data processing
- **Don't Edit**: API endpoints (move to Routes)

### **Middleware**

#### **Authentication Middleware**
- **File to Edit**: `backend/middleware/auth.js`
- **What to Edit**: JWT token verification, user authentication logic
- **Don't Edit**: Route definitions

### **Configuration**

#### **Environment Variables**
- **File to Edit**: `backend/.env` (use `.env.example` as template)
- **What to Edit**: 
  - MongoDB connection settings
  - JWT secret key
  - Stripe API key
  - Email service credentials
  - Feature flags
- **Don't Edit**: Hardcoded values in JavaScript files

#### **Database Configuration**
- **File to Edit**: `backend/config/database.js`
- **What to Edit**: MongoDB connection logic, connection options
- **Don't Edit**: Environment variables (use `.env` file)

#### **Main Application**
- **File to Edit**: `backend/server.js`
- **What to Edit**: Express app setup, middleware configuration, route mounting
- **Don't Edit**: Individual route logic (edit route files)

### **Dependencies**
- **File to Edit**: `backend/package.json`
- **What to Edit**: npm dependencies, scripts
- **Don't Edit**: Import statements in JavaScript files

## 🚀 Common Editing Scenarios

### **Adding a New Page**
1. **Frontend**: Create `frontend/src/pages/NewPage.js`
2. **Frontend**: Add route in `frontend/src/App.js`
3. **Frontend**: Add navigation in `frontend/src/components/NavigationHeader.js`
4. **Backend**: Create route file if needed in `backend/routes/`
5. **Backend**: Mount route in `backend/server.js` if new file
6. **Backend**: Create service if needed in `backend/services/`

### **Adding a New Component**
1. **Frontend**: Create `frontend/src/components/NewComponent.js`
2. **Frontend**: Create `frontend/src/components/NewComponent.css` (if styling needed)
3. **Frontend**: Import and use in relevant pages

### **Adding a New API Endpoint**
1. **Backend**: Add route handler in existing route file or create new route file in `backend/routes/`
2. **Backend**: Mount route in `backend/server.js` if new file
3. **Backend**: Add business logic in service layer (`backend/services/`)
4. **Backend**: Use Mongoose models for data access (`backend/models/`)
5. **Frontend**: Call new endpoint from relevant component

### **Changing Styling**
1. **Component-specific**: Edit `frontend/src/components/[ComponentName].css`
2. **Global**: Edit `frontend/src/index.css`
3. **Theme**: Edit `frontend/src/theme.js`
4. **Dark mode**: Edit `frontend/src/context/ThemeContext.js`

### **Adding New Features**
1. **Frontend Logic**: Edit relevant page/component JS files
2. **Frontend Styling**: Edit relevant CSS files
3. **Backend API**: Edit route and service files
4. **Database**: Edit Mongoose model files

## ⚠️ Important Rules

### **DO Edit:**
- ✅ Component-specific logic in component JS files
- ✅ Component-specific styling in component CSS files
- ✅ Page logic in page JS files
- ✅ API endpoints in route files (`backend/routes/`)
- ✅ Business logic in service files (`backend/services/`)
- ✅ Data models in Mongoose model files (`backend/models/`)
- ✅ Configuration in `.env` files and config files

### **DON'T Edit:**
- ❌ Component logic in CSS files
- ❌ Styling in JS files (use CSS files instead)
- ❌ Business logic in route files (use service layer)
- ❌ API endpoints in service files (use route layer)
- ❌ Hardcoded values in components/services (use environment variables)
- ❌ Database queries in route files (use Mongoose models directly)

## 🔄 File Dependencies

### **Frontend Dependencies:**
- `App.js` → imports all pages and components
- `pages/` → import components and utilities
- `components/` → import utilities and context
- `context/` → used by components and pages

### **Backend Dependencies:**
- `server.js` → mounts `Routes` and uses `Config`
- `Routes` → use `Services`, `Models`, and `Middleware`
- `Services` → use `Models` for data access
- `Middleware` → used by `Routes` for authentication
- `Models` → Mongoose schemas for database operations
- `Config` → used by `server.js` for MongoDB connection

## 📝 Best Practices

1. **Separation of Concerns**: Keep logic, styling, and configuration separate
2. **Single Responsibility**: Each file should have one clear purpose
3. **Consistent Naming**: Use clear, descriptive file and function names
4. **Error Handling**: Add proper error handling in both frontend and backend
5. **Validation**: Validate data in both frontend and backend
6. **Documentation**: Add comments for complex logic
7. **Testing**: Test changes in both development and production environments

## 🚨 Emergency Fixes

### **Frontend Not Loading:**
1. Check `frontend/src/App.js` for import errors
2. Check `frontend/src/index.js` for entry point issues
3. Check browser console for JavaScript errors

### **Backend Not Starting:**
1. Check `backend/.env` for configuration
2. Check `backend/package.json` for dependency issues
3. Install dependencies: `cd backend && npm install`
4. Check MongoDB connection in `backend/config/database.js`
5. Verify Node.js version: `node -v` (should be 18+)
6. Check `backend.log` for error messages

### **Styling Issues:**
1. Check relevant CSS files for syntax errors
2. Check `frontend/src/theme.js` for theme configuration
3. Check `frontend/src/context/ThemeContext.js` for theme variables

This guide should help you navigate the codebase and make changes efficiently while maintaining code quality and structure.
