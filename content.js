const kind = document.currentScript.dataset.kind;
const container = document.getElementById('content-list');

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function showMessage(message) {
  container.replaceChildren(element('p', message, 'result-note'));
}

async function loadContent() {
  try {
    const response = await fetch('data/content.json', {cache: 'no-cache'});
    if (!response.ok) throw new Error('读取失败');
    const content = await response.json();
    if (!Array.isArray(content[kind])) throw new Error('内容格式错误');
    const items = content[kind].map((item, index) => ({...item, index}));
    const selected = new URLSearchParams(location.search).get('article');
    if (kind === 'notes' && selected !== null) {
      const item = /^\d+$/.test(selected) && items[Number(selected)];
      if (!item) {
        showMessage('这篇文章已删除或不存在。');
        return;
      }
      const main = document.getElementById('main');
      main.className = 'reading';
      const back = element('a', '← 返回经验总结', 'back');
      back.href = 'notes.html';
      main.replaceChildren(back, element('h1', item.title || '未命名'), element('article', item.body || '', 'prose'));
      document.title = (item.title || '未命名') + ' · 个人主页';
      return;
    }
    const label = element('label', '', 'search');
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = kind === 'links' ? '输入名称或关键词' : '搜索标题或正文';
    label.append(element('span', kind === 'links' ? '查找链接' : '查找经验总结'), input);
    if (items.length) container.before(label);
    function render() {
      const query = input.value.trim().toLocaleLowerCase();
      container.replaceChildren();
      for (const item of items) {
        const text = [item.title, item.description, item.body].join(' ').toLocaleLowerCase();
        if (!text.includes(query)) continue;
        const card = element('a', '', 'card');
        let url;
        if (kind === 'links') {
          try {
            url = new URL(item.url);
            if (!['http:', 'https:'].includes(url.protocol)) continue;
          } catch { continue; }
          card.href = url.href;
        } else {
          card.href = 'notes.html?article=' + item.index;
        }
        const title = element('h2', item.title || '未命名');
        const arrow = element('span', kind === 'links' ? '↗' : '→');
        arrow.setAttribute('aria-hidden', 'true');
        title.append(arrow);
        card.append(title);
        const summary = kind === 'links' ? item.description : String(item.body || '').slice(0, 110);
        if (summary) card.append(element('p', summary));
        if (url) card.append(element('span', url.hostname, 'domain'));
        container.append(card);
      }
      if (!container.children.length) {
        showMessage(query ? '没有找到匹配内容，试试其他关键词。' : kind === 'links' ? '还没有添加链接。' : '还没有发布经验总结。');
      }
    }
    input.addEventListener('input', render);
    render();
  } catch {
    showMessage('内容暂时无法加载。');
    const retry = element('button', '重新加载', 'retry');
    retry.type = 'button';
    retry.addEventListener('click', loadContent, {once: true});
    container.append(retry);
  }
}
loadContent();
