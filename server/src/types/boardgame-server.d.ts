declare module "boardgame.io/dist/cjs/server.js" {
  export const Server: (config: {
    games: unknown[];
    origins?: string[];
  }) => {
    run: (port: number, callback?: () => void) => void;
  };

  const boardgameServer: {
    Server: typeof Server;
  };

  export default boardgameServer;
}
