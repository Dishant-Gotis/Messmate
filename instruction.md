# 🚀 Supabase Setup Instructions for MessMate

**Complete step-by-step guide to set up authentication for your MessMate application**

This guide will walk you through setting up Supabase for your authentication system with email/password, phone, and Google OAuth support.

---

## 📋 What You'll Set Up

- ✅ Email/Password authentication
- ✅ Phone/SMS authentication (optional)
- ✅ Google OAuth (one-click login)
- ✅ Email verification
- ✅ Password reset functionality

---

## Step 1: Create a Supabase Account and Project

### 1.1 Sign up for Supabase
1. Go to **[https://supabase.com](https://supabase.com)**
2. Click the **"Start your project"** button (green button)
3. Sign up using:
   - GitHub (recommended)
   - Google
   - Or email/password

### 1.2 Create Your First Project
1. After logging in, you'll see the dashboard
2. Click **"New Project"** (big green button)
3. **Choose Organization**: Select "Personal" or create a new organization
4. **Fill in Project Details**:
   - **Name**: `MessMate-Auth` (or any name you prefer)
   - **Database Password**: Create a **strong password** and **SAVE IT SOMEWHERE SAFE** ⚠️
   - **Region**: Choose the region closest to your users (e.g., "US East" for North America)
5. Click **"Create new project"**
6. ⏳ **Wait 2-3 minutes** for your project to be created

> 💡 **Tip**: While waiting, you can prepare for the next steps!

---

## Step 2: Get Your Project Credentials 🔑

Once your project is created, you need to get your API keys.

### 2.1 Navigate to Project Settings
1. In your project dashboard, look for the **gear icon (⚙️)** in the **bottom left** corner
2. Click on **"Settings"** from the sidebar menu
3. Click on **"API"** section (should be near the top)

### 2.2 Copy Your Credentials
You'll see a section called "Project API keys". Copy these values:

#### 🔑 Required Values:
1. **Project URL**: 
   - Copy the URL that looks like: `https://xxxxxxxxxxxxx.supabase.co`
   - 📝 **Save this as**: "Project URL"

2. **anon/public key**:
   - Copy the **`anon`** **`public`** key (very long string starting with `eyJ...`)
   - This is **safe** to use in your frontend code
   - 📝 **Save this as**: "Anon Key"

#### 🔐 Optional (Advanced):
3. **service_role key**:
   - Copy this if you plan to do server-side operations later
   - ⚠️ **NEVER expose this in your frontend code**
   - 📝 **Save this as**: "Service Role Key"

### 2.3 Save These Credentials Securely
- 📝 Write them down in a text file temporarily
- 📋 We'll use them in Step 6 to configure your app
- ⚠️ Never commit the service_role key to version control

---

## Step 3: Configure Authentication Settings 🔐

### 3.1 Access Authentication Settings
1. From the **left sidebar**, click on **"Authentication"**
2. Click on the **"Settings"** tab (should be selected by default)
3. You'll see various authentication options

### 3.2 Email Authentication (Required)

**Email authentication is enabled by default** - you don't need to change anything here! ✅

#### What's already configured:
- ✅ **Enable email confirmations** is ON
- ✅ **Enable email signup** is ON
- ✅ **Enable email login** is ON

#### Optional Email Customization:
If you want to customize confirmation emails:
1. Scroll down to **"Email Templates"** section
2. Click on **"Confirm signup"** or **"Reset password"**
3. Customize the subject and HTML content
4. Click **"Save"**

### 3.3 Phone Authentication (Optional) 📱

> 💡 **Skip this section if you only want email/Google login**

#### Enable Phone Auth:
1. Still in **Authentication > Settings**
2. Scroll down to find **"Phone Auth"** section
3. Toggle **"Enable phone confirmations"** to **ON**

#### Configure SMS Provider:
You'll need a third-party SMS provider. **Twilio** is recommended:

**Twilio Setup** (Most Popular):
1. Sign up at **[https://twilio.com](https://twilio.com)**
2. Get a **phone number** from Twilio Console
3. Find your **Account SID** and **Auth Token** in Twilio Dashboard
4. Back in Supabase, enter:
   - **Account SID**: Your Twilio Account SID
   - **Auth Token**: Your Twilio Auth Token
   - **From Number**: Your Twilio phone number (format: `+1234567890`)
5. Click **"Save"**

---

### 3.4 Google OAuth Setup (Recommended) 🚀

**Google OAuth allows one-click login - highly recommended!**

#### Step 3.4.1: Create Google Cloud Project
1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Click **"Select a project"** dropdown at the top
3. Click **"New Project"**
4. **Project Name**: `MessMate Auth` (or any name)
5. Click **"Create"**
6. Wait for the project to be created, then **select it**

#### Step 3.4.2: Enable Required APIs
1. In Google Cloud Console, go to **"APIs & Services" > "Library"**
2. Search for **"Google+ API"** and click on it
3. Click **"Enable"**
4. Also search for **"Google Identity"** and enable it if available

#### Step 3.4.3: Create OAuth Credentials
1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth 2.0 Client IDs"**
3. If prompted, configure the **OAuth consent screen** first:
   - Choose **"External"** (unless you have a Google Workspace)
   - Fill in **App Name**: `MessMate`
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **"Save and Continue"** through the steps
4. Back to creating OAuth Client:
   - **Application type**: **"Web application"**
   - **Name**: `MessMate Auth`
   - **Authorized redirect URIs**: Click **"Add URI"** and enter:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
     ⚠️ **Replace `your-project-ref`** with your actual Supabase project reference from Step 2!
5. Click **"Create"**
6. **Copy the Client ID and Client Secret** - you'll need these!

#### Step 3.4.4: Configure in Supabase
1. Back in **Supabase Authentication > Settings**
2. Scroll down to **"Auth Providers"** section
3. Find **"Google"** and toggle it **ON**
4. Enter your credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
5. Click **"Save"**

---

## Step 4: Configure Site URLs 🌐

**This tells Supabase where your website is hosted.**

### 4.1 Set Your Site URL
1. Still in **Authentication > Settings**
2. Scroll up to find the **"Site URL"** field (usually near the top)
3. Enter your website URL:
   - **For local development**: `http://localhost:8000` (or whatever port you use)
   - **For production**: `https://yourdomain.com` (your actual domain)
   
   💡 **Start with localhost for now**: `http://localhost:8000`

### 4.2 Add Additional Redirect URLs (Optional)
In the **"Additional Redirect URLs"** section, you can add:
- `http://localhost:8000/dashboard.html`
- `http://localhost:3000` (if you use different ports)
- Any other URLs where users might land after authentication

### 4.3 Save Configuration
Click **"Save"** at the bottom of the page.

---

## Step 5: Configure Your MessMate Application 🔧

**Now we connect your Supabase project to your MessMate app!**

### 5.1 Open Your Configuration File
1. Open your **MessMate project folder** in your code editor
2. Find and open the file: **`login-config.js`**
3. You'll see something like this:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://your-project-ref.supabase.co',
       anonKey: 'your-anon-key-here',
       // ...
   };
   ```

### 5.2 Replace the Placeholder Values
**Replace the placeholder values with your actual Supabase credentials from Step 2:**

1. **Replace the URL**:
   - Change `'https://your-project-ref.supabase.co'`
   - To your **actual Project URL** from Step 2
   - Example: `'https://abcdefghijk.supabase.co'`

2. **Replace the Anon Key**:
   - Change `'your-anon-key-here'`
   - To your **actual Anon Key** from Step 2
   - Example: `'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'`

### 5.3 Update Redirect URLs (Optional)
In the same file, you can also update the redirect URLs:
```javascript
redirectUrls: {
    development: 'http://localhost:8000',    // Your local development URL
    production: 'https://yourdomain.com'    // Your future production domain
}
```

### 5.4 Save the File
⚠️ **Important**: Save the `login-config.js` file after making changes!

---

## Step 6: Test Your Setup 🎉

**Time to see if everything works!**

### 6.1 Start Your Local Server
Open **PowerShell** or **Command Prompt** in your MessMate folder and run:
```bash
python -m http.server 8000
```

Then open your browser and go to: **http://localhost:8000**

### 6.2 Test Email Authentication
1. You should see a **login form** when you open the website
2. Click **"Register"** tab
3. Fill in the form with:
   - **Name**: Your name
   - **Phone**: +1234567890 (or your real phone)
   - **Email**: Use a **real email address** you can access
   - **Password**: At least 6 characters
4. Click **"Create Account"**
5. **Check your email** for a confirmation message from Supabase
6. **Click the confirmation link** in the email
7. Go back to your website and try logging in!

### 6.3 Test Google OAuth (if configured)
1. On the login form, click **"Continue with Google"**
2. Should redirect to Google login
3. Choose your Google account
4. Should redirect back to your MessMate app
5. You should be logged in!

### 6.4 Check Supabase Dashboard
1. Go back to your **Supabase project dashboard**
2. Click **"Authentication"** in the sidebar
3. You should see your new users listed there! 🎉

### 6.5 Test Phone Auth (if configured)
1. Try signing up with a phone number
2. Check if you receive SMS code
3. Enter the code to complete signup

## Common Issues and Solutions

### Issue: "Invalid API Key"
- **Solution**: Double-check your environment variables are correct
- Make sure you're using the `anon/public` key, not the `service_role` key for client-side

### Issue: Google OAuth not working
- **Solution**: 
  - Verify redirect URI is exactly: `https://your-project-ref.supabase.co/auth/v1/callback`
  - Make sure Google+ API is enabled
  - Check Client ID and Secret are correct

### Issue: Phone auth not working
- **Solution**:
  - Verify Twilio credentials are correct
  - Check phone number format includes country code (+1234567890)
  - Ensure you have credits in your Twilio account

### Issue: Email confirmations not working
- **Solution**:
  - Check spam folder
  - Verify SMTP settings if using custom email provider
  - Try with a different email address

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different environments for development/production
   - Rotate keys periodically

2. **RLS (Row Level Security)**
   - Enable RLS on your database tables
   - Create appropriate policies for user data access
   - Test policies thoroughly

3. **Rate Limiting**
   - Configure rate limiting in Supabase Auth settings
   - Set reasonable limits for signup/login attempts

## Next Steps

After completing this setup:
1. Test all authentication methods work correctly
2. Set up your database schema if needed
3. Configure Row Level Security policies
4. Deploy your application
5. Update environment variables for production

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Twilio Setup Guide](https://supabase.com/docs/guides/auth/phone-login/twilio)

---

**Need Help?**
- Check the Supabase community: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- Join the Discord: [https://discord.supabase.com](https://discord.supabase.com)
