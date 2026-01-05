
$sourcePath = "frontend\assets\images\logo.png"
$destPath512 = "frontend\assets\images\icon-512.png"
$destPath192 = "frontend\assets\images\icon-192.png"

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $sourcePath)) {
    Write-Host "Error: Source logo not found at $sourcePath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($sourcePath)
$squareSize = 512

# Create new square bitmap (Transparent background)
$bmp = New-Object System.Drawing.Bitmap($squareSize, $squareSize)
$graph = [System.Drawing.Graphics]::FromImage($bmp)
$graph.Clear([System.Drawing.Color]::Transparent)
$graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Calculate centered position
$ratio = [Math]::Min($squareSize / $srcImage.Width, $squareSize / $srcImage.Height)
$newWidth = [int]($srcImage.Width * $ratio)
$newHeight = [int]($srcImage.Height * $ratio)
$posX = [int](($squareSize - $newWidth) / 2)
$posY = [int](($squareSize - $newHeight) / 2)

$graph.DrawImage($srcImage, $posX, $posY, $newWidth, $newHeight)

# Save 512x512
$bmp.Save($destPath512, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created icon-512.png"

# Resize for 192x192
$bmp192 = New-Object System.Drawing.Bitmap(192, 192)
$graph192 = [System.Drawing.Graphics]::FromImage($bmp192)
$graph192.Clear([System.Drawing.Color]::Transparent)
$graph192.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph192.DrawImage($bmp, 0, 0, 192, 192)

$bmp192.Save($destPath192, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created icon-192.png"

$srcImage.Dispose()
$bmp.Dispose()
$graph.Dispose()
$bmp192.Dispose()
$graph192.Dispose()
