import axios from 'axios';

const baseURL = 'https://xeno-canto.org/api/2';

const API = axios.create({
  baseURL,
})

export const fetchBirds = () => API.get('/recordings?query=year:2010');
