import React, { useRef, useEffect, useState } from 'react';
import { useAttributePreference } from '../common/util/preferences';
console.log(useAttributePreference);
import getSpeedColor from '../common/util/colors';
import { useTranslation } from '../common/components/LocalizationProvider';
import { speedFromKnots, speedUnitString } from '../common/util/converter';

const MapColorScale = ({ minSpeed, maxSpeed }) => {
  const [width, setWidth] = useState(100);
  const scaleRef = useRef(null);
  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const t = useTranslation();

  useEffect(() => {
    if (scaleRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          setWidth(entry.contentRect.width);
        });
      });
      resizeObserver.observe(scaleRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  const formatSpeed = (speed) => {
    const convertedSpeed = speedFromKnots(speed, speedUnit);
    return Math.round(convertedSpeed);
  };

  const getUnitLabel = () => {
    return speedUnitString(speedUnit, t);
  };

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
        bottom: '40px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '4px',
        borderRadius: '0px',
        fontSize: '10px',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        minWidth: '90px',
        maxWidth: '100px',
        zIndex: 1000,
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