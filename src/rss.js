export default (data) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/xml');

  const errorNode = dom.querySelector('parsererror');
  if (errorNode) {
    console.log('frerf');
    throw new Error(errorNode.textContent);
  }

  console.log('seee');
  const channelEl = dom.querySelector('channel');
  const channelTitle = channelEl.querySelector('title').textContent;
  const channelDescription = channelEl.querySelector('description').textContent;
  const itemsEl = dom.querySelectorAll('item');
  const items = [...itemsEl].map((el) => {
    const title = el.querySelector('title').textContent;
    const link = el.querySelector('link').textContent;
    const description = el.querySelector('description').textContent;
    return { title, link, description };
  });

  return { title: channelTitle, description: channelDescription, items };
};