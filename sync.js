/* Local-first sync adapter. Files and archive JSON go directly from the browser
   to the user's own WebDAV endpoint; this project does not receive the content. */
(function () {
  let connection = null;

  const encodePart = (part) => encodeURIComponent(String(part || '')).replace(/%2F/gi, '/');
  const normalizeFolder = (folder) => String(folder || 'CollegeArchive').split('/').filter(Boolean).map(encodePart).join('/');
  const fileName = (name) => String(name || 'file').replace(/[^\w\u4e00-\u9fff.()\- ]+/g, '_').slice(0, 140);
  const basicAuth = (username, password) => {
    const value = `${username}:${password}`;
    return `Basic ${btoa(unescape(encodeURIComponent(value)))}`;
  };
  const ensureHttps = (value) => {
    const url = new URL(value);
    if (url.protocol !== 'https:') throw new Error('为保护账号和文件安全，WebDAV 地址必须使用 HTTPS');
    return url.href.replace(/\/+$/, '');
  };

  function endpoint(relative = '') {
    if (!connection) throw new Error('尚未连接个人云端');
    return `${connection.base}/${relative.split('/').filter(Boolean).map(encodePart).join('/')}`;
  }

  async function request(relative, options = {}) {
    if (!connection) throw new Error('尚未连接个人云端');
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', connection.authorization);
    const response = await fetch(endpoint(relative), { ...options, headers, mode: 'cors' });
    if (!response.ok && response.status !== 404) throw new Error(`云端请求失败（${response.status}）`);
    return response;
  }

  async function connect(settings) {
    const root = ensureHttps(settings.url);
    const folder = normalizeFolder(settings.folder);
    const base = `${root}/${folder}`;
    const authorization = basicAuth(settings.username, settings.password);
    const previous = connection;
    connection = { base, authorization };
    try {
      const response = await fetch(base, { method: 'MKCOL', headers: { Authorization: authorization }, mode: 'cors' });
      if (![200, 201, 204, 301, 405, 409].includes(response.status)) throw new Error(`WebDAV 连接失败（${response.status}）`);
      const filesResponse = await fetch(`${base}/files`, { method: 'MKCOL', headers: { Authorization: authorization }, mode: 'cors' });
      if (![200, 201, 204, 301, 405, 409].includes(filesResponse.status)) throw new Error(`无法创建附件目录（${filesResponse.status}）`);
      return true;
    } catch (error) {
      connection = previous;
      if (error instanceof TypeError) throw new Error('无法连接 WebDAV。请确认地址支持 HTTPS、浏览器跨域访问（CORS）以及账号密码正确。');
      throw error;
    }
  }

  function disconnect() { connection = null; }
  function isConnected() { return Boolean(connection); }

  async function pull() {
    const response = await request('archive.json', { method: 'GET' });
    if (response.status === 404) return null;
    try { return await response.json(); } catch { throw new Error('云端档案文件格式无效'); }
  }

  async function push(payload, files) {
    for (const file of files || []) {
      const relative = `files/${file.recordId}/${file.id}-${fileName(file.name)}`;
      const response = await request(relative, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file.blob });
      if (!response.ok) throw new Error(`上传附件失败：${file.name}`);
      file.storagePath = relative;
      const manifest = payload.attachments?.find((item) => item.id === file.id);
      if (manifest) manifest.storagePath = relative;
    }
    const archive = await request('archive.json', { method: 'PUT', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(payload, null, 2) });
    if (!archive.ok) throw new Error('上传档案失败');
  }

  async function downloadFile(relative) {
    const response = await request(relative, { method: 'GET' });
    if (response.status === 404) return null;
    return response.blob();
  }

  window.archiveSync = { connect, disconnect, isConnected, pull, push, downloadFile };
})();

