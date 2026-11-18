const kind = document.currentScript.dataset.kind;
const container = document.getElementById('content-list');
function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}
async function loadContent() {
  try {
    const response = await fetch('data/content.json', {cache: 'no-cache'});
    if (!response.ok) throw new Error('读取失败');
    const content = await response.json();
    const items = content[kind];
    if (!Array.isArray(items)) throw new Error('内容格式错误');
    container.replaceChildren();
    if (items.length === 0) {
      container.append(element('p', kind === 'links' ? '还没有添加链接。' : '还没有发布经验总结。'));
      return;
    }
    const selected = new URLSearchParams(location.search).get('article');
    if (kind === 'notes' && selected !== null) {
      const index = Number(selected);
      if (!/^\d+$/.test(selected) || !Number.isSafeInteger(index) || !items[index]) {
        container.append(element('p', '这篇文章已删除或不存在。'));
        return;
      }
      const article = document.createElement('article');
      article.className = 'card';
      article.style.gridColumn = '1 / -1';
      article.append(element('h2', items[index].title));
      const body = element('div', items[index].body || '');
      body.style.whiteSpace = 'pre-wrap';
      body.style.marginTop = '20px';
      article.append(body);
      const back = element('a', '← 返回文章列表');
      back.href = 'notes.html';
      article.append(back);
      container.append(article);
      document.title = items[index].title + ' · 个人主页';
      return;
    }
    items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'card';
      const heading = document.createElement('h2');
      const link = element('a', item.title || '未命名');
      if (kind === 'links') {
        try {
          const url = new URL(item.url);
          if (!['https:', 'http:'].includes(url.protocol)) return;
          link.href = url.href;
        } catch { return; }
      } else {
        link.href = 'notes.html?article=' + index;
      }
      heading.append(link);
      card.append(heading);
      const summary = kind === 'links' ? item.description : (item.body || '').slice(0, 100);
      if (summary) card.append(element('p', summary));
      container.append(card);
    });
  } catch {
    container.replaceChildren(element('p', '内容暂时无法加载，请稍后刷新重试。'));
  }
}
loadContent();
