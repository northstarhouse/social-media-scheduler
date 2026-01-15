const API_URL = 'http://localhost:3000';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupFormHandlers();
    updateCharCount();
});

// Setup form handlers
function setupFormHandlers() {
    const form = document.getElementById('scheduleForm');
    const messageField = document.getElementById('message');

    form.addEventListener('submit', handleSchedulePost);
    messageField.addEventListener('input', updateCharCount);

    // Set minimum datetime to now
    const datetimeInput = document.getElementById('scheduledTime');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    datetimeInput.min = now.toISOString().slice(0, 16);
}

// Update character count
function updateCharCount() {
    const message = document.getElementById('message').value;
    const charCount = document.getElementById('charCount');
    charCount.textContent = `${message.length} characters`;
}

// Handle schedule post
async function handleSchedulePost(e) {
    e.preventDefault();

    const platform = document.getElementById('platform').value;
    const message = document.getElementById('message').value;
    const imageUrl = document.getElementById('imageUrl').value;
    const scheduledTime = document.getElementById('scheduledTime').value;

    // Validate Instagram requirements
    if (platform === 'instagram' && !imageUrl) {
        showToast('Instagram posts require an image URL', 'error');
        return;
    }

    const postData = {
        platform,
        message,
        imageUrl: imageUrl || undefined,
        scheduledTime: new Date(scheduledTime).toISOString()
    };

    try {
        const response = await fetch(`${API_URL}/schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Post scheduled successfully!', 'success');
            document.getElementById('scheduleForm').reset();
            updateCharCount();
            loadPosts();
        } else {
            showToast(data.error || 'Failed to schedule post', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to connect to server', 'error');
    }
}

// Load all scheduled posts
async function loadPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '<div class="loading">Loading posts...</div>';

    try {
        const response = await fetch(`${API_URL}/posts`);
        const data = await response.json();

        if (data.posts && data.posts.length > 0) {
            container.innerHTML = data.posts
                .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
                .map(post => createPostElement(post))
                .join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <p>No scheduled posts yet</p>
                    <p style="font-size: 0.9rem; margin-top: 5px;">Schedule your first post above!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="empty-state">Failed to load posts</div>';
    }
}

// Create post element
function createPostElement(post) {
    const scheduledTime = new Date(post.scheduledTime);
    const platformClass = `platform-${post.platform}`;
    const statusClass = `status-${post.status}`;

    return `
        <div class="post-item">
            <div class="post-header">
                <div>
                    <span class="platform-badge ${platformClass}">
                        ${post.platform === 'facebook' ? '👤 Facebook' : '📸 Instagram'}
                    </span>
                </div>
                <div>
                    <span class="status-badge ${statusClass}">${post.status}</span>
                </div>
            </div>

            <div class="post-message">${escapeHtml(post.message)}</div>

            <div class="post-time">
                <strong>Scheduled for:</strong> ${formatDateTime(scheduledTime)}
            </div>

            ${post.imageUrl ? `
                <div class="post-image">
                    <img src="${escapeHtml(post.imageUrl)}" alt="Post image" onerror="this.style.display='none'">
                </div>
            ` : ''}

            ${post.status === 'scheduled' ? `
                <button class="btn btn-danger" onclick="cancelPost('${post.id}')">
                    <span class="btn-icon">🗑️</span>
                    Cancel Post
                </button>
            ` : ''}

            ${post.publishedAt ? `
                <div class="post-time" style="color: #00b894;">
                    <strong>Published at:</strong> ${formatDateTime(new Date(post.publishedAt))}
                </div>
            ` : ''}

            ${post.error ? `
                <div class="post-time" style="color: #d63031;">
                    <strong>Error:</strong> ${escapeHtml(post.error)}
                </div>
            ` : ''}
        </div>
    `;
}

// Cancel a scheduled post
async function cancelPost(postId) {
    if (!confirm('Are you sure you want to cancel this post?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Post cancelled successfully', 'success');
            loadPosts();
        } else {
            showToast(data.error || 'Failed to cancel post', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to connect to server', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Format date and time
function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
