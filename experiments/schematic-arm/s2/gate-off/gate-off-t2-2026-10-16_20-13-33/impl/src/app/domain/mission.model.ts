/** A mission against a threat. Heroes are deployed onto missions. */
export interface Mission {
  readonly id: string;
  readonly title: string;
  readonly threatId: string;
}

/** One hero deployed onto one mission. Recorded when a deployment succeeds. */
export interface Deployment {
  readonly id: string;
  readonly missionId: string;
  readonly heroId: string;
}
