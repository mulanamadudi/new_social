/*
  # Add API Data Table for Social Media Metrics

  1. New Tables
    - `ApiData`
      - `id` (text, primary key)
      - `shopId` (text, foreign key to Shop)
      - `platformId` (text, foreign key to Platform)
      - `profileName` (text)
      - `followers` (float)
      - `likes` (float)
      - `views` (float)
      - `posts` (float)
      - `lastFetched` (datetime)
      - `isActive` (boolean)
      - `createdAt` (datetime)
      - `updatedAt` (datetime)

  2. Changes
    - Add API credentials storage to Shop table
    - Add API mode toggle to Shop table
*/

-- Add API mode and credentials to Shop table
ALTER TABLE Shop ADD COLUMN apiMode BOOLEAN DEFAULT false;
ALTER TABLE Shop ADD COLUMN youtubeApiKey TEXT;
ALTER TABLE Shop ADD COLUMN facebookAccessToken TEXT;
ALTER TABLE Shop ADD COLUMN instagramAccessToken TEXT;
ALTER TABLE Shop ADD COLUMN tiktokAccessToken TEXT;
ALTER TABLE Shop ADD COLUMN pinterestAccessToken TEXT;

-- Create ApiData table for storing API-fetched social media data
CREATE TABLE IF NOT EXISTS ApiData (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  shopId TEXT NOT NULL,
  platformId TEXT NOT NULL,
  profileName TEXT NOT NULL,
  followers REAL NOT NULL DEFAULT 0,
  likes REAL NOT NULL DEFAULT 0,
  views REAL NOT NULL DEFAULT 0,
  posts REAL NOT NULL DEFAULT 0,
  lastFetched DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE,
  FOREIGN KEY (platformId) REFERENCES Platform(id) ON DELETE CASCADE
);

-- Create unique constraint to prevent duplicate platform entries per shop
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_data_shop_platform ON ApiData(shopId, platformId);