"use client";

import { useRouter } from "next/navigation";
import ProjectsDetail from "@/components/detail/details/ProjectsDetail";
import "./project-page.css";

export default function ProjectPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  return (
    <main className="detail-scroll project-page" id="main">
      <ProjectsDetail
        initialProjectId={projectId}
        onNavigateBack={() => router.push("/#work")}
      />
    </main>
  );
}
