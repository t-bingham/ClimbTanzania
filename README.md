
# Climbing Site Information Project

This project aims to provide accessible and easily communicable information about climbing in Tanzania. The site includes details on geological formations, how to reach climbing locations, and other relevant information to help climbers and landowners manage and enjoy climbing activities.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later) and npm
- Python (v3.8 or later)
- PostgreSQL

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/t-bingham/ClimbTanzania.git
   cd ClimbTanzania
   ```

2. **Set up the frontend:**
   ```sh
   cd frontend
   npm install
   ```

3. **Set up the backend:**
   ```sh
   cd ../backend
   python -m venv venv
   source venv/bin/activate # On Windows, use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

4. **Set up the database:**
   - Ensure PostgreSQL is installed and running.
   - Create a database and update the database URL in the backend settings.

### Running the Project

1. **Start the backend server:**
   ```sh
   cd backend
   uvicorn main:app --reload
   ```

2. **Start the frontend server:**
   ```sh
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

## Project Structure

```
ClimbTanzania/
├── backend/              # FastAPI backend
│   ├── app/              # Application modules
│   ├── main.py           # Entry point for the backend
│   └── requirements.txt  # Python dependencies
├── frontend/             # Next.js frontend
│   ├── components/       # React components
│   ├── pages/            # Next.js pages
│   ├── public/           # Public assets (e.g., logo)
│   ├── styles/           # CSS styles
│   ├── content/          # Text content files
│   ├── package.json      # NPM dependencies
│   └── next.config.js    # Next.js configuration
└── README.md             # Project documentation
```

## Technologies Used

- **Frontend:**
  - Next.js
  - React
  - Tailwind CSS
  - Leaflet (for maps)

- **Backend:**
  - FastAPI
  - PostgreSQL

## Available Scripts

In the `frontend` directory, you can run:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts the production server.

In the `backend` directory, you can run:

- `uvicorn main:app --reload`: Starts the FastAPI server with hot-reloading.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
