# Chop Counter – deploy on Vercel
1. Put this folder in a GitHub repo (index.html, api/analyze.js, README.md).
2. vercel.com > Add New > Project > import the repo > Deploy (no build settings needed).
3. Project > Settings > Environment Variables, add:
   - ANTHROPIC_API_KEY = your key from console.anthropic.com
   - APP_PASSCODE = any passcode you choose (stops strangers spending your credits)
4. Redeploy. Open the URL in Safari on iPhone > Share > Add to Home Screen.
Optional: MODEL = claude-sonnet-5-5 (default).
