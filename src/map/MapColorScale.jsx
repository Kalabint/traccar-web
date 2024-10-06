import React, { useRef, useEffect, useState } from 'react';
import { useAttributePreference } from '../common/util/preferences';
import getSpeedColor from '../common/util/colors';
import { useTranslation } from '../common/components/LocalizationProvider';
import { speedFromKnots, speedUnitString } from '../common/util/converter';
import { map } from './core/MapView';

const MapColorScale = ({ minSpeed, maxSpeed }) => {
  const [width, setWidth] = useState(100);
  const [visible, setVisible] = useState(true);
  const scaleRef = useRef(null);
  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const t = useTranslation();

  useEffect(() => {
    if (map && scaleRef.current) {
      const container = scaleRef.current;
      const controlContainer = map.getContainer().querySelector('.maplibregl-ctrl-bottom-left');

      if (controlContainer) {
        controlContainer.appendChild(container);
        setWidth(container.offsetWidth);
      }

      const handleMapClick = (event) => {
        if (scaleRef.current && !scaleRef.current.contains(event.target)) {
          setVisible(false);
        }
      };

      map.on('click', handleMapClick);

      return () => {
        map.off('click', handleMapClick);
        if (controlContainer && container && container.parentNode === controlContainer) {
          controlContainer.removeChild(container);
        }
      };
    }
  }, []);

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

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={scaleRef}
      style={{
        position: 'absolute',
        bottom: '40px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        padding: '4px',
        borderRadius: '0px',
        fontSize: '10px',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        width: '90px',
        zIndex: 2,
        borderLeft: '2px solid black',
        borderBottom: '2px solid black',
        borderRight: '2px solid black',
        pointerEvents: 'auto',
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
        <span
          style={{ color: 'black', cursor: 'default' }}
        >
          {`${formatSpeed(minSpeed)} ${getUnitLabel()}`}
        </span>
        <span
          style={{ color: 'black', cursor: 'default' }}
        >
          {`${formatSpeed(maxSpeed)} ${getUnitLabel()}`}
        </span>
      </div>
    </div>
  );
};

export default MapColorScale;
