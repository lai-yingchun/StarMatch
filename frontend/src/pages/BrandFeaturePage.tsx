import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Page } from "../components/Page";
import { NavBar } from "../components/NavBar";
import { SectionCard } from "../components/SectionCard";
import { PrimaryButton } from "../components/Buttons";

type TSNEPoint = {
  brand: string;
  category: string;
  x: number;
  y: number;
};

export default function BrandFeaturePage() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [tsneData, setTsneData] = useState<TSNEPoint[]>([]);

  useEffect(() => {
    fetch("/src/data/brand_tsne.json")
      .then((res) => res.json())
      .then((data) => {
        setTsneData(data);
      });
  }, []);

  useEffect(() => {
    if (tsneData.length === 0) return;

    const width = 1100;
    const height = 600;
    const margin = 150;
    const minLabelDist = 25;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [width - margin, height],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom as any);

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(tsneData, (d) => d.x) as [number, number])
      .range([margin, width - margin * 2]);
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(tsneData, (d) => d.y) as [number, number])
      .range([height - margin, margin]);

    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("padding", "8px 12px")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "#fff")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const categories = Array.from(new Set(tsneData.map((d) => d.category)));
    const colorScale = d3
      .scaleOrdinal()
      .domain(categories)
      .range(d3.schemeTableau10);

    g.selectAll("circle")
      .data(tsneData)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 6)
      .attr("fill", (d) => colorScale(d.category) as string)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .on("mouseenter", (_event, d) => {
        tooltip
          .html(
            `<strong>${d.brand}</strong><br/>
             類別: ${d.category}`
          )
          .style("opacity", 1);
      })
      .on("mousemove", (event) => {
        const cardRect = cardRef.current!.getBoundingClientRect();
        tooltip
          .style("left", `${event.clientX - cardRect.left + 10}px`)
          .style("top", `${event.clientY - cardRect.top + 10}px`);
      })
      .on("mouseleave", () => tooltip.style("opacity", 0));

    const shownLabels: { x: number; y: number }[] = [];
    const labelPoints = tsneData.filter((d) => {
      const px = xScale(d.x);
      const py = yScale(d.y);
      for (const l of shownLabels) {
        const dist = Math.hypot(px - l.x, py - l.y);
        if (dist < minLabelDist) return false;
      }
      shownLabels.push({ x: px, y: py });
      return true;
    });

    const labelOffsetX = 15;
    const labelOffsetY = -10;

    g.selectAll("line.leader")
      .data(labelPoints)
      .join("line")
      .attr("x1", (d) => xScale(d.x))
      .attr("y1", (d) => yScale(d.y))
      .attr("x2", (d) => xScale(d.x) + labelOffsetX)
      .attr("y2", (d) => yScale(d.y) + labelOffsetY)
      .attr("stroke", "gray")
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "1 1");

    g.selectAll("text.brand")
      .data(labelPoints)
      .join("text")
      .attr("x", (d) => xScale(d.x) + labelOffsetX)
      .attr("y", (d) => yScale(d.y) + labelOffsetY)
      .text((d) => d.brand)
      .style("font-size", "11px")
      .style("fill", "#333")
      .style("pointer-events", "none");

    g.append("g")
      .attr("transform", `translate(0, ${height - margin})`)
      .call(d3.axisBottom(xScale).ticks(10));

    g.append("g")
      .attr("transform", `translate(${margin},0)`)
      .call(d3.axisLeft(yScale).ticks(10));

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin + 20}, ${margin})`);

    categories.forEach((cat, i) => {
      const row = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 25})`);
      row
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", colorScale(cat) as string);
      row
        .append("text")
        .attr("x", 24)
        .attr("y", 14)
        .text(cat)
        .style("font-size", "13px")
        .style("fill", "#333");
    });
  }, [tsneData]);

  return (
    <Page>
      <NavBar />
      <div className="max-w-8xl mx-auto px-4 py-16">
        <SectionCard title="品牌特徵分佈 (t-SNE 互動圖)">
          <div className="relative" ref={cardRef}>
            <svg ref={svgRef} width={1100} height={600} className="border" />
            <div ref={tooltipRef}></div>
          </div>
          <PrimaryButton
            onClick={() => window.history.back()}
            className="mt-4"
          >
            回上一頁
          </PrimaryButton>
        </SectionCard>
      </div>
    </Page>
  );
}