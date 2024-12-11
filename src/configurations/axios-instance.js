import axios from "axios";

const axiosInstance = axios.create({
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    }
});

axiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;