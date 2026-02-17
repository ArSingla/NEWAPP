# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)














# Service Platform Web Application

## Overview

This project implements a full-stack web application enabling a service marketplace with two types of users — **Customers** and **Service Providers** (like Chefs, Bartenders, Maids, and Waiters). The backend is built with **Java Spring Boot**, and the frontend uses **React.js** along with **Material-UI (MUI)** for a modern, responsive UI.

---

## Features Implemented So Far

### Backend (Java Spring Boot)

- **User Authentication:**  
  - Register and login endpoints with role-based registration (`CUSTOMER` vs `SERVICE_PROVIDER`)  
  - Password hashing with BCrypt  
  - Proper validation with Jakarta Validation (`@Valid`, `@NotBlank`, `@Email`)  
  - HTTP Basic Authentication setup for secure API access (can be extended to JWT later)

- **User Profile Management:**  
  - Secure retrieval and update of logged-in user profile  
  - Supports additional provider-specific info (provider type)  

- **Payment Integration:**  
  - Stripe payment intent creation via backend API endpoint  
  - Storing payment entities in the database (entity created)  
  - Configuration of Stripe API keys in application properties

- **Robust Error Handling:**   
  - Global exception handler for validation errors and other runtime exceptions  
  - Proper use of HTTP response codes and descriptive error messages

- **Security Configuration:**  
  - Role-based URL access configuration  
  - CSRF disabled for REST API  
  - Password encoder bean and security filter chain setup

- **Database:**  
  - Entities for User and Payment using JPA/Hibernate (with proper annotations)  
  - User and Payment repositories for database communication  
  - MySQL (or PostgreSQL) configured as data source (details in application.properties)  

---

### Frontend (React.js + Material-UI)

- **Authentication Forms:**  
  - Reusable form component (`AuthForm`) for login and signup  
  - Client-side validation with user-friendly inline error messages
  - Role and provider type selection for signup

- **Pages and Routing:**  
  - Login, Signup, Profile, and Payment pages implemented  
  - React Router for navigation between pages  

- **Profile Page:**  
  - Displays current user info fetched from backend  
  - Read-only view for now, with option to navigate to Payment

- **Payment Page:**  
  - Input for amount, payment creation through backend Stripe API call  
  - Success and error messages displayed inline to improve UX

- **Consistent Styling:**  
  - Material-UI theming for cohesive UI with primary and secondary color palettes  
  - Responsive layouts using Grid and Paper components  

- **Error Handling:**  
  - All API interactions wrapped with proper `try-catch`  
  - Friendly error/success messages shown with Material-UI's `Alert` component  

---

## Tech Stack

| Layer            | Technology                            |
|------------------|------------------------------------|
| Backend          | Java, Spring Boot, Spring Security |
| ORM              | Hibernate/JPA                      |
| Database         | MySQL/PostgreSQL                   |
| Payment Gateway  | Stripe API                        |
| Frontend         | React.js, Material-UI (MUI)       |
| HTTP Client      | Axios                            |
| Build/Dependency | Maven (Backend), NPM (Frontend)  |

---

## Project Structure (High-level)

