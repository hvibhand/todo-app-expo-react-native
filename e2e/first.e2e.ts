/* Example Detox test (requires native build) */
describe("App e2e", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it("shows the home screen", async () => {
    await expect(element(by.text("Todos"))).toBeVisible();
  });
});