import { fetchData } from './shared/fetch-data';
import { renderChart } from './shared/render-chart';
import { renderError } from './shared/render-error';
import { renderLoading } from './shared/render-loading';
import { icons } from './shared/icons';

// eslint-disable-next-line
const COMPONENT_TAG = 'codersrank-activity';
const STATE_IDLE = 0;
const STATE_LOADING = 1;
const STATE_ERROR = 2;
const STATE_SUCCESS = 3;

// eslint-disable-next-line
const STYLES = `$_STYLES_$`;

// eslint-disable-next-line
class CodersRankActivity extends HTMLElement {
  constructor() {
    super();

    this.tempDiv = document.createElement('div');
    this.shadowEl = this.attachShadow({ mode: 'closed' });

    this.stylesEl = document.createElement('style');
    this.stylesEl.textContent = STYLES;
    this.shadowEl.appendChild(this.stylesEl);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    this.mounted = false;

    this.state = STATE_IDLE;

    this.data = null;
  }

  // eslint-disable-next-line
  getTotalActivities(data = {}) {
    let total = 0;
    Object.keys(data).forEach((date) => {
      Object.keys(data[date]).forEach((source) => {
        total += data[date][source] || 0;
      });
    });
    return total;
  }

  emitData(data = {}) {
    const event = new CustomEvent('data', {
      detail: { data, total: this.getTotalActivities(data) },
    });
    this.dispatchEvent(event);
  }

  emitError(err) {
    const event = new CustomEvent('error', { detail: err });
    this.dispatchEvent(event);
  }

  static get observedAttributes() {
    return ['username', 'weeks', 'svg-width', 'legend', 'labels', 'id'];
  }

  get tooltip() {
    const tooltip = this.getAttribute('tooltip');
    if (tooltip === '' || tooltip === 'true') return true;
    return false;
  }

  set tooltip(value) {
    this.setAttribute('tooltip', value);
  }

  get id() {
    return this.getAttribute('id');
  }

  set id(value) {
    this.setAttribute('id', value);
  }

  get username() {
    return this.getAttribute('username');
  }

  set username(value) {
    this.setAttribute('username', value);
  }

  get weeks() {
    return Math.min(parseInt(this.getAttribute('weeks') || 52, 10), 52);
  }

  set weeks(value) {
    this.setAttribute('weeks', value);
  }

  get svgWidth() {
    const svgWidth = parseInt(this.getAttribute('svg-width') || 0, 10);
    if (!svgWidth && this.weeks < 52) {
      return 800 / (52 / this.weeks);
    }
    return svgWidth || 800;
  }

  set svgWidth(value) {
    this.setAttribute('svg-width', value);
  }

  set ['svg-width'](value) {
    this.setAttribute('svg-width', value);
  }

  get legend() {
    const legend = this.getAttribute('legend');
    if (legend === '' || legend === 'true') return true;
    return false;
  }

  set legend(value) {
    this.setAttribute('legend', value);
  }

  get labels() {
    const labels = this.getAttribute('labels');
    if (labels === '' || labels === 'true') return true;
    return false;
  }

  set labels(value) {
    this.setAttribute('labels', value);
  }

  get step() {
    return parseInt(this.getAttribute('step') || 10, 10);
  }

  set step(value) {
    this.setAttribute('step', value);
  }

  get branding() {
    return this.getAttribute('branding') !== 'false';
  }

  set branding(value) {
    this.setAttribute('branding', value);
  }

  render() {
    const {
      username,
      id,
      mounted,
      state,
      shadowEl,
      data,
      weeks,
      svgWidth,
      legend,
      labels,
      step,
      branding,
      tempDiv,
    } = this;
    const ctx = {
      data,
      weeks,
      svgWidth,
      legend,
      labels,
      step,
      branding,
    };

    if ((!username && !id) || !mounted) return;
    if (state === STATE_SUCCESS) {
      tempDiv.innerHTML = renderChart(ctx);
    } else if (state === STATE_ERROR) {
      tempDiv.innerHTML = renderError(ctx);
    } else if (state === STATE_IDLE || state === STATE_LOADING) {
      tempDiv.innerHTML = renderLoading(ctx);
    }

    let widgetEl = shadowEl.querySelector('.codersrank-activity');
    if (widgetEl) {
      widgetEl.parentNode.removeChild(widgetEl);
    }
    widgetEl = tempDiv.querySelector('.codersrank-activity');
    if (!widgetEl) return;
    this.widgetEl = widgetEl;
    this.detachEvents();
    this.attachEvents();
    shadowEl.appendChild(widgetEl);
  }

  loadAndRender() {
    const { username, id } = this;
    this.state = STATE_LOADING;
    this.render();
    fetchData(username, id)
      .then((data) => {
        this.emitData(data);
        this.data = data;
        this.state = STATE_SUCCESS;
        this.render();
      })
      .catch((err) => {
        this.emitError(err);
        this.state = STATE_ERROR;
        this.render();
      });
  }

  activitiesInDay(date) {
    let activities = 0;
    if (!this.data || !date) return activities;
    const dayData = this.data[date];
    if (dayData) {
      Object.keys(dayData).forEach((key) => {
        // @ts-ignore
        activities += dayData[key];
      });
    }
    return activities;
  }

  tooltipText(date) {
    const data = this.data[date];
    const activities = this.activitiesInDay(date);
    const formatter = Intl.DateTimeFormat();
    // prettier-ignore
    return `
        <div class="codersrank-activity-tooltip-header">
          ${formatter.format(new Date(date))} - <b>${activities} activities</b>
        </div>
        <ul class="codersrank-activity-tooltip-list">
          ${data.github ? `
          <li><i>${icons.github}</i>${data.github} activities</li>
          ` : ''}
          ${data.gitlab ? `
          <li><i>${icons.gitlab}</i>${data.gitlab} activities</li>
          ` : ''}
          ${data.private ? `
          <li><i>${icons.folder}</i>${data.private} activities</li>
          ` : ''}
          ${data.stackoverflow ? `
          <li><i>${icons.stackoverflow}</i>${data.stackoverflow} activities</li>
          ` : ''}
        </ul>
      `;
  }

  showTooltip(date) {
    if (!this.data || !date || !this.tooltip || !this.widgetEl) return;
    const data = this.data[date];
    if (!data) return;

    const rectEl = this.shadowEl.querySelector(`[data-date="${date}"]`);
    if (!rectEl) return;
    this.tempDiv.innerHTML = `
      <div class="codersrank-activity-tooltip">
        ${this.tooltipText(date)}
        <div class="codersrank-activity-tooltip-angle"></div>
      </div>
    `;
    const widgetElRect = this.getBoundingClientRect();
    const rectElRect = rectEl.getBoundingClientRect();
    const tooltipEl = this.tempDiv.querySelector('.codersrank-activity-tooltip');
    let left = rectElRect.left - widgetElRect.left;
    let diff = -5;
    if (left < 110) {
      diff = -5 - (110 - left);
      left = 110;
    }
    if (left + 110 > widgetElRect.width) {
      diff = -5 + 110 - (widgetElRect.width - left);
      left = widgetElRect.width - 110;
    }

    diff = Math.max(Math.min(diff, 105), -105);

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${rectElRect.top - widgetElRect.top}px`;
    tooltipEl.querySelector(
      '.codersrank-activity-tooltip-angle',
    ).style.marginLeft = `${diff}px`;
    this.shadowEl.appendChild(tooltipEl);
  }

  hideTooltip() {
    if (!this.tooltip || !this.widgetEl) return;
    const tooltipEl = this.shadowEl.querySelector('.codersrank-activity-tooltip');
    if (!tooltipEl) return;
    this.shadowEl.removeChild(tooltipEl);
  }

  onMouseEnter(e) {
    if (e.target.tagName !== 'rect') return;
    const el = e.target;
    const date = el.getAttribute('data-date');
    this.showTooltip(date);
  }

  onMouseLeave() {
    this.hideTooltip();
  }

  attributeChangedCallback() {
    if (!this.mounted) return;
    this.loadAndRender();
  }

  attachEvents() {
    if (!this.widgetEl) return;
    this.widgetEl.addEventListener('mouseenter', this.onMouseEnter, true);
    this.widgetEl.addEventListener('mouseleave', this.onMouseLeave, true);
  }

  detachEvents() {
    if (!this.widgetEl) return;
    this.widgetEl.removeEventListener('mouseenter', this.onMouseEnter, true);
    this.widgetEl.removeEventListener('mouseleave', this.onMouseLeave, true);
  }

  connectedCallback() {
    this.width = this.offsetWidth;
    this.mounted = true;
    this.loadAndRender();
  }

  disconnectedCallback() {
    this.mounted = false;
    this.detachEvents();
  }
}

// EXPORT
