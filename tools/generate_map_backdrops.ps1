Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

function New-LayerBitmap {
    param(
        [int]$Width = 1920,
        [int]$Height = 1080
    )
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    return @{ Bitmap = $bmp; Graphics = $g }
}

function Save-Layer {
    param(
        [System.Drawing.Bitmap]$Bitmap,
        [System.Drawing.Graphics]$Graphics,
        [string]$Path
    )
    $dir = Split-Path -Parent $Path
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $Graphics.Dispose()
    $Bitmap.Dispose()
}

function Fill-Gradient {
    param(
        [System.Drawing.Graphics]$G,
        [int]$W,
        [int]$H,
        [System.Drawing.Color]$Top,
        [System.Drawing.Color]$Bottom
    )
    $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $Top, $Bottom, 90)
    $G.FillRectangle($brush, $rect)
    $brush.Dispose()
}

function New-Random {
    return New-Object System.Random
}

function Draw-LavaFactory {
    param([string]$Root)
    $rand = New-Random
    $w = 1920; $h = 1080

    # FAR
    $layer = New-LayerBitmap -Width $w -Height $h
    Fill-Gradient -G $layer.Graphics -W $w -H $h -Top ([System.Drawing.Color]::FromArgb(255, 22, 18, 18)) -Bottom ([System.Drawing.Color]::FromArgb(255, 12, 10, 10))
    for ($i = 0; $i -lt 18; $i++) {
        $x = [int]($i * ($w / 16.0) + ($rand.NextDouble() * 60 - 30))
        $cw = 80 + $rand.Next(40)
        $ch = 420 + $rand.Next(300)
        $y = $h - $ch
        $c = [System.Drawing.Color]::FromArgb(145, 35, 35, 38)
        $brush = New-Object System.Drawing.SolidBrush($c)
        $layer.Graphics.FillRectangle($brush, $x, $y, $cw, $ch)
        $brush.Dispose()
    }
    Save-Layer -Bitmap $layer.Bitmap -Graphics $layer.Graphics -Path (Join-Path $Root 'bg_far.png')

    # MID
    $layer = New-LayerBitmap -Width $w -Height $h
    $g = $layer.Graphics
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(170, 90, 90, 95), 6)
    for ($i = 0; $i -lt 8; $i++) {
        $y = 180 + $i * 110
        $g.DrawLine($pen, 0, $y, $w, $y)
    }
    for ($i = 0; $i -lt 9; $i++) {
        $x = 90 + $i * 210
        $g.DrawLine($pen, $x, 90, $x, $h)
    }
    $pen.Dispose()
    for ($i = 0; $i -lt 4; $i++) {
        $ly = 760 + $i * 60
        $rect = New-Object System.Drawing.Rectangle(0, $ly, $w, 28)
        $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(180, 255, 110, 30), [System.Drawing.Color]::FromArgb(130, 190, 40, 10), 0)
        $g.FillRectangle($grad, $rect)
        $grad.Dispose()
    }
    Save-Layer -Bitmap $layer.Bitmap -Graphics $layer.Graphics -Path (Join-Path $Root 'bg_mid.png')

    # FX
    $layer = New-LayerBitmap -Width $w -Height $h
    $g = $layer.Graphics
    for ($i = 0; $i -lt 220; $i++) {
        $x = $rand.Next($w)
        $y = $rand.Next($h)
        $size = 1 + $rand.Next(3)
        $c = [System.Drawing.Color]::FromArgb(70 + $rand.Next(80), 255, 160 + $rand.Next(60), 40)
        $brush = New-Object System.Drawing.SolidBrush($c)
        $g.FillEllipse($brush, $x, $y, $size, $size)
        $brush.Dispose()
    }
    Save-Layer -Bitmap $layer.Bitmap -Graphics $layer.Graphics -Path (Join-Path $Root 'bg_fx.png')
}

function Draw-DarkForest {
    param([string]$Root)
    $rand = New-Random
    $w = 1920; $h = 1080

    # FAR
    $layer = New-LayerBitmap -Width $w -Height $h
    Fill-Gradient -G $layer.Graphics -W $w -H $h -Top ([System.Drawing.Color]::FromArgb(255, 12, 20, 14)) -Bottom ([System.Drawing.Color]::FromArgb(255, 8, 12, 10))
    $moonBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 200, 220, 235))
    $layer.Graphics.FillEllipse($moonBrush, 1430, 90, 220, 220)
    $moonBrush.Dispose()
    for ($i = 0; $i -lt 24; $i++) {
        $x = $i * 90 + $rand.Next(50)
        $y = 120 + $rand.Next(160)
        $tw = 70 + $rand.Next(40)
        $th = 820 + $rand.Next(200)
        $c = [System.Drawing.Color]::FromArgb(120, 16, 28, 19)
        $brush = New-Object System.Drawing.SolidBrush($c)
        $layer.Graphics.FillRectangle($brush, $x, $y, $tw, $th)
        $brush.Dispose()
    }
    Save-Layer -Bitmap $layer.Bitmap -Graphics $layer.Graphics -Path (Join-Path $Root 'bg_far.png')

    # MID
    $layer = New-LayerBitmap -Width $w -Height $h
    $g = $layer.Graphics
    for ($i = 0; $i -lt 22; $i++) {
        $x = $rand.Next($w)
        $y = 420 + $rand.Next(600)
        $pts = @(
            [System.Drawing.Point]::new([int]$x, [int]$h),
            [System.Drawing.Point]::new([int]($x + 40 + $rand.Next(70)), [int]$y),
            [System.Drawing.Point]::new([int]($x + 90 + $rand.Next(120)), [int]$h)
        )
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(95, 28, 56, 34))
        $g.FillPolygon($brush, $pts)
        $brush.Dispose()
    }
    for ($i = 0; $i -lt 8; $i++) {
        $x = 120 + $i * 230 + $rand.Next(30)
        $y = 740 + $rand.Next(180)
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 60, 70, 60))
        $g.FillRectangle($brush, $x, $y, 70, 100)
        $brush.Dispose()
    }
    Save-Layer -Bitmap $layer.Bitmap -Graphics $layer.Graphics -Path (Join-Path $Root 'bg_mid.png')

    # FX
    $layer = New-LayerBitmap -Width $w -Height $h
    $g = $layer.Graphics
    for ($i = 0; $i -lt 20; $i++) {
        $y = 80 + $i * 50 + $rand.Next(22)
        $rect = New-Object System.Drawing.Rectangle(0, $y, $w, 32)
        $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(18, 180, 200, 190), [System.Drawing.Color]::FromArgb(0, 180, 200, 190), 90)
        $g.FillRectangle($grad, $rect)
        $grad.Dispose()
    }
    for ($i = 0; $i -lt 80; $i++) {
        $x = $rand.Next($w)
        $y = $rand.Next($h)
        $size = 1 + $rand.Next(2)
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 160, 190, 140))
        $g.FillEllipse($brush, $x, $y, $size, $size)
        $brush.Dispose()
    }
    Save-Layer -Bitmap $layer.Bitmap -Graphics $layer.Graphics -Path (Join-Path $Root 'bg_fx.png')
}

function Draw-SpaceStation {
    param([string]$Root)
    $rand = New-Random
    $w = 1920; $h = 1080

    # FAR
    $layer = New-LayerBitmap -Width $w -Height $h
    Fill-Gradient -G $layer.Graphics -W $w -H $h -Top ([System.Drawing.Color]::FromArgb(255, 8, 14, 30)) -Bottom ([System.Drawing.Color]::FromArgb(255, 4, 8, 18))
    for ($i = 0; $i -lt 180; $i++) {
        $x = $rand.Next($w)
        $y = $rand.Next($h)
        $s = 1 + $rand.Next(2)
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(75, 180, 210, 255))
        $layer.Graphics.FillEllipse($brush, $x, $y, $s, $s)
        $brush.Dispose()
    }
    $planet = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(65, 160, 120, 255))
    $layer.Graphics.FillEllipse($planet, 1330, 140, 360, 360)
    $planet.Dispose()
    Save-Layer -Bitmap $layer.Bitmap -Graphics $layer.Graphics -Path (Join-Path $Root 'bg_far.png')

    # MID
    $layer = New-LayerBitmap -Width $w -Height $h
    $g = $layer.Graphics
    $panelPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 78, 108, 160), 3)
    for ($y = 60; $y -lt $h; $y += 120) {
        for ($x = 40; $x -lt $w; $x += 220) {
            $g.DrawRectangle($panelPen, $x, $y, 180, 80)
        }
    }
    $panelPen.Dispose()
    for ($i = 0; $i -lt 12; $i++) {
        $x = 20 + $i * 160
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 30, 220, 255))
        $g.FillRectangle($brush, $x, 0, 12, $h)
        $brush.Dispose()
    }
    Save-Layer -Bitmap $layer.Bitmap -Graphics $layer.Graphics -Path (Join-Path $Root 'bg_mid.png')

    # FX
    $layer = New-LayerBitmap -Width $w -Height $h
    $g = $layer.Graphics
    for ($i = 0; $i -lt 18; $i++) {
        $x = 80 + $i * 100
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 120, 80, 255))
        $g.FillRectangle($brush, $x, 0, 32, $h)
        $brush.Dispose()
    }
    for ($i = 0; $i -lt 120; $i++) {
        $x = $rand.Next($w)
        $y = $rand.Next($h)
        $s = 1 + $rand.Next(3)
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(50, 120, 255, 255))
        $g.FillEllipse($brush, $x, $y, $s, $s)
        $brush.Dispose()
    }
    Save-Layer -Bitmap $layer.Bitmap -Graphics $layer.Graphics -Path (Join-Path $Root 'bg_fx.png')
}

$root = (Resolve-Path (Join-Path $PSScriptRoot '..\assets\maps')).Path
Draw-LavaFactory -Root (Join-Path $root 'lava_factory')
Draw-DarkForest -Root (Join-Path $root 'dark_forest')
Draw-SpaceStation -Root (Join-Path $root 'space_station')

Write-Host 'Map backdrops generated successfully.'