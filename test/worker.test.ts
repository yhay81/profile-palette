import { beforeEach, describe, expect, it, vi } from "vitest";

import { app, type Bindings } from "../src/worker";

const batch = vi.fn(() => Promise.resolve([]));
const prepare = vi.fn(() => {
  const statement = {
    bind: vi.fn(() => statement),
  };
  return statement;
});

const bindings = {
  ASSETS: {
    fetch: () => Promise.resolve(new Response("not used")),
  },
  DB: {
    batch,
    prepare,
  },
} as unknown as Bindings;

describe("worker", () => {
  beforeEach(() => {
    batch.mockClear();
    prepare.mockClear();
  });

  it("renders the card editor instead of a text-heavy landing page", async () => {
    const response = await app.request("/", undefined, bindings);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-security-policy")).toContain("default-src 'self'");
    expect(html).toContain('<html lang="ja">');
    expect(html).toContain("画像を選んで、プロフィールカードに。");
    expect(html).toContain('id="profile-canvas"');
    expect(html).toContain('id="download-button"');
    expect(html).toContain('id="share-button"');
    expect(html).not.toContain("PUBLIC VALIDATION");
    expect(html).not.toContain("成功条件");
  });

  it("accepts only aggregate product events", async () => {
    const response = await app.request(
      "/api/events",
      {
        body: JSON.stringify({
          name: "exported",
          sessionId: "50a9d0fe-bbc5-4d49-8207-08ce1a0e26df",
          template: "aurora",
        }),
        headers: {
          "content-type": "application/json",
          "sec-fetch-site": "same-origin",
        },
        method: "POST",
      },
      bindings,
    );

    expect(response.status).toBe(204);
    expect(batch).toHaveBeenCalledOnce();
    expect(prepare).toHaveBeenCalledTimes(2);
  });

  it("rejects arbitrary event data", async () => {
    const response = await app.request(
      "/api/events",
      {
        body: JSON.stringify({
          cardText: "must not be accepted",
          name: "profile_saved",
          sessionId: "not-a-uuid",
          template: "custom",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      bindings,
    );

    expect(response.status).toBe(400);
    expect(batch).not.toHaveBeenCalled();
  });

  it("exposes a machine-readable health endpoint", async () => {
    const response = await app.request("/healthz", undefined, bindings);
    const body = await response.json<{ healthy: boolean }>();

    expect(response.status).toBe(200);
    expect(body.healthy).toBe(true);
  });

  it("does not expose exception details", async () => {
    const response = await app.request("/missing", undefined, bindings);
    const body = await response.json<{ error: string; requestId: string }>();

    expect(response.status).toBe(404);
    expect(body.error).toBe("not_found");
    expect(body.requestId).toBeTruthy();
  });
});
