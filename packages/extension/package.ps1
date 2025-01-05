$version = "1.0.0"
$outputZip = "opaque-ai-privacy-guard-v$version.zip"

# Remove existing zip if it exists
if (Test-Path $outputZip) {
    Remove-Item $outputZip
}

# Create a new zip file
Compress-Archive -Path @(Get-Content "files-to-zip.txt") -DestinationPath $outputZip

Write-Host "Created $outputZip for Chrome Web Store submission"
