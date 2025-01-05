# Create packages directory if it doesn't exist
New-Item -ItemType Directory -Path "packages" -Force

# Create directories for each package
New-Item -ItemType Directory -Path "packages/extension" -Force
New-Item -ItemType Directory -Path "packages/landing" -Force
New-Item -ItemType Directory -Path "packages/dashboard" -Force

# Move web contents to landing
if (Test-Path "web") {
    Get-ChildItem -Path "web" -Recurse | ForEach-Object {
        $targetPath = $_.FullName.Replace("web", "packages/landing")
        if (!(Test-Path (Split-Path -Parent $targetPath))) {
            New-Item -ItemType Directory -Path (Split-Path -Parent $targetPath) -Force
        }
        Copy-Item -Path $_.FullName -Destination $targetPath -Force
    }
    Remove-Item -Path "web" -Recurse -Force
}

Write-Host "Project restructured successfully!"
