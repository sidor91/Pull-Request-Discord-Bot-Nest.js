import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Action, Colors, StatusColor } from 'src/@constants';
import { Message } from './entity/message.entity';
import { Repository } from 'typeorm';
import { PullRequestPayload } from './types';
import { ClickupService } from 'src/clickup/clickup.service';

@Injectable()
export class DiscordService {
  private readonly wh_base_url = 'https://discord.com/api/webhooks/';
  private readonly param_for_response = '?wait=true';

  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly httpService: HttpService,
    private readonly clickupService: ClickupService,
  ) {}

  async findOne(payload = {}): Promise<Message> {
    return this.messagesRepository.findOne(payload);
  }

  async create(message: Omit<Message, 'id'>): Promise<Message> {
    return this.messagesRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    await this.messagesRepository.delete(id);
  }

  async getCommonMessage(payload: PullRequestPayload) {
    const { title, body, html_url, user } = payload.pull_request;
    const { login, avatar_url } = user;
    let description: string = 'No clickup links found in the task description';
    const taskIds = this.clickupService.extractTaskIds(body);

    if (taskIds) {
      const taskTitle = await this.clickupService.getTaskTitle(taskIds);
      description = taskTitle ? taskTitle : description;
    }

    return {
      title: title.trim() || 'Pull request',
      description,
      url: html_url,
      author: {
        name: login,
        icon_url: avatar_url,
      },
    };
  }

  async getMessageParamAndMethod(payload: PullRequestPayload) {
    const { html_url } = payload.pull_request;

    const isMergedOrClosed = payload.pull_request.hasOwnProperty('merged');

    const existingMessage = await this.findOne({
      where: { pull_req_url: html_url },
    });

    let messageParam: string;
    let method: 'post' | 'patch';

    if (existingMessage) {
      messageParam = `/messages/${existingMessage.message_id}`;
      method = 'patch';
    } else {
      messageParam = isMergedOrClosed ? '' : this.param_for_response;
      method = 'post';
    }

    return {
      existingMessage,
      messageParam,
      method,
    };
  }

  async sendDiscordMessage(payload: PullRequestPayload, webhook_id: string) {
    try {
      const { action, pull_request } = payload;
      switch (action) {
        case Action.CREATED:
          await this.handleCreated(payload, webhook_id);
          break;
        case Action.EDITED:
          await this.handleEdited(payload, webhook_id);
          break;
        case Action.REVIEWED:
          await this.handleReviewed(payload, webhook_id);
          break;
        case Action.MERGED:
          if (pull_request.merged) {
            await this.handleMerged(payload, webhook_id);
          } else {
            await this.handleClosed(payload, webhook_id);
          }
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async handleCreated(payload: PullRequestPayload, webhook_id: string) {
    const { html_url } = payload.pull_request;

    try {
      const commonMessage = await this.getCommonMessage(payload);

      const response = await lastValueFrom(
        this.httpService.post(
          `${this.wh_base_url}${webhook_id}${this.param_for_response}`,
          {
            embeds: [
              {
                ...commonMessage,
                color: Colors.CREATED,
              },
            ],
          },
        ),
      );

      if (response.data.id) {
        await this.create({
          pull_req_url: html_url,
          message_id: response.data.id,
          status: Action.CREATED,
        });
      }
    } catch (error) {
      console.error(`Error in handleCreated, ${error}`);
    }
  }

  async handleReviewed(payload: PullRequestPayload, webhook_id: string) {
    const { pull_request, review } = payload;
    const { html_url } = pull_request;
    const { login } = review.user;
    const { body } = review;

    try {
      const commonMessage = await this.getCommonMessage(payload);
      const { existingMessage, messageParam, method } =
        await this.getMessageParamAndMethod(payload);

      const response = await lastValueFrom(
        this.httpService[method](
          `${this.wh_base_url}${webhook_id}${messageParam}`,
          {
            embeds: [
              {
                ...commonMessage,
                color: Colors.REVIEWED,
                fields: [
                  {
                    name: login,
                    value: body || 'returned',
                  },
                ],
              },
            ],
          },
        ),
      );

      if (!existingMessage && response.data?.id) {
        await this.create({
          pull_req_url: html_url,
          message_id: response.data.id,
          status: Action.REVIEWED,
        });
      }
    } catch (error) {
      console.error(`Error in handleReviewed, ${error}`);
    }
  }

  async handleMerged(payload: PullRequestPayload, webhook_id: string) {
    const { merged_by } = payload.pull_request;

    try {
      const commonMessage = await this.getCommonMessage(payload);
      const { existingMessage, messageParam, method } =
        await this.getMessageParamAndMethod(payload);

      const URL = `${this.wh_base_url}${webhook_id}${messageParam}`;

      await lastValueFrom(
        this.httpService[method](URL, {
          embeds: [
            {
              ...commonMessage,
              color: Colors.MERGED,
              fields: [
                {
                  name: 'Merged by',
                  value: merged_by.login,
                },
              ],
            },
          ],
        }),
      );

      if (existingMessage) {
        await this.remove(existingMessage.id);
      }
    } catch (error) {
      console.error(`Error in handleMerged, ${error}`);
    }
  }

  async handleClosed(payload: PullRequestPayload, webhook_id: string) {
    try {
      const commonMessage = await this.getCommonMessage(payload);
      const { existingMessage, messageParam, method } =
        await this.getMessageParamAndMethod(payload);

      const URL = `${this.wh_base_url}${webhook_id}${messageParam}`;

      await lastValueFrom(
        this.httpService[method](URL, {
          embeds: [
            {
              ...commonMessage,
              color: Colors.CLOSED,
              fields: [
                {
                  name: 'Pull request was closed',
                  value: '',
                },
              ],
            },
          ],
        }),
      );

      if (existingMessage) {
        await this.remove(existingMessage.id);
      }
    } catch (error) {
      console.error(`Error in handleClosed, ${error}`);
    }
  }

  async handleEdited(payload: PullRequestPayload, webhook_id: string) {
    const { html_url } = payload.pull_request;

    try {
      const commonMessage = await this.getCommonMessage(payload);
      const { existingMessage, messageParam, method } =
        await this.getMessageParamAndMethod(payload);

      const URL = `${this.wh_base_url}${webhook_id}${messageParam}`;

      const response = await lastValueFrom(
        this.httpService[method](URL, {
          embeds: [
            {
              ...commonMessage,
              color: existingMessage
                ? StatusColor[existingMessage.status]
                : Colors.CREATED,
            },
          ],
        }),
      );

      if (!existingMessage && response.data?.id) {
        await this.create({
          pull_req_url: html_url,
          message_id: response.data.id,
          status: Action.CREATED,
        });
      }
    } catch (error) {
      console.error(`Error in handleEdited, ${error}`);
    }
  }
}
