export default async function handler(req, res) {
  try {
    const recipeId = process.env.GOOTEN_RECIPE_ID;

    const response = await fetch(
      `https://api.print.io/api/products/?recipeId=${recipeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    const data = await response.json();

    res.status(200).json({
      ok: true,
      message: "Gooten connection successful",
      data,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Gooten connection failed",
      details: error.message,
    });
  }
}
