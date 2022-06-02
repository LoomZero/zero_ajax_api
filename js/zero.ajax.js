(function($) {
  'use strict';

  if (Drupal.zero.ajax !== undefined) return;
  Drupal.zero.ajax = {};

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
    return '/loom/ajax/' + plugin_id + '?_format=' + (format || 'json');
  };

  /**
   * @param {APIResponse} response
   * @param {APIResponseCallback} callback
   * @param {APIErrorCallback} errorCallback
   */
  Drupal.zero.ajax.parseResponse = function (response, callback, errorCallback) {
    if (response.meta.error) {
      console.error('[LOOM AJAX::' + response.request.controller_id + ']: ' + response.data.message);
      errorCallback(response, response.data, response.meta);
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
          console.log(responseData);
          response.data = responseData.data;
          response.meta = responseData.meta;
          response.status = status;
          response.ajax = ajax;
          Drupal.zero.ajax.parseResponse(response, callback, errorCallback);
        });
        break;
      case 'ajax':
        var request = Drupal.ajax({url: url, submit: data});

        request.commands.loomAjaxResponse = function(ajax, responseData, status) {
          console.log(responseData);
          response.data = responseData.data.data;
          response.meta = responseData.data.meta;
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

})(jQuery);
