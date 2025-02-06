'use client'

import { useState } from 'react'

export function HadithSelector() {
  const [hadithNumber, setHadithNumber] = useState('1')

  return (
    <div className="flex gap-4 items-center">
      <label htmlFor="hadith-number" className="text-sm font-medium">
        Hadith Number:
      </label>
      <input
        id="hadith-number"
        type="number"
        min="1"
        value={hadithNumber}
        onChange={(e) => setHadithNumber(e.target.value)}
        className="w-24 px-2 py-1 border rounded-md"
      />
    </div>
  )
}
