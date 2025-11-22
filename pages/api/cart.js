// pages/api/cart.js
export default async function handler(req, res) {
  if (req.method === "GET") {
    // Example: fetch cart items from database/session
    // For now, return mock data
    res.status(200).json({
      items: [
        {
          id: "403600962",
          name: "Warrior Spirit Tee",
          price: 25.0,
          quantity: 2,
          image: "/images/warrior.png",
        },
        {
          id: "403600963",
          name: "Grace Bracelet",
          price: 15.0,
          quantity: 1,
          image: "/images/grace.png",
        },
      ],
    });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

