import { useEffect, useRef } from 'react';
import Globe from 'globe.gl';
import * as topojson from 'topojson-client';
import * as d3Geo from 'd3-geo';

function centroid(feature) {
  const [lon, lat] = d3Geo.geoCentroid(feature);
  return [lon, lat];
}


function App() {
  const globeContainerRef = useRef(null);
  const globeInstanceRef = useRef(null); 

  const allowedCountries = ['Germany', 'United Kingdom', 'Italy'];
  
  useEffect(() => {
    if (!globeInstanceRef.current && globeContainerRef.current) {
      const globe = Globe()(globeContainerRef.current);
  
      globe
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .showAtmosphere(true)
        .atmosphereColor('#3a228a')
        .atmosphereAltitude(0.25)
        .polygonCapColor(d =>
          allowedCountries.includes(d.properties.name)
            ? 'rgba(200, 0, 0, 0.3)'
            : 'rgba(0,0,0,0)'
        )
        .polygonSideColor(() => 'rgba(255, 255, 255, 0.05)')
        .polygonStrokeColor(() => '#111')
        .polygonLabel(({ properties }) => {
          if (allowedCountries.includes(properties.name)) {
            return `
              <div style="color:white; padding: 2px; height: 50px; font-size: 14px">
                <b>Donations for ${properties.name}</b><br/><br/>
                POPUP CONTENT
              </div>
            `;
          }
          return null;
        });
  
      globeInstanceRef.current = globe;
  
      fetch('//unpkg.com/world-atlas@2.0.2/countries-110m.json')
        .then(res => res.json())
        .then(worldData => {
          const countries = topojson.feature(worldData, worldData.objects.countries).features;
          globe.polygonsData(countries);
  
          // Pin koordinatları için ülkelerin merkez noktalarını hesapla
          const pins = countries
            .filter(d => allowedCountries.includes(d.properties.name))
            .map(d => {
              const [lon, lat] = centroid(d); // merkez koordinat
              return {
                lat,
                lng: lon,
                size: 0.025,
                color: 'red',
                name: d.properties.name
              };
            });
  
          globe
            .pointsData(pins)
            .pointAltitude('size')
            .pointColor('color')
            // label will be the same with donations
            .pointLabel(d => `<div  style="color:white; padding: 2px; height: 50px; font-size: 14px">
                <b>Donations for ${d.name}</b><br/><br/>
                POPUP CONTENT
                </div>`);
        });
    }
  }, []);
  

  return (
    <div ref={globeContainerRef} style={{ width: '100vw', height: '100vh' }} />
  );
}

export default App;
