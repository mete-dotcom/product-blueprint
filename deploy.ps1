$ErrorActionPreference = "Continue"
$Scope = "kalptenduaya-8486s-projects"

Write-Host "Linking Vercel project..."
vercel link --yes --scope $Scope

Write-Host "Removing old env variable if exists..."
vercel env rm DEEPSTRAIN_LICENSE_SECRET production -y --scope $Scope

Write-Host "Adding new env variable..."
"dev-secret-key-12345" | vercel env add DEEPSTRAIN_LICENSE_SECRET production --scope $Scope

$ErrorActionPreference = "Stop"
Write-Host "Deploying to production..."
vercel --prod --yes --scope $Scope

Write-Host "Deployment finished."
