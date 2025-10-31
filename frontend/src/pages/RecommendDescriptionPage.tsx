import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { NavBar } from "../components/NavBar";
import { SectionCard } from "../components/SectionCard";
import { PrimaryButton, GhostButton } from "../components/Buttons";
import { recommendForDescription } from "../api/api";

export default function RecommendDescriptionPage() {
  const nav = useNavigate();
  const [description, setDescription] = useState("");
  const [artistGender, setArtistGender] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [productCats, setProductCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ageOptions = ["", "10", "20", "30", "40", "50", "60", "70", "80"];
  const productOptions = [
    "公益慈善",
    "名牌珠寶精品",
    "居家生活",
    "手機電腦",
    "汽車機車自行車",
    "生活家電",
    "美妝保養",
    "美食生鮮與日用品",
    "行李箱與旅行相關配件",
    "軟體電玩遊戲",
    "運動健身戶外",
    "醫療保健",
    "鞋包服飾",
  ];

  function toggleProductCat(cat: string) {
    setProductCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function onSubmit() {
    const desc = description.trim();
    if (!desc) {
      setError("請輸入品牌敘述");
      return;
    }

    if (minAge && maxAge && Number(minAge) > Number(maxAge)) {
      setError("最小年齡不得大於最大年齡");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await recommendForDescription({
        description: desc,
        topK: 10,
        artistGender: artistGender || undefined,
        minAge: minAge ? Number(minAge) : undefined,
        maxAge: maxAge ? Number(maxAge) : undefined,
        productCats,
      });

      if (resp.primaryBrand) {
        const params = new URLSearchParams();
        if (artistGender) params.set("artistGender", artistGender);
        if (minAge) params.set("minAge", minAge);
        if (maxAge) params.set("maxAge", maxAge);

        nav(
          `/results/${encodeURIComponent(resp.primaryBrand)}${
            params.toString() ? `?${params.toString()}` : ""
          }`,
          {
            state: {
              brand: resp.primaryBrand,
              filters: {
                artistGender,
                minAge,
                maxAge,
                productCats,
              },
            },
          }
        );
        return;
      }

      if (resp.results && resp.results.length > 0) {
        const params = new URLSearchParams();
        if (artistGender) params.set("artistGender", artistGender);
        if (minAge) params.set("minAge", minAge);
        if (maxAge) params.set("maxAge", maxAge);

        nav(
          `/results/__description__${params.toString() ? `?${params.toString()}` : ""}`,
          {
            state: {
              brand: null,
              description: desc,
              results: resp.results,
              filters: {
                artistGender,
                minAge,
                maxAge,
                productCats,
              },
            },
          }
        );
        return;
      }

      setError("無法根據敘述產生推薦，請提供更多品牌資訊。");
    } catch (err) {
      console.error("recommendForDescription failed", err);
      setError("推薦服務暫時不可用，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <NavBar />

      <section
        className="
          flex-1 w-full bg-[rgb(245,245,245)]
          flex items-center justify-center
          px-4 pb-16
        "
        style={{ minHeight: "calc(100vh - 4rem)" }}
      >
        <div className="w-full max-w-[960px] grid gap-6 mt-6 md:mt-2">
          <SectionCard className="bg-white border-[3px] border-black shadow-[8px_8px_0_rgba(0,0,0,0.4)]">
            <div className="flex flex-col gap-6 items-center text-center">
              <div className="w-full flex justify-start">
                <GhostButton onClick={() => nav("/recommend-mode")}>
                  返回選擇方式
                </GhostButton>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                以品牌敘述搜尋代言人
              </h2>

              <label className="flex flex-col gap-2 w-full items-center">
                <span className="text-sm font-semibold text-slate-700 text-center">
                  品牌敘述
                </span>
                <textarea
                  className="
                    w-full min-h-[160px] rounded-lg border border-slate-300
                    px-4 py-3 text-base text-slate-800 leading-relaxed
                    focus:outline-none focus:ring-2 focus:ring-[#2b6777]
                  "
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="例如：我們是一個鎖定 25-35 歲女性的保養品牌，重視天然成分與溫柔的品牌語調..."
                />
              </label>

              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-800 w-full justify-items-center">
                <div className="flex flex-col w-full md:w-[220px]">
                  <label className="font-semibold text-slate-700 text-xs mb-1 text-center">
                    代言人性別
                  </label>
                  <select
                    className="border border-slate-400 rounded-lg px-3 py-2 text-slate-800 bg-white"
                    value={artistGender}
                    onChange={(e) => setArtistGender(e.target.value)}
                  >
                    <option value="">不限</option>
                    <option value="F">女性</option>
                    <option value="M">男性</option>
                  </select>
                </div>

                <div className="flex flex-col w-full md:w-[220px]">
                  <label className="font-semibold text-slate-700 text-xs mb-1 text-center">
                    代言人最小年齡
                  </label>
                  <select
                    className="border border-slate-400 rounded-lg px-3 py-2 text-slate-800 bg-white"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                  >
                    {ageOptions.map((age) => (
                      <option key={age} value={age}>
                        {age === "" ? "不限" : age}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col w-full md:w-[220px]">
                  <label className="font-semibold text-slate-700 text-xs mb-1 text-center">
                    代言人最大年齡
                  </label>
                  <select
                    className="border border-slate-400 rounded-lg px-3 py-2 text-slate-800 bg-white"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                  >
                    {ageOptions.map((age) => (
                      <option key={age} value={age}>
                        {age === "" ? "不限" : age}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-full">
                <div className="text-sm font-semibold text-slate-700 text-left mb-2">
                  相關產品類別（可複選）
                </div>
                <div className="grid md:grid-cols-3 gap-2 text-left">
                  {productOptions.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:border-slate-400 transition"
                    >
                      <input
                        type="checkbox"
                        className="accent-[#2b6777]"
                        checked={productCats.includes(cat)}
                        onChange={() => toggleProductCat(cat)}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="w-full text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {error}
                </div>
              )}

              <PrimaryButton
                className="w-full md:w-auto self-center text-lg px-10 py-3"
                onClick={onSubmit}
              >
                {loading ? "分析中…" : "開始推薦"}
              </PrimaryButton>
            </div>
          </SectionCard>

        </div>
      </section>
    </Page>
  );
}
