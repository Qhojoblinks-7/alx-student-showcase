// supabase/functions/submit-ai-feedback/index.js
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'; // Deno still imports from .ts for built-in modules
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'; // Ensure this matches your Supabase client version

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Access Supabase URL and Anon Key from Deno environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Initialize Supabase client with environment variables and the request's Authorization header
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') },
        },
      }
    );

    // Get the authenticated user from the request's JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ message: 'Unauthorized: Invalid or missing authentication token.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse the request body for feedback data
    const { feedback, recommendationsContext, feedbackType = 'ai_recommendations', rating = null } = await req.json();

    if (!feedback) {
      return new Response(JSON.stringify({ message: 'Feedback text is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert feedback into the 'ai_feedback' table
    const { data, error } = await supabaseClient
      .from('ai_feedback')
      .insert([
        {
          user_id: user.id, // The ID of the authenticated user
          feedback_type: feedbackType,
          feedback_text: feedback,
          context_data: recommendationsContext, // Store the context of the recommendations
          rating: rating, // Store the rating if provided
        },
      ])
      .select(); // Return the inserted data

    if (error) {
      console.error('Supabase insert error:', error.message);
      return new Response(JSON.stringify({ message: 'Failed to store feedback.', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Respond with success
    return new Response(JSON.stringify({ message: 'Feedback submitted successfully!', data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge Function error:', error.message);
    return new Response(JSON.stringify({ message: 'Internal server error.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});