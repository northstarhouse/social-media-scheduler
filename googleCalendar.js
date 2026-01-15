const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Create OAuth2 client
function createOAuth2Client() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('credentials.json not found. Please download it from Google Cloud Console.');
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Load token if it exists
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
  }

  return oAuth2Client;
}

// Get authorization URL
function getAuthUrl() {
  const oAuth2Client = createOAuth2Client();

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  return authUrl;
}

// Get token from authorization code
async function getToken(code) {
  const oAuth2Client = createOAuth2Client();
  const { tokens } = await oAuth2Client.getToken(code);

  // Save token to file
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

  oAuth2Client.setCredentials(tokens);
  return tokens;
}

// Check if authenticated
function isAuthenticated() {
  return fs.existsSync(TOKEN_PATH);
}

// Get calendar events for a date range
async function getEvents(startDate, endDate) {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated with Google Calendar');
  }

  const oAuth2Client = createOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    return events.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      description: event.description,
      location: event.location,
      allDay: !event.start.dateTime
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);

    // If token is invalid, delete it
    if (error.code === 401 || error.code === 403) {
      if (fs.existsSync(TOKEN_PATH)) {
        fs.unlinkSync(TOKEN_PATH);
      }
      throw new Error('Authentication expired. Please re-authenticate.');
    }

    throw error;
  }
}

// Get events for current month
async function getMonthEvents(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return await getEvents(startDate, endDate);
}

// Logout (remove token)
function logout() {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
    return true;
  }
  return false;
}

module.exports = {
  getAuthUrl,
  getToken,
  isAuthenticated,
  getEvents,
  getMonthEvents,
  logout
};
