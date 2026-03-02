import { TwitterAdapter } from "./twitterAdapter.js";
import { LinkedInAdapter } from "./linkedinAdapter.js";
import { RedditAdapter } from "./redditAdapter.js";
import { InstagramAdapter } from "./instagramAdapter.js";
import { TikTokAdapter } from "./tiktokAdapter.js";

const adapterMap = new Map([
  ["twitter", new TwitterAdapter()],
  ["linkedin", new LinkedInAdapter()],
  ["reddit", new RedditAdapter()],
  ["instagram", new InstagramAdapter()],
  ["tiktok", new TikTokAdapter()],
]);

export const supportedSocialPlatforms = Array.from(adapterMap.keys());

export const getSocialAdapter = (platform) => adapterMap.get(platform) || null;
