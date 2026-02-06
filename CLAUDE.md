# Mentavo - AI Math Tutor

## Project Info
- **URL produkcyjna:** mentavo.pl
- **Lovable project:** https://lovable.dev/projects/bb3407cf-bda6-4450-86ba-6536ea0a1375
- **GitHub:** https://github.com/jakubgierasimiuk/learn-ai-tutor-math

## Supabase Configuration

### Project Details
- **Project Name:** TUTOR
- **Project Ref:** `rfcjhdxsczcwbpknudyy`
- **Region:** North EU (Stockholm)
- **Dashboard:** https://supabase.com/dashboard/project/rfcjhdxsczcwbpknudyy

### CLI Access
- **Supabase CLI:** `C:\Users\K\bin\supabase.exe`
- **Access Token:** `sbp_a1a40e747101a1135f6596fe4d57cbf2d21e5460`

### Quick Commands
```powershell
# Set environment variable
$env:SUPABASE_ACCESS_TOKEN = "sbp_a1a40e747101a1135f6596fe4d57cbf2d21e5460"

# List projects
C:\Users\K\bin\supabase.exe projects list

# List Edge Functions
C:\Users\K\bin\supabase.exe functions list --project-ref rfcjhdxsczcwbpknudyy

# List Secrets
C:\Users\K\bin\supabase.exe secrets list --project-ref rfcjhdxsczcwbpknudyy

# Set a secret
C:\Users\K\bin\supabase.exe secrets set KEY=value --project-ref rfcjhdxsczcwbpknudyy
```

### API Testing
```powershell
# Test study-tutor function
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY2poZHhzY3pjd2Jwa251ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjY5NDgsImV4cCI6MjA2ODYwMjk0OH0.Fljfz9HWi_N_hEZ4UKvk-PMKAWr4fbW_NJIE73dShoY"
$url = "https://rfcjhdxsczcwbpknudyy.supabase.co/functions/v1/study-tutor"
$body = '{"endpoint":"chat","message":"test","messages":[]}'
$headers = @{"Authorization"="Bearer $token";"Content-Type"="application/json"}
Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
```

## Key Files

### Frontend (React/TypeScript)
- `src/components/AIChat.tsx` - Main chat component with smart context strategy
  - Lines 268-285: Smart context management (first 3 + last 12 pairs)

### Backend (Supabase Edge Functions)
- `supabase/functions/study-tutor/index.ts` - Main AI tutor function
  - Uses Anthropic Claude API (claude-sonnet-4-5-20250929)
  - Requires `ANTHROPIC_API_KEY` secret

## Recent Fixes

### 2026-02-06: Context Loss Fix
- **Problem:** AI lost original task data after ~40 exchanges
- **Solution:** Smart context strategy - preserve first 3 pairs + last 12 pairs
- **Commit:** `c66c5c3`
- **File:** `src/components/AIChat.tsx:268-285`

## Troubleshooting

### "AI response failed" error
1. Check Anthropic API key: https://console.anthropic.com
2. Check secrets: `supabase secrets list --project-ref rfcjhdxsczcwbpknudyy`
3. Update key if needed: `supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref rfcjhdxsczcwbpknudyy`

### Deployment
- Push to `main` branch triggers auto-deploy via Lovable
- Check Lovable dashboard for build status
