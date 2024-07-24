import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class ClickupService {
  private readonly apiBaseUrl = 'https://api.clickup.com/api/v2';
  private readonly apiToken = process.env.CLICKUP_TOKEN;
  private readonly taskBaseUrl = 'https://app.clickup.com/t/';

  constructor(private readonly httpService: HttpService) {}

  async getTaskMetadata(id: string): Promise<AxiosResponse<any, any>> {
    const endpoint = `${this.apiBaseUrl}/task/${id}`;
    const headers = {
      Authorization: this.apiToken,
      'Content-Type': 'application/json',
    };

    return await lastValueFrom(this.httpService.get(endpoint, { headers }));
  }

  extractTaskIds(description: string): string[] | null {
    const urlPattern = /https:\/\/app\.clickup\.com\/t\/(\w+)/g;
    if (!description) return null;

    const matches = [...description.matchAll(urlPattern)];
    const ids = matches.map((match) => match[1]);

    return ids.length > 0 ? ids : null;
  }

  async getTaskTitle(ids: string[]): Promise<string> {
    try {
      const promises = ids.map((id) => this.getTaskMetadata(id));
      const responses = await Promise.all(promises);

      return responses
        .map((response) => {
          const { name: taskName, id: taskId } = response.data;
          return `[${taskName}](${this.taskBaseUrl}${taskId})\n`;
        })
        .join('');
    } catch (error) {
      console.error(`Error fetching task titles: ${error}`);
      return '';
    }
  }
}
