var d3 = require('d3');
var $ = require('jquery');
var cdb = require('cartodb.js');
var TooltipView = require('../widget-tooltip-view');
var template = require('./histogram-title-template.tpl');

/**
 *  Show title + show if histogram sizes are applied or not
 *
 */

module.exports = cdb.core.View.extend({
  className: 'CDB-Widget-title CDB-Widget-contentSpaced',

  events: {
    'click .js-applySizes': '_applySizes',
    'click .js-cancelSizes': '_cancelSizes'
  },

  initialize: function () {
    this.widgetModel = this.options.widgetModel;
    this.dataviewModel = this.options.dataviewModel;
    this._initBinds();
  },

  render: function () {
    this.clearSubViews();
    this.$el.html(
      template({
        title: this.widgetModel.get('title'),
        isSizesApplied: this.dataviewModel.get('histogram_sizes'),
        isCollapsed: this.widgetModel.get('collapsed')
      })
    );
    this._initViews();

    return this;
  },

  _initBinds: function () {
    this.widgetModel.bind('change:title change:collapsed', this.render, this);
    this.dataviewModel.bind('change:histogram_sizes', function () {
      this.render();
    }, this);
    this.add_related_model(this.dataviewModel);
  },

  _initViews: function () {
    var sizesTooltip = new TooltipView({
      target: this.$('.js-sizes')
    });
    $('body').append(sizesTooltip.render().el);
    this.addView(sizesTooltip);
  },

  _applySizes: function () {
    var index = this.dataviewModel._dataProvider._layerIndex;
    var sublayer = this.dataviewModel._dataProvider._vectorLayerView;
    var style = sublayer.styles[index];
    var data = this.dataviewModel.get('data')
    if (style.indexOf('polygon') > -1) {
      var colors = ['YlGnBu', 'Greens', 'Reds', 'Blues'];
      var color = colors[Math.floor(Math.random()*colors.length)];
      style = ['#layer{',
               '  polygon-fill: ramp([{{column}}], colorbrewer({{color}}, {{bins}}));'
                  .replace('{{column}}', this.dataviewModel.get('column'))
                  .replace('{{bins}}', this.dataviewModel.get('bins'))
                  .replace('{{color}}', color),
               '  polygon-opacity: 0.6;  ',
               '  line-color: #FFF;',
               '  line-width: 0.3;',
               '  line-opacity: 0.3;',
               '}'
              ].join('\n')

    } else {
      style = ['#layer{',
               '  marker-width: ramp([{{column}}], {{min}}, {{max}}), {{bins}};'
                  .replace('{{column}}', this.dataviewModel.get('column'))
                  .replace('{{bins}}', this.dataviewModel.get('bins'))
                  .replace('{{min}}', 2)
                  .replace('{{max}}', 30),
               '  marker-fill-opacity: 0.4;  ',
               '  marker-fill: #000;  ',
               '  marker-line-color: #fff;',
               '  marker-allow-overlap: true;',
               '  marker-line-width: 0.3;',
               '  marker-line-opacity: 0.8;',
               '}'
              ].join('\n')
    }
    sublayer.setCartoCSS(index, style, true);
    this.dataviewModel.set('histogram_sizes', true);
  },

  _cancelSizes: function () {
    var index = this.dataviewModel._dataProvider._layerIndex;
    var sublayer = this.dataviewModel._dataProvider._vectorLayerView;
    sublayer.renderers[index].restoreCartoCSS(true);
    this.dataviewModel.set('histogram_sizes', false);
  }

});
