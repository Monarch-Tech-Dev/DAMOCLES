# SendGrid Email Service Setup Guide

Complete guide for configuring SendGrid email delivery for DAMOCLES GDPR Engine.

## Overview

The GDPR Engine uses SendGrid API v3 for reliable, trackable email delivery. SendGrid provides:

- **99.9% uptime SLA** - Enterprise-grade reliability
- **Email tracking** - Opens, clicks, bounces
- **Deliverability optimization** - SPF, DKIM, DMARC
- **Reply-to addressing** - Track responses with custom addresses
- **Webhook integrations** - Real-time event notifications

## Prerequisites

- SendGrid account (Free tier: 100 emails/day, Paid: $19.95/mo for 50k emails)
- Domain access for DNS configuration
- Production server access

---

## Step 1: Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com/)
2. Sign up for account (free tier sufficient for testing)
3. Verify your email address
4. Complete account setup

**Recommended Plan**:
- **Development**: Free tier (100 emails/day)
- **Production**: Essentials ($19.95/mo for 50,000 emails/month)

---

## Step 2: Generate API Key

1. Log into SendGrid dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**

**Configuration**:
- **Name**: `DAMOCLES_GDPR_Production`
- **Permissions**: **Full Access** (for now - can restrict later)

4. **Copy the API key immediately** (you can't view it again)

```
SG.xxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

---

## Step 3: Configure Sender Authentication

SendGrid requires domain verification to prevent spoofing and improve deliverability.

### Option A: Domain Authentication (Recommended)

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Select your DNS provider
4. Enter your domain: `damocles.no`

SendGrid will provide DNS records like:

```
Type: CNAME
Host: em1234.damocles.no
Value: u1234567.wl089.sendgrid.net

Type: CNAME
Host: s1._domainkey.damocles.no
Value: s1.domainkey.u1234567.wl089.sendgrid.net

Type: CNAME
Host: s2._domainkey.damocles.no
Value: s2.domainkey.u1234567.wl089.sendgrid.net
```

5. Add these records to your DNS provider (DigitalOcean, Cloudflare, etc.)
6. Wait 24-48 hours for DNS propagation
7. Click **Verify** in SendGrid dashboard

### Option B: Single Sender Verification (Quick Start)

If you can't configure DNS immediately:

1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Enter sender details:
   - **From Name**: `DAMOCLES GDPR Service`
   - **From Email**: `gdpr@damocles.no`
   - **Reply To**: `gdpr@damocles.no`
   - **Company Address**: Your company address
3. Check your inbox for verification email
4. Click verification link

**Note**: Single sender verification has lower deliverability than domain authentication.

---

## Step 4: Configure Production Environment

SSH into production server and update the GDPR engine environment:

```bash
# SSH into production
ssh -i ~/.ssh/your_deploy_key your-admin@your.server.ip.here

# Navigate to project directory
cd ~/damocles-platform

# Edit docker-compose.yml to add SendGrid variables
sudo nano docker-compose.yml
```

Add under `gdpr-engine` service environment section:

```yaml
gdpr-engine:
  environment:
    - SENDGRID_API_KEY=SG.your_actual_api_key_here
    - GDPR_FROM_EMAIL=gdpr@damocles.no
    - GDPR_FROM_NAME=DAMOCLES GDPR Service
```

**Security Best Practice**: Alternatively, create a `.env.gdpr` file:

```bash
# Create secure env file
sudo nano .env.gdpr
```

Add:
```
SENDGRID_API_KEY=SG.your_actual_api_key_here
GDPR_FROM_EMAIL=gdpr@damocles.no
GDPR_FROM_NAME=DAMOCLES GDPR Service
```

Update docker-compose.yml:
```yaml
gdpr-engine:
  env_file:
    - .env.gdpr
```

Save and restart:
```bash
sudo docker compose restart gdpr-engine
```

---

## Step 5: Test Email Delivery

### Test 1: Check Dev Mode Status

```bash
# Check current logs
sudo docker logs damocles-gdpr-engine -f
```

Generate a GDPR request from web app. If SendGrid not configured, you'll see:
```
📧 GDPR EMAIL (DEV MODE)
To: creditor@example.com
...
✅ Email logged (SendGrid not configured)
```

### Test 2: Verify Production Sending

After adding API key, generate another request. Look for:

```
✅ GDPR email sent via SendGrid to creditor@example.com
```

### Test 3: SendGrid Dashboard

1. Go to SendGrid dashboard
2. Click **Activity** in sidebar
3. Verify email appears in activity feed
4. Check delivery status

### Test 4: Test Email to Yourself

Create a test creditor with your personal email:

```bash
# Use web app or API
POST /api/creditors
{
  "name": "Test Company",
  "email": "your-email@gmail.com",
  ...
}
```

Generate GDPR request and verify you receive it.

---

## Step 6: Configure Inbound Email Parsing (Optional)

To automatically track when creditors reply to GDPR requests:

1. In SendGrid, go to **Settings** → **Inbound Parse**
2. Click **Add Host & URL**
3. Configure:
   - **Subdomain**: `gdpr`
   - **Domain**: `damocles.no`
   - **Destination URL**: `https://damocles.no/gdpr-api/webhooks/inbound`

4. Add MX record to DNS:
```
Type: MX
Host: gdpr.damocles.no
Value: mx.sendgrid.net
Priority: 10
```

5. Implement webhook handler in GDPR engine (if not already done)

---

## Step 7: Configure Webhooks (Optional)

Track email events in real-time:

1. Go to **Settings** → **Mail Settings** → **Event Webhook**
2. Enable webhook
3. Set URL: `https://damocles.no/gdpr-api/webhooks/sendgrid`
4. Select events to track:
   - ✅ Delivered
   - ✅ Opened
   - ✅ Clicked
   - ✅ Bounced
   - ✅ Spam Report

5. Save settings

---

## Troubleshooting

### Issue: Emails Not Sending

**Check 1**: Verify API key is set
```bash
sudo docker exec damocles-gdpr-engine env | grep SENDGRID
```

**Check 2**: Check logs for errors
```bash
sudo docker logs damocles-gdpr-engine --tail 50 | grep -i sendgrid
```

**Check 3**: Test API key directly
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "gdpr@damocles.no"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test email"}]
  }'
```

Expected response: HTTP 202 (success)

### Issue: Emails Going to Spam

**Solution 1**: Complete domain authentication (see Step 3)

**Solution 2**: Add SPF record to DNS:
```
Type: TXT
Host: @
Value: v=spf1 include:sendgrid.net ~all
```

**Solution 3**: Warm up your sending reputation
- Start with small volumes (10-20/day)
- Gradually increase over 2-4 weeks

### Issue: High Bounce Rate

**Check**: Email addresses are valid
**Fix**: Implement email validation before sending:

```python
from email_validator import validate_email

try:
    valid = validate_email(creditor_email)
    creditor_email = valid.email
except EmailNotValidError:
    # Handle invalid email
```

---

## Monitoring & Analytics

### SendGrid Dashboard Metrics

Monitor these key metrics:

1. **Delivery Rate**: Should be > 95%
2. **Open Rate**: Typical 15-25% for transactional emails
3. **Bounce Rate**: Should be < 5%
4. **Spam Reports**: Should be < 0.1%

### Email Deliverability Best Practices

✅ **Do**:
- Use clear, professional subject lines
- Include unsubscribe link (if applicable)
- Send from authenticated domain
- Monitor bounce rates
- Respect user preferences

❌ **Don't**:
- Use all caps in subject lines
- Include excessive links
- Send to purchased email lists
- Use spam trigger words ("FREE", "ACT NOW", etc.)
- Send from @gmail.com addresses

---

## Cost Estimation

### SendGrid Pricing Tiers

| Plan | Monthly Cost | Included Emails | Cost per Additional |
|------|--------------|-----------------|---------------------|
| Free | $0 | 100/day (3,000/mo) | N/A |
| Essentials | $19.95 | 50,000 | $1/1,000 |
| Pro | $89.95 | 100,000 | $0.85/1,000 |

### DAMOCLES Usage Estimate

**Assumptions**:
- 1,000 active users
- Each user averages 2 GDPR requests/month
- 30% require escalation emails
- Total: ~2,600 emails/month

**Recommended**: Essentials plan ($19.95/mo) provides plenty of headroom.

---

## Advanced Configuration

### Custom Email Templates

Create HTML templates in SendGrid:

1. Go to **Email API** → **Dynamic Templates**
2. Create template with placeholders
3. Reference template ID in code:

```python
payload = {
    "template_id": "d-1234567890abcdef",
    "personalizations": [{
        "to": [{"email": to_email}],
        "dynamic_template_data": {
            "creditor_name": creditor_name,
            "request_id": request_id,
            "deadline": deadline
        }
    }]
}
```

### A/B Testing

Test different subject lines:

1. Create A/B test in SendGrid
2. Set test criteria (open rate, click rate)
3. SendGrid automatically sends winning variant

---

## Security Considerations

### API Key Management

🔒 **Critical Security Rules**:

1. **Never commit API keys to git**
   ```bash
   # Verify .env.gdpr is in .gitignore
   git check-ignore .env.gdpr
   ```

2. **Rotate keys every 90 days**
   - Create new key
   - Update production
   - Delete old key

3. **Use restricted permissions** (after testing)
   - Only grant "Mail Send" permission
   - Revoke unused permissions

4. **Monitor unauthorized usage**
   - Check SendGrid activity logs weekly
   - Set up alerts for unusual sending patterns

### Data Privacy

- GDPR request emails contain sensitive personal data
- Use TLS encryption (SendGrid enforces this)
- Implement rate limiting (already done via cooldown)
- Log only metadata, not email contents

---

## Production Checklist

Before going live:

- [ ] SendGrid account created
- [ ] API key generated and secured
- [ ] Domain authentication completed (DNS records added)
- [ ] Production environment variables configured
- [ ] Test email sent successfully
- [ ] Email appears correct in inbox (not spam)
- [ ] SendGrid activity dashboard shows delivery
- [ ] Inbound parse configured (optional)
- [ ] Event webhooks configured (optional)
- [ ] Monitoring alerts set up
- [ ] Team trained on SendGrid dashboard
- [ ] API key rotation schedule established
- [ ] Backup email sending method documented

---

## Support Resources

- **SendGrid Documentation**: https://docs.sendgrid.com/
- **API Reference**: https://docs.sendgrid.com/api-reference
- **Status Page**: https://status.sendgrid.com/
- **Support**: https://support.sendgrid.com/

---

## Next Steps After Setup

1. **Monitor first 100 emails** closely
   - Check delivery rates
   - Verify formatting
   - Ensure tracking works

2. **Set up alerts** in SendGrid
   - High bounce rate (> 5%)
   - Spam reports (> 0.5%)
   - Delivery failures

3. **Optimize delivery timing**
   - Avoid sending late night/early morning
   - Business hours (9 AM - 5 PM) have best open rates

4. **Implement response tracking**
   - Use reply-to address: `gdpr+{request_id}@damocles.no`
   - Parse inbound emails to mark requests as responded

5. **Legal compliance**
   - Add required footer with company info
   - Include "Why am I receiving this?" explanation
   - Ensure GDPR compliance for email storage

---

## Conclusion

SendGrid setup is straightforward and production-ready. The email service code already implements best practices including:

- ✅ Proper error handling
- ✅ Dev mode fallback
- ✅ Email tracking
- ✅ CC support
- ✅ Custom reply-to addressing
- ✅ Structured metadata

Once you add the API key to production, emails will send automatically with full tracking and reliability.

**Estimated Setup Time**: 30 minutes (+ 24-48 hours for DNS propagation)
