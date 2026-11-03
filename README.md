# CARAIN AI

Mobile-first Bengali AI chat app.

## Features
- Gemini text chat and image understanding
- Adult conversation mode (non-graphic, consent/safety-aware)
- Face reference photo stored locally in the browser's IndexedDB
- Image-generation UI and girlfriend-mode image-first flow
- Single-image generation instruction (provider behavior is not guaranteed)

## Vercel setup
Set these environment variables in Project Settings → Environment Variables:

- `GEMINI_API_KEY`: Google AI Studio API key for chat.
- `IMAGE_API_URL`: Your image-generation provider's endpoint.
- `IMAGE_API_KEY`: Secret key for that provider.

The image endpoint is a provider adapter. It sends JSON:
```json
{ "prompt": "...", "reference_image": "data:image/...;base64,...", "n": 1 }
```
The provider must return either `{ "image_url": "https://..." }` or `{ "image_base64": "..." }`. Adapt `api/generate-image.js` to the chosen provider's documented API format. Image generation will return a setup error until a compatible provider is configured.

Deploy the repository as a Vercel project. Never put API keys in frontend code or commit them to GitHub.
