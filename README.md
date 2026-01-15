# Social Media Scheduler

A Node.js full-stack application for scheduling posts to Facebook and Instagram with Google Calendar integration. Schedule your social media content in advance and let the system automatically publish at the specified times.

## Features

- 🌐 **Web Interface**: Beautiful, intuitive dashboard for managing posts
- 📱 **Social Media**: Schedule posts for Facebook and Instagram
- ⏰ **Auto-Publishing**: Automatic publishing at scheduled times
- 🖼️ **Image Support**: Support for text and image posts
- 📅 **Google Calendar Integration**: View your calendar events alongside scheduled posts
- 🗑️ **Post Management**: Cancel scheduled posts
- 📊 **Dashboard**: Real-time view of all scheduled posts
- 💾 **Persistent Storage**: All posts saved automatically

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Facebook Developer Account
- Instagram Business Account
- Google Account (for Calendar integration, optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/northstarhouse/social-media-scheduler.git
cd social-media-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your credentials in the `.env` file (see Configuration section below)

## Configuration

### Facebook Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the "Facebook Login" and "Pages" products
4. Get your Page Access Token:
   - Go to Graph API Explorer
   - Select your app
   - Select your page
   - Request permissions: `pages_manage_posts`, `pages_read_engagement`
   - Generate token
5. Get your Page ID from your Facebook Page settings

### Instagram Setup

1. Convert your Instagram account to a Business Account
2. Link it to a Facebook Page
3. Use the same Facebook app from above
4. Get your Instagram Business Account ID:
   - Use Graph API Explorer
   - Query: `me/accounts` to get your Page ID
   - Then query: `{page_id}?fields=instagram_business_account`
5. Use the same access token from Facebook setup

### Environment Variables

Edit your `.env` file:

```env
PORT=3000

# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN=your_token_here
FACEBOOK_PAGE_ID=your_page_id_here

# Instagram
INSTAGRAM_ACCESS_TOKEN=your_token_here
INSTAGRAM_ACCOUNT_ID=your_account_id_here
```

## Usage

### Start the Server

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Using the Web Interface

Simply open your browser to `http://localhost:3000` and you'll see the beautiful web dashboard where you can:
- Schedule new posts
- View all scheduled posts
- Cancel posts
- Connect Google Calendar
- View calendar events

### Google Calendar Integration (Optional)

To connect your Google Calendar and see your events in the app:

1. Follow the detailed setup guide: [GOOGLE_CALENDAR_SETUP.md](GOOGLE_CALENDAR_SETUP.md)
2. Click "Connect Calendar" in the web interface
3. Authorize the app
4. Your calendar events will appear alongside your scheduled posts!

### API Endpoints

#### Schedule a Post

```bash
POST /schedule
Content-Type: application/json

{
  "platform": "facebook",
  "message": "Hello from the scheduler!",
  "imageUrl": "https://example.com/image.jpg",
  "scheduledTime": "2024-12-31T10:00:00Z"
}
```

Platforms: `facebook` or `instagram`

**Note:** Instagram requires an `imageUrl`

#### Get All Scheduled Posts

```bash
GET /posts
```

#### Cancel a Scheduled Post

```bash
DELETE /posts/:id
```

## Example: Schedule a Post with cURL

```bash
curl -X POST http://localhost:3000/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "facebook",
    "message": "Check out our new product!",
    "imageUrl": "https://example.com/product.jpg",
    "scheduledTime": "2024-12-25T09:00:00Z"
  }'
```

## Example: Using Postman

1. Create a POST request to `http://localhost:3000/schedule`
2. Set Headers: `Content-Type: application/json`
3. Set Body (raw JSON):
```json
{
  "platform": "instagram",
  "message": "New post from our scheduler!",
  "imageUrl": "https://example.com/image.jpg",
  "scheduledTime": "2024-12-31T12:00:00Z"
}
```

## Data Storage

Scheduled posts are stored in `scheduled-posts.json`. This file is automatically created and should not be committed to git (it's in `.gitignore`).

## Security Notes

- Never commit your `.env` file
- Keep your access tokens secure
- Regularly rotate your access tokens
- Use HTTPS in production
- Consider implementing authentication for the API endpoints

## Troubleshooting

### "Facebook credentials not configured"
- Make sure your `.env` file exists and has the correct variables
- Restart the server after updating `.env`

### Posts not publishing
- Check that the scheduled time is in the future
- Verify your access tokens are valid
- Check the console logs for error messages
- Ensure your Facebook/Instagram accounts have proper permissions

### "Instagram posts require an image URL"
- Instagram only supports image posts through this API
- Make sure to include a valid `imageUrl` in your request

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with Node.js, Express, and the Facebook Graph API
