import onChange from 'on-change';

export default (state, elements, i18next) => {
  const renderInputField = () => {
    const { form: { valid, error } } = state;
    const { input, feedback } = elements;

    if (!valid) {
      input.classList.add('is-invalid');
      feedback.textContent = i18next.t(`${error}`);
    } else {
      input.classList.remove('is-invalid');
    }
  };

  const handleFeed = () => {
    const { input, feedback } = elements;
    input.value = '';
    feedback.textContent = '';
  };
  return onChange(state, (path) => {
    switch (path) {
      case 'feeds':
        handleFeed();
        break;
      case 'form':
        renderInputField();
        // eslint-disable-next-line no-param-reassign
        break;
      default:
        break;
    }
  });
};
