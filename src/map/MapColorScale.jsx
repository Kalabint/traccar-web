import { useEffect } from 'react';
import { useAttributePreference } from '../common/util/preferences';
import getSpeedColor from '../common/util/colors';
import { useTranslation } from '../common/components/LocalizationProvider';
import { speedFromKnots, speedUnitString } from '../common/util/converter';
import { map } from './core/MapView';

class ColorScaleControl {
  constructor(minSpeed, maxSpeed, speedUnit, getSpeedColor, formatSpeed, getUnitLabel) {
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
    this.speedUnit = speedUnit;
    this.getSpeedColor = getSpeedColor;
    this.formatSpeed = formatSpeed;
    this.getUnitLabel = getUnitLabel;
    this.container = document.createElement('div');
    this.container.className = 'color-scale-control';
  }

  renderColorScale() {
    const steps = 100;
    const legendItems = Array.from({ length: steps }, (_, i) => {
      const speed = this.minSpeed + (i / (steps - 1)) * (this.maxSpeed - this.minSpeed);
      return { speed, color: this.getSpeedColor(speed, this.maxSpeed) };
    });

    this.container.innerHTML = `
    <div style="position: absolute; bottom: 40px; left: 10px; background-color: rgba(255, 255, 255, 0.75); padding: 4px; border-radius: 0px; font-size: 10px; line-height: 1; white-space: nowrap; width: 90px; z-index: 2; border-left: 2px solid black; border-bottom: 2px solid black; border-right: 2px solid black;">
      <div style="display: flex; height: 10px; margin-bottom: 2px;">
        ${legendItems.map(({ color }) => `<div style="flex-grow: 1; background-color: ${color};"></div>`).join('')}
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: black; cursor: text;">${this.formatSpeed(this.minSpeed)} ${this.getUnitLabel()}</span>
        <span style="color: black; cursor: text;">${this.formatSpeed(this.maxSpeed)} ${this.getUnitLabel()}</span>
      </div>
    </div>
  `;
  }

  onAdd() {
    this.renderColorScale();
    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
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
    const colorScaleControl = new ColorScaleControl(
      minSpeed,
      maxSpeed,
      speedUnit,
      getSpeedColor,
      formatSpeed,
      getUnitLabel,
    );

    if (map) {
      map.addControl(colorScaleControl, 'bottom-left');
    }

    return () => {
      if (map) {
        map.removeControl(colorScaleControl);
      }
    };
  }, [minSpeed, maxSpeed, speedUnit]);

  return null;
};

export default MapColorScale;
