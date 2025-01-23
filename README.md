# Meet and Greet Room Booking Application

A user-friendly platform for managing rooms and bookings efficiently, complete with authentication, booking validation, and data visualization.

---

## Table of Contents
1. [Introduction](#introduction)
2. [Problem & Solution](#problem--solution)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Live Demo](#live-demo)
8. [Benefits](#benefits)
9. [Future Plans](#future-plans)

---

## Introduction

The **Meet and Greet Room Booking Application** allows users to manage rooms and bookings with ease. It provides a robust platform for room scheduling and appointment booking, ensuring data validation and security at every step.

---

## Problem & Solution

### **Problem**
Managing rooms and bookings often involves challenges like:
- Double booking conflicts
- Lack of a user-friendly interface
- Inability to track room availability in real-time
- Limited authentication mechanisms for secure access

### **Solution**
This application provides:
- A user-friendly interface for creating, editing, and managing rooms and bookings
- Real-time booking validation to prevent overlaps
- Secure user authentication and registration using Spring Security
- A visually clear overview of room availability and bookings

---

## Features

### Room Management
- Create, edit, and delete rooms with validation to ensure unique names and appropriate data entry.
- Sort and filter rooms by name, availability, and location.
- Undo accidental deletions via notifications.

### Booking Management
- Book rooms for specific time frames using a slider and input fields.
- View a room's availability in real-time.
- Get a detailed overview of all bookings, including a calendar display.
- Cancel bookings when necessary.

### User Authentication
- Login and registration functionalities using Spring Security.
- Secure access to all pages only after logging in.

### Notifications
- Receive instant notifications for deletions and booking confirmations.

### Availability Status
- Visually distinguish between occupied and available rooms.
- Display the duration for which a room is occupied.

---

## Technology Stack

### Backend:
- **Java** with **Spring Boot** for robust backend development
- **JPA** (Java Persistence API) for modeling and managing database interactions
- **Lombok** for cleaner and more concise code

### Frontend:
- **HTML**, **CSS**, and **JavaScript** for a dynamic and responsive interface
- **Bootstrap** for UI components

### Database:
- **MySQL** for efficient data storage and retrieval
- Relationships between users, rooms, and bookings modeled with JPA

### Deployment:
- **Azure DevOps** for CI/CD pipelines and deployment
- **Agile and Scrum methodologies** for iterative development

---

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/hafizsalman/Hafiz_Salman_Meet_And_Greet.git
   ```
2. **Backend Setup**
   - Navigate to the backend directory:
     ```bash
     cd Meet_And_Greet_BE
     ```
   - Install dependencies and run the application:
     ```bash
     mvn install
     mvn spring-boot:run
     ```
3. **Frontend Setup**
   - Navigate to the frontend directory:
     ```bash
     cd Meet_And_Greet_FE
     ```
   - Install dependencies and start the application:
     ```bash
     npm install
     npm start
     ```

---

## Usage

1. **Login and Registration**
   - Access the login page to sign in or create a new account.
   - Only authenticated users can access other pages.

2. **Room Management**
   - View all rooms on the homepage, sorted alphabetically.
   - Search, filter, and sort rooms as needed.
   - Create, edit, or delete rooms using a user-friendly form.

3. **Booking Management**
   - Click on a room to book it for a specific time frame.
   - View existing bookings on the room detail page.
   - Delete or undo bookings with notifications.

---

## Live Demo

To view a live demonstration of the application, visit: [Live Demo Link](https://drive.google.com/file/d/1RWJQ5zAGeASMbgzDf90iGVKREhmTaIck/view?usp=drive_link)  
*(Replace with the actual link to the deployed application)*

---

## Benefits

- **Extensively Tested Booking Module**: The main booking module has undergone rigorous testing to ensure reliability and performance.
- **Future-Proof Design**: Built with scalability in mind, using modern technologies like Spring Boot and MySQL.
- **Secure Authentication**: Users' data is protected with industry-standard security measures.

---

## Future Plans

1. **Enhanced Reporting**:
   - Add advanced analytics and reporting for room utilization.
   - Provide downloadable booking summaries.

2. **Calendar Integration**:
   - Integrate with Google Calendar for syncing appointments.

3. **Mobile-Friendly Design**:
   - Develop a fully responsive mobile application for users on the go.

4. **Notification System**:
   - Enable email and SMS notifications for booking confirmations and reminders.

5. **Role-Based Access**:
   - Introduce admin roles for managing rooms and bookings at a higher level.

     
