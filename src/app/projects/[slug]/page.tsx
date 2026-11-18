import { notFound } from "next/navigation";
import { projects } from "@/lib/detail-content";
import { projectSlug } from "@/lib/project-paths";
import ProjectPage from "@/components/studio/ProjectPage";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return projects.map((project) => ({ slug: projectSlug(project) }));
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((item) => projectSlug(item) === slug);
  return project
    ? {
        title: `${project.title} — Winston Gu`,
        description: project.description,
      }
    : {};
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((item) => projectSlug(item) === slug);
  if (!project) notFound();
  return <ProjectPage projectId={project.id} />;
}
