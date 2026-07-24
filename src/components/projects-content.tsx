"use client";

import { useEffect, useMemo, useState } from "react";

import { ProjectCarousel } from "@/components/project-carousel";
import {
  parseProjects,
  PROJECT_CATEGORIES,
  PROJECTS_CONTENT_KEY,
  type CmsProject,
} from "@/lib/cms/projects";
import type { CmsPagePayload } from "@/lib/cms/types";

type ProjectLike = Omit<CmsProject, "id" | "mediaType" | "category"> & {
  id?: string;
  mediaType?: "image" | "video";
  category?: CmsProject["category"];
};

export function ProjectsContent({
  pagePath,
  sectionTitles,
  fallbackProjects,
  previousLabel,
  nextLabel,
  imageLabel,
}: {
  pagePath: string;
  sectionTitles: string[];
  fallbackProjects: ProjectLike[];
  previousLabel: string;
  nextLabel: string;
  imageLabel: string;
}) {
  const fallback = useMemo(
    () => parseProjects(undefined, fallbackProjects),
    [fallbackProjects],
  );
  const [projects, setProjects] = useState(fallback);

  useEffect(() => {
    let active = true;

    if (!window.location.search.includes("cms-editor=1")) {
      void fetch(`/api/cms/content?path=${encodeURIComponent(pagePath)}`, {
        cache: "no-store",
      })
        .then(async (response) =>
          response.ok ? ((await response.json()) as CmsPagePayload) : null,
        )
        .then((payload) => {
          if (active && payload) {
            setProjects(
              parseProjects(payload.content[PROJECTS_CONTENT_KEY], fallback),
            );
          }
        });
    }

    const receivePreview = (event: MessageEvent) => {
      if (
        event.data?.type === "cms-projects-preview" &&
        Array.isArray(event.data.projects)
      ) {
        setProjects(event.data.projects as CmsProject[]);
      }
    };
    window.addEventListener("message", receivePreview);

    return () => {
      active = false;
      window.removeEventListener("message", receivePreview);
    };
  }, [fallback, pagePath]);

  return (
    <div className="space-y-20 sm:space-y-28" data-cms-ignore>
      {sectionTitles.map((title, index) => (
        <ProjectCarousel
          key={title}
          title={title}
          images={projects.filter(
            (project) => project.category === PROJECT_CATEGORIES[index],
          )}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          imageLabel={imageLabel}
        />
      ))}
    </div>
  );
}
