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
        version: "7af9a66f36f97fee2fece7dcc927551a951f0022cbdd23747b9212f23fc17021", // Example model ID
        input: {
          image1: image1,
          image2: image2,
          num_interpolation_steps: 10
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
