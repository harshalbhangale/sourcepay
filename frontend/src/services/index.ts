import { apiClient } from "./api";
import type { Project, PaginatedResponse } from "@/types";

export const projectService = {
  async getAllProjects(page: number = 1, limit: number = 10) {
    return apiClient.get<PaginatedResponse<Project>>(
      `/projects?page=${page}&limit=${limit}`
    );
  },

  async getProject(id: string) {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  async createProject(data: {
    name: string;
    description: string;
    repoUrl?: string;
    totalBounty: string;
  }) {
    return apiClient.post<Project>("/projects", data);
  },

  async updateProject(id: string, data: Partial<Project>) {
    return apiClient.put<Project>(`/projects/${id}`, data);
  },

  async getProjectsByOwner(ownerId: string) {
    return apiClient.get<Project[]>(`/projects/owner/${ownerId}`);
  },
};

export const taskService = {
  async getAllTasks(page: number = 1, limit: number = 10) {
    return apiClient.get(`/tasks?page=${page}&limit=${limit}`);
  },

  async getTask(id: string) {
    return apiClient.get(`/tasks/${id}`);
  },

  async createTask(data: any) {
    return apiClient.post("/tasks", data);
  },

  async assignTask(id: string, assigneeId: string) {
    return apiClient.put(`/tasks/${id}/assign`, { assigneeId });
  },

  async getTasksByProject(projectId: string) {
    return apiClient.get(`/tasks/project/${projectId}`);
  },
};

export const contributionService = {
  async getAllContributions(page: number = 1, limit: number = 10) {
    return apiClient.get(`/contributions?page=${page}&limit=${limit}`);
  },

  async getContribution(id: string) {
    return apiClient.get(`/contributions/${id}`);
  },

  async submitContribution(data: { taskId: string; prUrl: string }) {
    return apiClient.post("/contributions", data);
  },

  async scoreContribution(id: string, score: number, feedback?: string) {
    return apiClient.put(`/contributions/${id}/score`, { score, feedback });
  },
};

export const authService = {
  async login(walletAddress: string, signature: string) {
    return apiClient.post("/auth/login", { walletAddress, signature });
  },

  async verify() {
    return apiClient.post("/auth/verify");
  },

  logout() {
    apiClient.clearToken();
  },
};
