# MERN Chat Application

This is a simple real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js) with WebSocket for real-time communication.

## Project Structure

```
mern-chat-app
├── backend
│   ├── controllers
│   │   └── chatController.js
│   ├── models
│   │   └── Message.js
│   ├── routes
│   │   └── chatRoutes.js
│   ├── server.js
│   └── package.json
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── components
│   │   │   └── Chat.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── README.md
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd mern-chat-app
   ```

2. Navigate to the backend directory and install dependencies:

   ```
   cd backend
   npm install
   ```

3. Navigate to the frontend directory and install dependencies:

   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:

   ```
   cd backend
   node server.js
   ```

2. Start the frontend application:

   ```
   cd ../frontend
   npm start
   ```

### Usage

- Open your browser and go to `http://localhost:3000` to access the chat application.
- You can send messages in real-time, and they will be broadcasted to all connected clients.

### Docker

To run the application using Docker, you can use the provided `docker-compose.yml` file. Make sure Docker is installed and running, then execute:

```
docker-compose up
```

This will start both the backend and the MongoDB database in containers.

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License.