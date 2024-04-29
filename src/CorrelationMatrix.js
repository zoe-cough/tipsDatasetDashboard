import React, { Component } from 'react';
import * as d3 from 'd3';

class CorrelationMatrix extends Component {
    constructor(props) {
        super(props);
        this.svgRef = React.createRef();    //this makes accessing the svg directly waaaaaay easier!
        this.width = 500;
        this.height = 500;
    }

    componentDidMount() {
        this.drawCorrelationMatrix();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.drawCorrelationMatrix();
        }
    }

    calculateCorrelationValues(data) {
        if (!data || data.length === 0) return [];
        const selectedColumns = ['total_bill', 'tip', 'size'];
        const correlationMatrix = selectedColumns.map((col1) =>
            selectedColumns.map((col2) => {
                const values1 = data.map(d => +d[col1]);
                const values2 = data.map(d => +d[col2]);

                const mean1 = d3.mean(values1);
                const mean2 = d3.mean(values2);

                let covariance = 0;
                let stdDev1 = 0;
                let stdDev2 = 0;
                for (let i = 0; i < values1.length; i++) {
                    covariance += (values1[i] - mean1) * (values2[i] - mean2);
                    stdDev1 += Math.pow(values1[i] - mean1, 2);
                    stdDev2 += Math.pow(values2[i] - mean2, 2);
                }
                covariance /= values1.length;
                stdDev1 = Math.sqrt(stdDev1 / values1.length);
                stdDev2 = Math.sqrt(stdDev2 / values1.length);

                return covariance / (stdDev1 * stdDev2);
            })
        );
        return correlationMatrix;
    }

    drawCorrelationMatrix() {
        const { data, onCellClick } = this.props;
        if (!data || data.length === 0) return;

        const selectedColumns = ['total_bill', 'tip', 'size'];  //no extra nonsense!

        const svg = d3.select(this.svgRef.current);
        const margin = { top: 100, right: 100, bottom: 150, left: 100 };

        const correlationValues = this.calculateCorrelationValues(data);
        const minCorrelation = d3.min(correlationValues.flat());
        const maxCorrelation = d3.max(correlationValues.flat());

        const colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRdYlBu)
            .domain([minCorrelation, maxCorrelation]);

        const cellSize = (this.width - margin.left - margin.right) / correlationValues.length; //i want square cells and i want width from the class

        svg.selectAll('*').remove();

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        g.selectAll('.row-label')
            .data(selectedColumns)
            .enter().append('text')
            .attr('class', 'row-label')
            .attr('x', (d, i) => i * cellSize + cellSize / 2)
            .attr('y', this.height - margin.bottom - 20)
            .attr('text-anchor', 'middle')
            .text(d => d === 'size' ? 'group size' : d);

        g.selectAll('.column-label')
            .data(selectedColumns)
            .enter().append('text')
            .attr('class', 'column-label')
            .attr('x', -20)
            .attr('y', (d, i) => i * cellSize + cellSize / 2)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            .text(d => d === 'size' ? 'group size' : d);

        g.selectAll('.cell')
            .data(correlationValues.flat())
            .enter().append('rect')
            .attr('class', 'cell')
            .attr('x', (d, i) => (i % correlationValues.length) * cellSize)
            .attr('y', (d, i) => Math.floor(i / correlationValues.length) * cellSize)
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', d => colorScale(d))
            .on('click', (event, d) => {
                const row = Math.floor((event.offsetY - margin.top) / cellSize);
                const col = Math.floor((event.offsetX - margin.left) / cellSize);
                const var1 = selectedColumns[col];
                const var2 = selectedColumns[row];
                onCellClick(var1, var2);
            })
            .append('title')
            .text(d => typeof d === 'number' ? d.toFixed(1) : '');

        g.selectAll('.label')
            .data(correlationValues.flat())
            .enter().append('text')
            .attr('class', 'label')
            .attr('x', (d, i) => (i % correlationValues.length) * cellSize + cellSize / 2)
            .attr('y', (d, i) => Math.floor(i / correlationValues.length) * cellSize + cellSize / 2)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text(d => typeof d === 'number' ? d.toFixed(2) : '');

        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - margin.right + 20},${margin.top})`);

        const legendScale = d3.scaleLinear()
            .domain([minCorrelation, maxCorrelation])
            .range([0, cellSize * correlationValues.length]);

        const legendGradient = legend.append('defs')
            .append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        legendGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', colorScale(minCorrelation));

        legendGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', colorScale(maxCorrelation));

        legend.append('rect')
            .attr('width', 20)
            .attr('height', cellSize * correlationValues.length)
            .style('fill', 'url(#legend-gradient)');

        const legendAxis = d3.axisRight(legendScale)
            .ticks(5)
            .tickSize(10);

        legend.append('g')
            .attr('class', 'legend-axis')
            .attr('transform', `translate(20, 0)`)
            .call(legendAxis);
    }

    render() {
        return (
            <svg ref={this.svgRef} width={this.width} height={this.height}></svg>
        );
    }
}

export default CorrelationMatrix;
