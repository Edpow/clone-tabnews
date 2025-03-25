test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://172.17.255.255:3000/api/v1/status");
  console.log(response);
  expect(response.status).toBe(200);
});
