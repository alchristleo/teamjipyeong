import getApp from './express';

const port = 3095;

const main = async (): Promise<void> => {
  const { server } = getApp();

  server.listen({ port }, (): void => {
    console.log(`Worker is listening for HTTP on ${port}`);
  });
};

main().catch(err => {
  console.log(err);
  process.exit();
});
