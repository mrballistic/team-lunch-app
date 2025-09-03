# Vercel Deployment Instructions

## 1. Install Vercel CLI
```bash
npm i -g vercel
```

## 2. Link Project to Vercel
```bash
cd team-lunch-app
vercel link
```

## 3. Add Environment Variables
Either through the Vercel dashboard or CLI:

```bash
# Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add SUPABASE_SERVICE_ROLE_KEY

# External APIs
vercel env add YELP_API_KEY
vercel env add OPENROUTE_SERVICE_API_KEY
```

## 4. Deploy
```bash
vercel --prod
```

## 5. Set Up GitHub Integration
1. Push code to GitHub repository
2. Connect repository in Vercel dashboard
3. Enable automatic deployments on push to main
4. Enable Preview deployments for pull requests

## Environment Variables Required:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `YELP_API_KEY`: Your Yelp Fusion API key
- `OPENROUTE_SERVICE_API_KEY`: Your OpenRouteService API key
