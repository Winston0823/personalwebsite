import Link from "next/link";
import DesktopChrome from "@/components/background/DesktopChrome";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DesktopChrome />
      <Link href="/" className="playground-home">
        ← Back to the studio
      </Link>
      {children}
    </>
  );
}
