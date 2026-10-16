/** A live mission: one hero sent into the field. The codename and objective are example text. */
export interface Mission {
  readonly id: string;
  readonly codename: string;
  readonly heroId: string;
  readonly district: string;
  readonly objective: string;
}
