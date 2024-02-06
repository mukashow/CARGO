import { toast } from 'react-toastify';
import axios from 'axios';
import i18next from 'i18next';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const reset = () => {
  localStorage.removeItem('cargoRefreshToken');
  localStorage.removeItem('cargoToken');
  localStorage.removeItem('cargoRoleId');
  localStorage.removeItem('cargoRoleName');
  localStorage.removeItem('cargoName');
  localStorage.removeItem('cargoLastName');
  localStorage.removeItem('cargoOtchestvo');
  localStorage.removeItem('hasStorekeeperPermissions');
  localStorage.removeItem('hasCashierPermissions');
  localStorage.removeItem('visibleWarehouses');
  localStorage.removeItem('visibleWarehousesInit');
  localStorage.removeItem('hiddenWarehouses');
  localStorage.removeItem('hiddenWarehousesInit');
  localStorage.removeItem('warehouseDimensions');
  localStorage.removeItem('warehouseDimensionsInit');
};

const axiosInstanceCreator = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_PATH,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });

  instance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('cargoToken');
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
      }
      config.headers['Accept-Language'] =
        i18next.language === 'zhHans' ? 'zh-hans' : i18next.language;
      return config;
    },
    error => Promise.reject(error)
  );

  return instance;
};

export const uninterceptedAxiosInstance = axiosInstanceCreator();
const axiosInstance = axiosInstanceCreator();

uninterceptedAxiosInstance.interceptors.response.use(
  response => response,
  error => onError(error, false)
);
axiosInstance.interceptors.response.use(response => response, onError);

function onError(error, showToast = true) {
  const originalRequest = error.config;

  if (error.request.status === 0 && showToast) {
    toast.error('Ошибка сети, проверьте интернет', { toastId: '' });
  }
  if (error.config.url === 'login/refresh/') {
    reset();
    window.location.reload();
    return;
  }
  if (error.response.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refresh = localStorage.getItem('cargoRefreshToken');
    return new Promise(function (resolve, reject) {
      axiosInstance
        .post('login/refresh/', { refresh })
        .then(({ data }) => {
          localStorage.setItem('cargoToken', data.access);
          localStorage.setItem('cargoRefreshToken', data.refresh);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.access;
          originalRequest.headers['Authorization'] = 'Bearer ' + data.access;
          processQueue(null, data.access);
          resolve(
            axios(originalRequest).catch(() => {
              reset();
              window.location.reload();
            })
          );
        })
        .catch(err => {
          reset();

          processQueue(err, null);
          reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }

  if (error.response.status >= 500 && showToast) {
    toast.error('Something went wrong on server');
  }

  if (error.response.data?.detail && showToast) {
    toast.error(error.response.data.detail);
  }

  return Promise.reject(error);
}

export default axiosInstance;
