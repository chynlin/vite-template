import axios from 'axios';
import qs from 'qs';
import { showFailToast } from 'vant';
import router from '@/router/index.js';
import store from '@/store/index.js';

// axios.defaults.baseURL = ''  //正式
// axios.defaults.baseURL = 'http://test' //测试

//post请求头
axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded;charset=UTF-8';
//设置超时
axios.defaults.timeout = 10000;

axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    if (response.status == 200) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },
  (error) => {
    showFailToast(`异常请求：${JSON.stringify(error.message)}`);
  }
);
export default {
  post(url, data) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url: url + `?language=${store.state.language}`,
        data: data instanceof FormData ? data : qs.stringify(data),
      })
        .then((res) => {
          if (
            (res.data.error === 10002 || res.data.error === 10004) &&
            url.indexOf('user/info') < 0
          ) {
            showFailToast(res.data.msg);
            store.commit('set_is_login', false);
            router.replace('/sign');
          }
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  get(url, data) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
        params: data,
      })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
