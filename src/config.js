// config.js
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const config = {
    backendUrl: API_URL,
};

export default config;
export { API_URL };