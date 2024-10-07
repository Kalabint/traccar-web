import { useEffect } from 'react';
import { useAttributePreference } from '../common/util/preferences';
import getSpeedColor from '../common/util/colors';
import { useTranslation } from '../common/components/LocalizationProvider';
import { speedFromKnots, speedUnitString } from '../common/util/converter';
import { map } from './core/MapView';

class ColorScaleControl {
  constructor(minSpeed, maxSpeed, getSpeedColor, formatSpeed, getUnitLabel) {
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
    this.getSpeedColor = getSpeedColor;
    this.formatSpeed = formatSpeed;
    this.getUnitLabel = getUnitLabel;
    this.container = document.createElement('div');
    this.container.className = 'color-scale-control';
  }

  renderColorScale() {
    const steps = 100;
    const unitLabel = this.getUnitLabel();
    const legendItems = Array.from({ length: steps }, (_, i) => {
      const speed = this.minSpeed + (i / (steps - 1)) * (this.maxSpeed - this.minSpeed);
      return { speed, color: this.getSpeedColor(speed, this.maxSpeed) };
    });

    this.container.innerHTML = '';

    const legendContainer = document.createElement('div');
    legendContainer.className = 'legend-container';
    Object.assign(legendContainer.style, {
      position: 'absolute',
      bottom: '40px',
      left: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
      padding: '4px',
      fontSize: '10px',
      lineHeight: '1',
      whiteSpace: 'nowrap',
      width: '90px',
      zIndex: '2',
      borderLeft: '2px solid black',
      borderBottom: '2px solid black',
      borderRight: '2px solid black',
    });

    const colorBar = document.createElement('div');
    Object.assign(colorBar.style, {
      display: 'flex',
      height: '10px',
      marginBottom: '2px',
    });
    legendItems.forEach(({ color }) => {
      const colorStep = document.createElement('div');
      Object.assign(colorStep.style, {
        flexGrow: '1',
        backgroundColor: color,
      });
      colorBar.appendChild(colorStep);
    });
    legendContainer.appendChild(colorBar);

    const labelsContainer = document.createElement('div');
    Object.assign(labelsContainer.style, {
      display: 'flex',
      justifyContent: 'space-between',
    });
    const minLabel = document.createElement('span');
    minLabel.textContent = `${this.formatSpeed(this.minSpeed)} ${unitLabel}`;
    minLabel.style.color = 'black';
    const maxLabel = document.createElement('span');
    maxLabel.textContent = `${this.formatSpeed(this.maxSpeed)} ${unitLabel}`;
    maxLabel.style.color = 'black';
    labelsContainer.appendChild(minLabel);
    labelsContainer.appendChild(maxLabel);

    legendContainer.appendChild(labelsContainer);
    this.container.appendChild(legendContainer);
  }

  onAdd() {
    this.renderColorScale();
    return this.container;
  }

  onRemove() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

const MapColorScale = ({ minSpeed, maxSpeed }) => {
  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const t = useTranslation();

  const formatSpeed = (speed) => {
    const convertedSpeed = speedFromKnots(speed, speedUnit);
    return Math.round(convertedSpeed);
  };

  const getUnitLabel = () => speedUnitString(speedUnit, t);

  useEffect(() => {
    let colorScaleControl;
    if (map) {
      colorScaleControl = new ColorScaleControl(
        minSpeed,
        maxSpeed,
        getSpeedColor,
        formatSpeed,
        getUnitLabel,
      );
      map.addControl(colorScaleControl, 'bottom-left');
    }

    return () => {
      if (map && colorScaleControl) {
        map.removeControl(colorScaleControl);
      }
    };
  }, [minSpeed, maxSpeed, speedUnit]);

  return null;
};

export default MapColorScale;
