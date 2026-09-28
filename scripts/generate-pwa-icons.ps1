<#
.SYNOPSIS
  Generates the PWA icon set and the mark rasters from the Keekii artwork.

.DESCRIPTION
  The source is a 1024x1024 PNG that is already art-directed: a full-bleed
  rounded plate (measured 99.9% of the canvas) with only the corner radius
  transparent, and the mark on top. That changes the job of this script
  compared to drawing a plate behind a bare mark - the plate is part of the
  design, so "any" icons must keep the source's own corners and rounding, and
  three contexts still need the transparent corners dealt with:

    * Maskable icons - Android crops these to whatever shape the launcher
      wants and bleeds the outermost 10%. A transparent corner would show the
      launcher's own background through it, so the plate is flattened to a
      full square first, then the artwork is held to 60% so the mark stays
      inside the 80% safe circle under an aggressive OEM crop.
    * Apple touch icons - iOS composites transparency against black, so an
      unpainted corner shows a black square.
    * Favicons at 16/32px - the corner radius is below a pixel at those sizes
      and aliases badly against both light and dark browser chrome.

  Flattening samples the plate colour out of the artwork rather than hard-coding
  it, so replacing the source file cannot silently leave the script painting a
  different colour behind it.

  The default sources are themselves generated, not hand-drawn:
  scripts/build-favicon-from-wordmark.ps1 lifts the "k" and the twin-pulse "i"
  pair out of the wordmark and rasterises them here. Run that first, or the
  icons are rebuilt from whatever the older sources happen to contain.

  Two variants are generated. The light one is the PWA set, because a launcher
  shows the same icon in both light and dark shells. The dark one feeds the
  256px mark rasters, which generate-splash-screens.py composes into the iOS
  startup images. The loader itself renders the animated vector rather than
  either raster, since the mark's twin-pulse "i" pair has to move.

  This script is committed rather than run ad hoc so the icons can be
  regenerated deterministically when the artwork changes, instead of drifting.

.PARAMETER Source
  The light 1024x1024 PNG to build the PWA set from. Square, already art-directed.

.PARAMETER DarkSource
  The dark 1024x1024 PNG, used for the mark rasters the splash screens are
  composed from. Falls back to $Source.

.PARAMETER Plate
  Optional plate override. Leave unset to sample the artwork's own plate, which
  is the default and the safe choice.

.EXAMPLE
  powershell -File scripts/generate-pwa-icons.ps1
#>
[CmdletBinding()]
param(
  # Light artwork. Drives the PWA set.
  [string]$Source = 'resources/client/brand/keekii-favicon-k-wordmark-light-1024.png',

  # Dark artwork. Drives the 256px mark rasters the splash screens are built from.
  [string]$DarkSource = 'resources/client/brand/keekii-favicon-k-wordmark-dark-1024.png',

  # Output directory, created if missing.
  [string]$OutputDir = 'public/icons',

  # Plate colour. Empty means "sample it from the source".
  [string]$Plate = '',

  # Minimum WCAG contrast between the mark and its plate. 3:1 is the WCAG
  # threshold for meaningful non-text graphics; a launcher icon has no text to
  # fall back on, so it needs clear separation rather than a merely
  # "acceptable" ratio.
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

  if ([System.IO.Path]::IsPathRooted($Path)) { return $Path }
  return Join-Path $repoRoot $Path
}

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

# Tallies the opaque pixels of an image by colour, ignoring any of $Exclude so a
# mark can be found on top of its own plate. Returns results sorted by coverage,
# most first.
function Get-ColorTally {
  param(
    [System.Drawing.Image]$Image,
    [System.Drawing.Color[]]$Exclude = @(),
    [int]$MinAlpha = 128
  )

  $bitmap = New-Object System.Drawing.Bitmap($Image)
  try {
    $tally = @{}
    $total = 0
    for ($y = 0; $y -lt $bitmap.Height; $y += 4) {
      for ($x = 0; $x -lt $bitmap.Width; $x += 4) {
        $pixel = $bitmap.GetPixel($x, $y)
        if ($pixel.A -le $MinAlpha) { continue }

        $skip = $false
        foreach ($excluded in $Exclude) {
          # A small tolerance keeps anti-aliased plate pixels from being counted
          # as part of the mark.
          $dr = [Math]::Abs($pixel.R - $excluded.R)
          $dg = [Math]::Abs($pixel.G - $excluded.G)
          $db = [Math]::Abs($pixel.B - $excluded.B)
          if (($dr + $dg + $db) -le 12) { $skip = $true; break }
        }
        if ($skip) { continue }

        $key = '{0:X2}{1:X2}{2:X2}' -f $pixel.R, $pixel.G, $pixel.B
        $tally[$key] = 1 + $(if ($tally.ContainsKey($key)) { $tally[$key] } else { 0 })
        $total++
      }
    }

    if ($tally.Count -eq 0) { return @() }

    $results = foreach ($entry in ($tally.GetEnumerator() | Sort-Object Value -Descending)) {
      [pscustomobject]@{
        Color = [System.Drawing.ColorTranslator]::FromHtml('#' + $entry.Key)
        Share = $entry.Value / [double]$total
      }
    }
    return @($results)
  }
  finally {
    $bitmap.Dispose()
  }
}

# Emits one icon. Creating and drawing in a single scope avoids handing a
# Graphics/Bitmap pair back across a function boundary, where PowerShell can
# unroll the return value and lose the types.
function Write-Icon {
  param(
    [string]$Name,
    [int]$Size,
    [System.Drawing.Image]$SourceImage,
    [System.Drawing.Color]$PlateColor,
    # Fraction of the canvas the artwork occupies. Lower means more padding.
    [double]$Scale = 1.0,
    # Paint an opaque plate behind the artwork. Used together with a flattened
    # source so the result is a full square.
    [switch]$WithPlate
  )

  $canvas = New-Object System.Drawing.Bitmap(
    $Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )

  try {
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      if ($WithPlate) { $graphics.Clear($PlateColor) } else { $graphics.Clear([System.Drawing.Color]::Transparent) }

      $side = [int][Math]::Round($Size * $Scale)
      $offset = [int][Math]::Round(($Size - $side) / 2)
      $target = New-Object System.Drawing.Rectangle($offset, $offset, $side, $side)

      $graphics.DrawImage(
        $SourceImage,
        $target,
        0,
        0,
        $SourceImage.Width,
        $SourceImage.Height,
        [System.Drawing.GraphicsUnit]::Pixel
      )
    }
    finally {
      $graphics.Dispose()
    }

    $file = Join-Path $script:outputPath $Name
    $canvas.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)

    $kb = [Math]::Round((Get-Item -LiteralPath $file).Length / 1KB, 1)
    Write-Host ('{0,-24} {1,4}x{2,-4} {3,7} KB' -f $Name, $Size, $Size, $kb)
  }
  finally {
    $canvas.Dispose()
  }
}

# Builds one complete icon set from a source. Loading, sampling, flattening,
# guarding and drawing all happen inside this one function on purpose: each
# System.Drawing object is created and destroyed in the scope that owns it,
# which is the only arrangement PS 5.1 does not silently unroll.
function Invoke-IconSet {
  param(
    [string]$SourcePath,
    [string]$Label,
    [string]$PlateOverride,
    [switch]$LoaderOnly
  )

  Write-Host ''
  Write-Host "--- $Label ---"

  $image = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    if ($image.Width -ne $image.Height) {
      throw "Source artwork must be square, got $($image.Width)x$($image.Height)"
    }

    # The centre pixel is inside the plate for this artwork. Sampling beats a
    # hard-coded hex because the whole failure mode this script guards against
    # is the artwork changing and the plate being left behind.
    if ([string]::IsNullOrWhiteSpace($PlateOverride)) {
      $centre = New-Object System.Drawing.Bitmap($image)
      try {
        $plateColor = $centre.GetPixel([int]($image.Width / 2), [int]($image.Height / 2))
      }
      finally {
        $centre.Dispose()
      }
      $plateLabel = 'sampled'
    }
    else {
      $plateColor = [System.Drawing.ColorTranslator]::FromHtml($PlateOverride)
      $plateLabel = 'given'
    }

    # Guard: the artwork is multi-colour rather than a single ink, so the whole
    # palette sitting on the plate is reported. Only the dominant colour gates
    # the build; the rest include a near-plate tint used for depth, which is
    # meant to be close and would fail any threshold worth setting.
    $palette = Get-ColorTally -Image $image -Exclude @($plateColor)
    if ($palette.Count -eq 0) {
      throw 'No mark found on top of the plate; the source may be a blank square.'
    }

    $dominant = $palette[0]
    Write-Host ('  plate #{0:X2}{1:X2}{2:X2} ({3})' -f `
        $plateColor.R, $plateColor.G, $plateColor.B, $plateLabel)
    foreach ($entry in ($palette | Select-Object -First 4)) {
      $ratio = Get-ContrastRatio $entry.Color $plateColor
      Write-Host ('    #{0:X2}{1:X2}{2:X2}  {3,6:N1}% of mark  contrast {4,6:N2}:1' -f `
          $entry.Color.R, $entry.Color.G, $entry.Color.B,
          ($entry.Share * 100), $ratio)
    }

    $contrast = Get-ContrastRatio $dominant.Color $plateColor
    if ($contrast -lt $MinContrast) {
      throw ("Dominant mark/plate contrast {0:N2}:1 is below the {1:N1}:1 minimum. " +
        'The icon would be unreadable at launcher size. This is an artwork ' +
        'problem, not a script one.') -f $contrast, $MinContrast
    }

    # Flattened variant, for the contexts that must not be transparent.
    $flat = New-Object System.Drawing.Bitmap(
      $image.Width, $image.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    try {
      $g = [System.Drawing.Graphics]::FromImage($flat)
      try {
        $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.Clear($plateColor)
        # Rectangle overload rather than the (x, y, w, h, unit) form: PowerShell
        # 5.1 fails to resolve that one against a [System.Drawing.Image] and
        # reports only "cannot find an overload ... argument count 6".
        $sourceRect = New-Object System.Drawing.Rectangle(0, 0, $image.Width, $image.Height)
        $g.DrawImage($image, $sourceRect)
      }
      finally {
        $g.Dispose()
      }

      if ($LoaderOnly) {
        # Only generate-splash-screens.py consumes the dark variant, and only at
        # a size that covers a 3x display for the loader's ~74px slot, so there
        # is no point emitting a launcher set nobody references.
        Write-Icon -Name 'mark-dark-256.png' -Size 256 -SourceImage $flat `
          -PlateColor $plateColor -Scale 0.9 -WithPlate
      }
      else {
        # "any": artwork fills the canvas and keeps its designed corners.
        Write-Icon -Name 'icon-192.png' -Size 192 -SourceImage $image -PlateColor $plateColor
        Write-Icon -Name 'icon-512.png' -Size 512 -SourceImage $image -PlateColor $plateColor

        # maskable: flattened plate, artwork held to 60%. Android's guidance is
        # that the mark must sit inside a circle of 80% diameter; 60% leaves
        # margin under an aggressive OEM circle crop. Flattening first is what
        # stops the launcher background showing through the corners.
        Write-Icon -Name 'maskable-192.png' -Size 192 -SourceImage $flat `
          -PlateColor $plateColor -Scale 0.6 -WithPlate
        Write-Icon -Name 'maskable-512.png' -Size 512 -SourceImage $flat `
          -PlateColor $plateColor -Scale 0.6 -WithPlate

        # Apple touch: 180x180; iOS applies its own squircle, so keep padding.
        Write-Icon -Name 'apple-touch-icon.png' -Size 180 -SourceImage $flat `
          -PlateColor $plateColor -Scale 0.7 -WithPlate

        # Favicon: 16/32px, flattened so the corner radius does not alias.
        Write-Icon -Name 'favicon-32.png' -Size 32 -SourceImage $flat `
          -PlateColor $plateColor -Scale 0.8 -WithPlate
        Write-Icon -Name 'favicon-16.png' -Size 16 -SourceImage $flat `
          -PlateColor $plateColor -Scale 0.8 -WithPlate

        # The loader also renders on a light theme, so it needs a light mark to
        # pair with the dark one. Flattened and inset like the dark mark, so
        # the two are visually consistent across the theme switch.
        Write-Icon -Name 'mark-light-256.png' -Size 256 -SourceImage $flat `
          -PlateColor $plateColor -Scale 0.9 -WithPlate
      }
    }
    finally {
      $flat.Dispose()
    }
  }
  finally {
    $image.Dispose()
  }
}

$script:outputPath = Resolve-RepoPath $OutputDir
New-Item -ItemType Directory -Force -Path $script:outputPath | Out-Null

$lightPath = Resolve-RepoPath $Source
if (-not (Test-Path -LiteralPath $lightPath)) {
  throw "Source artwork not found: $lightPath"
}
Invoke-IconSet -SourcePath $lightPath -Label 'PWA set (light plate)' -PlateOverride $Plate

# The dark variant is optional: the loader falls back to the light mark if the
# file is absent, which would be a visual regression rather than a failure.
$darkPath = Resolve-RepoPath $DarkSource
if (Test-Path -LiteralPath $darkPath) {
  Invoke-IconSet -SourcePath $darkPath -Label 'Mark rasters (dark plate)' -PlateOverride $Plate -LoaderOnly
}
else {
  Write-Warning "Dark loader source missing, loader will fall back to the light mark: $darkPath"
}

# --- Vector favicons --------------------------------------------------------
# Copied rather than rasterised so they stay crisp at any size. Both colour
# variants are emitted because the tab is the one surface where the artwork is
# the whole background, and a light plate on a dark tab reads as a bright
# square. app.blade.php picks between them with prefers-color-scheme.
#
# The sources are the wordmark-derived favicons: the "k" here is the logo's own
# glyph, generated by scripts/build-favicon-from-wordmark.ps1. The C2PA-signed
# favicons beside them are the original artwork and are left in place as the
# credentialed record; the shipped ones are unsigned because a manifest cannot
# describe artwork that has since changed.
$vectorPairs = @(
  @{ Source = 'resources/client/brand/keekii-favicon-k-wordmark-light.svg'; Dest = 'public/favicon.svg' },
  @{ Source = 'resources/client/brand/keekii-favicon-k-wordmark-dark.svg'; Dest = 'public/favicon-dark.svg' }
)

foreach ($pair in $vectorPairs) {
  $svgSource = Resolve-RepoPath $pair.Source
  $svgDest = Resolve-RepoPath $pair.Dest
  if (Test-Path -LiteralPath $svgSource) {
    Copy-Item -LiteralPath $svgSource -Destination $svgDest -Force
    Write-Host ('{0,-24} {1,4}     {2,7}' -f (Split-Path -Leaf $pair.Dest), 'vector', '-')
  }
  else {
    Write-Warning "Vector favicon source missing, skipped: $svgSource"
  }
}

Write-Host ''
Write-Host 'Icons written to ' + $OutputDir

# --- Animated loader mark --------------------------------------------------
# The loader's twin-pulse "i" pair animates from CSS inside the SVG, so these
# are copied rather than rasterised: a PNG would freeze the first frame.
# Referenced by resources/views/loader/app-loader.blade.php.
$animatedPairs = @(
  @{ Source = 'resources/client/brand/keekii-mark-animated-light.svg'; Dest = 'public/icons/keekii-mark-animated-light.svg' },
  @{ Source = 'resources/client/brand/keekii-mark-animated-dark.svg'; Dest = 'public/icons/keekii-mark-animated-dark.svg' }
)

Write-Host ''
foreach ($pair in $animatedPairs) {
  $svgSource = Resolve-RepoPath $pair.Source
  $svgDest = Resolve-RepoPath $pair.Dest
  if (Test-Path -LiteralPath $svgSource) {
    Copy-Item -LiteralPath $svgSource -Destination $svgDest -Force
    Write-Host ('{0,-36} {1,4}     {2,7}' -f (Split-Path -Leaf $pair.Dest), 'vector', '-')
  }
  else {
    Write-Warning "Animated mark source missing, skipped: $svgSource"
  }
}
