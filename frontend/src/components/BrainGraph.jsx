import React, { useRef, useEffect, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';

const BrainGraph = ({ graphData }) => {
    const fgRef = useRef();
    const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
    const containerRef = useRef(null);

    // Responsive sizing
    useEffect(() => {
        const updateDims = () => {
            if (containerRef.current) {
                setDimensions({
                    w: containerRef.current.clientWidth,
                    h: window.innerHeight * 0.85 // INCREASED: 85% of screen height
                });
            }
        };
        updateDims();
        window.addEventListener('resize', updateDims);
        return () => window.removeEventListener('resize', updateDims);
    }, []);

    // Initial camera orbit
    useEffect(() => {
        if (!graphData || graphData.nodes.length === 0) return;
        const fg = fgRef.current;
        fg.d3Force('charge').strength(-150);
        fg.d3Force('link').distance(70);
    }, [graphData]);

    // Fallback data
    const hasData = graphData && graphData.nodes && graphData.nodes.length > 0;
    const myData = hasData ? graphData : {
        nodes: [
            { id: "User", group: "Self" },
            { id: "Mindwave", group: "AI" },
            { id: "Growth", group: "Goal" },
            { id: "Coding", group: "Skill" }
        ],
        links: [
            { source: "User", target: "Mindwave", label: "uses" },
            { source: "User", target: "Growth", label: "seeks" },
            { source: "User", target: "Coding", label: "loves" }
        ]
    };

    return (
        <div ref={containerRef} className="w-full h-full min-h-[500px] relative bg-[#F5F2EA] rounded-3xl overflow-hidden border border-deep-brown/10 shadow-inner">

            {/* Legend / Title */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h3 className="text-deep-brown font-bold text-lg bg-white/50 px-3 py-1 rounded backdrop-blur-md inline-block">
                    Your Neural Constellation
                </h3>
                <p className="text-deep-brown/60 text-xs mt-1 bg-white/50 px-2 py-1 rounded max-w-[200px]">
                    Drag to rotate. Scroll to zoom. This map grows as you chat.
                </p>
            </div>

            <ForceGraph3D
                ref={fgRef}
                width={dimensions.w}
                height={dimensions.h}
                graphData={myData}
                nodeAutoColorBy="group"
                backgroundColor="#F5F2EA"

                // Visible Text Labels (IMPROVED LEGIBILITY)
                nodeThreeObject={node => {
                    const sprite = new SpriteText(node.id);
                    sprite.color = '#2D2118'; // Darker Brown for better contrast
                    sprite.textHeight = 12;    // INCREASED SIZE (was 6)
                    sprite.fontWeight = 'bold'; // Bold text
                    sprite.backgroundColor = 'rgba(255, 255, 255, 0.6)'; // Semi-transparent background
                    sprite.padding = 2;
                    sprite.borderRadius = 4;
                    return sprite;
                }}
                nodeThreeObjectExtend={true} // Add sphere + text

                // Link Styling
                linkLabel="label"
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                linkColor={() => "#4A3728"}
                linkWidth={1.5}
                linkOpacity={0.3}

                // Interaction
                enableNodeDrag={true}

                // Sphere styling (under text)
                nodeColor={node => {
                    const colors = {
                        "Self": "#4A3728",
                        "AI": "#E94E1B",
                        "Concept": "#D4A373",
                        "Goal": "#2A9D8F",
                        "Skill": "#264653"
                    };
                    return colors[node.group] || "#E76F51";
                }}
                nodeResolution={16}
            />
        </div>
    );
};

export default BrainGraph;
