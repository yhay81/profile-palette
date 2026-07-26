import type { Child } from "hono/jsx";

import { product } from "../config/product";

type LayoutProps = {
  canonicalPath?: string;
  children: Child;
  description?: string;
  script?: string;
  title?: string;
};

export function Layout({
  canonicalPath = "/",
  children,
  description = product.description,
  script,
  title = product.name,
}: LayoutProps) {
  const baseUrl = "https://profile-palette.yusuke8h.workers.dev";
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  return (
    <html itemscope itemtype="https://schema.org/WebApplication" lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content={description} name="description" />
        <meta content={product.name} itemProp="name" />
        <meta content={description} itemProp="description" />
        <meta content={canonicalUrl} itemProp="url" />
        <meta content={product.applicationCategory} itemProp="applicationCategory" />
        <meta content="Any" itemProp="operatingSystem" />
        <meta content="true" itemProp="isAccessibleForFree" />
        <meta content="#17191f" name="theme-color" />
        <meta content="ja_JP" property="og:locale" />
        <link href={canonicalUrl} rel="canonical" />
        <meta content="website" property="og:type" />
        <meta content={title} property="og:title" />
        <meta content={description} property="og:description" />
        <meta content={canonicalUrl} property="og:url" />
        <meta content={`${baseUrl}/og.png`} property="og:image" />
        <meta content="1900" property="og:image:width" />
        <meta content="1000" property="og:image:height" />
        <meta content="プロフパレットのカード編集画面" property="og:image:alt" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={`${baseUrl}/og.png`} name="twitter:image" />
        <link href="/styles.css" rel="stylesheet" />
        <title>{title}</title>
      </head>
      <body>
        <a class="skip-link" href="#main">
          本文へ移動
        </a>
        <header class="site-header">
          <a class="brand" href="/">
            <span aria-hidden="true" class="brand-mark">
              P
            </span>
            <span>{product.name}</span>
          </a>
          <nav aria-label="メイン">
            <a href="#studio">つくる</a>
            <a href="/privacy">プライバシー</a>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer>
          <span>© 2026 {product.name}</span>
          <nav aria-label="フッター">
            <a href="/privacy">プライバシー</a>
            <a href="https://github.com/yhay81/profile-palette">GitHub</a>
          </nav>
        </footer>
        {script ? <script defer src={script}></script> : null}
      </body>
    </html>
  );
}
