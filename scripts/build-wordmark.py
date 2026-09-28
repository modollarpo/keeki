import argparse
import os

from fontTools.misc.transform import Transform
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

X_HEIGHT = 525.0
TRACKING = 13.8
SCALE = 23.5 / X_HEIGHT
ANCHOR_X = 9.22
ANCHOR_Y = 53.0
K_LSB = 60.38133457675576
WEIGHT = 700
OPSZ = 32
WORD = ("k", "e", "e", "k")

INK_DARK = "#131311"
INK_LIGHT = "#ffffff"
ACCENT_SHORT = "#e8611f"
ACCENT_TALL = "#f0864a"

I_SHORT_RECT = (115.5, 31.0, 7.0, 22.0, 3.0)
I_SHORT_DOT = (119.0, 23.0, 5.0)
I_TALL_RECT = (128.5, 19.0, 7.0, 34.0, 3.0)
I_TALL_DOT = (132.0, 11.0, 5.0)

PADDING = 1.0
E_OVERSHOOT = 13.7


def compose(font_path):
    font = TTFont(font_path)
    instantiateVariableFont(
        font, {"wght": WEIGHT, "opsz": OPSZ}, inplace=True, updateFontNames=False
    )
    glyph_set = font.getGlyphSet()
    hmtx = font["hmtx"]
    cmap = font.getBestCmap()

    x = 0.0
    letters = []
    for ch in WORD:
        name = cmap[ord(ch)]
        recorder = DecomposingRecordingPen(glyph_set)
        glyph_set[name].draw(recorder)
        pen = SVGPathPen(glyph_set)
        recorder.replay(TransformPen(pen, Transform(1, 0, 0, 1, x, 0)))
        letters.append(pen.getCommands())
        x += hmtx[name][0] + TRACKING
    return "".join(letters)


def build(font_path, ink, out_path):
    letters = compose(font_path)

    transform = "translate({ax} {ay}) scale({s} -{s}) translate({k} 0)".format(
        ax=ANCHOR_X, ay=ANCHOR_Y, s=f"{SCALE:.8f}", k=f"{-K_LSB}"
    )

    ink_left = ANCHOR_X
    ink_right = I_TALL_DOT[0] + I_TALL_DOT[2]
    ink_top = I_TALL_DOT[1] - I_TALL_DOT[2]
    ink_bottom = ANCHOR_Y + E_OVERSHOOT * SCALE

    vb_x = ink_left - PADDING
    vb_y = ink_top - PADDING
    vb_w = (ink_right - ink_left) + 2 * PADDING
    vb_h = (ink_bottom - ink_top) + 2 * PADDING

    sx, sy, sw, sh, sr = I_SHORT_RECT
    scx, scy, scr = I_SHORT_DOT
    tx, ty, tw, th, tr = I_TALL_RECT
    tcx, tcy, tcr = I_TALL_DOT

    lines = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" fill="none">'.format(
            vb=f"{vb_x:.4f} {vb_y:.4f} {vb_w:.4f} {vb_h:.4f}"
        ),
        f'<g transform="{transform}"><path fill="{ink}" d="{letters}"/></g>',
        f'<rect fill="{ACCENT_SHORT}" x="{sx}" y="{sy}" width="{sw}" height="{sh}" rx="{sr}"/>',
        f'<circle fill="{ACCENT_SHORT}" cx="{scx}" cy="{scy}" r="{scr}"/>',
        f'<rect fill="{ACCENT_TALL}" x="{tx}" y="{ty}" width="{tw}" height="{th}" rx="{tr}"/>',
        f'<circle fill="{ACCENT_TALL}" cx="{tcx}" cy="{tcy}" r="{tcr}"/>',
        "</svg>",
    ]

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(lines) + "\n")

    return vb_w / vb_h


def render_png(svg_path, out_path, width):
    import cairosvg

    with open(svg_path, encoding="utf-8") as fh:
        head = fh.read(400)
    vb = head.split('viewBox="')[1].split('"')[0].split()
    aspect = float(vb[2]) / float(vb[3])
    height = max(1, int(round(width / aspect)))
    cairosvg.svg2png(url=svg_path, write_to=out_path, output_width=width, output_height=height)
    return width, height


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--font", required=True)
    ap.add_argument("--out-dark", required=True)
    ap.add_argument("--out-light", required=True)
    ap.add_argument("--png-dark")
    ap.add_argument("--png-light")
    ap.add_argument("--png-width", type=int, default=900)
    args = ap.parse_args()

    a = build(args.font, INK_DARK, args.out_dark)
    b = build(args.font, INK_LIGHT, args.out_light)
    print("dark  aspect %.4f" % a)
    print("light aspect %.4f" % b)
    print("original supplied aspect %.4f" % (127.3 / 49.0))
    print("superseded 900x382 raster aspect %.4f" % (900 / 382))

    if args.png_dark and args.png_light:
        w, h = render_png(args.out_dark, args.png_dark, args.png_width)
        print("dark  png %dx%d" % (w, h))
        w, h = render_png(args.out_light, args.png_light, args.png_width)
        print("light png %dx%d" % (w, h))


if __name__ == "__main__":
    main()
