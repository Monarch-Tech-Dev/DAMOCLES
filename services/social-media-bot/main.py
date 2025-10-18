"""
DAMOCLES Social Media Automation Bot
Viral accountability system inspired by @ElonJet approach
"""

import sys
import os
from pathlib import Path

current_dir = Path(__file__).parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from datetime import datetime, time
from dotenv import load_dotenv
import logging

from content_generator import ContentGenerator
from social_publisher import SocialPublisher
from data_fetcher import DataFetcher
from scheduler import PostScheduler

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DAMOCLES Social Media Bot",
    description="Automated viral content generation for creditor accountability",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
data_fetcher = DataFetcher()
content_generator = ContentGenerator()
social_publisher = SocialPublisher()
scheduler = PostScheduler(data_fetcher, content_generator, social_publisher)

@app.on_event("startup")
async def startup():
    """Start automated posting schedule"""
    logger.info("🤖 DAMOCLES Social Media Bot starting...")
    asyncio.create_task(scheduler.run())
    logger.info("✅ Scheduler activated - Viral content generation enabled")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "social-media-bot"}

@app.get("/preview/daily")
async def preview_daily():
    """Preview today's daily creditor violation post"""
    stats = await data_fetcher.get_daily_stats()
    content = content_generator.generate_daily_violation_post(stats)
    return {"content": content, "stats": stats}

@app.get("/preview/shame")
async def preview_shame():
    """Preview creditor shame alert"""
    worst = await data_fetcher.get_worst_creditor()
    content = content_generator.generate_creditor_shame(worst)
    return {"content": content, "creditor": worst}

@app.get("/preview/weekly")
async def preview_weekly():
    """Preview weekly summary"""
    summary = await data_fetcher.get_weekly_summary()
    content = content_generator.generate_weekly_summary(summary)
    return {"content": content, "summary": summary}

@app.get("/preview/milestone")
async def preview_milestone():
    """Preview milestone post"""
    milestone = await data_fetcher.get_latest_milestone()
    if milestone:
        content = content_generator.generate_milestone_post(milestone)
        return {"content": content, "milestone": milestone}
    return {"error": "No milestone available"}

@app.post("/manual/post/{post_type}")
async def manual_post(post_type: str, background_tasks: BackgroundTasks):
    """Manually trigger a post"""
    background_tasks.add_task(scheduler.post_now, post_type)
    return {"status": "posting", "type": post_type}

@app.get("/stats/performance")
async def performance_stats():
    """Get bot performance metrics"""
    return await scheduler.get_performance_stats()

# Admin Control Endpoints

@app.get("/admin/status")
async def get_bot_status():
    """Get current bot status and configuration"""
    return {
        "scheduler_running": scheduler.is_running,
        "test_mode": social_publisher.test_mode,
        "posts_sent": scheduler.stats.get('posts_sent', 0),
        "last_post": scheduler.stats.get('last_post_time'),
        "errors": scheduler.stats.get('errors', 0),
        "schedule": {k: v.strftime('%H:%M') for k, v in scheduler.schedule.items()},
        "platforms_configured": {
            "facebook": bool(social_publisher.facebook_page_token),
            "twitter": bool(social_publisher.twitter_bearer_token),
            "linkedin": bool(social_publisher.linkedin_access_token)
        }
    }

@app.post("/admin/control/pause")
async def pause_bot():
    """Pause automated posting"""
    scheduler.pause()
    logger.info("⏸️ Bot paused by admin")
    return {"status": "paused"}

@app.post("/admin/control/resume")
async def resume_bot():
    """Resume automated posting"""
    scheduler.resume()
    logger.info("▶️ Bot resumed by admin")
    return {"status": "running"}

@app.post("/admin/control/test-mode/enable")
async def enable_test_mode():
    """Enable test mode (posts won't be published)"""
    social_publisher.enable_test_mode()
    return {"test_mode": True, "message": "Test mode enabled - posts will only be logged"}

@app.post("/admin/control/test-mode/disable")
async def disable_test_mode():
    """Disable test mode (posts will be published)"""
    social_publisher.enable_live_mode()
    return {"test_mode": False, "message": "LIVE MODE - posts will be published!"}

@app.post("/admin/post/custom")
async def post_custom_content(data: dict, background_tasks: BackgroundTasks):
    """Post custom edited content"""
    content = data.get('content')
    platforms = data.get('platforms', ['all'])

    if not content:
        return {"error": "Content is required"}

    if 'all' in platforms:
        result = await social_publisher.post_to_all(content, post_type='custom')
    else:
        result = {}
        if 'facebook' in platforms:
            result['facebook'] = await social_publisher.post_to_facebook(content)
        if 'twitter' in platforms:
            result['twitter'] = await social_publisher.post_to_twitter(content)
        if 'linkedin' in platforms:
            result['linkedin'] = await social_publisher.post_to_linkedin(content)

    return {"status": "posted", "platforms": result}

@app.post("/admin/schedule/add")
async def schedule_post(data: dict):
    """Schedule a post for later"""
    post_type = data.get('post_type')
    scheduled_time = data.get('scheduled_time')
    content = data.get('content')

    # Add to scheduler queue (you'll need to implement queue in scheduler)
    result = await scheduler.add_scheduled_post(post_type, scheduled_time, content)

    return {"status": "scheduled", "details": result}

@app.get("/admin/drafts")
async def get_drafts():
    """Get all draft posts"""
    drafts = []

    # Generate drafts for all post types
    stats = await data_fetcher.get_daily_stats()
    drafts.append({
        "type": "daily",
        "content": content_generator.generate_daily_violation_post(stats),
        "data": stats
    })

    worst = await data_fetcher.get_worst_creditor()
    if worst:
        drafts.append({
            "type": "shame",
            "content": content_generator.generate_creditor_shame(worst),
            "data": worst
        })

    summary = await data_fetcher.get_weekly_summary()
    drafts.append({
        "type": "weekly",
        "content": content_generator.generate_weekly_summary(summary),
        "data": summary
    })

    return {"drafts": drafts}

@app.get("/admin/history")
async def get_post_history(limit: int = 20):
    """Get posting history"""
    # In production, store in database
    return {
        "posts": scheduler.get_post_history(limit),
        "total": scheduler.stats.get('posts_sent', 0)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("SOCIAL_BOT_PORT", 8002)),
        reload=True
    )
