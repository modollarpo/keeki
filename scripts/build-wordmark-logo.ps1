<#
.SYNOPSIS
  Publishes the Keekii wordmark logo to public/images, with the twin-pulse
  "i" pair animated.

.DESCRIPTION
  The logo is a single vector, so the "i"s can pulse without any raster or
  scripting. The wordmark's two "i" shapes are lifted out of the source SVG,
  wrapped in groups, and given CSS keyframes, leaving the "keek" letterforms
  byte-identical to the source. The only difference between the static and
  animated files is the four wrapper groups and the style block.

  The pulse is the same one scripts/build-favicon-from-wordmark.ps1 gives the
  favicon and the loader, so the mark and the wordmark move alike. Each stem is
  pinned to the baseline with transform-box: fill-box, so it compresses downward
  like a bar in an equaliser instead of sliding off the baseline, and each dot
  drops by the same distance, which holds the gap the drawing put between them.

  Emitted:

    public/images/logo-{light,dark}.svg           animated, used everywhere
    public/images/logo-{light,dark}-static.svg    static, for email

  The static copies are what email clients get. They flatten animated SVG to a
  single frame or drop it entirely, so the mail layout points at these instead:
  a logo that silently fails to render in a transactional email is worse than
  one that does not move.

  The pristine wordmarks in resources/client/brand are the source and are left
  untouched.

.PARAMETER Drop
  How far, in wordmark user units, each "i" top descends and each dot falls at
  the bottom of the cycle. Derived per-"i" so both stems move the same distance
  even though they are different heights, and checked against the headroom
  between each dot and the baseline so a dot can never sink into its own stem.
#>
[CmdletBinding()]
param(
  [string]$Light = 'resources/client/brand/keekii-logo-light-text-bricolage.svg',
  [string]$Dark = 'resources/client/brand/keekii-logo-dark-text-bricolage.svg',
  [string]$OutDir = 'public/images',
  [double]$Drop = 6
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Out-Path {
  param([string]$P)
  $full = Join-Path $repoRoot $P
  if (-not (Test-Path -LiteralPath $full)) { New-Item -ItemType Directory -Path $full -Force | Out-Null }
  $full
}

# The "i"s are matched on being standalone rect/circle elements carrying one of
# the two brand oranges. The letterforms are one big path filled with the ink
# colour, so they can never be mistaken for a pulse shape.
$rectPattern = '<rect\s+fill="(?<fill>#[0-9a-fA-F]{6})"\s+x="(?<x>[-\d.]+)"\s+y="(?<y>[-\d.]+)"\s+width="(?<w>[-\d.]+)"\s+height="(?<h>[-\d.]+)"\s+rx="(?<rx>[-\d.]+)"\s*/>'
$circlePattern = '<circle\s+fill="(?<fill>#[0-9a-fA-F]{6})"\s+cx="(?<cx>[-\d.]+)"\s+cy="(?<cy>[-\d.]+)"\s+r="(?<r>[-\d.]+)"\s*/>'

function Find-Shape {
  param($Set, [string]$Fill, [string]$Label)
  $m = $Set | Where-Object { $_.Groups['fill'].Value -eq $Fill } | Select-Object -First 1
  if (-not $m) { throw ("{0}: no shape for fill {1}" -f $Label, $Fill) }
  $m
}

function ConvertTo-Stem {
  param($m)
  [pscustomobject]@{
    Kind = 'stem'; Fill = $m.Groups['fill'].Value; Raw = $m.Value
    X = [double]$m.Groups['x'].Value; Y = [double]$m.Groups['y'].Value
    W = [double]$m.Groups['w'].Value; H = [double]$m.Groups['h'].Value
  }
}

function ConvertTo-Dot {
  param($m)
  [pscustomobject]@{
    Kind = 'dot'; Fill = $m.Groups['fill'].Value; Raw = $m.Value
    Cx = [double]$m.Groups['cx'].Value; Cy = [double]$m.Groups['cy'].Value; R = [double]$m.Groups['r'].Value
  }
}

function Get-IShapes {
  param([string]$Text, [string]$Label)

  $rects = [regex]::Matches($Text, $rectPattern)
  $circles = [regex]::Matches($Text, $circlePattern)
  if ($rects.Count -ne 2 -or $circles.Count -ne 2) {
    throw ("{0}: expected 2 stem rects and 2 dots, found {1} and {2}" -f $Label, $rects.Count, $circles.Count)
  }

  # Ordering by fill keeps the leading/trailing assignment stable, and the
  # leading "i" is the shorter of the pair.
  $fills = @($rects | ForEach-Object { $_.Groups['fill'].Value } | Sort-Object -Unique)
  if ($fills.Count -ne 2) { throw ("{0}: the two stems share one fill" -f $Label) }
  $leadFill = $fills[0]
  $trailFill = $fills[1]

  [pscustomobject]@{
    LeadStem = (ConvertTo-Stem (Find-Shape $rects $leadFill $Label))
    TrailStem = (ConvertTo-Stem (Find-Shape $rects $trailFill $Label))
    LeadDot = (ConvertTo-Dot (Find-Shape $circles $leadFill $Label))
    TrailDot = (ConvertTo-Dot (Find-Shape $circles $trailFill $Label))
    LeadFill = $leadFill
    TrailFill = $trailFill
  }
}

function New-PulseCss {
  param([double]$LeadScale, [double]$TrailScale, [double]$PulseDrop)

  @"
  /* The "i"s pulse; the "keek" letterforms never move.

     Each stem is pinned to the baseline with transform-box: fill-box, so it
     compresses downward like a bar in an equaliser rather than sliding off the
     baseline, and its dot drops by the same $($PulseDrop) units. Moving both by
     the same distance is what holds the gap between them constant.

     Distances are wordmark user units, so the motion scales with the artwork and
     reads the same at a 30px navbar and a 200px hero. */
  @keyframes keekii-pulse-stem-lead {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY($LeadScale); }
  }
  @keyframes keekii-pulse-stem-trail {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY($TrailScale); }
  }
  @keyframes keekii-pulse-dot {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY($($PulseDrop)px); }
  }

  .keekii-stem, .keekii-dot { transform-box: fill-box; }
  .keekii-stem { transform-origin: 50% 100%; }
  .keekii-dot { transform-origin: 50% 50%; }

  .keekii-lead-stem { animation: keekii-pulse-stem-lead 1400ms ease-in-out infinite; }
  .keekii-lead-dot { animation: keekii-pulse-dot 1400ms ease-in-out infinite; }
  .keekii-trail-stem { animation: keekii-pulse-stem-trail 1400ms ease-in-out 220ms infinite; }
  .keekii-trail-dot { animation: keekii-pulse-dot 1400ms ease-in-out 220ms infinite; }

  /* A beat travelling left to right across the two "i"s. Anyone who has asked
     their OS to reduce motion gets the static drawing instead, which is why the
     static file is a faithful copy of this file with the animation removed. */
  @media (prefers-reduced-motion: reduce) {
    .keekii-lead-stem, .keekii-lead-dot,
    .keekii-trail-stem, .keekii-trail-dot { animation: none; }
  }
"@
}

function New-AnimatedWordmark {
  param([string]$Text, $I, [double]$PulseDrop, [double]$LeadScale, [double]$TrailScale, [string]$Label)

  # Everything up to the first "i" rect is the svg element and the letterforms;
  # the four shapes are re-emitted inside animated groups in their original
  # order, so the drawing is unchanged.
  $firstRect = [regex]::Match($Text, $rectPattern)
  if (-not $firstRect.Success) { throw "$Label : no pulse shapes found" }
  $prefix = $Text.Substring(0, $firstRect.Index)
  $tail = $Text.Substring($Text.LastIndexOf('</svg>'))

  $openEnd = $prefix.IndexOf('>')
  if ($openEnd -lt 0) { throw "$Label : malformed svg element" }

  $head = $prefix.Substring(0, $openEnd + 1)
  $letters = $prefix.Substring($openEnd + 1)

  $css = New-PulseCss -LeadScale $LeadScale -TrailScale $TrailScale -PulseDrop $PulseDrop

  @"
$head
  <!--
    The wordmark with its twin-pulse "i" pair animated. The "keek" letterforms
    and the "i" geometry are the source's own; only the four wrapper groups and
    the style below are added, so the static frame of this file is the same
    drawing as the static logo.

    Self-contained, so it animates from an <img> or <picture> with no script.
    Generated by scripts/build-wordmark-logo.ps1; edit that, not this.
  -->
  <style>
$css  </style>
$letters
  <g class="keekii-stem keekii-lead-stem">
    $($I.LeadStem.Raw)
  </g>
  <g class="keekii-dot keekii-lead-dot">
    $($I.LeadDot.Raw)
  </g>
  <g class="keekii-stem keekii-trail-stem">
    $($I.TrailStem.Raw)
  </g>
  <g class="keekii-dot keekii-trail-dot">
    $($I.TrailDot.Raw)
  </g>
$tail
"@
}

$outDirFull = Out-Path $OutDir

foreach ($theme in @('light', 'dark')) {
  $srcRel = if ($theme -eq 'light') { $Light } else { $Dark }
  $src = Join-Path $repoRoot $srcRel
  if (-not (Test-Path -LiteralPath $src)) { throw "wordmark source not found: $src" }
  $text = [System.IO.File]::ReadAllText($src)

  $i = Get-IShapes -Text $text -Label $theme

  # The dot must stay above the baseline at the bottom of its travel, otherwise
  # it reads as falling out of the letter. The leading "i" is the tighter one.
  $leadHeadroom = ($i.LeadStem.Y + $i.LeadStem.H) - ($i.LeadDot.Cy + $i.LeadDot.R)
  $trailHeadroom = ($i.TrailStem.Y + $i.TrailStem.H) - ($i.TrailDot.Cy + $i.TrailDot.R)
  $headroom = [Math]::Min($leadHeadroom, $trailHeadroom)
  if ($Drop -gt $headroom) {
    throw ("{0}: drop {1} exceeds the {2} units of headroom before the dot crosses the baseline" -f $theme, $Drop, $headroom)
  }

  # The stems are different heights, so one shared scaleY would send their tops
  # different distances and the pair would drift out of step.
  $leadScale = [Math]::Round(($i.LeadStem.H - $Drop) / $i.LeadStem.H, 5)
  $trailScale = [Math]::Round(($i.TrailStem.H - $Drop) / $i.TrailStem.H, 5)

  Write-Host ("{0}: drop {1} units, stem scaleY {2} / {3}, headroom {4}, i fills {5} / {6}" -f `
      $theme, $Drop, $leadScale, $trailScale, $headroom, $i.LeadFill, $i.TrailFill)

  $animated = New-AnimatedWordmark -Text $text -I $i -PulseDrop $Drop `
    -LeadScale $leadScale -TrailScale $trailScale -Label $theme

  $static = ($text.Trim() -replace "`r`n", "`n") + "`n"

  foreach ($pair in @(
      @{ Name = "logo-$theme.svg"; Body = $animated }
      @{ Name = "logo-$theme-static.svg"; Body = $static }
    )) {
    $dest = Join-Path $outDirFull $pair.Name
    [System.IO.File]::WriteAllText($dest, $pair.Body, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host ('  {0,-34} {1,6} bytes' -f $pair.Name, (Get-Item $dest).Length)
  }
}

Write-Host ''
Write-Host "wordmark logos written to $OutDir"
