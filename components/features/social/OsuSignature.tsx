"use client";

import { useEffect, useState } from "react";
import { SiOsu } from "react-icons/si";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ErrorCard } from "@/components/ui/ErrorCard"; // 引入你的通用整卡错误组件
import { ExternalLink } from "@/components/ui/ExternalLink";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";

export function OsuSignature() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 在内存中创建一个隐形的 Image 对象，主动在后台发起免跨域的 Network 请求
    const img = new Image();
    img.src = siteConfig.osu.signatureUrl;

    img.onload = () => {
      // 特征值清洗：检查下载下来的图片的原始自然宽度
      if (img.naturalHeight > 0 && img.naturalHeight < 40) {
        console.warn(
          `[OsuSignature] Blocked malicious SVG. Infringed resolution layout: ${img.naturalWidth}px`
        );
        setError("rate_limit"); // 判定为 429 恶意投毒
      } else {
        setError(null); // 正常通过
      }
      setLoading(false); // 质检完成，关闭加载状态
    };

    img.onerror = () => {
      setError("api_error"); // 常规网络断开或 404
      setLoading(false);
    };

    // 组件卸载时切断引用
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  // 1. 状态分流一：加载期间展示整卡骨架
  if (loading) {
    return <CardSkeleton />;
  }

  // 2. 状态分流二：统一风格！命中恶毒 429 或者是常规网络错误，直接扔给整卡 ErrorCard
  if (error) {
    const msg = error === "rate_limit" ? t("osu.rate_limit") : t("osu.error");
    return <ErrorCard title={t("osu.title")} message={msg} />;
  }

  // 3. 状态分流三：正常渲染卡片
  return (
    <Card className="flex flex-col">
      <CardHeader
        icon={<SiOsu />}
        title={t("osu.title")}
        action={
          <ExternalLink href={siteConfig.social.osu.url}>{t("osu.profile")} &rarr;</ExternalLink>
        }
      />

      <a
        href="https://osu.ppy.sh/community/forums/topics/1502604?n=1"
        target="_blank"
        rel="noopener noreferrer"
        className="overflow-hidden rounded-[16px] bg-black/40 transition-all duration-300 hover:scale-[1.02] block"
      >
        <img
          src={siteConfig.osu.signatureUrl}
          alt={t("osu.sig_alt")}
          width={600}
          height={200}
          className="w-full h-auto"
          style={{ display: "block" }}
        />
      </a>

      <p className="mt-3 text-xs text-center" style={{ color: "var(--md-text-muted)" }}>
        @{siteConfig.osu.username} &middot; {siteConfig.osu.mode}
      </p>
    </Card>
  );
}
