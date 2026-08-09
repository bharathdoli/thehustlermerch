"use client";

const ANNOUNCEMENTS = [
  "FREE SHIPPING ABOVE ₹999",
  "12% OFF — CODE FIRSTORDER",
  "CUSTOM MERCH — PROOF APPROVED BEFORE PRINT",
  "25,000+ HUSTLERS ACROSS INDIA",
];

export default function AnnouncementBar() {
  const loop = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];
  return (
    <div className="overflow-hidden bg-[#f3ede1] py-2">
      <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-12 whitespace-nowrap px-4">
        {loop.map((msg, i) => (
          <span key={i} className="flex items-center gap-12 font-mono text-[11px] font-bold tracking-widest text-[#131210]">
            {msg}
            <span className="text-[#ff5a1f]">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}