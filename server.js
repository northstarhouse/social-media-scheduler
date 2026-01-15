require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { schedulePost, getScheduledPosts, cancelPost } = require('./scheduler');
const {
  getAuthUrl,
  getToken,
  isAuthenticated,
  getMonthEvents,
  logout
} = require('./googleCalendar');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Social Media Scheduler API',
    endpoints: {
      'POST /schedule': 'Schedule a new post',
      'GET /posts': 'Get all scheduled posts',
      'DELETE /posts/:id': 'Cancel a scheduled post',
      'GET /calendar/auth': 'Get Google Calendar auth URL',
      'GET /calendar/events': 'Get calendar events',
      'GET /calendar/status': 'Check if authenticated'
    }
  });
});

// Schedule a new post
app.post('/schedule', async (req, res) => {
  try {
    const { platform, message, imageUrl, scheduledTime } = req.body;

    if (!platform || !message || !scheduledTime) {
      return res.status(400).json({
        error: 'Missing required fields: platform, message, scheduledTime'
      });
    }

    const result = await schedulePost({ platform, message, imageUrl, scheduledTime });
    res.json({ success: true, post: result });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all scheduled posts
app.get('/posts', (req, res) => {
  try {
    const posts = getScheduledPosts();
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel a scheduled post
app.delete('/posts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = cancelPost(id);

    if (result) {
      res.json({ success: true, message: 'Post cancelled successfully' });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    console.error('Error cancelling post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Google Calendar Routes

// Check authentication status
app.get('/calendar/status', (req, res) => {
  res.json({ authenticated: isAuthenticated() });
});

// Get authentication URL
app.get('/calendar/auth', (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle OAuth callback
app.get('/calendar/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('No authorization code provided');
    }

    await getToken(code);
    res.send(\`
      <html>
        <body>
          <h1>✅ Successfully connected to Google Calendar!</h1>
          <p>You can close this window and return to the app.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
    \`);
  } catch (error) {
    console.error('Error handling callback:', error);
    res.status(500).send('Failed to authenticate with Google Calendar');
  }
});

// Get calendar events
app.get('/calendar/events', async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated with Google Calendar' });
    }

    const events = await getMonthEvents(
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1
    );

    res.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout from Google Calendar
app.post('/calendar/logout', (req, res) => {
  try {
    logout();
    res.json({ success: true, message: 'Logged out from Google Calendar' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
  console.log('Social Media Scheduler is ready!');
});
