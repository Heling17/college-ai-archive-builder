/* Cloud adapter for the College AI Archive. It stays idle until supabase-config.js
   contains a real project URL and publishable/anon key. */
(function () {
  const config = window.ARCHIVE_CONFIG || {};
  const hasPlaceholders = (value) => !value || /YOUR-|YOUR_/i.test(value);
  const configured = Boolean(window.supabase?.createClient && !hasPlaceholders(config.supabaseUrl) && !hasPlaceholders(config.supabaseKey));
  const client = configured ? window.supabase.createClient(config.supabaseUrl, config.supabaseKey) : null;
  const bucket = config.storageBucket || 'archive-files';
  let currentSession = null;

  const throwIfError = (error, fallback) => {
    if (error) throw new Error(error.message || fallback);
  };
  const currentUserId = () => currentSession?.user?.id || null;
  const safeFileName = (name) => String(name || 'file').replace(/[^\w\u4e00-\u9fff.()\- ]+/g, '_').slice(0, 140);
  const newId = () => window.crypto?.randomUUID?.() || `f-${Math.random().toString(36).slice(2)}-${Date.now()}`;

  function fromCloudRecord(row) {
    return {
      id: row.id, category: row.category, title: row.title, date: row.date, year: row.year,
      org: row.org, type: row.type, award: row.award, role: row.role, team: row.team,
      tools: row.tools, description: row.description, responsibilities: row.responsibilities,
      outcome: row.outcome, metrics: row.metrics, abilities: row.abilities, summary: row.summary,
      tags: Array.isArray(row.tags) ? row.tags : [], material: row.material,
      isExample: Boolean(row.is_example), createdAt: row.created_at ? Date.parse(row.created_at) : Date.now()
    };
  }

  function toCloudRecord(record) {
    return {
      id: record.id, user_id: currentUserId(), category: record.category, title: record.title,
      date: record.date || '', year: record.year || '', org: record.org || '', type: record.type || '',
      award: record.award || '', role: record.role || '', team: record.team || '', tools: record.tools || '',
      description: record.description || '', responsibilities: record.responsibilities || '',
      outcome: record.outcome || '', metrics: record.metrics || '', abilities: record.abilities || '',
      summary: record.summary || '', tags: record.tags || [], material: record.material || '',
      is_example: Boolean(record.isExample), updated_at: new Date().toISOString()
    };
  }

  async function init(onSession) {
    if (!client) return null;
    const result = await client.auth.getSession();
    throwIfError(result.error, '无法读取登录状态');
    currentSession = result.data.session;
    await onSession?.(currentSession);
    client.auth.onAuthStateChange((_event, nextSession) => {
      currentSession = nextSession;
      Promise.resolve(onSession?.(currentSession)).catch((error) => console.error(error));
    });
    return currentSession;
  }

  async function signIn(email, password) {
    const result = await client.auth.signInWithPassword({ email, password });
    throwIfError(result.error, '登录失败');
    return result.data.session;
  }

  async function signUp(email, password, name) {
    const result = await client.auth.signUp({ email, password, options: { data: { name: name || '同学' } } });
    throwIfError(result.error, '注册失败');
    return result.data;
  }

  async function signOut() {
    const result = await client.auth.signOut();
    throwIfError(result.error, '退出登录失败');
  }

  async function loadState() {
    const userId = currentUserId();
    if (!client || !userId) throw new Error('尚未登录');
    const [profileResult, recordsResult] = await Promise.all([
      client.from('profiles').select('name,school,major,grade,goal').eq('id', userId).maybeSingle(),
      client.from('records').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);
    throwIfError(profileResult.error, '无法读取个人信息');
    throwIfError(recordsResult.error, '无法读取档案记录');
    const metadata = currentSession?.user?.user_metadata || {};
    const profile = profileResult.data || { name: metadata.name || '同学', school: '', major: '', grade: '大二', goal: '综合测评与个人成长记录' };
    return { profile, records: (recordsResult.data || []).map(fromCloudRecord) };
  }

  async function saveState(state) {
    const userId = currentUserId();
    if (!client || !userId) throw new Error('尚未登录');
    const profileResult = await client.from('profiles').upsert({ id: userId, ...state.profile, updated_at: new Date().toISOString() });
    throwIfError(profileResult.error, '个人信息保存失败');
    const existingResult = await client.from('records').select('id').eq('user_id', userId);
    throwIfError(existingResult.error, '无法校验云端记录');
    const wantedIds = new Set(state.records.map((record) => record.id));
    const staleIds = (existingResult.data || []).map((row) => row.id).filter((id) => !wantedIds.has(id));
    if (staleIds.length) {
      const staleResult = await client.from('records').delete().in('id', staleIds).eq('user_id', userId);
      throwIfError(staleResult.error, '无法清理云端旧记录');
    }
    if (state.records.length) {
      const recordsResult = await client.from('records').upsert(state.records.map(toCloudRecord), { onConflict: 'id' });
      throwIfError(recordsResult.error, '档案记录保存失败');
    }
  }

  async function deleteRecord(recordId) {
    const result = await client.from('records').delete().eq('id', recordId).eq('user_id', currentUserId());
    throwIfError(result.error, '云端记录删除失败');
  }

  function fromAttachment(row, blob) {
    return { id: row.id, recordId: row.record_id, name: row.name, type: row.type, size: row.size, lastModified: row.last_modified, createdAt: row.created_at, storagePath: row.storage_path, blob };
  }

  async function listAttachments(recordId) {
    const result = await client.from('attachments').select('*').eq('record_id', recordId).eq('user_id', currentUserId()).order('created_at', { ascending: true });
    throwIfError(result.error, '无法读取云端附件');
    return (result.data || []).map((row) => fromAttachment(row));
  }

  async function getAttachment(fileId) {
    const result = await client.from('attachments').select('*').eq('id', fileId).eq('user_id', currentUserId()).maybeSingle();
    throwIfError(result.error, '无法读取附件信息');
    if (!result.data) return null;
    const download = await client.storage.from(bucket).download(result.data.storage_path);
    throwIfError(download.error, '无法下载附件');
    return fromAttachment(result.data, download.data);
  }

  async function addAttachments(recordId, files) {
    const userId = currentUserId();
    if (!client || !userId || !files?.length) return;
    for (const file of files) {
      const id = newId();
      const path = `${userId}/${recordId}/${id}-${safeFileName(file.name)}`;
      const upload = await client.storage.from(bucket).upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
      throwIfError(upload.error, `附件上传失败：${file.name}`);
      const metadata = await client.from('attachments').insert({ id, user_id: userId, record_id: recordId, storage_path: path, name: file.name, type: file.type || 'application/octet-stream', size: file.size, last_modified: file.lastModified || 0 });
      if (metadata.error) {
        await client.storage.from(bucket).remove([path]);
        throwIfError(metadata.error, `附件记录失败：${file.name}`);
      }
    }
  }

  async function removeAttachment(fileId) {
    const found = await client.from('attachments').select('storage_path').eq('id', fileId).eq('user_id', currentUserId()).maybeSingle();
    throwIfError(found.error, '无法读取附件信息');
    if (!found.data) return;
    const removed = await client.storage.from(bucket).remove([found.data.storage_path]);
    throwIfError(removed.error, '云端文件删除失败');
    const result = await client.from('attachments').delete().eq('id', fileId).eq('user_id', currentUserId());
    throwIfError(result.error, '附件记录删除失败');
  }

  async function removeRecordAttachments(recordId) {
    const files = await listAttachments(recordId);
    for (const file of files) await removeAttachment(file.id);
  }

  window.archiveCloud = { configured, init, signIn, signUp, signOut, loadState, saveState, deleteRecord, listAttachments, getAttachment, addAttachments, removeAttachment, removeRecordAttachments };
})();

