// In-memory store shared across requests within the same Vercel instance
// For production, replace with @vercel/kv or another persistent store
const store = new Map();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const roomId = (req.query.room || '').slice(0, 32).replace(/[^a-zA-Z0-9]/g, '');
  if (!roomId) return res.status(400).json({ error: 'room is required' });

  if (req.method === 'GET') {
    const data = store.get(roomId) || { items: [], updatedAt: 0 };
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { items, updatedAt } = req.body || {};
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items required' });
    const current = store.get(roomId);
    // Last-write-wins: only update if client's timestamp is newer
    if (!current || updatedAt >= (current.updatedAt || 0)) {
      store.set(roomId, { items, updatedAt: updatedAt || Date.now() });
    }
    return res.status(200).json(store.get(roomId));
  }

  return res.status(405).end();
};
