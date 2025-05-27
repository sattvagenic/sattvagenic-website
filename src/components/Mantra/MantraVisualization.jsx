import React from 'react'
import SanskritTorus from './SanskritTorus'

const MantraVisualization = () => {
  return (
    <div style={{ backgroundColor: 'black', minHeight: '100vh' }}>
      <div className="text-center py-8" style={{ color: '#4FD4C6' }}>
        <h1 className="text-4xl mb-2" style={{ color: '#FF9B4F', fontFamily: 'Iceland' }}>
          Mrityunjaya MantraRoopa
        </h1>
        <p style={{ fontFamily: 'Orbitron' }}>Mantric Super-structure for protection and illumination</p>
      </div>

      <div className="container mx-auto px-4">
        <div style={{ backgroundColor: 'black', border: '1px solid #333' }}>
          <SanskritTorus />
          
          <div className="p-6" style={{ borderTop: '1px solid #333' }}>
            <h2 className="text-xl mb-4" style={{ color: '#FF9B4F', fontFamily: 'Iceland' }}>
              
            </h2>
            <div className="grid gap-4" style={{ color: '#4FD4C6' }}>
              <p style={{ fontFamily: 'Orbitron' }}>
                <div className="grid gap-4" style={{ color: '#4FD4C6', fontFamily: 'Orbitron' }}>
  <p>Digitally manifesting as Hiranyagarbha, the heart of which is Om, the seed of all mantras - encoding cosmic genesis through sacred algorithms</p>
  
  <p>54 mantric pathways mirrored for 108 repetitions - representing the pulsing nadis of the spandafield</p>
  
  <p>Each cycle compounds the protective field through recursive sacred patterns, building a firewall of shakti</p>
</div>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MantraVisualization