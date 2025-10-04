# MessMate Login System

A comprehensive authentication system built with Supabase, supporting email/password, phone (SMS), and Google OAuth authentication methods.

## ✨ Features

- 🔐 **Email/Password Authentication** - Traditional signup and signin
- 📱 **Phone Authentication** - SMS-based verification with OTP
- 🎯 **Google OAuth** - One-click social login
- 📧 **Password Reset** - Email-based password recovery
- 📱 **Responsive Design** - Works on desktop and mobile
- ♿ **Accessible** - Keyboard navigation and screen reader support
- 🎨 **Modern UI** - Clean, professional interface
- 🔒 **Secure** - Built with Supabase security best practices

## 🚀 Quick Start

### 1. Setup Supabase

Follow the comprehensive guide in [`instruction.md`](./instruction.md) to:
- Create a Supabase project
- Configure authentication providers
- Get your API keys
- Set up phone and Google OAuth

### 2. Configure Your Credentials

Edit `login-config.js` and replace the placeholder values:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-actual-project.supabase.co',
    anonKey: 'your-actual-anon-key-here',
    // ... rest of config
};
```

### 3. Run Locally

**Option A: Using Node.js**
```bash
npm install
npm start
```

**Option B: Using Python**
```bash
python -m http.server 3000
```

**Option C: Using VS Code Live Server**
- Right-click `login.html` → "Open with Live Server"

### 4. Open Your Browser

Navigate to `http://localhost:3000/login.html`

## 📁 File Structure

```
├── login.html          # Main login page
├── login-styles.css    # Styling and responsive design
├── login-auth.js       # Authentication logic
├── login-config.js     # Configuration (UPDATE THIS!)
├── instruction.md      # Detailed setup instructions
├── package.json        # Dependencies and scripts
├── .gitignore          # Protect sensitive files
└── README.md          # This file
```

## 🔧 Configuration

### Environment Variables (Optional)

You can also use environment variables instead of editing `login-config.js`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Redirect URLs

Update the redirect URLs in `login-config.js` to match your domains:

```javascript
redirectUrls: {
    development: 'http://localhost:3000',
    production: 'https://yourdomain.com'
}
```

## 🎯 Usage Examples

### Basic Integration

The login page automatically handles authentication and redirects users to `/dashboard` after successful login. You can customize this in `login-auth.js`:

```javascript
function redirectAfterAuth() {
    window.location.href = '/your-app-page';
}
```

### Custom Redirect

You can pass a redirect URL as a query parameter:

```
https://yourdomain.com/login.html?redirect_to=/specific-page
```

### Check Authentication Status

In your other pages, check if user is authenticated:

```javascript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
    window.location.href = '/login.html';
}
```

## 🔐 Security Features

- ✅ Input validation and sanitization
- ✅ CSRF protection via Supabase
- ✅ Rate limiting on authentication attempts
- ✅ Secure session management
- ✅ Environment variable protection
- ✅ No sensitive data in client-side code

## 📱 Responsive Design

The login page is fully responsive and works on:
- 💻 Desktop computers
- 📱 Mobile phones
- 📟 Tablets
- ⌨️ Keyboard-only navigation
- 👁️ Screen readers

## 🛠️ Development

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

Since this is a static site, you can deploy the files directly to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Cloudflare Pages

## 🐛 Troubleshooting

### Common Issues

**"Configuration Error"**
- Make sure you've updated `login-config.js` with your actual Supabase credentials
- Check that your Supabase project is active

**Google OAuth not working**
- Verify your OAuth redirect URI is exactly: `https://your-project.supabase.co/auth/v1/callback`
- Make sure Google OAuth is enabled in Supabase Auth settings

**Phone auth not working**
- Check that you've configured Twilio (or your SMS provider) in Supabase
- Verify phone numbers include country code (+1234567890)

**Email not confirmed**
- Check spam folder for confirmation emails
- Verify email confirmations are enabled in Supabase

### Debug Mode

Open browser dev tools (F12) to see detailed error messages and authentication flow.

## 📚 Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Detailed Setup Instructions](./instruction.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this in your projects!

## 💡 Tips

- Always test authentication flows in incognito/private mode
- Use environment variables in production
- Set up proper HTTPS in production
- Consider implementing 2FA for enhanced security
- Monitor authentication metrics in Supabase dashboard

---

**Need help?** Check the [instruction.md](./instruction.md) file for detailed setup steps, or open an issue if you encounter problems.