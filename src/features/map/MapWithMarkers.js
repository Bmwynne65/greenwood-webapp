import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import axios from "axios";
import "./MapWithMarkers.css";
import { TbBackground } from "react-icons/tb";

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
                  position: geocode,
                };
              })
            );
            setLocations(geocodedLocations);
          };
          fetchLocations();
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

  const handleMarkerClick = (index) => {
    // Close the current InfoWindow, wait briefly, then open the new one
    if (activeMarker !== null) {
      setActiveMarker(null);
      setTimeout(() => setActiveMarker(index), 200); // Adding a small delay
    } else {
      setActiveMarker(index);
    }
  };

  const handleMapClick = () => {
    setActiveMarker(null); // Close InfoWindow on map click
  };

  // Handle double-click to navigate to the building link
  const handleClick = (link) => {
    window.open(link, "_blank"); // Open in a new tab
  };


  //Google pins color based on SubMarket location
  const getMarkerIcon = (submarket) => {
    let iconUrl;
    // console.log("Sub-Market: ", submarket);
    switch (submarket) {
      case "DTC":
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        break;
      case "Centennial":
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
        break;
      case "Submarket C":
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
        break;
      default:
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"; // Fallback color
    }
    return {
      url: iconUrl,
      scaledSize: new window.google.maps.Size(32, 32), // Adjust size if needed
    };
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={13}
      onClick={handleMapClick} // Close InfoWindow when clicking on the map
    >
      {locations.map(
        (location, index) =>
          location.position && (
            <Marker
              key={index}
              position={location.position}
              title={location.address}
              onClick={() => handleMarkerClick(index)} // Handle Marker click
              icon={getMarkerIcon(location.subMarket)}
            >
              {activeMarker === index && location.address && (
                <InfoWindow
                  options={{ disableAutoPan: true }}
                  onCloseClick={() => setActiveMarker(null)} // Close InfoWindow
                >
                  <section className="articles">
                    <article className="art">
                      <div className="article-wrapper">
                        <figure className="fig">
                          <img
                            src={location.imageBlob}
                            alt={"Picture of " + location.address}
                          />
                        </figure>
                        <div className="article-body">
                          <h2>{location.address}</h2>
                          <p>
                            <strong>Year of Construction:</strong>{" "}
                            {location.yoc ? location.yoc : "N/A"}
                          </p>
                          <p>
                            <strong>Current Owner:</strong>{" "}
                            {location.currentOwner
                              ? location.currentOwner
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Lease Rate:</strong>{" "}
                            {location.leaseRate ? "$" + location.leaseRate + "/SF" : "N/A"}
                          </p>
                          <p>
                            <strong>Vacancy Rate:</strong>{" "}
                            {location.vacancyRate
                              ? location.vacancyRate + "%"
                              : "N/A"}
                          </p>
                          <p>
                            <strong>RSF:</strong>{" "}
                            {location.rsf
                              ? location.rsf + "/SF"
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Last Sold For:</strong>
                            {location.lsf
                              ? " $" + location.lsf + " - " + location.on
                              : " N/A"}
                          </p>
                          <a
                            href="#"
                            className="read-more"
                            onClick={() =>
                              handleClick(location.link)
                            }
                          >
                            Read more{" "}
                            <span className="sr-only">{location.address}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="icon"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </article>
                  </section>
                </InfoWindow>
              )}
            </Marker>
          )
      )}
    </GoogleMap>
  ) : (
    <></>
  );
};

export default MapWithMarkers;
