async function test() {
  try {
    const res = await fetch('http://localhost:5050/api/dashboard/data?timeframe=weekly&machineType=SPI');
    const data = await res.json();
    console.log("Top Lines:", data.topLines);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
