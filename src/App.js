import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl/dist/mapbox-gl";
import { data } from "./data";
import "./App.css";

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_TOKEN}`;
const LNG = "-122.448161557232595";
//-122.448161557232595 CL
const LAT = "37.675936104929932";
//37.675936104929932 CL
const ZOOM = 14;

function Map() {
  const mapContainer = useRef();
  const [lng, setLng] = useState(LNG);
  const [lat, setLat] = useState(LAT);
  const [zoom, setZoom] = useState(ZOOM);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: `${process.env.REACT_APP_MAPBOX_SATELLITE}`,
      center: [lng, lat],
      zoom: zoom,
    });

    map.on("move", () => {
      setLng(map.getCenter().lng.toFixed(16));
      setLat(map.getCenter().lat.toFixed(16));
      setZoom(map.getZoom().toFixed(0));
    });

    map.on("load", () => {
      data.map((e, index) =>
        map.addSource(`${data[index].name}`, {
          type: "geojson",
          data: data[index].geo_json,
        })
      );

      data.map((e, index) =>
        map.addLayer({
          id: `${data[index].name}`,
          type: "line",
          source: `${data[index].name}`,
          layout: {},
          paint: {
            "line-color": "#ff0000",
            "line-width": 3,
          },
        })
      );

      data.map((e, index) =>
        map.addLayer({
          id: `${data[index].name}-fill`,
          type: "fill",
          source: `${data[index].name}`,
          layout: {},
          paint: {
            "fill-color": "#088",
            "fill-opacity": 0.35,
            "fill-outline-color": "#3e9194",
          },
        })
      );

      map.addSource("labels", {
        type: "geojson",
        data: {
          type: "FeatureCollection",

          features: data.map((e, index) => {
            return {
              type: "Feature",
              properties: {
                description: data[index].name,
              },
              geometry: {
                type: "Point",
                coordinates:
                  data[index]?.geo_json?.geometry?.coordinates[0][0][0],
              },
            };
          }),
        },
      });

      map.addLayer({
        id: "poi-labels",
        type: "symbol",
        source: "labels",
        layout: {
          "text-field": ["get", "description"],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": 0.5,
          "text-justify": "auto",
        },
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div className="map-container" ref={mapContainer} />
    </div>
  );
}

export default Map;
