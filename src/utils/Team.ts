import { ProjectMemberModel, ProjectModel } from "../models/project";
import { TaskModel } from "../models/task";
import ProjectService from "../services/ProjectService";
import TaskService from "../services/TaskService";
import { mapApiProject, mapApiProjectMember, mapApiTask } from "./Mappers";

/**
 * There is no employee "my team" endpoint, so the roster is composed from the
 * member lists of every project you belong to, deduplicated by person.
 */
export const fetchTeamRoster = async (
  excludeUserId?: string,
): Promise<ProjectMemberModel[]> => {
  const response = await ProjectService.projectList();
  const projects = (response?.data?.projects ?? []).map(mapApiProject);

  const lists = await Promise.all(
    projects.map((project: ProjectModel) =>
      ProjectService.getProjectMembers(project.id).catch(() => null),
    ),
  );

  const byId = new Map<string, ProjectMemberModel>();

  lists.forEach((memberResponse) => {
    (memberResponse?.data?.members ?? [])
      .map(mapApiProjectMember)
      .forEach((member: ProjectMemberModel) => {
        if (member.id !== excludeUserId) {
          byId.set(member.id, member);
        }
      });
  });

  return Array.from(byId.values());
};

/** Every task on your projects that isn't assigned to you. */
export const fetchTeamTasks = async (): Promise<TaskModel[]> => {
  const response = await TaskService.teamTasks({ limit: 200 });
  return (response?.data?.tasks ?? []).map(mapApiTask);
};
