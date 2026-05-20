# O&M AI Helper Edge Function

This function keeps the OpenAI API key out of the GitHub Pages app.

## Supabase setup

Install the Supabase CLI, then from the project folder run:

```powershell
supabase functions deploy om-ai-helper
supabase secrets set OPENAI_API_KEY=your_openai_api_key
```

Optional:

```powershell
supabase secrets set OPENAI_MODEL=gpt-5.4
```

The app calls:

```text
https://ixqastmhzqzseokrvsxd.supabase.co/functions/v1/om-ai-helper
```
