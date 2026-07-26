import { product } from "../config/product";
import { Layout } from "./layout";

const templateOptions = [
  { className: "aurora", id: "aurora", label: "Aurora" },
  { className: "paper", id: "paper", label: "Paper" },
  { className: "signal", id: "signal", label: "Signal" },
] as const;

const activityOptions = ["平日夜", "土日", "深夜", "不定期"] as const;
const interestOptions = ["雑談", "写真", "改変", "音楽", "ゲーム", "初心者"] as const;

function UploadSlot({ index, label }: { index: number; label: string }) {
  return (
    <label class="upload-slot" data-upload-slot={index}>
      <input accept="image/jpeg,image/png,image/webp" data-image-input={index} type="file" />
      <span aria-hidden="true" class="upload-preview" data-upload-preview={index}>
        +
      </span>
      <span>
        <strong>{label}</strong>
        <small>{index === 0 ? "必須 · JPG / PNG / WebP" : "任意"}</small>
      </span>
    </label>
  );
}

export function HomePage() {
  return (
    <Layout script="/app.js">
      <section class="studio" id="studio">
        <div class="studio-heading">
          <div>
            <p class="eyebrow">VRCHAT PROFILE CARD</p>
            <h1>{product.headline}</h1>
          </div>
          <p class="local-note">
            <span aria-hidden="true">●</span>
            入力と画像はこの端末だけで処理
          </p>
        </div>

        <div class="studio-layout">
          <form class="editor-panel" id="profile-form">
            <section class="control-section">
              <div class="section-title">
                <span>01</span>
                <h2>レイアウト</h2>
              </div>
              <div class="template-picker" role="radiogroup" aria-label="レイアウト">
                {templateOptions.map((template) => (
                  <button
                    aria-checked={template.id === "aurora" ? "true" : "false"}
                    class={`template-option ${template.id === "aurora" ? "selected" : ""}`}
                    data-template={template.id}
                    role="radio"
                    type="button"
                  >
                    <span aria-hidden="true" class={`template-thumb ${template.className}`}>
                      <i></i>
                      <i></i>
                      <i></i>
                    </span>
                    <span>{template.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section class="control-section">
              <div class="section-title">
                <span>02</span>
                <h2>画像</h2>
              </div>
              <div class="upload-grid">
                <UploadSlot index={0} label="メイン" />
                <UploadSlot index={1} label="サブ 1" />
                <UploadSlot index={2} label="サブ 2" />
              </div>
              <details class="image-adjust">
                <summary>メイン画像の位置を調整</summary>
                <div class="range-grid">
                  <label>
                    <span>左右</span>
                    <input id="image-x" max="100" min="-100" type="range" value="0" />
                  </label>
                  <label>
                    <span>上下</span>
                    <input id="image-y" max="100" min="-100" type="range" value="0" />
                  </label>
                  <label>
                    <span>大きさ</span>
                    <input id="image-zoom" max="240" min="100" type="range" value="100" />
                  </label>
                </div>
              </details>
            </section>

            <section class="control-section">
              <div class="section-title">
                <span>03</span>
                <h2>プロフィール</h2>
              </div>
              <div class="field-grid">
                <label class="field">
                  <span>表示名</span>
                  <input
                    autocomplete="nickname"
                    id="display-name"
                    maxlength={24}
                    placeholder="Palette"
                    value="Palette"
                  />
                </label>
                <label class="field">
                  <span>X</span>
                  <input
                    autocomplete="off"
                    id="x-handle"
                    maxlength={32}
                    placeholder="@palette_vrc"
                    value="@palette_vrc"
                  />
                </label>
                <label class="field wide">
                  <span>VRChat ID</span>
                  <input
                    autocomplete="off"
                    id="vrchat-id"
                    maxlength={40}
                    placeholder="Palette_vrc"
                    value="Palette_vrc"
                  />
                </label>
                <label class="field wide">
                  <span>ひとこと</span>
                  <textarea
                    id="message"
                    maxlength={90}
                    placeholder="写真を撮ったり、のんびり雑談したり。"
                    rows={3}
                  >
                    写真を撮ったり、のんびり雑談したり。
                  </textarea>
                  <small>
                    <span id="message-count">20</span> / 90
                  </small>
                </label>
              </div>
            </section>

            <section class="control-section compact-controls">
              <fieldset>
                <legend>活動時間</legend>
                <div class="chip-picker">
                  {activityOptions.map((option, index) => (
                    <label>
                      <input
                        checked={index === 0 || index === 1}
                        name="activity"
                        type="checkbox"
                        value={option}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>好きなこと</legend>
                <div class="chip-picker">
                  {interestOptions.map((option, index) => (
                    <label>
                      <input
                        checked={index === 0 || index === 1 || index === 2}
                        name="interest"
                        type="checkbox"
                        value={option}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>カラー</legend>
                <div class="color-picker">
                  {["#a9ff68", "#7cd4ff", "#ff8bcb", "#ffbe5c", "#b9a3ff"].map((color, index) => (
                    <label style={`--swatch:${color}`}>
                      <input checked={index === 0} name="accent" type="radio" value={color} />
                      <span aria-label={color}></span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label class="friend-toggle">
                <span>
                  <strong>フレンド申請</strong>
                  <small>カードに受付状態を表示</small>
                </span>
                <input checked id="friend-open" type="checkbox" />
                <i aria-hidden="true"></i>
              </label>
            </section>

            <div class="editor-actions">
              <button class="button primary" disabled id="download-button" type="button">
                <span aria-hidden="true">↓</span>
                PNGで保存
              </button>
              <button class="button secondary" id="copy-button" type="button">
                投稿文をコピー
              </button>
              <button class="button share-button" hidden id="share-button" type="button">
                <span aria-hidden="true">↗</span>
                画像と文面を共有
              </button>
              <button class="text-button" id="reset-button" type="button">
                入力をリセット
              </button>
            </div>
            <p aria-live="polite" class="action-status" id="action-status"></p>
          </form>

          <section class="preview-panel" aria-label="カードのプレビュー">
            <div class="preview-toolbar">
              <span>
                <i aria-hidden="true"></i>
                LIVE PREVIEW
              </span>
              <span>1600 × 900 PNG</span>
            </div>
            <div class="canvas-wrap">
              <canvas
                aria-label="生成されるVRChat自己紹介カード"
                height="900"
                id="profile-canvas"
                role="img"
                width="1600"
              ></canvas>
            </div>
            <div class="preview-hints">
              <span>
                <i aria-hidden="true">✓</i>
                アップロードなし
              </span>
              <span>
                <i aria-hidden="true">✓</i>
                高解像度PNG
              </span>
              <span>
                <i aria-hidden="true">✓</i>
                登録不要
              </span>
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
}

export function PrivacyPage() {
  return (
    <Layout canonicalPath="/privacy" title={`プライバシー | ${product.name}`}>
      <article class="prose">
        <p class="eyebrow">PRIVACY</p>
        <h1>カードの中身は、外へ送りません。</h1>
        <div class="privacy-diagram" aria-label="ブラウザ内だけでカードを生成する流れ">
          <span>画像と入力</span>
          <i aria-hidden="true">→</i>
          <strong>あなたのブラウザ</strong>
          <i aria-hidden="true">→</i>
          <span>PNG保存</span>
        </div>
        <h2>ブラウザ内で処理するもの</h2>
        <p>
          選択した画像、表示名、SNS ID、VRChat
          ID、ひとことは、カード生成のためにこの端末のブラウザ内だけで処理します。画像や入力内容をサーバーへ送信しません。
        </p>
        <h2>品質改善のために保存するもの</h2>
        <p>
          無作為な匿名セッションIDと、開始・カード完成・PNG保存・共有操作の種類、選択したレイアウト名だけを最長35日間保存します。カードの内容、画像、ファイル名、SNS
          ID、IPアドレスは製品データベースへ保存しません。
        </p>
        <h2>端末内の保存</h2>
        <p>
          再入力を減らすため、プロフィール文字、選択肢、匿名セッションIDをブラウザのlocalStorageへ保存します。画像は保存しません。「入力をリセット」で端末内データを削除できます。
        </p>
        <h2>連絡先</h2>
        <p>
          セキュリティ上の問題は、公開Issueではなく
          <a href="https://github.com/yhay81/profile-palette/security/advisories/new">
            GitHubの非公開セキュリティ報告
          </a>
          からお知らせください。
        </p>
      </article>
    </Layout>
  );
}
