const axios = require('axios');

async function publishToFacebook(post) {
  const { message, imageUrl } = post;
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!pageAccessToken || !pageId) {
    throw new Error('Facebook credentials not configured. Please set FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID in .env file');
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;

    const params = {
      message,
      access_token: pageAccessToken
    };

    // Add image if provided
    if (imageUrl) {
      params.link = imageUrl;
    }

    const response = await axios.post(url, null, { params });

    console.log('Facebook post published:', response.data);
    return response.data;
  } catch (error) {
    console.error('Facebook API error:', error.response?.data || error.message);
    throw new Error(`Failed to publish to Facebook: ${error.response?.data?.error?.message || error.message}`);
  }
}

module.exports = { publishToFacebook };
