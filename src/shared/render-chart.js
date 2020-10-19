export const renderChart = ({
  data,
  weeks,
  renderWidth,
  legend,
  labels,
  preloader,
} = {}) => {
  const width = renderWidth;
  const spacing = 4;
  const wdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const xOffset = 25;
  const yOffset = 18;

  const weeksArray = [];
  for (let i = 0; i < weeks; i += 1) weeksArray.push(i);

  const daysArray = [];
  for (let i = 0; i < 7; i += 1) daysArray.push(i);

  const rectSize = (width - xOffset - (weeks - 1) * spacing) / weeks;
  const chartWidth = width + 5;
  const chartHeight = yOffset + rectSize * 7 + spacing * 6 + 7;

  const totalDays = (() => {
    let numberOfDays = weeks * 7;
    const todayWeekDay = new Date().getDay();
    numberOfDays -= 7 - todayWeekDay;
    return numberOfDays;
  })();

  const monthsColumns = (() => {
    const cols = [];

    const startDateTime = new Date().getTime() - totalDays * 24 * 60 * 60 * 1000;
    let month;
    for (let i = 0; i < weeks; i += 1) {
      const weekStartMonth = new Date(
        startDateTime + i * 7 * 24 * 60 * 60 * 1000,
      ).getMonth();
      if (month !== weekStartMonth) {
        cols.push({
          weekIndex: i,
          month: weekStartMonth,
        });
        month = weekStartMonth;
      }
    }
    return cols;
  })();

  const dayDate = (weekIndex, dayIndex) => {
    const minusDays = totalDays - (weekIndex * 7 + dayIndex + 1);
    const date = new Date(new Date().getTime() - minusDays * 24 * 60 * 60 * 1000);
    const zerofy = (num) => {
      if (num < 10) return `0${num}`;
      return num;
    };
    return `${date.getFullYear()}-${zerofy(date.getMonth() + 1)}-${zerofy(
      date.getDate(),
    )}`;
  };

  const isDayDisabled = (weekIndex, dayIndex) => {
    const dayNumber = weekIndex * 7 + dayIndex + 1;
    return dayNumber > totalDays;
  };

  const activitiesInDay = (date) => {
    let activities = 0;
    if (!data || !date) return activities;
    const dayData = data[date];
    if (dayData) {
      Object.keys(dayData).forEach((key) => {
        // @ts-ignore
        activities += dayData[key];
      });
    }
    return activities;
  };

  const dayClasses = (weekIndex, dayIndex) => {
    const classes = ['codersrank-activity-day'];
    const date = dayDate(weekIndex, dayIndex);
    const activities = activitiesInDay(date);

    if (activities >= 30) classes.push('codersrank-activity-day-4');
    else if (activities >= 20) classes.push('codersrank-activity-day-3');
    else if (activities >= 10) classes.push('codersrank-activity-day-2');
    else if (activities > 0) classes.push('codersrank-activity-day-1');
    if (isDayDisabled(weekIndex, dayIndex)) {
      classes.push('codersrank-activity-day-disabled');
    }
    return classes.join(' ');
  };

  // prettier-ignore
  return /* html */ `
    <div class="codersrank-activity">
      <div class="codersrank-activity-chart">
        <svg viewBox="0 0 ${chartWidth} ${chartHeight}" height="${chartHeight}">
          <g transform="translate(${xOffset}, ${yOffset})">
            ${weeksArray.map((w) => /* html */`
            <g transform="translate(${(rectSize + spacing) * w}, 0)">
              ${daysArray.map((d) => /* html */`
              <rect
                width="${rectSize}"
                height="${rectSize}"
                rx="1.5"
                x="0"
                y="${(rectSize + spacing) * (d)}"
                data-date="${dayDate(w, d)}"
                class="${dayClasses(w, d)}"
              />
              `).join('')}
            </g>
            `).join('')}
          </g>

          ${labels ? /* html */`
          <g>
            ${wdays.map((wday, index) => /* html */`
            <text
              class="codersrank-activity-wday"
              text-anchor="start"
              dominant-baseline="hanging"
              dx="0"
              dy="${(rectSize + spacing) * index + 2.5 + yOffset}"
            >
              ${wday}
            </text>
            `).join('')}
          </g>

          <g>
            ${monthsColumns.map((monthData) => /* html */`
            <text
              class="codersrank-activity-month"
              text-anchor="start"
              dominant-baseline="text-before-edge"
              dx="${(rectSize + spacing) * monthData.weekIndex + xOffset}"
              dy="0"
            >
              ${months[monthData.month]}
            </text>
            `).join('')}
          </g>
          ` : ''}
        </svg>
        ${preloader ? /* html */`
        <div class="codersrank-activity-preloader"></div>
        ` : ''}
      </div>
      ${legend ? /* html */`
      <div class="codersrank-activity-legend">
        <span class="codersrank-activity-legend-label">Less</span>
        <span class="codersrank-activity-legend-item"></span>
        <span class="codersrank-activity-legend-item codersrank-activity-legend-item-1"></span>
        <span class="codersrank-activity-legend-item codersrank-activity-legend-item-2"></span>
        <span class="codersrank-activity-legend-item codersrank-activity-legend-item-3"></span>
        <span class="codersrank-activity-legend-item codersrank-activity-legend-item-4"></span>
        <span class="codersrank-activity-legend-label">More</span>
      </div>
      ` : ''}
    </div>
  `;
};
