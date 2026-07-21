Add-Type -AssemblyName System.Drawing

function Resize-Img($inPath, $outPath, $tw, $th) {
    $resolvedIn = (Resolve-Path $inPath).Path
    $src = [System.Drawing.Image]::FromFile($resolvedIn)
    $rX = $tw / $src.Width
    $rY = $th / $src.Height
    $r = [Math]::Min($rX, $rY)
    $nw = [int]($src.Width * $r)
    $nh = [int]($src.Height * $r)
    $px = [int](($tw - $nw) / 2)
    $py = [int](($th - $nh) / 2)
    $bmp = New-Object System.Drawing.Bitmap($tw, $th)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, $px, $py, $nw, $nh)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Host "Resized $inPath to $outPath ($tw x $th)"
}

Resize-Img 'Dosha Nivarana LOGO.png' 'user-app/assets/logo.png' 512 512
Resize-Img 'Dosha Nivarana LOGO.png' 'user-app/assets/icon.png' 512 512
Resize-Img 'Dosha Nivarana LOGO.png' 'user-app/assets/splash.png' 1024 1024
Resize-Img 'Dosha Nivarana LOGO.png' 'user-app/assets/adaptive-icon.png' 512 512
Resize-Img 'Dosha Nivarana LOGO.png' 'pro-panel/public/logo.png' 512 512
Resize-Img 'Dosha Nivarana LOGO.png' 'pro-panel/public/logo.jpg' 512 512
Resize-Img 'Dosha Nivarana LOGO.png' 'pro-panel/public/favicon.png' 128 128
Resize-Img 'Dosha Nivarana LOGO.png' 'admin-panel/admin/public/logo.png' 512 512
Resize-Img 'Dosha Nivarana LOGO.png' 'admin-panel/admin/public/favicon.png' 128 128
