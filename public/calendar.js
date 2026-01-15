// Google Calendar Functions

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// Check calendar authentication status
async function checkCalendarAuth() {
    try {
        const response = await fetch(API_URL + '/calendar/status');
        const data = await response.json();

        const statusDiv = document.getElementById('calendarStatus');
        const calendarCard = document.getElementById('calendarCard');

        if (data.authenticated) {
            statusDiv.innerHTML = '<span class="calendar-connected">✅ Google Calendar Connected</span> <button class="btn btn-sm btn-secondary" onclick="disconnectCalendar()">Disconnect</button>';
            calendarCard.style.display = 'block';
            loadCalendarEvents();
        } else {
            statusDiv.innerHTML = '<span class="calendar-disconnected">📅 Google Calendar not connected</span> <button class="btn btn-sm btn-primary" onclick="connectCalendar()">Connect Calendar</button>';
            calendarCard.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking calendar auth:', error);
    }
}

// Connect to Google Calendar
async function connectCalendar() {
    try {
        const response = await fetch(API_URL + '/calendar/auth');
        const data = await response.json();

        if (data.authUrl) {
            window.open(data.authUrl, 'Google Calendar Auth', 'width=600,height=600');

            // Check auth status every 2 seconds
            const checkInterval = setInterval(async () => {
                const statusResponse = await fetch(API_URL + '/calendar/status');
                const statusData = await statusResponse.json();

                if (statusData.authenticated) {
                    clearInterval(checkInterval);
                    showToast('Google Calendar connected successfully!', 'success');
                    checkCalendarAuth();
                }
            }, 2000);
        }
    } catch (error) {
        console.error('Error connecting calendar:', error);
        showToast('Failed to connect to Google Calendar', 'error');
    }
}

// Disconnect from Google Calendar
async function disconnectCalendar() {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) {
        return;
    }

    try {
        const response = await fetch(API_URL + '/calendar/logout', {
            method: 'POST'
        });

        if (response.ok) {
            showToast('Google Calendar disconnected', 'success');
            checkCalendarAuth();
        }
    } catch (error) {
        console.error('Error disconnecting calendar:', error);
        showToast('Failed to disconnect', 'error');
    }
}

// Load calendar events
async function loadCalendarEvents() {
    const container = document.getElementById('calendarEventsContainer');
    container.innerHTML = '<div class="loading">Loading events...</div>';

    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const response = await fetch(API_URL + '/calendar/events?year=' + year + '&month=' + month);

        if (response.status === 401) {
            container.innerHTML = '<div class="empty-state">Please connect Google Calendar first</div>';
            return;
        }

        const data = await response.json();

        if (data.events && data.events.length > 0) {
            container.innerHTML = data.events
                .map(event => createEventElement(event))
                .join('');
        } else {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>No upcoming events this month</p></div>';
        }
    } catch (error) {
        console.error('Error loading calendar events:', error);
        container.innerHTML = '<div class="empty-state">Failed to load events</div>';
    }
}

// Create event element
function createEventElement(event) {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    return '<div class="event-item"><div class="event-header"><div class="event-title">' + escapeHtml(event.title) + '</div><div class="event-badge">' + (event.allDay ? 'All Day' : formatTime(startDate)) + '</div></div><div class="event-date">📅 ' + formatDate(startDate) + (!event.allDay ? ' - ' + formatTime(endDate) : '') + '</div>' + (event.location ? '<div class="event-location">📍 ' + escapeHtml(event.location) + '</div>' : '') + (event.description ? '<div class="event-description">' + escapeHtml(event.description) + '</div>' : '') + '</div>';
}

// Format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Format time
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize calendar check
document.addEventListener('DOMContentLoaded', () => {
    checkCalendarAuth();
});
