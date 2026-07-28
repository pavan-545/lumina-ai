import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

export function KnowledgeGraph({ graphData = {} }) {
  const { nodes = [], edges = [] } = graphData;

  // Process nodes and compute layout positions programmatically
  const processedNodes = useMemo(() => {
    if (nodes.length === 0) return [];

    // Group nodes by category to create a column layout
    const categories = [...new Set(nodes.map(n => n.category || 'General'))];
    const categoryColumns = {};
    categories.forEach((cat, index) => {
      categoryColumns[cat] = index;
    });

    // Track rows per column to offset y position
    const rowCounters = {};
    categories.forEach(cat => {
      rowCounters[cat] = 0;
    });

    return nodes.map((node) => {
      const category = node.category || 'General';
      const colIndex = categoryColumns[category];
      const rowIndex = rowCounters[category];
      
      // Increment row count for this column
      rowCounters[category]++;

      // Calculate position
      // Column width: 260px, Row height: 110px
      const x = colIndex * 280 + 50;
      const y = rowIndex * 120 + 80;

      return {
        id: node.id,
        position: { x, y },
        data: { 
          label: (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                {category}
              </div>
              <div style={{ fontWeight: '500', marginTop: '4px', fontSize: '13px' }}>
                {node.label}
              </div>
            </div>
          )
        },
        style: {
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '10px',
          width: '180px',
          boxShadow: 'var(--shadow-sm)',
        }
      };
    });
  }, [nodes]);

  // Process edges
  const processedEdges = useMemo(() => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      style: { stroke: 'var(--accent-emerald)', strokeWidth: 1.5 },
      labelStyle: { fill: 'var(--text-secondary)', fontSize: '10px', fontFamily: 'var(--font-sans)', fontWeight: 500 },
      labelBgStyle: { fill: 'var(--bg-surface)', fillOpacity: 0.8 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
    }));
  }, [edges]);

  if (nodes.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '60px 24px' }}>
        <p>No conceptual relationship mapping available. Generate new study materials to visualize.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '550px', padding: '16px' }}>
      <div>
        <h3 style={{ fontSize: '18px' }}>Concept Connection Network</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Trace how technical subjects interrelate. Drag the nodes to rearrange or scroll to zoom.
        </p>
      </div>

      <div style={{ flex: 1, position: 'relative', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <ReactFlow
          nodes={processedNodes}
          edges={processedEdges}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#27272a" gap={16} size={1} />
          <Controls />
          <MiniMap 
            nodeColor={() => 'var(--bg-surface-hover)'} 
            maskColor="rgba(0,0,0,0.4)" 
            style={{ 
              backgroundColor: 'var(--bg-surface)', 
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }} 
          />
        </ReactFlow>
      </div>
    </div>
  );
}
export default KnowledgeGraph;
