import React, { useState, useEffect } from "react";
import starMatchLogo from "./assets/starmatch-logo.png";
import starMatchLogo2 from "./assets/starmatch-logo2.png";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import CelebrityFeature from "./CelebrityFeature";
import BrandFeature from "./BrandFeature";
/* =========================================================
   型別宣告
========================================================= */

type CsvRow = {
  brand: string;
  recommended_artist: string;
  artist_persona: string;
  artist_past_endorsement: string;
  recommendation_reason: string;
  similar_artist: string;
};

type Recommendation = {
  id: string;
  name: string;
  score: number;
};

type CandidateDetailVM = {
  id: string;
  name: string;
  score: number;
  persona: string;
  reasonText: string;
  pastBrands: string[];
  similarArtists: string[];
};

/* =========================================================
   共用小工具
========================================================= */

function stableScore(brand: string, artist: string) {
  const seed = Array.from(brand + artist).reduce(
    (a, c) => a + c.charCodeAt(0),
    0
  );
  const scoreFloat = 6 + ((seed % 40) / 40) * 4; // 6.0 ~ 10.0
  return scoreFloat;
}

function splitList(str: string): string[] {
  return str
    .split(/[，,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* =========================================================
   CSV Parser + API (前端模擬後端資料)
========================================================= */

let _csvCache: CsvRow[] | null = null;

async function loadCSV(): Promise<CsvRow[]> {
  if (_csvCache) return _csvCache;

  const resp = await fetch("/src/data/starmarch_data_20251025.csv");
  const text = await resp.text();

  // 把整份 CSV 切成「真正的一列一列」，支援欄位內含換行
  const rowsText = buildRowsRespectingQuotes(text);

  if (rowsText.length < 2) {
    _csvCache = [];
    return _csvCache;
  }

  // header
  const headerCols = parseCsvLineSmart(rowsText[0]);

  const colIndex = {
    brand: headerCols.indexOf("brand"),
    recommended_artist: headerCols.indexOf("recommended_artist"),
    artist_persona: headerCols.indexOf("artist_persona"),
    artist_past_endorsement: headerCols.indexOf("artist_past_endorsement"),
    recommendation_reason: headerCols.indexOf("recommendation_reason"),
    similar_artist: headerCols.indexOf("similar_artist"),
  };

  function getCol(cols: string[], idx: number): string {
    return idx >= 0 && idx < cols.length ? cols[idx] : "";
  }

  const parsedRows: CsvRow[] = [];

  for (let i = 1; i < rowsText.length; i++) {
    const line = rowsText[i];
    if (!line) continue;

    const cols = parseCsvLineSmart(line);

    parsedRows.push({
      brand: getCol(cols, colIndex.brand),
      recommended_artist: getCol(cols, colIndex.recommended_artist),
      artist_persona: getCol(cols, colIndex.artist_persona),
      artist_past_endorsement: getCol(cols, colIndex.artist_past_endorsement),
      recommendation_reason: getCol(cols, colIndex.recommendation_reason),
      similar_artist: getCol(cols, colIndex.similar_artist),
    });
  }

  // 方便你在 DevTools 裡檢查實際 parse 結果
  console.log("CSV parsedRows =", parsedRows);

  _csvCache = parsedRows;
  return parsedRows;
}

/**
 * 把整份 CSV 字串組成 row 陣列，一 row = 一筆資料
 * - 支援欄位內含換行（只要還在引號裡，就不切行）
 * - 保留引號字元本身，後面 parseCsvLineSmart 會再處理
 */
function buildRowsRespectingQuotes(fullText: string): string[] {
  const rows: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < fullText.length; i++) {
    const ch = fullText[i];
    const nextCh = i + 1 < fullText.length ? fullText[i + 1] : "";

    if (ch === '"') {
      // 保留引號本身
      cur += '"';

      if (inQuotes) {
        // 已在引號裡
        if (nextCh === '"') {
          // 轉義成實際的 "
          cur += '"';
          i++; // skip 下一個
        } else {
          // 離開引號狀態
          inQuotes = false;
        }
      } else {
        // 進入引號狀態
        inQuotes = true;
      }
      continue;
    }

    if (ch === "\r") {
      // 忽略 CR，統一用 \n
      continue;
    }

    if (ch === "\n") {
      if (inQuotes) {
        // 引號內的換行，當成內容
        cur += "\n";
      } else {
        // 引號外的換行 => 一筆完成
        const trimmed = cur.trim();
        if (trimmed.length > 0) {
          rows.push(trimmed);
        }
        cur = "";
      }
      continue;
    }

    // 一般字元
    cur += ch;
  }

  // 最後一筆（檔案尾巴沒有 \n 的情況）
  const leftover = cur.trim();
  if (leftover.length > 0) {
    rows.push(leftover);
  }

  return rows;
}

/**
 * 把單一 row 的 CSV 字串拆成每個欄位
 * - 支援 "欄位,裡,有,逗號"
 * - 支援 "欄位\n裡面有換行"
 * - 支援 "" 代表字面上的 "
 */
function parseCsvLineSmart(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const nextCh = i + 1 < line.length ? line[i + 1] : "";

    if (ch === '"') {
      if (inQuotes) {
        // 引號內又遇到 "
        if (nextCh === '"') {
          // "" -> 字面上的 "
          cur += '"';
          i++; // skip 下一個
        } else {
          // 結束引號段
          inQuotes = false;
        }
      } else {
        // 進入引號段
        inQuotes = true;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      // 欄位分隔
      result.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  // push 最後一欄
  result.push(cur);

  // 全部做 trim()
  return result.map((c) => c.trim());
}

/* API 物件：前端模擬後端查詢 */
const api = {
  // 依品牌給推薦清單（給 Results 頁用）
  async recommendForBrand(
    brand: string,
    opts: { topK?: number } = {}
  ): Promise<Recommendation[]> {
    const topK = opts.topK ?? 10;
    const rows = await loadCSV();

    // 嚴格比對 brand 名稱
    const matched = rows.filter(
      (r) => r.brand.trim() === brand.trim()
    );

    if (matched.length === 0) {
      return [];
    }

    // 轉成 Recommendation[]
    const recs = matched.map((r) => ({
      id: r.recommended_artist,
      name: r.recommended_artist,
      score: stableScore(r.brand, r.recommended_artist),
    }));

    // 排序後取前 topK
    return recs.sort((a, b) => b.score - a.score).slice(0, topK);
  },

  // 依藝人名稱拿詳細資料（給 CandidateDetail 頁用）
  async getCandidateDetail(id: string): Promise<CandidateDetailVM> {
    const rows = await loadCSV();

    const row = rows.find(
      (r) => r.recommended_artist.trim() === id.trim()
    );

    if (!row) {
      return {
        id,
        name: id,
        score: 0,
        persona: "（此藝人目前沒有細節資料）",
        reasonText: "",
        pastBrands: [],
        similarArtists: [],
      };
    }

    return {
      id: row.recommended_artist,
      name: row.recommended_artist,
      score: stableScore(row.brand, row.recommended_artist),
      persona: row.artist_persona,
      reasonText: row.recommendation_reason?.trim() || "",
      pastBrands: splitList(row.artist_past_endorsement),
      similarArtists: splitList(row.similar_artist),
    };
  },
};

/* =========================================================
   共用 UI Components
========================================================= */

export const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-white text-slate-900">
    {children}
  </div>
);

export type SectionCardProps = {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  right,
  children,
  className = "",
}) => (
  <div
    className={`
      bg-rose-50/40
      border border-rose-100
      rounded-2xl
      p-5
      shadow-sm
      ${className}
    `}
  >
    {(title || right) && (
      <div className="flex items-center justify-between mb-3">
        {title ? (
          <h2 className="text-2xl font-semibold text-slate-800 tracking-wide">
            {title}
          </h2>
        ) : (
          <div />
        )}
        {right}
      </div>
    )}
    {children}
  </div>
);

export const PrimaryButton = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 text-white rounded-full shadow hover:opacity-95 active:opacity-90 transition ${className}`}
    style={{ backgroundColor: "#2b6777" }}
  >
    <span className="text-xl font-semibold tracking-wide">{children}</span>
  </button>
);

const GhostButton = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition ${className}`}
  >
    {children}
  </button>
);

const ScorePill = ({ score }: { score: number }) => (
  <div className="px-3 py-1 rounded-full bg-white border shadow-sm text-slate-700 text-sm min-w-[56px] text-center">
    {score.toFixed(1)}/10
  </div>
);

/* =========================================================
   NavBar
========================================================= */

export const NavBar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const link = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md text-sm font-semibold tracking-wide ${
        location.pathname === to ? "underline" : ""
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="sticky top-0 z-40 bg-rose-200/80 backdrop-blur border-b border-rose-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-black tracking-wider">
          HOME
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {link("/recommend", "RECOMMEND")}
          {link("/analysis", "ANALYSIS")}
          {link("/news", "NEWS")}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)}>
          <div className="w-6 h-0.5 bg-slate-800 mb-1" />
          <div className="w-6 h-0.5 bg-slate-800 mb-1" />
          <div className="w-6 h-0.5 bg-slate-800" />
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-2">
          <Link to="/recommend" className="py-2" onClick={() => setOpen(false)}>
            RECOMMEND
          </Link>
          <Link to="/analysis" className="py-2" onClick={() => setOpen(false)}>
            ANALYSIS
          </Link>
          <Link to="/news" className="py-2" onClick={() => setOpen(false)}>
            NEWS
          </Link>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   Pages
========================================================= */

/* Home */
const Home = () => {
  const nav = useNavigate();

  return (
    <Page>
      <NavBar />
      <section className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-white">
        {/* 背景圓 */}
        <div
          className="
            absolute top-[-20vh] left-[-20vh]
            w-[140vh] h-[140vh]
            rounded-full
            bg-[rgb(250,244,242)]
            shadow-[0_60px_120px_rgba(0,0,0,0.06)]
            pointer-events-none
          "
        />

        {/* 主內容：logo + 按鈕 */}
        <div
          className="
            relative z-10 flex w-full max-w-[1400px] px-8 gap-8
          "
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 0.8fr",
            alignItems: "center",
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <img
              src={starMatchLogo}
              alt="StarMatch Logo"
              className="w-[420px] max-w-full drop-shadow-[6px_8px_12px_rgba(0,0,0,0.4)]"
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-10">
            <button
              onClick={() => nav("/recommend")}
              className="
                w-[400px] rounded-[60px] px-10 py-6 text-white font-semibold
                text-[32px] leading-none tracking-wide
                shadow-[0_16px_32px_rgba(0,0,0,0.15)]
                transition hover:opacity-90
              "
              style={{ backgroundColor: "#2b6777" }}
            >
              開始推薦
            </button>

            <button
              onClick={() => nav("/analysis")}
              className="
                w-[400px] rounded-[60px] px-10 py-6 text-white font-semibold
                text-[32px] leading-none tracking-wide
                shadow-[0_16px_32px_rgba(0,0,0,0.15)]
                transition hover:opacity-90
              "
              style={{ backgroundColor: "#2b6777" }}
            >
              探索更多
            </button>

            <button
              onClick={() => nav("/news")}
              className="
                w-[400px] rounded-[60px] px-10 py-6 text-white font-semibold
                text-[32px] leading-none tracking-wide
                shadow-[0_16px_32px_rgba(0,0,0,0.15)]
                transition hover:opacity-90
              "
              style={{ backgroundColor: "#2b6777" }}
            >
              最新消息
            </button>
          </div>
        </div>
      </section>
    </Page>
  );
};

/* Recommend (輸入品牌) */
const Recommend = () => {
  const nav = useNavigate();
  const [brand, setBrand] = useState("");

  function onSearch() {
    if (!brand.trim()) return;
    nav(`/results/${encodeURIComponent(brand.trim())}`);
  }

  return (
    <Page>
      <NavBar />

      <section className="flex-1 w-full bg-[rgb(245,245,245)] flex items-center justify-center px-4 pb-24">
        <div className="flex flex-col items-center w-full max-w-[1000px]">
          <div className="flex flex-col items-center mb-0">
            <img
              src={starMatchLogo2}
              alt="StarMatch Logo"
              className="w-[360px] max-w-[80vw] drop-shadow-[6px_8px_12px_rgba(0,0,0,0.4)]"
            />
          </div>

          <div
            className="
              w-full max-w-[800px]
              bg-white rounded-lg
              border-[3px] border-black
              shadow-[8px_8px_0_rgba(0,0,0,0.4)]
              flex items-center
              px-6 py-4
            "
          >
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Brand Name"
              className="
                flex-1 text-[24px] outline-none bg-transparent text-black
                placeholder:text-neutral-500
              "
            />

            <button
              onClick={onSearch}
              className="ml-4 flex items-center justify-center"
              aria-label="search"
            >
              <div
                className="
                  w-[40px] h-[40px] rounded-full
                  border-[4px] border-black
                  relative
                "
              >
                <div
                  className="
                    absolute right-[-6px] bottom-[-6px]
                    w-[16px] h-[4px]
                    bg-black rotate-45 rounded-[2px]
                  "
                />
              </div>
            </button>
          </div>
        </div>
      </section>
    </Page>
  );
};

/* Results (推薦清單) */
const Results = () => {
  const { brand } = useParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Recommendation[]>([]);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await api.recommendForBrand(
        decodeURIComponent(brand || ""),
        { topK: 10 }
      );
      if (mounted) setItems(res);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [brand]);

  return (
    <Page>
      <NavBar />

      <div className="mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 w-full max-w-[1200px]">
        {/* 左側：候選名單 */}
        <SectionCard title="候選人名單">
          {loading ? (
            <div className="py-16 text-center text-slate-500">載入中⋯</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              查無此品牌的推薦資料
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
                            from: location.pathname,
                            brand,
                          } as any,
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

        {/* 右側：視覺化分析*/}
        <SectionCard>
          <div className="flex flex-col items-center text-center gap-6 h-full py-4">
            <div className="text-2xl font-bold text-[#1e4a57]">
              視覺化分析
            </div>

            <PrimaryButton
              className="w-[80%] max-w-[320px] text-lg py-3 text-white"
              onClick={() => nav("/celebrity-feature")}
            >
              名人特徵比對
            </PrimaryButton>

            <PrimaryButton
              className="w-[80%] max-w-[320px] text-lg py-3 text-white"
              onClick={() => nav("/brand-feature")}
            >
              品牌趨勢分析
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
};

/* CandidateDetail (單一藝人詳情) */
const CandidateDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<CandidateDetailVM | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await api.getCandidateDetail(id || "");
      if (mounted) setData(res);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!data) {
    return (
      <Page>
        <NavBar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-slate-500">
          載入中⋯
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        {/* 左上：人設 + 分數 + 回上一頁 */}
        <SectionCard
          title={
            <span className="flex flex-wrap items-baseline gap-4">
              <span className="text-slate-900 font-bold text-2xl">
                Name: {data.name}
              </span>
              <ScorePill score={data.score} />
              <GhostButton onClick={() => nav(-1)}>回上一頁</GhostButton>
            </span>
          }
        >
          <div className="p-4 border rounded-xl bg-white leading-8">
            {data.persona || "（此藝人尚無詳細介紹）"}
          </div>
        </SectionCard>

        {/* 右上：推薦原因 */}
        <SectionCard title="推薦原因">
          {data.reasonText && data.reasonText.length > 0 ? (
            <p className="leading-8 text-slate-800 whitespace-pre-line">
              {data.reasonText}
            </p>
          ) : (
            <div className="text-slate-500">目前沒有推薦原因資料</div>
          )}
        </SectionCard>

        {/* 左下：品牌合作 */}
        <SectionCard title="曾經合作過的品牌">
          {data.pastBrands && data.pastBrands.length > 0 ? (
            <ul className="list-disc pl-6 space-y-2">
              {data.pastBrands.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <div className="text-slate-500">目前沒有合作品牌資料</div>
          )}
        </SectionCard>

        {/* 右下：相似藝人 */}
        <SectionCard title="相似藝人">
          {data.similarArtists && data.similarArtists.length > 0 ? (
            <ol className="list-decimal pl-6 grid gap-2">
              {data.similarArtists.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          ) : (
            <div className="text-slate-500">目前沒有相似藝人資料</div>
          )}
        </SectionCard>
      </div>
    </Page>
  );
};

/* Analysis*/
const Analysis = () => {
  const nav = useNavigate();

  return (
    <Page>
      <NavBar />
      <div className="w-full max-w-[1200px] mx-auto px-4 py-16 flex justify-center">
        <div className="w-full md:w-[600px]">
          <SectionCard>
            <div className="flex flex-col items-center text-center gap-8 w-full">
              <div className="text-2xl font-bold text-[#1e4a57]">
                視覺化分析
              </div>

              <div className="flex flex-col gap-6 w-full max-w-[400px]">
                <PrimaryButton
                  className="
                    w-full text-lg py-4 text-white
                    rounded-[999px]
                    shadow-[0_24px_48px_rgba(0,0,0,0.15)]
                  "
                  onClick={() => nav("/celebrity-feature")}
                >
                  名人特徵比對
                </PrimaryButton>

                <PrimaryButton
                  className="
                    w-full text-lg py-4 text-white
                    rounded-[999px]
                    shadow-[0_24px_48px_rgba(0,0,0,0.15)]
                  "
                  onClick={() => nav("/brand-feature")}
                >
                  品牌趨勢分析
                </PrimaryButton>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </Page>
  );
};

/* News */
const mockNews = [
  {
    title: "筆電品牌釋出新系列形象片，鎖定年輕族群",
    date: "2025-10-18",
    source: "Tech Insight",
    url: "",
    summary:
      "主打質感、創作力與行動工作者定位，找來音樂人與影像創作者入鏡，明顯走向潮流而非硬規格訴求。",
  },
  {
    title: "行動外送平台完成多代言人組合策略 A/B 測試",
    date: "2025-10-12",
    source: "廣告觀察",
    url: "",
    summary:
      "此輪測試同時比較頂流歌手與綜藝咖的轉換率，結果顯示『雙代言組合』對年輕族群點擊成長最明顯。",
  },
  {
    title: "運動品牌攜手頂尖球星展開形象合作",
    date: "2025-10-10",
    source: "體育產業動態",
    url: "",
    summary:
      "該品牌宣布與國際級球星展開年度品牌合作，強調專業力與運動精神，後續預計推出聯名社群挑戰活動。",
  },
];

const News = () => {
  const hasNews = mockNews.length > 0;

  return (
    <Page>
      <NavBar />
      <div className="w-full max-w-[1200px] mx-auto px-4 py-16 flex justify-center">
        <SectionCard
          className="w-full md:w-[700px]"
          title={
            <span className="flex flex-col">
              <span className="text-[#1e4a57] font-bold text-2xl">
                最新消息
              </span>
              <span className="text-base text-slate-500 font-normal">
                （廣告/代言/品牌合作即時追蹤）
              </span>
            </span>
          }
        >
          <p className="text-slate-600 leading-relaxed mb-6">
            以下內容可以由排程式工作（例如 Scrapy 爬蟲 + Celery 排程）自動更新。
            Demo 目前使用假資料。
          </p>

          {hasNews ? (
            <ul className="space-y-4">
              {mockNews.map((n, i) => (
                <li
                  key={i}
                  className="
                    rounded-lg border border-slate-200 bg-white p-4 shadow-sm
                  "
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-slate-800 text-lg">
                      {n.title}
                    </div>

                    <div className="text-sm text-slate-500 flex flex-wrap gap-2">
                      <span>{n.date}</span>
                      {n.source && <span className="text-slate-400">·</span>}
                      {n.source &&
                        (n.url ? (
                          <a
                            className="underline text-slate-500 hover:text-slate-700"
                            href={n.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {n.source}
                          </a>
                        ) : (
                          <span>{n.source}</span>
                        ))}
                    </div>

                    {n.summary && (
                      <div className="text-sm text-slate-600 leading-relaxed">
                        {n.summary}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-slate-400 py-16">
              目前沒有新消息
            </div>
          )}
        </SectionCard>
      </div>
    </Page>
  );
};

/* =========================================================
   Root App with Routes
========================================================= */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/results/:brand" element={<Results />} />
        <Route path="/candidate/:id" element={<CandidateDetail />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/celebrity-feature" element={<CelebrityFeature />} />
        <Route path="/brand-feature" element={<BrandFeature />} />
        <Route path="/news" element={<News />} />
      </Routes>
    </BrowserRouter>
  );
}