(function (H) {
  // Wrap the init method
  H.wrap(H.Chart.prototype, 'init', function (proceed, userOptions, callback) {
    const { xAxis, yAxis } = userOptions;
    let groupedxAxis = [];
    function isObject(obj) {
      return obj && typeof obj === 'object' && !Array.isArray(obj);
    }

    function deepMerge(target, source) {
      const output = { ...target }; // shallow clone target
      for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = output[key];
        if (isObject(srcVal) && isObject(tgtVal)) {
          output[key] = deepMerge(tgtVal, srcVal);
        } else {
          output[key] = srcVal;
        }
      }
      return output;
    }
    function typeOfValue(val) {
      if (Array.isArray(val)) return 'array';
      if (val !== null && typeof val === 'object') return 'object';
      return typeof val; // 'string', 'number', 'undefined', etc.
    }
    function getGroupedLabels(categories, tickPositions) {
      const groupedLabels = Array(tickPositions.at(-1) + 1);
      tickPositions.forEach(
        (position, index) => (groupedLabels[position] = categories[index])
      );
      return groupedLabels;
    }
    function findSeriesForAxis(axis) {
      const groupSeries =
        userOptions.series.find((series) => series.xAxis === axis.id) ||
        userOptions.series.find(
          (series) => series.xAxis === userOptions.xAxis.indexOf(axis)
        );
      return groupSeries;
    }
    if (typeOfValue(xAxis) === 'array') {
      groupedxAxis = xAxis.filter((axis) => axis.grouped);
    } else if (xAxis.grouped) {
      groupedxAxis.push(xAxis);
    }
    if (typeOfValue(userOptions.series) === 'object') {
      userOptions.series = [userOptions.series];
    }
    groupedxAxis.forEach((axis, axisIndex) => {
      const { categories, tickPositions } = axis;
      if (
        typeOfValue(categories) === 'array' &&
        typeOfValue(tickPositions) === 'array'
      ) {
        axis.categories = getGroupedLabels(categories, tickPositions);
      }
      const groupedSeries = {
        xAxis: axis.id ?? axisIndex,
        type: 'scatter',
        marker: {
          enabled: false,
          states: {
            hover: { enabled: false },
          },
        },
        data: Array(userOptions.series[0].data.length).fill(0),
        showInLegend: false,
      };
      const originalSeries = findSeriesForAxis(axis);
      if (originalSeries) {
        const seriesIndex = userOptions.series.indexOf(originalSeries);
        userOptions.series[seriesIndex] = deepMerge(
          groupedSeries,
          originalSeries
        );
      } else {
        userOptions.series.push(groupedSeries);
      }
    });

    proceed.call(this, userOptions, callback);
  });
  H.addEvent(H.Chart, 'render', function () {
    const groupedAxis = this.xAxis.filter((axis) => axis.options.grouped);
    groupedAxis.forEach((axis) => {
      let groupStartPosition = 0;
      axis.tickPositions.forEach((group, index) => {
        const groupPositions = this.series[axis.index].points
          .slice(groupStartPosition, group + 1)
          .map((p) => p.pos(true));
        const categoryWidth = groupPositions[1][0] - groupPositions[0][0];
        const left = groupPositions.at(0)[0] - categoryWidth / 2,
          right = groupPositions.at(-1)[0] + categoryWidth / 2;
        const label = axis.ticks[group].label;
        label.attr({
          x: (right + left) / 2,
        });
        groupStartPosition = group + 1;
      });
    });
  });
})(Highcharts);
