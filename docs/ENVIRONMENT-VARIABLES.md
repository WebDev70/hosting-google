# Environment Variables Guide

This guide explains how to manage environment variables for local development and production deployments.

## Current Environment Variables

The application currently uses the following environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Port the server listens on |
| `NODE_ENV` | No | (none) | Node environment: `development`, `production`, or `test` |

## Local Development

### Option 1: Create a .env file (Recommended)

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your local settings:
   ```bash
   PORT=3000
   NODE_ENV=development
   ```

3. Install `dotenv` package (optional, if you want automatic .env loading):
   ```bash
   npm install dotenv
   ```

4. Update `server.js` to load .env file (add at the top):
   ```javascript
   require('dotenv').config();
   ```

### Option 2: Set variables directly in terminal

**macOS/Linux:**
```bash
export PORT=3000
export NODE_ENV=development
npm start
```

**Windows (Command Prompt):**
```cmd
set PORT=3000
set NODE_ENV=development
npm start
```

**Windows (PowerShell):**
```powershell
$env:PORT="3000"
$env:NODE_ENV="development"
npm start
```

### Option 3: Inline with npm start

```bash
PORT=3000 NODE_ENV=development npm start
```

## Production Deployment

**IMPORTANT:** Never commit `.env` files to version control. Each platform has its own way to set environment variables securely.

### AWS Elastic Beanstalk

**Via Console:**
1. Navigate to your Elastic Beanstalk environment
2. Go to **Configuration** > **Software**
3. Scroll to **Environment properties**
4. Add variables:
   - `PORT`: (leave empty, Elastic Beanstalk sets this automatically)
   - `NODE_ENV`: `production`

**Via EB CLI:**
```bash
eb setenv NODE_ENV=production
```

### AWS ECS/Fargate

Add to your task definition JSON:

```json
{
  "containerDefinitions": [
    {
      "name": "usaspending-container",
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

Or use AWS Secrets Manager for sensitive data:

```json
{
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:secret-name"
    }
  ]
}
```

### Google Cloud Run

**Via gcloud command:**
```bash
gcloud run deploy usaspending-service \
  --image your-image-url \
  --set-env-vars NODE_ENV=production \
  --platform managed \
  --region your-region
```

**Via Cloud Console:**
1. Go to Cloud Run > Select your service > Edit & Deploy New Revision
2. Under **Variables & Secrets** > **Environment Variables**
3. Add: `NODE_ENV=production`

**Note:** Cloud Run automatically sets `PORT` - don't override it.

### Google App Engine

Add to `app.yaml`:

```yaml
runtime: custom
env: flex

env_variables:
  NODE_ENV: "production"
```

### Heroku

**Via Heroku CLI:**
```bash
heroku config:set NODE_ENV=production
```

**Via Heroku Dashboard:**
1. Go to your app > Settings > Config Vars
2. Click **Reveal Config Vars**
3. Add: `NODE_ENV` = `production`

**Note:** Heroku automatically sets `PORT` - don't override it.

### Docker / Docker Compose

**docker-compose.yml:**
```yaml
services:
  usa-spending-app:
    environment:
      - NODE_ENV=production
      - PORT=3000
```

**docker run command:**
```bash
docker run -e NODE_ENV=production -e PORT=3000 -p 3000:3000 usa-spending-app
```

## Best Practices

### Security

1. **Never commit `.env` files** - They're listed in `.gitignore`
2. **Use platform-specific secret managers** for sensitive data:
   - AWS: Secrets Manager or Parameter Store
   - GCP: Secret Manager
   - Azure: Key Vault
3. **Rotate secrets regularly** if you add authentication/API keys
4. **Use different values** for development, staging, and production

### Organization

1. **Document all variables** in `.env.example`
2. **Keep `.env.example` updated** when adding new variables
3. **Use descriptive variable names** (e.g., `DATABASE_URL` not `DB`)
4. **Group related variables** with comments in `.env.example`

### Future Considerations

If you add features that require environment variables, consider:

1. **Database URL** - If you add a database:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

2. **API Keys** - If you add third-party services:
   ```
   SENDGRID_API_KEY=your-key-here
   STRIPE_SECRET_KEY=sk_test_...
   ```

3. **Rate Limiting** - If you add rate limiting:
   ```
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **CORS Configuration** - If you need to configure CORS:
   ```
   CORS_ORIGIN=https://yourdomain.com
   ```

## Troubleshooting

### Variables not being read

**Problem:** Environment variables aren't being picked up

**Solutions:**
1. Ensure `.env` file is in the project root (same directory as `server.js`)
2. Check that `dotenv` is installed if using `.env` file
3. Verify `require('dotenv').config()` is at the top of `server.js`
4. Restart the server after changing environment variables
5. On cloud platforms, redeploy after changing environment variables

### Port conflicts

**Problem:** Application can't start due to port already in use

**Solutions:**
1. Change `PORT` in `.env` to a different port (e.g., 3001, 8080)
2. Find and stop the process using port 3000:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### Production deployment issues

**Problem:** App works locally but fails in production

**Solutions:**
1. Verify `NODE_ENV=production` is set on the platform
2. Check that `PORT` is not hardcoded and uses `process.env.PORT`
3. Review platform logs for environment variable errors
4. Ensure all required environment variables are set on the platform
5. Test locally with `NODE_ENV=production` to simulate production environment

## Platform-Specific Notes

### Cloud Run
- **Automatically sets PORT** (usually 8080) - do not override
- Container must listen on the port specified by `PORT` env var
- Application already handles this correctly with `process.env.PORT || 3000`

### Elastic Beanstalk
- **Automatically sets PORT** based on platform
- Uses port 8081 internally, nginx proxies to port 80/443
- Application handles this correctly

### Heroku
- **Automatically sets PORT** - critical to use `process.env.PORT`
- Port changes on every dyno restart
- Application already handles this correctly

## References

- [Twelve-Factor App - Config](https://12factor.net/config)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [GCP Secret Manager](https://cloud.google.com/secret-manager)
