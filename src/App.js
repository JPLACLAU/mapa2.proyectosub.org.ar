import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Map, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./assets/stylesheets/App.css";
import "leaflet-sidebar/src/L.Control.Sidebar.css";
import "leaflet-sidebar";

import Layout from "./components/Layout";

import locations from "./data/locations";
import utensilsIcon from "./assets/shared/mapa2rojopsub.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;
const MAPBOX_USERID = process.env.REACT_APP_MAPBOX_USERID;
const MAPBOX_STYLEID = process.env.REACT_APP_MAPBOX_STYLEID;

function App() {
  const mapRef = useRef();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });
  }, []);

  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;

    if (!map) return;

    let sidebar = L.control.sidebar("sidebar").addTo(map);

    map.eachLayer((layer = {}) => {
      const { options } = layer;
      const { name } = options;

      if (name !== "Mapbox") {
        map.removeLayer(layer);
      }
    });

    const geoJson = new L.GeoJSON(locations, {
      pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
          icon: new L.Icon({
            iconUrl: utensilsIcon,
            iconSize: [26, 26],
            popupAnchor: [0, -15],
            shadowUrl: markerShadow,
            shadowAnchor: [13, 28],
          }),
        });
      },
      onEachFeature: (feature = {}, layer) => {
        const { properties = {}, geometry = {} } = feature;
        const {
          id,
          fecha,
          org,
          name,
          tipoSitio,
          voluntarios,
          latitud,
          longitud,
          presenciamp,
          mpprimarios,
          mpsecundarios,
          mpmesoplasticos,
          deliveryRadius,
        } = properties;
        const { coordinates } = geometry;

        let deliveryZoneCircle;

        if (deliveryRadius) {
          deliveryZoneCircle = L.circle(coordinates.reverse(), {
            radius: deliveryRadius,
            color: "deeppurple",
          });
        }

        const popup = L.popup();

        const html = `
          <div class="restaurant-popup">
            <h4>${name}</h4> 
            <ul>
              <h5>
              <li>
              <strong>Fecha:</strong> ${fecha}
              </li>
              <li>
              <strong>Id: </strong>${id} 
              </li>
              <li>
              <ul>
              Latitud: ${latitud}
                <ul>
              Longitud: ${longitud}
            </li>
              </h5>
              
              


            </ul>
          </div>
        `;

        popup.setContent(html);

        layer.bindPopup(popup);

        layer.on("mouseover", () => {
          if (deliveryZoneCircle) {
            deliveryZoneCircle.addTo(map);
          }
        });

        layer.on("mouseout", () => {
          if (deliveryZoneCircle) {
            deliveryZoneCircle.removeFrom(map);
          }
        });
        layer.on("click", () => {
          setSelectedPlace(name);
          sidebar.toggle();

          setSelectedData({
            presenciamp,
            mpprimarios,
            mpsecundarios,
            mpmesoplasticos,
            org,
            voluntarios,
            tipoSitio,
            name,
          });
        });
      },
    });

    geoJson.addTo(map);
  }, [mapRef]);

  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;

    if (!map) return;
  }, [mapRef]);

  return (
    <Layout>
      <div className="search-actions"></div>
      <Map ref={mapRef} center={[-45.0, -65.0]} zoom={5}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />
      </Map>
      <div id="sidebar">
        <h3>Datos de Muestreo de Microplásticos en Patagonia</h3>
        <div className="sidebar-content">
          {selectedData && (
            <>
              <h4>{selectedData.name}</h4>
              <strong>
                {selectedData.presenciamp
                  ? "HAY MICROPLÁSTICOS"
                  : "No hay microplásticos"}
              </strong>
              <li>
                <strong>{selectedData.mpprimarios}</strong> microplásticos
                primarios
              </li>
              <li>
                <strong>{selectedData.mpsecundarios}</strong> microplásticos
                secundarios
              </li>
              <li>
                <strong>{selectedData.mpmesoplasticos}</strong> mesoplásticos
              </li>
              <ul />
              Organizado por <strong>{selectedData.org}</strong> con
              <strong>{selectedData.voluntarios}</strong> voluntarios.
              <ul /> El sitio se caracteriza por ser de{" "}
              <strong>{selectedData.tipoSitio}</strong>.
            </>
          )}
        </div>
        <div className="sidebar-footer">
          <h5>Más datos próximamente...</h5>
        </div>
      </div>
      {selectedPlace && (
        <div className="info-box">
          <button onClick={() => setSelectedPlace(null)}>Close</button>
          <h1>{selectedPlace}</h1>
        </div>
      )}
    </Layout>
  );
}

export default App;
