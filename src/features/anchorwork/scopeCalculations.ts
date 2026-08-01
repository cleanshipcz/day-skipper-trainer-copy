export interface ScopeInputs {
  rodeLengthMetres: number;
  currentDepthMetres: number;
  tideRiseMetres: number;
  bowRollerHeightMetres: number;
}

export interface SwingInputs {
  rodeLengthMetres: number;
  maximumVerticalDistanceMetres: number;
  bowToFurthestPointMetres: number;
}

const requireFinitePositive = (name: string, value: number) => {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be finite and greater than zero`);
};

const requireFiniteNonnegative = (name: string, value: number) => {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and nonnegative`);
};

const validateScopeInputs = ({ rodeLengthMetres, currentDepthMetres, tideRiseMetres, bowRollerHeightMetres }: ScopeInputs) => {
  requireFinitePositive("Rode length", rodeLengthMetres);
  requireFiniteNonnegative("Current depth", currentDepthMetres);
  requireFiniteNonnegative("Tide rise", tideRiseMetres);
  requireFiniteNonnegative("Bow-roller height", bowRollerHeightMetres);
};

export const maximumVerticalDistance = (inputs: ScopeInputs) => {
  validateScopeInputs(inputs);
  const distance = inputs.currentDepthMetres + inputs.tideRiseMetres + inputs.bowRollerHeightMetres;
  requireFinitePositive("Maximum vertical distance", distance);
  return distance;
};

export const scopeRatio = (inputs: ScopeInputs) => {
  const ratio = inputs.rodeLengthMetres / maximumVerticalDistance(inputs);
  if (!Number.isFinite(ratio) || ratio <= 0) throw new RangeError("Scope ratio cannot be represented as a positive finite number");
  return ratio;
};

// Planning approximation only: treats the rode as a straight, unstretched line
// and the anchor as fixed. Real catenary, yaw and movement require extra margin.
export const approximateSwingRadius = ({ rodeLengthMetres, maximumVerticalDistanceMetres, bowToFurthestPointMetres }: SwingInputs) => {
  requireFinitePositive("Rode length", rodeLengthMetres);
  requireFinitePositive("Maximum vertical distance", maximumVerticalDistanceMetres);
  requireFiniteNonnegative("Bow-to-furthest-point distance", bowToFurthestPointMetres);
  if (rodeLengthMetres < maximumVerticalDistanceMetres) throw new RangeError("Rode cannot be shorter than the vertical distance");
  const verticalFraction = maximumVerticalDistanceMetres / rodeLengthMetres;
  const horizontalReach = rodeLengthMetres * Math.sqrt((1 - verticalFraction) * (1 + verticalFraction));
  const radius = horizontalReach + bowToFurthestPointMetres;
  if (!Number.isFinite(horizontalReach) || horizontalReach < 0 || !Number.isFinite(radius) || radius < 0) {
    throw new RangeError("Swing radius cannot be represented as a finite nonnegative number");
  }
  return radius;
};

export const scopeWorkedExample = {
  assumptions: {
    currentDepthMetres: 4,
    tideRiseMetres: 2,
    bowRollerHeightMetres: 1,
    rodeLengthMetres: 35,
  },
  maximumVerticalDistanceMetres: 7,
  ratio: 5,
} as const;

export const swingWorkedExample = {
  assumptions: {
    rodeLengthMetres: 35,
    maximumVerticalDistanceMetres: 7,
    bowToFurthestPointMetres: 10,
  },
  horizontalRodeReachMetres: 34.29,
  approximateSwingRadiusMetres: 44.29,
} as const;
