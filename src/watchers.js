import onChange from 'on-change';

export default (initState, elements, i18next) => {
  const handleForm = (state) => {
    const { form: { valid, error } } = state;
    const { input, feedback } = elements;

    if (!valid) {
      input.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = i18next.t(`${error}`);
    } else {
      input.classList.remove('is-invalid');
    }
  };

  const handleFeed = (state) => {
    const { feeds } = state;
    const { feedsBox } = elements;

    const fragmentStructure = document.createElement('div');
    fragmentStructure.classList.add('card', 'border-0');
    fragmentStructure.innerHTML = `
      <div class='card-body'></div>
    `;

    const feedsTitle = document.createElement('h2');
    feedsTitle.classList.add('card-title', 'h4');
    feedsTitle.textContent = i18next.t('feeds');
    fragmentStructure.querySelector('.card-body').appendChild(feedsTitle);

    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'border-0', 'rounded-0');

    const feedsListItems = feeds.map((feed) => {
      const element = document.createElement('li');
      element.classList.add('list-group-item', 'border-0', 'border-end-0');
      const title = document.createElement('h3');
      title.classList.add('h6', 'm-0');
      title.textContent = feed.title;
      const description = document.createElement('p');
      description.classList.add('m-0', 'small', 'text-black-50');
      description.textContent = feed.description;
      element.append(title, description);
      return element;
    });

    feedsList.append(...feedsListItems);
    fragmentStructure.appendChild(feedsList);
    feedsBox.innerHTML = '';
    feedsBox.appendChild(fragmentStructure);
  };

  const handlePosts = (state) => {
    const { posts, ui } = state;
    const { postsBox } = elements;

    const fragmentStructure = document.createElement('div');
    fragmentStructure.classList.add('card', 'border-0');
    fragmentStructure.innerHTML = `
      <div class='card-body'></div>
    `;

    const postsTitle = document.createElement('h2');
    postsTitle.classList.add('card-title', 'h4');
    postsTitle.textContent = i18next.t('posts');
    fragmentStructure.querySelector('.card-body').appendChild(postsTitle);

    const postsList = document.createElement('ul');
    postsList.classList.add('list-group', 'border-0', 'rounded-0');

    const postsListItems = posts.map((post) => {
      const element = document.createElement('li');
      element.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const link = document.createElement('a');
      link.setAttribute('href', post.link);
      const className = ui.seenPosts.has(post.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
      link.classList.add(...className);
      link.dataset.id = post.id;
      link.textContent = post.title;
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      element.appendChild(link);
      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.dataset.id = post.id;
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.textContent = i18next.t('preview');
      element.appendChild(button);
      return element;
    });

    postsList.append(...postsListItems);
    fragmentStructure.appendChild(postsList);
    postsBox.innerHTML = '';
    postsBox.appendChild(fragmentStructure);
  };

  const handleLoadingProcessStatus = (state) => {
    const { loadingProcess: { status, error } } = state;
    const { input, feedback } = elements;

    switch (status) {
      case 'failed':
        input.classList.add('is-invalid');
        feedback.classList.add('text-danger');
        feedback.textContent = i18next.t(`${error}`);
        break;
      case 'success':
        input.value = '';
        feedback.classList.add('text-success');
        feedback.textContent = i18next.t('loading.success');
        input.classList.remove('is-invalid');
        input.focus();
        break;
      case 'loading':
        feedback.classList.remove('text-success');
        feedback.classList.remove('text-danger');
        feedback.innerHTML = '';
        break;
      default:
    }
  };

  const handleModal = (state) => {
    const post = state.posts.find(({ id }) => id === state.modal.postId);
    const title = elements.modal.querySelector('.modal-title');
    const body = elements.modal.querySelector('.modal-body');
    const fullArticleBtn = elements.modal.querySelector('.full-article');

    title.textContent = post.title;
    body.textContent = post.description;
    fullArticleBtn.href = post.link;
  };

  return onChange(initState, (path) => {
    switch (path) {
      case 'feeds':
        handleFeed(initState);
        break;
      case 'posts':
        handlePosts(initState);
        break;
      case 'form':
        handleForm(initState);
        break;
      case 'loadingProcess.status':
        handleLoadingProcessStatus(initState);
        break;
      case 'modal.postId':
        handleModal(initState);
        break;
      case 'ui.seenPosts':
        handlePosts(initState);
        break;

        // eslint-disable-next-line no-fallthrough
      default:
        break;
    }
  });
};
