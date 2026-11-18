import type { Project } from "./detail-types";
const slugs: Record<string, string> = {
  "project-usc-racing": "usc-formula-electric",
  "project-5": "assassins-weakness-is-love",
  "project-6": "the-sublime",
  "project-7": "the-unrealtor",
  "project-1": "dreaming",
  "project-ambit": "ambit",
};
export function projectSlug(project: Pick<Project, "id">) {
  return slugs[project.id] ?? project.id;
}
export function projectPath(project: Pick<Project, "id">) {
  return `/projects/${projectSlug(project)}`;
}
