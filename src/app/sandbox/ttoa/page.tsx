import PrototypeWorkbench from "@/components/sandbox/PrototypeWorkbench";
import "../../studio.css";
import "../sandbox.css";
export const metadata = {
  title: "Fisherman’s Nose Playground — Winston Gu",
  description:
    "Play Fisherman’s Nose in a device preview and explore live style loadouts.",
};
export default function TtoaPlayground() {
  return (
    <PrototypeWorkbench
      previewUrl={
        process.env.NEXT_PUBLIC_TTOA_PREVIEW_URL ||
        "https://ttoa-vert.vercel.app"
      }
    />
  );
}
