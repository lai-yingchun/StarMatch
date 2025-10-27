import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Page, SectionCard, PrimaryButton, NavBar } from "./App"; // 路徑依專案調整

type TSNEPoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  score: number;
  persona: string;
};

const mockTSNEData: TSNEPoint[] = [
  { id: "a1", name: "藝人A", x: 10, y: 20, score: 9.2, persona: "熱血歌手" },
  { id: "a2", name: "藝人B", x: -5, y: 15, score: 8.5, persona: "實力派" },
  { id: "a3", name: "藝人C", x: 20, y: -10, score: 7.8, persona: "流量型" },
  { id: "a4", name: "藝人D", x: -15, y: 5, score: 8.0, persona: "抒情歌手" },
  { id: "a5", name: "藝人E", x: 5, y: -20, score: 7.5, persona: "搞笑藝人" },
  { id: "a6", name: "藝人F", x: -10, y: -15, score: 8.2, persona: "才子型" },
  { id: "a7", name: "藝人G", x: 15, y: 10, score: 7.9, persona: "潮流型" },
  { id: "a8", name: "藝人H", x: -20, y: 0, score: 8.6, persona: "實力派" },
  { id: "a9", name: "藝人I", x: 0, y: 20, score: 7.7, persona: "文青型" },
  { id: "a10", name: "藝人J", x: 10, y: -10, score: 8.1, persona: "綜藝咖" },
  { id: "a11", name: "藝人K", x: -5, y: -5, score: 7.4, persona: "創作型" },
  { id: "a12", name: "藝人L", x: 20, y: 5, score: 8.3, persona: "流量型" },
];

const CelebrityFeature: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const width = 800;
    const height = 600;
    const margin = 60; // 增加空間給 legend

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]]) // 限制可平移區域
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom as any);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(mockTSNEData, (d) => d.x) as [number, number])
      .range([margin, width - margin * 2]); // 右側留空給 legend

    const yScale = d3.scaleLinear()
      .domain(d3.extent(mockTSNEData, (d) => d.y) as [number, number])
      .range([height - margin, margin]);

    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("padding", "8px 12px")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "#fff")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // 建立 persona 顏色對應
    const personas = Array.from(new Set(mockTSNEData.map(d => d.persona)));
    const colorScale = d3.scaleOrdinal()
      .domain(personas)
      .range(d3.schemeTableau10);

    // 畫點
    g.selectAll("circle")
      .data(mockTSNEData)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 8)
      .attr("fill", (d) => colorScale(d.persona) as string)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseenter", (event, d) => {
        tooltip
          .html(`
            <strong>${d.name}</strong><br/>
            分數: ${d.score.toFixed(1)}<br/>
            人設: ${d.persona}
          `)
          .style("opacity", 1);
      })
      .on("mousemove", (event) => {
        if (!cardRef.current) return;
        const cardRect = cardRef.current.getBoundingClientRect();
        const tooltipEl = tooltipRef.current!;
        const tooltipWidth = tooltipEl.offsetWidth;
        const tooltipHeight = tooltipEl.offsetHeight;

        let left = event.clientX - cardRect.left + 10;
        let top = event.clientY - cardRect.top + 10;

        if (left + tooltipWidth > cardRect.width) left = event.clientX - cardRect.left - tooltipWidth - 10;
        if (top + tooltipHeight > cardRect.height) top = event.clientY - cardRect.top - tooltipHeight - 10;

        tooltip
          .style("left", `${left}px`)
          .style("top", `${top}px`);
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    g.append("g")
      .attr("transform", `translate(0, ${height - margin})`)
      .call(xAxis);

    g.append("g")
      .attr("transform", `translate(${margin},0)`)
      .call(yAxis);

    // ===== Legend =====
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin + 20}, ${margin})`);

    personas.forEach((p, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);

      legendRow.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", colorScale(p) as string);

      legendRow.append("text")
        .attr("x", 24)
        .attr("y", 14)
        .text(p)
        .style("font-size", "14px");
    });

  }, []);

  return (
    <Page>
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <SectionCard title="名人特徵比對 (t-SNE 互動圖)">
          <div className="relative" ref={cardRef}>
            <svg ref={svgRef} width={900} height={600} className="border" />
            <div ref={tooltipRef}></div>
          </div>
          <PrimaryButton onClick={() => window.history.back()} className="mt-4">
            回上一頁
          </PrimaryButton>
        </SectionCard>
      </div>
    </Page>
  );
};

export default CelebrityFeature;
