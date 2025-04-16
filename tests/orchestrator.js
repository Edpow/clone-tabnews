import retry from "async-retry";

async function waitFormAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      await fetch("http://localhost:3000/api/v1/status");
    }
  }
}

const orchestrator = {
  waitFormAllServices,
};

export default orchestrator;
