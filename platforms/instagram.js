const axios = require('axios');

async function publishToInstagram(post) {
  const { message, imageUrl } = post;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    throw new Error('Instagram credentials not configured. Please set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID in .env file');
  }

  if (!imageUrl) {
    throw new Error('Instagram posts require an image URL');
  }

  try {
    // Step 1: Create media container
    const containerUrl = `https://graph.facebook.com/v18.0/${accountId}/media`;
    const containerParams = {
      image_url: imageUrl,
      caption: message,
      access_token: accessToken
    };

    const containerResponse = await axios.post(containerUrl, null, { params: containerParams });
    const creationId = containerResponse.data.id;

    console.log('Instagram media container created:', creationId);

    // Step 2: Publish the media container
    const publishUrl = `https://graph.facebook.com/v18.0/${accountId}/media_publish`;
    const publishParams = {
      creation_id: creationId,
      access_token: accessToken
    };

    const publishResponse = await axios.post(publishUrl, null, { params: publishParams });

    console.log('Instagram post published:', publishResponse.data);
    return publishResponse.data;
  } catch (error) {
    console.error('Instagram API error:', error.response?.data || error.message);
    throw new Error(`Failed to publish to Instagram: ${error.response?.data?.error?.message || error.message}`);
  }
}

module.exports = { publishToInstagram };
