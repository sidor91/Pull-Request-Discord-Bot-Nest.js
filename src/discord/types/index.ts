export interface User {
  login: string;
  avatar_url: string;
}

export interface Review {
  user: User;
  body: string;
}

export interface PullRequest {
  title: string;
  body: string;
  html_url: string;
  user: User;
  merged?: boolean;
  merged_by?: User;
}

export interface PullRequestPayload {
  action: string;
  pull_request: PullRequest;
  review?: Review;
}
