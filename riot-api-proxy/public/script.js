// Constants for the charts, that would be useful.
const CHART_WIDTH = 400;
const CHART_HEIGHT = 200;
const MARGIN = { left: 250, bottom: 0, top: 100, right: 0 };
const ANIMATION_DUATION = 300;

const radius = 100;

let svgBar, svgLine, svgArea, svgScatter, svgHeatmap, svgDualBar, svgRadar, svgTree;
let isDataLoaded = false,
  loadingData = false;

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("font-size", 10)
  .style("position", "absolute")
  .style("background-color", "#000000")
  .style("color", "white")
  .style("padding", "10px")
  .style("border", "1px solid #aac8e4")
  .style("border-radius", "5px")
  .style("pointer-events", "none")
  .style("opacity", 0);

const matches = [];
let selectedMatch = null;
let selectedChampion = null;

let globalData = null;
let matchIdMap = new Map();

setup();

function setup() {
  // Fill in some d3 setting up here if you need
  // for example, svg for each chart, g for axis and shapes

  //event listeners
  d3.select("#matchSelect").on("change", changeSelectedMatch);
  document.addEventListener("DOMContentLoaded", fillMatchDropdown);

  //svg for bar chart
  svgBar = d3
    .select("#Barchart-div")
    .append("svg")
    .append("g")
    .attr("transform", `translate(${MARGIN.left - 200}, ${30})`);

  // Add x-axis label for Bar Chart
  svgBar
    .append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", CHART_WIDTH / 2)
    .attr("y", CHART_HEIGHT + MARGIN.bottom + 60)
    .text("Champion")
    .style("fill", "white");

  // Add y-axis label for Bar Chart
  svgBar
    .append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`)
    .attr("x", -CHART_HEIGHT / 2)
    .attr("y", -30)
    .text("Frequency")
    .style("fill", "white");

  //add legend for bar chart
  svgBar.append("rect").attr("x", 130).attr("y", -30).attr("width", 20).attr("height", 20).attr("fill", "#85d0ff");
  svgBar.append("text").attr("x", 160).attr("y", -15).attr("font-size", 12).text("Wins").style("fill", "white");
  svgBar.append("rect").attr("x", 200).attr("y", -30).attr("width", 20).attr("height", 20).attr("fill", "#e54787");
  svgBar.append("text").attr("x", 230).attr("y", -15).attr("font-size", 12).text("Losses").style("fill", "white");

  //svg for line chart
  svgLine = d3
    .select("#Linechart-div")
    .append("svg")
    .append("g")
    .attr("transform", `translate(${MARGIN.left - 200}, ${30})`);

  // Add x-axis label for Line Chart
  svgLine
    .append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", CHART_WIDTH / 2)
    .attr("y", CHART_HEIGHT + MARGIN.bottom + 50)
    .text("Games Ago")
    .style("fill", "white");

  // Add y-axis label for Line Chart
  svgLine
    .append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`)
    .attr("x", -CHART_HEIGHT / 2)
    .attr("y", -30)
    .text("Gold per Minute")
    .style("fill", "white");

  // legend for line chart
  svgLine.append("rect").attr("x", 130).attr("y", -30).attr("width", 20).attr("height", 20).attr("fill", "#85d0ff");
  svgLine.append("text").attr("x", 160).attr("y", -15).attr("font-size", 12).text("Wins").style("fill", "white");
  svgLine.append("rect").attr("x", 200).attr("y", -30).attr("width", 20).attr("height", 20).attr("fill", "#e54787");
  svgLine.append("text").attr("x", 230).attr("y", -15).attr("font-size", 12).text("Losses").style("fill", "white");

  //svg for scatter plot
  svgScatter = d3
    .select("#Scatterplot-div")
    .append("svg")
    .append("g")
    .attr("transform", `translate(${MARGIN.left - 200}, ${30})`);

  // Add x-axis label for Scatter Plot
  svgScatter
    .append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", CHART_WIDTH / 2)
    .attr("y", CHART_HEIGHT + MARGIN.bottom + 50)
    .text("Deaths")
    .style("fill", "white");

  // Add y-axis label for Scatter Plot
  svgScatter
    .append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`)
    .attr("x", -CHART_HEIGHT / 2)
    .attr("y", -30)
    .text("Kills")
    .style("fill", "white");

  // legend for line chart
  svgScatter.append("rect").attr("x", 130).attr("y", -30).attr("width", 20).attr("height", 20).attr("fill", "#85d0ff");
  svgScatter.append("text").attr("x", 160).attr("y", -15).attr("font-size", 12).text("Wins").style("fill", "white");
  svgScatter.append("rect").attr("x", 200).attr("y", -30).attr("width", 20).attr("height", 20).attr("fill", "#e54787");
  svgScatter.append("text").attr("x", 230).attr("y", -15).attr("font-size", 12).text("Losses").style("fill", "white");

  svgHeatmap = d3
    .select("#CalendarHeatmap-div")
    .append("svg")
    .attr("width", 120)
    .append("g")
    .attr("transform", `translate(100, -15)`);

  svgDualBar = d3
    .select("#DualBarChart-div")
    .append("svg")
    .attr("width", CHART_WIDTH + MARGIN.left + MARGIN.right - 30)
    .attr("height", CHART_HEIGHT + MARGIN.top + MARGIN.bottom - 200)
    .append("g") // Add a group to handle transformations
    .attr("transform", `translate(${50}, ${MARGIN.top - 50})`);

  svgRadar = d3
    .select("#RadarChart-div")
    .append("svg")
    .attr("width", CHART_WIDTH)
    .attr("height", CHART_HEIGHT)
    .append("g")
    .attr("transform", `translate(${150}, ${50})`);

  svgTree = d3
    .select("#TreeChart-div")
    .append("svg")
    .attr("width", CHART_WIDTH)
    .attr("height", CHART_HEIGHT)
    .append("g");
}

const format = (value) => {
  const formattedValue = d3.format(".2f")(value);
  return formattedValue.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
};

/**
 * Render the visualizations
 * @param data
 */
function update(data) {
  updateBarChart(data);
  updateLineChart(data);
  updateScatterPlot(data);
  updateHeatmap(data);
  updateDualBarChart(data);
  updateRadarChart(data);
  updateTreeChart(data);

}

/**
 * Update the bar chart
 */
function updateBarChart(data) {
  //Chat GPT aided

  if (!data || data.singleMatchData.length === 0) return;

  const puuidData = data.puuidData;
  const championCounts = {};

  // Create an object to track wins and losses for each champion
  data.singleMatchData.forEach((match) => {
    const playerData = match.info.participants.find((participant) => participant.puuid === puuidData);

    if (playerData) {
      const championName = playerData.championName;
      if (!championCounts[championName]) {
        championCounts[championName] = { wins: 0, losses: 0 };
      }
      if (playerData.win) {
        championCounts[championName].wins += 1;
      } else {
        championCounts[championName].losses += 1;
      }
    }
  });

  // Transform championCounts into an array
  const championData = Object.entries(championCounts).map(([name, counts]) => ({
    name,
    wins: counts.wins,
    losses: counts.losses,
  }));

  const xAxis = d3
    .scaleBand()
    .domain(championData.map((d) => d.name))
    .range([0, CHART_WIDTH])
    .padding(0.2);

  const yAxis = d3
    .scaleLinear()
    .domain([0, d3.max(championData, (d) => d.wins + d.losses)]) // Scale based on total games
    .range([CHART_HEIGHT, 0]);

  svgBar.select(".x-axis").remove();
  svgBar
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${CHART_HEIGHT})`)
    .call(d3.axisBottom(xAxis))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .selectAll("line, path")
    .attr("stroke", "white");

  svgBar.select(".y-axis").remove();
  svgBar.append("g").attr("class", "y-axis").call(d3.axisLeft(yAxis));

  svgBar.selectAll("g.bar-group").remove();
  const bars = svgBar
    .selectAll("g.bar-group")
    .data(championData)
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", (d) => `translate(${xAxis(d.name)}, 0)`);

  // Append losses bars
  bars
    .append("rect")
    .attr("class", "loss-bar")
    .attr("x", 0)
    .attr("y", (d) => yAxis(d.losses))
    .attr("width", xAxis.bandwidth())
    .attr("height", (d) => CHART_HEIGHT - yAxis(d.losses))
    .attr("fill", "#e54787")
    .attr("stroke", function (d) {
      return d.name === selectedChampion ? "gold" : "white";
    })
    .attr("stroke-width", 2);

  // Append wins bars on top of losses
  bars
    .append("rect")
    .attr("class", "win-bar")
    .attr("x", 0)
    .attr("y", (d) => yAxis(d.losses + d.wins))
    .attr("width", xAxis.bandwidth())
    .attr("height", (d) => CHART_HEIGHT - yAxis(d.wins))
    .attr("fill", "#85d0ff")
    .attr("stroke", function (d) {
      return d.name === selectedChampion ? "gold" : "white";
    })
    .attr("stroke-width", 2);

  // Add tooltip functionality to both sections
  bars
    .on("mouseover", function (event, d) {
      const playerData = data.singleMatchData
        .find((match) =>
          match.info.participants.some(
            (participant) => participant.championName === d.name && participant.puuid === puuidData
          )
        )
        ?.info.participants.find((participant) => participant.championName === d.name);

      const lane = playerData ? playerData.lane : "Unknown lane";
      const role = playerData ? playerData.role : "Unknown role";
      // Hover effect
      d3.select(this).classed("scaled", true);
      tooltip.transition().duration(50).style("opacity", 1);
      tooltip
        .html(() => {
          return `<div>${d.name}</div><div>Lane: ${lane}</div><div>Role: ${role}</div><div>Record: ${d.wins} - ${d.losses}</div>`;
        })
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("background-color", "rgba(0, 0, 0, 0.8)");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px") // Update position on move
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      // End hover effect
      d3.select(this).classed("scaled", false);
      tooltip.transition().duration(200).style("opacity", 0);
    })
    .on("click", function (event, d) {
      if (selectedChampion === d.name) {
        selectedChampion = null;
      } else {
        selectedChampion = d.name;
      }
      update(data);
    });
}

/**
 * Update the line chart
 */
function updateLineChart(data) {
  if (!data || data.singleMatchData.length === 0) return;

  const puuidData = data.puuidData;

  // Collect gold/sec data for each game
  let lineData = data.singleMatchData
    .map((match, index) => {
      const playerData = match.info.participants.find((participant) => participant.puuid === puuidData);

      return playerData
        ? {
            gamesAgo: data.singleMatchData.length - index, // index + 1 games ago, reversed
            goldPerSecond: playerData.goldEarned / playerData.timePlayed,
            win: playerData.win,
            gameId: data.singleMatchData[index].info.gameId,
            championName: playerData.championName,
          }
        : null;
    })
    .filter(Boolean); // Remove any null entries in case the player wasn't found

  //filter out champion names
  if (selectedChampion !== null) {
    lineData = lineData.filter((d) => d.championName === selectedChampion);
  }

  // Define x-axis as 'games ago'
  const xAxis = d3
    .scaleLinear()
    .domain([0, d3.max(lineData, (d) => d.gamesAgo)])
    .range([0, CHART_WIDTH]);
  // Define y-axis as 'gold per second'
  const yAxis = d3
    .scaleLinear()
    .domain([0, d3.max(lineData, (d) => d.goldPerSecond)])
    .range([CHART_HEIGHT, 0]);

  // Calculate a reasonable number of ticks based on the number of data points
  const numberOfTicks = Math.min(lineData.length, 10);

  // Append x-axis
  svgLine.select(".x-axis").remove();
  const xAxisGroup = svgLine
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${CHART_HEIGHT})`)
    .call(d3.axisBottom(xAxis).tickFormat((d, i) => (i % 2 === 0 ? d : "")))
    .selectAll("line, path")
    .attr("stroke", "white");

  // Customize the tick values
  const tickValues = lineData
    .map((d, i) => (i % Math.ceil(lineData.length / numberOfTicks) === 0 ? d.gamesAgo : null))
    .filter((d) => d !== null);
  xAxisGroup.call(d3.axisBottom(xAxis).tickValues(tickValues));

  // Append y-axis
  svgLine.select(".y-axis").remove();
  svgLine.append("g").attr("class", "y-axis").call(d3.axisLeft(yAxis));

  // Draw the line
  svgLine.selectAll("path.line").remove();

  // Line generator
  const lineGenerator = d3
    .line()
    .x((d) => xAxis(d.gamesAgo))
    .y((d) => yAxis(d.goldPerSecond));

  svgLine
    .append("path")
    .datum(lineData)
    .attr("class", "line")
    .attr("d", lineGenerator)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  // Create circles for each point on the line
  svgLine.selectAll("circle").remove();
  const points = svgLine.selectAll("circle").data(lineData);
  const radius = 7;

  points
    .enter()
    .append("circle")
    .attr("cx", (d) => xAxis(d.gamesAgo))
    .attr("cy", (d) => yAxis(d.goldPerSecond))
    .attr("r", radius)
    .attr("fill", function (data) {
      if (data.gameId === selectedMatch) {
        return "gold";
      } else {
        return data.win ? "#85d0ff" : "#e54787";
      }
    })

    //Chat GPT aided
    .on("mouseover", function (event, d) {
      // Show the tooltip with y-value (gold per second)
      d3.select(this).classed("scaled", true);
      tooltip.transition().duration(50).style("opacity", 1);
      tooltip
        .html(() => {
          return `<div>Gold/min: ${format(d.goldPerSecond * 60)}</div>`;
        })
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("background-color", "rgba(0, 0, 0, 0.8)");

      const color = d3.color(d3.select(this).attr("fill"));

      // Add a floating border circle
      d3.select(this.parentNode)
        .append("circle")
        .attr("class", "floating-border")
        .attr("cx", d3.select(this).attr("cx"))
        .attr("cy", d3.select(this).attr("cy"))
        .attr("r", radius)
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .style("opacity", 0)
        .transition()
        .duration(100)
        .attr("r", radius + 2)
        .style("opacity", 1);

      d3.select(this)
        .transition()
        .duration(100)
        .attr("r", radius - 0.5);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px") // Update position on move
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      // End hover effect
      d3.select(this).classed("scaled", false);
      tooltip.transition().duration(200).style("opacity", 0);

      // Remove the floating border circle with transition
      d3.select(this.parentNode)
        .selectAll(".floating-border")
        .transition()
        .duration(300)
        .attr("r", radius)
        .style("opacity", 0)
        .remove();

      // Reset the size of the inner circle with transition
      d3.select(this)
        .transition()
        .duration(300)
        .attr("r", radius + 0.5);

      d3.select(this).attr("fill", function (data) {
        if (data.gameId === selectedMatch) {
          return "gold";
        } else {
          return data.win ? "#85d0ff" : "#e54787";
        }
      });
    })
    .on("click", function (event, d) {
      if (selectedMatch === d.gameId) {
        selectedMatch = null;
      } else {
        selectedMatch = d.gameId;
      }
      update(data);
    });

  points.exit().remove();
}

/**
 * update the scatter plot.
 */

function updateScatterPlot(data) {
  if (!data || data.singleMatchData.length === 0) return;

  const puuidData = data.puuidData;

  // Collect deaths and kills data for each game
  let scatterData = data.singleMatchData
    .map((match) => {
      const playerData = match.info.participants.find((participant) => participant.puuid === puuidData);

      return playerData
        ? {
            deaths: playerData.deaths,
            kills: playerData.kills,
            win: playerData.win,
            gameId: match.info.gameId,
            championName: playerData.championName,
          }
        : null;
    })
    .filter(Boolean); // Remove null entries if player wasn't found
  //filter out champion names
  if (selectedChampion !== null) {
    scatterData = scatterData.filter((d) => d.championName === selectedChampion);
  }

  // Define x-axis for deaths
  const xAxis = d3
    .scaleLinear()
    .domain([0, d3.max(scatterData, (d) => d.deaths)])
    .range([0, CHART_WIDTH]);

  // Define y-axis for kills
  const yAxis = d3
    .scaleLinear()
    .domain([0, d3.max(scatterData, (d) => d.kills)])
    .range([CHART_HEIGHT, 0]);

  // Append x-axis
  svgScatter.select(".x-axis").remove();
  svgScatter
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${CHART_HEIGHT})`)
    .call(d3.axisBottom(xAxis))
    .selectAll("line, path")
    .attr("stroke", "white");

  // Append y-axis
  svgScatter.select(".y-axis").remove();
  svgScatter
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yAxis))
    .selectAll("line, path")
    .attr("stroke", "white");

  // Draw points
  svgScatter.selectAll("circle").remove();
  const points = svgScatter.selectAll("circle").data(scatterData);
  const radius = 7;

  points
    .enter()
    .append("circle")
    .attr("cx", (d) => xAxis(d.deaths))
    .attr("cy", (d) => yAxis(d.kills))
    .attr("r", radius)
    .attr("fill", function (data) {
      if (data.gameId === selectedMatch) {
        return "gold";
      } else {
        return data.win ? "#85d0ff" : "#e54787";
      }
    })

    .on("mouseover", function (event, d) {
      // Hover effect
      d3.select(this).classed("scaled", true);
      tooltip.transition().duration(50).style("opacity", 1);
      tooltip
        .html(() => {
          return `<div>Kills: ${d.kills}</div><div>Deaths: ${d.deaths}</div><div>Win: ${d.win}</div>`;
        })
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("background-color", "rgba(0, 0, 0, 0.8)");
      const color = d3.color(d3.select(this).attr("fill"));

      // Add a floating border circle
      d3.select(this.parentNode)
        .append("circle")
        .attr("class", "floating-border")
        .attr("cx", d3.select(this).attr("cx"))
        .attr("cy", d3.select(this).attr("cy"))
        .attr("r", radius)
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .style("opacity", 0)
        .transition()
        .duration(100)
        .attr("r", radius + 2)
        .style("opacity", 1);

      d3.select(this)
        .transition()
        .duration(100)
        .attr("r", radius - 0.5);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px") // Update position on move
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      // End hover effect
      d3.select(this).classed("scaled", false);
      tooltip.transition().duration(200).style("opacity", 0);

      // Remove the floating border circle with transition
      d3.select(this.parentNode)
        .selectAll(".floating-border")
        .transition()
        .duration(300)
        .attr("r", radius)
        .style("opacity", 0)
        .remove();

      // Reset the size of the inner circle with transition
      d3.select(this)
        .transition()
        .duration(300)
        .attr("r", radius + 0.5);

      // Change the color of the dot back
      d3.select(this).attr("fill", function (data) {
        if (data.gameId === selectedMatch) {
          return "gold";
        } else {
          return data.win ? "#85d0ff" : "#e54787";
        }
      });
    })
    .on("click", function (event, d) {
      if (selectedMatch === d.gameId) {
        selectedMatch = null;
      } else {
        selectedMatch = d.gameId;
      }
      update(data);
    });

  points.attr("cx", (d) => xAxis(d.deaths)).attr("cy", (d) => yAxis(d.kills));

  points.exit().remove();
}

/**
 * update the calendar heatmap.
 */
function updateHeatmap(data) {
  if (!data || data.singleMatchData.length === 0) return;
  const heatmapData = d3
    .rollups(
      data.singleMatchData,
      (matches) => {
        const wins = matches.filter(
          (match) => match.info.participants.find((participant) => participant.puuid === data.puuidData).win
        ).length;
        const losses = matches.length - wins;
        return { wins, losses };
      },
      (match) => new Date(match.info.gameCreation).toDateString()
    )
    .map(([date, { wins, losses }]) => ({
      Date: new Date(date).toISOString().split("T")[0], // Format date as YYYY-MM-DD
      wins: wins.toString(),
      losses: losses.toString(),
    }));

  // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  sample = heatmapData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

  const dateValues = sample.map((dv) => ({
    date: d3.timeDay(new Date(dv.Date)),
    wins: Number(dv.wins),
    losses: Number(dv.losses),
  }));

  const svg = svgHeatmap;

  function draw() {
    const years = Array.from(
      d3.group(dateValues, (d) => d.date.getUTCFullYear()),
      ([key, values]) => ({ key, values })
    ).reverse();

    const cellSize = 22;
    const yearHeight = cellSize * 7;

    const group = svg.append("g");

    const year = group
      .selectAll("g")
      .data(years)
      .join("g")
      .attr("transform", (d, i) => `translate(50, ${yearHeight * i + cellSize * 1.5})`);

    const formatDay = (d) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d.getUTCDay()];
    const countDay = (d) => d.getUTCDay();
    const timeWeek = d3.utcSunday;
    const formatDate = d3.utcFormat("%x");
    const colorFn = d3
      .scaleThreshold()
      .domain([0.49, 0.51, 0.75]) // Define thresholds for the categories
      .range(["#e54787", "white", "#1dc49b", "#85d0ff"]); // Define colors for the categories

    const formatPercent = (value) => {
      const formattedValue = d3.format(".1%")(value);
      return formattedValue.replace(/\.0+%$/, "%");
    };

    year
      .append("g")
      .attr("text-anchor", "end")
      .selectAll("text")
      .data(d3.range(7).map((i) => new Date(1995, 0, i)))
      .join("text")
      .attr("x", -5)
      .attr("y", (d) => (countDay(d) + 0.5) * cellSize)
      .attr("dy", "0.31em")
      .attr("font-size", 12)
      .style("fill", "white")
      .text(formatDay);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Generate a complete list of dates within the range
    const allDates = [];
    for (let d = new Date(twoMonthsAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d));
    }

    // Merge the complete list of dates with existing data
    const completeData = allDates.map((date) => {
      const existingData = dateValues.find((d) => d3.timeDay(d.date).getTime() === d3.timeDay(date).getTime());
      return existingData ? existingData : { date, wins: null, losses: null };
    });

    const formatMonth = d3.timeFormat("%b"); // Format for abbreviated month name

    // Get the unique months from the data
    const uniqueMonths = Array.from(new Set(completeData.map((d) => d.date.getMonth()))).sort((a, b) => a - b);

    year
      .append("g")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(uniqueMonths.map((month) => new Date(1995, month, 1))) // Use unique months as data
      .join("text")
      .attr("x", (d, i) => (i + 0.5) * cellSize * 4) // Position the text elements horizontally
      .attr("y", -10) // Position the text elements on top
      .attr("dy", "0.31em")
      .attr("font-size", 12)
      .style("fill", "white")
      .text(formatMonth);

    year
      .append("g")
      .selectAll("rect")
      .data((d) => completeData)
      .join("rect")
      .attr("width", cellSize - 3)
      .attr("height", cellSize - 3)
      .attr("x", (d, i) => timeWeek.count(twoMonthsAgo, d.date) * cellSize + 10)
      .attr("y", (d) => countDay(d.date) * cellSize + 0.5)
      .attr("fill", (d) => (d.wins != null ? colorFn(d.wins / (d.wins + d.losses)) : "#333333"))
      .attr("stroke", (d) => (d.wins != null ? colorFn(d.wins / (d.wins + d.losses)) : "#333333"))
      .attr("stroke-width", "0px")
      .attr("opacity", (d) => {
        const totalGames = d.wins + d.losses;
        if (totalGames >= 7) {
          return 1; // Highest opacity
        } else if (totalGames >= 5) {
          return 0.8;
        } else if (totalGames >= 3) {
          return 0.6;
        } else if (totalGames > 0) {
          return 0.4;
        } else {
          return 1; // Lowest opacity for no games
        }
      })
      .attr("rx", 2) // Rounded Corners
      .attr("ry", 2)
      .on("mouseover", function (event, d) {
        // Hover effect
        if (d.wins + d.losses === 0) return;
        d3.select(this).classed("scaled", true);
        tooltip.transition().duration(50).style("opacity", 1);
        tooltip
          .html(() => {
            const winRate = d.wins / (d.wins + d.losses);
            const winRateColor = colorFn(winRate); // Get the color from colorFn
            return `
            <div>${formatDate(d.date)}</div>
            <div>Win Rate: <span style="color: ${winRateColor}">${formatPercent(winRate)}</span></div>
            <div>Record: ${d.wins} - ${d.losses}</div>
          `;
          })
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("background-color", "rgba(0, 0, 0, 0.8)");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px") // Update position on move
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        // End hover effect
        d3.select(this).classed("scaled", false);
        tooltip.transition().duration(200).style("opacity", 0);
      });

    const legend = group.append("g").attr("transform", `translate(10, ${years.length * yearHeight + cellSize * 4})`);

    // Set the bottom legend and on click toggles
    const names = ["bad day", "", "", "good day"];
    const bounds = [0, 49, 51, 75];
    const boundMaxes = [49, 51, 75, 100];
    const categoriesCount = 4;
    const categories = [...Array(categoriesCount)].map((_, i) => {
      const name = names[i];
      const bound = bounds[i];
      const boundMax = boundMaxes[i];

      return {
        name,
        bound,
        boundMax,
        color: colorFn(bound / 100),
        selected: true,
      };
    });

    const legendWidth = 50;
    const legendMargin = 5;

    function toggle(legend) {
      const { bound, boundMax, selected } = legend.srcElement.__data__;

      legend.srcElement.__data__.selected = !selected;

      d3.select(legend.srcElement)
        .transition()
        .duration(200)
        .style("fill-opacity", legend.srcElement.__data__.selected ? 1 : 0.6);

      const highlightedDates = years.map((y) => {
        const filteredValues = y.values.filter((v) => {
          const winRate = v.wins / (v.wins + v.losses);
          const isInBound = winRate > bound / 100 && winRate <= boundMax / 100;
          return isInBound;
        });
        return {
          key: y.key,
          values: filteredValues,
        };
      });

      year
        .data(highlightedDates)
        .selectAll("rect")
        .data(
          (d) => d.values,
          (d) => d.date
        )
        .transition()
        .duration(400)
        .attr("fill", (d) => (legend.srcElement.__data__.selected ? colorFn(d.wins / (d.wins + d.losses)) : "grey"));
    }

    legend
      .selectAll("rect")
      .data(categories)
      .enter()
      .append("rect")
      .attr("fill", (d) => d.color)
      .attr("x", (d, i) => i * (legendWidth + legendMargin))
      .attr("width", legendWidth)
      .attr("height", 15)
      .attr("rx", 2)
      .attr("ry", 2)
      .on("click", toggle);

    legend
      .selectAll("text")
      .data(categories)
      .join("text")
      .attr("x", (d, i) => i * (legendWidth + legendMargin))
      .attr("y", 30) // Set a constant y position
      .attr("text-anchor", "start")
      .attr("font-size", 11)
      .style("fill", "white")
      .text((d) => `${d.name}`);

    legend
      .append("text")
      .attr("dy", -5)
      .attr("font-size", 14)
      .style("fill", "white")
      .attr("text-decoration", "underline")
      .text("Click on category to select/deselect days");
  }

  draw();
}

function updateDualBarChart(data) {
  let dataSelf, dataOpponent;

  let count = 0;

  //averages data
  if (selectedMatch == null) {
    // Calculate averages
    const puuid = data.puuidData;

    playerTotals = new Map();
    opponentTotals = new Map();


    for (let i = 0; i < data.singleMatchData.length; i++) {
      //get player data
      const match = data.singleMatchData[i];
      const playerData = match.info.participants.find((participant) => participant.puuid === puuid);

      if (selectedChampion !== null && playerData.championName !== selectedChampion) {
        continue;
      }

      count++;

      //find opponent w/ matching lane
      const opponentData = match.info.participants.find(
        (participant) => participant.individualPosition === playerData.individualPosition && participant.puuid !== puuid
      );

      //add player data
      for (let [key, value] of Object.entries(playerData)) {
        if (playerTotals.has(key)) {
          playerTotals.set(key, playerTotals.get(key) + value);
        } else {
          playerTotals.set(key, value);
        }
      }

      //add opponent data
      for (let [key, value] of Object.entries(opponentData)) {
        if (opponentTotals.has(key)) {
          opponentTotals.set(key, opponentTotals.get(key) + value);
        } else {
          opponentTotals.set(key, value);
        }
      }
    }

    //calculate averages
    for (let [key, value] of playerTotals) {
      playerTotals.set(key, value / count);
    }

    for (let [key, value] of opponentTotals) {
      opponentTotals.set(key, value / count);
    }

    dataSelf = [
      { label: "Kills", value: playerTotals.get("kills") },
      { label: "Assists", value: playerTotals.get("assists") },
      { label: "Deaths", value: playerTotals.get("deaths") },
      { label: "Damage Taken", value: playerTotals.get("totalDamageTaken") },
      { label: "Total Damage", value: playerTotals.get("totalDamageDealt") },
      { label: "Gold Earned", value: playerTotals.get("goldEarned") },
      { label: "Minion Kills", value: playerTotals.get("totalMinionsKilled") },
      { label: "Time Dead", value: playerTotals.get("totalTimeSpentDead") },
    ];

    dataOpponent = [
      { label: "Kills", value: opponentTotals.get("kills") },
      { label: "Assists", value: opponentTotals.get("assists") },
      { label: "Deaths", value: opponentTotals.get("deaths") },
      { label: "Damage Taken", value: opponentTotals.get("totalDamageTaken") },
      { label: "Total Damage", value: opponentTotals.get("totalDamageDealt") },
      { label: "Gold Earned", value: opponentTotals.get("goldEarned") },
      { label: "Minion Kills", value: opponentTotals.get("totalMinionsKilled") },
      { label: "Time Dead", value: opponentTotals.get("totalTimeSpentDead") },
    ];
  }
  //specific match data
  else {
    const match = data.singleMatchData.find((match) => match.info.gameId === selectedMatch);
    const puuid = data.puuidData;
    const playerData = match.info.participants.find((participant) => participant.puuid === puuid);
    dataSelf = [
      { label: "Kills", value: playerData.kills },
      { label: "Assists", value: playerData.assists },
      { label: "Deaths", value: playerData.deaths },
      { label: "Damage Taken", value: playerData.totalDamageTaken },
      { label: "Total Damage", value: playerData.totalDamageDealt },
      { label: "Gold Earned", value: playerData.goldEarned },
      { label: "Minion Kills", value: playerData.totalMinionsKilled },
      { label: "Time Dead", value: playerData.totalTimeSpentDead },
    ];

    //find opponent
    const opponentData = match.info.participants.find(
      (participant) => participant.individualPosition === playerData.individualPosition && participant.puuid !== puuid
    );
    dataOpponent = [
      { label: "Kills", value: opponentData.kills },
      { label: "Assists", value: opponentData.assists },
      { label: "Deaths", value: opponentData.deaths },
      { label: "Damage Taken", value: opponentData.totalDamageTaken },
      { label: "Total Damage", value: opponentData.totalDamageDealt },
      { label: "Gold Earned", value: opponentData.goldEarned },
      { label: "Minion Kills", value: opponentData.totalMinionsKilled },
      { label: "Time Dead", value: opponentData.totalTimeSpentDead },
    ];
  }

  //chat gpt aided in generation, improvements by us

  // Ensure both datasets are compatible
  if (dataSelf.length !== dataOpponent.length || !dataSelf.every((d, i) => d.label === dataOpponent[i].label)) {
    console.error("Data arrays are not compatible.");
    return;
  }

  // Calculate percentages
  const map = dataSelf.map((d1, i) => {
    const d2 = dataOpponent[i];
    const total = d1.value + d2.value;
    return {
      label: d1.label,
      top: (d2.value / total) * 100, // Orange bar (top)
      bottom: (d1.value / total) * 100, // Blue bar (bottom)
      selfValue: d1.value,
      opponentValue: d2.value,
    };
  });

  // Clear existing chart elements
  svgDualBar.selectAll("*").remove();

  // Add a group element for the chart
  const chartGroup = svgDualBar;

  // Define scales, axes, and chart elements
  const xScale = d3
    .scaleBand()
    .domain(map.map((d) => d.label))
    .range([0, CHART_WIDTH])
    .padding(0.2);

  const yScale = d3.scaleLinear().domain([0, 100]).range([CHART_HEIGHT, 0]);

  // Add top x-axis
  chartGroup
    .append("g")
    .attr("transform", `translate(0, -1)`) // -1 due to borders
    .call(d3.axisTop(xScale).tickSize(0))
    .selectAll("text")
    .attr("transform", "rotate(-30)")
    .style("text-anchor", "start")
    .style("fill", "white");

  // Add bottom x-axis
  chartGroup
    .append("g")
    .attr("transform", `translate(0, ${CHART_HEIGHT})`)
    .call(d3.axisBottom(xScale).tickSize(0))
    .selectAll("text")
    .attr("transform", "rotate(-30)")
    .style("text-anchor", "end")
    .style("fill", "white");

  // Render the blue bars (bottom)
  chartGroup
    .selectAll(".bar-bottom")
    .data(map)
    .enter()
    .append("rect")
    .attr("class", "bar-bottom")
    .attr("x", (d) => xScale(d.label))
    .attr("y", (d) => yScale(d.bottom))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => yScale(0) - yScale(d.bottom))
    .attr("fill", "#85d0ff")
    .attr("opacity", 0.8)
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 0.9);

  // Render the orange bars (top)
  chartGroup
    .selectAll(".bar-top")
    .data(map)
    .enter()
    .append("rect")
    .attr("class", "bar-top")
    .attr("x", (d) => xScale(d.label))
    .attr("y", 0) // Start from the top axis
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => yScale(0) - yScale(d.top))
    .attr("fill", "#e54787")
    .attr("opacity", 0.8)
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 0.9);

  // Add dashed line at 50%
  chartGroup
    .append("line")
    .attr("x1", 0)
    .attr("x2", CHART_WIDTH)
    .attr("y1", yScale(50))
    .attr("y2", yScale(50))
    .attr("stroke", "white")
    .attr("stroke-dasharray", "4");

  chartGroup
    .selectAll("rect")
    .on("mouseover", function (event, d) {
      // Hover effect
      if (d.wins + d.losses === 0) return;
      d3.select(this).classed("scaled", true);
      tooltip.transition().duration(50).style("opacity", 1);
      tooltip
        .html(() => {
          if (selectedMatch == null) {
            return `<div>Your Average: ${format(d.selfValue)}</div><div>Opponent's Average: ${format(
              d.opponentValue
            )}</div>`;
          } else {
            return `<div>You: ${d.selfValue}</div><div>Opponent: ${d.opponentValue}</div>`;
          }
        })
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("background-color", "rgba(0, 0, 0, 0.8)");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px") // Update position on move
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      // End hover effect
      d3.select(this).classed("scaled", false);
      tooltip.transition().duration(200).style("opacity", 0);
    });
}

function updateRadarChart(data) {
  // Clear existing chart elements
  svgRadar.selectAll("*").remove();

  let dataSelf, dataOpponent;
  let chosenMatch = data.singleMatchData[0];
  if (selectedMatch !== null) {
    chosenMatch = data.singleMatchData.find((match) => match.info.gameId === selectedMatch);
  }

  // Calculate averages
  const puuid = data.puuidData;

  const chosenPlayerData = chosenMatch.info.participants.find((participant) => participant.puuid === puuid);
  const chosenOpponentData = chosenMatch.info.participants.find(
    (participant) =>
      participant.individualPosition === chosenPlayerData.individualPosition && participant.puuid !== puuid
  );
  playerTotals = new Map();
  opponentTotals = new Map();

  for (let i = 0; i < data.singleMatchData.length; i++) {
    //get player data
    const match = data.singleMatchData[i];
    const playerData = match.info.participants.find((participant) => participant.puuid === puuid);

    //find opponent w/ matching lane
    const opponentData = match.info.participants.find(
      (participant) => participant.individualPosition === playerData.individualPosition && participant.puuid !== puuid
    );

    //add player data
    for (let [key, value] of Object.entries(playerData)) {
      if (playerTotals.has(key)) {
        playerTotals.set(key, playerTotals.get(key) + value);
      } else {
        playerTotals.set(key, value);
      }
    }

    //add opponent data
    for (let [key, value] of Object.entries(opponentData)) {
      if (opponentTotals.has(key)) {
        opponentTotals.set(key, opponentTotals.get(key) + value);
      } else {
        opponentTotals.set(key, value);
      }
    }
  }

  //calculate averages
  for (let [key, value] of playerTotals) {
    playerTotals.set(key, value / data.singleMatchData.length);
  }

  for (let [key, value] of opponentTotals) {
    opponentTotals.set(key, value / data.singleMatchData.length);
  }

  // Calculate gold/min and cs/min
  const totalGameTime = playerTotals.get("timePlayed") / 60;

  const avgPlayerGoldPerMin = playerTotals.get("goldEarned") / totalGameTime;
  const playerGoldPerMin = chosenPlayerData.goldEarned / totalGameTime;
  const avgPlayerCsPerMin = playerTotals.get("totalMinionsKilled") / totalGameTime;
  const playerCsPerMin = chosenPlayerData.totalMinionsKilled / totalGameTime;

  const avgOpponentGoldPerMin = opponentTotals.get("goldEarned") / totalGameTime;
  const opponentGoldPerMin = chosenOpponentData.goldEarned / totalGameTime;
  const avgOpponentCsPerMin = opponentTotals.get("totalMinionsKilled") / totalGameTime;
  const opponentCsPerMin = chosenOpponentData.totalMinionsKilled / totalGameTime;

  dataSelf = [
    { label: "Kills", value: chosenPlayerData.kills, average: playerTotals.get("kills") },
    { label: "Assists", value: chosenPlayerData.assists, average: playerTotals.get("assists") },
    { label: "Deaths", value: chosenPlayerData.deaths, average: playerTotals.get("deaths") },
    {
      label: "Damage Taken",
      value: chosenPlayerData.totalDamageTaken,
      average: playerTotals.get("totalDamageTaken"),
    },
    {
      label: "Total Damage",
      value: chosenPlayerData.totalDamageDealt,
      average: playerTotals.get("totalDamageDealt"),
    },
    { label: "Gold/Min", value: playerGoldPerMin, average: avgPlayerGoldPerMin },
    { label: "CS/Min", value: playerCsPerMin, average: avgPlayerCsPerMin },
  ];

  dataOpponent = [
    { label: "Kills", value: chosenOpponentData.kills, average: opponentTotals.get("kills") },
    { label: "Assists", value: chosenOpponentData.assists, average: opponentTotals.get("assists") },
    { label: "Deaths", value: chosenOpponentData.deaths, average: opponentTotals.get("deaths") },
    {
      label: "Damage Taken",
      value: chosenOpponentData.totalDamageTaken,
      average: opponentTotals.get("totalDamageTaken"),
    },
    {
      label: "Total Damage",
      value: chosenOpponentData.totalDamageTaken,
      average: opponentTotals.get("totalDamageDealt"),
    },
    { label: "Gold/Min", value: opponentGoldPerMin, average: avgOpponentGoldPerMin },
    { label: "CS/Min", value: opponentCsPerMin, average: avgOpponentCsPerMin },
  ];

  console.log(dataSelf);

  const NUM_OF_SIDES = 7,
    NUM_OF_LEVEL = 4,
    size = CHART_HEIGHT,
    offset = Math.PI,
    polyangle = (Math.PI * 2) / NUM_OF_SIDES,
    r = 0.8 * size,
    r_0 = r * 0.75, // chart corner max radius
    center = {
      x: size / 2,
      y: size / 2,
    };

  const scale = (value, average) => {
    const normalizedValue = (value / average) * (r_0 * 0.5);
    return Math.min(Math.max(normalizedValue, 1), r_0);
  };

  const generatePoint = ({ length, angle }) => {
    const point = {
      x: center.x + length * Math.sin(offset - angle),
      y: center.y + length * Math.cos(offset - angle),
    };
    return point;
  };

  let points = [];
  const length = 100;
  for (let vertex = 0; vertex < NUM_OF_SIDES; vertex++) {
    const theta = vertex * polyangle;

    points.push(generatePoint({ length, angle: theta }));
  }

  const drawPath = (points, parent, strokeColor, fillColor) => {
    if (fillColor === undefined) {
      fillColor = "none";
    }
    if (strokeColor === undefined) {
      strokeColor = "black";
    }
    const lineGenerator = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y);

    parent.append("path").attr("d", lineGenerator(points)).style("fill", fillColor).style("stroke", strokeColor);
  };

  const genTicks = (levels) => {
    const ticks = [];
    const step = 100 / levels;
    for (let i = 0; i <= levels; i++) {
      const num = step * i;
      if (Number.isInteger(step)) {
        ticks.push(num);
      } else {
        ticks.push(num.toFixed(2));
      }
    }
    return ticks;
  };

  const ticks = genTicks(NUM_OF_LEVEL);

  const generateAndDrawLevels = (levelsCount, sideCount) => {
    for (let level = levelsCount; level >= 1; level--) {
      const hyp = (level / levelsCount) * r_0;
      const points = [];
      for (let vertex = 0; vertex < sideCount; vertex++) {
        const theta = vertex * polyangle;

        points.push(generatePoint({ length: hyp, angle: theta }));
      }
      const group = svgRadar.append("g").attr("class", "levels");
      let fillColor = "#2c274f";
      if (level % 2 !== 0) {
        fillColor = "#1f183e";
      }
      drawPath([...points, points[0]], group, "grey", fillColor);
    }
  };

  const generateAndDrawLines = (sideCount) => {
    const group = svgRadar.append("g").attr("class", "grid-lines");
    for (let vertex = 1; vertex <= sideCount; vertex++) {
      const theta = vertex * polyangle;
      const point = generatePoint({ length: r_0, angle: theta });

      drawPath([center, point], group, "grey");
    }
  };

  const drawText = (text, point, isAxis, group) => {
    if (isAxis) {
      const xSpacing = text.toString().includes(".") ? 30 : 22;
      group
        .append("text")
        .attr("x", point.x - xSpacing)
        .attr("y", point.y + 5)
        .html(text)
        .style("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-family", "sans-serif");
    } else {
      group
        .append("text")
        .attr("x", point.x)
        .attr("y", point.y)
        .html(text)
        .style("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-family", "sans-serif");
    }
  };

  const drawAxis = (ticks, levelsCount) => {
    const groupL = svgRadar.append("g").attr("class", "tick-lines");
    const point = generatePoint({ length: r_0, angle: 0 });
    drawPath([center, point], groupL, "red"); // vertical line

    const groupT = svgRadar.append("g").attr("class", "ticks");

    ticks.forEach((d, i) => {
      const r = (i / levelsCount) * r_0;
      const p = generatePoint({ length: r, angle: 0 });
      const points = [
        p,
        {
          ...p,
          x: p.x - 10,
        },
      ];
      drawPath(points, groupL, "red"); // horizontal ticks
      drawText(d, p, true, groupT);
    });
  };

  const drawCircles = (points, fillColor) => {
    svgRadar
      .append("g")
      .attr("class", "indic")
      .selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 6)
      .style("opacity", 0)
      .style("fill", d3.color(fillColor).copy({ opacity: 1 }));
  };

  const drawData = (dataset, n, strokeColor, fillColor) => {
    const points = [];
    dataset.forEach((d, i) => {
      const len = scale(d.value, d.average);
      const theta = i * ((2 * Math.PI) / n);

      points.push({
        ...generatePoint({ length: len, angle: theta }),
        value: d.value,
        label: d.label,
      });
    });

    const group = svgRadar.append("g").attr("class", `shape shape-${strokeColor.replace("#", "")}`);

    drawPath([...points, points[0]], group, strokeColor, fillColor);
    drawCircles(points, fillColor);

    const quadtree = d3
      .quadtree()
      .x((d) => d.x)
      .y((d) => d.y)
      .addAll(points);

    group.on("mousemove", function (event, d) {
      const [mx, my] = d3.pointer(event);
      const closest = quadtree.find(mx, my);
      if (closest) {
        tooltip.transition().duration(50).style("opacity", 1);

        const circleElement = d3
          .selectAll("circle")
          .filter((d) => d === closest)
          .node();

        // this is some bs
        const circleRect = circleElement.getBoundingClientRect();
        const tooltipRect = tooltip.node().getBoundingClientRect();
        const tooltipX = circleRect.left + window.scrollX + circleRect.width / 2 - tooltipRect.width / 2;
        const tooltipY = circleRect.top + window.scrollY - tooltipRect.height - 10;

        tooltip
          .html(() => {
            return `<div>${closest.label}: ${format(closest.value)}</div>`;
          })
          .style("left", `${tooltipX}px`)
          .style("top", `${tooltipY}px`)
          .style("background-color", "rgba(0, 0, 0, 0.8)");

        svgRadar.selectAll("circle").style("opacity", 0);
        d3.selectAll("circle")
          .filter((d) => d === closest)
          .style("opacity", 1);
      }
    });

    group.on("mouseleave", function () {
      tooltip.transition().duration(200).style("opacity", 0);
      svgRadar.selectAll("circle").style("opacity", 0);
    });
  };

  const drawLabels = (dataset, sideCount) => {
    const groupL = svgRadar.append("g").attr("class", "labels");
    for (let vertex = 0; vertex < sideCount; vertex++) {
      const angle = vertex * polyangle;
      const label = dataset[vertex].label;
      let lengthMod = 0.75;
      if (vertex === 0) {
        lengthMod = 0.65;
      }
      if (vertex === sideCount / 2) {
        lengthMod = 0.7;
      }
      const point = generatePoint({ length: lengthMod * size, angle });

      drawText(label, point, false, groupL);
    }
  };
  const addLegend = (legendData) => {
    const legend = svgRadar.append("g").attr("class", "legend").attr("transform", "translate(10, 10)");

    legendData.forEach((d, i) => {
      const legendItem = legend.append("g").attr("class", "legend-item");

      legendItem
        .append("rect")
        .attr("x", -i * 70 - 90)
        .attr("y", -60)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", d.color)
        .style("cursor", "pointer")
        .on("click", function () {
          const shape = svgRadar.selectAll(`.shape-${d.color.replace("#", "")}`);
          const isVisible = shape.style("display") !== "none";
          shape.style("display", isVisible ? "none" : "block");

          d3.select(this).style("fill", isVisible ? d.colorInactive : d.color);
        });

      legendItem
        .append("text")
        .attr("x", -i * 70 - 60)
        .attr("y", -50)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .style("fill", "white")
        .text(d.text)
        .on("click", function () {
          const shape = svgRadar.selectAll(`.shape-${d.color.replace("#", "")}`);
          const isVisible = shape.style("display") !== "none";
          shape.style("display", isVisible ? "none" : "block");

          d3.select(this).style("fill", isVisible ? d.color : d.colorInactive);
        });
    });
  };

  const legendData = [
    { color: "#e54787", colorInactive: "#e5478765", text: "Opponent" },
    { color: "#85d0ff", colorInactive: "#85d0ff65", text: "You" },
  ];

  // Call the addLegend function with the legend data
  addLegend(legendData);
  generateAndDrawLevels(NUM_OF_LEVEL, NUM_OF_SIDES);
  generateAndDrawLines(NUM_OF_SIDES);
  // drawAxis(ticks, NUM_OF_LEVEL);
  drawData(dataOpponent, NUM_OF_SIDES, "#e54787", "#e5478735");
  drawData(dataSelf, NUM_OF_SIDES, "#85d0ff", "#85d0ff35");
  drawLabels(dataSelf, NUM_OF_SIDES);
}

function updateTreeChart(data) {

  console.log("in updtreechart");

  let treeData, dataTotals;

  let count = 0;

  //averages data
  if (selectedMatch == null) {
    // Calculate averages
    const puuid = data.puuidData;

    dataTotals = new Map();

    for (let i = 0; i < data.singleMatchData.length; i++) {
      //get player data
      const match = data.singleMatchData[i];
      const playerData = match.info.participants.find((participant) => participant.puuid === puuid);

      if (selectedChampion !== null && playerData.championName !== selectedChampion) {
        continue;
      }

      count++;

      //add player data
      for (let [key, value] of Object.entries(playerData)) {
        if (dataTotals.has(key)) {
          dataTotals.set(key, dataTotals.get(key) + value);
        } else {
          dataTotals.set(key, value);
        }
      }
    }

    //calculate averages
    for (let [key, value] of dataTotals) {
      dataTotals.set(key, value / count);
    }

    for (let [key, value] of opponentTotals) {
      opponentTotals.set(key, value / count);
    }

    treeData = [
      { label: "Total Damage", value: dataTotals.get("totalDamageDealt") },
      { label: "Magic Damage", value: dataTotals.get("magicDamageDealt") },
      { label: "Physical Damage", value: dataTotals.get("physicalDamageDealt") },
      { label: "True Damage", value: dataTotals.get("trueDamageDealt") },
      { label: "Magic Champion Damage", value: dataTotals.get("magicDamageDealtToChampions") },
      { label: "Physical Champion Damage", value: dataTotals.get("physicalDamageDealtToChampions") },
      { label: "True Champion Damage", value: dataTotals.get("trueDamageDealtToChampions") },
    ];
  }
  //specific match data
  else {
    const match = data.singleMatchData.find((match) => match.info.gameId === selectedMatch);
    const puuid = data.puuidData;
    const playerData = match.info.participants.find((participant) => participant.puuid === puuid);
    treeData = [
      { label: "Total Damage", value: playerData.totalDamageDealt },
      { label: "Magic Damage", value: playerData.magicDamageDealt },
      { label: "Physical Damage", value: playerData.physicalDamageDealt },
      { label: "True Damage", value: playerData.trueDamageDealt },
      { label: "Magic Champion Damage", value: playerData.magicDamageDealtToChampions },
      { label: "Physical Champion Damage", value: playerData.physicalDamageDealtToChampions },
      { label: "True Champion Damage", value: playerData.trueDamageDealtToChampions },
    ];
  }

  console.log("treeData", treeData);
  //chat gpt aided in base generation, improvements by us

  const width = 400;
  const height = 600;

  // Clear previous elements
  svgTree.selectAll("*").remove();

  // Transform flat treeData into hierarchical structure
  const hierarchyData = {
      name: "Total Damage", value: treeData.find(d => d.label === "Total Damage").value,
      children: [
          { name: "Magic Damage", value: treeData.find(d => d.label === "Magic Damage").value,
              children: [
                  { name: "Magic Champion Damage", value: treeData.find(d => d.label === "Magic Champion Damage").value },
              ],
           },
          { name: "Physical Damage", value: treeData.find(d => d.label === "Physical Damage").value, 
              children: [
                  { name: "Physical Champion Damage", value: treeData.find(d => d.label === "Physical Champion Damage").value },
              ],
          },
          { name: "True Damage", value: treeData.find(d => d.label === "True Damage").value, 
              children: [
                  { name: "True Champion Damage", value: treeData.find(d => d.label === "True Champion Damage").value },
              ],
          },
      ],
  };

  // based off example tree chart code

  console.log("hierarchyData", hierarchyData);

  const root = d3.hierarchy(hierarchyData)
    .sum(d => d.value || 0.01) // Set the value for the hierarchy layout
    .sort((a, b) => b.height - a.height || b.value - a.value); // Optional sorting

  console.log("root", root);

  // Apply the treemap layout
  const treemapLayout = d3.treemap()
    .size([width, height])
    .tile(d3.treemapBinary)
    .paddingInner(0) // Reduced inner padding
    .paddingOuter(0);


  treemapLayout(root);

    console.log("Treemap layout nodes:", root.leaves());

  // Define a color scale for the tree map white to #85d0ff
  const color = d3.scaleLinear()
    //0 to treeData.values max
    .domain([0, d3.max(treeData, d => d.value)])
    .range(["white", "#85d0ff"]);

  // Create groups for each node
  const cell = svgTree.selectAll("g")
      .data(root.leaves()) // Use only the leaf nodes for rectangles
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

  console.log("cell", cell);
  // Draw rectangles
  cell.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => {
          // Find the parent node
          while (d.depth > 1) d = d.parent;
          return color(d.value);
      })
      .attr("stroke", "#ccc");

  console.log("rect");

  // Add labels to each rectangle
  cell.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .style("font-size", "12px")
      .text(d => d.data.name)
      .append("tspan")
      .attr("x", 4)
      .attr("y", 25)
      .text(d => d.value);

  console.log("text");

  // Add tooltips
  cell.append("title")
      .text(d => `${d.data.name}\n${d.value}`);

  console.log("title");
}

function updateTreeChart(data) {

  console.log("in updtreechart");

  let treeData, dataTotals;

  let count = 0;

  //averages data
  if (selectedMatch == null) {
    // Calculate averages
    const puuid = data.puuidData;

    dataTotals = new Map();

    for (let i = 0; i < data.singleMatchData.length; i++) {
      //get player data
      const match = data.singleMatchData[i];
      const playerData = match.info.participants.find((participant) => participant.puuid === puuid);

      if (selectedChampion !== null && playerData.championName !== selectedChampion) {
        continue;
      }

      count++;

      //add player data
      for (let [key, value] of Object.entries(playerData)) {
        if (dataTotals.has(key)) {
          dataTotals.set(key, dataTotals.get(key) + value);
        } else {
          dataTotals.set(key, value);
        }
      }
    }

    //calculate averages
    for (let [key, value] of dataTotals) {
      dataTotals.set(key, value / count);
    }

    for (let [key, value] of opponentTotals) {
      opponentTotals.set(key, value / count);
    }

    treeData = [
      { label: "Total Damage", value: dataTotals.get("totalDamageDealt") },
      { label: "Magic Damage", value: dataTotals.get("magicDamageDealt") },
      { label: "Physical Damage", value: dataTotals.get("physicalDamageDealt") },
      { label: "True Damage", value: dataTotals.get("trueDamageDealt") },
      { label: "Magic Champion Damage", value: dataTotals.get("magicDamageDealtToChampions") },
      { label: "Physical Champion Damage", value: dataTotals.get("physicalDamageDealtToChampions") },
      { label: "True Champion Damage", value: dataTotals.get("trueDamageDealtToChampions") },
    ];
  }
  //specific match data
  else {
    const match = data.singleMatchData.find((match) => match.info.gameId === selectedMatch);
    const puuid = data.puuidData;
    const playerData = match.info.participants.find((participant) => participant.puuid === puuid);
    treeData = [
      { label: "Total Damage", value: playerData.totalDamageDealt },
      { label: "Magic Damage", value: playerData.magicDamageDealt },
      { label: "Physical Damage", value: playerData.physicalDamageDealt },
      { label: "True Damage", value: playerData.trueDamageDealt },
      { label: "Magic Champion Damage", value: playerData.magicDamageDealtToChampions },
      { label: "Physical Champion Damage", value: playerData.physicalDamageDealtToChampions },
      { label: "True Champion Damage", value: playerData.trueDamageDealtToChampions },
    ];
  }

  console.log("treeData", treeData);
  //chat gpt aided in base generation, improvements by us

  const width = 400;
  const height = 600;

  // Clear previous elements
  svgTree.selectAll("*").remove();

  // Transform flat treeData into hierarchical structure
  const hierarchyData = {
      name: "Total Damage", value: treeData.find(d => d.label === "Total Damage").value,
      children: [
          { name: "Magic Damage", value: treeData.find(d => d.label === "Magic Damage").value,
              children: [
                  { name: "Magic Champion Damage", value: treeData.find(d => d.label === "Magic Champion Damage").value },
              ],
           },
          { name: "Physical Damage", value: treeData.find(d => d.label === "Physical Damage").value, 
              children: [
                  { name: "Physical Champion Damage", value: treeData.find(d => d.label === "Physical Champion Damage").value },
              ],
          },
          { name: "True Damage", value: treeData.find(d => d.label === "True Damage").value, 
              children: [
                  { name: "True Champion Damage", value: treeData.find(d => d.label === "True Champion Damage").value },
              ],
          },
      ],
  };

  // based off example tree chart code

  console.log("hierarchyData", hierarchyData);

  const root = d3.hierarchy(hierarchyData)
    .sum(d => d.value || 0.01) // Set the value for the hierarchy layout
    .sort((a, b) => b.height - a.height || b.value - a.value); // Optional sorting

  console.log("root", root);

  // Apply the treemap layout
  const treemapLayout = d3.treemap()
    .size([width, height])
    .tile(d3.treemapBinary)
    .paddingInner(0) // Reduced inner padding
    .paddingOuter(0);


  treemapLayout(root);

    console.log("Treemap layout nodes:", root.leaves());

  // Define a color scale for the tree map white to #85d0ff
  const color = d3.scaleLinear()
    //0 to treeData.values max
    .domain([0, d3.max(treeData, d => d.value)])
    .range(["white", "#85d0ff"]);

  // Create groups for each node
  const cell = svgTree.selectAll("g")
      .data(root.leaves()) // Use only the leaf nodes for rectangles
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

  console.log("cell", cell);
  // Draw rectangles
  cell.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => {
          // Find the parent node
          while (d.depth > 1) d = d.parent;
          return color(d.value);
      })
      .attr("stroke", "#ccc");

  console.log("rect");

  // Add labels to each rectangle
  cell.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .style("font-size", "12px")
      .text(d => d.data.name)
      .append("tspan")
      .attr("x", 4)
      .attr("y", 25)
      .text(d => d.value);

  console.log("text");

  // Add tooltips
  cell.append("title")
      .text(d => `${d.data.name}\n${d.value}`);

  console.log("title");
}

/**
 * Toggle the chart section based on data loaded status
 *
 */
function toggleChartSection() {
  const chartSection = document.querySelector(".chart.section");
  if (isDataLoaded) {
    chartSection.style.display = "block";
  } else {
    chartSection.style.display = "none";
  }
}

function toggleLoading() {
  const loading = document.querySelector(".loading.icon");
  if (loadingData) {
    loading.style.display = "block";
  } else {
    loading.style.display = "none";
  }
}
/**
 * Update the data
 */
function changeSelectedMatch() {
  let value = document.getElementById("matchSelect").value;

  //replace - with space
  value = value.replace(/-/g, " ");
  //lookup match id
  selectedMatch = matchIdMap.get(value);

  console.log("selectedMatch", selectedMatch);

  updateBarChart(globalData);
  updateLineChart(globalData);
  updateScatterPlot(globalData);
  // updateHeatmap(globalData);
  updateDualBarChart(globalData);
  updateRadarChart(globalData);
  updateTreeChart(globalData);
}

////// Riot API Proxy Code //////

document.getElementById("riotForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  loadingData = true;
  toggleLoading();

  const summonerName = document.getElementById("summonerName").value;
  const tagLine = document.getElementById("tagLine").value;
  const matchCount = document.getElementById("matchCount").value;

  try {
    const response = await fetch(
      `/riot-api/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}?matchCount=${matchCount}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Network response was not ok: ${errorText}`);
    }
    const data = await response.json();

    isDataLoaded = true;
    loadingData = false;
    toggleLoading();
    toggleChartSection();
    globalData = data;
    displayData(data);
  } catch (error) {
    document.getElementById("result").innerText = `Error: ${error.message}`;
    loadingData = false;
    toggleLoading();
  }
});

function displayData(data) {
  // Call each update function with the API data as needed
  console.log("data", data);
  update(data);


  matches.push("Select a match");

  //find self puuid
  const puuid = data.puuidData;

  for (let i = 0; i < data.singleMatchData.length; i++) {
    //find self in the match
    const playerData = data.singleMatchData[i].info.participants.find((participant) => participant.puuid === puuid);

    //create string
    let value =
      playerData.championName +
      " " +
      data.singleMatchData[i].info.gameMode +
      " " +
      new Date(data.singleMatchData[i].info.gameStartTimestamp).toLocaleDateString() +
      " ";

    if (playerData.win) {
      value += "Win";
    } else {
      value += "Loss";
    }
    matchIdMap.set(value.toLowerCase(), data.singleMatchData[i].info.gameId);
    matches.push(value);
  }

  //match selector
  fillMatchDropdown();
}

// method for match selector dropdown
function fillMatchDropdown() {
  const selector = document.getElementById("matchSelect");

  selector.innerHTML = "";

  matches.forEach((option) => {
    const match = document.createElement("option");
    match.value = option.toLowerCase().replace(/\s+/g, "-"); // Format the value
    match.textContent = option; // Set the visible text
    selector.appendChild(match);
  });
}
