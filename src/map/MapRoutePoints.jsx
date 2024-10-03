import React, {
  useId, useCallback, useEffect, useState,
} from 'react';
import { map } from './core/MapView';
import getSpeedColor from '../common/util/colors';
import MapColorScale from './MapColorScale';

const MapRoutePoints = ({ positions, onClick }) => {
  const id = useId();
  const [minSpeed, setMinSpeed] = useState(null);
  const [maxSpeed, setMaxSpeed] = useState(null);

  const onMouseEnter = () => (map.getCanvas().style.cursor = 'pointer');
  const onMouseLeave = () => (map.getCanvas().style.cursor = '');

  const onMarkerClick = useCallback(
    (event) => {
      event.preventDefault();
      const feature = event.features[0];
      if (onClick) {
        onClick(feature.properties.id, feature.properties.index);
      }
    },
    [onClick],
  );

  useEffect(() => {
    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
    map.addLayer({
      id,
      type: 'symbol',
      source: id,
      paint: {
        'text-color': ['get', 'color'],
      },
      layout: {
        'text-field': '▲',
        'text-allow-overlap': true,
        'text-rotate': ['get', 'rotation'],
      },
    });

    map.on('mouseenter', id, onMouseEnter);
    map.on('mouseleave', id, onMouseLeave);
    map.on('click', id, onMarkerClick);

    return () => {
      map.off('mouseenter', id, onMouseEnter);
      map.off('mouseleave', id, onMouseLeave);
      map.off('click', id, onMarkerClick);

      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, [onMarkerClick]);

  useEffect(() => {
    if (positions.length > 0) {
      const speeds = positions.map((p) => p.speed);
      const maxSpeedValue = Math.max(...speeds);
      const minSpeedValue = Math.min(...speeds);

      setMaxSpeed(maxSpeedValue);
      setMinSpeed(minSpeedValue);

      map.getSource(id)?.setData({
        type: 'FeatureCollection',
        features: positions.map((position, index) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [position.longitude, position.latitude],
          },
          properties: {
            index,
            id: position.id,
            rotation: position.course,
            color: getSpeedColor(position.speed, maxSpeedValue),
          },
        })),
      });
    }
  }, [onMarkerClick, positions]);

  if (positions.length > 0 && minSpeed !== null && maxSpeed !== null) {
    return <MapColorScale minSpeed={minSpeed} maxSpeed={maxSpeed} />;
  }

  return null;
};

export default MapRoutePoints;
