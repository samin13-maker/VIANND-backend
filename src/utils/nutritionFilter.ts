export const extractNutrients = (nutrients: any[]) => {

  const findNutrient = (names: string[]) => {
    const nutrient = nutrients.find(n =>
      names.includes(n.nutrientName)
    );
    return nutrient ? nutrient.value : 0;
  };

  return {
    calories: findNutrient(["Energy", "Energy (kcal)"]),
    protein: findNutrient(["Protein"]),
    fat: findNutrient(["Total lipid (fat)"]),
    carbs: findNutrient(["Carbohydrate, by difference"])
  };
};