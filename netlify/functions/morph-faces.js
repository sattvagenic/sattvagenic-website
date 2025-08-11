// netlify/functions/morph-faces.js

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { image1, image2 } = JSON.parse(event.body);

    // Get API token from environment variable
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
      throw new Error('Replicate API token not configured');
    }

    // Option 1: Use Replicate's face morphing model
    // Note: You'll need to find the right model on Replicate
    // This is an example using a general image interpolation model
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    version: "cb864c3f64d31acd5e3487e042123b7522fc3f19a66af2c42b7b5204e6f38dd4",
    input: {
      image1_path: image1,  // Changed from 'image1' to 'image1_path'
      image2_path: image2,  // Changed from 'image2' to 'image2_path'
      fs: 20  // Changed from 'num_interpolation_steps' to 'fs' (frames)
    }
  })
});

    const prediction = await response.json();

    // Poll for results
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          }
        }
      );
      
      result = await statusResponse.json();
    }

    if (result.status === 'succeeded') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          output: result.output,
          message: 'Morphing complete'
        })
      };
    } else {
      throw new Error('Morphing failed');
    }

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Processing failed',
        message: error.message
      })
    };
  }
};

// Alternative implementation using simpler image blending
// This doesn't require Replicate and works as a fallback

async function simpleBlend(image1, image2, steps = 10) {
  // This would be implemented client-side
  // Server-side image processing would require additional packages
  
  const frames = [];
  for (let i = 0; i <= steps; i++) {
    const alpha = i / steps;
    frames.push({
      alpha: alpha,
      description: `Frame ${i}: ${Math.round((1-alpha)*100)}% first image, ${Math.round(alpha*100)}% second image`
    });
  }
  
  return frames;
}
