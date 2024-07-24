export enum Action {
  CREATED = 'opened',
  EDITED = 'edited',
  REVIEWED = 'submitted',
  MERGED = 'closed',
}

export enum Colors {
  CREATED = 0x0000ff,
  REVIEWED = 0xffa500,
  MERGED = 0x00ff00,
  CLOSED = 0xff0000,
}

export const StatusColor = {
  [Action.CREATED]: Colors.CREATED,
  [Action.REVIEWED]: Colors.REVIEWED,
  [Action.MERGED]: Colors.MERGED,
  [Action.EDITED]: Colors.CREATED,
};
