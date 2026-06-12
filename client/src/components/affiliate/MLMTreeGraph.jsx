import { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MLMTreeGraph = () => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await api.get('/affiliate/downline-tree');
        setTreeData(res.data);
      } catch (error) {
        toast.error('Failed to load downline tree');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (loading) return <div className="text-center py-10">Loading downline tree...</div>;
  if (!treeData) return <div className="text-center py-10">No downline members yet.</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 overflow-auto" style={{ height: '600px' }} ref={containerRef}>
      <h3 className="text-lg font-bold mb-4">Your MLM Network Tree</h3>
      <div style={{ width: '100%', height: 'calc(100% - 40px)', minHeight: '500px' }}>
        <Tree
          data={treeData}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: dimensions.width / 2, y: 80 }}
          nodeSize={{ x: 200, y: 120 }}
          separation={{ siblings: 1.2, nonSiblings: 1.5 }}
          renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
            <g>
              <circle r="20" fill="#6366f1" stroke="#4f46e5" strokeWidth="2" />
              <text
                x="25"
                y="5"
                fill="#333"
                fontSize="12"
                fontWeight="bold"
                dominantBaseline="middle"
              >
                {nodeDatum.name}
              </text>
              <text
                x="25"
                y="20"
                fill="#666"
                fontSize="10"
                dominantBaseline="middle"
              >
                {nodeDatum.attributes?.email?.split('@')[0] || ''}
              </text>
              {nodeDatum.attributes?.level && (
                <text
                  x="25"
                  y="35"
                  fill="#999"
                  fontSize="9"
                  dominantBaseline="middle"
                >
                  Level {nodeDatum.attributes.level}
                </text>
              )}
              {nodeDatum.children && nodeDatum.children.length > 0 && (
                <g
                  transform="translate(15, -25)"
                  onClick={toggleNode}
                  style={{ cursor: 'pointer' }}
                >
                  <circle r="12" fill="white" stroke="#6366f1" strokeWidth="1.5" />
                  <text
                    textAnchor="middle"
                    y="4"
                    fontSize="12"
                    fill="#6366f1"
                    fontWeight="bold"
                  >
                    {nodeDatum.__rd3t.collapsed ? '+' : '-'}
                  </text>
                </g>
              )}
            </g>
          )}
        />
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">Click + / - to expand/collapse branches.</p>
    </div>
  );
};

export default MLMTreeGraph;