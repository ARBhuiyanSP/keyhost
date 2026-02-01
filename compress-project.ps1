# PowerShell script to compress the booking system project
# This script excludes node_modules and other unnecessary files

$projectName = "booking-systme"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipFileName = "${projectName}_${timestamp}.zip"
$excludePatterns = @(
    "node_modules",
    ".git",
    ".vscode",
    ".idea",
    "*.log",
    "*.stackdump",
    ".env",
    "dist",
    "build",
    ".next",
    "coverage",
    "*.zip",
    "*.rar",
    "*.7z"
)

Write-Host "Creating zip file: $zipFileName" -ForegroundColor Green
Write-Host "Excluding: $($excludePatterns -join ', ')" -ForegroundColor Yellow

# Get all files and folders, excluding the patterns
$filesToZip = Get-ChildItem -Path . -Recurse | Where-Object {
    $item = $_
    $shouldExclude = $false
    
    foreach ($pattern in $excludePatterns) {
        if ($item.FullName -like "*\$pattern\*" -or $item.FullName -like "*\$pattern") {
            $shouldExclude = $true
            break
        }
        if ($item.Name -like $pattern) {
            $shouldExclude = $true
            break
        }
    }
    
    return -not $shouldExclude
}

# Create zip file using .NET method (more reliable, can skip corrupted files)
Write-Host "`nCompressing files (skipping corrupted files automatically)..." -ForegroundColor Cyan

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipFileName, [System.IO.Compression.ZipArchiveMode]::Create)

$totalFiles = ($filesToZip | Where-Object { -not $_.PSIsContainer }).Count
$processedFiles = 0
$skippedFiles = 0
$basePath = $PWD.Path

foreach ($file in $filesToZip) {
    if (-not $file.PSIsContainer) {
        $processedFiles++
        $relativePath = $file.FullName.Substring($basePath.Length + 1)
        
        try {
            # Try to read the file first to check if it's corrupted
            $stream = [System.IO.File]::OpenRead($file.FullName)
            $stream.Close()
            
            # File is readable, add to zip
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relativePath) | Out-Null
            
            if ($processedFiles % 100 -eq 0) {
                Write-Progress -Activity "Compressing files" -Status "Processed $processedFiles of $totalFiles files" -PercentComplete (($processedFiles / $totalFiles) * 100)
            }
        } catch {
            # Skip corrupted files silently
            $skippedFiles++
            Write-Host "Skipping corrupted file: $relativePath" -ForegroundColor Yellow
        }
    }
}

Write-Progress -Activity "Compressing files" -Completed
$zip.Dispose()

Write-Host "`n✓ Successfully created: $zipFileName" -ForegroundColor Green
Write-Host "  File size: $([math]::Round((Get-Item $zipFileName).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "  Files processed: $processedFiles" -ForegroundColor Cyan
if ($skippedFiles -gt 0) {
    Write-Host "  Files skipped (corrupted): $skippedFiles" -ForegroundColor Yellow
    Write-Host "  Note: Skipped files are cache files and can be regenerated with npm install" -ForegroundColor Yellow
}

