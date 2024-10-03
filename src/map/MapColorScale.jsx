import React, { useRef, useEffect, useState } from 'react';
import { useAttributePreference } from '../common/util/preferences';
import getSpeedColor from '../common/util/colors';

const MapColorScale = ({ minSpeed, maxSpeed }) => {
  const [width, setWidth] = useState(100);
  const scaleRef = useRef(null);
  const distanceUnit = useAttributePreference('distanceUnit');

  useEffect(() => {
    if (scaleRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          setWidth(entry.contentRect.width);
        });
        return undefined;
      });
      resizeObserver.observe(scaleRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
    return undefined;
  }, []);

  const convertSpeed = (speedInKnots) => {
    switch (distanceUnit) {
      case 'mi':
        return speedInKnots * 1.15078;
      case 'nmi':
        return speedInKnots;
      case 'km':
        return speedInKnots * 1.852;
      default:
        return speedInKnots * 1.852; // Added explicit default return
    }
  };

  const formatSpeed = (speed) => {
    const convertedSpeed = convertSpeed(speed);
    return Math.round(convertedSpeed);
  };

  const getUnitLabel = () => {
    switch (distanceUnit) {
      case 'mi':
        return 'mph';
      case 'nmi':
        return 'knots';
      case 'km':
        return 'km/h';
      default:
        return 'km/h'; // Added explicit default return
    }
  };

  const steps = Math.max(2, Math.floor(width / 2));
  const legendItems = Array.from({ length: steps }, (_, i) => {
    const speed = minSpeed + (i / (steps - 1)) * (maxSpeed - minSpeed);
    return { speed, color: getSpeedColor(speed, maxSpeed), key: `legend-${speed}-${i}` };
  });

  return React.createElement(
    'div',
    {
      ref: scaleRef,
      style: {
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
      },
    },
    React.createElement(
      'div',
      { style: { display: 'flex', height: '10px', marginBottom: '2px' } },
      legendItems.map(({ color, key }) => React.createElement('div', {
        key, // Use a more unique key rather than just index
        style: {
          flexGrow: 1,
          backgroundColor: color,
        },
      })),
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between' } },
      React.createElement('span', { style: { color: 'black' } }, `${formatSpeed(minSpeed)} ${getUnitLabel()}`),
      React.createElement('span', { style: { color: 'black' } }, `${formatSpeed(maxSpeed)} ${getUnitLabel()}`),
    ),
  );
};

export default MapColorScale;
