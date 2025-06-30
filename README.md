# DocSpot – Online Doctor Appointment Booking System

DocSpot is a full-stack web application developed using the MERN stack (MongoDB, Express.js, React, Node.js) that enables users to book doctor appointments online. It features secure, role-based access for patients, doctors, and administrators, and includes functionalities such as doctor application approval, appointment scheduling, and system notifications.

## Features

- Role-based authentication (Patient, Doctor, Admin)
- Doctor registration with admin approval workflow
- Appointment scheduling and availability checking
- Notification system with read/unread tracking
- Admin dashboard for managing users and doctors
- Form validation using Formik and Yup
- Responsive and intuitive user interface built with React and Material UI

## Technology Stack

**Frontend**: React.js, Redux Toolkit, Material UI, Axios, Formik, Yup  
**Backend**: Node.js, Express.js, JWT, Mongoose  
**Database**: MongoDB  
**Other Tools**: Moment.js, ESLint, Git, Postman, react-phone-input-2

## Folder Structure

docspot/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ ├── views/
│ │ ├── redux/
│ │ ├── routes/
│ │ ├── utils/
│ │ └── App.tsx
├── server/ # Node.js backend
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ ├── app.js
│ └── server.js

## Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB
- Git

### Installation Steps

1. Clone the repository:
git clone https://github.com/VasthaviSreya-Thumu/DocSpot.git
cd DocSpot


2. Set up the server:
cd server
npm install


Create a `.env` file in the `server/` directory with the following variables:
DATABASE=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=8000
NODE_ENV=development


3. Set up the client:
cd ../client
npm install


Create a `.env` file in the `client/` directory with:
REACT_APP_API_URL=http://127.0.0.1:8000/api/v1/


## Running the Application

To run the application locally:

1. Start the backend server:
cd server
npm run server


2. Start the frontend React application:
cd ../client
npm start


## Known Issues

- Password reset functionality is not yet implemented
- Some admin routes are only partially protected
- Notifications are not updated in real-time

## Future Enhancements

- Integration of video consultations
- Real-time WebSocket notifications
- Online payment processing
- Email and SMS notification system
- Password recovery and reset functionality
