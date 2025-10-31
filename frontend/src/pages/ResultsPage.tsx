import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { NavBar } from "../components/NavBar";
import { SectionCard } from "../components/SectionCard";
import { PrimaryButton, GhostButton } from "../components/Buttons";
import { ScorePill } from "../components/ScorePill";
import type { Recommendation } from "../api/api";
import { recommendForBrand } from "../api/api";
function useQueryParams() {
  const loc = useLocation();
  return React.useMemo(() => new URLSearchParams(loc.search), [loc.search]);
}

export default function ResultsPage() {
  const { brand } = useParams();
  const query = useQueryParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Recommendation[]>([]);
  const nav = useNavigate();
  const location = useLocation();
  const locationState = location.state as
    | {
        results?: Recommendation[];
        description?: string;
        brand?: string | null;
        filters?: {
          artistGender?: string;
          minAge?: string;
          maxAge?: string;
          productCats?: string[];
        };
      }
    | undefined;
  const customResults = locationState?.results ?? null;
  const customDescription = locationState?.description ?? "";
  const customBrand = locationState?.brand ?? undefined;

  const artistGender = query.get("artistGender") || "";
  const minAgeStr = query.get("minAge") || "";
  const maxAgeStr = query.get("maxAge") || "";
  const isCustomDescription =
    (brand === "__description__" || !brand) &&
    !!customResults &&
    customResults.length > 0;

  useEffect(() => {
    let mounted = true;

    if (isCustomDescription) {
      setItems(customResults ?? []);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoading(true);

      const res = await recommendForBrand(decodeURIComponent(brand || ""), {
        topK: 10,
        artistGender: artistGender || undefined,
        minAge: minAgeStr ? Number(minAgeStr) : undefined,
        maxAge: maxAgeStr ? Number(maxAgeStr) : undefined,
      });

      if (mounted) {
        setItems(res);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [brand, artistGender, minAgeStr, maxAgeStr, isCustomDescription, customResults]);

  const displayBrand =
    brand && brand !== "__description__"
      ? `候選人名單 — ${decodeURIComponent(brand)}`
      : "候選人名單";
  const descriptionLine =
    !brand || brand === "__description__"
      ? customDescription.trim()
      : "";

  return (
    <Page>
      <NavBar />

      <div className="mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 w-full max-w-[1200px]">
        <SectionCard
          title={
            <div className="flex flex-col">
              <span className="font-semibold break-words">{displayBrand}</span>
              {descriptionLine && (
                <span className="text-sm text-slate-500 font-normal mt-1 whitespace-pre-wrap break-words">
                  品牌敘述：{descriptionLine}
                </span>
              )}

              <span className="text-xs text-slate-500 font-normal mt-1">
                {artistGender
                  ? artistGender === "F"
                    ? "女性藝人"
                    : "男性藝人"
                  : "不限性別"}
                ／
                {minAgeStr || maxAgeStr
                  ? maxAgeStr
                    ? `${minAgeStr || "?"}～${maxAgeStr} 歲藝人`
                    : `年齡≥${minAgeStr} 歲藝人`
                  : "不限年齡"}
              </span>
            </div>
          }
        >
          {loading ? (
            <div className="py-16 text-center text-slate-500">載入中⋯</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              沒有符合條件的代言人
            </div>
          ) : (
            <div className="max-h-[460px] overflow-auto pr-2">
              {items.map((it, idx) => (
                <div
                  key={it.id + idx}
                  className="
                    flex items-center justify-between gap-3
                    px-3 py-3
                    rounded-xl
                    hover:bg-white/70
                  "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="
                        w-8 h-8 rounded-full
                        grid place-items-center
                        text-white font-bold
                      "
                      style={{ backgroundColor: "#2b6777" }}
                    >
                      {idx + 1}
                    </div>

                    <div className="text-lg font-semibold">{it.name}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ScorePill score={it.score} />
                    <PrimaryButton
                      className="!px-4 !py-2 !text-base"
                      onClick={() =>
                        nav(`/candidate/${encodeURIComponent(it.id)}`, {
                          state: {
                            from: location.pathname + location.search,
                            brand:
                              !brand || brand === "__description__"
                                ? customBrand ?? undefined
                                : brand,
                            description:
                              !brand || brand === "__description__"
                                ? customDescription || undefined
                                : undefined,
                            score: it.score,
                          },
                        })
                      }
                    >
                      查看解釋
                    </PrimaryButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <div className="flex flex-col items-center text-center gap-6 h-full py-4">
            <div className="text-2xl font-bold text-[#1e4a57]">視覺化分析</div>

            <PrimaryButton
              className="w-[80%] max-w-[320px] text-lg py-3 text-white"
              onClick={() => nav("/celebrity-feature")}
            >
              名人特徵地圖
            </PrimaryButton>

            <PrimaryButton
              className="w-[80%] max-w-[320px] text-lg py-3 text-white"
              onClick={() => nav("/brand-feature")}
            >
              品牌特徵地圖
            </PrimaryButton>

            <GhostButton
              className="w-[80%] max-w-[320px] text-lg py-3"
              onClick={() => window.history.back()}
            >
              回上一頁
            </GhostButton>
          </div>
        </SectionCard>
      </div>
    </Page>
  );
}
