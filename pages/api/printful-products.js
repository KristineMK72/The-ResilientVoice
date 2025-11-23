// pages/api/printful-products.js  ← TEMPORARY HARD-CODED VERSION
export default function handler(req, res) {
  const fakeProducts = [
    {
      id: "grace-tee",
      name: "Grace Chosen Unisex Tee",
      image: "https://files.cdn.printful.com/products/71/71_1666901234.jpg",
      price: "29.99"
    },
    {
      id: "resilient-beanie",
      name: "Resilient Beanie",
      image: "https://files.cdn.printful.com/products/208/208_1702489123.jpg",
      price: "24.99"
    },
    {
      id: "warrior-mug",
      name: "Warrior Spirit Mug",
      image: "https://files.cdn.printful.com/products/166/166_1702485678.jpg",
      price: "19.99"
    },
    {
      id: "joy-tee",
      name: "Joy Comes in the Morning Tee",
      image: "https://files.cdn.printful.com/products/71/71_1666901456.jpg",
      price: "31.99"
    }
  ];

  res.status(200).json({ result: fakeProducts });
}
