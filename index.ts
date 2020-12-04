import getApp from './express';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.CFG_PORT;

/**
 * Init main
 */
const main = async (): Promise<void> => {
  const { server } = getApp();

  server.listen({ port }, (): void => {
    console.log(`Worker is listening for HTTP on ${port}`);
  });
};

/**
 * Log exception if occured!
 */
main().catch(err => {
  console.log(err);
  process.exit();
});
