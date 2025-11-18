import axios from 'axios';

export const getWeatherForecast = async (lat: number, lon: number) => {
  const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  return response.data;
};