import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const cityColumns = [
  ["Amsterdam", "Ankara", "Ashgabat", "Baghdad", "Bahrain", "Baku", "Bangkok", "Basel", "Batumi", "Beirut", "Belgrade", "Berlin", "Bilbao"],
  ["Bishkek", "Bologna", "Bombay", "Boston", "Bremen", "Budapest", "Dallas", "Delhi", "Doha", "Dubai", "Dublin", "Hamburg", "Havana"],
  ["Houston", "Kathmandu", "Kiev", "Lagos", "Lisbon", "London", "Lyon", "Madrid", "Malaga", "Malta", "Manchester", "Melbourne", "Miami"],
  ["Milan", "Montreal", "Moscow", "Munich", "Paris", "Phuket", "Porto", "Prague", "Riyadh", "Rotterdam", "Salzburg", "Santiago", "Shangai"],
  ["Singapore", "Stockholm", "Stuttgart", "Sydney", "Tashkent", "Tokyo", "Toronto", "Tunis", "Valencia", "Venice", "Vienna", "Zagreb", "Zurich"]
];

const levelSettings = [
  { instructions: 8, toRemember: 5 },
  { instructions: 10, toRemember: 6 },
  { instructions: 12, toRemember: 7 }
];

const generateGameSet = (level) => {
  const closedCorridors = new Set();
  while (closedCorridors.size < 2) {
    closedCorridors.add(Math.floor(Math.random() * 10) + 1);
  }

  let availableCities = cityColumns.flat();
  let instructions = [];
  let usedCities = new Set();
  let count = 0;

  while (instructions.length < levelSettings[level].instructions && availableCities.length > 0) {
    const corridor = Math.floor(Math.random() * 10) + 1;
    const cityIndex = Math.floor(Math.random() * availableCities.length);
    const city = availableCities[cityIndex];
    
    if (!usedCities.has(city)) {
      usedCities.add(city);
      availableCities.splice(cityIndex, 1);
      
      if (!closedCorridors.has(corridor)) count++;
      instructions.push({ city, corridor });
      
      if (count === levelSettings[level].toRemember) break;
    }
  }

  return { closedCorridors: Array.from(closedCorridors), instructions };
};

export default function CorridorMemoryGame() {
  const [level, setLevel] = useState(0);
  const [gameData, setGameData] = useState(generateGameSet(level));
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCities, setSelectedCities] = useState([]);
  const [results, setResults] = useState(null);
  const [instructionsCompleted, setInstructionsCompleted] = useState(false);

  useEffect(() => {
    if (currentStep === 2) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < gameData.instructions.length) {
          const msg = new SpeechSynthesisUtterance(`To ${gameData.instructions[index].city} on Corridor ${gameData.instructions[index].corridor}`);
          msg.lang = "en-US";
          msg.rate = 0.9;
          window.speechSynthesis.speak(msg);
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => setInstructionsCompleted(true), 1000);
        }
      }, 1500);
    }
  }, [currentStep]);

  const handleSelectCity = (city) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const checkResults = () => {
    const correctCities = gameData.instructions
      .filter(({ corridor }) => !gameData.closedCorridors.includes(corridor))
      .map(({ city }) => city);

    setResults(correctCities);
  };

  return (
    <div className="p-5">
      {currentStep === 1 && (
        <div className="border p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">Kapalı Koridorlar</h2>
          <p>Kapalı Koridorlar: {gameData.closedCorridors.join(", ")}</p>
          <button className="mt-3 p-2 bg-blue-500 text-white rounded" onClick={() => setCurrentStep(2)}>Devam</button>
        </div>
      )}

      {currentStep === 2 && <h2 className="text-xl font-bold">İşitsel Talimatlar Dinleniyor...</h2>}

      {instructionsCompleted && currentStep === 2 && (
        <button className="mt-3 p-2 bg-green-500 text-white rounded" onClick={() => setCurrentStep(3)}>Devam Et</button>
      )}

      {currentStep === 3 && (
        <div>
          <h2 className="text-xl font-bold">Yanıt Ekranı</h2>
          <div className="grid grid-cols-5 gap-3">
            {cityColumns.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col">
                {column.map((city, rowIndex) => (
                  <button
                    key={`${colIndex}-${rowIndex}`}
                    className={`p-2 border ${selectedCities.includes(city) ? "bg-pink-500 text-white" : "bg-gray-200"}`}
                    onClick={() => handleSelectCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button className="mt-3 p-2 bg-green-500 text-white rounded" onClick={checkResults}>Sonuçları Kontrol Et</button>
        </div>
      )}

      {results && (
        <div className="mt-5">
          <h2 className="text-xl font-bold">Sonuçlar</h2>
          <div className="grid grid-cols-5 gap-3">
            {cityColumns.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col">
                {column.map((city, rowIndex) => (
                  <div key={`${colIndex}-${rowIndex}`} className={`p-2 border ${
                    results.includes(city) && selectedCities.includes(city)
                      ? "bg-green-500 text-white"
                      : results.includes(city) && !selectedCities.includes(city)
                      ? "bg-yellow-500 text-white"
                      : !results.includes(city) && selectedCities.includes(city)
                      ? "bg-red-500 text-white"
                      : "bg-gray-200"
                  }`}>
                    {city}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
