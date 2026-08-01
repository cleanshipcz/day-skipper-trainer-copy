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

export const maximumVerticalDistance = ({ currentDepthMetres, tideRiseMetres, bowRollerHeightMetres }: ScopeInputs) =>
  currentDepthMetres + tideRiseMetres + bowRollerHeightMetres;

export const scopeRatio = (inputs: ScopeInputs) => inputs.rodeLengthMetres / maximumVerticalDistance(inputs);

// Planning approximation only: treats the rode as a straight, unstretched line
// and the anchor as fixed. Real catenary, yaw and movement require extra margin.
export const approximateSwingRadius = ({ rodeLengthMetres, maximumVerticalDistanceMetres, bowToFurthestPointMetres }: SwingInputs) => {
  if (rodeLengthMetres < maximumVerticalDistanceMetres) throw new RangeError("Rode cannot be shorter than the vertical distance");
  return Math.sqrt(rodeLengthMetres ** 2 - maximumVerticalDistanceMetres ** 2) + bowToFurthestPointMetres;
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
