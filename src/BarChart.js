import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChart extends Component {
    constructor(props) {
        super(props);
        this.svgRef = React.createRef();
        this.state = {
            selectedXAxis: 'day'    //default val
        };
    }

    componentDidUpdate(prevState) {  //i was having an issue with componentDidUpdate triggering and getting my props and this helped :)
        const { data, selectedVariable } = this.props;
        const { selectedXAxis } = this.state;

        // average value for each category
        const averages = d3.rollup( //this just makes it easier for me to grab up all my data this way
            data,
            v => d3.mean(v, d => +d[selectedVariable]), //and average it!
            d => d[selectedXAxis]
        );

        const svg = d3.select(this.svgRef.current);
        const margin = { top: 20, right: 60, bottom: 30, left: 60 };    // i need space for axis labels
        const width = +svg.attr('width') - margin.left - margin.right;
        const height = +svg.attr('height') - margin.top - margin.bottom;

        const x = d3.scaleBand()    //handle bar widths
            .domain([...averages.keys()])
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max([...averages.values()])]).nice()
            .range([height - margin.bottom, margin.top]);

        svg.selectAll('*').remove();

        svg.append('g') //the x-axis line
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('transform', 'translate(12,0)')
            .attr('fill', 'black');

        svg.append('g') //the y-axis
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .selectAll('text')
            .attr('fill', 'black');

        // x-axis
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + margin.top) // Adjusted y position for the label
            .style('text-anchor', 'middle')
            .text(selectedXAxis)
            .attr('fill', 'black');

        // y-axis
        svg.append('text')
            .attr('transform', `rotate(-90) translate(${-height / 2},${margin.left - 30})`) // Rotate and translate
            .style('text-anchor', 'middle')
            .text(selectedVariable + " (average)")
            .attr('fill', 'black');

        svg.selectAll('.bar')   //the bars
            .data([...averages])
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', ([key]) => x(key))
            .attr('y', ([, value]) => y(value))
            .attr('width', x.bandwidth())
            .attr('height', ([, value]) => height - margin.bottom - y(value))
            .attr('fill', 'lightgray')
            .each(function ([, value]) {
                svg.append('text')  //text inside the bars
                    .attr('x', parseFloat(d3.select(this).attr('x')) + parseFloat(d3.select(this).attr('width')) / 2)
                    .attr('y', parseFloat(d3.select(this).attr('y')) + 20)
                    .attr('text-anchor', 'middle')
                    .text(value.toFixed(2))
                    .attr('fill', 'darkgray');
            });
    }

    handleXAxisChange = (e) => {
        this.setState({ selectedXAxis: e.target.value });
    };

    render() {
        const { selectedXAxis } = this.state;

        return (
            <div className="bar-chart">
                <div>
                    <input
                        type="radio"
                        id="day"
                        name="x-axis"
                        value="day"
                        checked={selectedXAxis === 'day'}
                        onChange={this.handleXAxisChange}
                    />
                    <label htmlFor="day">Day</label>

                    <input
                        type="radio"
                        id="sex"
                        name="x-axis"
                        value="sex"
                        checked={selectedXAxis === 'sex'}   //haha
                        onChange={this.handleXAxisChange}
                    />
                    <label htmlFor="sex">Sex</label>

                    <input
                        type="radio"
                        id="smoker"
                        name="x-axis"
                        value="smoker"
                        checked={selectedXAxis === 'smoker'}
                        onChange={this.handleXAxisChange}
                    />
                    <label htmlFor="smoker">Smoker</label>

                    <input
                        type="radio"
                        id="time"
                        name="x-axis"
                        value="time"
                        checked={selectedXAxis === 'time'}
                        onChange={this.handleXAxisChange}
                    />
                    <label htmlFor="time">Time</label>
                </div>
                <svg ref={this.svgRef} width={600} height={400}></svg>
            </div>
        );
    }
}

export default BarChart;
