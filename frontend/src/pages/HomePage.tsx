import { useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { NavBar } from "../components/NavBar";
import starMatchLogo from "../assets/starmatch-logo.png";

export default function HomePage() {
  const nav = useNavigate();

  return (
    <Page>
      <NavBar />
      <section className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-white">
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
                shadow-[0_16px_32px_rgrgba(0,0,0,0.15)]
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
}