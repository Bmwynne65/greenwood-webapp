import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import axios from "axios";
import "./MapWithMarkers.css";
import { useNavigate } from "react-router-dom";

const containerStyle = {
  width: "100%",
  height: "90vh",
};

const MapWithMarkers = () => {
  const [locations, setLocations] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 39.594651,
    lng: -104.882647,
  });
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const navigate = useNavigate(); // React Router navigation

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (isLoaded) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      axios
        .get(`${process.env.REACT_APP_URI}/buildings`)
        .then((response) => {
          const fetchLocations = async () => {
            const geocodedLocations = await Promise.all(
              response.data.map(async (item) => {
                const geocode = await geocodeAddress(item.address);
                return {
                  ...item,
                  img: item.imageBlob || "",
                  position: geocode,
                };
              })
            );
            setLocations(geocodedLocations);
          };
          fetchLocations().catch(err =>
            console.error("Error geocoding locations:", err)
          );
        })
        .catch((error) => {
          console.error("There was an error fetching the data!", error);
        });
    }
  }, [isLoaded]);

  const geocodeAddress = (address) => {
    return new Promise((resolve, reject) => {
      if (geocoderRef.current) {
        geocoderRef.current.geocode({ address: address }, (results, status) => {
          if (status === "OK") {
            resolve(results[0].geometry.location);
          } else {
            console.error("Geocode failed: " + status);
            reject(null);
          }
        });
      } else {
        reject("Geocoder not initialized");
      }
    });
  };

  const handleMarkerClick = (index, position) => {
  if (mapRef.current && position) {
    // 1) center on the marker…
    mapRef.current.panTo(position);

    // 2) then shift the map up by X pixels so the marker sits
    //    at “bottom center” instead of dead‐center.
    const mapDiv = mapRef.current.getDiv();
    // here we choose to shift by 25% of the map’s height;
    // you can tweak this fraction or use a fixed px value.
    const offsetY = mapDiv.clientHeight * 0.25;
    // panBy(x, y): positive y pans south (content moves up),
    // so to move the marker down, we pass a negative offset.
    mapRef.current.panBy(0, -offsetY);
  }

  // then toggle your InfoWindow as before…
  if (activeMarker !== null) {
    setActiveMarker(null);
    setTimeout(() => setActiveMarker(index), 200);
  } else {
    setActiveMarker(index);
  }
};


  const getMarkerIcon = (submarket) => {
    let iconUrl;
    switch (submarket) {
      case "DTC":
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        break;
      case "Centennial":
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
        break;
      case "Greenwood Village":
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
        break;
      case "Meridian":
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
        break;
      case "Centennial":
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
        break;
      case "Inverness":
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
        break;
      default:
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/black-dot.png";
    }
    return {
      url: iconUrl,
      scaledSize: new window.google.maps.Size(32, 32),
    };
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={13}
      onClick={() => setActiveMarker(null)}
      onLoad={map => (mapRef.current = map)}
    >
      {locations.map((location, index) =>
        location.position ? (
          <Marker
            key={index}
            position={location.position}
            title={location.address}
            onClick={() => handleMarkerClick(index, location.position)}
            icon={getMarkerIcon(location.subMarket)}
          >
            {activeMarker === index && (
              <InfoWindow
                options={{ disableAutoPan: true }}
                onCloseClick={() => setActiveMarker(null)}
              >
                <section className="articles">
                  <article className="art">
                    <div className="article-wrapper">
                      <figure className="fig">
                        <img
                          src={location.img}
                          alt={"Picture of " + location.address}
                        />
                      </figure>
                      <div className="article-body">
                        <h2>{location.address}</h2>
                        <p><strong>Year of Construction:</strong> {location.yoc || "N/A"}</p>
                        <p><strong>Current Owner:</strong> {location.currentOwner || "N/A"}</p>
                        <p><strong>Lease Rate:</strong> {location.leaseRate ? `$${location.leaseRate}/SF` : "N/A"}</p>
                        <p><strong>Vacancy Rate:</strong> {location.vacancyRate ? `${location.vacancyRate}%` : "N/A"}</p>
                        <p><strong>RSF:</strong> {location.rsf ? `${location.rsf}/SF` : "N/A"}</p>
                        <p>
                          <strong>Last Sold For:</strong>{" "}
                          {location.lsf ? (
                            <>
                              ${Number(location.lsf).toLocaleString()} – {location.on}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </p>
                        <button
                          className="read-more"
                          onClick={() => navigate(`/buildingSummary/${location._id}`)}
                        >
                          Read more
                          <span className="sr-only">{location.address}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                </section>
              </InfoWindow>
            )}
          </Marker>
        ) : null
      )}
    </GoogleMap>
  ) : null;
};

export default MapWithMarkers;
