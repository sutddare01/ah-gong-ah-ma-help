

## Plan: Switch to OpenRouter API

You want to use your own OpenRouter API key instead of the Lovable AI Gateway. Here's how we'll do it:

### Step 1: Store your OpenRouter API key securely
We'll save your API key as a backend secret so it's never exposed in client code. I'll prompt you to enter it.

### Step 2: Update edge functions to use OpenRouter
Both `supabase/functions/chat/index.ts` and `supabase/functions/scan-explain/index.ts` will be updated to call `https://openrouter.ai/api/v1/chat/completions` instead of `https://ai.gateway.lovable.dev/v1/chat/completions`, using your `OPENROUTER_API_KEY` secret.

The OpenRouter API is OpenAI-compatible, so the request/response format stays the same — only the URL and auth header change.

### Step 3: Pick a model
On OpenRouter you can use any model they support. Some cost-effective options:
- `google/gemini-2.5-flash` — cheap, fast, good quality
- `google/gemini-2.0-flash-001` — very cheap
- `anthropic/claude-3.5-haiku` — fast and capable

You can tell me which model you'd like, or I'll default to `google/gemini-2.5-flash`.

### What changes

| File | Change |
|------|--------|
| Secret store | Add `OPENROUTER_API_KEY` secret |
| `supabase/functions/chat/index.ts` | Switch gateway URL + auth header to OpenRouter |
| `supabase/functions/scan-explain/index.ts` | Same switch |

No frontend changes needed — the edge functions handle everything.

