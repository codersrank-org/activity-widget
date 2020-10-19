import { fetchData } from './shared/fetch-data';
import { renderChart } from './shared/render-chart';
import { renderError } from './shared/render-error';
import { renderLoading } from './shared/render-loading';
import { icons } from './shared/icons';

const COMPONENT_TAG = 'codersrank-activity';
const STATE_IDLE = 0;
const STATE_LOADING = 1;
const STATE_ERROR = 2;
const STATE_SUCCESS = 3;

// eslint-disable-next-line
const STYLES = `$_STYLES_$`;

const tempDiv = document.createElement('div');

class CodersRankActivity extends HTMLElement {
  constructor() {
    super();

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

  static get observedAttributes() {
    return ['username', 'weeks', 'render-width', 'legend', 'labels'];
  }

  get tooltip() {
    const tooltip = this.getAttribute('tooltip');
    if (tooltip === '' || tooltip === 'true') return true;
    return false;
  }

  get username() {
    return this.getAttribute('username');
  }

  get weeks() {
    return this.getAttribute('weeks') || 52;
  }

  get renderWidth() {
    const renderWidth = this.getAttribute('render-width');
    if (!renderWidth && this.weeks < 52) {
      return 800 / (52 / this.weeks);
    }
    return renderWidth || 800;
  }

  get legend() {
    const legend = this.getAttribute('legend');
    if (legend === '' || legend === 'true') return true;
    return false;
  }

  get labels() {
    const labels = this.getAttribute('labels');
    if (labels === '' || labels === 'true') return true;
    return false;
  }

  render() {
    const {
      username,
      mounted,
      state,
      shadowEl,
      data,
      weeks,
      renderWidth,
      legend,
      labels,
    } = this;
    const ctx = {
      data,
      weeks,
      renderWidth,
      legend,
      labels,
    };

    if (!username || !mounted) return;
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
    shadowEl.appendChild(widgetEl);
  }

  loadAndRender() {
    const { username } = this;
    this.state = STATE_LOADING;
    this.render();
    fetchData(username)
      .then((data) => {
        this.data = data;
        this.state = STATE_SUCCESS;
        this.render();
      })
      .catch(() => {
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
    if (!this.data || !date || !this.tooltip) return;
    const data = this.data[date];
    if (!data) return;

    const rectEl = this.shadowEl.querySelector(`[data-date="${date}"]`);
    if (!rectEl) return;
    tempDiv.innerHTML = `
      <div class="codersrank-activity-tooltip">
        ${this.tooltipText(date)}
        <div class="codersrank-activity-tooltip-angle"></div>
      </div>
    `;
    const widgetElRect = this.widgetEl.getBoundingClientRect();
    const rectElRect = rectEl.getBoundingClientRect();
    const tooltipEl = tempDiv.querySelector('.codersrank-activity-tooltip');
    let left = rectElRect.left - widgetElRect.left;
    let diff = 0;
    if (left < 110) {
      diff = -5 - (110 - left);
      left = 110;
    }
    if (left + 110 > widgetElRect.width) {
      diff = -5 + 110 - (widgetElRect.width - left);
      left = widgetElRect.width - 110;
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${rectElRect.top - widgetElRect.top}px`;
    tooltipEl.querySelector(
      '.codersrank-activity-tooltip-angle',
    ).style.marginLeft = `${diff}px`;
    this.widgetEl.appendChild(tooltipEl);
  }

  hideTooltip() {
    if (!this.tooltip) return;
    const tooltipEl = this.shadowEl.querySelector('.codersrank-activity-tooltip');
    if (!tooltipEl) return;
    this.widgetEl.removeChild(tooltipEl);
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

  connectedCallback() {
    this.width = this.offsetWidth;
    this.mounted = true;
    this.loadAndRender();
    this.shadowEl.addEventListener('mouseenter', this.onMouseEnter, true);
    this.shadowEl.addEventListener('mouseleave', this.onMouseLeave, true);
  }

  disconnectedCallback() {
    this.mounted = false;
    this.shadowEl.removeEventListener('mouseenter', this.onMouseEnter);
    this.shadowEl.removeEventListener('mouseleave', this.onMouseLeave);
  }
}

if (window.customElements && !window.customElements.get(COMPONENT_TAG)) {
  window.customElements.define(COMPONENT_TAG, CodersRankActivity);
}
