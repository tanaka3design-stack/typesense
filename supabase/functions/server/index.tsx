import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Create Supabase client with service role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ========================================
// TypeSense Server v3.0 - 2026-01-31
// ========================================

// Health check endpoint
app.get("/make-server-409e62bf/health", (c) => {
  console.log('✅ Health check endpoint called - v3.0');
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(), 
    version: "3.0",
    message: "TypeSense Server is running!"
  });
});

// User signup endpoint
app.post("/make-server-409e62bf/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    console.log('Signup request received:', { email, name });

    if (!email || !password || !name) {
      console.log('Missing required fields');
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user with Supabase Auth
    console.log('Creating user with Supabase Auth...');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`, error);
      return c.json({ error: error.message }, 400);
    }

    console.log('User created successfully:', data.user.id);

    // Store user profile in KV store
    const userId = data.user.id;
    console.log('Storing user profile in KV store...');
    await kv.set(`user:${userId}`, {
      id: userId,
      name,
      email,
      created_at: new Date().toISOString()
    });

    console.log('User profile stored successfully');

    return c.json({ 
      user: {
        id: userId,
        name,
        email
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get user profile endpoint
app.get("/make-server-409e62bf/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      console.log('Profile endpoint - No access token provided');
      return c.json({ code: 401, message: 'No access token provided' }, 401);
    }

    // Verify JWT using service role client
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Profile endpoint - Authorization error: ${authError?.message}`);
      return c.json({ code: 401, message: authError?.message || 'Invalid JWT' }, 401);
    }

    console.log('Profile endpoint - User verified:', user.id);

    // Get user profile from KV store
    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      console.log('Profile endpoint - User profile not found in KV store');
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({ user: userProfile });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return c.json({ error: 'Internal server error while fetching profile' }, 500);
  }
});

// Create or update user profile endpoint
app.post("/make-server-409e62bf/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized: No access token provided' }, 401);
    }

    // Verify JWT using service role client
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Authorization error while creating profile: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, email } = await c.req.json();

    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }

    // Create/update user profile in KV store
    const userProfile = {
      id: user.id,
      name,
      email: email || user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`user:${user.id}`, userProfile);

    console.log('Profile created/updated successfully:', user.id);

    return c.json({ user: userProfile });
  } catch (err) {
    console.error('Profile creation error:', err);
    return c.json({ error: 'Internal server error during profile creation' }, 500);
  }
});

// Create post endpoint - NO AUTH REQUIRED
app.post("/make-server-409e62bf/posts", async (c) => {
  try {
    console.log('🟢 POST /posts endpoint called (NO AUTH v2.0)');
    
    const body = await c.req.json();
    console.log('Request body keys:', Object.keys(body));
    
    const { text, name, leading, tracking, joy, surprise, anger, user_id } = body;

    if (!text) {
      console.log('❌ Missing text field');
      return c.json({ error: 'Text is required' }, 400);
    }

    if (!user_id) {
      console.log('❌ Missing user_id field');
      return c.json({ error: 'user_id is required' }, 400);
    }

    console.log('✅ Creating post for user:', user_id);

    // Create post object
    const postId = `post:${Date.now()}:${user_id}`;
    const post = {
      id: postId,
      user_id: user_id,
      text,
      name: name || '名無し',
      leading: leading || 1.5,
      tracking: tracking || 0,
      joy: joy || 5,
      surprise: surprise || 5,
      anger: anger || 5,
      created_at: new Date().toISOString(),
    };

    console.log('💾 Saving post to KV store:', postId);

    // Save post to KV store
    await kv.set(postId, post);

    console.log('✅ Post created successfully:', postId);

    return c.json({ post });
  } catch (err) {
    console.error('❌ Post creation error:', err);
    return c.json({ error: 'Internal server error during post creation', details: String(err) }, 500);
  }
});

// Get all posts endpoint - NO AUTH REQUIRED
app.get("/make-server-409e62bf/posts", async (c) => {
  try {
    console.log('🟢 GET /posts endpoint called (NO AUTH v2.0)');
    
    // Get all posts from KV store
    const newPosts = await kv.getByPrefix('post:');
    const oldPosts = await kv.getByPrefix('posts:'); // For backward compatibility
    
    const allPosts = [...newPosts, ...oldPosts];
    
    console.log(`✅ Found ${newPosts.length} new posts and ${oldPosts.length} old posts`);

    // Sort by created_at descending
    const sortedPosts = allPosts.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return c.json({ posts: sortedPosts });
  } catch (err) {
    console.error('❌ Posts fetch error:', err);
    return c.json({ error: 'Internal server error while fetching posts' }, 500);
  }
});

// Get user's posts endpoint - AUTH REQUIRED
app.get("/make-server-409e62bf/posts/my", async (c) => {
  try {
    console.log('🟢 GET /posts/my endpoint called (AUTH REQUIRED)');
    
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log('❌ No access token provided');
      return c.json({ error: 'Unauthorized: No access token provided' }, 401);
    }

    // Verify JWT using service role client
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`❌ Authorization error: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('✅ User verified:', user.id);

    // Get all posts
    const allPosts = await kv.getByPrefix('post:');

    // Filter by user_id
    const userPosts = allPosts.filter((post: any) => post.user_id === user.id);

    console.log(`✅ Found ${userPosts.length} posts for user ${user.id}`);

    // Sort by created_at descending
    const sortedPosts = userPosts.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return c.json({ posts: sortedPosts });
  } catch (err) {
    console.error('❌ User posts fetch error:', err);
    return c.json({ error: 'Internal server error while fetching user posts' }, 500);
  }
});

console.log('🚀 Server starting... Version 3.0 - Updated at ' + new Date().toISOString());

Deno.serve(app.fetch);