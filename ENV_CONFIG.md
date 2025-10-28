# Environment Configuration

## Required `.env.local` File

Create a file named `.env.local` in the root of the frontend project with the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:5213/api
```

This tells the frontend to connect to your backend API running on port 5213.

## Alternative Ports

If your backend runs on different ports:
- HTTP: `http://localhost:5213/api`
- HTTPS: `https://localhost:7113/api` (requires SSL cert trust)

Use HTTP for development to avoid SSL certificate issues.
