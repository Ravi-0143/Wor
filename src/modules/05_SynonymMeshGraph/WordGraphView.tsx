import React, { useState, useEffect, useRef } from 'react';
import { WordEntry } from '../../types';
import { Network, ZoomIn, ZoomOut, RefreshCw, MousePointer2 } from 'lucide-react';

interface WordGraphViewProps {
  words: WordEntry[];
  onSelectWord: (word: WordEntry) => void;
}

interface Node {
  id: string;
  label: string;
  category: string;
  stars: number;
  wordObj: WordEntry;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
}

interface Link {
  source: Node;
  target: Node;
  type: 'synonym' | 'category' | 'exam';
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export const WordGraphView: React.FC<WordGraphViewProps> = ({ words, onSelectWord }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // React State for UI
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Mutable Physics & Rendering State (Kept out of React state for high performance)
  const engine = useRef({
    nodes: [] as Node[],
    links: [] as Link[],
    transform: { x: 0, y: 0, scale: 1 } as Transform,
    isDragging: false,
    draggedNode: null as Node | null,
    hoveredNode: null as Node | null,
    width: 800,
    height: 600,
    pointer: { x: 0, y: 0, startX: 0, startY: 0 },
    energy: 1.0 // Cooling factor for the physics simulation
  });

  // 1. Initialize Graph Data & Physics Parameters
  useEffect(() => {
    if (!words || words.length === 0) return;
    const sampledWords = words.slice(0, 50);
    const { width, height } = engine.current;

    // Seed nodes in a cluster near the center
    const newNodes: Node[] = sampledWords.map(w => ({
      id: w.id,
      label: w.word,
      category: w.category,
      stars: w.stars,
      wordObj: w,
      x: (width / 2) + (Math.random() - 0.5) * 200,
      y: (height / 2) + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
      radius: 6 + (w.stars || 1) * 2,
      mass: 1 + (w.stars || 1) * 0.5
    }));

    const newLinks: Link[] = [];
    sampledWords.forEach(w1 => {
      sampledWords.forEach(w2 => {
        if (w1.id !== w2.id) {
          const w1Syns = [...w1.coreSynonyms, ...w1.advancedSynonyms].map(s => s.toLowerCase());
          if (w1Syns.includes(w2.word.toLowerCase())) {
            const sourceNode = newNodes.find(n => n.id === w1.id);
            const targetNode = newNodes.find(n => n.id === w2.id);
            if (sourceNode && targetNode) {
              const exists = newLinks.some(l => 
                (l.source.id === sourceNode.id && l.target.id === targetNode.id) ||
                (l.source.id === targetNode.id && l.target.id === sourceNode.id)
              );
              if (!exists) {
                newLinks.push({ source: sourceNode, target: targetNode, type: 'synonym' });
              }
            }
          }
        }
      });
    });

    engine.current.nodes = newNodes;
    engine.current.links = newLinks;
    engine.current.energy = 1.0;
  }, [words]);

  // 2. Physics Simulation & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const state = engine.current;

    const applyPhysics = () => {
      if (state.energy < 0.01 && !state.draggedNode) return;

      const REPULSION = 2000;
      const SPRING_LENGTH = 80;
      const SPRING_STIFFNESS = 0.05;
      const DAMPING = 0.85;

      // Repulsion (N-Body)
      for (let i = 0; i < state.nodes.length; i++) {
        for (let j = i + 1; j < state.nodes.length; j++) {
          const n1 = state.nodes[i];
          const n2 = state.nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          let distSq = dx * dx + dy * dy;
          if (distSq === 0) distSq = 0.01;

          if (distSq < 40000) {
            const force = REPULSION / distSq;
            const fx = (dx / Math.sqrt(distSq)) * force;
            const fy = (dy / Math.sqrt(distSq)) * force;
            
            n1.vx -= fx / n1.mass;
            n1.vy -= fy / n1.mass;
            n2.vx += fx / n2.mass;
            n2.vy += fy / n2.mass;
          }
        }
      }

      // Attraction (Springs)
      state.links.forEach(link => {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const force = (dist - SPRING_LENGTH) * SPRING_STIFFNESS;
        
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        link.source.vx += fx / link.source.mass;
        link.source.vy += fy / link.source.mass;
        link.target.vx -= fx / link.target.mass;
        link.target.vy -= fy / link.target.mass;
      });

      // Centering Gravity & Velocity Integration
      const centerX = state.width / 2;
      const centerY = state.height / 2;

      state.nodes.forEach(node => {
        node.vx += (centerX - node.x) * 0.001;
        node.vy += (centerY - node.y) * 0.001;

        if (node === state.draggedNode) {
          node.vx = 0;
          node.vy = 0;
        } else {
          node.x += node.vx * state.energy;
          node.y += node.vy * state.energy;
          node.vx *= DAMPING;
          node.vy *= DAMPING;
        }
      });

      state.energy *= 0.98;
    };

    const render = () => {
      applyPhysics();

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, state.width, state.height);
      
      // Apply View Transform (Pan/Zoom)
      ctx.translate(state.transform.x, state.transform.y);
      ctx.scale(state.transform.scale, state.transform.scale);

      // Draw Links
      state.links.forEach(link => {
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.strokeStyle = link.type === 'synonym' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(203, 213, 225, 0.4)';
        ctx.lineWidth = 1.5 / state.transform.scale;
        ctx.stroke();
      });

      // Draw Nodes
      state.nodes.forEach(node => {
        const isSelected = selectedNodeId === node.id;
        const isHovered = state.hoveredNode?.id === node.id;
        const isActive = isSelected || isHovered;

        // Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, isActive ? node.radius + 2 : node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#4f46e5' : isHovered ? '#818cf8' : '#e0e7ff';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#312e81' : isHovered ? '#4f46e5' : '#818cf8';
        ctx.lineWidth = isActive ? 3 / state.transform.scale : 1.5 / state.transform.scale;
        ctx.stroke();

        // Node Label
        if (state.transform.scale > 0.6 || isActive) {
          ctx.font = `${isActive ? 'bold' : 'normal'} ${12 / state.transform.scale}px Inter, sans-serif`;
          ctx.fillStyle = isActive ? '#0f172a' : '#475569';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          const metrics = ctx.measureText(node.label);
          const textHeight = 14 / state.transform.scale;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillRect(
            node.x - metrics.width / 2 - 2, 
            node.y + node.radius + 4, 
            metrics.width + 4, 
            textHeight
          );
          
          ctx.fillStyle = isActive ? '#0f172a' : '#475569';
          ctx.fillText(node.label, node.x, node.y + node.radius + 6);
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedNodeId]);

  // 3. Responsive Canvas Resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const dpr = window.devicePixelRatio || 1;
        
        canvasRef.current.width = clientWidth * dpr;
        canvasRef.current.height = clientHeight * dpr;
        canvasRef.current.style.width = `${clientWidth}px`;
        canvasRef.current.style.height = `${clientHeight}px`;

        engine.current.width = clientWidth;
        engine.current.height = clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 4. Advanced Interaction Handlers (Pan, Zoom, Drag)
  const getPointerWorldCoord = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { transform } = engine.current;
    return {
      worldX: (x - transform.x) / transform.scale,
      worldY: (y - transform.y) / transform.scale,
      screenX: x,
      screenY: y
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { worldX, worldY, screenX, screenY } = getPointerWorldCoord(e);
    
    const clickedNode = engine.current.nodes.find(n => {
      const dist = Math.hypot(n.x - worldX, n.y - worldY);
      return dist <= n.radius + 5;
    });

    engine.current.isDragging = true;
    engine.current.pointer.startX = screenX;
    engine.current.pointer.startY = screenY;

    if (clickedNode) {
      engine.current.draggedNode = clickedNode;
      engine.current.energy = 0.5;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { worldX, worldY, screenX, screenY } = getPointerWorldCoord(e);
    
    if (engine.current.isDragging) {
      if (engine.current.draggedNode) {
        engine.current.draggedNode.x = worldX;
        engine.current.draggedNode.y = worldY;
      } else {
        const dx = screenX - engine.current.pointer.startX;
        const dy = screenY - engine.current.pointer.startY;
        engine.current.transform.x += dx;
        engine.current.transform.y += dy;
        engine.current.pointer.startX = screenX;
        engine.current.pointer.startY = screenY;
      }
    } else {
      const hovered = engine.current.nodes.find(n => {
        return Math.hypot(n.x - worldX, n.y - worldY) <= n.radius + 5;
      });
      if (engine.current.hoveredNode !== hovered) {
        engine.current.hoveredNode = hovered || null;
        if (hovered && engine.current.energy < 0.05) engine.current.energy = 0.1; 
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const dragDistance = Math.hypot(
      engine.current.pointer.startX - getPointerWorldCoord(e).screenX,
      engine.current.pointer.startY - getPointerWorldCoord(e).screenY
    );

    if (engine.current.draggedNode && dragDistance < 5) {
      setSelectedNodeId(engine.current.draggedNode.id);
      onSelectWord(engine.current.draggedNode.wordObj);
    }

    engine.current.isDragging = false;
    engine.current.draggedNode = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSensitivity = 0.001;
    const delta = e.deltaY * -zoomSensitivity;
    const newScale = Math.min(Math.max(0.2, engine.current.transform.scale * (1 + delta)), 4);
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    engine.current.transform.x = x - (x - engine.current.transform.x) * (newScale / engine.current.transform.scale);
    engine.current.transform.y = y - (y - engine.current.transform.y) * (newScale / engine.current.transform.scale);
    engine.current.transform.scale = newScale;
  };

  const handleZoom = (direction: 1 | -1) => {
    engine.current.transform.scale = Math.min(Math.max(0.2, engine.current.transform.scale + direction * 0.2), 4);
  };

  const handleReset = () => {
    engine.current.transform = { x: 0, y: 0, scale: 1 };
    engine.current.energy = 1.0;
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-4 h-full flex flex-col min-h-[700px]">
      
      {/* Control Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">Synonym Knowledge Graph</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Force-directed simulation mapping spatial connections across lexical entries.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <button onClick={() => handleZoom(1)} className="p-2 hover:bg-white rounded-md text-slate-600 hover:text-indigo-600 hover:shadow-sm transition-all" title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => handleZoom(-1)} className="p-2 hover:bg-white rounded-md text-slate-600 hover:text-indigo-600 hover:shadow-sm transition-all" title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1"></div>
          <button onClick={handleReset} className="p-2 hover:bg-white rounded-md text-slate-600 hover:text-indigo-600 hover:shadow-sm transition-all" title="Reset Simulation">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Physics Canvas Engine */}
      <div 
        ref={containerRef}
        className="relative flex-1 rounded-2xl border border-slate-200 bg-slate-50 shadow-inner overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs text-slate-400 font-medium pointer-events-none">
          <MousePointer2 className="h-3 w-3" /> Scroll to zoom, drag to pan
        </div>

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          className="block w-full h-full touch-none"
        />
      </div>
    </div>
  );
};
