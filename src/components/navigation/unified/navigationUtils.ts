interface Feedback {
  type: "info" | "warning" | "success" | "error";
  message: string;
  details?: string;
}

export const analyzeBearing = (userBearing: number, correctBearing: number): Feedback | null => {
  const diff = Math.abs(userBearing - correctBearing);

  // 1. Perfect
  if (diff < 2) return { type: "success", message: "Spot on! That bearing is accurate." };

  // 2. Reciprocal (180 degrees out)
  const reciprocalDiff = Math.abs(diff - 180);
  if (reciprocalDiff < 5) {
    return {
      type: "warning",
      message: "Careful! That looks like a Reciprocal Bearing.",
      details: `You plotted ${Math.round(userBearing)}°, but the object is at ${Math.round(
        correctBearing
      )}°. Did you read the wrong end of the compass needle?`,
    };
  }

  // 3. Variation Error (Assuming ~5 degrees var)
  if (diff > 4 && diff < 8) {
    return {
      type: "info",
      message: "Did you apply Variation?",
      details:
        "Your bearing is close, but not quite correct. Remember to convert Magnetic to True before plotting on the chart.",
    };
  }

  // 4. Gross Error
  if (diff > 10) return { type: "error", message: "That bearing seems incorrect. Try sighting the object again." };

  return null;
};
