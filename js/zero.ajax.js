(function() {
  'use strict';

  if (Drupal.zero.ajax !== undefined) return;

  /**
   * @param {string} plugin_id
   * @param {object} data
   * @param {string} format cache support is only with "json" format available, attachments support is only with "ajax" format available
   * @param {APIResponseCallback} callback
   * @param {APIErrorCallback} errorCallback
   * @param {boolean} attach
   */
  window.ZeroComponent.prototype.request = function request(plugin_id, data, format, callback, errorCallback, attach = true) {
    return Drupal.zero.ajax.request(plugin_id, data, format, (...args) => {
      callback(...args);
      if (attach) Drupal.attachBehaviors(this.item.get(0));
    }, errorCallback);
  };

  Drupal.zero.ajax = {};
  Drupal.zero.ajax.invokes = {};

  /**
   * @callback APIResponseCallback
   * @param {APIResponse} response
   * @param {object} data
   * @param {MetaObject} meta
   */

  /**
   * @callback APIErrorCallback
   * @param {APIResponse} response
   * @param {object} data
   * @param {string} data.message
   * @param {MetaObject} meta
   */

  /**
   * @typedef MetaObject
   * @property {boolean} error
   */

  /**
   * @typedef APIResponse
   * @property {object} data
   * @property {MetaObject} meta
   * @property {string} status
   * @property {object} ajax
   * @property {string} request.url
   * @property {string} request.controller_id
   * @property {object} request.data
   * @property {string} request.format
   */

  /**
   * @param {string} plugin_id
   * @param {string} format
   * @returns {string}
   */
  Drupal.zero.ajax.getUrl = function(plugin_id, format) {
    return '/api/zero/ajax/' + plugin_id + '?_format=' + (format || 'json');
  };

  /**
   * @param {APIResponse} response
   * @param {APIResponseCallback} callback
   * @param {APIErrorCallback} errorCallback
   */
  Drupal.zero.ajax.parseResponse = function (response, callback, errorCallback) {
    if (response.meta.invoke) {
      for (var index in response.meta.invoke) {
        if (typeof Drupal.zero.ajax.invokes[response.meta.invoke[index].func] === 'function') {
          Drupal.zero.ajax.invokes[response.meta.invoke[index].func](response, ...response.meta.invoke[index].params);
        } else {
          console.error('[ZERO AJAX::' + response.request.plugin_id + ']: Response try to invoke "' + response.meta.invoke[index].func + '", the invoke is not a function.');
        }
      }
    }
    if (response.meta.error) {
      var line = '[ZERO AJAX::' + response.request.plugin_id + ']: ';
      if (response.data.details && response.data.details.type) {
        line += '(' + response.data.details.type + ') - ';
      }
      line += response.data.message;
      console.error(line);
      if (errorCallback) errorCallback(response, response.data, response.meta);
    } else {
      callback(response, response.data, response.meta);
    }
  };

  /**
   * @param {string} plugin_id
   * @param {object} data
   * @param {string} format cache support is only with "json" format available, attachments support is only with "ajax" format available
   * @param {APIResponseCallback} callback
   * @param {APIErrorCallback} errorCallback
   */
  Drupal.zero.ajax.request = function(plugin_id, data, format, callback, errorCallback) {
    data = data || {};
    format = format || 'json';
    errorCallback = errorCallback || null;
    var url = Drupal.zero.ajax.getUrl(plugin_id, format);

    var response = {
      request: {
        url: url,
        plugin_id: plugin_id,
        data: data,
        format: format,
      },
    };

    switch (format) {
      case 'json':
        jQuery.getJSON(url, data, function(responseData, status, ajax) {
          response.data = responseData.data;
          response.meta = responseData.meta;
          response.status = status;
          response.ajax = ajax;
          Drupal.zero.ajax.parseResponse(response, callback, errorCallback);
        });
        break;
      case 'ajax':
        var request = Drupal.ajax({url: url, submit: data});

        request.commands.zeroAjaxAPICommand = function(ajax, responseData, status) {
          response.data = responseData.data;
          response.meta = responseData.meta;
          response.status = status;
          response.ajax = ajax;
          Drupal.zero.ajax.parseResponse(response, callback, errorCallback);
        };

        request.commands.destroyObject = function () {
          Drupal.ajax.instances[this.instanceIndex] = null;
        };

        if (errorCallback) {
          request.options.error = errorCallback;
        }

        request.execute();
        break;
      default:
        console.error('[ZERO AJAX::' + plugin_id + ']: Unknown format "' + format + '"');
        break;
    }
  };

  /**
   * @param {Object<string, string>} query
   * @param {Object} options
   */
  Drupal.zero.ajax.updateQuery = function(query, options = {}) {
    const queryValues = [];
    for (const key in query) {
      queryValues.push(key + '=' + encodeURIComponent(query[key]));
    }
    const hash = window.location.hash.split('?')[0] || '';
    if (options.push) {
      history.pushState(null, null, hash + '?' + queryValues.join('&'));
    } else {
      history.replaceState(null, null, hash + '?' + queryValues.join('&'));
    }
  };

  Drupal.zero.ajax.invokes.showMessage = function(response, type, message, options) {
    options = options || {};
    var item = jQuery('<div class="zero-ajax-message zero-ajax-message--' + type + '">' + message + '<div class="zero-ajax-message__close">X</div></div>');
    jQuery('body').append(item);

    var close = function() {
      if (item === null) return;
      var _item = item;
      item = null;
      _item.fadeOut(400, function() {
        _item.remove();
      });
    };

    item.find('.zero-ajax-message__close').on('click', close);

    setTimeout(function() {
      close();
    }, options.time || 5000);
  };

  Drupal.zero.ajax.invokes.updateQuery = function (response, query, options = {}) {
    Drupal.zero.ajax.updateQuery(query, options);
  };

})();
