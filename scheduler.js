const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { publishToFacebook } = require('./platforms/facebook');
const { publishToInstagram } = require('./platforms/instagram');

const POSTS_FILE = path.join(__dirname, 'scheduled-posts.json');

// Load scheduled posts from file
function loadPosts() {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      const data = fs.readFileSync(POSTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
  }
  return [];
}

// Save scheduled posts to file
function savePosts(posts) {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error saving posts:', error);
  }
}

// Active scheduled jobs
const activeJobs = new Map();

// Schedule a new post
async function schedulePost({ platform, message, imageUrl, scheduledTime }) {
  const posts = loadPosts();

  const post = {
    id: Date.now().toString(),
    platform,
    message,
    imageUrl,
    scheduledTime: new Date(scheduledTime).toISOString(),
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  posts.push(post);
  savePosts(posts);

  // Schedule the job
  const job = schedule.scheduleJob(new Date(scheduledTime), async () => {
    await publishPost(post.id);
  });

  activeJobs.set(post.id, job);

  console.log(`Post scheduled for ${platform} at ${scheduledTime}`);
  return post;
}

// Publish a post
async function publishPost(postId) {
  const posts = loadPosts();
  const post = posts.find(p => p.id === postId);

  if (!post) {
    console.error(`Post ${postId} not found`);
    return;
  }

  try {
    console.log(`Publishing post ${postId} to ${post.platform}...`);

    if (post.platform === 'facebook') {
      await publishToFacebook(post);
    } else if (post.platform === 'instagram') {
      await publishToInstagram(post);
    } else {
      throw new Error(`Unsupported platform: ${post.platform}`);
    }

    // Update post status
    post.status = 'published';
    post.publishedAt = new Date().toISOString();
    savePosts(posts);

    // Remove from active jobs
    activeJobs.delete(postId);

    console.log(`Post ${postId} published successfully!`);
  } catch (error) {
    console.error(`Error publishing post ${postId}:`, error);

    // Update post status to failed
    post.status = 'failed';
    post.error = error.message;
    savePosts(posts);
  }
}

// Get all scheduled posts
function getScheduledPosts() {
  return loadPosts();
}

// Cancel a scheduled post
function cancelPost(postId) {
  const posts = loadPosts();
  const postIndex = posts.findIndex(p => p.id === postId);

  if (postIndex === -1) {
    return false;
  }

  // Cancel the scheduled job
  const job = activeJobs.get(postId);
  if (job) {
    job.cancel();
    activeJobs.delete(postId);
  }

  // Remove from posts
  posts.splice(postIndex, 1);
  savePosts(posts);

  console.log(`Post ${postId} cancelled`);
  return true;
}

// Reschedule existing posts on startup
function rescheduleExistingPosts() {
  const posts = loadPosts();
  const now = new Date();

  posts.forEach(post => {
    if (post.status === 'scheduled') {
      const scheduledTime = new Date(post.scheduledTime);

      if (scheduledTime > now) {
        const job = schedule.scheduleJob(scheduledTime, async () => {
          await publishPost(post.id);
        });

        activeJobs.set(post.id, job);
        console.log(`Rescheduled post ${post.id} for ${post.platform}`);
      } else {
        // Post time has passed, mark as missed
        post.status = 'missed';
        savePosts(posts);
      }
    }
  });
}

// Initialize on module load
rescheduleExistingPosts();

module.exports = {
  schedulePost,
  getScheduledPosts,
  cancelPost
};
