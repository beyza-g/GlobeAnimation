import { useEffect, useRef } from 'react';
import Globe from 'globe.gl';
import * as topojson from 'topojson-client';

function App() {
  const globeContainerRef = useRef(null); // Bu DOM elementi
  const globeInstanceRef = useRef(null); // Bu Globe.js nesnesi

  useEffect(() => {
    if (!globeInstanceRef.current && globeContainerRef.current) {
      const globe = Globe()(globeContainerRef.current); // 🟢 BU ÖNEMLİ

      globe
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .showAtmosphere(true)
        .atmosphereColor('#3a228a')
        .atmosphereAltitude(0.25)
        .polygonCapColor(() => 'rgba(200, 0, 0, 0.3)')
        .polygonSideColor(() => 'rgba(255, 255, 255, 0.05)')
        .polygonStrokeColor(() => '#111')
        .onPolygonHover((polygon) => {
          const countryName = polygon?.properties?.ADMIN;
          if (countryName) {
            globe.controls().autoRotate = false;
            globe.controls().enableZoom = true;
          }
        })
        .polygonLabel(({ properties: d }) => `
          <div style="color:white;">
            <b>${d.ADMIN}</b><br/>
            Pop-up içeriği burada
          </div>
        `);

      globeInstanceRef.current = globe;

      // Ülkeleri getir
      fetch('//unpkg.com/world-atlas@2.0.2/countries-110m.json')
        .then(res => res.json())
        .then(worldData => {
          const countries = topojson.feature(worldData, worldData.objects.countries).features;
          globe.polygonsData(countries);
        });
    }
  }, []);

  return (
    <div ref={globeContainerRef} style={{ width: '100vw', height: '100vh' }} />
  );
}

export default App;
