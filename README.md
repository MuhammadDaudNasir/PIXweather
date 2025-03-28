# PIXweather



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

This project is licensed under the Aegis License - see the [LICENSE](LICENSE) file for details.

## Contact

Developed by [Muhammad Daud Nasir](https://github.com/MuhammadDaudNasir)

- GitHub: [@MuhammadDaudNasir](https://github.com/MuhammadDaudNasir)
- Website: [PIXweather](https://pixweather.vercel.app/)


## Media

Media By the Courtesy of Muhammad Daud Nasir & Ali hamdan 
![og-image](https://github.com/user-attachments/assets/b9184397-e049-43b5-9142-36f0f0d6eef4)  ICON/LOGO

![Screenshot 2025-03-25 164601](https://github.com/user-attachments/assets/e647cc56-4c81-4b7b-8d14-26e80a95207b)
![Screenshot 2025-03-25 164550](https://github.com/user-attachments/assets/22a9f535-2819-42f8-9636-47f46e1a7ebf)
![Screenshot 2025-03-25 164545](https://github.com/user-attachments/assets/86a55440-ec9e-49c8-b2e3-cc1fe460cea0)
![Screenshot 2025-03-25 164533](https://github.com/user-attachments/assets/4597b66a-1a58-4f2c-9ed0-57eb37d38c89)
![Screenshot 2025-03-25 164521](https://github.com/user-attachments/assets/bcc662a2-292f-4d5b-909a-02802064d13e)
![Screenshot 2025-03-25 163010](https://github.com/user-attachments/assets/e1d449bc-0c83-47f7-ba2c-75cfd5f5e5ac)
![Screenshot 2025-03-25 164646](https://github.com/user-attachments/assets/29d1be37-205b-4c26-9664-77c512ec0670)
![Screenshot 2025-03-25 164637](https://github.com/user-attachments/assets/419f6f9b-d0e2-4564-9bfb-f6a614d25b65)
![Screenshot 2025-03-25 164629](https://github.com/user-attachments/assets/bfae1e3f-1f62-447e-af06-ede54f936fcb)
![Screenshot 2025-03-25 164611](https://github.com/user-attachments/assets/ad141b44-0918-4024-870c-2422c5533e2b)

