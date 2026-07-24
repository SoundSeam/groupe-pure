import type { CmsValue } from "./types";

export const PROJECTS_CONTENT_KEY = "collection:projects";
export const PROJECT_CATEGORIES = [
  "architecture",
  "construction",
  "excavation",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export type CmsProject = {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  mediaType: "image" | "video";
  category: ProjectCategory;
  type: string;
  location: string;
  summary: string;
};

type ProjectLike = Omit<CmsProject, "id" | "mediaType" | "category"> & {
  id?: string;
  mediaType?: "image" | "video";
  category?: ProjectCategory;
};

export function normalizeProjects(projects: ProjectLike[]): CmsProject[] {
  return projects.map((project, index) => ({
    ...project,
    id: project.id || `project-${index + 1}`,
    mediaType: project.mediaType === "video" ? "video" : "image",
    category: PROJECT_CATEGORIES.includes(
      project.category as ProjectCategory,
    )
      ? (project.category as ProjectCategory)
      : PROJECT_CATEGORIES[
          Math.min(
            PROJECT_CATEGORIES.length - 1,
            Math.floor((index * PROJECT_CATEGORIES.length) / projects.length),
          )
        ],
  }));
}

export function parseProjects(
  value: CmsValue | undefined,
  fallback: ProjectLike[] = [],
) {
  if (value?.type !== "collection") return normalizeProjects(fallback);

  try {
    const parsed = JSON.parse(value.value) as unknown;
    if (!Array.isArray(parsed)) return normalizeProjects(fallback);

    const projects = parsed.filter(
      (entry): entry is ProjectLike =>
        Boolean(entry) &&
        typeof entry === "object" &&
        typeof (entry as ProjectLike).title === "string" &&
        typeof (entry as ProjectLike).image === "string",
    );

    return normalizeProjects(projects);
  } catch {
    return normalizeProjects(fallback);
  }
}

export function projectCollectionValue(projects: CmsProject[]): CmsValue {
  return {
    type: "collection",
    value: JSON.stringify(projects),
  };
}
