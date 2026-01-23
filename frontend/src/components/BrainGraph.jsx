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

    // Fallback data if empty - Ensure it is not just truthy but has content
    const hasData = graphData && graphData.nodes && graphData.nodes.length > 0;

    const myData = hasData ? graphData : {
        nodes: [
            { id: "You", group: "Self" },
            { id: "Mindwave", group: "AI" },
            { id: "Potential", group: "Concept" }
        ],
        links: [
            { source: "You", target: "Mindwave", label: "connected" },
            { source: "You", target: "Potential", label: "growing" }
        ]
    };

    return (
        <div className="absolute inset-0 z-0 bg-[#F5F2EA] pointer-events-auto flex items-center justify-center">
            {/* Debug Info */}
            {!hasData && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-uprock-orange/20 text-uprock-orange px-4 py-1 rounded-full text-xs backdrop-blur-md border border-uprock-orange/20">
                    Waiting for data... (Showing Demo View)
                </div>
            )}

            <ForceGraph3D
                ref={fgRef}
                graphData={myData}
                nodeAutoColorBy="group"
                nodeLabel="id"
                linkLabel="label"
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                backgroundColor="#F5F2EA"
                enableNodeDrag={true}
                nodeThreeObjectExtend={true}
                opacity={0.9}
                nodeColor={node => {
                    // Custom Warm Theme Colors
                    const colors = {
                        "Self": "#4A3728", // Deep Brown
                        "AI": "#E94E1B",   // Uprock Orange
                        "Concept": "#D4A373", // Tan
                        "Emotion": "#264653", // Dark Blue
                        "Person": "#E76F51", // Burnt Sienna
                        "Event": "#2A9D8F"   // Teal
                    };
                    return colors[node.group] || "#888888";
                }}
                linkColor={() => "#4A3728"} // Deep Brown Links
                linkWidth={1.5}
                linkOpacity={0.4}
                width={window.innerWidth * 0.9}
            />

            <div className="absolute top-4 left-4 text-deep-brown/50 text-xs font-mono bg-white/40 px-2 py-1 rounded">
                NEURAL CONSTELLATION v1.0
            </div>
        </div>
    );
};

export default BrainGraph;
