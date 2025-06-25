import { getNarrators } from "@/lib/sqlite";

export default async function TestPage() {
  try {
    const narrators = getNarrators();

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-4xl font-bold">Test Page</h1>
        <p>Total narrators: {narrators.length}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {narrators.slice(0, 6).map((narrator) => (
            <div key={narrator.scholar_indx} className="border p-4">
              <h3 className="font-bold">{narrator.name}</h3>
              <p className="text-sm text-gray-600">{narrator.grade}</p>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading narrators:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-4xl font-bold">Error</h1>
        <p>Failed to load narrators: {String(error)}</p>
      </div>
    );
  }
}
