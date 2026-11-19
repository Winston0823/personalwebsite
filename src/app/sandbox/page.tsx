import PrototypeWorkbench from "@/components/sandbox/PrototypeWorkbench";
import "../studio.css";
import "./sandbox.css";

export const metadata = {
  title: "Sandbox — Winston Gu",
  description:
    "A playground for working prototypes, style experiments, and private notes.",
};
export default function SandboxPage() {
  return (
    <PrototypeWorkbench
      previewUrl={
        process.env.NEXT_PUBLIC_TTOA_PREVIEW_URL ||
        "https://ttoa-vert.vercel.app"
      }
    />
  );
}
