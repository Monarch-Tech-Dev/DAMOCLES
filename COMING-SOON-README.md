# DAMOCLES Coming Soon Landing Page

A beautiful, professional "Coming Soon" landing page with email collection for the DAMOCLES platform.

## 🎨 Features

- **Modern Design**: Gradient background with floating animations
- **Norwegian Language**: Fully localized in Norwegian
- **Email Collection**: Working email subscription system
- **Responsive**: Works on all devices
- **Interactive**: Mouse hover effects and animations
- **Professional**: SEO optimized with proper meta tags

## 📁 Files Created

- `coming-soon.html` - The main landing page
- `coming-soon-server.js` - Express server with email collection API
- `deploy-coming-soon.sh` - Deployment script for production
- `COMING-SOON-README.md` - This documentation

## 🚀 Quick Deployment

To deploy the coming soon page to production:

```bash
# Run the deployment script
./deploy-coming-soon.sh
```

This will:
1. Stop the main DAMOCLES app temporarily
2. Deploy the coming soon page to production
3. Start the coming soon server on port 3000
4. Save email subscribers to `/root/coming-soon/email-subscribers.json`

## 📧 Email Collection

The landing page collects emails via:
- **Endpoint**: `/api/subscribe`
- **Method**: `POST`
- **Format**: `{"email": "user@example.com"}`
- **Storage**: JSON file with timestamp and source tracking

## 🔄 Switching Back to Main App

When you're ready to launch the full platform:

```bash
# SSH to production server
ssh -i ~/.ssh/damocles_deploy root@157.245.65.184

# Stop coming soon page and start main app
pm2 stop coming-soon-page
pm2 start damocles-web
pm2 save
```

## 📊 Email Subscriber Data

Emails are saved with:
- Email address
- Timestamp
- Source (`coming-soon-page`)

Example format:
```json
[
  {
    "email": "user@example.com",
    "timestamp": "2025-09-28T17:11:20.622Z",
    "source": "coming-soon-page"
  }
]
```

## 🎯 Content

The page includes:
- DAMOCLES branding with animated logo
- Norwegian title: "Automatisk Gjeldsbeskyttelse"
- Description of debt protection features
- Email signup form
- Feature highlights (GDPR-compatible, Legal Automation, Violation Detection)
- Professional footer

## 🔧 Local Testing

```bash
# Start locally
PORT=3010 node coming-soon-server.js

# Visit
open http://localhost:3010

# Test email API
curl -X POST http://localhost:3010/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

This provides a professional holding page while you finish development of the full DAMOCLES platform.