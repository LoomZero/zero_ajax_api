(function($) {
  'use strict';

  Drupal.behaviors.zero_ajax_api__zero_ajax_view = createComponent('zero-ajax-view', {

    init() {
      this.item.data('zeroView', this);
      var that = this;
      this._config = null;
      this._page = this.config('firstPage') || 0;
      this._identifier = 0;
      this._item_template = this.createTemplate('template-item');
      this._filters = {};

      var filtersWrapper = this;
      if (this.config('selectors.filters')) {
        filtersWrapper = jQuery(this.config('selectors.filters'));
      }

      filtersWrapper.find('[data-filter]').each(function () {
        var element = $(this);
        var name = element.data('filter');
        var filter = {};

        filter.name = name;
        filter.inputs = element.is('select, input') ? element : element.find('select, input');
        filter.data = element.data() || {};
        filter._config = {};
        filter.config = function(key) {
          if (this._config[key] === undefined) {
            var value = null;
            if (filter.data[key] !== undefined) {
              value = filter.data[key];
            } else {
              value = that.config('filters.' + name + '.' + key);
            }
            this._config[key] = value
          }
          return this._config[key];
        };

        filter.inputs.on(filter.config('event') || 'change', function() {
          that.update(true, filter);
        });
        that._filters[name] = filter;
      });

      var loadMore = this.element('load-more');
      if (this.config('selectors.loadMore')) {
        loadMore = jQuery(this.config('selectors.loadMore'));
      }
      loadMore.on('click', function(e) {
        e.preventDefault();
        that.loadMore();
      });

      if (this._page === 0) this.update();
    },

    config(name) {
      if (this._config === null) {
        var settings = this.settings();

        this._config = settings.config || {};
        this._config.view = settings.view;
        this._config.display = settings.display;
      }

      if (typeof name === 'string') {
        var value = this._config;
        for (var key of name.split('.')) {
          if (typeof value === 'object' && value) {
            value = value[key] || null;
          } else {
            return null;
          }
        }
        return value;
      }

      return this._config;
    },

    loadMore() {
      var that = this;
      this.state('load-more', true);
      this._page++;
      this.update(false, null, function() {
        that.state('load-more', false);
      });
    },

    update(reset, filter, cb) {
      this.state('loading', true);
      var that = this;
      var config = this.config();
      var contentTarget = this.element('content');

      this._identifier++;
      Drupal.zero.ajax.request(config.plugin || 'view', this.getData(config), 'ajax', function(response, data, meta) {
        if (data.params.identifier != that._identifier) return;

        for (var index in data.results) {
          var template_data = typeof data.results[index] === 'string' ? {content: data.results[index]} : data.results[index];

          contentTarget.append(that._item_template(template_data));
        }

        if (meta.results.remain <= 0) that.state('no-remain', true);
        if (meta.results.total === 0) that.state('empty', true);

        that.state('loading', false);
        if (cb) cb(response, data, meta);
      });
    },

    getData(config) {
      var data = JSON.parse(JSON.stringify(config));

      data.pager = data.pager || {};
      data.pager.page = this._page;
      data.identifier = this._identifier;
      data.filters = this.getFilterData();
      return data;
    },

    getFilterData() {
      var filters = {};

      for (var name in this._filters) {
        var filter = this._filters[name];
        var value = null;

        // add static value
        if (filter.data.value) {
          value = filter.data.value;
        } else {
          value = filter.inputs.val();
        }

        // if the value is accepted as empty
        if (value === filter.config('emptyValue')) value = null;

        // add multi value or simple
        filters[filter.name] = filters[filter.name] || (filter.config('multi') ? [] : null);
        if (Array.isArray(filters[filter.name])) {
          filters[filter.name].push(value);
        } else {
          filters[filter.name] = value;
        }
      }
      return filters;
    },

  });

})(jQuery);
