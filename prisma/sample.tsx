import { Status } from "../src/app/generated/prisma";

export const sampleProductsData = [
  {
    name: "Standard AI Assistant",
    description:
      "Your go-to AI for everyday tasks, from writing emails to brainstorming ideas. Perfect for personal use.",
    category: "Productivity",
    features: ["5,000 monthly credits", "Basic API access", "Email support"],
    status: Status.active,
    imageUrl: "/empty.jpg",
    price: {
      three: 999,
      six: 1899,
      twelve: 3599,
    },
  },
  {
    name: "Pro Creative Suite",
    description:
      "Unleash your creativity with advanced tools for content generation, image editing, and more. Ideal for freelancers and small teams.",
    category: "Creative Tools",
    features: [
      "25,000 monthly credits",
      "Advanced API access",
      "24/7 priority support",
      "Multi-user collaboration",
    ],
    status: Status.active,
    imageUrl: "/empty.jpg",
    price: {
      three: 2499,
      six: 4799,
      twelve: 9099,
    },
  },
  {
    name: "Enterprise Solutions Hub",
    description:
      "A comprehensive, scalable platform for large organizations. Custom features, dedicated support, and robust security.",
    category: "Enterprise",
    features: [
      "Unlimited credits",
      "Dedicated infrastructure",
      "SLA support",
      "On-premise deployment options",
    ],
    status: Status.active,
    imageUrl: "/empty.jpg",
    price:{},
  },
  {
    name: "Retired Product - Legacy",
    description:
      "This is a product that is no longer offered for new subscriptions.",
    category: "Legacy",
    features: ["Archived for historical purposes"],
    status: Status.archived,
    imageUrl: "/empty.jpg",
    price: {},
  },
];
