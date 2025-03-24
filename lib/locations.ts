interface Location {
  name: string
  country: string
  continent: string
  description: string
  bestTimeToVisit?: string
}

const locations: Location[] = [
  {
    name: "Paris",
    country: "France",
    continent: "Europe",
    description:
      "Known as the City of Light, Paris is famous for its iconic Eiffel Tower, world-class museums like the Louvre, and charming cafés along the Seine River.",
    bestTimeToVisit: "April to June or September to October",
  },
  {
    name: "Tokyo",
    country: "Japan",
    continent: "Asia",
    description:
      "A fascinating blend of the ultramodern and traditional, Tokyo offers visitors cutting-edge technology, historic temples, and a vibrant food scene.",
    bestTimeToVisit: "March to May or September to November",
  },
  {
    name: "New York",
    country: "United States",
    continent: "North America",
    description:
      "The Big Apple is home to iconic landmarks like Times Square, Central Park, and the Statue of Liberty, with world-class dining, shopping, and entertainment.",
    bestTimeToVisit: "April to June or September to November",
  },
  {
    name: "Sydney",
    country: "Australia",
    continent: "Oceania",
    description:
      "Famous for its harbor, Sydney Opera House, and beautiful beaches like Bondi, Sydney offers a perfect blend of urban excitement and natural beauty.",
    bestTimeToVisit: "September to November or March to May",
  },
  {
    name: "Cape Town",
    country: "South Africa",
    continent: "Africa",
    description:
      "With Table Mountain as its backdrop, Cape Town offers stunning beaches, vibrant culture, and easy access to wildlife and wine country.",
    bestTimeToVisit: "March to May or September to November",
  },
  {
    name: "Rio de Janeiro",
    country: "Brazil",
    continent: "South America",
    description:
      "Known for its iconic Christ the Redeemer statue, beautiful beaches like Copacabana, and vibrant carnival celebrations, Rio offers natural beauty and cultural excitement.",
    bestTimeToVisit: "December to March",
  },
  {
    name: "Barcelona",
    country: "Spain",
    continent: "Europe",
    description:
      "Famous for Antoni Gaudí's unique architecture, including the Sagrada Familia, Barcelona offers beautiful beaches, delicious cuisine, and vibrant street life.",
    bestTimeToVisit: "May to June or September to October",
  },
  {
    name: "Bangkok",
    country: "Thailand",
    continent: "Asia",
    description:
      "Thailand's capital offers ornate temples, floating markets, vibrant street food, and a perfect blend of traditional culture and modern urban life.",
    bestTimeToVisit: "November to February",
  },
  {
    name: "Vancouver",
    country: "Canada",
    continent: "North America",
    description:
      "Surrounded by mountains and water, Vancouver offers outdoor activities year-round, diverse cuisine, and a relaxed West Coast atmosphere.",
    bestTimeToVisit: "June to September",
  },
  {
    name: "Dubai",
    country: "United Arab Emirates",
    continent: "Asia",
    description:
      "Known for futuristic architecture, luxury shopping, and desert adventures, Dubai represents the height of modern urban development in the Middle East.",
    bestTimeToVisit: "November to March",
  },
  {
    name: "Rome",
    country: "Italy",
    continent: "Europe",
    description:
      "The Eternal City is home to ancient ruins like the Colosseum, world-class art, and delicious Italian cuisine, offering a journey through history at every turn.",
    bestTimeToVisit: "April to May or September to October",
  },
  {
    name: "Kyoto",
    country: "Japan",
    continent: "Asia",
    description:
      "Japan's cultural capital features over 1,600 Buddhist temples, 400 Shinto shrines, traditional wooden houses, and beautiful gardens.",
    bestTimeToVisit: "March to May or October to November",
  },
  {
    name: "Marrakech",
    country: "Morocco",
    continent: "Africa",
    description:
      "With its vibrant souks, historic medina, and stunning palaces, Marrakech offers visitors an immersive experience in Moroccan culture and history.",
    bestTimeToVisit: "March to May or September to November",
  },
  {
    name: "Queenstown",
    country: "New Zealand",
    continent: "Oceania",
    description:
      "Surrounded by mountains and set on Lake Wakatipu, Queenstown is known as the adventure capital of the world, offering activities from bungee jumping to skiing.",
    bestTimeToVisit: "December to February or June to August for skiing",
  },
  {
    name: "Reykjavik",
    country: "Iceland",
    continent: "Europe",
    description:
      "Iceland's capital offers access to stunning natural wonders including geysers, waterfalls, and the Northern Lights, plus a vibrant cultural scene.",
    bestTimeToVisit: "June to August or September to March for Northern Lights",
  },
]

export function getRandomLocation(): Location {
  const randomIndex = Math.floor(Math.random() * locations.length)
  return locations[randomIndex]
}

export function getRandomLocations(count: number): Location[] {
  const shuffled = [...locations].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

