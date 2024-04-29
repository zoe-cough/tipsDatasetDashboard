import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import BarChart from './BarChart';
import CorrelationMatrix from './CorrelationMatrix';
import Scatterplot from './Scatterplot';
import dataPath from './tips.csv';

function App() {
  const [selectedVariable, setSelectedVariable] = useState('total_bill');
  const [data, setData] = useState([]);
  const [scatterplotVariables, setScatterplotVariables] = useState(null);

  const fetchData = () => {
    d3.csv(dataPath)
      .then((csvData) => {
        setData(csvData);
      })
      .catch(error => {
        console.error('Error loading data:', error);
      });
  };

  //this helps me keep an eye on my data and keep everything straight
  //useEffect is pretty similar to componentDidUpdate but it's more modern
  //it's a hook that lets me combine componentDidMount and componentDidUpdate
  //i think it does componentDidUnmount too but we don't care about that here
  //helps me keep things simple :)
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
    }
  }, [data]);

  const handleCellClick = (var1, var2) => {
    setScatterplotVariables([var1, var2]);
  };

  return (
    <div className="App">
      <header style={{ backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>
        <label htmlFor="targetVariable" style={{ marginRight: '5px' }}>Select Target: </label>
        <select id="targetVariable" value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)} style={{ textAlign: 'center' }}>
          {data && data.columns && data.columns.map(column => {
            if (['total_bill', 'tip', 'size'].includes(column)) {
              return <option key={column} value={column}>{column}</option>;
            } else {
              return null; //no more!
            }
          })}
        </select>
      </header>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1, border: '1px solid #ccc', margin: '10px' }}>
          <BarChart data={data} selectedVariable={selectedVariable} />
        </div>
        <div style={{ flex: 1, border: '1px solid #ccc', margin: '10px' }}>
          <CorrelationMatrix data={data} onCellClick={handleCellClick} />
        </div>
      </div>
      <div style={{ border: '1px solid #ccc', margin: '10px' }}>
        {scatterplotVariables && <Scatterplot data={data} xVariable={scatterplotVariables[0]} yVariable={scatterplotVariables[1]} />}
      </div>
    </div>
  );
}

export default App;
