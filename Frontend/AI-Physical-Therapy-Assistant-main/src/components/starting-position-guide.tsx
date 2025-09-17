import React from "react"

export default function StartingPositionGuide() {
  const positions = [
    {
      id: 1,
      description: "Hands under shoulders, knees under hips (90° angles)",
    },
    {
      id: 2,
      description: "Front of foot flat, toes inward, heels outward",
    },
    {
      id: 3,
      description: "Back straight, neutral spine position",
    },
    {
      id: 4,
      description: "Head aligned with spine, looking at the floor",
    },
    {
      id: 5,
      description: "Flatten the tops of your feet and ankles against the ground — press them down actively",
    },
  ]

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Correct Starting Position</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {positions.map((position) => (
          <div key={position.id} className="flex items-center gap-3 bg-white p-4 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
              {position.id}
            </div>
            <p className="text-gray-700">{position.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
