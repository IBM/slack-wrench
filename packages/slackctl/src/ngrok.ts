import ngrok from 'ngrok';
import waitPort from 'wait-port';

export default async (port: number, timeout: number): Promise<string> => {
  await waitPort({ port, timeout });

  return ngrok.connect(port);
};
