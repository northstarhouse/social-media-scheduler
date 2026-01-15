require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { schedulePost, getScheduledPosts, cancelPost } = require('./scheduler');

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
      'DELETE /posts/:id': 'Cancel a scheduled post'
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Social Media Scheduler is ready!');
});
