async function test() {
  try {
    const res = await fetch('http://localhost:5050/api/reports/pareto?machineType=SPI');
    const data = await res.json();
    console.log("Pareto SPI:", data);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
