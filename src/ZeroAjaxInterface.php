<?php

namespace Drupal\zero_ajax_api;

use Drupal\Component\Plugin\PluginInspectionInterface;
use Drupal\zero_ajax_api\Exception\ZeroAjaxAPIException;

interface ZeroAjaxInterface extends PluginInspectionInterface {

  /**
   * @param ZeroAjaxRequest $request
   * @return array|ZeroAjaxAPIException
   */
  public function response(ZeroAjaxRequest $request);

}
