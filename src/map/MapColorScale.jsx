import React, { useRef, useEffect, useState } from 'react';
import { useAttributePreference } from '../common/util/preferences';
import getSpeedColor from '../common/util/colors';
import { useTranslation } from '../common/components/LocalizationProvider';
import { speedFromKnots, speedUnitString } from '../common/util/converter';
import { map } from './core/MapView';

const MapColorScale = ({ minSpeed, maxSpeed }) => {
  const [width, setWidth] = useState(100);
  const [position, setPosition] = useState({ bottom: 40, left: 10 });
  const scaleRef = useRef(null);
  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const distanceUnit = useAttributePreference('distanceUnit');
  const t = useTranslation();

  useEffect(() => {
    let resizeObserver;
    let mapLibreScaleElement;

    const updatePosition = () => {
      if (mapLibreScaleElement && scaleRef.current) {
        const mapLibreRect = mapLibreScaleElement.getBoundingClientRect();
        setPosition({
          bottom: window.innerHeight - mapLibreRect.top + 10,
          left: mapLibreRect.left,
        });
        setWidth(mapLibreRect.width);
      }
    };

    const checkForScale = setInterval(() => {
      mapLibreScaleElement = map.getContainer().querySelector('.maplibregl-ctrl.maplibregl-ctrl-scale');
      if (mapLibreScaleElement) {
        clearInterval(checkForScale);

        resizeObserver = new ResizeObserver(updatePosition);
        resizeObserver.observe(mapLibreScaleElement);
        resizeObserver.observe(scaleRef.current);

        updatePosition();
        map.on('move', updatePosition);
      }
    }, 100);

    return () => {
      clearInterval(checkForScale);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.off('move', updatePosition);
    };
  }, []);

  useEffect(() => {
    const mapLibreScaleElement = map.getContainer().querySelector('.maplibregl-ctrl.maplibregl-ctrl-scale');
    if (mapLibreScaleElement) {
      const mapLibreRect = mapLibreScaleElement.getBoundingClientRect();
      setPosition({
        bottom: window.innerHeight - mapLibreRect.top + 10,
        left: mapLibreRect.left,
      });
      setWidth(mapLibreRect.width);
    }
  }, [distanceUnit]);

  const formatSpeed = (speed) => {
    const convertedSpeed = speedFromKnots(speed, speedUnit);
    return Math.round(convertedSpeed);
  };

  const getUnitLabel = () => speedUnitString(speedUnit, t);

  const steps = Math.max(2, Math.floor(width / 2));
  const legendItems = Array.from({ length: steps }, (_, i) => {
    const speed = minSpeed + (i / (steps - 1)) * (maxSpeed - minSpeed);
    return { speed, color: getSpeedColor(speed, maxSpeed), key: `legend-${speed}-${i}` };
  });

  return (
    <div
      ref={scaleRef}
      style={{
        position: 'absolute',
        bottom: `${position.bottom}px`,
        left: `${position.left}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '4px',
        borderRadius: '0px',
        fontSize: '10px',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        width: '90px',
        zIndex: 1,
        borderLeft: '2px solid black',
        borderBottom: '2px solid black',
        borderRight: '2px solid black',
      }}
    >
      <div style={{ display: 'flex', height: '10px', marginBottom: '2px' }}>
        {legendItems.map(({ color, key }) => (
          <div
            key={key}
            style={{
              flexGrow: 1,
              backgroundColor: color,
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'black' }}>{`${formatSpeed(minSpeed)} ${getUnitLabel()}`}</span>
        <span style={{ color: 'black' }}>{`${formatSpeed(maxSpeed)} ${getUnitLabel()}`}</span>
      </div>
    </div>
  );
};

export default MapColorScale;
