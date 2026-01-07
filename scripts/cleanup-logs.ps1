# PowerShell script to remove all console.log statements
# This will clean up debug logging from the codebase

$files = @(
    "app\api\auth\[...nextauth]\route.ts",
    "app\api\webhook\route.ts",
    "app\api\orders\update-status\route.ts",
    "app\api\inventory\update-sales\route.ts",
    "app\api\initialize-payment\route.ts",
    "app\checkout\page.tsx",
    "app\product\[slug]\page.tsx",
    "app\lib\email.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path "c:\Users\hp\Desktop\clautechs - Copy\cadetmart" $file
    if (Test-Path $fullPath) {
        Write-Host "Cleaning $file..."
        $content = Get-Content $fullPath -Raw
        
        # Remove console.log statements (single and multi-line)
        $content = $content -replace "console\.log\([^)]*\);\r?\n?", ""
        
        Set-Content $fullPath $content -NoNewline
        Write-Host "✅ Cleaned $file"
    }
}

Write-Host "`n✅ All console.log statements removed!"
