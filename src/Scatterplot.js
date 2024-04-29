import React, { Component } from 'react';
import * as d3 from 'd3';

class Scatterplot extends Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.width = 500;
    this.height = 500;
    this.margin = { top: 20, right: 20, bottom: 50, left: 50 };
  }

  componentDidUpdate(prevProps) {
    const { data, xVariable, yVariable } = this.props;
    if (!data || !xVariable || !yVariable) return;

    const svg = d3.select(this.svgRef.current);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => +d[xVariable]))
      .range([this.margin.left, this.width - this.margin.right]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => +d[yVariable]))
      .range([this.height - this.margin.bottom, this.margin.top]);

    svg.selectAll('*').remove();

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(+d[xVariable]))
      .attr('cy', d => yScale(+d[yVariable]))
      .attr('r', 5)
      .attr('fill', 'steelblue');

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
      .call(xAxis);

    svg.append('g')
      .attr('transform', `translate(${this.margin.left},0)`)
      .call(yAxis);

    // X-axis label
    svg.append('text')
      .attr('x', this.width / 2)
      .attr('y', this.height - 10)
      .attr('text-anchor', 'middle')
      .text(xVariable);

    // Y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .text(yVariable);
  }

  render() {
    return (
      <svg ref={this.svgRef} width={this.width} height={this.height}></svg>
    );
  }
}

export default Scatterplot;
