import React, { useRef, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

const BrainGraph = ({ graphData }) => {
    const fgRef = useRef();

    useEffect(() => {
        // Add some sample data if empty to show *something* initially
        if (!graphData || graphData.nodes.length === 0) return;

        // Auto-orbit camera for valid effect
        const fg = fgRef.current;
        fg.d3Force('charge').strength(-120);
    }, [graphData]);

    const myData = graphData || {
        nodes: [
            { id: "Me", group: "Self" },
            { id: "Mindwave", group: "AI" }
        ],
        links: [
            { source: "Me", target: "Mindwave", label: "talks to" }
        ]
    };

    return (
        <div className="absolute inset-0 z-0 bg-gray-900 pointer-events-auto">
            <ForceGraph3D
                ref={fgRef}
                graphData={myData}
                nodeAutoColorBy="group"
                nodeLabel="id"
                linkLabel="label"
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                backgroundColor="#050510"
                enableNodeDrag={true}
                nodeThreeObjectExtend={true}
                opacity={0.9}
            />

            <div className="absolute top-4 left-4 text-white/50 text-xs font-mono">
                NEURAL CONSTELLATION v1.0
            </div>
        </div>
    );
};

export default BrainGraph;
