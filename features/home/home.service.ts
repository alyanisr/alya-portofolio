import { db } from "@/lib/db";
import { getFeaturedProjects } from "@/features/projects/project.service";
import { getPublishedAchievements, getPublishedExperiences, getPublishedLearning, getPublishedSkillCategories } from "@/features/content/public.service";

export async function getHomepage() {
  const [config, person, projects, experiences, achievements, skillCategories, learning] = await Promise.all([
    db.homepageConfig.findFirst(),
    db.person.findFirst(),
    getFeaturedProjects(),
    getPublishedExperiences(),
    getPublishedAchievements(),
    getPublishedSkillCategories(),
    getPublishedLearning(),
  ]);
  return {
    config,
    person,
    projects: orderByConfiguredIds(projects, config?.featuredProjectIds).slice(0, 5),
    experiences: orderByConfiguredIds(experiences, config?.featuredExperienceIds).slice(0, 2),
    achievements: orderByConfiguredIds(achievements, config?.featuredAchievementIds).slice(0, 4),
    skillCategories,
    learning: orderByConfiguredIds(learning, config?.featuredLearningIds).slice(0, 4),
  };
}

function orderByConfiguredIds<T extends { id: string }>(items: T[], ids?: string[]) {
  if (!ids?.length) return items;
  const positions = new Map(ids.map((id, index) => [id, index]));
  return [...items].sort((a, b) => (positions.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (positions.get(b.id) ?? Number.MAX_SAFE_INTEGER));
}
