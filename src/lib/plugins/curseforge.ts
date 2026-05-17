import axios from "axios";

export type CurseForgeMod = {
  id: number;
  name: string;
  summary: string;
  downloadCount: number;
  dateModified: string;
  authors: Array<{ name: string }>;
  logo?: { thumbnailUrl: string };
};

export async function searchCurseForge(query: string): Promise<CurseForgeMod[]> {
  const apiKey = process.env.CURSEFORGE_API_KEY;
  if (!apiKey) {
    return [];
  }
  const response = await axios.get<{ data: CurseForgeMod[] }>("https://api.curseforge.com/v1/mods/search", {
    headers: { "x-api-key": apiKey },
    params: {
      gameId: 432,
      searchFilter: query,
      pageSize: 30,
      sortField: 6,
      sortOrder: "desc"
    }
  });
  return response.data.data;
}
