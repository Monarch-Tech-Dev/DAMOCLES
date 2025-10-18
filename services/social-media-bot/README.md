# DAMOCLES Social Media Bot 🤖

**Viral accountability system inspired by @ElonJet**

Automated social media bot that creates public accountability for Norwegian creditors through viral, data-driven posts. Uses real platform data to expose violations and protect consumers.

## 🎯 Features

### Automated Content Types

1. **Daily Violation Reports** (8 AM every day)
   - Total active violations
   - New violations detected
   - Worst offender of the day
   - Call-to-action to check creditors

2. **Creditor Shame Alerts** (Wednesdays at 3 PM)
   - Name and shame worst performing creditor
   - Violation score and grade
   - Response rate statistics
   - Public accountability

3. **Weekly Summaries** (Sundays at 7 PM)
   - GDPR requests sent
   - Violations detected
   - Users protected
   - Top violator of the week

4. **Milestone Posts** (Triggered automatically)
   - User count milestones
   - Request count milestones
   - Violations detected milestones
   - Build community momentum

5. **Viral Comparisons** (Random throughout week)
   - Make violations relatable
   - Compare costs to everyday items
   - Shareable infographics

6. **Breaking News** (Real-time when major violations detected)
   - Urgent alerts
   - Creates FOMO
   - Drives immediate action

## 🚀 Quick Start

### 1. Installation

```bash
cd services/social-media-bot
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**For Testing (Safe):**
```env
SOCIAL_BOT_TEST_MODE=true
```

**For Production (Live Posting):**
```env
SOCIAL_BOT_TEST_MODE=false
# Add your social media API credentials
```

### 3. Run the Bot

```bash
# Start in test mode (logs only, no actual posting)
python main.py

# Or with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

## 📱 Social Media Setup

### Facebook/Meta

1. Create Facebook Page: https://www.facebook.com/pages/create
2. Create Meta Developer App: https://developers.facebook.com/
3. Get Page Access Token
4. Add to `.env`:
   ```env
   FACEBOOK_PAGE_ID=your_page_id
   FACEBOOK_PAGE_ACCESS_TOKEN=your_token
   ```

### Twitter/X

1. Apply for Developer Account: https://developer.twitter.com/
2. Create Project and App
3. Generate Bearer Token and Access Tokens
4. Add to `.env`:
   ```env
   TWITTER_BEARER_TOKEN=your_bearer_token
   TWITTER_API_KEY=your_api_key
   TWITTER_API_SECRET=your_api_secret
   TWITTER_ACCESS_TOKEN=your_access_token
   TWITTER_ACCESS_SECRET=your_access_secret
   ```

### LinkedIn

1. Create LinkedIn Company Page
2. Apply for LinkedIn Marketing Developer Platform access
3. Generate Access Token
4. Add to `.env`:
   ```env
   LINKEDIN_ACCESS_TOKEN=your_token
   LINKEDIN_ORG_ID=your_organization_id
   ```

## 📊 API Endpoints

### Preview Content (Before Going Live)

```bash
# Preview daily violation post
GET http://localhost:8002/preview/daily

# Preview creditor shame post
GET http://localhost:8002/preview/shame

# Preview weekly summary
GET http://localhost:8002/preview/weekly

# Preview milestone post
GET http://localhost:8002/preview/milestone
```

### Manual Posting

```bash
# Manually trigger a post
POST http://localhost:8002/manual/post/daily
POST http://localhost:8002/manual/post/shame
POST http://localhost:8002/manual/post/weekly
POST http://localhost:8002/manual/post/viral
```

### Performance Stats

```bash
# Get bot performance metrics
GET http://localhost:8002/stats/performance
```

## 🗓️ Posting Schedule

| Content Type | Frequency | Time | Day |
|-------------|-----------|------|-----|
| Daily Violations | Every day | 08:00 | All |
| Creditor Shame | Weekly | 15:00 | Wednesday |
| Weekly Summary | Weekly | 19:00 | Sunday |
| Milestones | Event-based | Anytime | Any |
| Viral Comparisons | Random | 12:00 | Random |
| Breaking News | Real-time | Immediate | Any |

## 🎯 Growth Strategy

### Phase 1: Manual Testing (Week 1-2)
- Run in TEST_MODE
- Review generated content
- Refine templates
- Test on small audience

### Phase 2: Semi-Automated (Week 3-4)
- Enable live posting
- Monitor engagement
- A/B test content types
- Build initial following

### Phase 3: Fully Automated (Month 2+)
- Let bot run 24/7
- Focus on content quality
- Respond to comments
- Track viral spread

### Phase 4: Scale (Month 6+)
- 10,000+ followers target
- Media coverage
- Influencer partnerships
- User-generated content

## 🔥 Why This Works

### The @ElonJet Formula

✅ **Public Data** - All violations are real and verifiable
✅ **Automated** - Consistent posting without manual work
✅ **Accountability** - Names and shames bad actors
✅ **Shareable** - Viral, relatable content
✅ **Actionable** - Clear call-to-action for users

### Expected Results

- **Engagement Rate**: 5-10% (industry average: 1-2%)
- **Share Rate**: 2-5% (controversial content)
- **Growth Rate**: 20-30% month-over-month
- **Media Coverage**: Within 3-6 months
- **User Acquisition**: 50-100 new users per viral post

## 📈 Analytics

Track performance in your social media dashboards:

- **Facebook Insights** - https://www.facebook.com/insights
- **Twitter Analytics** - https://analytics.twitter.com
- **LinkedIn Analytics** - https://www.linkedin.com/analytics

## 🛡️ Legal Considerations

✅ **All data is public and verifiable**
✅ **No personal information shared**
✅ **Factual statements only**
✅ **No defamation - just facts**
✅ **Links to source data**

## 🤝 Community Building

Engage with your audience:

1. **Respond to comments** - Build relationships
2. **Share user stories** - Create social proof
3. **Run polls** - Increase engagement
4. **Host AMAs** - Build trust
5. **Create hashtags** - Build movement (#DamoclesNorge)

## 📞 Support

For issues or questions:
- Create issue on GitHub
- Email: support@damocles.no
- Twitter: @DamoclesNorge

## 🚨 Important Notes

- Always start in TEST_MODE first
- Review all generated content before going live
- Monitor for negative feedback
- Be prepared for media attention
- Have crisis communication plan ready

---

**Remember**: With great power comes great responsibility. This bot can create massive accountability and drive real change. Use it wisely. 🎯
