"""
Social media publisher - Post to Facebook, Twitter, LinkedIn
Uses official APIs for automated posting
"""

import os
import aiohttp
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class SocialPublisher:
    """Publish content to social media platforms"""

    def __init__(self):
        # Facebook/Meta
        self.facebook_page_token = os.getenv('FACEBOOK_PAGE_ACCESS_TOKEN')
        self.facebook_page_id = os.getenv('FACEBOOK_PAGE_ID')

        # Twitter/X
        self.twitter_bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
        self.twitter_api_key = os.getenv('TWITTER_API_KEY')
        self.twitter_api_secret = os.getenv('TWITTER_API_SECRET')
        self.twitter_access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.twitter_access_secret = os.getenv('TWITTER_ACCESS_SECRET')

        # LinkedIn
        self.linkedin_access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        self.linkedin_org_id = os.getenv('LINKEDIN_ORG_ID')

        # Test mode (logs instead of posting)
        self.test_mode = os.getenv('SOCIAL_BOT_TEST_MODE', 'true').lower() == 'true'

    async def post_to_all(self, content: str, post_type: str = 'general') -> Dict[str, Any]:
        """Post to all configured platforms"""
        results = {}

        # Post to Facebook
        if self.facebook_page_token and self.facebook_page_id:
            results['facebook'] = await self.post_to_facebook(content)
        else:
            results['facebook'] = {'status': 'skipped', 'reason': 'not configured'}

        # Post to Twitter
        if self.twitter_bearer_token:
            results['twitter'] = await self.post_to_twitter(content)
        else:
            results['twitter'] = {'status': 'skipped', 'reason': 'not configured'}

        # Post to LinkedIn
        if self.linkedin_access_token:
            results['linkedin'] = await self.post_to_linkedin(content)
        else:
            results['linkedin'] = {'status': 'skipped', 'reason': 'not configured'}

        return results

    async def post_to_facebook(self, content: str) -> Dict[str, Any]:
        """
        Post to Facebook Page
        API: https://developers.facebook.com/docs/pages/publishing
        """
        if self.test_mode:
            logger.info(f"[TEST MODE] Would post to Facebook:\n{content}")
            return {'status': 'test', 'platform': 'facebook'}

        try:
            url = f'https://graph.facebook.com/v18.0/{self.facebook_page_id}/feed'

            payload = {
                'message': content,
                'access_token': self.facebook_page_token
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"✅ Posted to Facebook: {data.get('id')}")
                        return {'status': 'success', 'platform': 'facebook', 'id': data.get('id')}
                    else:
                        error = await resp.text()
                        logger.error(f"Facebook post failed: {error}")
                        return {'status': 'error', 'platform': 'facebook', 'error': error}

        except Exception as e:
            logger.error(f"Facebook posting error: {e}")
            return {'status': 'error', 'platform': 'facebook', 'error': str(e)}

    async def post_to_twitter(self, content: str) -> Dict[str, Any]:
        """
        Post to Twitter/X
        API: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
        """
        if self.test_mode:
            logger.info(f"[TEST MODE] Would post to Twitter:\n{content}")
            return {'status': 'test', 'platform': 'twitter'}

        try:
            url = 'https://api.twitter.com/2/tweets'

            headers = {
                'Authorization': f'Bearer {self.twitter_bearer_token}',
                'Content-Type': 'application/json'
            }

            payload = {
                'text': content
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as resp:
                    if resp.status == 201:
                        data = await resp.json()
                        tweet_id = data.get('data', {}).get('id')
                        logger.info(f"✅ Posted to Twitter: {tweet_id}")
                        return {'status': 'success', 'platform': 'twitter', 'id': tweet_id}
                    else:
                        error = await resp.text()
                        logger.error(f"Twitter post failed: {error}")
                        return {'status': 'error', 'platform': 'twitter', 'error': error}

        except Exception as e:
            logger.error(f"Twitter posting error: {e}")
            return {'status': 'error', 'platform': 'twitter', 'error': str(e)}

    async def post_to_linkedin(self, content: str) -> Dict[str, Any]:
        """
        Post to LinkedIn Company Page
        API: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api
        """
        if self.test_mode:
            logger.info(f"[TEST MODE] Would post to LinkedIn:\n{content}")
            return {'status': 'test', 'platform': 'linkedin'}

        try:
            url = 'https://api.linkedin.com/v2/ugcPosts'

            headers = {
                'Authorization': f'Bearer {self.linkedin_access_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }

            payload = {
                'author': f'urn:li:organization:{self.linkedin_org_id}',
                'lifecycleState': 'PUBLISHED',
                'specificContent': {
                    'com.linkedin.ugc.ShareContent': {
                        'shareCommentary': {
                            'text': content
                        },
                        'shareMediaCategory': 'NONE'
                    }
                },
                'visibility': {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                }
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as resp:
                    if resp.status == 201:
                        data = await resp.json()
                        post_id = data.get('id')
                        logger.info(f"✅ Posted to LinkedIn: {post_id}")
                        return {'status': 'success', 'platform': 'linkedin', 'id': post_id}
                    else:
                        error = await resp.text()
                        logger.error(f"LinkedIn post failed: {error}")
                        return {'status': 'error', 'platform': 'linkedin', 'error': error}

        except Exception as e:
            logger.error(f"LinkedIn posting error: {e}")
            return {'status': 'error', 'platform': 'linkedin', 'error': str(e)}

    def configure_facebook(self, page_id: str, access_token: str):
        """Configure Facebook credentials"""
        self.facebook_page_id = page_id
        self.facebook_page_token = access_token
        logger.info("Facebook configured successfully")

    def configure_twitter(self, bearer_token: str):
        """Configure Twitter credentials"""
        self.twitter_bearer_token = bearer_token
        logger.info("Twitter configured successfully")

    def configure_linkedin(self, access_token: str, org_id: str):
        """Configure LinkedIn credentials"""
        self.linkedin_access_token = access_token
        self.linkedin_org_id = org_id
        logger.info("LinkedIn configured successfully")

    def enable_live_mode(self):
        """Disable test mode - posts will go live"""
        self.test_mode = False
        logger.warning("🔴 LIVE MODE ENABLED - Posts will be published to social media!")

    def enable_test_mode(self):
        """Enable test mode - only log posts"""
        self.test_mode = True
        logger.info("🧪 TEST MODE ENABLED - Posts will only be logged")
