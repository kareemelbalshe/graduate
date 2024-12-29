import axios, { InternalAxiosRequestConfig } from "axios";
import { inLocalhost } from "../../utils/localHelper";

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_REACT_APP_API_KEY}`,
});


if (!inLocalhost()) {
  axiosInstance.defaults.withXSRFToken = true;
  axiosInstance.defaults.withCredentials = true;
}

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const token = userInfo.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (
      error.response.status === 401 &&
      error.response.data.message == "You are not authenticated"
    ) {
      window.location.replace("/");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
