export class DateRange {
  public fromDate: string;
  public toDate: string;
  public enable: boolean;

  deserialize(data: Object): DateRange {
    if (data['From'] !== undefined) {
      this.fromDate = data['From'];
    }
    if (data['To'] !== undefined) {
      this.toDate = data['To'];
    }
    if (data['Enable'] !== undefined) {
      this.enable = data['Enable'];
    }

    return this;
  }
}
