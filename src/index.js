import './styles.scss';
import 'bootstrap';
import { string } from 'yup';
import watch from './watchers.js';

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('.rss-form input'),
  feedback: document.querySelector('.feedback'),
  submit: document.querySelector('.rss-form button[type="submit"]'),
  feedsBox: document.querySelector('.feeds'),
  postsBox: document.querySelector('.posts'),
  modal: document.querySelector('#modal'),
};

const state = {
  form: {
    state: '',
    isValid: false,
    error: null,
  },
  feeds: [],
};

const watchedState = watch(state, elements);
elements.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const url = data.get('url');

  const userSchema = string().url('Ссылка должна быть валидным URL').notOneOf(state.feeds, 'RSS уже существует');

  userSchema.validate(url).then(() => {
    watchedState.feeds.push(url);
  }).catch((error) => {
    watchedState.form.error = error.message;
    watchedState.isValid = false;
  });
});
