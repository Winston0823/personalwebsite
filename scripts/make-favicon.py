"""Build the site favicon from the hand-drawn cat mark.

Two problems the source art has as a tab icon, both handled here:

1. It is drawn in the site's own sage ground colour (#A8BFB0), which is
   ~1.9:1 against white. Fine as a 400px drawing, invisible at 16px. The
   strokes are repainted to the palette's darkest green on the paper surface,
   so the icon holds up against light and dark browser chrome alike.

2. The strokes are thin. Downscaling straight to 16px antialiases them into
   pale grey mush, so small sizes get a dilation pass plus an alpha gamma
   boost before the final resize. Bigger sizes need neither.

Outputs (Next App Router conventions, no layout.tsx wiring needed):
  src/app/favicon.ico     16/32/48 multi-resolution, tuned per size
  src/app/icon.png        512x512
  src/app/apple-icon.png  180x180
"""
from PIL import Image, ImageFilter

SRC = "public/images/cat-mark.png"
PAPER = (243, 246, 243, 255)   # --color-glass-bg
INK = (58, 91, 78, 255)        # --color-accent-hover

src = Image.open(SRC).convert("RGBA")
src = src.crop(src.getbbox())

# Repaint to the ink colour, keeping the original alpha as the stroke mask so
# the hand-drawn antialiasing is preserved rather than re-traced.
_alpha = src.getchannel("A")
src = Image.new("RGBA", src.size, INK)
src.putalpha(_alpha)


def build(px: int, margin: float, dilate: int = 0, gamma: float = 1.0) -> Image.Image:
    target_w = int(px * (1 - 2 * margin))
    scale = target_w / src.width

    mark = src
    if dilate:
        # Dilate at an intermediate resolution — doing it at full res would
        # need a huge kernel, doing it after the resize would just blur.
        inter = (target_w * 4, max(1, round(src.height * scale * 4)))
        mark = mark.resize(inter, Image.LANCZOS)
        a = mark.getchannel("A")
        for _ in range(dilate):
            a = a.filter(ImageFilter.MaxFilter(3))
        mark.putalpha(a)

    mark = mark.resize((target_w, max(1, round(src.height * scale))), Image.LANCZOS)

    if gamma != 1.0:
        a = mark.getchannel("A")
        lut = [min(255, round(255 * (v / 255) ** gamma)) for v in range(256)]
        mark.putalpha(a.point(lut))

    canvas = Image.new("RGBA", (px, px), PAPER)
    canvas.alpha_composite(mark, ((px - mark.width) // 2, (px - mark.height) // 2))
    return canvas


build(512, 0.08).save("src/app/icon.png")
build(180, 0.10).save("src/app/apple-icon.png")

# Each .ico member is rendered at its own size with its own stroke weight.
# Values chosen by rendering a sweep and comparing (qa/fav-sweep*.png): a
# single dilation pass holds the strokes together at every small size, while
# two passes close up the eyes and merge the ears into a blob. Only 16px is
# small enough to also want the alpha gamma boost.
ico = [
    build(16, 0.05, dilate=1, gamma=0.85),
    build(32, 0.06, dilate=1),
    build(48, 0.06, dilate=1),
]
ico[2].save("src/app/favicon.ico", format="ICO",
            sizes=[(48, 48), (32, 32), (16, 16)],
            append_images=[ico[0], ico[1]])
print("wrote favicon.ico (16/32/48), icon.png (512), apple-icon.png (180)")
