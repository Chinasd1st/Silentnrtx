# Last.fm API Integration Guide

## Getting a Last.fm API Key

1. Visit https://www.last.fm/api/account/create
2. Log in with your Last.fm account
3. Fill in the application form:
   - **Application Name**: "Silentnrtx Homepage" (or any name)
   - **Application Description**: "Personal homepage showing recently played tracks"
   - **Callback URL**: Leave empty (not needed for read-only API)
4. Submit and copy your API key

## Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_LAST_FM_API_KEY=your_api_key_here
NEXT_PUBLIC_LAST_FM_USERNAME=your_lastfm_username
```

Or edit `config.ts` directly to set these values.

## How It Works

### API Request

```
GET https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user={username}&api_key={api_key}&format=json&limit=1
```

### Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `method` | `user.getrecenttracks` | API method |
| `user` | (username) | Last.fm username |
| `api_key` | (API key) | Your API key |
| `format` | `json` | Response format |
| `limit` | `1` | Number of tracks to return |

### Response Structure

```json
{
  "recenttracks": {
    "track": [
      {
        "name": "Track Title",
        "artist": { "#text": "Artist Name" },
        "album": { "#text": "Album Name" },
        "image": [
          { "#text": "", "size": "small" },
          { "#text": "https://...", "size": "medium" },
          { "#text": "https://...", "size": "large" }
        ],
        "@attr": { "nowplaying": "true" },
        "url": "https://www.last.fm/music/..."
      }
    ]
  }
}
```

### Now Playing Detection

The `@attr.nowplaying` field indicates if the track is currently playing:
- **"true"** → Currently playing → shows green "Now Playing" badge + animated indicator
- **absent / "false"** → Last played track → shows "Last Played" badge

### Fallback Logic

1. Try fetching the most recent track
2. Check `@attr.nowplaying === "true"` for nowplaying state
3. If no track is currently playing, display the last played track
4. If the API call fails or no tracks exist, show "No recent tracks"

### Error Handling

- API key missing → shows "Set NEXT_PUBLIC_LAST_FM_API_KEY" hint
- Network error → shows "No recent tracks"
- Empty response → shows "No recent tracks"

All states have proper UI feedback (loading skeleton, error state, empty state).
