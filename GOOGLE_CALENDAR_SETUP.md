# Google Calendar Integration Setup

This guide will help you connect your Google Calendar to the Social Media Scheduler app.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project: "Social Media Scheduler"
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on it and press **"Enable"**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**

3. **Configure OAuth consent screen** (if prompted):
   - User Type: **External**
   - App name: **Social Media Scheduler**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Skip this, click **Save and Continue**
   - Test users: Add your email address
   - Click **Save and Continue**

4. **Create OAuth Client ID**:
   - Application type: **Desktop app**
   - Name: **Social Media Scheduler Desktop**
   - Click **Create**

## Step 4: Download Credentials

1. After creating, you'll see your Client ID
2. Click the **Download** button (download icon)
3. Save the file as `credentials.json`
4. **Important**: Move `credentials.json` to your project root directory:
   ```
   C:\Users\Thewr\Desktop\social-scheduler-backend\credentials.json
   ```

## Step 5: Start the Application

1. Make sure your server is running:
   ```bash
   cd C:\Users\Thewr\Desktop\social-scheduler-backend
   npm start
   ```

2. Open your browser to: **http://localhost:3000**

## Step 6: Connect Google Calendar

1. On the app homepage, you'll see: **"Google Calendar not connected"**
2. Click the **"Connect Calendar"** button
3. A Google sign-in window will open
4. Sign in with your Google account
5. Click **"Allow"** to grant calendar access
6. The popup will close automatically
7. You'll see: **"✅ Google Calendar Connected"**

## Step 7: View Your Events

Once connected, you'll see a new **"Calendar Events"** section showing your upcoming Google Calendar events for the current month!

## Troubleshooting

### "credentials.json not found"
- Make sure you downloaded the credentials file
- Verify it's named exactly `credentials.json` (not `client_secret_....json`)
- Place it in the project root directory

### "Authentication expired"
- Click "Disconnect" and then "Connect Calendar" again
- This will refresh your authentication token

### "Failed to connect"
- Make sure the Google Calendar API is enabled in your Google Cloud project
- Check that your OAuth consent screen is configured
- Verify your email is added as a test user

### Can't see events
- Make sure you have events in your Google Calendar
- The app shows events for the current month only
- Click the "Refresh" button to reload events

## Security Notes

- `credentials.json` contains your OAuth client credentials (not a secret, but don't share publicly)
- `token.json` is created after you authenticate (this IS secret - never commit to git)
- Both files are in `.gitignore` and won't be pushed to GitHub

## What Data is Accessed?

The app only requests **read-only** access to your calendar. It can:
- ✅ View your calendar events
- ❌ Cannot create, modify, or delete events
- ❌ Cannot access other Google services

## Disconnect

To disconnect Google Calendar:
1. Click the "Disconnect" button in the app
2. This removes the stored authentication token
3. To revoke all access, go to [Google Account Permissions](https://myaccount.google.com/permissions) and remove "Social Media Scheduler"

---

**You're all set!** Your calendar events will now appear alongside your scheduled social media posts.
