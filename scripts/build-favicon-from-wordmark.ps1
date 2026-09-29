<#
.SYNOPSIS
  Builds the favicon and animated loader SVGs from the Keekii wordmark.

.DESCRIPTION
  The favicon and the loader used a simplified geometric "K" that only
  approximated the wordmark's real letterform. This script takes the "k" glyph
  straight out of the rebuilt Bricolage wordmark and reuses it, so the favicon
  is the same drawing as the logo rather than a lookalike.

  Everything downstream is derived from one source, so the artwork cannot drift:

    * the "k" path and its transform are read out of the wordmark SVG;
    * the twin-pulse "i" pair is read out of the same file and shifted left to
      sit beside the "k", which is the arrangement the previous favicon used;
    * the plate, the ink and the pulse are the only things that differ between
      the light and dark outputs, and between the static and animated outputs.

  Emitted:

    keekii-favicon-k-wordmark-{light,dark}.svg  static, for the browser tab
    keekii-mark-animated-{light,dark}.svg        pulsing "i"s, for the loader

  The C2PA-signed sources next to these are left untouched. Rewriting a signed
  file would invalidate its credential, and carrying a manifest onto different
  artwork would make it attest to something it does not describe, so the derived
  files are written unsigned instead.

.PARAMETER Wordmark
  The rebuilt wordmark to read the "k" and the "i" pair from.

.PARAMETER FillFraction
  Fraction of the 1024 canvas the lockup occupies. 0.616 reproduces the padding
  the previous favicon shipped with.
#>
[CmdletBinding()]
param(
  [string]$Wordmark = 'resources/client/brand/keekii-logo-light-text-bricolage.svg',

  # Measured by rendering the "k" alone and scanning its alpha, not guessed.
  # Parsing the path cannot give these: V/H/Q take different argument counts.
  [double]$KLeft = 9.0,
  [double]$KTop = 21.0,
  [double]$KRight = 32.0,
  [double]$KBottom = 53.0,

  # Gap between the "k" and the first "i", in wordmark units.
  [double]$Gap = 4.3,

  [double]$FillFraction = 0.616,

  # Rasteriser for the 1024 PNG sources. Empty means "look in the usual places".
  [string]$Chrome = ''
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
function Out-Path { param([string]$P) Join-Path $repoRoot $P }

if (-not $Chrome) {
  $candidates = @(
    (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),
    (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe')
  )
  $Chrome = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
}
if ($Chrome) { Write-Host "rasteriser: $Chrome" } else { Write-Warning 'no Chrome/Edge found; PNGs will be left alone' }

$raw = Get-Content (Out-Path $Wordmark) -Raw

# --- read the source -------------------------------------------------------
$kXf = [regex]::Match($raw, '<g transform="([^"]+)"').Groups[1].Value
if (-not $kXf) { throw "no glyph transform in $Wordmark" }

$d = [regex]::Match($raw, 'd="([^"]+)"').Groups[1].Value
if (-not $d) { throw "no glyph path in $Wordmark" }
$cut = $d.IndexOf('Z')
if ($cut -lt 0) { throw 'glyph path has no closed subpath' }
# The wordmark is one path holding every glyph as consecutive subpaths; the
# first is the leading "k", the rest are "ee", the second "k" and the "i" pair.
$kPath = $d.Substring(0, $cut + 1)

$inks = [regex]::Match($raw, 'fill="(#[0-9a-fA-F]{6})"').Groups[1].Value
if (-not $inks) { throw "no glyph ink colour in $Wordmark" }

# The "i" pair, as authored. Rects and circles only, so the shift is a plain
# x-offset on both the rect x and the circle cx. Parsed into typed records rather
# than string-patched in place: a `-replace` with a computed replacement is easy
# to get wrong, and these values are the ones the layout maths depends on.
$shapes = [regex]::Matches($raw, '<(rect|circle)\b[^>]*>')
if ($shapes.Count -ne 4) {
  throw "expected the twin-pulse pair (2 rects, 2 circles), found $($shapes.Count)"
}

function Get-Num {
  param([string]$Markup, [string]$Attr)
  $m = [regex]::Match($Markup, ('\s' + $Attr + '="(-?[\d.]+)"'))
  if (-not $m.Success) { throw "shape has no $Attr : $Markup" }
  [double]$m.Groups[1].Value
}

$pair = @()
foreach ($m in $shapes) {
  $markup = $m.Value
  $colour = [regex]::Match($markup, 'fill="(#[0-9a-fA-F]{6})"').Groups[1].Value
  if (-not $colour) { throw "shape has no fill: $markup" }

  if ($m.Groups[1].Value -eq 'rect') {
    $x = Get-Num $markup 'x'
    $y = Get-Num $markup 'y'
    $w = Get-Num $markup 'width'
    $h = Get-Num $markup 'height'
    $pair += [pscustomobject]@{
      Kind = 'stem'; Fill = $colour; X = $x; Y = $y; W = $w; H = $h; Rx = (Get-Num $markup 'rx')
      XMin = $x; XMax = $x + $w; YMin = $y; YMax = $y + $h
    }
  }
  else {
    $cx = Get-Num $markup 'cx'
    $cy = Get-Num $markup 'cy'
    $r = Get-Num $markup 'r'
    $pair += [pscustomobject]@{
      Kind = 'dot'; Fill = $colour; Cx = $cx; Cy = $cy; R = $r
      XMin = $cx - $r; XMax = $cx + $r; YMin = $cy - $r; YMax = $cy + $r
    }
  }
}

# --- arrange: shift the "i" pair beside the "k" ----------------------------
# Anchored on the shapes' own origin (the rect x, the circle cx) rather than
# their left edge: the dot's edge sits further left than the stem's, so using
# XMin would slide the whole pair 1.5 units further right than intended.
$leftMost = ($pair | ForEach-Object { if ($_.Kind -eq 'stem') { $_.X } else { $_.Cx } } |
  Measure-Object -Minimum).Minimum
$shift = ($KRight + $Gap) - $leftMost
Write-Host ("i pair shifted {0:N2} units left to sit beside the k" -f -$shift)

foreach ($p in $pair) {
  if ($p.Kind -eq 'stem') { $p.X = $p.X + $shift; $p.XMin = $p.X; $p.XMax = $p.X + $p.W }
  else { $p.Cx = $p.Cx + $shift; $p.XMin = $p.Cx - $p.R; $p.XMax = $p.Cx + $p.R }
}

# --- geometry: centre the lockup in the canvas -----------------------------
$contentX0 = $KLeft
$contentX1 = ($pair | ForEach-Object { $_.XMax } | Measure-Object -Maximum).Maximum
$contentY0 = [Math]::Min($KTop, ($pair | ForEach-Object { $_.YMin } | Measure-Object -Minimum).Minimum)
$contentY1 = $KBottom

$cw = $contentX1 - $contentX0
$ch = $contentY1 - $contentY0
$scale = ($FillFraction * 1024) / [Math]::Max($cw, $ch)
$tx = 512 - $scale * ($contentX0 + $cw / 2)
$ty = 512 - $scale * ($contentY0 + $ch / 2)

Write-Host ("lockup {0:N2} x {1:N2} units -> scale {2:N3}, translate({3:N2} {4:N2})" -f $cw, $ch, $scale, $tx, $ty)

$lockupXf = 'translate({0:N3} {1:N3}) scale({2:N5})' -f $tx, $ty, $scale

# The leading "i" is the shorter, lower pair member; the trailing one reaches
# higher. Ordering by fill keeps the leading/trailing assignment stable.
$leadFill = ($pair | ForEach-Object { $_.Fill } | Sort-Object -Unique | Select-Object -First 1)
$trailFill = ($pair | ForEach-Object { $_.Fill } | Sort-Object -Unique | Select-Object -Last 1)
Write-Host ("i colours: leading {0}, trailing {1}" -f $leadFill, $trailFill)

# Emitted straight from the parsed records, so geometry and colour in the output
# are the same numbers that drove the layout above.
function Get-Markup {
  param($Shape, [string]$Fill)
  if ($Shape.Kind -eq 'stem') {
    '<rect x="{0}" y="{1}" width="{2}" height="{3}" rx="{4}" fill="{5}" />' -f `
      $Shape.X, $Shape.Y, $Shape.W, $Shape.H, $Shape.Rx, $Fill
  }
  else {
    '<circle cx="{0}" cy="{1}" r="{2}" fill="{3}" />' -f $Shape.Cx, $Shape.Cy, $Shape.R, $Fill
  }
}

$stems = $pair | Where-Object { $_.Kind -eq 'stem' }
$dots = $pair | Where-Object { $_.Kind -eq 'dot' }
$leadStem = $stems | Where-Object { $_.Fill -eq $leadFill } | Select-Object -First 1
$trailStem = $stems | Where-Object { $_.Fill -eq $trailFill } | Select-Object -First 1
$leadDot = $dots | Where-Object { $_.Fill -eq $leadFill } | Select-Object -First 1
$trailDot = $dots | Where-Object { $_.Fill -eq $trailFill } | Select-Object -First 1
foreach ($need in @($leadStem, $trailStem, $leadDot, $trailDot)) {
  if (-not $need) { throw 'could not pair the twin-pulse shapes' }
}

# --- geometry: the pulse -----------------------------------------------------
# The "i"s pulse as a pair. Each stem compresses toward the baseline while its
# dot drops by the same distance, so the gap the drawing put between them is
# preserved at every point in the cycle and neither dot can sink into its stem.
#
# The two stems are different heights, so one shared scaleY would send their tops
# different distances and the pair would drift out of step. Each gets its own
# factor, derived so that both tops descend by exactly $pulseDrop.
$pulseDrop = 6

# The dot must stay above the baseline at the bottom of its travel, otherwise it
# reads as falling out of the letter. The leading "i" is the tighter of the two.
$leadHeadroom = ($leadStem.Y + $leadStem.H) - ($leadDot.Cy + $leadDot.R)
$trailHeadroom = ($trailStem.Y + $trailStem.H) - ($trailDot.Cy + $trailDot.R)
$headroom = [Math]::Min($leadHeadroom, $trailHeadroom)
if ($pulseDrop -gt $headroom) {
  throw ("pulse drop {0} exceeds the {1} units of headroom before the dot crosses the baseline" -f $pulseDrop, $headroom)
}
$leadScale = [Math]::Round(($leadStem.H - $pulseDrop) / $leadStem.H, 5)
$trailScale = [Math]::Round(($trailStem.H - $pulseDrop) / $trailStem.H, 5)
Write-Host ("pulse: drop {0} units, stem scaleY {1} / {2}, headroom {3}" -f $pulseDrop, $leadScale, $trailScale, $headroom)

function New-Plate {
  param([string]$Plate, [string]$PlateStroke)
  if ($PlateStroke) {
    '<rect x="4" y="4" width="1016" height="1016" rx="222" fill="{0}" stroke="{1}" stroke-width="8" />' -f $Plate, $PlateStroke
  }
  else {
    '<rect width="1024" height="1024" rx="225" fill="{0}" />' -f $Plate
  }
}

function Get-K {
  param([string]$Ink)
  '<path fill="{0}" d="{1}" />' -f $Ink, $kPath
}

$kMarkup = '<path fill="__INK__" d="__KPATH__" />'

# --- emitters --------------------------------------------------------------
function New-Favicon {
  param([string]$Plate, [string]$PlateStroke, [string]$Ink, [string]$Title)

  $i = ''
  foreach ($s in @($leadStem, $leadDot, $trailStem, $trailDot)) {
    $i += '      ' + (Get-Markup $s $s.Fill) + "`n"
  }

  @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-labelledby="keekii-favicon-title">
  <title id="keekii-favicon-title">$Title</title>
  <!--
    Favicon built from the Keekii wordmark: the leading "k" is the wordmark's
    own glyph, and the twin-pulse "i" pair is the wordmark's, shifted beside it.
    Derived by scripts/build-favicon-from-wordmark.ps1; edit that, not this.
  -->
  $(New-Plate -Plate $Plate -PlateStroke $PlateStroke)
  <g transform="$lockupXf">
    <g transform="$kXf">
      $(Get-K $Ink)
    </g>
$i  </g>
</svg>
"@
}

$pulseCss = @"
    /* Only the "i" pair moves. The "k" is the identity; the "i"s are the pulse.

       Each stem is pinned to the baseline with transform-box: fill-box, so it
       compresses downward like a bar in an equaliser instead of sliding off the
       baseline, and its dot drops by the same $($pulseDrop) units. Moving both by
       the same distance is what holds the gap between them constant.

       The dots travel in user units, so this reads at whatever size the file is
       rendered: a 1024 favicon and a 30px navbar both get the same proportion. */
    @keyframes keekii-pulse-stem-lead {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY($leadScale); }
    }
    @keyframes keekii-pulse-stem-trail {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY($trailScale); }
    }
    @keyframes keekii-pulse-dot {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY($($pulseDrop)px); }
    }

    .keekii-stem, .keekii-dot { transform-box: fill-box; }
    .keekii-stem { transform-origin: 50% 100%; }
    .keekii-dot { transform-origin: 50% 50%; }

    .keekii-lead-stem { animation: keekii-pulse-stem-lead 1050ms ease-in-out infinite; }
    .keekii-lead-dot { animation: keekii-pulse-dot 1050ms ease-in-out infinite; }
    .keekii-trail-stem { animation: keekii-pulse-stem-trail 1050ms ease-in-out 160ms infinite; }
    .keekii-trail-dot { animation: keekii-pulse-dot 1050ms ease-in-out 160ms infinite; }

    /* A beat travelling left to right across the two "i"s, falling back to the
       static drawing. */
    @media (prefers-reduced-motion: reduce) {
      .keekii-lead-stem, .keekii-lead-dot,
      .keekii-trail-stem, .keekii-trail-dot { animation: none; }
    }
"@

function New-Animated {
  param([string]$Plate, [string]$PlateStroke, [string]$Ink, [string]$Title)

  @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-labelledby="keekii-mark-title">
  <title id="keekii-mark-title">$Title</title>
  <!--
    The wordmark "k" with the twin-pulse "i" pair animated, for the loading
    screen. Geometry is the wordmark's, unchanged, so the static frame of this
    file is the same drawing as the favicon. Motion is the only difference.

    Self-contained (CSS inside the SVG) so it animates from an <img> tag with no
    script, and honours prefers-reduced-motion by falling back to the static frame.

    Derived by scripts/build-favicon-from-wordmark.ps1; edit that, not this.
  -->
  <style>
$pulseCss  </style>
  $(New-Plate -Plate $Plate -PlateStroke $PlateStroke)
  <g transform="$lockupXf">
    <g transform="$kXf">
      $(Get-K $Ink)
    </g>
    <g class="keekii-stem keekii-lead-stem">
      $(Get-Markup $leadStem $leadStem.Fill)
    </g>
    <g class="keekii-dot keekii-lead-dot">
      $(Get-Markup $leadDot $leadDot.Fill)
    </g>
    <g class="keekii-stem keekii-trail-stem">
      $(Get-Markup $trailStem $trailStem.Fill)
    </g>
    <g class="keekii-dot keekii-trail-dot">
      $(Get-Markup $trailDot $trailDot.Fill)
    </g>
  </g>
</svg>
"@
}

$outputs = @(
  @{ Name = 'keekii-favicon-k-wordmark-light.svg'; Body = (New-Favicon -Plate '#fdfdfb' -PlateStroke '#e5e3dd' -Ink '#131311' -Title 'Keekii') }
  @{ Name = 'keekii-favicon-k-wordmark-dark.svg'; Body = (New-Favicon -Plate '#0a0a0a' -PlateStroke '' -Ink '#ffffff' -Title 'Keekii') }
  @{ Name = 'keekii-mark-animated-light.svg'; Body = (New-Animated -Plate '#fdfdfb' -PlateStroke '#e5e3dd' -Ink '#131311' -Title 'Keekii, animated twin pulse, light theme') }
  @{ Name = 'keekii-mark-animated-dark.svg'; Body = (New-Animated -Plate '#0a0a0a' -PlateStroke '' -Ink '#ffffff' -Title 'Keekii, animated twin pulse, dark theme') }
)

$brandDir = Out-Path 'resources/client/brand'
foreach ($o in $outputs) {
  $dest = Join-Path $brandDir $o.Name
  [System.IO.File]::WriteAllText($dest, $o.Body)
  Write-Host ('{0,-42} {1,7} bytes' -f $o.Name, (Get-Item $dest).Length)
}

# --- raster ----------------------------------------------------------------
# scripts/generate-pwa-icons.ps1 builds the whole icon set from 1024 PNG
# sources, so the favicon needs rasterising to feed it. There is no SVG
# rasteriser in the toolchain, so headless Chrome is used: it is the renderer
# that already draws these glyphs correctly, and the output is then only ever
# scaled down, never resampled upward from a smaller crop.
#
# Chrome reports success on stderr, so stderr is discarded rather than trusted
# as an exit status, and the file is checked for existence instead.
function Convert-SvgToPng {
  param([string]$SvgPath, [string]$PngPath, [int]$Size = 1024)

  if (-not $Chrome) {
    Write-Warning "no Chrome found, skipping raster: $PngPath"
    return
  }

  if (Test-Path $PngPath) { Remove-Item $PngPath -Force }
  $uri = 'file:///' + ($SvgPath -replace '\\', '/')

  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & $Chrome --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 `
    --window-size=$Size,$Size --screenshot="$PngPath" $uri 2>&1 | Out-Null
  $ErrorActionPreference = $prev

  # Chrome can exit before the file is fully flushed.
  for ($i = 0; $i -lt 20; $i++) {
    if (Test-Path $PngPath) {
      Start-Sleep -Milliseconds 100
      break
    }
    Start-Sleep -Milliseconds 100
  }

  if (-not (Test-Path $PngPath)) { throw "Chrome produced no raster for $SvgPath" }
  Write-Host ('{0,-42} {1,7} bytes (raster)' -f (Split-Path -Leaf $PngPath), (Get-Item $PngPath).Length)
}

Write-Host ''
Write-Host 'rasterising 1024 sources'
Convert-SvgToPng -SvgPath (Join-Path $brandDir 'keekii-favicon-k-wordmark-light.svg') `
  -PngPath (Join-Path $brandDir 'keekii-favicon-k-wordmark-light-1024.png')
Convert-SvgToPng -SvgPath (Join-Path $brandDir 'keekii-favicon-k-wordmark-dark.svg') `
  -PngPath (Join-Path $brandDir 'keekii-favicon-k-wordmark-dark-1024.png')
