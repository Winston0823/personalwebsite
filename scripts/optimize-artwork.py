"""Generate two web derivatives per artwork:
   <name>.webp     long edge 1600, q82  -> lightbox / retina srcset
   <name>-sm.webp  long edge  760, q78  -> grid tile default
Originals are left untouched on disk."""
import os, glob
from PIL import Image

SRC = "public/images/artworks"
rows = []
for f in sorted(glob.glob(f"{SRC}/*.jpg") + glob.glob(f"{SRC}/*.png")):
    base = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")
    orig_kb = os.path.getsize(f) // 1024

    out = []
    for suffix, long_edge, q in (("", 1600, 82), ("-sm", 760, 78)):
        w, h = im.size
        scale = min(1.0, long_edge / max(w, h))
        size = (max(1, round(w * scale)), max(1, round(h * scale)))
        resized = im if scale == 1.0 else im.resize(size, Image.LANCZOS)
        path = f"{SRC}/{base}{suffix}.webp"
        resized.save(path, "WEBP", quality=q, method=6)
        out.append((os.path.getsize(path) // 1024, size))
    rows.append((base, orig_kb, out[0], out[1]))

tot_o = sum(r[1] for r in rows)
tot_f = sum(r[2][0] for r in rows)
tot_s = sum(r[3][0] for r in rows)
print(f"{'artwork':30s} {'orig':>7s} {'full.webp':>16s} {'sm.webp':>16s}")
for base, o, full, sm in rows:
    print(f"{base:30s} {o:5d}KB  {full[0]:5d}KB {full[1][0]}x{full[1][1]:<5d} {sm[0]:5d}KB {sm[1][0]}x{sm[1][1]}")
print(f"\n{'TOTAL':30s} {tot_o:5d}KB  {tot_f:5d}KB(full)  {tot_s:5d}KB(sm)")
print(f"grid payload: {tot_o}KB -> {tot_s}KB  ({100 - tot_s*100//tot_o}% smaller)")
