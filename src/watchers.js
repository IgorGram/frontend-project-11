import onChange from 'on-change';

const renderInputField = (val, elements) => {
  const inputEl = elements.input;
  if (!val) {
    inputEl.classList.add('is-invalid');
  } else {
    inputEl.classList.remove('is-invalid');
  }
};
export default (state, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'isValid':
      renderInputField(value, elements);
      // eslint-disable-next-line no-param-reassign
      elements.feedback.textContent = state.form.error;
      break;
    default:
      break;
  }
});
