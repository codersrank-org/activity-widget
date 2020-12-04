# CodersRank Activity Widget

<!-- DOCS_START -->

CodersRank Activity Widget is a web component that allows you easily integrate nice looking activity chart from your [CodersRank](https://codersrank.io) profile to your personal website:

<img src="preview.png" />

## Install from NPM

The widget script available through NPM:

```
npm i @codersrank/activity --save
```

After installation you need to import and register web component:

```js
import CodersRankActivity from '@codersrank/activity';

// register web component as <codersrank-activity> element
window.customElements.define('codersrank-activity', CodersRankActivity);
```

## Install from CDN

Widget can also be downloaded or linked directly from CDN:

```html
<!-- replace x.x.x with actual version -->
<script src="https://unpkg.com/@codersrank/activity@x.x.x/codersrank-activity.min.js"></script>
```

In this case it is not required to register web component, it is already registered as `<codersrank-activity>` element.

## Usage

As it is a web component the usage is pretty simple, just add widget HTML tag with your [CodersRank](https://codersrank.io) username

```html
<codersrank-activity username="YOUR_USERNAME"></codersrank-activity>
```

## Widget Attributes

Widget supports following properties as HTML element attributes:

| Name        | Type      | Default | Description                                         |
| ----------- | --------- | ------- | --------------------------------------------------- |
| `username`  | `string`  |         | Your [CodersRank](https://codersrank.io) username   |
| `weeks`     | `number`  | `52`    | Amount of weeks to be rendered in chart (max `52`). |
| `labels`    | `boolean` | `false` | Display chart labels (months and days of the week)  |
| `legend`    | `boolean` | `false` | Display legend below the chart                      |
| `tooltip`   | `boolean` | `false` | Enables tooltip with number of activities per day   |
| `step`      | `number`  | `10`    | Number of activities for division by colors         |
| `svg-width` | `number`  | `800`   | Render width of chart's SVG element                 |
| `branding`  | `boolean` | `true`  | Displays "Powered by CodersRank" link               |

For example, to enable labels, legend and tooltip:

```html
<codersrank-activity username="YOUR_USERNAME" labels legend tooltip></codersrank-activity>
```

## Styling

It is possible to customize widget colors with CSS Custom Properties (CSS Variables) by setting them directly on the widget element with style attribute or in CSS.

There are following CSS Custom Properties are available:

| Property                | Value                                                     |
| ----------------------- | --------------------------------------------------------- |
| `--font-family`         | `Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif` |
| `--label-font-size`     | `9px`                                                     |
| `--label-text-color`    | `#999ea4`                                                 |
| `--legend-font-size`    | `12px`                                                    |
| `--legend-text-color`   | `#999ea4`                                                 |
| `--legend-item-width`   | `14px`                                                    |
| `--legend-item-height`  | `14px`                                                    |
| `--legend-margin`       | `1em 0 0 0`                                               |
| `--bg-color-0`          | `#f6f6f6`                                                 |
| `--bg-color-1`          | `rgba(80, 176, 186, 0.3)`                                 |
| `--bg-color-2`          | `rgba(80, 176, 186, 0.6)`                                 |
| `--bg-color-3`          | `rgba(80, 176, 186, 1)`                                   |
| `--bg-color-4`          | `#24565a`                                                 |
| `--border-color-0`      | `transparent`                                             |
| `--border-color-1`      | `transparent`                                             |
| `--border-color-2`      | `transparent`                                             |
| `--border-color-3`      | `transparent`                                             |
| `--border-color-4`      | `transparent`                                             |
| `--svg-width`           | `100%`                                                    |
| `--svg-height`          | `auto`                                                    |
| `--preloader-color`     | `#72a0a8`                                                 |
| `--tooltip-font-size`   | `14px`                                                    |
| `--branding-text-color` | `inherit`                                                 |

For example, to change legend text color to `red` and font-size to `10px`, add this to CSS stylesheet:

```css
codersrank-activity {
  --legend-text-color: red;
  --legend-font-size: 10px;
}
```

## Events

Widget element supports the following events:

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Detail</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>error</code></td>
      <td>Will be fired on data request error</td>
      <td><code>event.detail</code> will contain an error object</td>
    </tr>
    <tr>
      <td><code>data</code></td>
      <td>Will be fired right after data request</td>
      <td>
        <code>event.detail</code> will contain an object with <code>data</code> and <code>total</code> properties.
        <p><code>total</code> property contains number of total activities</p>
        <p><code>data</code> object contains information about activities by dates</p>
      </td>
    </tr>
  </tbody>
</table>

For example:

```html
<codersrank-activity id="activity" ...></codersrank-activity>
```

```js
function onData(event) {
  const total = event.detail.total;
  console.log(`${total} activities in the last year`);
}
document.querySelector('#activity').addEventListener('data', onData);
```

## Use As Image

It is also possible to insert Activity widget as an image. It is useful in places where you can't integrate web component, or for example on your GitHub profile README.md page.

Image URL is the following:

```
https://cr-ss-service.azurewebsites.net/api/ScreenShot?widget=activity&username=YOUR_USERNAME
```

It accepts all widget attributes as query string parameters, plus one extra parameter:

| Name    | Type     | Default | Description                                                                                                                                                                     |
| ------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `width` | `number` | `800`   | Width of widget element (generated image). Note that generated image has @2x pixel density, so the PNG image will be actually generated in @2x size from the one specified here |
| `style` | `string` |         | `style` attribute value (here you can specify all CSS variables)                                                                                                                |

For example:

```html
<img
  src="https://cr-ss-service.azurewebsites.net/api/ScreenShot?widget=activity&username=YOUR_USERNAME&labels=true"
/>
```

Note that you need to URL Encode some of the characters, for example `#` should be `%23` and `#ff0` color should be specified as `%23ff0` in query.

## Contribution

Yes please! See the [contributing guidelines](https://github.com/codersrank-org/activity-widget/blob/master/CONTRIBUTING.md) for details.

## Licence

This project is licensed under the terms of the [MIT license](https://github.com/codersrank-org/activity-widget/blob/master/LICENSE).
