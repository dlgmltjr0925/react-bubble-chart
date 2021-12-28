import './BubbleChart.css';
import {
  CanvasHTMLAttributes,
  DetailedHTMLProps,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  CANVAS_DEFAULT_HEIGHT,
  CANVAS_DEFAULT_WIDTH,
  CIRCLE_COLOR_MAX,
  CIRCLE_COLOR_MIN,
  CIRCLE_MAX_RADIUS,
  CIRCLE_MIN_RADIUS,
  GAP_BETWEEN_CIRCLES,
} from './constants';
import {
  getIntersectionOfTwoCircles,
  getRadian,
  getRandomDegree,
} from './libs';

export interface Data {
  /**
   * Circle label
   */
  label: string;

  /**
   * Circle value
   * value must be greater than 0
   */
  value: number;

  [key: string]: any;
}

export interface Circle extends Data {
  /**
   * Circle radius
   */
  r: number;

  /**
   * Circle color
   */
  color: string;

  /**
   * Circle center x position
   */
  x: number;

  /**
   * Circle center y position
   */
  y: number;
}

export interface BubbleChartProps
  extends DetailedHTMLProps<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {
  /**
   * Canvas width
   */
  width?: number;

  /**
   * Canvas height
   */
  height?: number;

  /**
   * Circle data
   */
  data: Data[];

  /**
   * Circle max radius
   */
  maxRadius?: number;

  /**
   * Circle min radius
   */
  minRadius?: number;

  /**
   * Circle color range
   */
  maxR?: number;
  minR?: number;
  maxG?: number;
  minG?: number;
  maxB?: number;
  minB?: number;
}

export default function BubbleChart({
  width = CANVAS_DEFAULT_WIDTH,
  height = CANVAS_DEFAULT_HEIGHT,
  maxRadius = CIRCLE_MAX_RADIUS,
  minRadius = CIRCLE_MIN_RADIUS,
  maxR,
  minR,
  maxG,
  minG,
  maxB,
  minB,
  data,
  ...props
}: BubbleChartProps) {
  const canvasElement = useRef<HTMLCanvasElement>(null);

  /**
   * Processed data
   */
  const circles = useMemo(() => {
    if (data.length === 0) return [];

    if (minRadius >= maxRadius)
      throw new Error('minRadius must be greater than maxRadius.');

    let sortedData = data.sort((a, b) => b.value - a.value);

    if (sortedData[sortedData.length - 1].value < 0)
      throw new Error('value must be greater than 0.');

    const dy = maxRadius - minRadius;
    const dx = sortedData[0].value;

    const getRadius = (value: number) => {
      return (dy / dx) * value + minRadius;
    };

    const getRandomHexColor = (
      max: number = CIRCLE_COLOR_MAX,
      min: number = CIRCLE_COLOR_MIN
    ) => {
      const diff = max - min;
      return (Math.floor(Math.random() * diff) + min)
        .toString(16)
        .padStart(2, '0');
    };

    const getColor = () => {
      const red = getRandomHexColor(maxR, minR);
      const green = getRandomHexColor(maxG, minG);
      const blue = getRandomHexColor(maxB, minB);

      return `#${red}${green}${blue}`;
    };

    const circles = sortedData.map((data) => {
      return {
        ...data,
        r: getRadius(data.value),
        color: getColor(),
        x: width / 2,
        y: height / 2,
      };
    });

    if (circles[1]) {
      const r = circles[0].r + circles[1].r + GAP_BETWEEN_CIRCLES;
      const degree = getRandomDegree();
      circles[1].x += r * Math.cos(getRadian(degree));
      circles[1].y -= r * Math.sin(getRadian(degree));
    }

    let ci = 0;
    for (let i = 2; i < circles.length; i++) {
      const { x1, y1, x2, y2 } = getIntersectionOfTwoCircles(
        circles[ci],
        circles[i - 1],
        circles[i].r + GAP_BETWEEN_CIRCLES
      );

      let isOverlab = false;
      for (let j = i - 1; j >= 0; j--) {
        const { x, y, r } = circles[j];
        if ((x1 - x) ** 2 + (y1 - y) ** 2 < (circles[i].r + r) ** 2) {
          isOverlab = true;
          break;
        }
      }

      if (!isOverlab) {
        circles[i].x = x1;
        circles[i].y = y1;
        continue;
      }

      isOverlab = false;
      for (let j = i - 1; j >= 0; j--) {
        const { x, y, r } = circles[j];
        if ((x2 - x) ** 2 + (y2 - y) ** 2 < (circles[i].r + r) ** 2) {
          isOverlab = true;
          break;
        }
      }

      if (!isOverlab) {
        circles[i].x = x2;
        circles[i].y = y2;
        continue;
      }

      if (++ci > i - 2) break;
      i--;
    }

    return circles;
  }, [
    data,
    minRadius,
    maxRadius,
    maxR,
    minR,
    maxG,
    minG,
    maxB,
    minB,
    width,
    height,
  ]);

  useEffect(() => {
    if (!canvasElement.current) return;
    const ctx = canvasElement.current.getContext(
      '2d'
    ) as CanvasRenderingContext2D;

    let drawCount = 0;
    let done = false;

    function draw() {
      drawCount++;
      ctx.fillStyle = '#eee';
      ctx.clearRect(0, 0, width, height);
      circles.forEach(({ x, y, color, r, label }, i) => {
        ctx.beginPath();
        const radius = Math.max(Math.min(r, drawCount - i), 0);
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      const lastIndex = circles.length - 1;
      const lastCircle = circles[lastIndex];
      if (drawCount - lastIndex >= lastCircle.r) done = true;

      if (!done) requestAnimationFrame(draw);
    }

    draw();
  }, [circles]);

  return (
    <canvas
      ref={canvasElement}
      className='bubble-chart'
      width={width}
      height={height}
      {...props}
    />
  );
}
