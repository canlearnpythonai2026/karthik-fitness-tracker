import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 10000,
});

export const getToday = () => API.get("/api/today").then(r => r.data);
export const getDay = (date: string) => API.get(`/api/day/${date}`).then(r => r.data);
export const getWeek = (start?: string) => API.get("/api/week", { params: { start } }).then(r => r.data);
export const getDashboard = () => API.get("/api/dashboard").then(r => r.data);
export const getWorkoutLog = (date: string) => API.get(`/api/workout-log/${date}`).then(r => r.data);
export const saveWorkoutLog = (data: object) => API.post("/api/workout-log", data).then(r => r.data);
export const saveExerciseLog = (data: object) => API.post("/api/exercise-log", data).then(r => r.data);
export const saveWeeklyWeight = (data: object) => API.post("/api/weekly-weight", data).then(r => r.data);
export const saveMonthlyCheckin = (data: object) => API.post("/api/monthly-checkin", data).then(r => r.data);
export const saveStrengthLog = (data: object) => API.post("/api/strength-log", data).then(r => r.data);
export const getStrengthLogs = () => API.get("/api/strength-log").then(r => r.data);
export const getExerciseGif = (name: string) => API.get(`/api/exercise-gif/${encodeURIComponent(name)}`).then(r => r.data);

export default API;
