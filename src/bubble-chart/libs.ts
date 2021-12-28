/**
 * Calc radian from degree
 * @param degree
 */
export function getRadian(degree: number) {
  return (Math.PI / 180) * degree;
}

export function round(num: number, digit: number = 2) {
  const digitValue = 10 ** digit;
  return Math.round(num * digitValue) / digitValue;
}

/**
 * Circle interface
 */
interface Circle {
  /**
   * Circle x position
   */
  x: number;

  /**
   * Circle y position
   */
  y: number;

  /**
   * Circle radius
   */
  r: number;
}

/**
 * getNextCirclePositions
 * @param c1 Circle 1
 * @param c2 Circle 2
 * @param r Target circle radius
 * @returns { x1, y1, x2, y2 }
 */
export function getIntersectionOfTwoCircles(c1: Circle, c2: Circle, r: number) {
  const r1 = c1.r + r;
  const r2 = c2.r + r;

  if (c1.y === c2.y) {
    const lc = c1.x < c2.x ? c1 : c2;
    const x = lc.x + lc.r;
    const dy = Math.sqrt((lc.r + r) ** 2 - lc.r ** 2);

    return {
      x1: round(x),
      y1: round(lc.y + dy),
      x2: round(x),
      y2: round(lc.y - dy),
    };
  } else {
    const ta = (-c1.x + c2.x) / (c1.y - c2.y);
    const tb =
      (c1.x ** 2 - c2.x ** 2 + c1.y ** 2 - c2.y ** 2 - r1 ** 2 + r2 ** 2) /
      (2 * c1.y - 2 * c2.y);
    const tc = tb - c1.y;

    const a = 1 + ta ** 2;
    const b = -2 * c1.x + 2 * ta * tc;
    const c = c1.x ** 2 + tc ** 2 - r1 ** 2;

    const x1 = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
    const y1 = ta * x1 + tb;
    const x2 = (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
    const y2 = ta * x2 + tb;

    return { x1: round(x1), y1: round(y1), x2: round(x2), y2: round(y2) };
  }
}

/**
 * getRandomDegree
 * @returns random degree
 */
export function getRandomDegree() {
  return Math.random() * 360;
}
