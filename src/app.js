import * as yup from 'yup';
import i18next from 'i18next';
import watch from './watchers.js';
import resources from './locales/index.js';

export default () => {
  const state = {
    form: {
      state: '',
      valid: true,
      error: null,
    },
    feeds: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    feedsBox: document.querySelector('.feeds'),
    postsBox: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    yup.setLocale({
      mixed: {
        notOneOf: () => ({ key: 'errors.exists' }),
      },
      string: {
        url: () => ({ key: 'errors.notUrl' }),
      },
    });

    const watchedState = watch(state, elements, i18nextInstance);
    elements.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const url = data.get('url');

      const userSchema = yup.string().url().notOneOf(state.feeds);

      userSchema.validate(url)
        .then(() => {
          watchedState.feeds.push(url);
          watchedState.form = {
            ...watchedState.form,
            error: null,
            valid: true,
          };
        })
        .catch((error) => {
          watchedState.form = {
            ...watchedState.form,
            error: error.message.key,
            valid: false,
          };
        });
    });
  });
};
