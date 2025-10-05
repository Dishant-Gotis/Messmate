# MessMate - Supabase Authentication Setup Guide

This comprehensive guide will walk you through setting up Supabase authentication for your MessMate application.

## 🚀 Quick Start

### Prerequisites
- A Supabase account (free tier available)
- Basic understanding of web development
- Your MessMate project files

## 📋 Table of Contents

1. [Supabase Project Setup](#1-supabase-project-setup)
2. [Authentication Configuration](#2-authentication-configuration)
3. [Database Schema Setup](#3-database-schema-setup)
4. [Application Configuration](#4-application-configuration)
5. [Testing Authentication](#5-testing-authentication)
6. [Production Deployment](#6-production-deployment)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Supabase Project Setup

### Step 1: Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub, Google, or email
4. Verify your email if required

### Step 2: Create a New Project
1. Click "New Project" on your dashboard
2. Choose your organization
3. Fill in project details:
   - **Name**: `messmate-auth` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to initialize (2-3 minutes)

### Step 3: Get Your Project Credentials
1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API Key** (anon/public key)
   - **Service Role Key** (secret - keep this secure!)

---

## 2. Authentication Configuration

### Step 1: Enable Authentication Providers
1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. **Email Provider** (already enabled by default)
   - Configure email templates if needed
   - Set up custom SMTP (optional)
3. **Google Provider** (recommended)
   - Click "Enable" next to Google
   - You'll need Google OAuth credentials (see below)

### Step 2: Google OAuth Setup (Optional but Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted
6. Choose **Web application**
7. Add authorized redirect URIs:
   - `https://faetszbcjwfosgexemhz.supabase.co/auth/v1/callback`
   - `http://localhost:3000` (for local development)
8. Copy **Client ID** and **Client Secret**
9. In Supabase, paste these credentials in Google provider settings

### Step 3: Configure Authentication Settings
1. Go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: Your production domain (e.g., `https://yourdomain.com`)
   - **Redirect URLs**: Add your allowed redirect URLs
   - **JWT expiry**: 3600 (1 hour) or your preference
   - **Enable email confirmations**: Recommended for production

---

## 3. Database Schema Setup

### Step 1: Create User Profiles Table
1. Go to **Table Editor** in your Supabase dashboard
2. Click "Create a new table"
3. Use the following configuration:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Step 2: Create Mess Data Table (Optional)
If you want to store mess data in Supabase:

```sql
-- Create messes table
CREATE TABLE messes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('veg', 'non-veg', 'both')),
  price_per_meal DECIMAL(10,2) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  todays_menu TEXT[],
  address TEXT NOT NULL,
  coordinates POINT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE messes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view messes" ON messes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create messes" ON messes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own messes" ON messes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own messes" ON messes
  FOR DELETE USING (auth.uid() = created_by);
```

### Step 3: Set Up Database Functions
Create a function to handle new user registration:

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. Application Configuration

### Step 1: Update Authentication.js
1. Open `authentication.js` in your project
2. Replace the placeholder credentials:

```javascript
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://faetszbcjwfosgexemhz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZXRzemJjandmb3NnZXhlbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODA5NjMsImV4cCI6MjA3NTE1Njk2M30.XPdnaw65T_ZclF9otchyRL-s6jRL_P4oy9wJUsloh6I';
```

### Step 2: Environment Variables (Recommended for Production)
For production, use environment variables instead of hardcoding:

```javascript
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://faetszbcjwfosgexemhz.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZXRzemJjandmb3NnZXhlbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODA5NjMsImV4cCI6MjA3NTE1Njk2M30.XPdnaw65T_ZclF9otchyRL-s6jRL_P4oy9wJUsloh6I';
```

### Step 3: Update Redirect URLs
Make sure your redirect URLs are properly configured:
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

---

## 5. Testing Authentication

### Step 1: Test Email Authentication
1. Open `login.html` in your browser
2. Try signing up with a test email
3. Check your email for the confirmation link
4. Click the link to confirm your account
5. Try logging in with the same credentials

### Step 2: Test Google Authentication
1. Click "Continue with Google" button
2. Complete the Google OAuth flow
3. Verify you're redirected back to your app

### Step 3: Test Demo Mode
If Supabase isn't configured, the app will run in demo mode:
- Email: `demo@messmate.com`
- Password: `demo123`

### Step 4: Verify Database Integration
1. Check your Supabase dashboard → **Table Editor** → **profiles**
2. Verify that user profiles are being created
3. Test updating profile information

---

## 6. Production Deployment

### Step 1: Update Site URLs
1. In Supabase dashboard → **Authentication** → **Settings**
2. Update **Site URL** to your production domain
3. Add production domain to **Redirect URLs**

### Step 2: Configure Custom SMTP (Optional)
For production, configure custom SMTP:
1. Go to **Authentication** → **Settings**
2. Under **SMTP Settings**, configure:
   - SMTP Host (e.g., `smtp.gmail.com`)
   - SMTP Port (e.g., `587`)
   - SMTP User (your email)
   - SMTP Pass (app password)
   - Sender Name (e.g., "MessMate")

### Step 3: Set Up Row Level Security
Ensure all your tables have proper RLS policies:
1. Review all tables in **Table Editor**
2. Check **RLS** is enabled
3. Verify policies are correctly configured

### Step 4: Monitor Usage
1. Check **Authentication** → **Users** for user registrations
2. Monitor **Database** → **Logs** for any errors
3. Review **API** → **Usage** for rate limits

---

## 7. Troubleshooting

### Common Issues and Solutions

#### Issue: "Invalid login credentials"
**Solution**: 
- Verify email/password combination
- Check if email is confirmed
- Ensure user exists in Supabase dashboard

#### Issue: Google OAuth not working
**Solution**:
- Verify Google OAuth credentials are correct
- Check redirect URI matches exactly
- Ensure Google+ API is enabled
- Verify OAuth consent screen is configured

#### Issue: "Invalid API key"
**Solution**:
- Double-check SUPABASE_URL and SUPABASE_ANON_KEY
- Ensure you're using the anon key, not service role key
- Verify the project is active

#### Issue: Email confirmations not sending
**Solution**:
- Check SMTP configuration
- Verify sender email is configured
- Check spam folder
- Review Supabase logs for SMTP errors

#### Issue: CORS errors
**Solution**:
- Add your domain to allowed origins in Supabase
- Check Site URL configuration
- Verify redirect URLs are correct

#### Issue: Database connection errors
**Solution**:
- Check if database is paused (upgrade plan if needed)
- Verify connection string is correct
- Check RLS policies aren't blocking access

### Getting Help

1. **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
2. **Supabase Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
3. **Stack Overflow**: Tag questions with `supabase`

---

## 📚 Additional Resources

### Useful Supabase Features to Explore
- **Real-time subscriptions**: For live updates
- **Edge Functions**: For serverless functions
- **Storage**: For file uploads
- **Database backups**: Automatic backups
- **Analytics**: Usage insights

### Security Best Practices
1. Always use HTTPS in production
2. Keep service role key secure
3. Regularly review RLS policies
4. Monitor authentication logs
5. Use strong database passwords
6. Enable email confirmations
7. Set up proper redirect URLs

### Performance Optimization
1. Use database indexes for frequently queried columns
2. Implement proper pagination
3. Use Supabase's built-in caching
4. Monitor query performance
5. Optimize RLS policies

---

## 🎉 Congratulations!

You've successfully set up Supabase authentication for MessMate! Your application now has:

✅ **Secure user authentication**  
✅ **Email and Google login**  
✅ **User profile management**  
✅ **Database integration**  
✅ **Production-ready setup**  

Your MessMate application is now ready for real users with a robust authentication system powered by Supabase.

---

*For additional support or questions, refer to the troubleshooting section or visit the Supabase documentation.*
