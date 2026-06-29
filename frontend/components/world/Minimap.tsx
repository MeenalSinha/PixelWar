"use client";

const GRID_RADIUS = 4; // shows a 9x9 grid of chunks centered on the current one

export default function Minimap({
  currentChunk,
  onSelectChunk,
}: {
  currentChunk: { x: number; y: number };
  onSelectChunk: (chunk: { x: number; y: number }) => void;
}) {
  const cells = [];
  for (let dy = -GRID_RADIUS; dy <= GRID_RADIUS; dy++) {
    for (let dx = -GRID_RADIUS; dx <= GRID_RADIUS; dx++) {
      cells.push({ x: currentChunk.x + dx, y: currentChunk.y + dy, isCurrent: dx === 0 && dy === 0 });
    }
  }

  return (
    <div className="bg-pw-navy pixel-border p-3">
      <h3 className="pixel-font text-white text-[9px] mb-2">MINIMAP</h3>
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${GRID_RADIUS * 2 + 1}, 14px)` }}
        role="grid"
        aria-label="World minimap — click a chunk to jump to it"
      >
        {cells.map((cell) => (
          <button
            key={`${cell.x}_${cell.y}`}
            onClick={() => onSelectChunk({ x: cell.x, y: cell.y })}
            title={`Chunk (${cell.x}, ${cell.y})${cell.isCurrent ? " — current" : ""}`}
            aria-label={`Jump to chunk ${cell.x}, ${cell.y}`}
            className={`w-[14px] h-[14px] transition-colors ${
              cell.isCurrent ? "bg-pw-gold" : "bg-pw-forest hover:bg-pw-sky"
            }`}
          />
        ))}
      </div>
      <p className="text-[9px] text-pw-cream mt-2">Click a tile to jump there.</p>
    </div>
  );
}
