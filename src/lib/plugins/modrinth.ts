import axios from "axios";

export type ModrinthProject = {
  project_id: string;
  title: string;
  description: string;
  icon_url: string | null;
  downloads: number;
  author: string;
  versions: string[];
  loaders: string[];
  date_modified: string;
};

export async function searchModrinth(query: string, facets: string[][] = []): Promise<ModrinthProject[]> {
  const response = await axios.get<{ hits: ModrinthProject[] }>("https://api.modrinth.com/v2/search", {
    params: {
      query,
      limit: 30,
      facets: JSON.stringify(facets)
    }
  });
  return response.data.hits;
}

export async function getModrinthVersions(projectId: string): Promise<Array<{ id: string; name: string; files: Array<{ url: string; filename: string; primary: boolean }> }>> {
  const response = await axios.get<Array<{ id: string; name: string; files: Array<{ url: string; filename: string; primary: boolean }> }>>(
    `https://api.modrinth.com/v2/project/${projectId}/version`
  );
  return response.data;
}
