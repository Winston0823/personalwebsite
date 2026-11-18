"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

/** One continuous stroke unwraps from doggo's oval into an email arrow. */
export default function ContactCardMotion() {
  const svgRef = useRef<SVGSVGElement>(null);
  const ovalRef = useRef<SVGPathElement>(null);
  const traceRef = useRef<SVGPathElement>(null);
  const arrowRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const oval = ovalRef.current;
    const trace = traceRef.current;
    const arrow = arrowRef.current;
    const card = svg?.closest<HTMLAnchorElement>(".contact-card");
    const doggo = card?.querySelector<HTMLElement>(".contact-card-doggo");
    const email = card?.querySelector<HTMLElement>(".contact-card-email");
    if (!svg || !oval || !trace || !arrow || !card || !doggo || !email) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ovalLength = 0;
    let totalLength = 0;
    let progress = 0;
    let target = 0;
    let frame = 0;
    let previousTime = 0;
    let pointerInside = false;
    let focused = false;
    let alive = true;

    const paint = () => {
      if (!totalLength) return;
      // The tip leaves first. The other end waits, then unwraps the oval.
      const head = 1 - Math.pow(1 - clamp(progress / 0.82), 3);
      const tail = smooth(clamp((progress - 0.18) / 0.82));
      const start = ovalLength * tail;
      const end = ovalLength + (totalLength - ovalLength) * head;
      trace.style.strokeDasharray = `${Math.max(0.1, end - start)} ${totalLength + 2}`;
      trace.style.strokeDashoffset = `${-start}`;

      const tip = trace.getPointAtLength(end);
      const before = trace.getPointAtLength(Math.max(0, end - 5));
      const angle = Math.atan2(tip.y - before.y, tip.x - before.x) + Math.PI;
      const arm = Math.min(16, Math.max(11, card.clientWidth * 0.014)) * clamp(head * 3);
      const spread = 0.52;
      const leftX = tip.x + arm * Math.cos(angle - spread);
      const leftY = tip.y + arm * Math.sin(angle - spread);
      const rightX = tip.x + arm * Math.cos(angle + spread);
      const rightY = tip.y + arm * Math.sin(angle + spread);
      arrow.setAttribute(
        "d",
        `M ${leftX} ${leftY} L ${tip.x} ${tip.y} L ${rightX} ${rightY}`,
      );
      arrow.style.opacity = head > 0.01 ? String(clamp(head * 3)) : "0";
      svg.dataset.progress = progress.toFixed(2);
    };

    const measure = () => {
      const bounds = card.getBoundingClientRect();
      const mark = doggo.getBoundingClientRect();
      const address = email.getBoundingClientRect();
      if (!bounds.width || !mark.width || !address.width) return;

      const centerX = mark.left - bounds.left + mark.width / 2;
      const centerY = mark.top - bounds.top + mark.height / 2;
      const radiusX = mark.width / 2;
      const radiusY = mark.height * 0.46;
      const endX = address.right - bounds.left + 20;
      const endY = address.top - bounds.top + address.height / 2;
      // Depart from the lower edge of the oval, then follow its tangent toward
      // the email. The small periodic wobble keeps the ring hand drawn.
      const ringPoint = (angle: number) => {
        const wobble = 1 + 0.015 * Math.sin(angle * 3 + 0.5) + 0.008 * Math.cos(angle * 5);
        return {
          x: centerX + radiusX * wobble * Math.cos(angle),
          y: centerY + radiusY * wobble * Math.sin(angle),
        };
      };
      const ringDerivative = (angle: number) => {
        const before = ringPoint(angle - 0.001);
        const after = ringPoint(angle + 0.001);
        return { x: (after.x - before.x) / 0.002, y: (after.y - before.y) / 0.002 };
      };
      const seamAngle = Math.PI * 0.56;
      const seam = ringPoint(seamAngle);
      const step = Math.PI / 4;
      const ringParts = [`M ${seam.x} ${seam.y}`];
      for (let index = 0; index < 8; index++) {
        const angle = seamAngle + step * index;
        const nextAngle = angle + step;
        const from = ringPoint(angle);
        const to = ringPoint(nextAngle);
        const fromTangent = ringDerivative(angle);
        const toTangent = ringDerivative(nextAngle);
        const first = {
          x: from.x + fromTangent.x * step / 3,
          y: from.y + fromTangent.y * step / 3,
        };
        const second = {
          x: to.x - toTangent.x * step / 3,
          y: to.y - toTangent.y * step / 3,
        };
        ringParts.push(`C ${first.x} ${first.y}, ${second.x} ${second.y}, ${to.x} ${to.y}`);
      }
      const ring = ringParts.join(" ");
      const tangent = ringDerivative(seamAngle);
      const tangentLength = Math.hypot(tangent.x, tangent.y);
      const reach = Math.hypot(endX - seam.x, endY - seam.y);
      const handle = Math.min(115, reach * 0.25);
      const firstX = seam.x + tangent.x / tangentLength * handle;
      const firstY = seam.y + tangent.y / tangentLength * handle;
      const route = `C ${firstX} ${firstY}, ${endX - (endX - seam.x) * 0.2} ${endY - (endY - seam.y) * 0.18}, ${endX} ${endY}`;
      svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      oval.setAttribute("d", ring);
      trace.setAttribute("d", `${ring} ${route}`);
      ovalLength = oval.getTotalLength();
      totalLength = trace.getTotalLength();
      paint();
      card.dataset.motionReady = "true";
    };

    const tick = (now: number) => {
      const elapsed = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0;
      previousTime = now;
      progress = clamp(progress + (target ? 1 : -1) * elapsed / 1.05);
      if (Math.abs(progress - target) < 0.001) progress = target;
      paint();
      if (progress === target) {
        frame = 0;
        previousTime = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }
    };
    const updateTarget = () => {
      target = pointerInside || focused ? 1 : 0;
      if (reduced.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        progress = target;
        paint();
      } else if (!frame && progress !== target) {
        frame = requestAnimationFrame(tick);
      }
    };
    const onEnter = () => { pointerInside = true; updateTarget(); };
    const onLeave = () => { pointerInside = false; updateTarget(); };
    const onFocus = () => { focused = true; updateTarget(); };
    const onBlur = () => { focused = false; updateTarget(); };
    const onMotionPreference = () => updateTarget();

    const resize = new ResizeObserver(measure);
    resize.observe(card);
    resize.observe(doggo);
    resize.observe(email);
    measure();
    document.fonts.ready.then(() => { if (alive) measure(); });
    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);
    card.addEventListener("focus", onFocus);
    card.addEventListener("blur", onBlur);
    reduced.addEventListener("change", onMotionPreference);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      card.removeEventListener("focus", onFocus);
      card.removeEventListener("blur", onBlur);
      reduced.removeEventListener("change", onMotionPreference);
      delete card.dataset.motionReady;
    };
  }, []);

  return (
    <svg ref={svgRef} className="contact-card-motion" aria-hidden="true" focusable="false">
      <path ref={ovalRef} fill="none" stroke="none" />
      <path ref={traceRef} className="contact-card-trace" fill="none" />
      <path ref={arrowRef} className="contact-card-arrowhead" fill="none" />
    </svg>
  );
}
