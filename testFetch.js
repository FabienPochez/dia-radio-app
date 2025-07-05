// testFetch.js
async function testPayloadFetch() {
  try {
    const res = await fetch('https://content.diaradio.live/api/episodes')
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    console.log('Episodes data:', data)
  } catch (err) {
    console.error('Fetch error:', err)
  }
}

testPayloadFetch()
