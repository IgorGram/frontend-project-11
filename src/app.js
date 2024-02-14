import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import differenceWith from 'lodash/differenceWith.js';
import watch from './watchers.js';
import resources from './locales/index.js';
import parse from './rss.js';

const fetchingTimeout = 5000;

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const fetchNewPosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => axios.get(addProxy(feed.url))
    .then((response) => {
      const feedData = parse(response.data.contents);
      const newPosts = feedData.items.map((item) => ({ ...item, channelId: feed.id }));
      const oldPosts = watchedState.posts.filter((post) => post.channelId === feed.id);
      const posts = differenceWith(newPosts, oldPosts, (p1, p2) => p1.title === p2.title)
        .map((post) => ({ ...post, id: uniqueId() }));
      watchedState.posts.unshift(...posts);
    })
    .catch((e) => {
      console.error(e);
    }));
  Promise.all(promises).finally(() => {
    setTimeout(() => fetchNewPosts(watchedState), fetchingTimeout);
  });
};
const loadRss = (watchedState, url) => {
  // eslint-disable-next-line no-param-reassign
  watchedState.loadingProcess.status = 'loading';
  axios.get(addProxy(url))
    .then((response) => {
      const feedData = parse(response.data.contents);
      const feed = {
        url, id: uniqueId(), title: feedData.title, description: feedData.description,
      };
      const posts = feedData.items.map((item) => ({ ...item, channelId: feed.id, id: uniqueId() }));
      watchedState.posts.unshift(...posts);
      watchedState.feeds.unshift(feed);

      // eslint-disable-next-line no-param-reassign
      watchedState.loadingProcess.error = null;
      // eslint-disable-next-line no-param-reassign
      watchedState.loadingProcess.status = 'success';
    })
    .catch((e) => {
      let errorText;
      if (e.isParsingError) {
        errorText = 'errors.noRss';
      }
      if (e.isAxiosError) {
        errorText = 'errors.network';
      }

      // eslint-disable-next-line no-param-reassign
      watchedState.loadingProcess.error = errorText;
      // eslint-disable-next-line no-param-reassign
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
    modal: {
      postId: null,
    },
    ui: {
      seenPosts: new Set(),
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

    elements.postsBox.addEventListener('click', (evt) => {
      if (!('id' in evt.target.dataset)) {
        return;
      }

      const { id } = evt.target.dataset;
      watchedState.modal.postId = String(id);
      watchedState.ui.seenPosts.add(id);
    });

    setTimeout(() => fetchNewPosts(watchedState), fetchingTimeout);
  });
};
