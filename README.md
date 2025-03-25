# PIXweather

![PIXweather](https://your-image-url-here.com/banner.png)

PIXweather is a modern weather web app that provides real-time weather updates, relevant news, and dynamic backgrounds based on location. Built with React and FastAPI, it integrates WeatherAPI for weather data, Pixabay API for background images, and News API for regional news.

## Features

- 🌤 Real-time weather updates using WeatherAPI
- 📰 Local news integration with News API
- 🖼 Dynamic backgrounds based on country using Pixabay API
- 📍 Location-based weather forecasting
- 🔗 Deployed on Vercel for seamless access

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** FastAPI
- **APIs Used:**
  - WeatherAPI (for weather data)
  - Pixabay API (for dynamic backgrounds)
  - News API (for regional news)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v16+)
- Python (3.9+)
- Git

### Installation

1. **Clone the Repository**
   ```sh
   git clone https://github.com/MuhammadDaudNasir/PIXweather.git
   cd PIXweather
   ```

2. **Set Up the Backend**
   ```sh
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. **Set Up the Frontend**
   ```sh
   cd frontend
   npm install
   ```

4. **Set Up Environment Variables**
   Create a `.env` file in the `backend` directory and add:
   ```env
   WEATHER_API_KEY=your_weatherapi_key
   PIXABAY_API_KEY=your_pixabay_key
   NEWS_API_KEY=your_newsapi_key
   ```
   
   For the frontend, create a `.env` file in `frontend` and add:
   ```env
   VITE_BACKEND_URL=http://localhost:8000
   ```

### Running the Project

#### Start Backend
```sh
cd backend
uvicorn main:app --reload
```

#### Start Frontend
```sh
cd frontend
npm run dev
```

## Deployment

### Deploying Backend on Vercel
1. Install the Vercel CLI:
   ```sh
   npm install -g vercel
   ```
2. Deploy the backend:
   ```sh
   cd backend
   vercel
   ```

### Deploying Frontend on Vercel
1. Deploy the frontend:
   ```sh
   cd frontend
   vercel
   ```

## Contributing

Contributions are welcome! However, forking or redistributing this project requires prior permission and proper credits to the original author.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Contact

Developed by [Muhammad Daud Nasir](https://github.com/MuhammadDaudNasir)

- GitHub: [@MuhammadDaudNasir](https://github.com/MuhammadDaudNasir)
- Website: [PIXweather](https://pixweather.vercel.app/)

