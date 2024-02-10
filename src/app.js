import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import watch from './watchers.js';
import resources from './locales/index.js';
import parse from './rss.js';

const loadRss = (watchedState, url) => {
  watchedState.loadingProcess.status = 'loading';
  axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
    .then((response) => {
      const feedData = parse(response.data.contents);
      const feed = {
        url, id: uniqueId(), title: feedData.title, description: feedData.description,
      };
      const posts = feedData.items.map((item) => ({ ...item, channelId: feed.id, id: uniqueId() }));
      watchedState.feeds.unshift(feed);
      watchedState.posts.unshift(...posts);

      watchedState.loadingProcess.error = null;
      watchedState.loadingProcess.status = 'success';
    })
    .catch(() => {
      watchedState.loadingProcess.error = 'errors.noRss';
      watchedState.loadingProcess.status = 'failed';
    });
};

export default () => {
  const state = {
    form: {
      state: '',
      valid: true,
      error: null,
    },
    feeds: [],
    posts: [],
    loadingProcess: {
      status: '',
      error: null,
    },
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
      const feedUrls = watchedState.feeds.map((feed) => feed.url);
      const userSchema = yup.string().url().notOneOf(feedUrls);

      userSchema.validate(url)
        .then(() => {
          watchedState.form = {
            ...watchedState.form,
            error: null,
            valid: true,
          };
          loadRss(watchedState, url);
        })
        .catch((error) => {
          console.log('error', error);
          watchedState.form = {
            ...watchedState.form,
            error: error.message.key,
            valid: false,
          };
        });
    });
  });
};
