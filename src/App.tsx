import BubbleChart, { Data } from './bubble-chart';

const SAMPLE_DATA: Data[] = Array.from({ length: 100 }, (_, i) => ({
  label: `Label${i + 1}`,
  value: Math.floor(Math.random() * 5000),
}));

function App() {
  return (
    <div>
      <BubbleChart data={SAMPLE_DATA} />
    </div>
  );
}

export default App;
