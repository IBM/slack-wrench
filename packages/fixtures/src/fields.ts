class Fields {
  public token!: string;

  public response_url!: string;

  public api_app_id!: string;

  public trigger_id!: string;

  public callback_id!: string;

  public user!: { name: string; id: string };

  public channel!: { name: string; id: string };

  public team!: {
    domain: string;
    id: string;
  };

  public ts!: string;

  public event_time!: number;

  public event_id!: string;

  public authed_users!: string[];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.token = 'TOKEN';
    this.response_url = 'https://fake.slack/response_url';
    this.trigger_id = 'TRIGGER_ID';
    this.api_app_id = 'API_APP_ID';
    this.callback_id = 'CALLBACK_ID';
    this.user = {
      id: 'UUSERID',
      name: 'USER',
    };
    this.channel = {
      id: 'CCHANNELID',
      name: 'channel',
    };
    this.team = {
      id: 'TTEAMID',
      domain: 'team-domain',
    };
    this.ts = '0000000000.000000';
    this.event_time = 1234567890;
    this.event_id = 'EVENT_ID';
    this.authed_users = [this.user.id];
  }
}

export default new Fields();
