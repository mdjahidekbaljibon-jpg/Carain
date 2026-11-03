# CARAIN AI

Mobile-first Bengali AI chat app.

## Features
- Gemini chat and image understanding
- In-app Settings for optional User ID, Gemini API Key, Image API URL and Image API Key
- API connection test
- Face reference stored in this browser's IndexedDB
- Image generation UI and girlfriend-mode image-first flow
- Adult conversation mode (non-graphic, consent/safety-aware)

## API settings and security
Settings saves API credentials in this browser's localStorage. This is convenient but **not encrypted**; use only on a trusted personal device. Credentials are sent over HTTPS to this app's server routes for requests and are not written to the repository. For a public multi-user app, replace this with authenticated server-side secret storage and per-user access controls.

A User ID field is only a local profile label; it does not create authentication or an account system.

## Gemini
Enter a Google AI Studio API key in Settings, or set `GEMINI_API_KEY` in Vercel environment variables.

## Image provider adapter
Enter an HTTPS Image API URL and API key in Settings. The adapter sends:
```json
{ "prompt": "...", "reference_image": "data:image/...;base64,...", "n": 1 }
```
The provider must return `{ "image_url": "https://..." }` or `{ "image_base64": "..." }`. Adapt `api/generate-image.js` to the selected provider's actual API format. Image generation does not work until a compatible provider is configured.

Never put API keys in frontend source code or commit them to GitHub.
