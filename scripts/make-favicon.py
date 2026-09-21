"""Build the site favicon from the hand-drawn cat mark.

Two problems the source art has as a tab icon, both handled here:

1. It is drawn in the site's own sage ground colour (#A8BFB0), which is
   ~1.9:1 against white. Fine as a 400px drawing, invisible at 16px. The
   strokes are repainted to the palette's darkest green on the paper surface,
   so the icon holds up against light and dark browser chrome alike.

2. The strokes are thin. Downscaling straight to 16px antialiases them into
   pale grey mush, so small sizes get a dilation pass plus an alpha gamma
   boost before the final resize. Bigger sizes need neither.

Two distinct jobs, two different treatments:

  TAB ICONS sit on the browser's own chrome, so they stay transparent and use
  the darkened sage that survives both light and dark tab bars.

  HOME-SCREEN ICONS must be opaque. iOS does not honour alpha in an
  apple-touch-icon — it composites transparent pixels onto BLACK, which would
  turn the home screen tile into a black square. So those get the site's sage
  ground with the darkest green mark (3.86:1), matching the page itself.

Outputs (Next App Router conventions, no layout.tsx wiring needed):
  src/app/favicon.ico        16/32/48 multi-resolution, tuned per size
  src/app/icon.png           512x512 transparent
  src/app/apple-icon.png     180x180 opaque
  public/icons/pwa-192.png   Android / manifest, opaque
  public/icons/pwa-512.png   Android / manifest, opaque
  public/icons/pwa-maskable-512.png  extra safe-zone padding for adaptive
                             shapes, which crop to the inner ~80%
"""
from PIL import Image, ImageFilter

SRC = "public/images/cat-mark.png"
PAPER = (243, 246, 243, 255)   # --color-glass-bg
INK = (58, 91, 78, 255)        # --color-accent-hover

# LITERAL=True keeps the drawing on a transparent ground, no paper backing.
#
# The source ink is the site's sage, rgb(168,191,175). On a transparent icon
# that has to survive BOTH tab themes, the usable range is bounded at each
# end: the raw sage is 1.96:1 on a light tab bar, and darkening it far enough
# to fix that eventually kills it on a dark one. Holding hue and saturation
# and scaling HLS lightness by 0.65 lands on the crossover — 4.07:1 on white,
# 3.96:1 on Chrome's dark strip, i.e. about as good as it gets on both.
LITERAL = True
SAGE = (99, 134, 110, 255)     # #63866E — the source sage, darkened to 0.65 lightness

# Home-screen tile: the site's own ground with the darkest green mark.
GROUND = (168, 191, 176, 255)  # --color-bg
MARK_ON_GROUND = (58, 91, 78, 255)  # --color-accent-hover, 3.86:1 on the ground

src = Image.open(SRC).convert("RGBA")
src = src.crop(src.getbbox())

# Repaint to the ink colour, keeping the original alpha as the stroke mask so
# the hand-drawn antialiasing is preserved rather than re-traced.
_alpha = src.getchannel("A")
src = Image.new("RGBA", src.size, SAGE if LITERAL else INK)
src.putalpha(_alpha)


def build(px: int, margin: float, dilate: int = 0, gamma: float = 1.0,
          ink=None, ground=None) -> Image.Image:
    target_w = int(px * (1 - 2 * margin))
    scale = target_w / src.width

    mark = src
    if ink is not None:
        a = mark.getchannel("A")
        mark = Image.new("RGBA", mark.size, ink)
        mark.putalpha(a)
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

    bg = ground if ground is not None else ((0, 0, 0, 0) if LITERAL else PAPER)
    canvas = Image.new("RGBA", (px, px), bg)
    canvas.alpha_composite(mark, ((px - mark.width) // 2, (px - mark.height) // 2))
    return canvas


# Tab icons — transparent.
build(512, 0.03).save("src/app/icon.png")

# Home-screen icons — opaque, so iOS has nothing to flatten onto black.
import os
os.makedirs("public/icons", exist_ok=True)
build(180, 0.10, ink=MARK_ON_GROUND, ground=GROUND).save("src/app/apple-icon.png")
build(192, 0.10, ink=MARK_ON_GROUND, ground=GROUND).save("public/icons/pwa-192.png")
build(512, 0.10, ink=MARK_ON_GROUND, ground=GROUND).save("public/icons/pwa-512.png")
# Maskable: Android crops adaptive icons to roughly the inner 80%, so the mark
# needs to sit well inside that safe zone or the ears get shaved off.
build(512, 0.22, ink=MARK_ON_GROUND, ground=GROUND).save("public/icons/pwa-maskable-512.png")

# Each .ico member is rendered at its own size with its own stroke weight.
# Values chosen by rendering a sweep and comparing (qa/fav-sweep*.png): a
# single dilation pass holds the strokes together at every small size, while
# two passes close up the eyes and merge the ears into a blob. Only 16px is
# small enough to also want the alpha gamma boost.
ico = [
    build(16, 0.02, dilate=1, gamma=0.85),
    build(32, 0.03, dilate=1),
    build(48, 0.03, dilate=1),
]
ico[2].save("src/app/favicon.ico", format="ICO",
            sizes=[(48, 48), (32, 32), (16, 16)],
            append_images=[ico[0], ico[1]])
print("wrote favicon.ico (16/32/48), icon.png (512), apple-icon.png (180),\n       pwa-192/512 + maskable")
