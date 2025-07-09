# WTWR (What to Wear?): Back End

This is the back-end server for the WTWR (What to Wear?) application — a service that helps users decide what to wear based on the weather.

## 🧰 Project Description

The project consists of building a RESTful API using **Node.js**, **Express**, and **MongoDB**, with full support for user authentication, CRUD operations, and secure access to resources.

The main features of this back-end server include:

- User registration and authentication (JWT-based)
- CRUD operations on clothing items
- Ability to like/unlike clothing items
- Public access to the clothing catalog
- Protected routes requiring user authentication
- Secure password hashing using bcrypt
- Input validation and proper error handling

---

## 🚀 Technologies and Techniques Used

- **Node.js** — runtime environment
- **Express.js** — web framework for routing and middleware
- **MongoDB + Mongoose** — database and ODM
- **bcryptjs** — secure password hashing
- **jsonwebtoken (JWT)** — for authentication and protected routes
- **Celebrate/Joi** — request validation
- **CORS** — to allow cross-origin requests
- **ESLint** — code linting for code quality
- **REST principles** — for structuring the API
- **Environment Variables** — to manage secrets securely
- **Error handling middleware** — centralized error management

---

## 🧪 Running the Project

Make sure MongoDB is running locally (default URI: `mongodb://127.0.0.1:27017/wtwr_db`)

### Installation

```bash
npm install
```

## Technologies and Techniques Used

- **launches the server** —

```bash
npm run start
```

- **Elaunches the server with hot reload (via nodemon)**

```bash
— npm run dev
```
