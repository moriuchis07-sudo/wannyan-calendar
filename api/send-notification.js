const webpush = require('web-push');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  try {
    const { subscription, title, body } = req.body;
    webpush.setVapidDetails(
      'mailto:noreply@wannyan.app',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
