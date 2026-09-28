<#
.SYNOPSIS
  Generates the PWA icon set from the Keekii mark.

.DESCRIPTION
  The source mark is a transparent 1024x1024 PNG. That is fine for a normal
  "any" icon, but two contexts need an opaque plate behind it:

    * Maskable icons - Android crops these to whatever shape the launcher
      wants, including a circle, and leaves the outermost 10% as bleed. A
      transparent mark would let the device background show through, and a
      circle crop could cut the mark in half.
    * Apple touch icons - iOS composites transparency against black, so an
      unpainted icon shows a black square.

  This script is committed rather than run ad hoc so the icon set can be
  regenerated deterministically when the mark changes, instead of drifting.

.EXAMPLE
  pwsh -File scripts/generate-pwa-icons.ps1
#>
[CmdletBinding()]
param(
  # Source mark. Must be square and transparent.
  [string]$Source = 'resources/client/brand/keekii-mark-1024-ember.png',

  # Output directory, created if missing.
  [string]$OutputDir = 'public/icons',

  # Plate colour behind the mark for maskable / Apple / favicon icons.
  # Defaults to the Monochrome Ember dark ink #1e150e, not the brand orange:
  # the mark's own ink is #E85F23, and orange-on-orange works out to 1.2:1,
  # which is invisible. Dark ink plate measures ~5.2:1. Change with care - the
  # contrast guard below will reject a plate that does not separate.
  [string]$Plate = '#1e150e',

  # Minimum WCAG contrast between the mark and the plate. A launcher icon has
  # no text to fall back on, so it needs clear separation rather than a
  # merely "acceptable" ratio.
  [double]$MinContrast = 3.0
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot

# Joins repo-relative paths, but leaves absolute paths alone. `Join-Path`
# happily concatenates an absolute path onto a root and produces something
# Windows then rejects with a misleading error, so rooted input is detected
# explicitly.
function Resolve-RepoPath {
  param([string]$Path)

  if ([System.IO.Path]::IsPathRooted($Path)) {
    return $Path
  }
  return Join-Path $repoRoot $Path
}

$sourcePath = Resolve-RepoPath $Source
$outputPath = Resolve-RepoPath $OutputDir

if (-not (Test-Path -LiteralPath $sourcePath)) {
  throw "Source mark not found: $sourcePath"
}

$plateColor = [System.Drawing.ColorTranslator]::FromHtml($Plate)

New-Item -ItemType Directory -Force -Path $outputPath | Out-Null

$markImage = [System.Drawing.Image]::FromFile($sourcePath)
if ($markImage.Width -ne $markImage.Height) {
  $markImage.Dispose()
  throw "Source mark must be square, got $($markImage.Width)x$($markImage.Height)"
}

# --- Guard: does the mark actually read against the plate? ------------------
function Get-RelativeLuminance {
  param([System.Drawing.Color]$Color)

  $channels = @($Color.R, $Color.G, $Color.B)
  $linear = foreach ($channel in $channels) {
    $srgb = $channel / 255.0
    if ($srgb -le 0.03928) { $srgb / 12.92 } else { [Math]::Pow(($srgb + 0.055) / 1.055, 2.4) }
  }

  return (0.2126 * $linear[0]) + (0.7152 * $linear[1]) + (0.0722 * $linear[2])
}

function Get-ContrastRatio {
  param(
    [System.Drawing.Color]$A,
    [System.Drawing.Color]$B
  )

  $la = Get-RelativeLuminance $A
  $lb = Get-RelativeLuminance $B
  $lighter = [Math]::Max($la, $lb)
  $darker = [Math]::Min($la, $lb)

  return ($lighter + 0.05) / ($darker + 0.05)
}

# The mark's ink is not documented anywhere, and it is not the brand orange,
# so it is sampled from the artwork rather than assumed.
function Get-DominantInk {
  param([System.Drawing.Image]$Image)

  $bitmap = New-Object System.Drawing.Bitmap($Image)
  try {
    $tally = @{}
    for ($y = 0; $y -lt $bitmap.Height; $y += 4) {
      for ($x = 0; $x -lt $bitmap.Width; $x += 4) {
        $pixel = $bitmap.GetPixel($x, $y)
        if ($pixel.A -le 128) { continue }
        $key = '{0:X2}{1:X2}{2:X2}' -f $pixel.R, $pixel.G, $pixel.B
        $tally[$key] = 1 + $(if ($tally.ContainsKey($key)) { $tally[$key] } else { 0 })
      }
    }
    if ($tally.Count -eq 0) {
      throw 'Source mark has no opaque pixels; nothing would be drawn.'
    }
    $winner = ($tally.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1).Key
    return [System.Drawing.ColorTranslator]::FromHtml('#' + $winner)
  }
  finally {
    $bitmap.Dispose()
  }
}

$inkColor = Get-DominantInk $markImage
$contrast = Get-ContrastRatio $inkColor $plateColor
Write-Host ('mark ink #{0:X2}{1:X2}{2:X2}  on plate {3}  contrast {4:N2}:1' -f `
    $inkColor.R, $inkColor.G, $inkColor.B, $Plate, $contrast)

if ($contrast -lt $MinContrast) {
  $markImage.Dispose()
  throw ("Mark/plate contrast {0:N2}:1 is below the {1:N1}:1 minimum. The icon would be " +
    'unreadable at launcher size. Pick a plate that separates from the mark.') -f $contrast, $MinContrast
}
Write-Host ''

# Emits one icon. Creating and drawing in a single scope avoids handing a
# Graphics/ Bitmap pair back across a function boundary, where PowerShell can
# unroll the return value and lose the types.
function Write-Icon {
  param(
    [string]$Name,
    [int]$Size,
    # Fraction of the canvas the mark occupies. Lower means more padding.
    [double]$Scale = 1.0,
    [switch]$WithPlate
  )

  $pixelFormat = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  $canvas = New-Object System.Drawing.Bitmap($Size, $Size, $pixelFormat)

  try {
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      if ($WithPlate) {
        $graphics.Clear($plateColor)
      }
      else {
        $graphics.Clear([System.Drawing.Color]::Transparent)
      }

      $side = [int][Math]::Round($Size * $Scale)
      $offset = [int][Math]::Round(($Size - $side) / 2)
      $target = New-Object System.Drawing.Rectangle($offset, $offset, $side, $side)

      $graphics.DrawImage(
        $markImage,
        $target,
        0,
        0,
        $markImage.Width,
        $markImage.Height,
        [System.Drawing.GraphicsUnit]::Pixel
      )
    }
    finally {
      $graphics.Dispose()
    }

    $file = Join-Path $outputPath $Name
    $canvas.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)

    $kb = [Math]::Round((Get-Item -LiteralPath $file).Length / 1KB, 1)
    Write-Host ('{0,-24} {1,4}x{2,-4} {3,7} KB' -f $Name, $Size, $Size, $kb)
  }
  finally {
    $canvas.Dispose()
  }
}

# --- "any" purpose: mark fills the canvas, transparency preserved -----------
Write-Icon -Name 'icon-192.png' -Size 192
Write-Icon -Name 'icon-512.png' -Size 512

# --- maskable: mark held to 60% so it clears the corner safe zone ----------
# Android's guidance is that the mark must sit inside a circle of 80% diameter.
# 60% leaves margin even under an aggressive OEM circle crop.
Write-Icon -Name 'maskable-192.png' -Size 192 -Scale 0.6 -WithPlate
Write-Icon -Name 'maskable-512.png' -Size 512 -Scale 0.6 -WithPlate

# --- Apple touch: 180x180; iOS applies its own squircle, so keep more padding
Write-Icon -Name 'apple-touch-icon.png' -Size 180 -Scale 0.7 -WithPlate

# --- Favicon: small sizes need the plate to stay legible on light chrome ----
Write-Icon -Name 'favicon-32.png' -Size 32 -Scale 0.8 -WithPlate
Write-Icon -Name 'favicon-16.png' -Size 16 -Scale 0.8 -WithPlate

# Vector favicon, for browsers that support it. Copied rather than rasterised
# so it stays crisp on high-DPI displays.
$svgSource = Resolve-RepoPath 'resources/client/brand/keekii-mark-light.svg'
if (Test-Path -LiteralPath $svgSource) {
  Copy-Item -LiteralPath $svgSource -Destination (Join-Path $repoRoot 'public/favicon.svg') -Force
  Write-Host ('{0,-24} {1,4}     {2,7}' -f 'favicon.svg', 'vector', '-')
}

$markImage.Dispose()

Write-Host ''
Write-Host "Icons written to $OutputDir"
