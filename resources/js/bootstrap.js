import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Jika Anda menggunakan Laravel Echo nantinya, konfigurasinya biasanya diletakkan di sini.
// import './echo';