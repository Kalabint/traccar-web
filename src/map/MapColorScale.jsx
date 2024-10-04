import React, { useRef, useEffect, useState } from 'react';
import { useAttributePreference } from '../common/util/preferences';
import getSpeedColor from '../common/util/colors';
import { useTranslation } from '../common/components/LocalizationProvider';
import { speedFromKnots, speedUnitString } from '../common/util/converter';

const MapColorScale = ({ minSpeed, maxSpeed }) => {
  const [position, setPosition] = useState({ bottom: 40, left: 10 });
  const [width, setWidth] = useState(90);
  const scaleRef = useRef(null);
  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const t = useTranslation();

  useEffect(() => {
    const updatePosition = () => {
      const navbar = document.querySelector('.makeStyles-menu-2');
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;

      setPosition({
        bottom: 40 + navbarHeight,
        left: 10,
      });
    };

    const updateWidth = () => {
      if (scaleRef.current) {
        setWidth(scaleRef.current.offsetWidth);
      }
    };

    updatePosition();
    updateWidth();

    window.addEventListener('resize', () => {
      updatePosition();
      updateWidth();
    });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const formatSpeed = (speed) => {
    const convertedSpeed = speedFromKnots(speed, speedUnit);
    return Math.round(convertedSpeed);
  };

  const getUnitLabel = () => speedUnitString(speedUnit, t);

  const steps = Math.max(2, width - 10);
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
